# Base Plugin

> 공통 에이전트 및 유틸리티를 제공하는 기본 플러그인

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./.claude-plugin/plugin.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)

---

## 개요

Base Plugin은 여러 플러그인에서 공통으로 사용할 수 있는 범용 에이전트와 유틸리티를 제공합니다.

### 주요 특징

- **범용 에이전트**: 특정 플러그인에 종속되지 않는 공통 에이전트
- **코드 품질 검증**: 시니어 개발자 수준의 코드 리뷰
- **문서화 검토**: API 문서, README 품질 검사
- **성능 분석**: 알고리즘 효율성, 병목 지점 식별

---

## 설치

### Claude Code에서 설치

```bash
# 플러그인 디렉토리로 이동
cd ~/.claude/plugins

# 저장소 클론
git clone https://github.com/inchan/claude-plugins.git

# 또는 특정 플러그인만 링크
ln -s /path/to/claude-plugins/plugins/base ~/.claude/plugins/base
```

---

## 에이전트

### engineer

> 꼼꼼한 시니어 개발자로서 코드 품질, 문서화, 성능을 철저히 검증하는 범용 개발 도우미

| 속성 | 값 |
|------|---|
| **모델** | sonnet |
| **도구** | Read, Grep, Glob, Edit, Bash, WebFetch, TodoWrite |

#### 주요 기능

1. **코드 품질 검증**
   - 정적 분석 (컨벤션, 안티패턴, 복잡도)
   - 보안 검토 (OWASP Top 10)
   - 에러 처리 검토

2. **문서화 검토**
   - 코드 주석 품질
   - API 문서 완전성
   - README 최신성

3. **성능 분석**
   - 알고리즘 효율성
   - 리소스 사용 패턴
   - 병목 지점 식별

#### 사용 예시

```json
{
  "subagent_type": "claude-plugin:engineer",
  "description": "코드 품질 검증",
  "prompt": "{
    \"task_type\": \"code_quality\",
    \"target\": {
      \"files\": [\"src/api/user.ts\"]
    }
  }"
}
```

---

## 커맨드

### /icp:cleanup

> 코드 정리, 데드 코드 제거, 불필요한 주석 제거, 프로젝트 구조 최적화

```bash
# 기본 사용 (전체 정리)
/icp:cleanup

# 특정 디렉토리 정리
/icp:cleanup src/ --type code --safe

# Import만 최적화
/icp:cleanup src/ --type imports
```

**정리 유형:**
- `code`: 데드 코드 제거
- `imports`: 미사용 import 제거
- `files`: 미사용 파일 제거
- `comments`: 불필요한 주석 제거
- `all`: 전체 (기본값)

### /icp:questions-andrej-karpathy

> 주제에 적합한 전문가들의 관점 탐구 (Andrej Karpathy 팁 기반)

```bash
/icp:questions-andrej-karpathy LLM 아키텍처 설계
```

---

## 플러그인 구조

```
plugins/base/
├── README.md                    # 이 파일
├── .claude-plugin/
│   └── plugin.json              # 플러그인 메타데이터
├── agents/
│   └── engineer.md              # 범용 개발 도우미
└── commands/
    ├── cleanup.md               # 코드 정리 커맨드
    └── questions-andrej-karpathy.md  # 전문가 관점 탐구
```

---

## 참고 자료

### 개발 가이드

- [Tool Creation Guide](../../docs/guidelines/tool-creation.md)
- [Development Guidelines](../../docs/guidelines/development.md)

---

## 라이선스

MIT License - [../../LICENSE](../../LICENSE) 참고

---

## 변경 이력

### v1.1.0 (2025-12-17)
- 커맨드 추가
  - cleanup 커맨드 (코드 정리 자동화)
  - questions-andrej-karpathy 커맨드 (전문가 관점 탐구)

### v1.0.0 (2025-12-15)
- 초기 릴리스
  - `shared/`에서 `plugins/base/`로 이동
  - engineer 에이전트 포함

---

## 문의

- GitHub: [inchan/claude-plugins](https://github.com/inchan/claude-plugins)
- Issues: [Report a bug](https://github.com/inchan/claude-plugins/issues)
