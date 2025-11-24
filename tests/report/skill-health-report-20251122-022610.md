# 스킬 건강도 진단 리포트

**진단 일시**: 2025-11-22 02:26:10
**진단 도구**: skill-maintainer 에이전트
**진단 방식**: 5개씩 병렬 처리 (5라운드)
**총 스킬 수**: 24개

---

## 📊 종합 요약

### 상태별 분포

| 상태 | 개수 | 비율 | 설명 |
|------|------|------|------|
| ✅ 건강함 | 5개 | 21% | 모든 기준 충족 |
| ⚠️ 주의 필요 | 10개 | 42% | Description 과다 또는 500줄 근접 |
| 🚨 수정 필요 | 8개 | 33% | 500줄 초과 (즉시 리팩토링 필요) |
| ❌ 구조 문제 | 1개 | 4% | SKILL.md 누락 |

### 핵심 지표

- **평균 라인 수**: 492줄
- **중앙값**: 469줄
- **500줄 초과 스킬**: 9개 (38%)
- **총 초과 라인**: 1,281줄
- **Description 200자+ 스킬**: 15개 (63%)

---

## 🚨 Critical 이슈 (즉시 조치 필요)

### 1. 500줄 초과 스킬 (9개)

#### P0 - 최우선 (이번 주 내)

| 순위 | 스킬 | 라인 수 | 초과 | 추가 문제 | 파일 경로 |
|------|------|---------|------|---------|----------|
| 1 | agent-workflow-advisor | 831줄 | +331줄 | Description 321자 | `plugins/workflow-automation/skills/agent-workflow-advisor/SKILL.md` |
| 2 | agent-workflow-orchestrator | 825줄 | +325줄 | skill-rules.json 미등록, Description 325자 | `plugins/workflow-automation/skills/agent-workflow-orchestrator/SKILL.md` |

**agent-workflow-orchestrator 추가 조치**:
- [ ] skill-rules.json 등록 여부 결정 (CLAUDE.md에 "의도적 미등록" 기록)
- [ ] 등록 시 키워드: orchestrate, complex workflow, pattern selection 등

#### P1 - 단기 (이번 달 내)

| 순위 | 스킬 | 라인 수 | 초과 | 파일 경로 |
|------|------|---------|------|----------|
| 3 | dynamic-task-orchestrator | 703줄 | +203줄 | `plugins/workflow-automation/skills/dynamic-task-orchestrator/SKILL.md` |
| 4 | iterative-quality-enhancer | 643줄 | +143줄 | `plugins/quality-review/skills/iterative-quality-enhancer/SKILL.md` |
| 5 | command-creator | 607줄 | +107줄 | `plugins/tool-creators/skills/command-creator/SKILL.md` |
| 6 | parallel-task-executor | 602줄 | +102줄 | `plugins/workflow-automation/skills/parallel-task-executor/SKILL.md` |

#### P2 - 중기 (다음 달)

| 순위 | 스킬 | 라인 수 | 초과 | 파일 경로 |
|------|------|---------|------|----------|
| 7 | sequential-task-processor | 548줄 | +48줄 | `plugins/workflow-automation/skills/sequential-task-processor/SKILL.md` |
| 8 | skill-generator-tool | 520줄 | +20줄 | `plugins/tool-creators/skills/skill-generator-tool/SKILL.md` |

#### P3 - 낮음 (간단 수정)

| 순위 | 스킬 | 라인 수 | 초과 | 파일 경로 |
|------|------|---------|------|----------|
| 9 | intelligent-task-router | 502줄 | +2줄 | `plugins/workflow-automation/skills/intelligent-task-router/SKILL.md` |

### 2. skill-rules.json 미등록 (2개)

#### 1. agent-workflow-orchestrator
- **파일**: `plugins/workflow-automation/skills/skill-rules.json`
- **상태**: 미등록
- **CLAUDE.md 기록**: "의도적 미등록 (agent-workflow-manager로 충분)"
- **권장**: 정책 재확인 후 등록 여부 결정

**등록 시 제안 설정**:
```json
{
  "agent-workflow-orchestrator": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "promptTriggers": {
      "keywords": [
        "orchestrate",
        "complex workflow",
        "multiple patterns",
        "pattern selection",
        "automated execution",
        "quality enforcement",
        "task coordination"
      ],
      "intentPatterns": [
        "complex.*project.*workflow",
        "end.*to.*end.*automation",
        "quality.*gate",
        "pattern.*selection"
      ]
    }
  }
}
```

#### 2. cli-adapters
- **파일**: `plugins/ai-integration/skills/cli-adapters/`
- **문제**: 루트 SKILL.md 없음 (구조적 문제)
- **구조**: 하위 어댑터(codex, qwen, aider 등)별 개별 SKILL.md 존재
- **권장**:
  - Option A: 메타 SKILL.md 생성 (모든 어댑터 개요)
  - Option B: 하위 어댑터들을 개별 스킬로 승격

---

## ⚠️ Warning 이슈 (개선 권장)

### 1. Description 과다 (15개)

**200자 이상 스킬** (권장: 30-100자):

| 스킬 | 현재 길이 | 파일 경로 |
|------|----------|----------|
| backend-dev-guidelines | 507자 | `plugins/dev-guidelines/skills/backend-dev-guidelines/SKILL.md` |
| iterative-quality-enhancer | 365자 | `plugins/quality-review/skills/iterative-quality-enhancer/SKILL.md` |
| dynamic-task-orchestrator | 326자 | `plugins/workflow-automation/skills/dynamic-task-orchestrator/SKILL.md` |
| agent-workflow-orchestrator | 325자 | `plugins/workflow-automation/skills/agent-workflow-orchestrator/SKILL.md` |
| agent-workflow-advisor | 321자 | `plugins/workflow-automation/skills/agent-workflow-advisor/SKILL.md` |
| skill-generator-tool | 309자 | `plugins/tool-creators/skills/skill-generator-tool/SKILL.md` |
| sequential-task-processor | 301자 | `plugins/workflow-automation/skills/sequential-task-processor/SKILL.md` |
| parallel-task-executor | 299자 | `plugins/workflow-automation/skills/parallel-task-executor/SKILL.md` |
| intelligent-task-router | 294자 | `plugins/workflow-automation/skills/intelligent-task-router/SKILL.md` |
| command-creator | 288자 | `plugins/tool-creators/skills/command-creator/SKILL.md` |
| hooks-creator | 288자 | `plugins/tool-creators/skills/hooks-creator/SKILL.md` |
| subagent-creator | 275자 | `plugins/tool-creators/skills/subagent-creator/SKILL.md` |
| prompt-enhancer | 267자 | `plugins/prompt-enhancement/skills/prompt-enhancer/SKILL.md` |
| error-tracking | 264자 | `plugins/dev-guidelines/skills/error-tracking/SKILL.md` |
| route-tester | 263자 | `plugins/utilities/skills/route-tester/SKILL.md` |

**개선 예시** (backend-dev-guidelines):
```markdown
# 현재 (507자):
description: Comprehensive backend development guide for Node.js/Express/TypeScript microservices. Use when creating routes, controllers, services, repositories, middleware, or working with Express APIs, Prisma database access, Sentry error tracking, Zod validation, unifiedConfig, dependency injection, or async patterns. Covers layered architecture (routes → controllers → services → repositories), BaseController pattern, error handling, performance monitoring, testing strategies, and migration from legacy patterns.

# 권장 (80자):
description: Node.js/Express 백엔드 개발 패턴: 레이어 아키텍처, BaseController, 에러 처리, Sentry 추적
```

### 2. 500줄 근접 (5개)

**여유 50줄 이하**:

| 스킬 | 라인 수 | 여유 | 위험도 | 파일 경로 |
|------|---------|------|--------|----------|
| reflection-review | 485줄 | 15줄 | 높음 | `plugins/quality-review/skills/reflection-review/SKILL.md` |
| subagent-creator | 486줄 | 14줄 | 높음 | `plugins/tool-creators/skills/subagent-creator/SKILL.md` |
| agent-workflow-manager | 469줄 | 31줄 | 중간 | `plugins/workflow-automation/skills/agent-workflow-manager/SKILL.md` |
| skill-developer | 463줄 | 37줄 | 중간 | `plugins/tool-creators/skills/skill-developer/SKILL.md` |
| dual-ai-loop | 460줄 | 40줄 | 낮음 | `plugins/ai-integration/skills/dual-ai-loop/SKILL.md` |

**권장 조치**: 향후 콘텐츠 추가 시 references/ 디렉토리 활용

---

## ✅ 건강한 스킬 (5개)

완벽하게 기준을 충족하는 스킬:

### 1. meta-prompt-generator
- **라인 수**: 241줄
- **Description**: 38자 ✅
- **등록**: 완료 ✅
- **파일**: `plugins/prompt-enhancement/skills/meta-prompt-generator/SKILL.md`

### 2. skill-health-checker
- **라인 수**: 364줄
- **Description**: 68자 ✅
- **등록**: 완료 ✅
- **번들 리소스**: scripts/ + references/ ✅
- **파일**: `plugins/tool-creators/skills/skill-health-checker/SKILL.md`

### 3. cli-updater
- **라인 수**: 376줄
- **Description**: 55자 ✅
- **미등록**: 의도적 (dual-ai-loop 내부 호출용) ✅
- **파일**: `plugins/ai-integration/skills/cli-updater/SKILL.md`

### 4. dual-ai-loop
- **라인 수**: 460줄
- **Description**: 111자 ✅
- **등록**: 완료 ✅
- **주의**: 500줄 근접 (여유 40줄)
- **파일**: `plugins/ai-integration/skills/dual-ai-loop/SKILL.md`

### 5. route-tester
- **라인 수**: 388줄
- **등록**: 완료 ✅
- **주의**: Description 263자 (개선 가능)
- **파일**: `plugins/utilities/skills/route-tester/SKILL.md`

---

## 📋 우선순위별 액션 플랜

### P0 - 즉시 (이번 주)

**목표**: 가장 심각한 2개 스킬 리팩토링

- [ ] **agent-workflow-advisor** (831줄 → 450줄)
  - references/ 디렉토리 생성
  - Phase별 상세 내용 분리
  - Description 321자 → 100자 이하

- [ ] **agent-workflow-orchestrator** (825줄 → 450줄)
  - skill-rules.json 등록 정책 확인
  - references/ 디렉토리 생성
  - Worker 상세 설명 분리
  - Description 325자 → 100자 이하

**예상 효과**: 656줄 절감 (51% 해결)

### P1 - 단기 (이번 달)

**목표**: 4개 스킬 리팩토링

- [ ] **dynamic-task-orchestrator** (703줄 → 450줄)
- [ ] **iterative-quality-enhancer** (643줄 → 450줄)
- [ ] **command-creator** (607줄 → 450줄)
- [ ] **parallel-task-executor** (602줄 → 450줄)

**예상 효과**: 추가 555줄 절감

### P2 - 중기 (다음 달)

**목표**: 2개 스킬 리팩토링 + Description 일괄 수정

- [ ] **sequential-task-processor** (548줄 → 480줄)
- [ ] **skill-generator-tool** (520줄 → 480줄)
- [ ] **15개 스킬 Description 단축** (200자+ → 100자 이하)

### P3 - 장기

**목표**: 구조 개선 및 모니터링

- [ ] **intelligent-task-router** (502줄 → 495줄, 간단)
- [ ] **cli-adapters 구조 결정** (메타 SKILL.md 생성 또는 분리)
- [ ] **500줄 근접 스킬 모니터링** (5개)

---

## 📈 상세 통계

### 라인 수 분포

| 범위 | 개수 | 비율 | 스킬 목록 |
|------|------|------|---------|
| 0-300줄 | 4개 | 17% | meta-prompt-generator, cli-updater, backend-dev-guidelines, error-tracking |
| 301-400줄 | 8개 | 33% | frontend-dev-guidelines, prompt-enhancer, skill-health-checker, route-tester, cli-adapters, meta-prompt-generator, skill-developer, dual-ai-loop |
| 401-500줄 | 3개 | 13% | hooks-creator, agent-workflow-manager, reflection-review |
| 501-700줄 | 7개 | 29% | intelligent-task-router, skill-generator-tool, sequential-task-processor, parallel-task-executor, command-creator, iterative-quality-enhancer, dynamic-task-orchestrator |
| 701줄+ | 2개 | 8% | agent-workflow-advisor, agent-workflow-orchestrator |

### 플러그인별 현황

| 플러그인 | 스킬 수 | 평균 라인 | 500줄 초과 | 상태 |
|---------|--------|----------|------------|------|
| workflow-automation | 7개 | 619줄 | 6개 (86%) | 🚨 심각 |
| tool-creators | 6개 | 508줄 | 2개 (33%) | ⚠️ 주의 |
| quality-review | 2개 | 564줄 | 1개 (50%) | ⚠️ 주의 |
| dev-guidelines | 3개 | 359줄 | 0개 | ✅ 양호 |
| ai-integration | 3개 | 419줄 | 0개 | ✅ 양호 |
| prompt-enhancement | 2개 | 319줄 | 0개 | ✅ 양호 |
| utilities | 1개 | 388줄 | 0개 | ✅ 양호 |

**문제 플러그인**: workflow-automation (7개 중 6개 초과)

---

## 💡 리팩토링 패턴 가이드

### Progressive Disclosure 전략

**목표**: SKILL.md 500줄 이하, 상세 내용은 references/로 분리

#### 표준 구조

```
skills/skill-name/
├── SKILL.md (300-450줄)
│   ├── Overview
│   ├── Quick Start
│   ├── Core Workflows (요약)
│   ├── Examples (간단한 것만)
│   └── References 링크
└── references/
    ├── advanced-patterns.md
    ├── full-examples.md
    ├── api-reference.md
    └── troubleshooting.md
```

#### 분할 기준

**SKILL.md에 유지**:
- Overview (50줄)
- When to Use / When NOT to Use (50줄)
- Quick Start (100줄)
- Core Workflow 요약 (100줄)
- 간단한 예제 1-2개 (100줄)
- Best Practices 요약 (50줄)

**references/로 이동**:
- 상세 예제 (200줄+)
- API Reference (150줄+)
- 고급 패턴 (100줄+)
- Troubleshooting (80줄+)
- Configuration (60줄+)

### Description 작성 가이드

**원칙**: 한 문장, 50-100자, 핵심 기능만

**나쁜 예** (507자):
```
Comprehensive backend development guide for Node.js/Express/TypeScript microservices. Use when creating routes, controllers, services, repositories, middleware, or working with Express APIs, Prisma database access, Sentry error tracking, Zod validation, unifiedConfig, dependency injection, or async patterns. Covers layered architecture (routes → controllers → services → repositories), BaseController pattern, error handling, performance monitoring, testing strategies, and migration from legacy patterns.
```

**좋은 예** (80자):
```
Node.js/Express 백엔드 개발 패턴: 레이어 아키텍처, BaseController, 에러 처리
```

---

## 🔧 자동화 도구

### 진단 스크립트

```bash
# 전체 진단
python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_all.py

# 단일 스킬 진단
python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_skill.py <plugin>/<skill>

# 동기화 체크
python plugins/tool-creators/skills/skill-health-checker/scripts/check_sync.py --suggest

# 마크다운 리포트 생성
python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_all.py --markdown
```

### Task 에이전트 사용

```typescript
Task(
  subagent_type: "skill-maintainer",
  prompt: "Diagnose all skills and provide summary",
  description: "Full skill health check"
)
```

---

## 📅 타임라인

### Week 1 (2025-11-22 ~ 11-29)
- [ ] agent-workflow-advisor 리팩토링
- [ ] agent-workflow-orchestrator 리팩토링 + 등록 정책 확인

### Week 2-4 (2025-11-29 ~ 12-20)
- [ ] P1 스킬 4개 리팩토링
- [ ] Description 일괄 수정 (15개)

### Month 2 (2026-01)
- [ ] P2 스킬 2개 리팩토링
- [ ] cli-adapters 구조 개선
- [ ] 500줄 근접 스킬 예방 조치

---

## 📎 참고 문서

- **CLAUDE.md**: 프로젝트 아키텍처 및 정책
- **docs/SKILL-DEVELOPMENT-GUIDE.md**: 스킬 개발 가이드
- **docs/DOCUMENTATION_GUIDELINES.md**: 문서 작성 가이드
- **plugins/tool-creators/skills/skill-health-checker/SKILL.md**: 진단 도구 사용법

---

**리포트 생성**: skill-maintainer 에이전트
**다음 진단 권장**: 2주 후 (2025-12-06)
