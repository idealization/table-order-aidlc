# 코드 생성 계획 (Code Generation Plan) — Unit: table-order

## 단위 컨텍스트
- **워크스페이스 루트**: /Users/1113492/Documents/table-order
- **프로젝트 유형**: Greenfield, 단일 풀스택 단위
- **애플리케이션 코드 위치**: `backend/src/`, `frontend/src/`
- **문서 위치**: `aidlc-docs/construction/table-order/code/` (마크다운 요약만)

## 구현 대상 스토리
- 고객: US-C1~C5 (대부분 구현됨)
- 관리자: US-A1~A8 (대부분 미구현)

## 현재 구현 상태 vs 목표
| 영역 | 현재 | 이 계획에서 |
|------|------|-------------|
| 백엔드 구조 | 라우트에 로직/SQL 혼재 | Service/Repository 계층 분리 리팩터링 |
| 관리자 인증 | 없음 | AuthService + JWT + AuthMiddleware (US-A1) |
| 메뉴 관리 API | 조회만 | CRUD + 이미지 업로드 (US-A8) |
| 과거 내역 API | 없음 | History 라우트 (US-A7) |
| 테이블 초기설정 API | 없음 | setup 엔드포인트 (US-A6) |
| 관리자 프론트엔드 | 없음 | 로그인/대시보드/테이블/메뉴/이력 (US-A1~A8) |
| 프론트 API 모듈 | 직접 fetch | `src/api/*` 모듈화 |
| SSE 훅 | 없음 | useOrderStream (US-A2) |

---

## 실행 단계 (Steps)

### 백엔드 (Backend)
- [x] **Step 1**: Repository 계층 생성 — `backend/src/repositories/` (Store/Table/Session/Category/MenuItem/Order/OrderHistory)
- [x] **Step 2**: Service 계층 생성 — `backend/src/services/` (Menu/Order/Table/Auth/History)
- [x] **Step 3**: 인증 추가 — `backend/src/middleware/auth.ts` (JWT 검증), `AuthService`, `authRoutes` (US-A1)
- [x] **Step 4**: 라우트 리팩터링 — 기존 menu/orders/tables 라우트를 Service 호출 방식으로 정리
- [x] **Step 5**: 메뉴 관리 API — 메뉴/카테고리 CRUD, 순서조정, 이미지 업로드(multer) (US-A8)
- [x] **Step 6**: 과거 내역 API + 테이블 초기설정 API (US-A6, US-A7)
- [x] **Step 7**: 백엔드 통합(index.ts 라우트 등록) 및 의존성(jsonwebtoken) 추가

### 프론트엔드 (Frontend)
- [x] **Step 8**: API 클라이언트 모듈 — `frontend/src/api/` (menuApi/orderApi/tableApi/authApi/historyApi)
- [x] **Step 9**: 고객 페이지 리팩터링 — 직접 fetch를 api 모듈로 교체
- [x] **Step 10**: AuthContext + useOrderStream 훅 생성
- [x] **Step 11**: 관리자 레이아웃/라우팅 — AdminLayout, ProtectedAdminRoute, AdminLogin (US-A1)
- [x] **Step 12**: AdminDashboard + OrderDetailModal — 실시간 모니터링, 상태변경/삭제 (US-A2, US-A3, US-A4)
- [x] **Step 13**: TableManagement — 테이블 목록/초기설정/이용완료 (US-A5, US-A6)
- [x] **Step 14**: MenuManagement — 메뉴 CRUD + 이미지 업로드 + 순서 (US-A8)
- [x] **Step 15**: OrderHistoryView — 과거 내역 + 날짜 필터 (US-A7)
- [x] **Step 16**: App 라우트 통합 (고객/관리자 분리)

### 마무리
- [x] **Step 17**: 코드 요약 문서 생성 — `aidlc-docs/construction/table-order/code/`
- [x] **Step 18**: 빌드 검증 (백엔드 tsc, 프론트 build) — Build & Test 단계에서 수행 완료

---

## 자동화 친화 규칙
- 관리자/고객 UI의 상호작용 요소에 `data-testid` 속성 부여 (예: `admin-login-submit`, `menu-item-add-button`)
- 안정적 명명 규칙 `{component}-{role}` 사용

## 기술 비고
- JWT: `jsonwebtoken` 추가, 시크릿은 환경변수/기본값
- 이미지 업로드: `multer`로 `backend/uploads/`에 저장, `/uploads` 정적 서빙(이미 설정됨)
- 관리자 자격(MVP): 하드코딩 (storeId=store-001, username=admin, password=admin1234) — 환경변수로 오버라이드 가능
- 보안/PBT 확장은 opt-out 상태이므로 추가 보안 강화/속성 테스트는 적용하지 않음

## 단계 수 및 범위
- 총 18단계 (백엔드 7 + 프론트 9 + 마무리 2)
- 기존 동작 코드를 유지하며 점진적 리팩터링 + 관리자 기능 신규 추가
