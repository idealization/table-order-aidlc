# 컴포넌트 정의 (Components)

테이블오더 시스템의 고수준 컴포넌트와 책임을 정의합니다. 백엔드는 **Route → Service → Repository** 3계층, 프론트엔드는 **고객/관리자 분리 + API 모듈 + 커스텀 훅** 구조를 따릅니다.

---

## 1. 백엔드 컴포넌트 (Backend)

### 1.1 라우트 계층 (Route / Controller)
HTTP 요청을 받아 입력을 검증하고 Service를 호출, 응답을 반환합니다. 비즈니스 로직과 DB 접근은 포함하지 않습니다.

| 컴포넌트 | 책임 | 관련 스토리 |
|----------|------|-------------|
| `MenuRoutes` | 메뉴/카테고리 조회·관리 HTTP 엔드포인트 | US-C2, US-A8 |
| `OrderRoutes` | 주문 생성/조회/상태변경/삭제 엔드포인트 | US-C4, US-C5, US-A3, US-A4 |
| `TableRoutes` | 테이블 로그인/목록/초기설정/이용완료 엔드포인트 | US-C1, US-A5, US-A6 |
| `AuthRoutes` | 관리자 로그인/토큰 검증 엔드포인트 | US-A1 |
| `HistoryRoutes` | 과거 주문 내역 조회 엔드포인트 | US-A7 |
| `EventRoutes` (SSE) | 관리자 실시간 주문 스트림 엔드포인트 | US-A2 |

### 1.2 서비스 계층 (Service)
비즈니스 로직과 트랜잭션 처리. Repository를 조합하여 유스케이스를 수행합니다.

| 컴포넌트 | 책임 |
|----------|------|
| `MenuService` | 메뉴/카테고리 CRUD, 노출 순서, 검증 |
| `OrderService` | 주문 생성, 주문번호 채번, 총액 계산, 상태 전이, SSE 발행 |
| `TableService` | 테이블 로그인, 세션 생성/종료, 이용 완료 시 이력 이동 |
| `AuthService` | 관리자 자격 검증, JWT 발급/검증 |
| `HistoryService` | 과거 주문 이력 조회, 날짜 필터링 |

### 1.3 리포지토리 계층 (Repository)
SQLite 데이터 접근을 캡슐화합니다. SQL 쿼리는 이 계층에만 존재합니다.

| 컴포넌트 | 책임 |
|----------|------|
| `StoreRepository` | 매장 데이터 접근 |
| `TableRepository` | 테이블 데이터 접근 |
| `SessionRepository` | 테이블 세션 데이터 접근 |
| `CategoryRepository` | 카테고리 데이터 접근 |
| `MenuItemRepository` | 메뉴 항목 데이터 접근 |
| `OrderRepository` | 주문/주문항목 데이터 접근 |
| `OrderHistoryRepository` | 과거 주문 이력 데이터 접근 |

### 1.4 횡단 관심사 (Cross-cutting)
| 컴포넌트 | 책임 |
|----------|------|
| `SSEManager` | SSE 클라이언트 연결 관리 및 매장별 브로드캐스트 |
| `AuthMiddleware` | JWT 검증 미들웨어 (관리자 보호 라우트) |
| `UploadMiddleware` | 메뉴 이미지 로컬 파일 업로드 (multer) |
| `Database` | SQLite 연결, 스키마 초기화 |

---

## 2. 프론트엔드 컴포넌트 (Frontend)

### 2.1 라우팅 / 레이아웃
| 컴포넌트 | 책임 |
|----------|------|
| `App` | 최상위 라우트 정의 (고객/관리자 분리) |
| `CustomerLayout` | 고객용 레이아웃 + 하단 네비게이션 (`/store/:storeId/table/:tableId/*`) |
| `AdminLayout` | 관리자용 레이아웃 + 헤더/사이드 네비게이션 (`/admin/*`) |
| `ProtectedAdminRoute` | 관리자 인증 가드 (미인증 시 로그인으로 리다이렉트) |

### 2.2 고객용 페이지 (Customer)
| 컴포넌트 | 책임 | 스토리 |
|----------|------|--------|
| `CustomerMenu` | 카테고리 탭 + 메뉴 카드 목록 | US-C2 |
| `CustomerCart` | 장바구니 항목/수량/총액, 주문 확정 | US-C3, US-C4 |
| `CustomerOrders` | 현재 세션 주문 내역 | US-C5 |

### 2.3 관리자용 페이지 (Admin)
| 컴포넌트 | 책임 | 스토리 |
|----------|------|--------|
| `AdminLogin` | 매장 인증 로그인 폼 | US-A1 |
| `AdminDashboard` | 테이블별 카드 그리드, 실시간 주문 모니터링 | US-A2 |
| `OrderDetailModal` | 주문 카드 클릭 시 상세 + 상태변경/삭제 | US-A3, US-A4 |
| `TableManagement` | 테이블 목록, 초기 설정, 이용 완료 | US-A5, US-A6 |
| `OrderHistoryView` | 과거 주문 내역 조회 + 날짜 필터 | US-A7 |
| `MenuManagement` | 메뉴 CRUD + 이미지 업로드 + 순서 조정 | US-A8 |

### 2.4 상태 / API / 훅
| 컴포넌트 | 책임 |
|----------|------|
| `api/*` | 도메인별 API 클라이언트 모듈 (menuApi, orderApi, tableApi, authApi, historyApi) |
| `CartContext` | 장바구니 상태 (localStorage 영속) |
| `AuthContext` | 관리자 인증 상태 (JWT localStorage + 토큰 공유) |
| `useCart` | 장바구니 로직 훅 |
| `useOrderStream` | SSE EventSource 캡슐화 훅 (실시간 주문 수신) |

---

## 컴포넌트 책임 원칙
- **Route**: 입력 검증 + Service 호출 + 응답 변환만. 로직 금지.
- **Service**: 유스케이스/트랜잭션/규칙. HTTP·SQL 세부사항 비의존.
- **Repository**: SQL 전담. 비즈니스 규칙 없음.
- **Frontend Page**: 표현 + 사용자 상호작용. API 호출은 `api/*` 모듈 경유.
- **Hook/Context**: 상태·부수효과 캡슐화로 페이지 단순화.
