<div align="center">

# 🍽️ Table Order

**디지털 테이블오더 플랫폼 — 고객은 빠르게 주문하고, 매장은 실시간으로 관리합니다.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

태블릿으로 주문하고, 관리자 대시보드에서 SSE 기반 실시간 모니터링으로 운영하는 풀스택 MVP

</div>

---

## 📖 소개

Table Order는 매장 테이블에 비치된 태블릿으로 고객이 직접 주문하고, 매장 운영자가 실시간으로 주문을 관리하는 디지털 주문 플랫폼입니다. 별도 로그인 없이 즉시 주문할 수 있는 고객 경험과, 들어오는 주문을 한눈에 파악하는 관리자 대시보드를 제공합니다.

> 본 프로젝트는 AI-DLC(AI-Driven Development Life Cycle) 워크플로우를 따라 요구사항 분석 → 유저 스토리 → 설계 → 구현 → 테스트 순으로 개발되었습니다. 관련 산출물은 [`aidlc-docs/`](./aidlc-docs)에 있습니다.

---

## ✨ 주요 기능

### 🧑‍🍳 고객용 (Customer)
- **자동 로그인** — 테이블 태블릿에 저장된 정보로 별도 절차 없이 즉시 주문
- **메뉴 조회** — 카테고리별 카드형 메뉴, 사진·가격·설명 표시, 빠른 카테고리 이동
- **장바구니** — 수량 조절, 실시간 총액 계산, 새로고침 후에도 유지(localStorage)
- **주문 생성** — 주문 확정 시 주문번호 표시 후 5초 뒤 메뉴 화면으로 자동 복귀
- **주문 내역** — 현재 세션의 주문과 상태(대기중/준비중/완료) 확인

### 🧑‍💼 관리자용 (Admin)
- **매장 인증** — JWT 기반 로그인, 16시간 세션 유지
- **실시간 주문 모니터링** — Server-Sent Events(SSE)로 신규 주문 2초 이내 표시, 테이블별 카드 그리드
- **주문 관리** — 상태 변경(대기중→준비중→완료), 주문 삭제
- **테이블 관리** — 테이블 초기 설정, 이용 완료 처리(주문 이력 이관 + 세션 리셋)
- **메뉴 관리** — 메뉴 CRUD, 이미지 업로드, 노출 순서 조정
- **과거 내역** — 테이블별 과거 주문 조회, 날짜 필터

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| **프론트엔드** | React 18, TypeScript, Vite, React Router |
| **백엔드** | Node.js, Express, TypeScript |
| **데이터베이스** | SQLite (better-sqlite3) |
| **인증** | JWT (jsonwebtoken) |
| **실시간 통신** | Server-Sent Events (SSE) |
| **파일 업로드** | Multer |

---

## 🏗️ 아키텍처

```
┌───────────────────────── Frontend (React + Vite) ─────────────────────────┐
│  고객 (/store/:storeId/table/:tableId)   관리자 (/admin/*)                  │
│  · 메뉴 / 장바구니 / 주문내역             · 로그인 / 대시보드 / 테이블 / 메뉴 / 내역 │
│  상태: CartContext, AuthContext   훅: useCart, useOrderStream(SSE)          │
│  API 모듈: menuApi · orderApi · tableApi · authApi · historyApi             │
└──────────────────┬───────────────────────────────▲────────────────────────┘
                   │  REST (JSON)                   │  SSE (주문 스트림)
                   ▼                                │
┌──────────────────────────── Backend (Express) ────────────────────────────┐
│  Routes  →  Services  →  Repositories  →  SQLite                            │
│  Menu · Order · Table · Auth · History       Cross: SSEManager, Auth(JWT)   │
└────────────────────────────────────────────────────────────────────────────┘
```

3계층(Route → Service → Repository) 구조로 관심사를 분리했습니다.

---

## 🚀 시작하기

### 사전 요구사항
- Node.js 18 이상
- npm

### 1. 백엔드 실행

```bash
cd backend
npm install
npm run seed     # DB 초기화 + 샘플 데이터(매장/테이블/메뉴) 생성
npm run dev      # http://localhost:3001
```

선택: 메뉴 이미지를 다시 받으려면
```bash
npx ts-node src/fetch-images-direct.ts      # Wikimedia 기반
npx ts-node src/fetch-images-fallback.ts    # 보조(Flickr CC) 소스
```

### 2. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

> Vite 개발 서버가 `/api`와 `/uploads`를 백엔드(3001)로 프록시합니다.

### 3. 접속

| 화면 | URL | 계정 |
|------|-----|------|
| 고객 | http://localhost:5173/store/store-001/table/table-001/menu | (자동 로그인, 테이블 비밀번호 `1234`) |
| 관리자 | http://localhost:5173/admin/login | `admin` / `admin1234` (매장 `store-001`) |

---

## 📁 프로젝트 구조

```
table-order/
├── backend/                  # Express + SQLite API
│   ├── src/
│   │   ├── routes/           # HTTP 엔드포인트 (menu, orders, tables, auth, history)
│   │   ├── services/         # 비즈니스 로직 (Menu, Order, Table, Auth, History)
│   │   ├── repositories/     # 데이터 접근 계층 (SQLite)
│   │   ├── middleware/       # auth(JWT), upload(multer), errorHandler
│   │   ├── database.ts       # 스키마 초기화
│   │   ├── seed.ts           # 샘플 데이터
│   │   └── index.ts          # 서버 진입점
│   └── uploads/              # 메뉴 이미지 (로컬 저장)
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── pages/customer/   # 고객 화면 (메뉴/장바구니/주문내역)
│       ├── pages/admin/      # 관리자 화면 (로그인/대시보드/테이블/메뉴/내역)
│       ├── api/              # 도메인별 API 클라이언트
│       ├── context/          # CartContext, AuthContext
│       ├── hooks/            # useCart, useOrderStream
│       └── layouts/          # CustomerLayout, AdminLayout
├── aidlc-docs/               # AI-DLC 산출물 (요구사항/스토리/설계/테스트)
└── requirements/             # 원본 요구사항 문서
```

---

## 🔌 API 개요

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|:----:|
| `POST` | `/api/auth/login` | 관리자 로그인 (JWT 발급) | — |
| `GET` | `/api/stores/:storeId/menu` | 메뉴 조회 (카테고리별) | — |
| `POST` | `/api/stores/:storeId/tables/:tableId/login` | 테이블 로그인 | — |
| `POST` | `/api/stores/:storeId/orders` | 주문 생성 | — |
| `GET` | `/api/stores/:storeId/tables/:tableId/orders` | 현재 세션 주문 조회 | — |
| `GET` | `/api/stores/:storeId/events` | 실시간 주문 스트림 (SSE) | — |
| `GET` | `/api/stores/:storeId/orders` | 주문 목록 (관리자) | 🔒 |
| `PATCH` | `/api/stores/:storeId/orders/:orderId/status` | 주문 상태 변경 | 🔒 |
| `DELETE` | `/api/stores/:storeId/orders/:orderId` | 주문 삭제 | 🔒 |
| `POST` | `/api/stores/:storeId/tables/:tableId/complete` | 테이블 이용 완료 | 🔒 |
| `POST/PUT/DELETE` | `/api/stores/:storeId/menu...` | 메뉴 관리 | 🔒 |
| `GET` | `/api/stores/:storeId/history` | 과거 주문 내역 | 🔒 |

🔒 = `Authorization: Bearer <JWT>` 헤더 필요

---

## 🧪 테스트

```bash
cd backend
bash test-integration.sh     # 핵심 흐름 통합 테스트 (서버 실행 중이어야 함)
```

- 통합 테스트 19개 케이스 (인증, 주문 생성/조회/상태/삭제, 테이블 세션, 이력 이관 등)
- 타입 안전성: `npx tsc --noEmit` (백엔드), `npx tsc -b` (프론트엔드)

---

## ⚙️ 환경 변수 (백엔드, 선택)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | `3001` | 서버 포트 |
| `JWT_SECRET` | (개발용 기본값) | JWT 서명 시크릿 — **프로덕션 시 반드시 변경** |
| `ADMIN_STORE_ID` | `store-001` | 관리자 매장 식별자 |
| `ADMIN_USERNAME` | `admin` | 관리자 사용자명 |
| `ADMIN_PASSWORD` | `admin1234` | 관리자 비밀번호 |

---

## ⚠️ 참고 사항

이 프로젝트는 **MVP**로, 다음은 의도적으로 범위에서 제외되었습니다: 실제 결제, 영수증, 푸시/SMS 알림, 주방 연동, 매출 분석, 다국어 등. 프로덕션 전환 시에는 다음을 권장합니다:

- `JWT_SECRET` 및 관리자 자격 환경변수화
- SQLite → PostgreSQL 전환 후 부하 테스트
- 비밀번호 해싱(bcrypt), 로그인 레이트 리미팅 등 보안 강화

> 메뉴 이미지는 Wikimedia Commons 및 Flickr의 자유 라이선스(CC) 사진을 사용했습니다.

---

<div align="center">

Made with ☕ and 🍚

</div>
