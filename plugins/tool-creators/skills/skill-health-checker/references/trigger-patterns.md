# 효과적인 트리거 패턴 가이드

skill-rules.json에서 스킬을 자동 활성화하기 위한 트리거 작성 가이드입니다.

## 트리거 구조

```json
{
  "skills": {
    "skill-name": {
      "type": "domain | guideline | tool",
      "enforcement": "suggest | block | warn",
      "priority": "critical | high | medium | low",
      "promptTriggers": {
        "keywords": ["keyword1", "keyword2"],
        "intentPatterns": ["pattern1.*regex", "pattern2"]
      }
    }
  }
}
```

## 키워드 vs 인텐트 패턴

### 키워드 (keywords)

**언제 사용**: 명확한 단어/구문 매칭

**예시**:
```json
"keywords": [
  "스킬 진단",
  "스킬 체크",
  "skill health",
  "500줄"
]
```

**매칭 방식**: 대소문자 무관, 부분 매칭

**장점**: 간단, 명확
**단점**: 유연성 낮음

### 인텐트 패턴 (intentPatterns)

**언제 사용**: 복잡한 의도 파악

**예시**:
```json
"intentPatterns": [
  "(check|validate|diagnose).*skill",
  "skill.*(health|quality|validation)",
  "스킬.*(검증|진단|체크)"
]
```

**매칭 방식**: 정규식 (regex)

**장점**: 유연, 다양한 표현 커버
**단점**: 복잡, 디버깅 어려움

## 베스트 프랙티스

### 1. 키워드 3-5개 + 패턴 2-3개

```json
"promptTriggers": {
  "keywords": [
    "frontend", "react", "mui"
  ],
  "intentPatterns": [
    "create.*(component|page)",
    "frontend.*(guideline|pattern)"
  ]
}
```

**이유**: 균형 잡힌 매칭 (너무 많으면 충돌)

### 2. 구체적인 키워드 우선

**❌ 나쁜 예**:
```json
"keywords": ["create", "help", "code"]
```
→ 너무 일반적, 모든 요청에 매칭

**✅ 좋은 예**:
```json
"keywords": ["create skill", "skill 만들기", "generate skill"]
```
→ 구체적, 명확한 의도

### 3. 다국어 지원

```json
"keywords": [
  "skill health", "스킬 건강도",
  "skill check", "스킬 체크",
  "500줄", "500 lines"
]
```

### 4. 동의어 커버

```json
"keywords": [
  "스킬 진단", "스킬 검사", "스킬 확인",
  "skill diagnose", "skill check", "skill validate"
]
```

### 5. 인텐트 패턴 우선순위

**구체적 → 일반적 순**:

```json
"intentPatterns": [
  "create.*react.*component",      // 가장 구체적
  "create.*(component|page)",      // 중간
  "frontend.*(create|build)"       // 일반적
]
```

## 타입별 권장 패턴

### Domain Skill (도메인 전문)

```json
{
  "type": "domain",
  "promptTriggers": {
    "keywords": [
      "도메인 특화 용어 3-5개"
    ],
    "intentPatterns": [
      "구체적인 작업 패턴 2-3개"
    ]
  }
}
```

**예시**: frontend-dev-guidelines
```json
"keywords": [
  "frontend", "react", "mui", "컴포넌트"
],
"intentPatterns": [
  "create.*(component|page|feature)",
  "frontend.*(guideline|pattern|best practice)"
]
```

### Guideline Skill (가이드라인)

```json
{
  "type": "guideline",
  "promptTriggers": {
    "keywords": [
      "가이드라인 관련 용어"
    ],
    "intentPatterns": [
      "how.*to",
      "best.*practice",
      "guideline.*for"
    ]
  }
}
```

### Tool Skill (도구)

```json
{
  "type": "tool",
  "promptTriggers": {
    "keywords": [
      "도구명", "작업명"
    ],
    "intentPatterns": [
      "(create|generate|build).*도구명",
      "도구명.*(help|guide|how)"
    ]
  }
}
```

## 우선순위 (Priority) 설정

| 우선순위 | 언제 사용 | 예시 |
|---------|----------|------|
| **critical** | 필수 가이드라인, 보안 | error-tracking, security-check |
| **high** | 자주 사용, 중요 도메인 | frontend-dev-guidelines |
| **medium** | 일반 스킬 | skill-health-checker |
| **low** | 특수 상황, 고급 기능 | advanced-optimization |

## 충돌 방지

### 문제: 여러 스킬이 동시 매칭

```
사용자: "스킬 만들기"

매칭:
- skill-developer (keywords: ["스킬", "만들기"])
- skill-health-checker (keywords: ["스킬", "체크"]) ← 오매칭
```

### 해결책 1: 더 구체적인 키워드

```json
{
  "skill-developer": {
    "keywords": ["스킬 만들기", "스킬 생성", "create skill"]
  },
  "skill-health-checker": {
    "keywords": ["스킬 진단", "스킬 체크", "skill health"]
  }
}
```

### 해결책 2: 인텐트 패턴 활용

```json
{
  "skill-developer": {
    "intentPatterns": ["(create|generate|make).*skill"]
  },
  "skill-health-checker": {
    "intentPatterns": ["(check|diagnose|validate).*skill"]
  }
}
```

### 해결책 3: 우선순위 조정

```json
{
  "skill-developer": {
    "priority": "high"  // 더 자주 사용
  },
  "skill-health-checker": {
    "priority": "medium"
  }
}
```

## 디버깅 트리거

### 테스트 방법

```bash
# 1. 트리거 추가
# 2. 검증
node tests/validate-skill-rules.js

# 3. 활성화 테스트
node tests/run-activation-tests.js

# 4. 실제 테스트
# Claude Code에서 트리거 문구 입력
```

### 흔한 문제

**문제 1: 트리거가 작동 안 함**
- skill-rules.json 등록 확인
- JSON 문법 오류 확인
- Claude Code 재시작

**문제 2: 너무 자주 트리거됨**
- 키워드가 너무 일반적
- 더 구체적으로 변경

**문제 3: 충돌**
- 다른 스킬과 키워드 중복
- 인텐트 패턴으로 차별화

## 예제: skill-health-checker

```json
{
  "skill-health-checker": {
    "type": "tool",
    "enforcement": "suggest",
    "priority": "medium",
    "description": "스킬 건강도 진단 및 유지보수 가이드. 500줄 규칙, skill-rules.json 동기화, YAML 검증을 수행합니다.",
    "promptTriggers": {
      "keywords": [
        "스킬 진단",
        "스킬 체크",
        "skill health",
        "skill check",
        "500줄",
        "스킬 검증",
        "skill-rules 검증"
      ],
      "intentPatterns": [
        "(check|validate|diagnose).*skill",
        "skill.*(health|quality|validation)",
        "스킬.*(검증|진단|체크)",
        "500.*(line|줄)"
      ]
    }
  }
}
```

**분석**:
- **keywords**: 명확한 용어 7개
- **intentPatterns**: 유연한 패턴 4개
- **priority**: medium (일반적 사용)
- **type**: tool (진단 도구)

## 체크리스트

- [ ] 키워드 3-5개
- [ ] 인텐트 패턴 2-3개
- [ ] 구체적인 용어 사용
- [ ] 다국어 (한글/영어) 지원
- [ ] 충돌 방지 확인
- [ ] 우선순위 적절
- [ ] 테스트 완료

## 추가 리소스

- Anthropic 트리거 가이드: [Skills Documentation](https://docs.claude.com/en/docs/claude-code/skills)
- 프로젝트 예시: `plugins/*/skills/skill-rules.json`
- 검증 스크립트: `tests/validate-skill-rules.js`
