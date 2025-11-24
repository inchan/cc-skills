# 리팩토링 Before/After 예제

실제 스킬 리팩토링 사례입니다.

## 예제 1: meta-prompt-generator

### Before (1,134줄)

**파일 구조**:
```
meta-prompt-generator/
└── SKILL.md (1,134줄)
```

**문제점**:
- 토큰 낭비 (~17,000 토큰)
- TypeScript 코드 6개 파일 포함 (실행 불가능)
- 복잡한 구조로 이해 어려움
- description 불명확

### After (241줄)

**파일 구조**:
```
meta-prompt-generator/
├── SKILL.md (241줄)
└── references/
    ├── templates/
    │   ├── basic-template.md
    │   ├── workflow-template.md
    │   └── full-power-template.md
    ├── advanced-features.md
    └── examples.md
```

**SKILL.md 핵심만**:
```markdown
---
name: meta-prompt-generator
description: 슬래시 커맨드용 프롬프트 생성. 프롬프트/커맨드 생성 요청 시 사용.
---

## 개요
슬래시 커맨드용 프롬프트를 생성합니다.

## 워크플로우
1. 요구사항 수집
2. 템플릿 선택
3. 프롬프트 생성

## 템플릿
- basic: 간단한 작업
- workflow: 여러 단계 작업
- full-power: 복잡한 작업

자세한 템플릿은 `references/templates/`를 참조하세요.
```

**개선 효과**:
- 토큰 71% 절감
- 명확한 구조
- 필요 시에만 references/ 로드

---

## 예제 2: iterative-quality-enhancer

### Before (643줄)

**문제점**:
- 500줄 초과 (+143줄)
- 평가 프레임워크 상세가 너무 길음
- 예제가 많아 복잡

### After (400줄)

**파일 구조**:
```
iterative-quality-enhancer/
├── SKILL.md (400줄)
└── references/
    ├── evaluation-framework.md (150줄)
    └── iteration-examples.md (100줄)
```

**변경 내용**:
1. **SKILL.md**: 핵심 워크플로우만
2. **evaluation-framework.md**: 5차원 평가 기준 상세
3. **iteration-examples.md**: Before/After 예제

**SKILL.md에서 참조**:
```markdown
## 평가 프레임워크

5가지 차원:
1. Functionality
2. Performance
3. Code Quality
4. Security
5. Documentation

각 차원의 상세 기준은 `references/evaluation-framework.md`를 참조하세요.

## 반복 예제

실제 개선 과정은 `references/iteration-examples.md`를 참조하세요.
```

---

## 예제 3: dynamic-task-orchestrator

### Before (703줄)

**문제점**:
- 6개 워커 설명이 너무 상세
- config.json 예시가 길음

### After (450줄)

**파일 구조**:
```
dynamic-task-orchestrator/
├── SKILL.md (450줄)
├── config.json (별도 파일로 이동)
└── references/
    └── worker-details.md (200줄)
```

**변경**:
1. **config.json**: 실제 설정 파일로 분리
2. **worker-details.md**: 6개 워커 상세 설명
3. **SKILL.md**: 개요 + 기본 사용법만

---

## 예제 4: agent-workflow-orchestrator

### Before (825줄)

**최대 초과** (+325줄)

**문제점**:
- 복잡도 분석 알고리즘 상세
- 8가지 작업 유형 설명이 길음
- 실행 모드별 예제가 많음

### After (500줄)

**파일 구조**:
```
agent-workflow-orchestrator/
├── SKILL.md (500줄)
└── references/
    ├── complexity-analysis.md (150줄)
    ├── task-types.md (100줄)
    └── execution-modes.md (100줄)
```

**분할 전략**:

**SKILL.md (500줄)**:
- 개요
- 핵심 워크플로우
- 기본 예제

**references/complexity-analysis.md**:
- 복잡도 점수 계산 알고리즘
- 각 요소별 가중치
- 점수 해석 가이드

**references/task-types.md**:
- 8가지 작업 유형 상세
- 각 유형별 특징
- 선택 기준

**references/execution-modes.md**:
- Sequential/Parallel/Orchestrator 모드
- 각 모드의 장단점
- 실제 사용 예제

---

## 분할 패턴 요약

| 스킬 | 초과 | 분할 방법 | 결과 |
|------|------|----------|------|
| meta-prompt-generator | +634 | 템플릿 → references/templates/ | 241줄 |
| iterative-quality-enhancer | +143 | 평가/예제 → references/ | 400줄 |
| dynamic-task-orchestrator | +203 | config/워커 → 별도 파일 | 450줄 |
| agent-workflow-orchestrator | +325 | 알고리즘/유형/모드 → references/ | 500줄 |

---

## 공통 패턴

### 1. 긴 예제/템플릿

**문제**: 예제가 많아 SKILL.md 길어짐

**해결**: `references/examples.md` 또는 `references/templates/`

### 2. 상세 API/설정

**문제**: API 참조/설정 옵션이 길음

**해결**: `references/api-reference.md` 또는 별도 파일 (config.json)

### 3. 이론/알고리즘

**문제**: 배경 이론이 길음

**해결**: `references/theory.md` 또는 `references/algorithm.md`

### 4. 고급 기능

**문제**: 고급 사용법이 많음

**해결**: `references/advanced-usage.md`

---

## 단계별 리팩토링 실습

### 1단계: 현재 상태 분석

```bash
# 라인 수
wc -l plugins/quality-review/skills/iterative-quality-enhancer/SKILL.md
# 643 lines

# 섹션 추출
grep -n "^##" plugins/quality-review/skills/iterative-quality-enhancer/SKILL.md
```

### 2단계: 분리 대상 식별

**섹션 분석**:
```
## 개요 (30줄) → 유지
## 워크플로우 (100줄) → 유지
## 평가 프레임워크 (200줄) → 분리 (상세하고 자주 안 씀)
## 반복 프로세스 (150줄) → 유지
## 예제 (100줄) → 분리 (긴 예제)
## API (63줄) → 분리
```

### 3단계: 파일 생성

```bash
# references/ 생성
mkdir -p plugins/quality-review/skills/iterative-quality-enhancer/references

# 분리 파일 생성
# - evaluation-framework.md (200줄)
# - iteration-examples.md (100줄)
# - api-reference.md (63줄)
```

### 4단계: SKILL.md 수정

**변경 전**:
```markdown
## 평가 프레임워크

### Functionality (기능성)
- 요구사항 충족도
- 엣지 케이스 처리
- ... (50줄 상세 설명)

### Performance (성능)
- ... (50줄 상세 설명)

... (총 200줄)
```

**변경 후**:
```markdown
## 평가 프레임워크

5가지 차원에서 코드를 평가합니다:
1. Functionality (기능성)
2. Performance (성능)
3. Code Quality (코드 품질)
4. Security (보안)
5. Documentation (문서화)

각 차원의 상세 평가 기준은 `references/evaluation-framework.md`를 참조하세요.
```

### 5단계: 검증

```bash
# 라인 수 확인
wc -l plugins/quality-review/skills/iterative-quality-enhancer/SKILL.md
# 400 lines ✅

# 진단
python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_skill.py \
  quality-review/iterative-quality-enhancer

# 검증
node tests/validate-skill-rules.js
```

---

## 체크리스트

### 분할 전
- [ ] 라인 수 500줄 초과 확인
- [ ] 섹션별 라인 수 파악
- [ ] 분리 대상 식별 (상호 배타적, 상세한 내용)

### 분할 중
- [ ] references/ 디렉토리 생성
- [ ] 분리 파일 생성 및 내용 복사
- [ ] SKILL.md에서 상세 내용 제거
- [ ] SKILL.md에 참조 링크 추가

### 분할 후
- [ ] 라인 수 500줄 이하
- [ ] diagnose_skill.py 통과
- [ ] SKILL.md 읽고 이해 가능
- [ ] 참조 링크 정확

---

## FAQ

**Q: 몇 줄까지 SKILL.md에 유지?**

A: 400-500줄 권장. 여유를 두어 향후 추가 가능.

**Q: 예제는 모두 분리?**

A: 기본 예제 1-2개는 SKILL.md 유지, 나머지는 분리.

**Q: 분할 후 토큰은?**

A: 500줄 ≈ 7,500 토큰. 분할 전 대비 40-70% 절감 가능.

**Q: 참조 파일도 500줄 제한?**

A: 아니오. references/는 제한 없음 (필요 시에만 로드).

---

## 다음 단계

1. **500줄 초과 스킬 목록 확인**:
   ```bash
   python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_all.py
   ```

2. **가장 큰 스킬부터 리팩토링**

3. **리팩토링 후 재진단**

4. **전체 스킬 건강도 확인**
