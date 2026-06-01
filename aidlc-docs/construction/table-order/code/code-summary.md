# 코드 생성 요약 (Code Summary) — Unit: table-order

## 생성/수정된 파일

### 백엔드 (backend/src/)
**신규 생성**
- `types.ts` — 백엔드 공통 타입 (Row 타입, 입력 타입)
- `config.ts` — JWT/관리자 자격 설정 (환경변수 오버라이드)
- `repositories/StoreRepository.ts`
- `repositories/TableRepository.ts`
- `repositories/SessionRepository.ts`
- `repositories/CategoryRepository.ts`
- `repositories/MenuItemRepository.ts`
- `repositories/OrderRepository.ts`
- `repositories/OrderHistoryRepository.ts`
- `services/errors.ts` — AppError/BadRequest/Unauthorized/NotFound
- `services/MenuService.ts`
- `services/OrderService.ts`
- `services/TableService.ts`
- `services/AuthService.ts` — JWT 발급/검증
- `services/HistoryService.ts`
- `middleware/auth.ts` — requireAdmin (JWT 검증)
- `middleware/errorHandler.ts` — handle() 래퍼 + 중앙 에러 핸들러
- `middleware/upload.ts` — multer 이미지 업로드
- `routes/auth.ts` — 관리자 로그인
- `routes/history.ts` — 과거 내역 조회

**수정 (in-place)**
- `routes/menu.ts` — Service 기반 + 메뉴 CRUD/업로드/카테고리 추가
- `routes/orders.ts` — Service 기반 + 인증 적용
- `routes/tables.ts` — Service 기반 + setup/complete 추가
- `index.ts` — 신규 라우트 등록, 에러 핸들러 적용
- `package.json` — jsonwebtoken 추가, @types/express v4로 정렬

### 프론트엔드 (frontend/src/)
**신규 생성**
- `api/client.ts` — fetch 래퍼 (에러/토큰 처리)
- `api/menuApi.ts`, `api/orderApi.ts`, `api/tableApi.ts`, `api/authApi.ts`, `api/historyApi.ts`
- `context/AuthContext.tsx` — JWT 인증 상태 (localStorage)
- `hooks/useOrderStream.ts` — SSE 구독 훅
- `components/ProtectedAdminRoute.tsx`
- `layouts/AdminLayout.tsx` (+ css)
- `pages/admin/AdminLogin.tsx` (+ css)
- `pages/admin/AdminDashboard.tsx` (+ css)
- `pages/admin/OrderDetailModal.tsx` (+ css)
- `pages/admin/TableManagement.tsx` (+ css)
- `pages/admin/MenuManagement.tsx` (+ css)
- `pages/admin/OrderHistoryView.tsx` (+ css)

**수정 (in-place)**
- `types.ts` — 관리자/이력 타입 추가
- `App.tsx` — 고객/관리자 라우트 분리, AuthProvider
- `layouts/CustomerLayout.tsx` — 테이블 자동 로그인 추가
- `pages/customer/CustomerMenu.tsx` — menuApi 사용
- `pages/customer/CustomerCart.tsx` — orderApi 사용
- `pages/customer/CustomerOrders.tsx` — orderApi 사용

## 스토리 구현 현황
| 스토리 | 상태 |
|--------|------|
| US-C1 테이블 자동 로그인 | ✅ (CustomerLayout 자동 로그인 + 세션 저장) |
| US-C2 메뉴 조회 | ✅ |
| US-C3 장바구니 | ✅ |
| US-C4 주문 생성 | ✅ |
| US-C5 주문 내역 | ✅ |
| US-A1 매장 인증 | ✅ (JWT 16h) |
| US-A2 실시간 모니터링 | ✅ (SSE 대시보드) |
| US-A3 주문 상태 변경 | ✅ |
| US-A4 주문 삭제 | ✅ |
| US-A5 테이블 이용 완료 | ✅ |
| US-A6 테이블 초기 설정 | ✅ |
| US-A7 과거 내역 조회 | ✅ |
| US-A8 메뉴 관리 | ✅ (CRUD + 이미지 업로드) |

## 빌드 검증
- 백엔드: `npm run build` (tsc) — 성공
- 프론트엔드: `npm run build` (tsc + vite) — 성공
- API 통합 테스트: 로그인(JWT 발급), 보호 라우트(200 with token / 401 without), 테이블 조회 — 정상

## 아키텍처
- 백엔드: Route → Service → Repository 3계층, 중앙 에러 핸들링
- 프론트: 고객(`/store/...`) / 관리자(`/admin/*`) 라우트 분리, API 모듈화, AuthContext, useOrderStream
