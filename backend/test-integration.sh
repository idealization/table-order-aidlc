#!/bin/bash
# 통합 테스트 스크립트 - 핵심 사용자 흐름 검증
set -e
BASE="http://localhost:3001/api"
STORE="store-001"
PASS=0
FAIL=0

check() {
  if [ "$1" == "$2" ]; then
    echo "  ✅ PASS: $3 (got: $1)"
    PASS=$((PASS+1))
  else
    echo "  ❌ FAIL: $3 (expected: $2, got: $1)"
    FAIL=$((FAIL+1))
  fi
}

echo "== 1. 헬스체크 =="
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $BASE/health)
check "$HEALTH" "200" "health endpoint"

echo "== 2. 관리자 로그인 (정상) =="
TOKEN=$(curl -s -X POST $BASE/auth/login -H "Content-Type: application/json" \
  -d '{"storeId":"store-001","username":"admin","password":"admin1234"}' | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")
if [ -n "$TOKEN" ]; then echo "  ✅ PASS: token issued"; PASS=$((PASS+1)); else echo "  ❌ FAIL: no token"; FAIL=$((FAIL+1)); fi

echo "== 3. 관리자 로그인 (잘못된 비밀번호) =="
BADLOGIN=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/auth/login -H "Content-Type: application/json" \
  -d '{"storeId":"store-001","username":"admin","password":"wrong"}')
check "$BADLOGIN" "401" "reject invalid credentials"

echo "== 4. 보호 라우트 (토큰 없음) =="
NOAUTH=$(curl -s -o /dev/null -w "%{http_code}" $BASE/stores/$STORE/tables)
check "$NOAUTH" "401" "reject without token"

echo "== 5. 테이블 로그인 (고객) =="
SESSION=$(curl -s -X POST $BASE/stores/$STORE/tables/table-002/login -H "Content-Type: application/json" \
  -d '{"password":"1234"}' | python3 -c "import sys,json;print(json.load(sys.stdin).get('sessionId',''))")
if [ -n "$SESSION" ]; then echo "  ✅ PASS: session=$SESSION"; PASS=$((PASS+1)); else echo "  ❌ FAIL: no session"; FAIL=$((FAIL+1)); fi

echo "== 6. 메뉴 조회 =="
MENU_COUNT=$(curl -s $BASE/stores/$STORE/menu | python3 -c "import sys,json;d=json.load(sys.stdin);print(sum(len(c['items']) for c in d['menu']))")
if [ "$MENU_COUNT" -gt "0" ]; then echo "  ✅ PASS: $MENU_COUNT menu items"; PASS=$((PASS+1)); else echo "  ❌ FAIL: no menu items"; FAIL=$((FAIL+1)); fi

echo "== 7. 주문 생성 =="
ORDER_NUM=$(curl -s -X POST $BASE/stores/$STORE/orders -H "Content-Type: application/json" \
  -d "{\"tableId\":\"table-002\",\"sessionId\":\"$SESSION\",\"items\":[{\"menuItemId\":\"m1\",\"menuItemName\":\"김치찌개\",\"quantity\":2,\"unitPrice\":9000}]}" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['order']['order_number'])")
if [ -n "$ORDER_NUM" ]; then echo "  ✅ PASS: order #$ORDER_NUM created"; PASS=$((PASS+1)); else echo "  ❌ FAIL: order not created"; FAIL=$((FAIL+1)); fi

echo "== 8. 주문 생성 (빈 장바구니 거부) =="
EMPTY=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/stores/$STORE/orders -H "Content-Type: application/json" \
  -d "{\"tableId\":\"table-002\",\"sessionId\":\"$SESSION\",\"items\":[]}")
check "$EMPTY" "400" "reject empty order"

echo "== 9. 주문 생성 (무효 세션 거부) =="
BADSESS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/stores/$STORE/orders -H "Content-Type: application/json" \
  -d "{\"tableId\":\"table-002\",\"sessionId\":\"invalid\",\"items\":[{\"menuItemId\":\"m1\",\"menuItemName\":\"x\",\"quantity\":1,\"unitPrice\":100}]}")
check "$BADSESS" "400" "reject invalid session"

echo "== 10. 고객 주문 내역 조회 (현재 세션) =="
TABLE_ORDERS=$(curl -s "$BASE/stores/$STORE/tables/table-002/orders?sessionId=$SESSION" | python3 -c "import sys,json;print(len(json.load(sys.stdin)['orders']))")
if [ "$TABLE_ORDERS" -ge "1" ]; then echo "  ✅ PASS: $TABLE_ORDERS order(s) in session"; PASS=$((PASS+1)); else echo "  ❌ FAIL: no orders"; FAIL=$((FAIL+1)); fi

echo "== 11. 관리자 주문 목록 조회 =="
ORDER_ID=$(curl -s "$BASE/stores/$STORE/orders?tableId=table-002" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json;d=json.load(sys.stdin)['orders'];print(d[0]['id'] if d else '')")
if [ -n "$ORDER_ID" ]; then echo "  ✅ PASS: admin sees order"; PASS=$((PASS+1)); else echo "  ❌ FAIL: admin cannot see order"; FAIL=$((FAIL+1)); fi

echo "== 12. 주문 상태 변경 =="
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH $BASE/stores/$STORE/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"preparing"}')
check "$STATUS_CODE" "200" "update order status"

echo "== 13. 주문 상태 변경 (잘못된 값 거부) =="
BADSTATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH $BASE/stores/$STORE/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"flying"}')
check "$BADSTATUS" "400" "reject invalid status"

echo "== 14. 메뉴 관리 (등록) =="
NEW_ITEM=$(curl -s -X POST $BASE/stores/$STORE/menu -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"categoryId":"cat-drink","name":"테스트음료","price":3000}' | python3 -c "import sys,json;print(json.load(sys.stdin)['item']['id'])")
if [ -n "$NEW_ITEM" ]; then echo "  ✅ PASS: menu item created"; PASS=$((PASS+1)); else echo "  ❌ FAIL: menu not created"; FAIL=$((FAIL+1)); fi

echo "== 15. 메뉴 관리 (가격 검증 - 음수 거부) =="
BADPRICE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/stores/$STORE/menu -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"categoryId":"cat-drink","name":"x","price":-100}')
check "$BADPRICE" "400" "reject negative price"

echo "== 16. 메뉴 삭제 =="
DEL=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $BASE/stores/$STORE/menu/$NEW_ITEM -H "Authorization: Bearer $TOKEN")
check "$DEL" "200" "delete menu item"

echo "== 17. 테이블 이용 완료 =="
COMPLETE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/stores/$STORE/tables/table-002/complete -H "Authorization: Bearer $TOKEN")
check "$COMPLETE" "200" "complete table session"

echo "== 18. 과거 내역 조회 (이용 완료 후 이력 이동 확인) =="
HISTORY=$(curl -s "$BASE/stores/$STORE/history?tableId=table-002" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json;print(len(json.load(sys.stdin)['history']))")
if [ "$HISTORY" -ge "1" ]; then echo "  ✅ PASS: $HISTORY history entries"; PASS=$((PASS+1)); else echo "  ❌ FAIL: no history"; FAIL=$((FAIL+1)); fi

echo "== 19. 이용 완료 후 현재 세션 주문 0 확인 =="
AFTER=$(curl -s "$BASE/stores/$STORE/tables/table-002/orders?sessionId=$SESSION" | python3 -c "import sys,json;print(len(json.load(sys.stdin)['orders']))")
check "$AFTER" "0" "current orders reset after completion"

echo ""
echo "=========================================="
echo "  통합 테스트 결과: $PASS PASS / $FAIL FAIL"
echo "=========================================="
if [ "$FAIL" -gt "0" ]; then exit 1; fi
