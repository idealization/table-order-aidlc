# 단위 테스트 실행 지침 (Unit Test Instructions)

## 현재 상태
이 MVP는 요구사항 분석 단계에서 **Property-Based Testing 확장을 opt-out**했고, 별도의 단위 테스트 프레임워크를 도입하지 않았습니다. 대신 다음으로 정확성을 검증합니다:
- **타입 안전성**: TypeScript 컴파일러(`tsc`)가 컴파일 타임 검증 수행
- **통합 테스트**: 핵심 비즈니스 흐름을 실제 API 호출로 검증 (integration-test-instructions.md 참조)

## 타입 체크 (컴파일 검증)
```bash
# 백엔드
cd backend && npx tsc --noEmit     # 에러 0 기대

# 프론트엔드
cd frontend && npx tsc -b          # 에러 0 기대
```

## 향후 단위 테스트 도입 (권장)
단위 테스트가 필요해지면 다음을 권장합니다:
- **백엔드**: Vitest 또는 Jest + ts-jest
  - 대상: `services/*` (MenuService 가격 검증, OrderService 총액/세션 검증, TableService 이용완료 트랜잭션)
- **프론트엔드**: Vitest + React Testing Library
  - 대상: `useCart`(수량/총액 계산), `useOrderStream`(SSE 이벤트 처리), 폼 검증

### 예시 (도입 시)
```bash
cd backend && npm install -D vitest && npx vitest run
```

## 현재 검증 기준
- **타입 체크**: 백엔드/프론트 모두 tsc 에러 0
- **빌드**: 양쪽 `npm run build` 성공
