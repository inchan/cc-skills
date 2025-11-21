# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Marketplace Structure

이 프로젝트는 Claude Code 플러그인 마켓플레이스 표준 구조를 따릅니다.

### 디렉토리 구조
- `plugin/` - 빌드 결과물 (마켓플레이스 배포용, Git 제외)
- `.claude-plugin/marketplace.json` - 마켓플레이스 메타데이터

**주의**: `plugin/` 디렉토리는 빌드 스크립트로 자동 생성되며 Git에서 제외됩니다.

### 빌드 프로세스
```bash
npm run build        # 빌드 (plugin/ 생성)
npm run sync         # plugin/ → ~/.claude/plugins/marketplaces/inchan/cc-skills/
npm run publish      # 버전 업데이트 + Git 태그 + 푸시
```

### 개발 시 주의사항
- `plugin/`는 빌드 결과물이므로 직접 편집 금지
- 변경 후 반드시 `npm run build` 실행

---

## Repository Purpose

Claude Code 플러그인: 스킬(23개), 에이전트(3개), 훅(3개), 슬래시 커맨드(4개)를 제공하는 워크플로우 자동화 및 개발 가이드라인 툴킷

## Directory Structure

```
skills/               # 23 skills (SKILL.md + bundled resources)
├── skill-rules.json  # Auto-activation triggers
commands/             # 4 slash commands (.md files)
hooks/                # 3 event hooks (JS/shell + hooks.json)
agents/               # 3 subagent definitions
scripts/              # Installation utilities
.claude-plugin/       # Plugin metadata (plugin.json)
settings.local.json   # Local hook configuration
```

## Development Commands

### Testing & Validation
```bash
# Validate skill-rules.json syntax and structure
node tests/validate-skill-rules.js

# Test skill auto-activation patterns
node tests/run-activation-tests.js

# Validate all skills
bash tests/validate-skills.sh

# Run installation tests
node tests/install-skills.test.js
```

### Installation Scripts
```bash
# Install to global (~/.claude) or workspace (./.claude)
node scripts/install-skills.js
node scripts/install-skills.js --target global
node scripts/install-skills.js --target workspace
node scripts/install-skills.js --dry-run  # Preview only
```

### Skill Development
```bash
# Create new skill (use skill-developer skill for guidance)
# Skill structure:
# skills/my-skill/
# ├── SKILL.md              # Main skill prompt (500 line limit)
# └── resources/            # Bundled files (templates, examples)

# Register in skill-rules.json with keywords/intentPatterns
# Test activation: node tests/run-activation-tests.js
```

## Key Architecture Patterns

### Skill Auto-Activation
- `skills/skill-rules.json` - Keyword/intent pattern matching
- `hooks/skill-forced-eval-hook.sh` - UserPromptSubmit hook analyzes prompts
- Priority levels: critical > high > medium > low

### Tool Type Selection Guide
| Type | When to Use | Example |
|------|-------------|---------|
| **Command** | User-invoked shortcuts | `/auto-workflow`, `/workflow-simple` |
| **Skill** | Domain expertise + resources | `frontend-dev-guidelines`, `error-tracking` |
| **Subagent** | Focused AI with permissions | `code-reviewer`, `architect` |
| **Hook** | Event-driven automation | `skill-forced-eval-hook` |

### Workflow Orchestration
```
User Prompt → skill-forced-eval-hook
           → intelligent-task-router (complexity 0.0-1.0)
           → Sequential (< 0.3) / Parallel (0.3-0.7) / Orchestrator (> 0.7)
           → iterative-quality-enhancer
```

## Configuration Files

### skill-rules.json Structure
```json
{
  "skills": {
    "skill-name": {
      "type": "domain",           // domain | guideline | tool
      "enforcement": "suggest",   // suggest | block | warn
      "priority": "high",         // critical | high | medium | low
      "promptTriggers": {
        "keywords": ["word1", "word2"],
        "intentPatterns": ["regex1", "regex2"]
      }
    }
  }
}
```

### hooks.json (Plugin Hooks)
```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "matcher": "",
      "hooks": [{"type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/skill-forced-eval-hook.sh"}]
    }],

  }
}
```

## Common Tasks

### Adding a New Skill
1. Create `skills/my-skill/SKILL.md` (≤500 lines)
2. Add bundled resources to `skills/my-skill/resources/` (optional)
3. Register in `skills/skill-rules.json`
4. Test: `node tests/run-activation-tests.js`
5. Use `skill-developer` skill for detailed guidance

### Creating a Slash Command
1. Create `commands/my-command.md` with frontmatter:
```markdown
---
description: Brief description
allowed-tools: Task, Bash
---
Your prompt here
```
2. Use `command-creator` skill for templates

### Adding a Hook
1. Create script in `hooks/my-hook.{js,sh}`
2. Register in `hooks/hooks.json`
3. Set permissions in `settings.local.json`
4. Use `hooks-creator` skill for patterns

## Testing Guidelines

When modifying skills or hooks:
1. Run `node tests/validate-skill-rules.js` to check syntax
2. Test activation with `node tests/run-activation-tests.js`
3. Check installation with `node tests/install-skills.test.js --dry-run`
4. Review test results in `tests/activation-test-results.json`

## Skill Categories & Entry Points

### Tool Creation (Use these first for creating new tools)
- **skill-generator-tool** - Analyzes intent, recommends tool type (Command/Skill/Subagent/Hook)
- **command-creator** - Creates slash commands
- **skill-developer** - Creates skills (Anthropic best practices + 500-line rule)
- **subagent-creator** - Creates subagents (7 templates)
- **hooks-creator** - Creates hooks (6 event types)

### Workflow Management (Auto-orchestration)
- **agent-workflow-manager** - Entry point: auto-routes to Sequential/Parallel/Orchestrator based on complexity
- **intelligent-task-router** - Classifies tasks into 8 categories (bug_fix, feature_development, etc.)
- **parallel-task-executor** - Sectioning (parallel) / Voting (multi-approach) modes
- **dynamic-task-orchestrator** - Complex projects (complexity > 0.7), 6 specialized workers
- **sequential-task-processor** - Simple sequential tasks (complexity < 0.3)

### Quality & Review
- **iterative-quality-enhancer** - 5-dimension evaluation (Functionality, Performance, Code Quality, Security, Documentation)
- **reflection-review** - 6-area scoring with P0/P1/P2 prioritized feedback

### Development Guidelines
- **frontend-dev-guidelines** - React/TypeScript/MUI v7, Suspense, TanStack Router
- **backend-dev-guidelines** - Node.js/Express/Prisma, layered architecture, Zod validation
- **error-tracking** - Sentry v8 patterns (ALL errors must be captured)

### AI Integration
- **dual-ai-loop** - Integrates external AI CLIs (codex, qwen, copilot, rovo-dev, aider)
- **cli-updater** - Auto-updates CLI adapter skills and docs

## Important Notes

### Skill Development
- **500-line rule**: SKILL.md must be ≤500 lines
- **Progressive disclosure**: Metadata → SKILL.md body → Bundled resources
- **Bundle resources**: Put templates/examples in `resources/` subdirectory
- Always register in `skill-rules.json` with keywords/intentPatterns

### Hook Development
- Hooks run on every trigger - keep them lightweight
- Use `${CLAUDE_PLUGIN_ROOT}` for plugin-relative paths
- Test with minimal permissions first

### Testing Before Commit
```bash
node tests/validate-skill-rules.js  # Must pass
node tests/run-activation-tests.js  # Verify triggers work
```

## Documentation

이 프로젝트는 체계적인 문서 관리를 위해 문서 가이드라인을 따릅니다.

### 문서 구조
```
docs/
├── DOCUMENTATION_GUIDELINES.md   # 📚 문서 작성 가이드라인 (필수 읽기)
├── SKILL-DEVELOPMENT-GUIDE.md    # 스킬 개발 가이드
├── skills-guide/                 # 스킬 사용 가이드
│   ├── README.md                 # 스킬 가이드 메인
│   ├── DECISION_TREE.md          # 스킬 선택 결정 트리
│   └── COMMON_PITFALLS.md        # 흔한 실수 및 해결책
├── agent-patterns/               # 에이전트 패턴
│   ├── AGENT_PATTERNS_README.md  # 에이전트 패턴 개요
│   └── INTER_SKILL_PROTOCOL.md   # 스킬 간 통신 프로토콜
├── tool-creators/                # 도구 생성 가이드
│   ├── README.md                 # 도구 생성 메인 가이드
│   ├── ARCHITECTURE.md           # 아키텍처 설명
│   ├── QUICK_REFERENCE.md        # 빠른 참조
│   └── ...
├── review/                       # 리뷰 및 분석
└── archive/                      # 아카이브된 문서
```

### 문서 작성 규칙

새 문서 작성 또는 기존 문서 수정 시:
1. **[DOCUMENTATION_GUIDELINES.md](docs/DOCUMENTATION_GUIDELINES.md)** 필수 참조
2. 한글 우선, 기술 용어는 영어 사용
3. 명확한 구조 (제목, 목차, 섹션)
4. 실행 가능한 예제 포함
5. 링크 유효성 검증

### 주요 문서 링크

| 문서 | 설명 | 대상 |
|------|------|------|
| [DOCUMENTATION_GUIDELINES.md](docs/DOCUMENTATION_GUIDELINES.md) | 문서 작성 표준 및 스타일 가이드 | 모든 기여자 |
| [SKILL-DEVELOPMENT-GUIDE.md](docs/SKILL-DEVELOPMENT-GUIDE.md) | 스킬 개발 종합 가이드 | 스킬 개발자 |
| [tool-creators/](docs/tool-creators/) | 도구 생성 가이드 (Command/Skill/Hook/Subagent) | 도구 개발자 |
| [skills-guide/](docs/skills-guide/) | 스킬 사용 가이드 | 사용자 |
| [agent-patterns/](docs/agent-patterns/) | 에이전트 패턴 참조 | 개발자 |

## Official References
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Agent Skills Guide](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Plugins Documentation](https://claude.com/blog/claude-code-plugins)

---

# Additional Context (Historical Project Status)

이 섹션은 프로젝트의 역사적 맥락과 개선 계획을 담고 있습니다.
현재 프로젝트 상태 및 로드맵은 `docs/` 디렉토리를 참조하세요.

## Plugin Status Summary

**스킬**: 23개 (20개 skill-rules.json 등록)
**에이전트**: 3개 (code-reviewer, architect, workflow-orchestrator)
**훅**: 3개 (UserPromptSubmit, PostToolUse, Stop)
**슬래시 커맨드**: 4개 (auto-workflow, workflow-simple/parallel/complex)

### Recent Changes (v1.5.0)
- ✅ 플러그인 구조로 완전 마이그레이션
- ✅ hooks/node_modules 제거 (TypeScript → JavaScript 마이그레이션 완료)
- ✅ meta-prompt-generator 통합 (v2 및 .old 버전 제거)
- ✅ 20개 스킬 skill-rules.json 등록
- ✅ 워크플로우 슬래시 커맨드 4개 생성
- ✅ dual-ai-loop으로 AI 연동 통합

### Unregistered Skills (intentionally)
- **agent-workflow-orchestrator**: 고급 기능, 명시적 호출 권장 (agent-workflow-manager로 충분)
- **cli-updater**: dual-ai-loop 내부 호출용, 자동 트리거 불필요
- **skill-creator.old**: 레거시 버전, skill-developer로 대체됨

자세한 프로젝트 계획 및 로드맵은 이전 버전 CLAUDE.md 또는 `docs/` 디렉토리를 참조하세요.

---

## Legacy Content Removed

이전 CLAUDE.md의 나머지 내용(현재 상태 분석, 개선 방향성, 로드맵, 베스트 프랙티스, 변경 이력)은 제거되었습니다.
필요시 git history에서 복구하거나 `docs/` 디렉토리의 관련 문서를 참조하세요.

