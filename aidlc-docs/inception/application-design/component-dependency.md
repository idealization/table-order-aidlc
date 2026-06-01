# 컴포넌트 의존성 및 데이터 흐름 (Component Dependency)

## 1. 백엔드 의존성 매트릭스

| 컴포넌트 | 의존 대상 |
|----------|-----------|
| MenuRoutes | MenuService, AuthMiddleware(쓰기), UploadMiddleware |
| OrderRoutes | OrderService, AuthMiddleware(관리자 조회/변경) |
| TableRoutes | TableService, AuthMiddleware(관리자 작업) |
| AuthRoutes | AuthService |
| HistoryRoutes | HistoryService, AuthMiddleware |
| EventRoutes(SSE) | SSEManager, AuthMiddleware |
| MenuService | CategoryRepository, MenuItemRepository |
| OrderService | OrderRepository, SessionRepository, SSEManager |
| TableService | TableRepository, SessionRepository, OrderRepository, OrderHistoryRepository |
| AuthService | (없음 / JWT 라이브러리) |
| HistoryService | OrderHistoryRepository |
| *Repository | Database (SQLite 연결) |

**의존 방향**: Route → Service → Repository → Database (단방향, 역참조 금지)

---

## 2. 프론트엔드 의존성

| 컴포넌트 | 의존 대상 |
|----------|-----------|
| CustomerMenu | menuApi, CartContext |
| CustomerCart | orderApi, CartContext |
| CustomerOrders | orderApi |
| AdminLogin | authApi, AuthContext |
| AdminDashboard | useOrderStream, orderApi, tableApi, AuthContext |
| OrderDetailModal | orderApi, AuthContext |
| TableManagement | tableApi, AuthContext |
| OrderHistoryView | historyApi, AuthContext |
| MenuManagement | menuApi, AuthContext |
| ProtectedAdminRoute | AuthContext |
| useOrderStream | (EventSource, 브라우저 API) |

---

## 3. 데이터 흐름 다이어그램 (텍스트)

### 고객 주문 생성 흐름
```
[CustomerCart] --POST /orders--> [OrderRoutes] --> [OrderService]
   --> [SessionRepository.findActive]  (세션 검증)
   --> [OrderRepository.insert]        (트랜잭션 저장)
   --> [SSEManager.broadcast] --SSE--> [AdminDashboard]
[OrderRoutes] --201 + order--> [CustomerCart] (주문번호 표시 → 5초 후 메뉴 리다이렉트)
```

### 관리자 실시간 모니터링 흐름
```
[AdminDashboard] --GET /events(SSE)--> [EventRoutes] --> [SSEManager] (연결 등록)
신규 주문 발생 시: [OrderService.broadcast] --> [SSEManager] --event--> [useOrderStream] --> [AdminDashboard] 카드 강조
```

### 테이블 이용 완료 흐름
```
[TableManagement] --POST /tables/:id/complete--> [TableRoutes] --> [TableService]
   --트랜잭션--> [OrderHistoryRepository.insert] (이력 이동)
            --> [OrderRepository.deleteBySession] (현재 주문 삭제)
            --> [SessionRepository.end] (세션 종료)
[TableRoutes] --success--> [TableManagement] (테이블 리셋 확인)
```

---

## 4. 데이터 모델 관계 (ERD 텍스트)

```
Store (1) --- (N) Table
Store (1) --- (N) Category
Store (1) --- (N) MenuItem
Category (1) --- (N) MenuItem
Table (1) --- (N) TableSession
TableSession (1) --- (N) Order
Order (1) --- (N) OrderItem
TableSession (1) --- (N) OrderHistory   (세션 종료 시 Order에서 이동)
```

| 엔티티 | 주요 필드 |
|--------|-----------|
| Store | id, name |
| Table | id, store_id, table_number, password |
| TableSession | id, table_id, store_id, started_at, ended_at, is_active |
| Category | id, store_id, name, sort_order |
| MenuItem | id, store_id, category_id, name, price, description, image_url, sort_order, is_available |
| Order | id, store_id, table_id, session_id, order_number, status, total_amount, created_at |
| OrderItem | id, order_id, menu_item_id, menu_item_name, quantity, unit_price |
| OrderHistory | id, store_id, table_id, session_id, order_number, status, total_amount, items_json, created_at, archived_at |

---

## 5. 통신 패턴
- **동기 REST**: 대부분의 CRUD 및 조회 (JSON over HTTP)
- **Server-Sent Events**: 관리자 실시간 주문 수신 (서버→클라이언트 단방향 푸시)
- **localStorage**: 장바구니 영속, 관리자 JWT 토큰, 테이블 세션 정보
- **인증**: 관리자 보호 라우트는 Authorization 헤더의 Bearer JWT 검증
