# 서비스 정의 및 오케스트레이션 (Services)

서비스 계층은 유스케이스를 수행하며 Repository를 조합하고 트랜잭션을 관리합니다.

---

## MenuService
**책임**: 메뉴/카테고리 조회 및 관리, 입력 검증, 노출 순서 관리.

**오케스트레이션**
- `getMenu`: CategoryRepository + MenuItemRepository 조회 후 카테고리별 그룹화.
- `createMenuItem`: 필수 필드/가격 범위 검증 → MenuItemRepository.insert.
- `reorderMenuItems`: 전달된 순서대로 sort_order 일괄 업데이트(트랜잭션).

**의존**: CategoryRepository, MenuItemRepository

---

## OrderService
**책임**: 주문 생성, 주문번호 채번, 총액 계산, 상태 전이, 실시간 발행.

**오케스트레이션 — createOrder (핵심 흐름)**
```
1. SessionRepository.findActive 로 세션 유효성 검증 (실패 시 400)
2. OrderRepository.nextOrderNumber 로 매장 내 순차 번호 채번
3. items 기반 총액 계산
4. 트랜잭션: OrderRepository.insertOrder + insertOrderItems
5. SSEManager.broadcastOrder 로 관리자에게 실시간 발행
6. 생성된 Order 반환
```

**상태 전이 규칙**: pending → preparing → completed (유효값 외 거부).

**의존**: OrderRepository, SessionRepository, SSEManager

---

## TableService
**책임**: 테이블 로그인/세션 관리, 이용 완료 라이프사이클.

**오케스트레이션 — completeSession (핵심 흐름)**
```
1. SessionRepository.findActive 로 활성 세션 확인 (없으면 400)
2. 트랜잭션:
   a. 세션의 모든 주문 + 항목 조회
   b. OrderHistoryRepository 에 항목 JSON 포함하여 이력 저장 (created_at 보존)
   c. OrderRepository.deleteBySession 로 현재 주문/항목 삭제
   d. SessionRepository.end 로 세션 종료 (is_active=0, ended_at)
3. 결과 반환 (현재 주문/총액은 이후 조회 시 0으로 표시)
```

**login 흐름**: 비밀번호 검증 → 활성 세션 있으면 재사용, 없으면 생성.

**의존**: TableRepository, SessionRepository, OrderRepository, OrderHistoryRepository

---

## AuthService
**책임**: 관리자 자격 검증, JWT 발급/검증.

**오케스트레이션**
- `authenticate`: 하드코딩 단일 관리자 자격(MVP)과 비교 → 일치 시 16시간 만료 JWT 발급.
- `verifyToken`: 서명/만료 검증 → payload 반환 또는 null.

**의존**: 없음 (MVP는 하드코딩 자격, 환경변수 기반 시크릿)

---

## HistoryService
**책임**: 과거 주문 이력 조회 및 필터링.

**오케스트레이션**
- `getHistory`: OrderHistoryRepository 조회 → 테이블/날짜 필터 적용 → 시간 역순 정렬.

**의존**: OrderHistoryRepository

---

## 서비스 간 상호작용 요약

```
OrderService --(broadcast)--> SSEManager --(SSE)--> AdminDashboard(Frontend)
TableService --(complete)--> OrderHistory (주문 이력 이동)
AuthService --(JWT)--> AuthMiddleware (보호 라우트 검증)
```

## 트랜잭션 경계
- **createOrder**: 주문 + 주문항목 삽입을 단일 트랜잭션으로.
- **completeSession**: 이력 이동 + 현재 주문 삭제 + 세션 종료를 단일 트랜잭션으로.
- **reorderMenuItems**: 순서 일괄 업데이트를 단일 트랜잭션으로.
