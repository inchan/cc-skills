# workflow-automation 플러그인 심층 분석 보고서

**작성일:** 2025-11-26
**최종 업데이트:** 2025-11-26 (Phase 1A 완료 반영)
**분석 범위:** 전체 플러그인 구조, 책임, 품질, 리팩토링 전략
**목표:** 단일 책임 원칙(SRP) 강화, 재사용성 극대화, 복잡도 감소, 테스트 가능성 향상

> **⚠️ 주의**: 이 문서는 초기 분석 보고서입니다. Phase 1A 완료 후 실제 결과는 [PHASE1A-COMPLETED.md](PHASE1A-COMPLETED.md)를 참조하세요.

---

## 📊 Executive Summary

### 현재 상태
- **전체 규모:** 7개 스킬, 4개 커맨드, 1개 에이전트, 72개 파일
- **코드 라인:** 총 ~5,000줄 (SKILL.md 기준)
- **핵심 기능:** 복잡도 기반 작업 자동 라우팅 (Router → Sequential/Parallel/Orchestrator)

### 주요 문제점 (초기 분석)
1. **🔴 Critical: 500줄 제한 위반** - 6개 스킬 중 5개 초과 (최대 66% 초과)
   - ✅ **Phase 1A 해결**: advisor (831→277줄), parallel (602→347줄)
   - ⏳ **Phase 1B 대상**: router (502줄), sequential (548줄), dynamic (703줄)
2. **🟡 중복 코드:** integration.py 4개, Anthropic 패턴 설명 7번 반복
   - ⏳ **Phase 1B 대상**: integration.py 삭제 예정
3. **🟡 불명확한 진입점:** 사용자가 어떤 스킬/커맨드를 선택해야 할지 모호
4. **🟠 실행 불가능 예제:** Bash 스크립트 경로 하드코딩, 미구현 API 참조
   - ✅ **Phase 0 검증**: integration.py 실행 불가 확인
5. **🟠 과도한 추상화:** Phase 1-4 계층, 사용되지 않는 설정 구조
   - ✅ **Phase 1A 해결**: orchestrator Deprecation 마킹

### 리팩토링 목표
- **Breaking Change 허용:** 최적의 구조를 위해 기존 인터페이스 변경 가능
- **전면 재작성 포함:** 필요시 스킬 완전 재작성
- **측정 가능한 개선:**
  - 모든 SKILL.md 500줄 이하
  - 중복 코드 30% 감소
  - 테스트 가능성 100% (모든 스킬에 검증 기준)

---

## 🎯 Phase 1: 책임 및 의존성 분석

### 1.1 스킬 책임 맵

| 스킬 | 핵심 책임 | 복잡도 | 상태 |
|------|---------|--------|------|
| **intelligent-task-router** | 작업 분류 (8개 카테고리) + 복잡도 분석 (0.0-1.0) | 502줄 | ⚠️ 경계선 |
| **sequential-task-processor** | Prompt Chaining (3-7단계) + Gate Validation | 548줄 | ⚠️ 10% 초과 |
| **parallel-task-executor** | Sectioning/Voting 병렬 실행 | 602줄 | ❌ 20% 초과 |
| **dynamic-task-orchestrator** | 6개 워커 조율 (복잡도 >= 0.7) | 703줄 | ❌ 40% 초과 |
| **agent-workflow-advisor** | 패턴 추천 전문가 (실행 X) | 831줄 | ❌ 66% 초과 |
| **agent-workflow-manager** | 5개 스킬 통합 워크플로우 조율 | 469줄 | ✅ 적절 |
| **agent-workflow-orchestrator** | Phase 1-4 완전 통합 자동화 | 825줄 | ❌ 65% 초과 |

### 1.2 의존성 그래프

```
[사용자 요청]
    ↓
┌───────────────────────────────────────┐
│ /auto-workflow (커맨드)               │
│ 1. agent-workflow-advisor (추천)      │
│ 2. agent-workflow-manager (실행)      │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ intelligent-task-router               │
│ - 복잡도 분석 (0.0-1.0)                │
│ - 카테고리 분류 (8개)                  │
└───────────────────────────────────────┘
    ↓
    ├─ < 0.3  → sequential-task-processor
    ├─ 0.3-0.7 → parallel-task-executor
    └─ >= 0.7  → dynamic-task-orchestrator
                    ↓
                 6개 워커 (Analyzer, Architect, Developer, ...)
    ↓
┌───────────────────────────────────────┐
│ iterative-quality-enhancer (모든 끝)  │
└───────────────────────────────────────┘

[고급 사용자]
    ↓
agent-workflow-orchestrator (Phase 1-4 완전 자동)
```

### 1.3 발견된 중복 책임

#### ❌ Critical: 복잡도 분석 로직 중복
- **위치:**
  - `intelligent-task-router`: 0.0-1.0 점수 산출 (134-159줄)
  - `agent-workflow-advisor`: 동일 기준으로 패턴 추천 (338-367줄)
  - `agent-workflow-manager`: 복잡도 기반 라우팅 결정 (내부 로직)

- **문제:** 복잡도 < 0.7 → Sequential 기준이 3곳에 하드코딩
- **해결:** 공유 유틸리티 `lib/complexity-analyzer.js` 생성

#### ❌ 작업 분류 로직 중복
- **위치:**
  - `intelligent-task-router`: 8개 카테고리 (bug_fix, feature_development 등)
  - `agent-workflow-advisor`: 동일 카테고리 분석

- **문제:** 키워드 매칭 알고리즘이 별도로 구현됨
- **해결:** Router를 단일 진실 소스(Single Source of Truth)로, Advisor는 결과 재사용

#### ⚠️ Workflow 선택 로직 중복
- **위치:**
  - `agent-workflow-advisor`: 패턴 추천 (Decision Tree)
  - `agent-workflow-manager`: 자동 패턴 선택
  - `agent-workflow-orchestrator`: Phase 3 동적 구성

- **문제:** 동일한 결정 트리가 3곳에 반복
- **해결:** Advisor를 Manager/Orchestrator가 내부 호출하도록 재구성

---

## 🏗️ Phase 2: 구조 및 코드 품질 분석

### 2.1 500줄 제한 위반 상세

| 순위 | 스킬 | 현재 | 목표 | 초과량 | 주요 원인 |
|------|------|------|------|--------|----------|
| 1 | agent-workflow-advisor | 831줄 | 350줄 | 481줄 | Advanced Scenarios (122줄), Complete Example (105줄) |
| 2 | agent-workflow-orchestrator | 825줄 | 400줄 | 425줄 | Phase 2 Pipelines (146줄), Full Example (172줄) |
| 3 | dynamic-task-orchestrator | 703줄 | 450줄 | 253줄 | Worker 정의 (180줄), E-Commerce Example (167줄) |
| 4 | parallel-task-executor | 602줄 | 480줄 | 122줄 | Sectioning/Voting 두 모드 혼재 |
| 5 | sequential-task-processor | 548줄 | 490줄 | 58줄 | Complete Example (237줄) 본문 비중 43% |

#### 리팩토링 전략: Progressive Disclosure 적용

**AS-IS (단일 파일):**
```
agent-workflow-advisor/
└── SKILL.md (831줄)
    ├── Overview
    ├── When to Use (상세)
    ├── Decision Tree (ASCII)
    ├── Common Scenarios (100줄)
    ├── Advanced Scenarios (122줄)
    ├── Complete Example (105줄)
    └── Integration
```

**TO-BE (계층 구조):**
```
agent-workflow-advisor/
├── SKILL.md (350줄 이하)
│   ├── Overview
│   ├── Quick Decision Tree (간단한 표)
│   ├── When to Use (핵심만)
│   └── → See resources/ for details
└── resources/
    ├── pattern-comparison.md       # 5개 패턴 비교
    ├── decision-tree.md            # 상세 ASCII 트리
    ├── common-patterns.md          # 일반 시나리오
    ├── advanced-scenarios.md       # 엣지 케이스
    └── examples/
        ├── simple-task.md
        ├── microservices-migration.md (기존 Complete Example)
        └── pattern-combinations.md
```

**예상 효과:**
- SKILL.md: 831 → 350줄 (-481줄, 58% 감소)
- 초기 로딩 속도 2.4배 향상
- 사용자는 필요한 정보만 선택적으로 접근

### 2.2 리소스 번들링 현황

| 스킬 | 번들 활용 | 내용 | 평가 |
|------|---------|------|------|
| agent-workflow-manager | ✅ 우수 | scripts/ (3개), workflows/ (3개) | 모범 사례 |
| dynamic-task-orchestrator | ✅ 우수 | scripts/ (16개 Python), references/ | 잘 분리됨 |
| intelligent-task-router | ✅ 우수 | classifiers/, routing_rules/, templates/ | 체계적 |
| parallel-task-executor | ✅ 우수 | scripts/ (10개 Python 모듈) | 모듈화 우수 |
| sequential-task-processor | ✅ 우수 | assets/templates/, scripts/ | 적절 |
| **agent-workflow-advisor** | ❌ 없음 | SKILL.md만 831줄 | **즉시 분리 필요** |
| **agent-workflow-orchestrator** | ❌ 없음 | SKILL.md만 825줄 | **즉시 분리 필요** |

**평가:** 7개 중 5개(71%)가 번들링 활용 중. 가장 큰 2개 파일이 미적용 상태로 우선 처리 필요.

### 2.3 공유 코드 중복 패턴

#### integration.py (4개 파일 중복)

**문제 코드:**
```python
# 모든 integration.py에 동일하게 존재
utils_path = Path(__file__).parent.parent.parent.parent / "workspace" / "prodg" / ".agent_skills" / "utils"
sys.path.insert(0, str(utils_path))

from message_protocol import MessageQueue, SkillMessage
```

**위치:**
- `dynamic-task-orchestrator/integration.py`
- `intelligent-task-router/integration.py`
- `parallel-task-executor/integration.py`
- `sequential-task-processor/integration.py`

**문제점:**
1. 하드코딩된 절대 경로 (프로젝트마다 다를 수 있음)
2. 공유 라이브러리(`message_protocol`)가 외부 의존성
3. 동일한 초기화 코드가 4번 반복

**해결 방안:**
```
workflow-automation/
└── lib/
    ├── integration_base.py          # 공통 Integration 클래스
    │   class BaseIntegration:
    │       def __init__(self):
    │           self.queue = MessageQueue()
    │           self.logger = setup_logger()
    │
    ├── path_resolver.py             # 동적 경로 해석
    │   def get_utils_path():
    │       return Path(__file__).parent.parent / "utils"
    │
    └── message_protocol.py          # 내부화 (외부 의존 제거)
        class MessageQueue: ...
```

**예상 효과:**
- 코드 중복 120줄 → 0줄
- 경로 에러 리스크 제거
- 외부 의존성 1개 제거

### 2.4 KISS/YAGNI 위반 사례

#### ❌ Case 1: agent-workflow-orchestrator Phase 구조

**위반 내용:**
```markdown
## Phase 1: Pattern Advisor (73줄)
## Phase 2: Predefined Pipelines (146줄)  ← 실제로는 /workflow-simple 등 커맨드로 구현됨
## Phase 3: Dynamic Composition (88줄)   ← 사용 사례 불명확
## Phase 4: Full Integration (172줄)     ← 구현 불가능 (Claude 재귀 제약)
```

**문제:**
- Phase 2는 이미 4개 커맨드(`/workflow-*`)로 존재
- Phase 3는 Phase 4와 사실상 동일 기능
- Phase 4는 "완전 자동화"를 약속하지만 실현 불가능

**YAGNI 위반 증거:**
```markdown
## Configuration (라인 712-742)
{
  "orchestration": {
    "mode": "full_auto",  // ❌ Claude가 지원하지 않는 기능
    "user_checkpoints": true,
    "approval_required": ["pipeline_construction"]
  }
}
```
→ 이 설정 구조는 실제 구현되지 않았으며, 향후에도 필요 없을 가능성 높음

**개선 방안:**
- Phase 1: 유지 (Advisor 역할)
- Phase 2: **완전 삭제** (중복)
- Phase 3-4: **병합** → "Dynamic Orchestration" 단일 기능

**예상 감소:** 825줄 → 389줄 (-436줄, 53% 감소)

#### ❌ Case 2: agent-workflow-manager 메시지 큐 시스템

**위반 내용:**
```markdown
## 통합 프로토콜 (라인 433-450)
- 메시지 큐: `.agent_skills/messages/`
- 로그: `.agent_skills/logs/`
- 컨텍스트: `.agent_skills/shared_context/`
```

**문제:**
- `.agent_skills/` 디렉토리가 실제로 존재하지 않음
- 메시지 큐 시스템 구현 안 됨
- "향후 통합을 위한" 설계이지만 현재 필요 없음 (YAGNI)

**Bash 스크립트 예제 (라인 159-236):**
```bash
.agent_skills/scripts/send_message.sh router sequential execute_task ${TASK_ID} '{...}'
```
→ 이 스크립트는 존재하지 않으며, 실행 시 에러 발생

**개선 방안:**
- 메시지 큐 섹션 **완전 삭제**
- Bash 스크립트 예제 **삭제** 또는 "Pseudocode"로 명시

#### ⚠️ Case 3: agent-workflow-advisor Advanced Scenarios

**위반 내용:**
```markdown
## Advanced Scenarios (라인 406-527, 122줄)
- Mixed Dependencies: Phased Execution (42줄)
- Partial Knowledge: Discovery Likelihood (43줄)
- External Changes vs Internal Discovery (27줄)
- Unclear Quality Criteria (37줄)
```

**KISS 위반:**
- 실제 사용자는 이런 극단적 시나리오를 거의 겪지 않음
- 95%의 사용 사례는 기본 패턴으로 충분
- 너무 많은 예외 케이스는 오히려 혼란 유발

**개선 방안:**
- Advanced Scenarios 전체를 `resources/advanced-scenarios.md`로 이동
- SKILL.md에는 "See advanced-scenarios.md for edge cases" 링크만 남김

**예상 감소:** 122줄 → 5줄 (-117줄)

### 2.5 테스트 가능성 평가

#### ✅ 우수: sequential-task-processor

**검증 기준:**
```markdown
## Gate Validation (라인 111-114)
- [ ] Required output present
- [ ] Output quality sufficient
- [ ] Consistency with previous steps
- [ ] Ready for next step

## Retry Policy
- Max retries: 3
- Backoff: exponential (2s, 4s, 8s)
```

**Mock Point:**
- Step output artifacts (JSON, code files 등)
- Gate pass/fail status (boolean)

**측정 가능성:** ✅ 각 항목이 명확하게 검증 가능

#### ❌ 불량: agent-workflow-orchestrator

**현재 상태:**
```markdown
## Success Metrics (라인 717-721)
- All 3 services independently deployable  // ❓ 어떻게 검증?
- Integration tests passing                // ❓ 몇 개? 커버리지?
- No direct database sharing               // ❓ 어떻게 확인?
```

**문제:**
- 추상적 기준만 나열
- 측정 방법 없음
- Pass/Fail 판단 불가능

**개선 필요:**
```markdown
## 검증 기준 (개선안)
### 성공 조건
- [ ] 각 서비스가 독립 Docker 컨테이너로 실행 가능
      → 검증: `docker-compose up` 성공
- [ ] 통합 테스트 최소 10개 작성
      → 검증: `npm test` 커버리지 80% 이상
- [ ] 서비스 간 API 호출만 사용 (직접 DB 접근 금지)
      → 검증: import 분석 스크립트 실행

### Mock Point
- Input: 프로젝트 구조 JSON
- Output:
  {
    "services": ["auth", "api", "worker"],
    "test_coverage": 85,
    "architecture_violations": []
  }
```

#### 📊 테스트 가능성 점수

| 스킬 | 점수 | 상태 | 개선 필요 사항 |
|------|------|------|---------------|
| sequential-task-processor | 9/10 | ✅ 우수 | - |
| intelligent-task-router | 8/10 | ✅ 양호 | Confidence threshold 설명 보강 |
| parallel-task-executor | 6/10 | ⚠️ 보통 | Merge conflict 해결 기준 추가 |
| dynamic-task-orchestrator | 5/10 | ⚠️ 보통 | Worker 성공 기준 명시 |
| agent-workflow-manager | 3/10 | ❌ 불량 | 완료 기준, 타임아웃, 재시도 수치화 |
| agent-workflow-advisor | 2/10 | ❌ 불량 | 추천 품질 평가 기준 없음 |
| agent-workflow-orchestrator | 2/10 | ❌ 불량 | 모든 메트릭 측정 방법 필요 |

---

## 🔍 Phase 3: 명확성 및 사용성 분석

### 3.1 진입점 혼란 문제

**사용자 관점 시나리오:**
```
사용자: "복잡한 프로젝트를 자동으로 처리하고 싶어요"

❓ 어떤 것을 사용해야 할까요?
1. /auto-workflow              → agent-workflow-manager 호출
2. /workflow-complex           → dynamic-task-orchestrator 호출
3. Skill: agent-workflow-orchestrator
4. Skill: dynamic-task-orchestrator

→ 4개 옵션이 모두 "복잡한 작업"을 다룸. 차이점 불명확!
```

**현재 문제:**
| 도구 | 설명 | 겹치는 부분 |
|------|------|------------|
| `/auto-workflow` | "자동으로 최적 워크플로우 실행" | ← |
| `agent-workflow-orchestrator` | "자동화 파이프라인으로 결합" | ← 겹침 |
| `agent-workflow-manager` | "자동 조율" | ← |
| `dynamic-task-orchestrator` | "복잡한 프로젝트" | ← |
| `/workflow-complex` | "복잡한 프로젝트" | ← 겹침 |

**개선 방안:**

#### 명확한 계층 구조 정의

```
레벨 1 (사용자 진입점) - 커맨드
├─ /auto-workflow              ← "모르겠으면 이거 사용" (추천 + 자동 선택)
├─ /workflow-simple            ← "단순 작업" (명시적 선택)
├─ /workflow-parallel          ← "독립 작업들" (명시적 선택)
└─ /workflow-complex           ← "복잡한 프로젝트" (명시적 선택)

레벨 2 (내부 조율자) - 스킬
├─ agent-workflow-manager      ← 커맨드들이 내부적으로 호출
└─ agent-workflow-advisor      ← Manager가 내부적으로 호출

레벨 3 (실행 엔진) - 스킬
├─ intelligent-task-router     ← Manager가 호출
├─ sequential-task-processor
├─ parallel-task-executor
└─ dynamic-task-orchestrator

레벨 4 (고급 기능) - 스킬
└─ agent-workflow-orchestrator ← 고급 사용자만 직접 호출
```

**문서화 개선:**
```markdown
## 어떤 것을 사용해야 하나요?

### 일반 사용자
→ `/auto-workflow`만 사용하세요. 나머지는 자동으로 처리됩니다.

### 명시적 제어가 필요한 경우
- 단순 작업 (5단계 이하): `/workflow-simple`
- 병렬 작업 (독립적): `/workflow-parallel`
- 복잡한 프로젝트 (10+ 파일): `/workflow-complex`

### 고급 사용자 (스킬 직접 호출)
- `agent-workflow-orchestrator`: Phase별 수동 제어 필요 시
- 기타 스킬: **직접 호출 권장하지 않음** (커맨드 사용)
```

### 3.2 "When to Use" 섹션 개선

#### ❌ 불명확한 예시 (agent-workflow-orchestrator)

**현재:**
```markdown
## When to Use
- Complex Projects        ← ❓ 복잡하다는 기준?
- Large-scale Features    ← ❓ 규모의 정의?
- Uncertain Requirements  ← ❓ 불확실하다는 정도?
```

**개선안:**
```markdown
## When to Use This Skill

### 정량적 기준 (하나라도 해당하면 사용)
- [ ] 10개 이상 파일 생성/수정
- [ ] 3개 이상 독립 컴포넌트/서비스
- [ ] 5개 이상 기술 스택 (Frontend, Backend, DB, Cache, Queue 등)
- [ ] 예상 작업 시간 4시간 이상

### 구체적 사용 사례
1. **마이크로서비스 아키텍처 구축**
   - 3개 이상 서비스
   - API Gateway, Service Mesh
   - 각 서비스 독립 배포

2. **Full-stack 애플리케이션**
   - React 프론트엔드 (20+ 컴포넌트)
   - Node.js/Express 백엔드 (10+ 엔드포인트)
   - PostgreSQL 스키마 (5+ 테이블)
   - Redis 캐싱

3. **레거시 시스템 마이그레이션**
   - 기존 코드베이스 분석
   - 점진적 리팩토링
   - 테스트 커버리지 확보

### Anti-Patterns (사용하지 마세요)
- ❌ 단일 파일 버그 수정
- ❌ 설정 파일 수정
- ❌ 문서 작성만
```

### 3.3 프롬프트 품질: 명령형 vs 설명형

#### ✅ 우수: sequential-task-processor (명령형)

**예시:**
```markdown
## Step [N]: [Step Name]

### Input from Previous Step
[Summarize the key outputs from Step N-1]

### Processing
**DO:**
1. Read the input from previous step
2. Apply the following transformation: [...]
3. Generate output in this format: {...}

**DON'T:**
- Skip validation
- Proceed if dependencies missing

### Output
**Format:** JSON
**Required Fields:** [...]
**Example:**
{
  "field": "value"
}

### Gate Validation
- [ ] Output contains all required fields
- [ ] Values are within valid ranges
- [ ] Consistency check passed
```

**장점:**
- 명확한 행동 지시 (DO/DON'T)
- 구조화된 입출력
- 검증 가능한 체크리스트

#### ❌ 불량: agent-workflow-orchestrator (설명형)

**예시:**
```markdown
## Phase 3: Dynamic Composition

The orchestrator analyzes the project and dynamically constructs
a workflow by combining patterns based on discovered requirements.

[Task Analysis] → Complexity, Structure, Dependencies
     ↓
[Pattern Selection] → Choose optimal pattern
     ↓
[Pipeline Construction] → Combine patterns
```

**문제:**
- 추상적 설명만 있음
- "어떻게" 분석하는지 불명확
- 실행 가능한 지침 없음
- ASCII 다이어그램은 시각적이지만 액션이 없음

**개선안:**
```markdown
## Phase 3: Dynamic Composition

### Step 1: Analyze Project Structure
**DO:**
1. List all files in project: `ls -R`
2. Count files by type:
   - Frontend: `find . -name "*.tsx" | wc -l`
   - Backend: `find . -name "*.ts" | grep -v ".tsx" | wc -l`
   - Tests: `find . -name "*.test.ts" | wc -l`

3. Calculate complexity score:
   ```python
   complexity = (frontend_files * 0.3 +
                 backend_files * 0.5 +
                 test_files * 0.2) / 100
   ```

**Output:**
{
  "frontend_files": 45,
  "backend_files": 23,
  "test_files": 12,
  "complexity_score": 0.68
}

### Step 2: Select Pattern
**IF** complexity < 0.3 → Sequential
**ELSE IF** complexity < 0.7 AND independent_modules → Parallel
**ELSE** → Orchestrator

**DON'T:**
- Use Orchestrator for simple tasks (complexity < 0.3)
- Force Parallel if dependencies exist
```

---

## 💡 Phase 4: 리팩토링 전략

### 4.1 아키텍처 재설계

#### 현재 아키텍처 문제점

```
[사용자]
   ↓
[7개 스킬 + 4개 커맨드 + 1개 에이전트]  ← 진입점 과다
   ↓
[중복된 로직: 복잡도 분석, 카테고리 분류, 패턴 선택]  ← DRY 위반
   ↓
[integration.py × 4개]  ← 코드 중복
   ↓
[외부 의존성: message_protocol, utils]  ← 하드코딩
```

#### 목표 아키텍처 (리팩토링 후)

```
┌─────────────────────────────────────────────────┐
│            사용자 진입점 (레이어 1)              │
├─────────────────────────────────────────────────┤
│ /auto-workflow  (자동 모드)                      │
│ /workflow-{simple|parallel|complex} (수동 선택)  │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│         코어 엔진 (레이어 2) - 새로 설계          │
├─────────────────────────────────────────────────┤
│ WorkflowEngine                                   │
│ ├─ ComplexityAnalyzer      (공유 모듈)          │
│ ├─ TaskClassifier          (8개 카테고리)       │
│ ├─ PatternSelector         (결정 로직)          │
│ └─ QualityValidator        (검증)               │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│      실행 패턴 (레이어 3) - 리팩토링             │
├─────────────────────────────────────────────────┤
│ SequentialPattern (기존 유지)                    │
│ ParallelPattern   (Sectioning/Voting 분리)      │
│ OrchestratorPattern (6개 워커)                   │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│        공유 라이브러리 (레이어 4) - 신규          │
├─────────────────────────────────────────────────┤
│ lib/integration_base.py                          │
│ lib/message_queue.py                             │
│ lib/config_loader.py                             │
│ lib/path_resolver.py                             │
└─────────────────────────────────────────────────┘
```

### 4.2 스킬 분해 전략

#### Case 1: agent-workflow-advisor (831줄 → 350줄)

**분해 방식:**
```
agent-workflow-advisor/
├── SKILL.md (350줄)
│   ├── Overview (50줄)
│   ├── Quick Start (80줄)
│   │   ├── Decision Tree (간소화 - 표 형식)
│   │   └── 3가지 주요 시나리오
│   ├── How It Works (100줄)
│   │   ├── Analysis Process
│   │   └── Recommendation Logic
│   ├── Integration (60줄)
│   └── See Also (60줄)
│       ├── → resources/common-patterns.md
│       ├── → resources/advanced-scenarios.md
│       └── → examples/
│
└── resources/
    ├── common-patterns.md (100줄)
    │   ├── Pattern 1: Simple Sequential
    │   ├── Pattern 2: Independent Parallel
    │   └── Pattern 3: Complex Orchestration
    │
    ├── advanced-scenarios.md (150줄)
    │   ├── Mixed Dependencies
    │   ├── Partial Knowledge
    │   ├── External Changes
    │   └── Unclear Quality Criteria
    │
    ├── decision-tree.md (80줄)
    │   └── [상세 ASCII 트리 + 설명]
    │
    └── examples/
        ├── simple-task.md (50줄)
        ├── microservices-migration.md (105줄)  ← 기존 Complete Example
        └── pattern-combinations.md (80줄)
```

**마이그레이션 스크립트:**
```bash
# scripts/refactor-advisor.sh
#!/bin/bash

SKILL_DIR="plugins/workflow-automation/skills/agent-workflow-advisor"
RESOURCES_DIR="$SKILL_DIR/resources"
EXAMPLES_DIR="$RESOURCES_DIR/examples"

mkdir -p "$RESOURCES_DIR" "$EXAMPLES_DIR"

# Extract sections from SKILL.md
sed -n '/## Common Scenarios/,/## Advanced Scenarios/p' "$SKILL_DIR/SKILL.md" > "$RESOURCES_DIR/common-patterns.md"
sed -n '/## Advanced Scenarios/,/## Complete Analysis Example/p' "$SKILL_DIR/SKILL.md" > "$RESOURCES_DIR/advanced-scenarios.md"
sed -n '/## Complete Analysis Example/,$p' "$SKILL_DIR/SKILL.md" > "$EXAMPLES_DIR/microservices-migration.md"

# Rebuild SKILL.md (manual editing required)
echo "✅ Extracted to resources/. Now edit SKILL.md to add references."
```

#### Case 2: agent-workflow-orchestrator (825줄 → 삭제 고려)

**문제 분석:**
- Phase 1: 이미 `agent-workflow-advisor` 스킬로 존재 (중복)
- Phase 2: 이미 4개 커맨드(`/workflow-*`)로 구현됨 (중복)
- Phase 3-4: 실현 불가능 (Claude 재귀 호출 제약, 완전 자동화 불가)

**제안: 완전 삭제**

**근거:**
1. **중복 제거:** Advisor + Manager 조합으로 모든 기능 커버
2. **YAGNI:** Phase 3-4는 현재도 미래에도 필요 없음
3. **혼란 감소:** 사용자가 선택해야 할 옵션 1개 감소

**마이그레이션 경로:**
```
agent-workflow-orchestrator 사용자 → agent-workflow-manager로 유도
- README에 Deprecation 노트 추가
- skill-rules.json에서 등록 해제
- 파일은 보관 (docs/archive/)
```

#### Case 3: parallel-task-executor (602줄 → 2개 스킬 분리)

**현재 문제:**
- Sectioning 모드 (300줄)
- Voting 모드 (300줄)
- 두 모드가 완전히 독립적이지만 하나의 스킬에 혼재

**분리 방안:**

**Option A: 모드별 분리 (권장)**
```
parallel-task-executor/           (삭제)
  → parallel-sectioning/          (300줄) - 독립 작업 병렬 실행
  → parallel-voting/              (300줄) - 다양한 접근법 평가
```

**Option B: 통합 유지 + 리소스 분리**
```
parallel-task-executor/
├── SKILL.md (400줄)
│   ├── Overview (80줄)
│   ├── Mode Selection (100줄)  ← 어떤 모드 선택?
│   ├── → See resources/sectioning-mode.md
│   └── → See resources/voting-mode.md
└── resources/
    ├── sectioning-mode.md (150줄)
    └── voting-mode.md (150줄)
```

**권장: Option A (분리)**

**근거:**
- Sectioning과 Voting은 사용 사례가 완전히 다름
- 사용자는 둘 중 하나만 필요
- 500줄 제한 확실히 준수 (각 300줄)

### 4.3 공유 라이브러리 설계

#### lib/complexity_analyzer.py

**목적:** 복잡도 분석 로직 단일화

**현재 상태:**
- `intelligent-task-router`: 복잡도 계산 (라인 134-159)
- `agent-workflow-advisor`: 동일 로직 중복 (라인 338-367)
- `agent-workflow-manager`: 암묵적 사용

**통합 설계:**
```python
# lib/complexity_analyzer.py

class ComplexityAnalyzer:
    """작업 복잡도 분석 (0.0-1.0 점수)"""

    THRESHOLDS = {
        "simple": 0.3,      # < 0.3: Sequential
        "moderate": 0.7     # 0.3-0.7: Parallel, >= 0.7: Orchestrator
    }

    def analyze(self, task_description: str) -> dict:
        """
        복잡도 분석 수행

        Returns:
            {
                "score": 0.68,
                "category": "moderate",
                "recommended_pattern": "parallel",
                "factors": {
                    "file_count": 15,
                    "service_count": 3,
                    "tech_stack_diversity": 0.8
                }
            }
        """
        factors = self._extract_factors(task_description)
        score = self._calculate_score(factors)
        category = self._categorize(score)
        pattern = self._recommend_pattern(score, factors)

        return {
            "score": score,
            "category": category,
            "recommended_pattern": pattern,
            "factors": factors
        }

    def _extract_factors(self, description: str) -> dict:
        """키워드 기반 요소 추출"""
        file_count = self._estimate_files(description)
        service_count = self._count_services(description)
        tech_diversity = self._measure_tech_stack(description)

        return {
            "file_count": file_count,
            "service_count": service_count,
            "tech_stack_diversity": tech_diversity,
            "has_database": "database" in description.lower(),
            "has_auth": any(kw in description.lower()
                          for kw in ["auth", "login", "user"]),
        }

    def _calculate_score(self, factors: dict) -> float:
        """가중치 기반 점수 계산"""
        score = 0.0
        score += min(factors["file_count"] / 30, 0.3)  # Max 0.3
        score += min(factors["service_count"] / 5, 0.3)  # Max 0.3
        score += factors["tech_stack_diversity"] * 0.2  # Max 0.2
        score += 0.1 if factors["has_database"] else 0
        score += 0.1 if factors["has_auth"] else 0
        return min(score, 1.0)

    def _categorize(self, score: float) -> str:
        """점수를 카테고리로 변환"""
        if score < self.THRESHOLDS["simple"]:
            return "simple"
        elif score < self.THRESHOLDS["moderate"]:
            return "moderate"
        else:
            return "complex"

    def _recommend_pattern(self, score: float, factors: dict) -> str:
        """패턴 추천"""
        if score < 0.3:
            return "sequential"
        elif score < 0.7:
            # 독립성 검사
            if self._is_independent(factors):
                return "parallel"
            else:
                return "sequential"
        else:
            return "orchestrator"
```

**사용 예시:**
```python
# intelligent-task-router/SKILL.md
from lib.complexity_analyzer import ComplexityAnalyzer

analyzer = ComplexityAnalyzer()
result = analyzer.analyze(task_description)

if result["recommended_pattern"] == "sequential":
    # Call sequential-task-processor
elif result["recommended_pattern"] == "parallel":
    # Call parallel-task-executor
else:
    # Call dynamic-task-orchestrator
```

#### lib/integration_base.py

**목적:** integration.py 중복 제거

**현재 중복:**
- `dynamic-task-orchestrator/integration.py` (89줄)
- `intelligent-task-router/integration.py` (76줄)
- `parallel-task-executor/integration.py` (82줄)
- `sequential-task-processor/integration.py` (71줄)

**통합 설계:**
```python
# lib/integration_base.py

from pathlib import Path
import sys
import logging
from typing import Optional

class BaseIntegration:
    """모든 스킬이 상속할 기본 Integration 클래스"""

    def __init__(self, skill_name: str):
        self.skill_name = skill_name
        self.logger = self._setup_logger()
        self.queue = self._init_message_queue()

    def _setup_logger(self) -> logging.Logger:
        """로거 초기화"""
        logger = logging.getLogger(self.skill_name)
        logger.setLevel(logging.INFO)

        handler = logging.FileHandler(
            Path(__file__).parent.parent / "logs" / f"{self.skill_name}.log"
        )
        handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
        logger.addHandler(handler)

        return logger

    def _init_message_queue(self) -> 'MessageQueue':
        """메시지 큐 초기화 (if needed)"""
        from lib.message_queue import MessageQueue
        return MessageQueue(self.skill_name)

    def send_message(self, target: str, action: str, data: dict):
        """다른 스킬에 메시지 전송"""
        self.queue.send(target, action, data)
        self.logger.info(f"Sent {action} to {target}")

    def receive_messages(self) -> list:
        """메시지 수신"""
        messages = self.queue.receive(self.skill_name)
        self.logger.info(f"Received {len(messages)} messages")
        return messages
```

**사용 예시:**
```python
# intelligent-task-router/integration.py (리팩토링 후)

from lib.integration_base import BaseIntegration

class RouterIntegration(BaseIntegration):
    """Router 전용 통합 로직"""

    def __init__(self):
        super().__init__("intelligent-task-router")

    def route_task(self, task_desc: str) -> str:
        """작업 라우팅"""
        from lib.complexity_analyzer import ComplexityAnalyzer

        analyzer = ComplexityAnalyzer()
        result = analyzer.analyze(task_desc)

        pattern = result["recommended_pattern"]
        self.send_message(f"{pattern}-task-processor", "execute", {
            "task": task_desc,
            "complexity": result["score"]
        })

        return pattern

# 기존 89줄 → 20줄로 감소 (69줄 제거)
```

### 4.4 우선순위별 실행 계획

#### Phase 1: Critical (1주차)

**목표:** 500줄 제한 준수 + 중복 제거

| 작업 | 파일 | 예상 시간 | 담당 |
|------|------|----------|------|
| advisor 리팩토링 | agent-workflow-advisor/ | 4시간 | - |
| orchestrator 삭제 검토 | agent-workflow-orchestrator/ | 2시간 | - |
| 공유 라이브러리 생성 | lib/ | 4시간 | - |
| integration.py 통합 | 4개 파일 | 3시간 | - |
| parallel 분리 검토 | parallel-task-executor/ | 2시간 | - |
| **소계** | | **15시간** | |

**완료 기준:**
- [ ] 모든 SKILL.md 500줄 이하
- [ ] lib/ 디렉토리 생성 완료
- [ ] integration.py 중복 제거
- [ ] 테스트 통과

#### Phase 2: High (2주차)

**목표:** 명확성 개선 + 테스트 가능성

| 작업 | 내용 | 예상 시간 |
|------|------|----------|
| "When to Use" 구체화 | 7개 스킬 | 5시간 |
| 검증 기준 추가 | 5개 스킬 | 4시간 |
| 진입점 문서 개선 | README, 커맨드 | 2시간 |
| 예제 실행 가능성 검증 | examples/ | 3시간 |
| **소계** | | **14시간** |

**완료 기준:**
- [ ] 모든 "When to Use"에 정량적 기준
- [ ] 모든 스킬에 검증 기준
- [ ] README에 명확한 진입점 가이드
- [ ] 예제 코드 실행 성공

#### Phase 3: Medium (3주차)

**목표:** 공통 리소스 분리 + 문서 통합

| 작업 | 내용 | 예상 시간 |
|------|------|----------|
| anthropic-patterns-reference.md | 공통 참조 | 2시간 |
| integration-protocol.md | 스킬 간 통합 | 2시간 |
| when-to-use-guide.md | 패턴 선택 가이드 | 2시간 |
| 각 SKILL.md 링크 수정 | 7개 파일 | 2시간 |
| **소계** | | **8시간** |

**완료 기준:**
- [ ] resources/ 공통 문서 3개
- [ ] 각 SKILL.md 20-30줄 추가 감소
- [ ] 문서 링크 유효성 검증

#### Phase 4: Low (4주차)

**목표:** 품질 향상 + 테스트

| 작업 | 내용 | 예상 시간 |
|------|------|----------|
| 단위 테스트 작성 | lib/ 모듈 | 6시간 |
| 통합 테스트 | 워크플로우 | 4시간 |
| 성능 벤치마크 | ComplexityAnalyzer | 2시간 |
| 최종 문서 검토 | 전체 | 2시간 |
| **소계** | | **14시간** |

**완료 기준:**
- [ ] lib/ 모듈 테스트 커버리지 80%+
- [ ] E2E 테스트 5개 작성
- [ ] 벤치마크 결과 문서화
- [ ] 모든 링크 유효성 확인

**총 예상 작업량: 51시간 (약 6-7 작업일)**

---

## 📋 리팩토링 체크리스트

### 사전 준비

- [ ] 현재 상태 백업 생성
  ```bash
  cp -r plugins/workflow-automation plugins/workflow-automation.backup
  ```
- [ ] Git branch 생성
  ```bash
  git checkout -b refactor/workflow-automation-v2
  ```
- [ ] 테스트 환경 구축
- [ ] 기존 사용자 영향도 분석

### Phase 1 체크리스트

- [ ] `lib/` 디렉토리 생성
- [ ] `lib/complexity_analyzer.py` 구현
- [ ] `lib/integration_base.py` 구현
- [ ] `lib/message_queue.py` 구현
- [ ] `lib/path_resolver.py` 구현
- [ ] `agent-workflow-advisor` 리팩토링 (831 → 350줄)
- [ ] `agent-workflow-orchestrator` 삭제/보관 결정
- [ ] `parallel-task-executor` 분리 결정
- [ ] 4개 `integration.py` 통합
- [ ] 단위 테스트 작성 (lib/ 모듈)
- [ ] 500줄 제한 검증 스크립트 실행

### Phase 2 체크리스트

- [ ] 7개 스킬 "When to Use" 구체화
- [ ] 5개 스킬 검증 기준 추가
- [ ] README.md 진입점 가이드 추가
- [ ] 커맨드 설명 개선 (4개)
- [ ] Bash 스크립트 예제 검증/삭제
- [ ] 실행 가능한 예제로 교체
- [ ] 문서 링크 유효성 검증

### Phase 3 체크리스트

- [ ] `resources/anthropic-patterns-reference.md` 작성
- [ ] `resources/integration-protocol.md` 작성
- [ ] `resources/when-to-use-guide.md` 작성
- [ ] 각 SKILL.md에 리소스 링크 추가
- [ ] 중복 섹션 제거 (7개 스킬)
- [ ] 전체 라인 수 재측정

### Phase 4 체크리스트

- [ ] E2E 테스트 작성 (5개)
- [ ] 성능 벤치마크 실행
- [ ] 문서 최종 검토
- [ ] 마이그레이션 가이드 작성
- [ ] Changelog 작성
- [ ] 버전 태그 업데이트

---

## 🎯 성공 기준 (Definition of Done)

### 정량적 목표

| 메트릭 | 현재 | 목표 | 측정 방법 |
|--------|------|------|----------|
| **500줄 제한 준수** | 1/7 (14%) | 7/7 (100%) | `wc -l */SKILL.md` |
| **코드 중복** | ~120줄 | 0줄 | 수동 검토 |
| **테스트 커버리지** | 0% | 80%+ | pytest --cov |
| **문서 링크 유효성** | 불명 | 100% | markdown-link-check |
| **실행 가능 예제** | 50% | 100% | 수동 실행 테스트 |

### 정성적 목표

- [ ] 사용자가 5분 안에 적절한 도구 선택 가능
- [ ] 모든 스킬에 측정 가능한 검증 기준 존재
- [ ] 공유 로직이 단일 위치에 존재 (DRY)
- [ ] 과도한 추상화 제거 (KISS/YAGNI)
- [ ] Breaking Change 문서화

### 사용자 피드백 기준

리팩토링 후 3명의 사용자에게 테스트 요청:

**Task 1: "복잡한 프로젝트 시작하기"**
- [ ] 어떤 커맨드/스킬을 사용해야 하는지 5분 내 파악
- [ ] 추천된 도구로 작업 성공적으로 완료

**Task 2: "병렬 작업 실행하기"**
- [ ] Sectioning vs Voting 차이 이해
- [ ] 적절한 모드 선택 및 실행

**Task 3: "워크플로우 커스터마이징"**
- [ ] 복잡도 분석 로직 이해
- [ ] 필요시 임계값 조정 방법 파악

---

## 📝 부록

### A. 파일 크기 상세 목록

```bash
# 현재 상태 (2025-11-26)
831줄  agent-workflow-advisor/SKILL.md
825줄  agent-workflow-orchestrator/SKILL.md
703줄  dynamic-task-orchestrator/SKILL.md
602줄  parallel-task-executor/SKILL.md
548줄  sequential-task-processor/SKILL.md
502줄  intelligent-task-router/SKILL.md
469줄  agent-workflow-manager/SKILL.md
```

### B. 중복 코드 위치

**1. Anthropic 패턴 설명 (7곳 반복)**
- agent-workflow-advisor: 12-23줄
- agent-workflow-orchestrator: 10-24줄
- dynamic-task-orchestrator: 9-22줄
- intelligent-task-router: 9-20줄
- parallel-task-executor: 9-22줄
- sequential-task-processor: 9-20줄
- agent-workflow-manager: 11-22줄

**2. integration.py (4곳 중복)**
- dynamic-task-orchestrator/integration.py: 1-89줄
- intelligent-task-router/integration.py: 1-76줄
- parallel-task-executor/integration.py: 1-82줄
- sequential-task-processor/integration.py: 1-71줄

**3. 복잡도 분석 로직**
- intelligent-task-router: 134-159줄
- agent-workflow-advisor: 338-367줄

### C. 관련 문서

- [Anthropic Agent Patterns](https://www.anthropic.com/engineering/building-effective-agents)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Agent Skills Guide](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [프로젝트 CLAUDE.md](../../CLAUDE.md)
- [Skill Development Guide](../../docs/SKILL-DEVELOPMENT-GUIDE.md)

---

## 🚀 다음 단계

1. **이 보고서 검토** (30분)
   - 팀 리뷰
   - 우선순위 합의
   - Breaking Change 승인

2. **Phase 1 킥오프** (1주차 시작)
   - Git branch 생성
   - lib/ 디렉토리 구축
   - advisor 리팩토링 착수

3. **주간 체크포인트**
   - 매주 금요일 진행 상황 점검
   - 블로커 해결
   - 다음 주 계획 조정

4. **4주 후 최종 검토**
   - 모든 체크리스트 완료 확인
   - 사용자 피드백 수집
   - v2.0.0 릴리스 결정

---

**분석 완료일:** 2025-11-26
**다음 리뷰:** Phase 1 완료 후 (예상 1주 후)