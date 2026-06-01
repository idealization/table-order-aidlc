# 프론트엔드 컴포넌트 설계 (Frontend Components) — Unit: table-order

컴포넌트 계층, props/state, 사용자 상호작용, API 연동 지점을 정의합니다.

---

## 1. 컴포넌트 계층 (Hierarchy)

```
App (BrowserRouter)
├── /store/:storeId/table/:tableId/* → CustomerLayout
│   ├── CartProvider (CartContext)
│   ├── CustomerMenu        [구현됨]
│   ├── CustomerCart        [구현됨]
│   ├── CustomerOrders      [구현됨]
│   └── BottomNav
└── /admin/* → AuthProvider (AuthContext)
    ├── /admin/login → AdminLogin              [신규]
    └── ProtectedAdminRoute → AdminLayout      [신규]
        ├── AdminDashboard                      [신규]
        │   └── TableCard → OrderDetailModal    [신규]
        ├── TableManagement                     [신규]
        ├── MenuManagement                      [신규]
        └── OrderHistoryView                    [신규]
```

---

## 2. 고객용 컴포넌트 (구현 완료, 설계 참조)

### CustomerMenu
- **State**: menu(MenuCategory[]), activeCategory, loading
- **상호작용**: 카테고리 탭 클릭(스크롤 이동), 메뉴 추가(+ 버튼)
- **API**: `GET /api/stores/:storeId/menu`
- **연동**: CartContext.addItem

### CustomerCart
- **State**: ordering, orderSuccess, error
- **상호작용**: 수량 증감, 삭제, 주문하기
- **API**: `POST /api/stores/:storeId/orders`
- **플로우**: 성공 → 주문번호 표시 → 장바구니 비우기 → 5초 후 메뉴 리다이렉트

### CustomerOrders
- **State**: orders(Order[]), loading
- **API**: `GET /api/stores/:storeId/tables/:tableId/orders?sessionId=...`

---

## 3. 관리자용 컴포넌트 (신규 설계)

### AuthContext / useAuth
- **State**: token, storeId, isAuthenticated
- **메서드**: login(storeId, username, password), logout()
- **영속**: localStorage에 token, storeId 저장
- **API**: `POST /api/auth/login`

### AdminLogin
- **Props**: 없음
- **State**: storeId, username, password, error, submitting
- **상호작용**: 폼 제출 → useAuth.login → 성공 시 /admin/dashboard 이동
- **검증**: 빈 필드 차단

### ProtectedAdminRoute
- **로직**: isAuthenticated=false면 /admin/login으로 Navigate

### AdminDashboard
- **State**: tables(TableWithSession[]), orders(실시간), selectedOrder
- **훅**: `useOrderStream(storeId, token)` — SSE 수신, 신규 주문 시 카드 강조
- **상호작용**: 테이블 카드 클릭 → OrderDetailModal, 테이블 필터
- **표시**: 테이블별 카드(총 주문액, 최신 5개 미리보기 — BR-VIEW-2)
- **API**: `GET /api/stores/:storeId/orders`, `GET /api/stores/:storeId/tables`, SSE `GET /api/stores/:storeId/events`

### OrderDetailModal
- **Props**: order, onClose, onStatusChange, onDelete
- **상호작용**: 상태 변경(대기중/준비중/완료), 주문 삭제(확인 팝업)
- **API**: `PATCH /api/stores/:storeId/orders/:orderId/status`, `DELETE /api/stores/:storeId/orders/:orderId`

### TableManagement
- **State**: tables, confirmDialog
- **상호작용**: 테이블 초기 설정(번호/비밀번호), 이용 완료(확인 팝업)
- **API**: `GET /api/stores/:storeId/tables`, `POST /api/stores/:storeId/tables/:tableId/complete`, 초기설정 엔드포인트

### MenuManagement
- **State**: categories, menuItems, editingItem, imageFile
- **상호작용**: 메뉴 등록/수정/삭제, 이미지 업로드, 순서 조정
- **검증**: name/price/category 필수, price ≥ 0 정수 (BR-MENU-2)
- **API**: `GET/POST/PUT/DELETE /api/stores/:storeId/menu...`, 이미지 업로드

### OrderHistoryView
- **State**: history, dateFilter, tableFilter
- **상호작용**: 날짜 필터, 닫기
- **API**: `GET /api/stores/:storeId/history`

---

## 4. 공유 상태 / 훅

| 훅/컨텍스트 | 책임 |
|-------------|------|
| CartContext / useCart | 장바구니 상태, localStorage 영속, 총액 계산 |
| AuthContext / useAuth | JWT 토큰, 인증 상태, login/logout |
| useOrderStream | EventSource로 SSE 구독, orders 누적, latestOrder, connected |

---

## 5. API 클라이언트 모듈 (api/*)
컴포넌트는 직접 fetch하지 않고 다음 모듈을 경유한다:
- `menuApi`, `orderApi`, `tableApi`, `authApi`, `historyApi`
- 관리자 API는 토큰을 Authorization 헤더로 전달

---

## 6. 사용자 상호작용 플로우 요약

### 고객 주문 플로우
```
메뉴 탐색 → 장바구니 담기 → 수량 조정 → 주문하기
→ (성공) 주문번호 표시 → 5초 후 메뉴 → 주문내역에서 상태 확인
```

### 관리자 운영 플로우
```
로그인(16h) → 대시보드(실시간 카드) → 신규 주문 강조 인지
→ 카드 클릭 상세 → 상태 변경(준비중/완료) 또는 삭제
→ 손님 퇴장 시 이용 완료 → 영업 후 과거 내역 확인
```
