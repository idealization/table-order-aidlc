# 요구사항 검증 질문

아래 질문에 답변해 주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.
"Other"를 선택한 경우 `[Answer]:` 태그 뒤에 설명을 추가해 주세요.

---

## Question 1
프론트엔드(고객용 및 관리자용) 기술 스택으로 무엇을 사용하시겠습니까?

A) React (Vite + TypeScript)

B) Next.js (TypeScript)

C) Vue.js (TypeScript)

D) Svelte/SvelteKit (TypeScript)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
백엔드 기술 스택으로 무엇을 사용하시겠습니까?

A) Node.js + Express (TypeScript)

B) Node.js + NestJS (TypeScript)

C) Java + Spring Boot

D) Python + FastAPI

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
데이터베이스로 무엇을 사용하시겠습니까?

A) PostgreSQL

B) MySQL

C) MongoDB

D) SQLite (개발/MVP용 경량 DB)

X) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 4
배포 환경은 어디를 대상으로 하시겠습니까?

A) AWS (EC2, RDS, S3 등)

B) 로컬/온프레미스 서버

C) Docker 컨테이너 (배포 환경 미정, 컨테이너화만 우선)

D) 배포는 나중에 결정 — 로컬 개발 환경만 우선 구성

X) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 5
고객용 인터페이스와 관리자용 인터페이스를 어떻게 구성하시겠습니까?

A) 하나의 프론트엔드 프로젝트에서 라우팅으로 분리 (모노리스 SPA)

B) 별도의 프론트엔드 프로젝트로 분리 (고객용 앱 + 관리자용 앱)

C) 모노레포 구조로 공통 코드 공유하면서 별도 앱으로 빌드

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
메뉴 이미지 관리는 어떻게 하시겠습니까? (요구사항에 "이미지 URL"로 명시되어 있습니다)

A) 외부 이미지 URL만 지원 (직접 업로드 없음, URL 입력만)

B) 로컬 파일 업로드 지원 (서버에 이미지 저장)

C) 클라우드 스토리지 업로드 (S3 등)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 7
MVP에서 동시 접속 규모(매장 수, 테이블 수)는 어느 정도를 예상하시나요?

A) 소규모 — 단일 매장, 테이블 10개 이하

B) 중규모 — 단일 매장, 테이블 10~50개

C) 대규모 — 다중 매장 지원, 매장당 테이블 50개 이상

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 8
관리자 계정 관리는 어떻게 하시겠습니까?

A) 시스템에 하드코딩된 단일 관리자 계정 (MVP 최소 구현)

B) DB에 관리자 계정 저장, 초기 시드 데이터로 생성

C) 관리자 회원가입 기능 포함

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) Yes — 모든 보안 규칙을 블로킹 제약으로 적용 (프로덕션 수준 애플리케이션에 권장)

B) No — 보안 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 10: Property-Based Testing Extension
이 프로젝트에 속성 기반 테스팅(PBT) 규칙을 적용하시겠습니까?

A) Yes — 모든 PBT 규칙을 블로킹 제약으로 적용 (비즈니스 로직, 데이터 변환, 직렬화, 상태 관리 컴포넌트가 있는 프로젝트에 권장)

B) Partial — 순수 함수와 직렬화 라운드트립에만 PBT 규칙 적용

C) No — PBT 규칙 건너뛰기 (단순 CRUD 애플리케이션, UI 전용 프로젝트에 적합)

X) Other (please describe after [Answer]: tag below)

[Answer]: C
