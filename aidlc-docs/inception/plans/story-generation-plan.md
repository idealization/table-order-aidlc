# 유저 스토리 생성 계획 (Story Generation Plan)

## 목적
요구사항 정의서를 기반으로 사용자 중심의 유저 스토리, 페르소나, 유저 시나리오를 작성합니다.

---

## 생성 방법론 (Methodology)

### 접근 방식
본 프로젝트는 두 가지 명확한 사용자 유형(고객, 관리자)과 명확한 사용자 여정을 가지고 있으므로, **페르소나 기반 + 유저 여정 기반 하이브리드** 접근을 제안합니다.
- 페르소나별로 스토리를 그룹화 (고객 / 관리자)
- 각 페르소나 내에서 사용자 여정 순서대로 스토리 배열

### 실행 체크리스트
- [x] 페르소나 정의 (고객, 관리자)
- [x] 페르소나별 유저 여정(시나리오) 작성
- [x] INVEST 기준을 충족하는 유저 스토리 작성
- [x] 각 스토리에 수용 기준(Acceptance Criteria) 포함
- [x] 페르소나와 스토리 매핑
- [x] personas.md 생성
- [x] stories.md 생성 (유저 시나리오 포함)

---

## 명확화 질문 (Clarification Questions)

아래 질문에 `[Answer]:` 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.

## Question 1
유저 스토리 구성 방식으로 무엇을 선호하시나요?

A) 페르소나 기반 + 유저 여정 기반 하이브리드 (고객/관리자로 그룹화 후 여정 순서 배열) — 권장

B) 기능 기반 (메뉴 관리, 주문 처리 등 기능 단위로 그룹화)

C) 에픽 기반 (상위 에픽 아래 하위 스토리 계층 구조)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
페르소나는 어느 수준까지 정의할까요?

A) 핵심 2개만 — 고객(주문자), 매장 관리자

B) 세분화 — 고객(주문자), 매장 관리자, 매장 직원(서빙) 등 역할 분리

C) 상세 페르소나 — 이름, 나이, 기술 친숙도, 목표, 불만사항(pain point)까지 포함한 풍부한 페르소나

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 3
유저 스토리의 수용 기준(Acceptance Criteria) 형식은 무엇을 선호하시나요?

A) Given-When-Then (BDD 스타일)

B) 체크리스트 형태의 조건 목록

C) 둘 다 혼합 (스토리에 따라 적합한 형식 선택)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 4
유저 스토리의 범위는 어디까지 포함할까요?

A) MVP 범위 전체 (요구사항 정의서의 모든 MVP 기능)

B) 현재 구현된 기능 중심 (메뉴 조회, 장바구니, 주문 생성, 주문 내역)

C) MVP 범위 전체 + 향후 확장 기능까지

X) Other (please describe after [Answer]: tag below)

[Answer]: A (미입력 — 사용자 진행 요청에 따라 기본값 적용: MVP 범위 전체)

## Question 5
유저 시나리오(사용자 여정)는 어떤 형식으로 작성할까요?

A) 단계별 내러티브 (스토리텔링 형식으로 사용자 행동 흐름 서술)

B) 단계별 번호 목록 (각 단계와 시스템 반응을 표 형태로)

C) 둘 다 — 주요 시나리오는 내러티브, 세부 흐름은 단계 목록

X) Other (please describe after [Answer]: tag below)

[Answer]: C (미입력 — 사용자 진행 요청에 따라 기본값 적용: 내러티브 + 단계 목록 혼합)

## Question 6
페르소나와 시나리오 문서의 작성 언어는?

A) 한국어

B) 영어

C) 한국어 + 영어 병기

X) Other (please describe after [Answer]: tag below)

[Answer]: A
