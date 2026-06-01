# 애플리케이션 설계 계획 (Application Design Plan)

## 목적
요구사항과 유저 스토리를 기반으로 고수준 컴포넌트 식별, 서비스 계층 설계, 컴포넌트 의존성을 정의합니다.

## 컨텍스트 분석 요약
- **현재 구현**: 백엔드(Express + SQLite)에 menu/orders/tables 라우트, SSE 모듈 존재. 프론트엔드(React)에 고객용 메뉴/장바구니/주문 화면 존재.
- **미구현**: 관리자 인증, 관리자 대시보드 UI, 메뉴 관리 UI, 테이블 관리 UI, 과거 내역 조회 UI.
- **설계 범위**: 백엔드 컴포넌트(라우트/서비스/데이터 접근) + 프론트엔드 컴포넌트(고객/관리자) + 데이터 모델 관계.

---

## 실행 체크리스트 (Methodology)
- [x] components.md 생성 — 컴포넌트 정의 및 책임
- [x] component-methods.md 생성 — 메서드 시그니처 및 입출력
- [x] services.md 생성 — 서비스 정의 및 오케스트레이션
- [x] component-dependency.md 생성 — 의존성 매트릭스 및 데이터 흐름
- [x] application-design.md 생성 — 통합 설계 문서
- [x] 설계 완전성 및 일관성 검증

---

## 명확화 질문 (Clarification Questions)

아래 질문에 `[Answer]:` 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.

## Question 1
백엔드 코드 구조(아키텍처 스타일)를 어떻게 정리할까요? 현재는 라우트에 비즈니스 로직과 DB 접근이 함께 있습니다.

A) 계층형 분리 — Route(컨트롤러) → Service(비즈니스 로직) → Repository(데이터 접근) 3계층으로 리팩터링 (권장)

B) 현재 구조 유지 — 라우트 핸들러 안에 로직/DB 접근 유지 (단순함 우선)

C) Service 계층만 추가 — Route → Service, DB 접근은 Service 내부에서 직접

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
프론트엔드 컴포넌트 구조에서 API 호출 로직을 어떻게 관리할까요? 현재는 컴포넌트 내부에서 직접 fetch를 호출합니다.

A) API 클라이언트 모듈 분리 — `src/api/` 에 도메인별 API 함수 모듈화 (권장)

B) 현재 방식 유지 — 각 컴포넌트에서 직접 fetch

C) 데이터 페칭 라이브러리 도입 — React Query 등으로 상태/캐싱 관리

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
관리자 인증 상태(JWT)는 프론트엔드에서 어떻게 관리할까요?

A) localStorage에 토큰 저장 + React Context로 인증 상태 공유 (권장, MVP에 단순)

B) httpOnly 쿠키 기반 (보안 강화, 백엔드 쿠키 처리 필요)

C) 메모리(상태)만 사용 — 새로고침 시 재로그인

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
관리자 대시보드와 고객용 화면의 라우팅/레이아웃 분리 방식은?

A) 별도 라우트 트리 + 별도 레이아웃 — `/admin/*` (AdminLayout) vs `/store/:storeId/table/:tableId/*` (CustomerLayout) (권장)

B) 동일 레이아웃에서 조건부 렌더링

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
실시간 통신(SSE) 컴포넌트는 프론트엔드에서 어떻게 다룰까요?

A) 커스텀 훅으로 캡슐화 — `useOrderStream(storeId)` 훅에서 EventSource 관리 (권장)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
설계 문서의 작성 언어는?

A) 한국어

B) 영어

C) 한국어 + 영어 병기

X) Other (please describe after [Answer]: tag below)

[Answer]: A
