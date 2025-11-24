# 스킬 리팩토링 가이드

500줄을 초과하는 스킬을 분할하는 단계별 가이드입니다.

## 원칙: 점진적 공개 (Progressive Disclosure)

Anthropic 가이드라인의 핵심 원칙:

```
1단계 (항상): name + description (YAML frontmatter)
2단계 (스킬 활성화): SKILL.md 본문
3단계 (필요 시): references/, scripts/ 추가 파일
```

**목표**: 필요한 정보만 로드하여 토큰 절약

## 단계별 리팩토링

### 1단계: 현재 상태 분석

```bash
# 라인 수 확인
wc -l plugins/{plugin}/skills/{skill-name}/SKILL.md

# 섹션 헤더 추출
grep -n "^##" plugins/{plugin}/skills/{skill-name}/SKILL.md
```

**출력 예시**:
```
700 plugins/quality-review/skills/iterative-quality-enhancer/SKILL.md

  10:## 개요
  30:## 핵심 워크플로우
 150:## 평가 프레임워크  ← 분리 후보
 400:## 고급 사용법     ← 분리 후보
 550:## API 참조        ← 분리 후보
 650:## 예제
```

### 2단계: 분할 계획 수립

**분류 기준**:

| 카테고리 | SKILL.md 유지 | 분리 대상 |
|---------|--------------|----------|
| **핵심 워크플로우** | ✅ 유지 | - |
| **기본 예제** | ✅ 유지 | - |
| **고급 기능** | ❌ 분리 | `advanced-usage.md` |
| **API 참조** | ❌ 분리 | `api-reference.md` |
| **상세 예제** | ❌ 분리 | `examples.md` |
| **이론/배경** | ❌ 분리 | `theory.md` |

**상호 배타적 경로 식별**:
- 양식 작성 vs 서명 추가 (둘 다 쓰지 않음) → 분리
- 기본 사용 vs 고급 설정 (함께 쓰지 않음) → 분리

### 3단계: 분할 실행

**예시: iterative-quality-enhancer (643줄)**

**현재**:
```
iterative-quality-enhancer/
└── SKILL.md (643줄)
```

**변경 후**:
```
iterative-quality-enhancer/
├── SKILL.md (400줄)
│   ├── 개요
│   ├── 핵심 워크플로우
│   └── 기본 예제
└── references/
    ├── evaluation-framework.md (150줄)
    ├── iteration-examples.md (100줄)
    └── api-reference.md (50줄)
```

**SKILL.md 수정**:
```markdown
## 평가 프레임워크

5가지 차원에서 코드를 평가합니다.

자세한 평가 기준은 `references/evaluation-framework.md`를 참조하세요.

## 반복 예제

여러 반복을 통한 개선 과정은 `references/iteration-examples.md`를 참조하세요.
```

### 4단계: 검증

```bash
# 분할 후 라인 수 확인
wc -l plugins/{plugin}/skills/{skill-name}/SKILL.md
# 목표: 500줄 이하

# 스킬 진단
python plugins/tool-creators/skills/skill-health-checker/scripts/diagnose_skill.py \
  {plugin}/{skill-name}

# 검증 스크립트
node tests/validate-skill-rules.js
```

## 실제 예시: Before/After

### Before: meta-prompt-generator (1,134줄)

```
meta-prompt-generator/
└── SKILL.md (1,134줄)
    ├── 개요 (50줄)
    ├── 워크플로우 (100줄)
    ├── TypeScript 코드 (300줄)
    ├── 템플릿 (400줄)
    ├── 고급 기능 (200줄)
    └── 예제 (84줄)
```

**문제**:
- 토큰 낭비 (~17,000 토큰)
- TypeScript 코드 실행 불가능
- 모든 내용을 항상 로드

### After: meta-prompt-generator (241줄)

```
meta-prompt-generator/
├── SKILL.md (241줄)
│   ├── 개요
│   ├── 핵심 워크플로우
│   └── 기본 템플릿
└── references/
    ├── templates/ (400줄, 템플릿만)
    ├── advanced-features.md (200줄)
    └── examples.md (84줄)
```

**개선 효과**:
- 토큰 71% 절감 (~3,600 토큰)
- 필요 시에만 references/ 참조
- 명확한 구조

## 분할 체크리스트

### 분할 전
- [ ] 현재 라인 수 확인 (500줄 초과?)
- [ ] 섹션 헤더 추출
- [ ] 상호 배타적 경로 식별
- [ ] 분할 계획 수립

### 분할 중
- [ ] references/ 디렉토리 생성
- [ ] 분리할 내용 복사
- [ ] SKILL.md에서 제거
- [ ] SKILL.md에 참조 링크 추가

### 분할 후
- [ ] 라인 수 500줄 이하 확인
- [ ] diagnose_skill.py 실행
- [ ] 검증 스크립트 통과
- [ ] SKILL.md 읽고 이해 가능한지 확인

## 안티 패턴

### ❌ 나쁜 분할

**모든 섹션을 기계적으로 분리**:
```
skill/
├── SKILL.md (50줄) ← 너무 짧음
├── section1.md
├── section2.md
├── section3.md
└── ... (20개 파일)
```

**문제**: 파일이 너무 많아 탐색 어려움

### ✅ 좋은 분할

**핵심은 SKILL.md에, 부가는 references/에**:
```
skill/
├── SKILL.md (400줄) ← 충분한 컨텍스트
└── references/
    ├── advanced.md
    └── examples.md
```

**장점**: 명확한 구조, 점진적 공개

## FAQ

**Q: 몇 개 파일로 분할해야 하나?**

A: 3-5개 이내 권장. 너무 많으면 복잡해짐.

**Q: scripts/ vs references/?**

A:
- `scripts/`: 실행 가능한 코드 (.py, .sh, .js)
- `references/`: 문서/템플릿 (.md)

**Q: 분할 후에도 500줄 초과라면?**

A:
1. 더 공격적으로 분할
2. 불필요한 예제/설명 제거
3. 여러 스킬로 분리 고려 (예: basic-skill, advanced-skill)

## 추가 리소스

- Anthropic 공식 가이드: [Agent Skills Guide](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- 프로젝트 가이드: `docs/SKILL-DEVELOPMENT-GUIDE.md`
- 트리거 패턴: `references/trigger-patterns.md`
