# 애플리케이션 설계 (Application Design) — 통합 문서

테이블오더 MVP의 고수준 애플리케이션 설계를 통합 정리합니다. 세부 문서는 동일 디렉터리의 `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`를 참조하세요.

---

## 1. 설계 결정 요약 (Design Decisions)

| 항목 | 결정 |
|------|------|
| 백엔드 아키텍처 | Route → Service → Repository 3계층 |
| 프론트엔드 API 관리 | `src/api/` 도메인별 클라이언트 모듈 |
| 관리자 인증 상태 | localStorage JWT + React Context(AuthContext) |
| 라우팅/레이아웃 | `/admin/*` (AdminLayout) vs `/store/:storeId/table/:tableId/*` (CustomerLayout) |
| 실시간 통신 | `useOrderStream` 커스텀 훅 + 백엔드 SSEManager |
| 데이터 저장소 | SQLite (better-sqlite3) |

---

## 2. 아키텍처 개요 (텍스트 다이어그램)

```
+---------------------------- Frontend (React + Vite) ----------------------------+
|  CustomerLayout (/store/:storeId/table/:tableId)                                |
|    - CustomerMenu / CustomerCart / CustomerOrders                               |
|  AdminLayout (/admin) [ProtectedAdminRoute]                                     |
|    - AdminLogin / AdminDashboard / TableManagement / MenuManagement /           |
|      OrderHistoryView / OrderDetailModal                                        |
|  State: CartContext, AuthContext | Hooks: useCart, useOrderStream              |
|  API: menuApi, orderApi, tableApi, authApi, historyApi                          |
+---------------------------------------------------------------------------------+
                |  REST (JSON)                         ^  SSE (orders stream)
                v                                      |
+---------------------------- Backend (Express + TS) -----------------------------+
|  Routes:  Menu | Order | Table | Auth | History | Event(SSE)                    |
|  Middleware: AuthMiddleware (JWT), UploadMiddleware (multer)                     |
|  Services: Menu | Order | Table | Auth | History     Cross: SSEManager          |
|  Repositories: Store | Table | Session | Category | MenuItem | Order | History  |
|  Database: SQLite (better-sqlite3)                                              |
+---------------------------------------------------------------------------------+
```

---

## 3. 컴포넌트 요약

### 백엔드
- **Route 계층**: HTTP 입출력 + 검증 (MenuRoutes, OrderRoutes, TableRoutes, AuthRoutes, HistoryRoutes, EventRoutes)
- **Service 계층**: 비즈니스 로직/트랜잭션 (MenuService, OrderService, TableService, AuthService, HistoryService)
- **Repository 계층**: SQL 전담 (Store/Table/Session/Category/MenuItem/Order/OrderHistory Repository)
- **횡단 관심사**: SSEManager, AuthMiddleware, UploadMiddleware, Database

### 프론트엔드
- **고객**: CustomerMenu, CustomerCart, CustomerOrders
- **관리자**: AdminLogin, AdminDashboard, OrderDetailModal, TableManagement, OrderHistoryView, MenuManagement
- **공통**: API 모듈, CartContext/AuthContext, useCart/useOrderStream/useAuth

> 상세 책임: `components.md`, 메서드 시그니처: `component-methods.md`

---

## 4. 핵심 유스케이스 오케스트레이션

1. **주문 생성**: CustomerCart → OrderRoutes → OrderService(세션검증→채번→총액→저장→SSE발행) → AdminDashboard 실시간 반영
2. **테이블 이용 완료**: TableManagement → TableService(이력 이동 + 현재 주문 삭제 + 세션 종료, 단일 트랜잭션)
3. **관리자 인증**: AdminLogin → AuthService(JWT 16h 발급) → 보호 라우트는 AuthMiddleware 검증

> 상세 흐름: `services.md`, `component-dependency.md`

---

## 5. 데이터 모델 관계 요약

```
Store 1─N Table 1─N TableSession 1─N Order 1─N OrderItem
Store 1─N Category 1─N MenuItem
TableSession 1─N OrderHistory  (세션 종료 시 Order → OrderHistory 이동)
```

> 상세 ERD 및 필드: `component-dependency.md` 섹션 4

---

## 6. 현재 구현 대비 설계 갭 (Gap)

| 영역 | 현재 | 설계 목표 |
|------|------|-----------|
| 백엔드 구조 | 라우트에 로직+SQL 혼재 | Route/Service/Repository 분리 |
| 관리자 인증 | 미구현 | AuthService + JWT + AuthMiddleware |
| 관리자 UI | 미구현 | AdminDashboard 등 6개 페이지 |
| 메뉴 이미지 업로드 | 미구현 | UploadMiddleware (multer) |
| 프론트 API 호출 | 컴포넌트 직접 fetch | `api/*` 모듈로 분리 |
| 과거 내역 | 백엔드 일부, UI 없음 | HistoryService + OrderHistoryView |

> 이 갭은 Construction 단계(Functional Design → Code Generation)에서 순차적으로 해소합니다.

---

## 7. 설계 검증 (Validation)
- [x] 모든 유저 스토리(US-C1~C5, US-A1~A8)가 컴포넌트/서비스에 매핑됨
- [x] 단방향 의존성(Route→Service→Repository) 일관성 유지
- [x] 실시간 요구(SSE)와 세션 라이프사이클이 서비스 오케스트레이션에 반영됨
- [x] 데이터 모델이 요구사항의 8개 엔티티를 모두 포함
