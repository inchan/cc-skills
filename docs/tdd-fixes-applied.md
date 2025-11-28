# TDD 다중 에이전트 시스템 - 적용된 수정 사항

## 수정 완료 항목

### ✅ 1. plugin.json에 에이전트 등록

**파일**: `.claude-plugin/plugin.json`

**변경 내역**:
```json
{
  "agents": [
    { "name": "tdd-orchestrator", "source": "agents/tdd/orchestrator.md" },
    { "name": "tdd-task-planner", "source": "agents/tdd/task-planner.md" },
    { "name": "tdd-test-writer", "source": "agents/tdd/test-writer.md" },
    { "name": "tdd-implementer", "source": "agents/tdd/implementer.md" },
    { "name": "tdd-refactorer", "source": "agents/tdd/refactorer.md" },
    { "name": "tdd-reviewer", "source": "agents/tdd/reviewer.md" }
  ],
  "commands": [
    { "name": "tdd-team", "source": "commands/tdd-team.md" }
  ]
}
```

**효과**: Task 도구에서 `subagent_type`으로 호출 가능

---

### ✅ 2. YAML Frontmatter tools 배열 형식으로 수정

**변경 대상**: 6개 에이전트 파일 모두

**이전 (잘못된 형식)**:
```yaml
tools: Read, Grep, Glob, TodoWrite
```

**이후 (올바른 형식)**:
```yaml
tools: ["Read", "Grep", "Glob", "TodoWrite"]
```

**변경된 파일**:
- `agents/tdd/orchestrator.md`
- `agents/tdd/task-planner.md`
- `agents/tdd/test-writer.md`
- `agents/tdd/implementer.md`
- `agents/tdd/refactorer.md`
- `agents/tdd/reviewer.md`

**효과**: YAML 파싱 오류 방지, 도구 정상 인식

---

### ✅ 3. 테스트 시나리오 문서 작성

**파일**: `docs/test-tdd-simple.md`

**내용**:
- 목표: `/tdd-team "배열 합계 함수"` 실행
- 7단계 상세 시나리오
- 예상 입출력 정의
- 성공 기준 체크리스트
- 예상 문제 및 해결책

---

### ✅ 4. 테스트 환경 준비

**위치**: `/tmp/claude/tdd-test-simple`

**구성**:
- `package.json` - Jest 설정
- `node_modules/` - Jest 설치 완료 (266 packages)
- `src/` - 소스 코드 디렉토리

---

## 🔴 미해결 핵심 문제

### 문제 1: Task 도구 반환값 파싱

**현재 상태**:
- Orchestrator가 `Task()` 호출 시 반환값이 **문자열 (텍스트)**
- 하지만 코드에서 `red_output.status` 같은 JSON 속성 접근 시도

**필요한 수정**:

#### orchestrator.md 수정 필요

**현재** (동작 불가):
```typescript
red_output = Task({
  subagent_type: "tdd-test-writer",
  prompt: JSON.stringify({...})
})

IF red_output.status != "red":
    // 조건 평가 불가
```

**수정 후** (동작 가능):
```markdown
## Test Writer 호출 방법

1. Task 도구 호출:
```
Task({
  subagent_type: "tdd-test-writer",
  description: "Red 단계 실행",
  prompt: "TASK-001: 배열 합계 함수에 대해 실패하는 테스트를 작성하세요.

  성공 기준:
  - Input: number[]
  - Output: number
  - Edge Cases: 빈 배열 → 0, 음수 포함 등

  응답 형식:
  - 테스트 파일 경로
  - 테스트 실행 결과
  - 마지막 줄에 반드시 '---STATUS: red---' 또는 '---STATUS: error---' 포함"
})
```

2. 반환된 텍스트에서 상태 추출:
```
response = Task 반환값
IF response.includes("---STATUS: red---"):
    상태 = "red" (성공)
ELSE IF response.includes("---STATUS: error---"):
    에러 처리
```
```

#### 모든 서브에이전트의 Output 섹션 수정

각 에이전트(test-writer, implementer, refactorer, reviewer)의 응답 마지막에 상태 태그 추가:

```markdown
## 응답 형식

자연어로 작업 설명 후, 마지막 줄에:

- Test Writer: `---STATUS: red---`
- Implementer: `---STATUS: green---`
- Refactorer: `---STATUS: refactored---`
- Reviewer: `---STATUS: approved---` 또는 `---STATUS: rejected---`
```

---

### 문제 2: 루프 제어 (상태 관리)

**현재 상태**:
```python
WHILE attempt <= max_retries:
    # attempt 변수를 어디에 저장?
```

**해결 방안**: 상태 파일 사용

#### orchestrator.md 추가 섹션

```markdown
## 상태 관리

### 상태 파일 경로
- `/tmp/claude/tdd-state-{timestamp}.json`

### 상태 파일 구조
```json
{
  "session_id": "20251129-001234",
  "feature_description": "배열 합계 함수",
  "current_task_index": 0,
  "tasks": [
    {
      "task_id": "TASK-001",
      "stage": "green",
      "attempt": 2,
      "files": {...},
      "last_output": "..."
    }
  ],
  "completed_tasks": [],
  "failed_tasks": []
}
```

### 상태 읽기/쓰기
```bash
# 상태 읽기
state=$(cat /tmp/claude/tdd-state-{timestamp}.json)

# 상태 업데이트 (jq 사용)
echo "$state" | jq '.current_task_index = 1' > /tmp/claude/tdd-state-{timestamp}.json
```
```

---

### 문제 3: TodoWrite activeForm 누락

**현재 상태**: Orchestrator의 TodoWrite 호출에 `activeForm` 없음

**수정 필요**: orchestrator.md의 모든 TodoWrite 예시

**이전**:
```json
{
  "todos": [
    {
      "content": "전체: 사용자 인증 시스템",
      "status": "in_progress"
    }
  ]
}
```

**이후**:
```json
{
  "todos": [
    {
      "content": "전체: 사용자 인증 시스템 (5개 작업)",
      "status": "in_progress",
      "activeForm": "사용자 인증 시스템 개발 중"
    }
  ]
}
```

---

### 문제 4: 커맨드 파일의 의사 코드

**현재 상태**: `commands/tdd-team.md`에 TypeScript 의사 코드

**수정 필요**: 자연어 지침으로 변경

**이전** (혼란 유발):
```markdown
### 1. 인자 파싱

```typescript
const args = $ARGUMENTS.split(' ');
if (!feature_description) {
  출력: "에러...";
}
```
```

**이후** (명확함):
```markdown
### 1. 입력 검증

전달된 기능 설명을 확인하세요: `$ARGUMENTS`

- 10자 미만이면:
  "기능 설명이 너무 짧습니다. 예: '사용자 인증 API', '배열 합계 함수'"

- 10자 이상이면:
  다음 단계로 진행
```

---

## 추가 개선 사항

### 1. 시간 예측 현실화

**현재**: 작업당 3-5분
**실제**: 작업당 10-20분 (LLM 대기 + 테스트 실행)

**수정 위치**:
- `orchestrator.md:543`
- `task-planner.md:55`
- `commands/tdd-team.md:120`

---

### 2. 에러 처리 매트릭스 추가

**orchestrator.md에 추가 필요**:

```markdown
## 에러 처리 매트릭스

| 서브에이전트 | 에러 타입 | Orchestrator 대응 |
|-------------|----------|------------------|
| Task Planner | 작업 수 > 20 | AskUserQuestion: 분할/전체 실행 |
| Test Writer | TestPassedError | 기존 구현 삭제 또는 TASK 스킵 |
| Test Writer | SyntaxError | 재작성 (attempt++) |
| Implementer | TestStillFailingError | 재구현 (attempt++) |
| Implementer | ComplexityViolationError | 함수 분리 요청 후 재시도 |
| Reviewer | rejected (P1-P2 위반) | 이전 단계 재실행 |
| Reviewer | rejected (P3-P4 위반) | 1회 재시도 후 수용 |
```

---

## 검증 체크리스트

### 수정 완료 항목
- [x] plugin.json 에이전트 등록
- [x] YAML tools 배열 형식
- [x] 테스트 환경 준비

### 미완료 (권장)
- [ ] Task 반환값 파싱 로직 명시
- [ ] 루프 제어 (상태 파일)
- [ ] TodoWrite activeForm 추가
- [ ] 커맨드 파일 의사 코드 제거
- [ ] 시간 예측 현실화
- [ ] 에러 처리 매트릭스 추가

---

## 다음 단계

### 단계 1: 최소 동작 테스트

현재 상태에서 `/tdd-team` 실행하여:
1. 에이전트 등록 확인
2. YAML 파싱 확인
3. 어떤 지점에서 실패하는지 확인

### 단계 2: 실패 지점 수정

예상 실패 지점:
1. Task 반환값 파싱 (`red_output.status`)
2. 루프 무한 반복 (상태 손실)
3. TodoWrite 에러 (activeForm 누락)

### 단계 3: 반복 테스트

각 수정 후 `/tdd-team "배열 합계 함수"` 재실행

---

## 변경 이력

- **2025-11-29**: 초기 작성 - 적용된 수정 사항 문서화
