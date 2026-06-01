# 기능 설계 계획 (Functional Design Plan) — Unit: table-order

## 목적
테이블오더 단일 단위의 상세 비즈니스 로직, 도메인 모델, 비즈니스 규칙을 기술 중립적으로 설계합니다.

## 단위 컨텍스트
- **단위명**: table-order (전체 MVP 애플리케이션)
- **할당 스토리**: US-C1~C5 (고객), US-A1~A8 (관리자)
- **핵심 복잡 로직**: 테이블 세션 라이프사이클, 주문 상태 전이, 주문 채번/총액, 이용 완료 시 이력 이동

---

## 실행 체크리스트 (Methodology)
- [x] domain-entities.md 생성 — 도메인 엔티티 및 관계
- [x] business-logic-model.md 생성 — 핵심 워크플로우/알고리즘
- [x] business-rules.md 생성 — 검증 규칙/제약/정책
- [x] frontend-components.md 생성 — UI 컴포넌트 계층/상태/상호작용
- [x] 설계 일관성 검증

---

## 명확화 질문 (Clarification Questions)

아래 질문에 `[Answer]:` 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.

## Question 1
주문번호(order_number) 채번 정책은?

A) 매장 전체에서 순차 증가 (현재 구현 방식) — 매장 내 1, 2, 3...

B) 테이블 세션별로 1부터 시작 — 각 세션마다 1, 2, 3...

C) 일자별로 리셋 — 매일 1부터 시작

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
테이블 세션 시작 시점 정의는? (용어 정의: 세션 = 첫 주문부터 이용 완료까지)

A) 첫 주문 생성 시 세션 시작 (요구사항 용어 정의 충실) — 로그인만으로는 세션 미시작

B) 테이블 로그인 시 세션 시작 (현재 구현 방식) — 로그인 즉시 활성 세션 생성

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
주문 상태 전이 규칙은 어떻게 제약할까요?

A) 단방향 진행만 — pending→preparing→completed (되돌리기 불가)

B) 자유 전환 — 관리자가 임의 상태로 변경 가능 (현재 구현 방식)

C) 인접 단계만 양방향 — pending↔preparing↔completed

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
메뉴 가격 검증 규칙은?

A) 0보다 큰 정수만 허용 (원 단위, 소수점 없음)

B) 0 이상 정수 허용 (무료 메뉴 가능)

C) 최소/최대 범위 지정 (예: 100원~1,000,000원)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
이용 완료된(과거 이력으로 이동된) 메뉴 항목이 이후 삭제/수정되어도 과거 주문 내역은 어떻게 보존할까요?

A) 주문 시점의 메뉴명·단가를 스냅샷으로 저장 (현재 구현 방식, 메뉴 변경 무관하게 보존) — 권장

B) 메뉴 ID 참조만 저장 (메뉴 삭제 시 이력 표시 영향)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
주문 생성 시 빈 장바구니나 비정상 수량(0 이하)에 대한 처리는?

A) 서버에서 거부 (400 에러) + 프론트에서도 사전 차단 (이중 검증) — 권장

B) 프론트에서만 차단

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
관리자 대시보드의 테이블 카드에 표시할 "최신 주문 미리보기" 개수는?

A) 최신 2개

B) 최신 3개

C) 최신 5개

X) Other (please describe after [Answer]: tag below)

[Answer]: C
