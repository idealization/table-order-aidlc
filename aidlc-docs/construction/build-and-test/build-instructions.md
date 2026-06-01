# 빌드 지침 (Build Instructions)

## 사전 요구사항 (Prerequisites)
- **런타임**: Node.js 18+ (검증 환경: v22.20.0)
- **패키지 매니저**: npm
- **시스템**: macOS/Linux/Windows, 디스크 ~500MB (node_modules 포함)
- **환경 변수 (선택, 백엔드)**:
  - `PORT` (기본 3001)
  - `JWT_SECRET` (기본 개발용 값 — 프로덕션 시 필수 변경)
  - `ADMIN_STORE_ID` / `ADMIN_USERNAME` / `ADMIN_PASSWORD` (기본 store-001 / admin / admin1234)

## 빌드 단계

### 1. 백엔드 의존성 설치 및 빌드
```bash
cd backend
npm install
npm run build          # tsc → dist/ 생성
```
- **빌드 산출물**: `backend/dist/`
- **DB 초기화(최초 1회)**: `npm run seed` → `backend/data/table-order.db` 생성 + 시드 데이터

### 2. 프론트엔드 의존성 설치 및 빌드
```bash
cd frontend
npm install
npm run build          # tsc -b && vite build → dist/ 생성
```
- **빌드 산출물**: `frontend/dist/` (정적 자산)

### 3. 빌드 성공 확인
- 백엔드: `dist/index.js` 등 컴파일된 JS 생성, tsc 에러 0
- 프론트엔드: `dist/index.html` + `dist/assets/*.js,*.css` 생성, vite 빌드 성공

## 실행 (개발 모드)
```bash
# 터미널 1 — 백엔드
cd backend && npm run dev       # http://localhost:3001

# 터미널 2 — 프론트엔드
cd frontend && npm run dev      # http://localhost:5173
```
> Vite dev 서버가 `/api`와 `/uploads`를 백엔드(3001)로 프록시합니다.

## 실행 (프로덕션 모드)
```bash
cd backend && npm run build && npm start   # node dist/index.js
cd frontend && npm run build               # dist/를 정적 서버로 서빙
```

## 트러블슈팅

### `Cannot find module 'jsonwebtoken'`
- **원인**: 백엔드 의존성 미설치
- **해결**: `cd backend && npm install`

### tsc 타입 에러 `string | string[]`
- **원인**: `@types/express` v5와 express v4 불일치
- **해결**: `@types/express`를 `^4.17.21`로 고정 (이미 적용됨)

### SQLite 파일 잠금/오류
- **원인**: WAL 모드 잔여 파일
- **해결**: 백엔드 중지 후 `backend/data/*.db-wal`, `*.db-shm` 정리 후 재시작
