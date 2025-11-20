# CC-Skills

Claude Code용 스킬 및 훅 컬렉션 플러그인입니다.

## 설치

```bash
# 마켓플레이스 추가
/plugin marketplace add inchan/cc-skills

# 플러그인 설치 및 활성화
/plugin install cc-skills@inchan-cc-skills
/plugin enable cc-skills@inchan-cc-skills
```

## 스킬 상세

### 워크플로우 관리

| 스킬 | 요약 | 작동 방식 |
|------|------|-----------|
| `agent-workflow-manager` | 전체 워크플로우 자동 관리 | 작업 복잡도를 분석하여 Router → Sequential/Parallel/Orchestrator → Evaluator를 자동 연결 |
| `agent-workflow-advisor` | 패턴 추천 어드바이저 | 작업을 분석하고 5가지 패턴(Router, Sequential, Parallel, Orchestrator, Evaluator) 중 최적 패턴 제안 |
| `agent-workflow-orchestrator` | 고급 오케스트레이션 | 다중 에이전트를 조율하여 복잡한 작업 흐름을 자동으로 관리 |
| `intelligent-task-router` | 작업 분류 및 라우팅 | 8개 카테고리(bug_fix, feature_development 등)로 분류 후 적합한 처리 경로로 라우팅 |
| `parallel-task-executor` | 병렬 작업 실행 | Sectioning(독립 작업 동시 실행) 또는 Voting(다중 접근 방식 평가) 모드로 2-10x 속도 향상 |
| `dynamic-task-orchestrator` | 복잡한 프로젝트 조율 | 6개 전문 워커(Code Analyzer, System Architect 등)를 동적으로 할당하여 복잡도 0.7+ 작업 처리 |
| `sequential-task-processor` | 순차 작업 처리 | 의존성이 있는 작업을 단계별로 실행하며 각 단계 결과를 다음 단계에 전달 |

### 품질 관리

| 스킬 | 요약 | 작동 방식 |
|------|------|-----------|
| `iterative-quality-enhancer` | 품질 평가 및 최적화 | 5개 차원(Functionality, Performance, Code Quality, Security, Documentation) 평가 후 최대 5회 반복 개선 |
| `code-feedback` | 코드 결과 평가 | 6개 영역(분석, 계획, 구현, 리뷰, 검증, 테스트)에서 점수화하고 P0/P1/P2 우선순위 피드백 생성 |

### 개발 가이드

| 스킬 | 요약 | 작동 방식 |
|------|------|-----------|
| `frontend-dev-guidelines` | React/TypeScript/MUI v7 | Suspense, lazy loading, useSuspenseQuery, TanStack Router 등 최신 패턴과 파일 구조 가이드 제공 |
| `backend-dev-guidelines` | Node.js/Express/Prisma | 레이어드 아키텍처(routes → controllers → services → repositories), BaseController 패턴, Zod 검증 가이드 |
| `error-tracking` | Sentry v8 패턴 | 에러 캡처, 성능 모니터링, 크론잡 계측 패턴 제공. 모든 에러는 Sentry로 캡처 필수 |

### 도구 생성

| 스킬 | 요약 | 작동 방식 |
|------|------|-----------|
| `skill-generator-tool` | 도구 타입 추천 | 사용자 요청을 분석하여 Command/Skill/Subagent/Hook 중 최적 도구 타입 추천 후 전문 생성기로 라우팅 |
| `command-creator` | 슬래시 커맨드 생성 | frontmatter 메타데이터와 프롬프트 본문을 포함한 .md 파일 생성. 검증 스크립트 포함 |
| `skill-creator` | 스킬 생성 | SKILL.md와 번들 리소스를 포함한 스킬 디렉토리 생성. 500줄 규칙 준수 |
| `subagent-creator` | 서브에이전트 생성 | 7개 템플릿(basic, researcher, implementer 등) 기반으로 전문 에이전트 생성 |
| `hooks-creator` | 훅 생성 | 6개 이벤트(PreToolUse, PostToolUse 등)에 대한 훅 스크립트 생성 |

### AI 연동

| 스킬 | 요약 | 작동 방식 |
|------|------|-----------|
| `dual-ai-loop` | 외부 AI CLI 협업 | codex, qwen, copilot, rovo-dev, aider와 Claude 간 계획-구현-리뷰 사이클 실행. 역할 교체 가능 |
| `cli-updater` | CLI 버전 업데이트 | CLI 도구 버전 변경 감지 후 어댑터 스킬 및 문서 자동 업데이트 |

### 프롬프트

| 스킬 | 요약 | 작동 방식 |
|------|------|-----------|
| `meta-prompt-generator` | 구조화된 커맨드 생성 | 간단한 설명을 받아 단계별 병렬 처리가 가능한 슬래시 커맨드 프롬프트 자동 생성 |
| `meta-prompt-generator-v2` | 프롬프트 생성 v2 | 개선된 프롬프트 생성 알고리즘 적용 |
| `prompt-enhancer` | 컨텍스트 기반 개선 | 프로젝트 구조, 의존성, 컨벤션, 기존 패턴을 분석하여 프롬프트에 컨텍스트 추가 |

### 기타

| 스킬 | 요약 | 작동 방식 |
|------|------|-----------|
| `skill-developer` | 스킬 개발 종합 가이드 | Anthropic 공식 표준에 따른 스킬 구조, YAML frontmatter, 트리거 패턴, 훅 메커니즘 가이드 |
| `route-tester` | 인증 라우트 테스트 | test-auth-route.js와 mock 인증을 사용한 API 엔드포인트 테스트 패턴 제공 |
| `web-to-markdown` | 웹페이지 변환 | 웹페이지 URL을 입력받아 마크다운으로 변환 후 로컬 파일로 저장 |

## 에이전트

| 에이전트 | 요약 | 작동 방식 |
|----------|------|-----------|
| `code-reviewer` | 코드 품질/보안 리뷰 | OWASP Top 10 보안, SOLID/DRY/KISS 원칙, 성능 최적화 관점에서 코드 검토. Critical → Low 우선순위로 피드백 |
| `architect` | 시스템 아키텍처 설계 | ADR(Architecture Decision Record) 형식으로 설계 문서화. 트레이드오프 분석 및 대안 평가 포함 |
| `workflow-orchestrator` | 워크플로우 오케스트레이션 | 작업 복잡도(0.0-1.0) 분석 후 적절한 패턴 선택하여 서브에이전트 실행 조율 |

## 훅

| 이벤트 | 스크립트 | 작동 방식 |
|--------|----------|-----------|
| UserPromptSubmit | `skill-activation-prompt.js` | skill-rules.json의 키워드/인텐트 패턴과 프롬프트를 매칭하여 적합한 스킬 제안 |
| PostToolUse | `post-tool-use-tracker.sh` | Edit/Write 도구 사용 후 변경된 파일 추적 및 캐시 관리 |
| Stop | `stop-hook-lint-and-translate.sh` | 응답 완료 후 린트 실행 및 번역 처리 |

## 워크플로우 선택 가이드

| 복잡도 | 권장 패턴 | 사용 시점 |
|--------|-----------|-----------|
| < 0.3 | `sequential-task-processor` | 단순 순차 작업, 50자 미만 프롬프트 |
| 0.3 - 0.7 | `parallel-task-executor` | 독립적인 다중 작업, "여러", "동시" 키워드 포함 |
| > 0.7 | `dynamic-task-orchestrator` | 복잡한 시스템, "전체", "아키텍처" 키워드 포함 |
| 자동 | `agent-workflow-manager` | 복잡도 판단이 어려울 때 자동 분석 |

## 사용법

플러그인 활성화 후 프롬프트를 입력하면 `UserPromptSubmit` 훅이 적합한 스킬을 자동으로 제안합니다.

```bash
# 스킬 수동 호출
/skill frontend-dev-guidelines
/skill backend-dev-guidelines
/skill agent-workflow-manager
```

## 디렉토리 구조

```
cc-skills/
├── .claude-plugin/       # 플러그인 메타데이터
│   ├── plugin.json
│   └── marketplace.json
├── .claude/
│   ├── skills/           # 스킬 컬렉션 (27개)
│   ├── commands/         # 슬래시 커맨드
│   └── hooks/            # 원본 훅 스크립트
├── agents/               # 서브에이전트 (3개)
├── hooks/                # 플러그인 훅 설정
└── scripts/              # 컴파일된 훅 스크립트
```

## 요구사항

- Claude Code CLI
- Node.js 18+

## 라이선스

MIT
