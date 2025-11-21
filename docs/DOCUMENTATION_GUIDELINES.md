# 문서 작성 가이드라인

CC-Skills 프로젝트의 문서 작성 및 관리 표준입니다.

## 목차

1. [문서 작성 원칙](#문서-작성-원칙)
2. [문서 구조](#문서-구조)
3. [문서 타입별 가이드](#문서-타입별-가이드)
4. [링킹 규칙](#링킹-규칙)
5. [문서 유지보수](#문서-유지보수)
6. [스타일 가이드](#스타일-가이드)

---

## 문서 작성 원칙

### 핵심 원칙

**명확성 (Clarity)**
- 기술 용어는 처음 등장 시 설명 추가
- 예제 코드 포함으로 이해도 향상
- 단계별 가이드는 번호 매기기

**간결성 (Conciseness)**
- 불필요한 수식어 제거
- 핵심 정보만 포함
- 장황한 설명 지양

**일관성 (Consistency)**
- 용어 통일 (예: "스킬" vs "skill", "훅" vs "hook")
- 문서 구조 표준화
- 코드 블록 스타일 통일

### 언어 사용

**한글 우선**
- 모든 문서는 기본적으로 한글로 작성
- 사용자 대면 문서는 반드시 한글

**영어 허용 범위**
- 기술 용어 (예: "hook", "plugin", "marketplace")
- 코드 변수명, 함수명
- 공식 용어 (예: "Claude Code", "UserPromptSubmit")

**용어 통일**
| 한글 | 영어 | 사용 컨텍스트 |
|------|------|--------------|
| 스킬 | skill | 일반 설명 |
| 훅 | hook | 일반 설명 |
| 플러그인 | plugin | 일반 설명 |
| 에이전트 | agent | 일반 설명 |
| 워크플로우 | workflow | 일반 설명 |
| - | SKILL.md, skill-rules.json | 파일명 |
| - | UserPromptSubmit, PostToolUse | 이벤트명 |

---

## 문서 구조

### 루트 레벨 문서

프로젝트의 주요 진입점 문서들:

**README.md**
- **목적**: 프로젝트 개요 및 사용자 가이드
- **대상**: 일반 사용자, 플러그인 설치자
- **내용**:
  - 프로젝트 소개
  - 설치 방법 (마켓플레이스, 로컬, GitHub)
  - 스킬/에이전트/훅 목록
  - 아키텍처 다이어그램
  - 빠른 시작 가이드

**CLAUDE.md**
- **목적**: 개발자를 위한 프로젝트 컨텍스트
- **대상**: Claude Code (AI 컨텍스트)
- **내용**:
  - 디렉토리 구조 설명
  - 개발 워크플로우
  - 빌드/배포 명령어
  - 중요 규칙 (500줄 규칙, 훅 설정 등)
  - 문서 가이드라인 링크

**PLUGIN.md**
- **목적**: 플러그인 사용 및 개발 가이드
- **대상**: 플러그인 사용자, 개발자
- **내용**:
  - 플러그인 설치 방법
  - 구성 요소 (스킬, 에이전트, 훅)
  - plugin.json, marketplace.json 스키마
  - 참고 문서 링크

### docs/ 디렉토리 구조

```
docs/
├── DOCUMENTATION_GUIDELINES.md  # 이 파일
├── SKILL-DEVELOPMENT-GUIDE.md   # 스킬 개발 가이드
├── skills-guide/                # 스킬 사용 가이드
│   ├── README.md                # 스킬 가이드 메인
│   ├── DECISION_TREE.md         # 스킬 선택 결정 트리
│   └── COMMON_PITFALLS.md       # 흔한 실수 및 해결책
├── agent-patterns/              # 에이전트 패턴 문서
│   ├── AGENT_PATTERNS_README.md # 에이전트 패턴 개요
│   └── INTER_SKILL_PROTOCOL.md  # 스킬 간 통신 프로토콜
└── tool-creators/               # 도구 생성 가이드 (통합)
    ├── README.md                # 도구 생성 메인 가이드
    ├── ARCHITECTURE.md          # 아키텍처 설명
    └── QUICK_REFERENCE.md       # 빠른 참조
```

**디렉토리별 용도**

| 디렉토리 | 용도 | 문서 타입 |
|---------|------|----------|
| `docs/` | 일반 개발 가이드 | 메타 문서, 종합 가이드 |
| `docs/skills-guide/` | 스킬 사용 가이드 | 사용자 가이드 |
| `docs/agent-patterns/` | 에이전트 패턴 | 참조 문서 |
| `docs/tool-creators/` | 도구 생성 가이드 | 개발자 가이드 |

### 기타 디렉토리 문서

**scripts/README.md**
- 설치 스크립트 사용법
- 명령어 옵션 설명

**tests/README.md**
- 테스트 실행 방법
- 검증 스크립트 설명

---

## 문서 타입별 가이드

### 1. 사용자 가이드 (User Guides)

**대상**: 플러그인 사용자, 초보자

**구조**:
```markdown
# 제목

## 개요
간단한 설명 (1-2 문장)

## 시작하기
기본 사용법

## 주요 기능
- 기능 1
- 기능 2

## 예제
실제 사용 예제

## 참고
관련 문서 링크
```

**특징**:
- 전문 용어 최소화
- 단계별 스크린샷/코드 예제
- 자주 묻는 질문 (FAQ) 포함

### 2. 개발자 가이드 (Developer Guides)

**대상**: 기여자, 플러그인 개발자

**구조**:
```markdown
# 제목

## 아키텍처
시스템 구조 설명

## API 참조
함수, 인터페이스 문서

## 개발 워크플로우
빌드, 테스트, 배포

## 베스트 프랙티스
권장 사항

## 문제 해결
일반적인 문제 및 해결책
```

**특징**:
- 기술적 세부 사항 포함
- 코드 예제 및 API 문서
- 디버깅 가이드

### 3. 참조 문서 (Reference Docs)

**대상**: 모든 개발자

**구조**:
```markdown
# 제목

## 목차
(자동 생성 또는 수동)

## [항목 1]
### 설명
### 사용법
### 예제

## [항목 2]
...
```

**특징**:
- 알파벳/카테고리순 정렬
- 간결한 설명
- 코드 예제 필수

### 4. 리포트/분석 문서 (Reports/Analysis)

**대상**: 프로젝트 관리자, 기여자

**구조**:
```markdown
# 제목

## 요약 (Summary)
주요 발견 사항

## 배경 (Background)
분석 목적 및 범위

## 결과 (Findings)
상세 분석 결과

## 결론 (Conclusion)
권장 사항 및 다음 단계

## 부록 (Appendix)
상세 데이터, 로그
```

**특징**:
- 날짜 및 작성자 명시
- 데이터 기반 분석
- 실행 가능한 권장 사항

**보관 규칙**:
- 현재 유효한 리포트만 유지
- 오래된 리포트는 `docs/archive/` 이동
- 6개월 이상 경과 시 삭제 검토

---

## 링킹 규칙

### 내부 링크

**상대 경로 사용**
```markdown
✅ [스킬 개발 가이드](./SKILL-DEVELOPMENT-GUIDE.md)
✅ [도구 생성 가이드](./tool-creators/README.md)
❌ [스킬 개발 가이드](/docs/SKILL-DEVELOPMENT-GUIDE.md)
```

**앵커 링크**
```markdown
✅ [문서 구조](#문서-구조)
✅ [링킹 규칙](./DOCUMENTATION_GUIDELINES.md#링킹-규칙)
```

**파일 참조**
```markdown
✅ 자세한 내용은 [CLAUDE.md](../CLAUDE.md)를 참조하세요.
✅ 스킬 규칙은 `skills/skill-rules.json`에 정의되어 있습니다.
```

### 외부 링크

**공식 문서**
```markdown
✅ [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
✅ [Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
```

**GitHub 링크**
```markdown
✅ [공식 저장소](https://github.com/anthropics/claude-code)
✅ [이슈 #123](https://github.com/inchan/cc-skills/issues/123)
```

### 링크 유효성 검증

**검증 도구** (선택 사항)
```bash
# markdown-link-check 사용 (향후 CI 통합)
npx markdown-link-check docs/**/*.md
```

**수동 검증 규칙**
- 문서 이동 시 모든 링크 업데이트
- PR 전 링크 유효성 확인
- 깨진 링크 발견 시 즉시 수정

---

## 문서 유지보수

### 업데이트 주기

**즉시 업데이트**
- API 변경
- 디렉토리 구조 변경
- 주요 기능 추가/제거

**정기 업데이트 (월 1회)**
- README.md 스킬/에이전트 목록
- PLUGIN.md 버전 히스토리
- CLAUDE.md 프로젝트 상태

### 사용하지 않는 문서 제거 기준

**즉시 제거**
- ✅ 중복 문서 (동일 내용, 다른 이름)
- ✅ 완료된 작업 리포트 (작업 완료 후)
- ✅ 임시 분석 문서 (`.tmp`, `_draft` 등)

**아카이빙 대상**
- 📦 히스토리 참조용 리포트
- 📦 레거시 가이드 (새 버전 존재)
- 위치: `docs/archive/YYYY-MM-DD-{filename}.md`

**보관 대상**
- 📁 현재 사용 중인 가이드
- 📁 공식 참조 문서
- 📁 6개월 이내 리포트

### 버전 관리

**문서 버전 표기** (주요 문서만)
```markdown
---
version: 1.2.0
last_updated: 2025-11-21
---
```

**변경 이력** (CLAUDE.md, PLUGIN.md)
```markdown
## 변경 이력

### v1.5.0 (2025-11-21)
- ✅ 문서 가이드라인 추가
- ✅ 사용하지 않는 문서 제거

### v1.4.0 (2025-11-20)
- ✅ 플러그인 구조로 마이그레이션
```

---

## 스타일 가이드

### 마크다운 스타일

**헤더**
```markdown
# H1 - 문서 제목 (1개만)
## H2 - 주요 섹션
### H3 - 하위 섹션
#### H4 - 세부 항목 (최대 H4까지 사용)
```

**코드 블록**
````markdown
```bash
npm run build
```

```json
{
  "name": "example"
}
```
````

**강조**
```markdown
**굵게** - 중요 개념
*기울임* - 용어 소개
`코드` - 파일명, 변수명
```

**리스트**
```markdown
- 순서 없는 항목 (-, *)
  - 들여쓰기 2칸

1. 순서 있는 항목
2. 다음 항목
```

**표**
```markdown
| 헤더1 | 헤더2 | 헤더3 |
|-------|-------|-------|
| 셀1   | 셀2   | 셀3   |
```

### 파일명 규칙

**대문자 사용**
```
✅ README.md
✅ CLAUDE.md
✅ SKILL-DEVELOPMENT-GUIDE.md
❌ readme.md
❌ claude.md
```

**단어 구분**
```
✅ TOOL-CREATORS-ARCHITECTURE.md  (하이픈)
✅ skill-rules.json               (소문자 + 하이픈)
❌ ToolCreatorsArchitecture.md   (카멜케이스)
❌ tool_creators_architecture.md (언더스코어)
```

**날짜 형식** (리포트)
```
✅ CLEANUP-REPORT-2025-11-20.md
✅ docs/archive/2025-11-20-analysis.md
❌ CLEANUP-REPORT-Nov-20.md
```

### 문서 크기 가이드

| 문서 타입 | 권장 크기 | 최대 크기 |
|----------|----------|----------|
| README.md | 300-500줄 | 800줄 |
| 개발 가이드 | 200-400줄 | 600줄 |
| 참조 문서 | 100-300줄 | 500줄 |
| 리포트 | 100-200줄 | 400줄 |

**초과 시 분할 규칙**:
- 섹션별로 별도 파일 생성
- 메인 문서에서 링크로 연결
- 예: `TOOL-CREATORS-README.md` → `ARCHITECTURE.md`, `QUICK-REFERENCE.md`

---

## 문서 체크리스트

새 문서 작성 또는 업데이트 시 확인:

**기본 사항**
- [ ] 제목 명확 (H1 1개)
- [ ] 목차 포함 (200줄 이상)
- [ ] 한글 우선, 기술 용어만 영어
- [ ] 코드 예제 포함
- [ ] 링크 유효성 확인

**구조**
- [ ] 적절한 디렉토리 위치
- [ ] 파일명 규칙 준수
- [ ] 관련 문서와 링크 연결
- [ ] 중복 문서 없음

**내용**
- [ ] 대상 독자 명확
- [ ] 실행 가능한 예제
- [ ] 최신 코드 반영
- [ ] 오타 및 문법 확인

**유지보수**
- [ ] 버전 정보 명시 (주요 문서)
- [ ] 마지막 업데이트 날짜
- [ ] 변경 이력 기록 (해당 시)

---

## 참고

- [Markdown Guide](https://www.markdownguide.org/)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Write the Docs](https://www.writethedocs.org/)
