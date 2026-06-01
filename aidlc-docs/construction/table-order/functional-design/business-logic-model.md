# 비즈니스 로직 모델 (Business Logic Model) — Unit: table-order

핵심 워크플로우와 알고리즘을 기술 중립적으로 기술합니다.

---

## WF-1: 테이블 로그인 및 세션 확보

```
입력: storeId, tableId, password
1. 테이블 조회 (storeId + tableId)
2. 테이블이 없거나 비밀번호 불일치 → 인증 실패 (401)
3. 활성 세션 조회 (table_id + is_active=true)
4. 활성 세션 있으면 재사용; 없으면 새 세션 생성 (Q2=B: 로그인 시 세션 시작)
5. 반환: tableNumber, sessionId, storeId
```

## WF-2: 주문 생성 (createOrder)

```
입력: storeId, tableId, sessionId, items[]
1. 입력 검증:
   - items 비어있음 → 거부 (400)  (Q6=A)
   - 각 item.quantity < 1 → 거부 (400)
   - 각 item.unitPrice < 0 → 거부 (400)
2. 세션 유효성 검증 (sessionId + tableId + is_active=true)
   - 무효 → 거부 (400)
3. 주문번호 채번: 매장 전체 MAX(order_number) + 1  (Q1=A)
4. 총액 계산: Σ(item.unitPrice × item.quantity)
5. 트랜잭션:
   a. Order 삽입 (status=pending)
   b. OrderItem 삽입 (메뉴명/단가 스냅샷 — Q5=A)
6. SSE 발행: 매장 관리자에게 new_order 이벤트
7. 반환: 생성된 Order (주문번호 포함)

실패 시: 트랜잭션 롤백, 에러 응답 → 프론트는 장바구니 유지
```

## WF-3: 주문 상태 변경

```
입력: storeId, orderId, status
1. status가 {pending, preparing, completed} 중 하나인지 검증 → 아니면 400
2. 주문 조회 (orderId + storeId) → 없으면 404
3. 상태 업데이트 (자유 전환 — Q3=B)
4. 반환: 성공
```

## WF-4: 주문 삭제 (관리자 직권)

```
입력: storeId, orderId
1. 주문 조회 → 없으면 404
2. 주문 + 주문항목 삭제 (CASCADE)
3. 반환: 성공
(테이블 총액은 조회 시 잔여 주문 합계로 재계산되어 반영)
```

## WF-5: 테이블 이용 완료 (completeSession)

```
입력: storeId, tableId
1. 활성 세션 조회 → 없으면 400
2. 트랜잭션:
   a. 세션의 모든 Order 조회
   b. 각 Order의 OrderItem 조회 → items_json 직렬화
   c. OrderHistory 삽입 (created_at 보존, archived_at=now)
   d. OrderItem 삭제 → Order 삭제 (세션 단위)
   e. 세션 종료 (is_active=false, ended_at=now)
3. 반환: 성공
결과: 현재 주문/총액 0으로 리셋, 새 고객의 다음 로그인 시 새 세션 시작
```

## WF-6: 현재 세션 주문 조회 (고객)

```
입력: storeId, tableId, sessionId
1. Order 조회 (store + table + session) — 현재 세션만
2. 각 Order의 OrderItem 조회
3. 시간 역순 정렬 후 반환
(이용 완료된 과거 세션 주문은 OrderHistory에 있으므로 자동 제외)
```

## WF-7: 관리자 대시보드 데이터 구성

```
입력: storeId (+ 인증 토큰)
1. 테이블 목록 + 활성 세션 조회
2. 각 테이블의 현재 세션 주문 집계:
   - 총 주문액 = Σ Order.total_amount
   - 최신 주문 미리보기 = 최근 5개 (Q7=C)
3. 실시간 갱신: SSE로 new_order 수신 시 해당 테이블 카드 갱신 + 강조
```

## WF-8: 메뉴 관리 (CRUD + 순서)

```
등록: 필수필드(name, price, category_id) 검증 → price ≥ 0 정수(Q4=B) → 삽입
수정: 대상 조회 → 부분 업데이트 → 검증
삭제: 대상 삭제 (과거 이력은 스냅샷으로 영향 없음 — Q5=A)
순서조정: orderedIds 순서대로 sort_order 일괄 업데이트 (트랜잭션)
이미지: 로컬 업로드 → 저장 경로를 image_url로 기록
```

## WF-9: 관리자 인증

```
로그인: storeId + username + password → 하드코딩 자격과 비교
       → 일치 시 JWT 발급 (만료 16시간)
검증: 보호 라우트에서 Authorization: Bearer <token> 검증
     → 유효하면 통과, 만료/무효면 401 (프론트는 로그인으로 리다이렉트)
```

---

## 총액 계산 정책
- **주문 총액**: 주문 항목 단가×수량 합계. 주문 생성 시 확정 저장.
- **테이블 총액**: 현재 세션의 잔여 주문 총액 합계. 주문 삭제/추가 시 조회 시점 재계산.
- 모든 금액은 정수(원). 부동소수점 미사용.
