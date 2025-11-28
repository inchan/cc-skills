# TDD Team 간단한 테스트 시나리오

## 목표

`/tdd-team "배열 합계 함수"` 실행하여 TDD 다중 에이전트 시스템의 기본 동작 검증

---

## 테스트 환경

- **프로젝트**: 임시 테스트 디렉토리
- **언어**: JavaScript (Node.js)
- **테스트 프레임워크**: Jest
- **예상 소요 시간**: 10-15분

---

## 사전 준비

### 1. 테스트 디렉토리 생성

```bash
mkdir -p /tmp/tdd-test-simple
cd /tmp/tdd-test-simple
```

### 2. package.json 생성

```json
{
  "name": "tdd-test-simple",
  "version": "1.0.0",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

### 3. Jest 설치

```bash
npm install
```

### 4. src 디렉토리 생성

```bash
mkdir -p src
```

---

## 테스트 단계

### 단계 1: 커맨드 실행

```bash
/tdd-team "배열 합계 함수"
```

**예상 동작**:
1. 커맨드가 `$ARGUMENTS` 검증 (10자 이상 ✓)
2. TDD Orchestrator 호출 시작

---

### 단계 2: Task Planner 실행

**Orchestrator가 Task Planner 호출**

**예상 입력**:
```
기능 설명: "배열 합계 함수"
프로젝트 루트: /tmp/tdd-test-simple
```

**예상 출력** (자연어 응답에 포함):
```
작업 분해 완료:
- TASK-001: 배열 합계 함수
  - Input: number[]
  - Output: number
  - Edge Cases:
    1. 빈 배열 [] → 0
    2. 단일 요소 [5] → 5
    3. 음수 포함 [-1, 2] → 1
    4. 소수점 포함 [1.5, 2.5] → 4.0

테스트 프레임워크: jest
예상 파일:
- src/sum.js
- src/sum.test.js
```

**검증**:
- [ ] 1개 작업 생성됨
- [ ] Edge Cases 3개 이상
- [ ] 파일 경로 명시됨

---

### 단계 3: Test Writer 실행 (Red)

**Orchestrator가 Test Writer 호출**

**예상 동작**:
1. `src/sum.test.js` 파일 생성
2. 4개 테스트 케이스 작성
3. `npm test` 실행 → **모두 실패** (Red)

**예상 테스트 코드**:
```javascript
// src/sum.test.js
const { sum } = require('./sum');

describe('sum', () => {
  it('returns 0 for empty array', () => {
    expect(sum([])).toBe(0);
  });

  it('returns the element for single element array', () => {
    expect(sum([5])).toBe(5);
  });

  it('handles negative numbers', () => {
    expect(sum([-1, 2])).toBe(1);
  });

  it('handles decimal numbers', () => {
    expect(sum([1.5, 2.5])).toBe(4.0);
  });
});
```

**예상 테스트 결과**:
```
FAIL  src/sum.test.js
  ● Test suite failed to run

    Cannot find module './sum' from 'src/sum.test.js'
```

**검증**:
- [ ] `src/sum.test.js` 파일 생성됨
- [ ] 4개 테스트 존재
- [ ] 모든 테스트 실패 (Red)
- [ ] 실패 이유: "모듈 없음"

---

### 단계 4: Implementer 실행 (Green)

**Orchestrator가 Implementer 호출**

**예상 동작**:
1. `src/sum.js` 파일 생성
2. 최소 구현 작성
3. `npm test` 실행 → **모두 통과** (Green)

**예상 구현 코드**:
```javascript
// src/sum.js
function sum(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((acc, num) => acc + num, 0);
}

module.exports = { sum };
```

**예상 테스트 결과**:
```
PASS  src/sum.test.js
  sum
    ✓ returns 0 for empty array (2 ms)
    ✓ returns the element for single element array (1 ms)
    ✓ handles negative numbers (1 ms)
    ✓ handles decimal numbers (1 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

**검증**:
- [ ] `src/sum.js` 파일 생성됨
- [ ] 함수 길이 10줄 미만
- [ ] 모든 테스트 통과 (Green)
- [ ] 커버리지 100%

---

### 단계 5: Refactorer 실행

**Orchestrator가 Refactorer 호출**

**예상 동작**:
1. 코드 분석 (이미 충분히 단순)
2. 개선 사항 없음 → 스킵
3. 테스트 재실행 → **여전히 통과**

**예상 응답**:
```
코드 분석 완료:
- 함수 길이: 3줄
- 복잡도: 2
- 개선 사항 없음 (이미 KISS 원칙 준수)

리팩토링 스킵
```

**검증**:
- [ ] 코드 변경 없음 또는 미세한 개선
- [ ] 테스트 여전히 통과

---

### 단계 6: Reviewer 실행

**Orchestrator가 Reviewer 호출**

**예상 동작**:
1. 체크리스트 검증
2. P1-P4 원칙 확인
3. 승인 결정

**예상 체크리스트**:
```
✓ 모든 테스트 통과 (4/4)
✓ 커버리지 100%
✓ 함수 길이 3줄 (40줄 미만)
✓ 조건문 깊이 1단계 (3단계 미만)
✓ YAGNI 준수
✓ DRY 준수

결정: APPROVED
```

**검증**:
- [ ] 모든 체크리스트 항목 통과
- [ ] 승인 결정

---

### 단계 7: 최종 리포트

**Orchestrator가 최종 리포트 생성**

**예상 리포트**:
```
# TDD 개발 완료 ✓

## 요약
- 기능: 배열 합계 함수
- 총 작업: 1개
- 완료: 1개 ✓
- 실패: 0개
- 소요 시간: ~10분

## 작업 상세

### TASK-001: 배열 합계 함수 ✓
- Red: 4개 테스트 작성 → 모두 실패 ✓
- Green: 3줄 구현 → 모두 통과 ✓
- Refactor: 개선 사항 없음 (스킵)
- Review: 승인 ✓

## 생성된 파일
- src/sum.js (3줄)
- src/sum.test.js (16줄)

## 다음 단계
1. 테스트 실행: npm test
2. Git 커밋: git add . && git commit -m "feat: 배열 합계 함수 추가"
```

**검증**:
- [ ] 통계 정확함
- [ ] 생성된 파일 목록 정확함
- [ ] 다음 단계 제안 있음

---

## 수동 검증

### 1. 파일 확인

```bash
ls -la /tmp/tdd-test-simple/src/
# 예상: sum.js, sum.test.js
```

### 2. 테스트 실행

```bash
cd /tmp/tdd-test-simple
npm test
```

**예상 결과**:
```
PASS  src/sum.test.js
  sum
    ✓ returns 0 for empty array
    ✓ returns the element for single element array
    ✓ handles negative numbers
    ✓ handles decimal numbers

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.5 s
```

### 3. 코드 리뷰

```bash
cat src/sum.js
cat src/sum.test.js
```

**확인 사항**:
- [ ] 코드가 P2 원칙 준수 (KISS/YAGNI)
- [ ] 테스트가 Edge Cases 커버
- [ ] 함수 시그니처 명확

---

## 성공 기준

| 항목 | 기준 | 상태 |
|------|------|------|
| 커맨드 실행 | 에러 없이 완료 | [ ] |
| 작업 분해 | 1개 작업 생성 | [ ] |
| Red 단계 | 모든 테스트 실패 | [ ] |
| Green 단계 | 모든 테스트 통과 | [ ] |
| Refactor 단계 | 코드 품질 유지 | [ ] |
| Review 단계 | 승인 결정 | [ ] |
| 파일 생성 | sum.js, sum.test.js | [ ] |
| 테스트 커버리지 | 100% | [ ] |
| 소요 시간 | 15분 이내 | [ ] |

---

## 예상 문제 및 해결책

### 문제 1: 에이전트 등록 안 됨

**증상**:
```
Error: Unknown agent: tdd-orchestrator
```

**해결**:
- plugin.json에 agents 섹션 확인
- Claude Code 재시작

### 문제 2: YAML 파싱 오류

**증상**:
```
Error: tools must be an array
```

**해결**:
- YAML frontmatter의 tools 배열 형식 확인

### 문제 3: 루프 무한 반복

**증상**:
- Orchestrator가 계속 같은 단계 반복

**해결**:
- 상태 파일 확인 또는 수동 중단 후 재시작

---

## 변경 이력

- **2025-11-29**: 초기 작성 - 간단한 테스트 시나리오
