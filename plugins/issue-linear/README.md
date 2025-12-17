# Issue Linear Plugin

> Linear 이슈 관리를 위한 자동화 플러그인

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./.claude-plugin/plugin.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)

---

## 개요

Issue Linear Plugin은 자연어 요구사항을 Linear 이슈로 변환하고, 이슈를 받아 코드를 구현하는 End-to-End 워크플로우를 제공합니다.

### 주요 특징

- **자연어 → 이슈 변환**: 요구사항을 원자적 이슈로 자동 분해
- **코드베이스 매핑**: 이슈와 관련 파일/모듈 자동 연결
- **품질 검증**: 원자성/명확성/실행가능성/테스트가능성 검증
- **상태 자동 관리**: 이슈 상태 및 체크박스 자동 업데이트

---

## 설치

### Claude Code에서 설치

```bash
# 플러그인 디렉토리로 이동
cd ~/.claude/plugins

# 저장소 클론
git clone https://github.com/inchan/claude-plugins.git

# 또는 특정 플러그인만 링크
ln -s /path/to/claude-plugins/plugins/issue-linear ~/.claude/plugins/issue-linear
```

### Linear MCP 서버 설정

이 플러그인은 Linear MCP 서버가 필요합니다. `.claude/settings.json`에 설정하세요:

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@anthropic/linear-mcp-server"],
      "env": {
        "LINEAR_API_KEY": "lin_api_xxxxx"
      }
    }
  }
}
```

---

## 커맨드

### `/icp:issue-create`

> 자연어 요구사항을 Linear 이슈로 변환

```bash
# 기본 사용
/icp:issue-create 사용자 프로필에 다크모드 토글 추가

# 프로젝트 지정
/icp:issue-create --project=frontend 로그인 폼 유효성 검사 개선
```

**워크플로우:**
1. Issue Analyzer → 요구사항 분해
2. Code Mapper → 관련 파일 매핑
3. Issue Refiner → 품질 검증 및 정제
4. Linear 이슈 생성 (사용자 확인 후)

### `/icp:issue-resolve`

> Linear 이슈를 받아 코드를 구현하고 완료 처리

```bash
# 특정 이슈 처리
/icp:issue-resolve LIN-123

# 내게 할당된 이슈 조회
/icp:issue-resolve --my-issues
```

**워크플로우:**
1. 이슈 조회 및 상태 변경 (In Progress)
2. feature-dev 커맨드로 구현
3. 완료 조건 체크박스 업데이트
4. 완료 보고 코멘트 작성

---

## 에이전트

### issue-analyzer

> 자연어 요구사항을 원자적 이슈 후보로 분해

| 속성 | 값 |
|------|---|
| **도구** | Read, Grep, Glob, WebFetch, TodoWrite |

**주요 기능:**
- 요구사항 이해 및 재서술
- 기능 단위 분해
- 원자성 자기검토

**출력 형식:**
```json
{
  "summary": "요구사항 요약",
  "issues": [
    {
      "id": "ISSUE_TMP_1",
      "title": "이슈 제목",
      "description": "설명",
      "suspected_scope": ["backend/api"],
      "questions": ["불명확한 부분"]
    }
  ]
}
```

### code-mapper

> 이슈 후보를 코드베이스의 실제 파일/모듈에 매핑

| 속성 | 값 |
|------|---|
| **도구** | Read, Grep, Glob, Bash |

**주요 기능:**
- 코드베이스 구조 분석
- 이슈와 파일/모듈 매핑
- 일관성 자기검토

**출력 형식:**
```json
{
  "issues": [
    {
      "id": "ISSUE_TMP_1",
      "targets": [
        { "path": "src/api/products.ts", "reason": "매핑 근거" }
      ]
    }
  ]
}
```

### issue-refiner

> 이슈를 개발자가 바로 착수 가능한 수준으로 정제

| 속성 | 값 |
|------|---|
| **도구** | Read, Grep, Glob |

**품질 기준:**
- **원자성**: 하나의 책임/기능만 포함
- **명확성**: 모호한 표현 없음
- **실행 가능성**: 다음 액션이 바로 도출 가능
- **테스트 가능성**: 명시적 완료 조건 존재

**구조 결정:**
- `hierarchical`: 3개 이상 이슈가 동일 목표 공유 시 Parent-Child 구조
- `flat`: 독립적인 이슈들은 개별 생성

---

## 플러그인 구조

```
plugins/issue-linear/
├── README.md                    # 이 파일
├── .claude-plugin/
│   └── plugin.json              # 플러그인 메타데이터
├── agents/
│   ├── issue-analyzer.md        # 요구사항 분석
│   ├── code-mapper.md           # 코드베이스 매핑
│   └── issue-refiner.md         # 이슈 정제
└── commands/
    ├── issue-create.md          # 이슈 생성 파이프라인
    └── issue-resolve.md         # 이슈 해결 파이프라인
```

---

## 참고 자료

### 관련 가이드

- [Tool Creation Guide](../../docs/guidelines/tool-creation.md)
- [Development Guidelines](../../docs/guidelines/development.md)

### Linear API

- [Linear API Documentation](https://developers.linear.app/docs)
- [Linear MCP Server](https://github.com/anthropics/linear-mcp-server)

---

## 라이선스

MIT License - [../../LICENSE](../../LICENSE) 참고

---

## 변경 이력

### v0.1.0 (2025-12-17)
- 초기 릴리스
  - issue-analyzer 에이전트 추가
  - code-mapper 에이전트 추가
  - issue-refiner 에이전트 추가
  - issue-create 커맨드 추가
  - issue-resolve 커맨드 추가

---

## 문의

- GitHub: [inchan/claude-plugins](https://github.com/inchan/claude-plugins)
- Issues: [Report a bug](https://github.com/inchan/claude-plugins/issues)
