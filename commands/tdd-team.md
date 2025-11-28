---
description: TDD 방식으로 기능을 개발하는 다중 에이전트 시스템 (Red-Green-Refactor)
allowed-tools: Task, TodoWrite, Read, Grep, AskUserQuestion
argument-hint: <feature-description> [requirements...]
---

# TDD Team - TDD 자동화 개발 시스템

`$ARGUMENTS`로 전달된 기능 설명을 기반으로 TDD Orchestrator를 호출하여 Red-Green-Refactor 사이클을 자동화합니다.

## 사용법

```bash
/tdd-team "기능 설명"
/tdd-team "기능 설명" "요구사항1" "요구사항2"
```

## 예시

### 기본 사용
```bash
/tdd-team "배열 합계 함수"
```

### 상세 요구사항 포함
```bash
/tdd-team "사용자 인증 API" "이메일/비밀번호 로그인" "JWT 토큰 발급" "bcrypt 해싱"
```

### 제약 조건 포함
```bash
/tdd-team "이메일 검증 함수" "OWASP 준수" "성능: 100ms 이내"
```

## 실행 흐름

1. **입력 파싱**: 기능 설명 및 요구사항 추출
2. **TDD Orchestrator 호출**: 전체 워크플로우 시작
3. **Task Planner**: 기능을 작은 작업으로 분해
4. **FOR EACH 작업**:
   - Red: 실패하는 테스트 작성
   - Green: 테스트 통과하는 최소 코드
   - Refactor: 코드 품질 개선
   - Review: 품질 검증 및 승인/거부
5. **최종 리포트**: 성공/실패 통계 + 생성된 파일 목록

## Implementation

### 1. 인자 파싱

```typescript
const args = $ARGUMENTS.split(' ');
const feature_description = args[0];
const requirements = args.slice(1);

if (!feature_description || feature_description.length < 10) {
  출력: "에러: 기능 설명이 너무 짧습니다 (최소 10자).

  예시:
  - /tdd-team \"사용자 인증 API\"
  - /tdd-team \"배열 합계 함수\"
  - /tdd-team \"이메일 검증 로직\"";
  종료;
}
```

### 2. 프로젝트 루트 확인

```bash
# 현재 디렉토리 확인
pwd

# Git 루트 확인 (있으면 사용)
git rev-parse --show-toplevel 2>/dev/null || pwd
```

### 3. TDD Orchestrator 호출

```typescript
Task({
  subagent_type: "tdd-orchestrator",
  description: "TDD 개발 시작",
  prompt: JSON.stringify({
    feature_description: feature_description,
    requirements: requirements,
    project_root: project_root,
    max_retries: 3
  })
})
```

### 4. 진행 상황 모니터링

TDD Orchestrator가 TodoWrite를 사용하여 실시간으로 진행 상황을 업데이트합니다:

```
[ ] 전체: 사용자 인증 API (5개 작업)
  [✓] TASK-001: 이메일 검증 함수
    [✓] Red: 실패 테스트 작성
    [✓] Green: 테스트 통과 코드
    [✓] Refactor: 코드 개선
    [✓] Review: 품질 검증
  [→] TASK-002: 비밀번호 해싱
    [→] Red: 실패 테스트 작성
    [ ] Green: 테스트 통과 코드
    [ ] Refactor: 코드 개선
    [ ] Review: 품질 검증
```

### 5. 최종 결과 출력

Orchestrator의 출력을 사용자 친화적으로 포맷:

```markdown
# TDD 개발 완료 ✓

## 요약
- 기능: {feature_description}
- 완료: {completed}/{total_tasks}개
- 소요 시간: {duration}분

## 생성된 파일
- src/validators/email.ts
- src/validators/email.test.ts
- src/auth/hash.ts
- src/auth/hash.test.ts

## 다음 단계
1. 테스트 실행: npm test
2. Git 커밋: git add . && git commit -m "feat: {feature_description}"
```

## 주의사항

### 1. 테스트 프레임워크 필수

TDD Team은 프로젝트에 테스트 프레임워크가 설치되어 있어야 합니다:

- **JavaScript/TypeScript**: Jest, Vitest, Mocha
- **Python**: Pytest, Unittest
- **Go**: go test
- **Rust**: cargo test

없으면 다음과 같이 안내:

```
테스트 프레임워크가 감지되지 않았습니다.

JavaScript/TypeScript:
  npm install -D jest @types/jest

Python:
  pip install pytest

프레임워크 설치 후 다시 시도하세요.
```

### 2. 작업 수 제한

20개 초과 시 사용자에게 선택 요청:

```
작업 수 45개가 제한(20개)을 초과합니다.

옵션:
1. 첫 20개만 실행
2. 기능 분할 (예: "사용자 관리"만 먼저)
3. 전체 실행 (예상: 120분)

어떻게 하시겠습니까?
```

### 3. 실패 처리

작업 실패 시 사용자에게 질문:

```
TASK-005 (JWT 토큰 검증)가 3회 재시도 후 실패했습니다.

마지막 피드백: "함수 길이 55줄로 40줄 초과"

옵션:
1. 스킵하고 계속 - 다음 작업으로
2. 재시도 - 한 번 더 시도
3. 중단 - 전체 작업 중단

어떻게 하시겠습니까?
```

## 고급 사용법

### 제약 조건 지정

```bash
/tdd-team "결제 API" "보안: PCI-DSS 준수" "성능: 응답 200ms 이내" "재시도 로직 포함"
```

### 특정 디렉토리 지정

```bash
cd src/features/auth
/tdd-team "소셜 로그인 추가"
# 현재 디렉토리 기준으로 파일 생성
```

## 제한 사항

1. **병렬 작업 불가**: 의존성 있는 작업은 순차 실행만 가능
2. **최대 작업 수**: 한 번에 20개까지 (초과 시 분할 필요)
3. **수동 개입**: 복잡한 비즈니스 로직은 인간 검토 필요
4. **Git 커밋**: 자동 커밋 없음 (사용자가 수동 커밋)

## 에러 메시지

### "기능 설명이 너무 짧습니다"
- **원인**: 10자 미만 입력
- **해결**: 구체적인 기능 설명 제공

### "테스트 프레임워크가 없습니다"
- **원인**: package.json, requirements.txt 등에 테스트 프레임워크 없음
- **해결**: Jest, Pytest 등 설치

### "모든 작업 실패"
- **원인**: 프로젝트 설정 오류, 경로 문제
- **해결**: 프로젝트 루트에서 실행, 설정 확인

## 관련 문서

- [TDD Orchestrator 에이전트](../agents/tdd/orchestrator.md)
- [TDD 패턴 레퍼런스](../docs/references/agents/tdd-multi-agent-pattern.md)
- [개발 가이드라인](../docs/guidelines/development.md)

## 예제

### Example 1: 간단한 유틸리티 함수

```bash
/tdd-team "배열의 최댓값 찾기 함수"
```

**결과**:
```
✓ TASK-001: 최댓값 찾기 함수
  - 테스트: 5개
  - 구현: 8줄
  - 커버리지: 100%
  - 소요 시간: 2분

생성 파일:
- src/utils/max.ts
- src/utils/max.test.ts
```

### Example 2: 복잡한 기능

```bash
/tdd-team "사용자 인증 시스템" "이메일 로그인" "JWT 토큰" "비밀번호 해싱"
```

**결과**:
```
완료: 4/5개 작업 (80%)
실패: TASK-005 (토큰 갱신)

성공:
✓ TASK-001: 이메일 검증
✓ TASK-002: 비밀번호 해싱
✓ TASK-003: 로그인 로직
✓ TASK-004: JWT 생성

실패:
✗ TASK-005: JWT 갱신 (복잡도 초과)

다음 단계:
/tdd-team "JWT 토큰 갱신 함수"
```

## 변경 이력

- **2025-11-28**: 초기 생성 - TDD Team 커맨드 구현
