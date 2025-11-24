---
name: skill-health-checker
description: 스킬 건강도 진단 및 유지보수 가이드. 500줄 규칙, skill-rules.json 동기화, YAML 검증을 수행합니다.
---

# skill-health-checker

이 프로젝트의 스킬 품질을 진단하고 유지보수하는 도구입니다.

## 개요

**핵심 기능**:
1. **Diagnose**: 스킬 건강도 자동 진단
2. **Report**: 배치 스캔 및 리포트 생성
3. **Guide**: 리팩토링 가이드 제공

**언제 사용하는가**:
- 500줄 규칙 준수 확인
- skill-rules.json 동기화 체크
- YAML frontmatter 검증
- 프로젝트 전체 스킬 건강도 파악

## 워크플로우 1: 단일 스킬 진단 (Diagnose)

### 사용법

```bash
cd /Users/chans/workspace/pilot/cc-skills
python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_skill.py <plugin>/<skill-name>
```

### 예제

```bash
# 특정 스킬 진단
python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_skill.py \
  tool-creators/skill-developer

# JSON 출력 포함
python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_skill.py \
  tool-creators/skill-developer --json
```

### 진단 항목

1. **500줄 규칙** (Critical)
   - SKILL.md 라인 수 측정
   - 500줄 초과 시 Critical 경고
   - 450-500줄 시 Warning

2. **YAML frontmatter** (Critical)
   - `name` 필드 존재 및 디렉토리명 일치
   - `description` 필드 존재 및 길이 (30-150자 권장)
   - YAML 파싱 에러 체크

3. **skill-rules.json 등록** (Critical)
   - skill-rules.json 존재 확인
   - 현재 스킬 등록 여부
   - 트리거 (keywords/intentPatterns) 존재

4. **번들 리소스** (Info)
   - scripts/, references/, resources/ 디렉토리 확인
   - 파일 개수 집계

### 출력 형식

```
🔍 Diagnosing: tool-creators/skill-developer
======================================================================
스킬: tool-creators/skill-developer
======================================================================

📊 메트릭:
  라인 수: 350줄
  토큰 추정: ~5,250 토큰
  description: 87자
  번들 리소스: 있음

✅ Info:
  ✅ 라인 수 양호: 350줄
  ✅ description 적정: 87자
  ✅ skill-rules.json 등록됨
  ✅ 트리거: 5개 키워드, 2개 패턴
  📁 번들 리소스: scripts/ (3개 파일), references/ (2개 파일)

📋 종합 상태: ✅ 건강함
======================================================================
```

## 워크플로우 2: 배치 진단 (Report)

### 사용법

```bash
cd /Users/chans/workspace/pilot/cc-skills
python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_all.py

# 마크다운 리포트도 생성
python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_all.py --markdown
```

### 출력

1. **콘솔 요약**:
   - 전체 스킬 개수
   - 상태별 집계 (Healthy/Warning/Critical)
   - 500줄 초과 스킬 목록
   - skill-rules.json 미등록 스킬 목록

2. **JSON 리포트**:
   - 경로: `tests/skill-health-report.json`
   - 각 스킬별 상세 진단 결과
   - 메트릭 및 이슈 전체 포함

3. **마크다운 리포트** (--markdown 옵션):
   - 경로: `tests/skill-health-report.md`
   - 읽기 쉬운 형식
   - 액션 아이템 체크리스트

### 예제 출력

```
🔍 발견된 스킬: 23개
📁 스캔 디렉토리: /Users/chans/workspace/pilot/cc-skills/plugins
======================================================================

[1/23] tool-creators/skill-developer
  → ✅ healthy
[2/23] tool-creators/command-creator
  → 🚨 critical
...

======================================================================
📊 전체 스킬 건강도 요약
======================================================================

총 스킬: 23개
  ✅ 건강함: 15개
  ⚠️  주의: 2개
  🚨 수정 필요: 6개

🚨 수정 필요한 스킬 (6개):
  - workflow-automation/agent-workflow-orchestrator
    ❌ 500줄 초과: 825줄 (+325줄)
  - quality-review/iterative-quality-enhancer
    ❌ 500줄 초과: 643줄 (+143줄)
...

📏 500줄 초과 스킬 (6개):
  - workflow-automation/agent-workflow-orchestrator: 825줄 (+325)
  - workflow-automation/dynamic-task-orchestrator: 703줄 (+203)
  ...
```

## 워크플로우 3: skill-rules.json 동기화 체크

### 사용법

```bash
cd /Users/chans/workspace/pilot/cc-skills
python plugins/tool-creators/skills/skill-health-checker/scripts/check_sync.py

# 자동 수정 제안 포함
python plugins/tool-creators/skills/skill-health-checker/scripts/check_sync.py --suggest

# JSON 출력
python plugins/tool-creators/skills/skill-health-checker/scripts/check_sync.py --json
```

### 체크 항목

1. **미등록 스킬**: 디렉토리는 있으나 skill-rules.json에 없음
2. **등록만 된 스킬**: skill-rules.json에는 있으나 디렉토리 없음

### 자동 수정 제안 (--suggest)

```
💡 자동 수정 제안
======================================================================

다음 스킬을 skill-rules.json에 추가할 수 있습니다:

# tool-creators/skill-health-checker
```json
"skill-health-checker": {
  "type": "domain",
  "enforcement": "suggest",
  "priority": "medium",
  "promptTriggers": {
    "keywords": [],
    "intentPatterns": []
  }
}
```
```

## 리팩토링 가이드 (Guide)

### 500줄 초과 시 분할 전략

**1. 섹션별 분류**

```bash
# SKILL.md의 섹션 헤더 추출
grep -n "^##" plugins/{plugin}/skills/{skill-name}/SKILL.md
```

**2. 상호 배타적 경로 식별**

- 함께 사용되지 않는 섹션
- 특정 시나리오에만 필요한 내용
- 참조 자료/예제

**3. 분할 계획**

```
현재: SKILL.md (700줄)

제안:
├── SKILL.md (400줄)
│   ├── 개요
│   ├── 핵심 워크플로우
│   └── 기본 예제
├── references/
│   ├── advanced-usage.md (150줄)
│   ├── api-reference.md (100줄)
│   └── examples.md (50줄)
```

**4. 실행**

```bash
# 1. SKILL.md에서 참조 추가
"자세한 내용은 `references/advanced-usage.md`를 참조하세요."

# 2. 분리된 파일 생성
# 3. SKILL.md 축소
```

### 상세 가이드

- `references/refactoring-guide.md`: 단계별 리팩토링 가이드
- `references/trigger-patterns.md`: 효과적인 트리거 패턴
- `references/examples.md`: Before/After 리팩토링 예제

## Claude와의 대화형 사용

### 사용자가 요청하는 경우

**"전체 스킬 상태 체크해줘"**

```markdown
1. `diagnose_all.py` 실행
2. 결과 해석 및 요약
3. Critical 스킬 우선 조치 제안
4. 500줄 초과 스킬 리팩토링 가이드 제공
```

**"skill-health-checker 스킬이 500줄 넘는지 확인"**

```bash
python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_skill.py \
  tool-creators/skill-health-checker
```

**"skill-rules.json 동기화 확인"**

```bash
python plugins/tool-creators/skills/skill-health-checker/scripts/check_sync.py --suggest
```

### Claude가 해석해야 할 것

1. **진단 결과 해석**
   - Critical: 즉시 수정 필요
   - Warning: 개선 권장
   - Healthy: 양호

2. **우선순위 판단**
   - 500줄 초과 > 미등록 > description 문제

3. **액션 아이템 제공**
   - 구체적인 수정 방법
   - 리팩토링 가이드 참조

## 성공 기준

- [ ] 모든 스킬 500줄 이하
- [ ] YAML frontmatter 유효
- [ ] skill-rules.json 동기화
- [ ] description 명확 (30-150자)
- [ ] 트리거 패턴 존재

## 제약사항

**이 스킬이 하지 않는 것**:
- ❌ 스킬 생성 (→ skill-developer 사용)
- ❌ 자동 리팩토링 (가이드만 제공)
- ❌ 코드 품질 분석 (→ iterative-quality-enhancer 사용)
- ❌ Git 커밋 (사용자 책임)

**이 스킬이 하는 것**:
- ✅ 500줄 규칙 자동 체크
- ✅ YAML frontmatter 검증
- ✅ skill-rules.json 동기화 확인
- ✅ 배치 진단 리포트
- ✅ 리팩토링 가이드 제공

## 트러블슈팅

### "JSON 파싱 실패" 에러

**원인**: skill-rules.json이 유효하지 않은 JSON

**해결**:
```bash
# 검증
cat plugins/{plugin}/skills/skill-rules.json | python -m json.tool

# 자동 포맷
cat plugins/{plugin}/skills/skill-rules.json | python -m json.tool > temp.json
mv temp.json plugins/{plugin}/skills/skill-rules.json
```

### "YAML frontmatter 누락" 경고

**원인**: SKILL.md에 `---`로 감싼 YAML 블록이 없음

**해결**:
```markdown
---
name: skill-name
description: 스킬 설명
---

# 본문
```

### 500줄 초과 스킬 우선순위

**가장 큰 것부터**:
1. 가장 많이 초과한 스킬 (예: 825줄 → -325줄 필요)
2. 자주 사용되는 스킬
3. 유지보수가 필요한 스킬

## 스크립트 위치

| 스크립트 | 경로 | 설명 |
|---------|------|------|
| diagnose_skill.py | `scripts/` | 단일 스킬 진단 |
| diagnose_all.py | `scripts/` | 배치 진단 + 리포트 |
| check_sync.py | `scripts/` | 동기화 체크 |
| generate_report.py | `scripts/` | 마크다운 리포트 |

## 추가 리소스

- `references/refactoring-guide.md`: 리팩토링 단계별 가이드
- `references/trigger-patterns.md`: 효과적인 트리거 작성법
- `references/examples.md`: Before/After 예제

## 버전

- **v1.0.0**: 초기 릴리스
- 생성일: 2025-11-22
