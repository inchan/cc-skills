# Tests

Claude Code Skills 프로젝트의 테스트 및 검증 도구 모음입니다.

## 테스트 파일 목록

### install-skills.test.js

install-skills.js의 단위 테스트입니다.

#### 사용법

```bash
node tests/install-skills.test.js
```

#### 테스트 내용

- 경로 검증 (validatePath)
- 스킬 규칙 병합 (mergeSkillRules)
- 설정 병합 (mergeSettings)
- 엣지 케이스 처리

---

### uninstall-skills.test.js

uninstall-skills.js의 단위 테스트입니다.

#### 사용법

```bash
node tests/uninstall-skills.test.js
```

#### 테스트 내용

- 제거 기능 검증
- 백업 및 복원 테스트
- 부분 제거 테스트

---

### run-activation-tests.js

스킬 자동 활성화 규칙을 테스트합니다.

#### 사용법

```bash
node tests/run-activation-tests.js
```

#### 테스트 내용

- 키워드 매칭 테스트
- 인텐트 패턴 검증
- 우선순위 확인
- 결과는 `activation-test-results.json`에 저장

---

### validate-skill-rules.js

skill-rules.json의 유효성을 검사합니다.

#### 사용법

```bash
node tests/validate-skill-rules.js
```

#### 검증 내용

- JSON 구조 유효성
- 필수 필드 존재 확인
- 트리거 패턴 문법 검증
- 우선순위 값 검증

---

### validate-skills.sh

전체 스킬의 구조와 규칙을 검증하는 종합 스크립트입니다.

#### 사용법

```bash
bash tests/validate-skills.sh
```

#### 검증 내용

- 스킬 디렉토리 구조 검증
- SKILL.md 파일 존재 확인
- YAML frontmatter 유효성
- skill-rules.json과의 일관성 검사
- 결과는 `VALIDATION-REPORT.md`에 저장

---

### integration-test.sh

전체 프로젝트의 통합 테스트를 실행합니다 (v2.0.0).

#### 사용법

```bash
bash tests/integration-test.sh
```

#### 테스트 내용

8개 테스트 스위트:
1. **플러그인 JSON 검증** - 7개 플러그인의 plugin.json 유효성
2. **skill-rules.json 검증** - 7개 플러그인의 skill-rules.json
3. **Hook 집계 검증** - skill-activation-hook.sh의 다중플러그인 집계
4. **Marketplace 검증** - marketplace.json 유효성
5. **의존성 검증** - package.json 및 node_modules
6. **스킬 개수 확인** - 23개 스킬 존재 여부
7. **커맨드 확인** - 4개 커맨드 존재 여부
8. **에이전트 확인** - 3개 에이전트 존재 여부

#### 출력 예시

```
✅ 플러그인 JSON 검증: 7/7 통과
✅ skill-rules.json 검증: 7/7 통과
✅ Hook 집계: 20개 스킬 감지
✅ 전체 테스트 통과!
```

---

### dependency-analysis.json

스킬 간 의존성 분석 결과입니다.

#### 생성 방법

```bash
node scripts/analyze-dependencies.js
```

#### 내용

- 스킬 간 참조 관계
- 의존성 그래프
- 순환 참조 감지

---

## 테스트 결과 파일

### activation-test-results.json

스킬 활성화 테스트 결과가 저장됩니다.

### VALIDATION-REPORT.md

전체 스킬 검증 결과 리포트입니다.

### skill-activation-matrix.md

스킬 활성화 매트릭스 문서입니다.

---

## 개발 가이드

### 새 테스트 추가

1. `tests/` 폴더에 테스트 파일 생성
2. 파일명: `{target-name}.test.js` 또는 `validate-{feature}.js`
3. 실행 권한 설정: `chmod +x tests/your-test.js`
4. 이 README에 문서화

### 테스트 작성 규칙

- **단위 테스트**: `*.test.js` - assert 모듈 사용
- **검증 스크립트**: `validate-*.js` - 독립 실행 가능
- **통합 테스트**: `run-*.js` - 여러 검증을 조합
- **결과 파일**: JSON 또는 Markdown 형식으로 저장

### 실행 순서 (v2.0.0)

전체 검증을 실행하려면:

```bash
# 1. 통합 테스트 (권장 - 전체 검증)
bash tests/integration-test.sh

# 2. 개별 검증 (필요시)
node tests/validate-skill-rules.js    # 스킬 규칙
bash tests/validate-skills.sh          # 스킬 구조
node tests/run-activation-tests.js     # 활성화 테스트

# 3. 단위 테스트
node tests/install-skills.test.js
node tests/uninstall-skills.test.js
```

#### 빠른 검증

```bash
# v2.0.0 빠른 체크
bash tests/integration-test.sh && echo "✅ 모든 테스트 통과!"
```

---

## CI/CD 통합

GitHub Actions나 다른 CI 시스템에서 사용할 수 있습니다:

```yaml
- name: Run Tests
  run: |
    node tests/validate-skill-rules.js
    bash tests/validate-skills.sh
    node tests/install-skills.test.js
    node tests/uninstall-skills.test.js
```
