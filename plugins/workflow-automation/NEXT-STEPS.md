# 다음 단계 계획

**작성일**: 2025-11-26
**현재 상태**: Phase 1A 완료
**다음 Phase**: Phase 1B (27.5시간 예상)

---

## 📋 현재 상황

### Phase 1A 완료 (2025-11-26)

✅ **완료된 작업**:
- advisor 리팩토링 (831 → 277줄)
- parallel 리팩토링 (602 → 347줄)
- orchestrator Deprecation 마킹
- 500줄 검증 스크립트 작성

✅ **성과**:
- 2개 스킬 500줄 제한 준수
- Progressive Disclosure 패턴 검증
- 85% 시간 단축 (10시간 → 1.5시간)

### 남은 문제

❌ **500줄 제한 위반** (4개):
- orchestrator: 825줄 (deprecated, 무시 가능)
- dynamic: 703줄 (40% 초과)
- sequential: 548줄 (9% 초과)
- router: 502줄 (0.4% 초과)

⚠️ **경고** (1개):
- manager: 469줄 (93% 사용, 버퍼 31줄)

---

## 🎯 Phase 1B: 중위험 작업

### 목표
나머지 3개 스킬 500줄 제한 준수 및 코드 품질 개선

### 작업 목록

#### 1. router 리팩토링 (우선순위: HIGH)
**예상 시간**: 1시간
**현재 상태**: 502줄 (0.4% 초과, 2줄만 제거하면 됨)

**작업 내용**:
- Option A (간단): 주석 또는 빈 줄 2줄 제거
- Option B (권장): 복잡도 분석 로직 분리
  - `resources/complexity-analysis-guide.md` 생성
  - SKILL.md는 간단한 설명만 유지

**예상 결과**: 502 → 450줄

---

#### 2. sequential 리팩토링 (우선순위: MEDIUM)
**예상 시간**: 2시간
**현재 상태**: 548줄 (9% 초과, 48줄 제거 필요)

**작업 내용**:
- 상세 예제 분리 (예상: 60줄)
  - `examples/complete-sequential-workflow.md`
- Gate Validation 패턴 분리 (예상: 30줄)
  - `resources/gate-validation-patterns.md`

**예상 결과**: 548 → 458줄

---

#### 3. dynamic 리팩토링 (우선순위: HIGH)
**예상 시간**: 4시간
**현재 상태**: 703줄 (40% 초과, 203줄 제거 필요)

**작업 내용**:
- 6개 워커 상세 설명 분리 (예상: 180줄)
  - `resources/worker-specifications.md`
- Orchestrator 패턴 상세 분리 (예상: 80줄)
  - `resources/orchestrator-pattern-deep-dive.md`
- 완전한 예제 분리 (예상: 100줄)
  - `examples/complete-orchestrator-example.md`

**예상 결과**: 703 → 343줄

---

#### 4. manager 버퍼 확보 (우선순위: LOW)
**예상 시간**: 2시간
**현재 상태**: 469줄 (93% 사용, 버퍼 31줄)

**목표**: 420줄 이하 (80줄 버퍼 확보)

**작업 내용**:
- 통합 예제 분리 (예상: 50줄)
  - `examples/manager-workflow-example.md`
- 패턴 비교표 간소화 (예상: 20줄)

**예상 결과**: 469 → 399줄

---

#### 5. integration.py 삭제 (우선순위: HIGH)
**예상 시간**: 0.5시간
**파일 수**: 4개

**작업 내용**:
```bash
rm skills/parallel-task-executor/integration.py
rm skills/intelligent-task-router/integration.py
rm skills/sequential-task-processor/integration.py
rm skills/dynamic-task-orchestrator/integration.py
```

**근거**:
- Phase 0 검증: 하드코딩 경로로 실행 불가
- 외부 의존성 (message_protocol 등) 존재하지 않음
- 어디에서도 import 되지 않음

---

#### 6. 복잡도 로직 재설계 (우선순위: CRITICAL)
**예상 시간**: 10시간
**문제**: router와 advisor가 다른 철학으로 복잡도 사용

**현재 상황**:
- **router**: 복잡도 → 모델 선택 (Haiku < 0.4 < Sonnet < 0.7 < Opus)
- **advisor**: 구조 우선, 복잡도는 보조 (tie-breaker)

**설계 옵션**:

**Option A: 통합 불가 (권장)**
- router와 advisor 각각 유지
- 명확히 문서화: "서로 다른 목적"
- 작업량: 2시간 (문서화만)

**Option B: Advisor 중심 재설계**
```python
# 새로운 통합 로직
def select_pattern_and_model(task):
    # Step 1: Structure analysis (advisor)
    structure = analyze_structure(task)
    if structure == "sequential_dependencies":
        pattern = "sequential"
    elif structure == "independent_tasks":
        pattern = "parallel"
    # ...

    # Step 2: Complexity for model selection (router)
    complexity = analyze_complexity(task)
    if complexity < 0.4:
        model = "haiku"
    elif complexity < 0.7:
        model = "sonnet"
    else:
        model = "opus"

    return pattern, model
```
- 작업량: 10시간 (설계 + 구현 + 테스트)

**권장**: **Option A** (문서화만, 2시간)

---

#### 7. lib/ 디렉토리 생성 (우선순위: MEDIUM)
**예상 시간**: 8시간 (Option A 선택 시 불필요)

**Option A (권장)**: lib/ 생성 안 함
- 이유: 복잡도 로직 통합 불가 (Option A 선택)
- 대신: 각 스킬에서 독립적으로 유지
- 작업량: 0시간

**Option B**: lib/ 생성
- `lib/complexity-analyzer.js`: 공통 복잡도 분석
- `lib/pattern-matcher.js`: 패턴 매칭 로직
- `lib/model-selector.js`: 모델 선택 로직
- 작업량: 8시간

---

### Phase 1B 총 예상 시간

#### 최소 계획 (Option A: 통합 불가)
```
1. router 리팩토링:         1시간
2. sequential 리팩토링:     2시간
3. dynamic 리팩토링:        4시간
4. manager 버퍼 확보:       2시간
5. integration.py 삭제:     0.5시간
6. 복잡도 로직 문서화:      2시간 (Option A)
7. lib/ 생성:               0시간 (생략)
────────────────────────────────────
Phase 1B 총계:              11.5시간
```

#### 최대 계획 (Option B: 재설계)
```
1-5. (동일)                 9.5시간
6. 복잡도 로직 재설계:      10시간 (Option B)
7. lib/ 생성:               8시간
────────────────────────────────────
Phase 1B 총계:              27.5시간
```

**권장**: **최소 계획 (11.5시간)** - 통합 불가 인정, 문서화만

---

## 🗓️ 실행 계획

### Week 1: Phase 1B 실행 (11.5시간)

**Day 1 (3시간)**:
- [ ] router 리팩토링 (1시간)
- [ ] sequential 리팩토링 (2시간)

**Day 2 (4.5시간)**:
- [ ] dynamic 리팩토링 (4시간)
- [ ] integration.py 삭제 (0.5시간)

**Day 3 (4시간)**:
- [ ] manager 버퍼 확보 (2시간)
- [ ] 복잡도 로직 문서화 (2시간)

### Week 2: Phase 2-4 (선택)

Phase 1B 완료 후 평가하여 결정:
- Phase 2: 명확성 개선 (12시간)
- Phase 3: 공통 리소스 분리 (16시간)
- Phase 4: 테스트 및 배포 (16시간)

---

## 📊 전체 프로젝트 타임라인

### 완료
- ✅ Phase 0: 사전 검증 (1.5시간, 예상 8시간)
- ✅ Phase 1A: 저위험 작업 (1.5시간, 예상 10시간)

### 진행 중
- ⏳ **Phase 1B: 중위험 작업 (11.5시간 예상)**

### 대기 중
- ⏸️ Phase 2: 명확성 개선 (12시간)
- ⏸️ Phase 3: 공통 리소스 분리 (16시간)
- ⏸️ Phase 4: 테스트 및 배포 (16시간)

### 전체 예상
- **최소**: Phase 0-1B만 (14.5시간)
- **권장**: Phase 0-2 (26.5시간)
- **최대**: Phase 0-4 (58.5시간)

**원래 계획**: 95시간
**현재 계획**: 58.5시간 (38% 단축)

---

## ✅ 성공 기준

### Phase 1B 완료 기준
- [ ] 모든 SKILL.md 500줄 이하
- [ ] orchestrator 제외 시 위반 0개
- [ ] 검증 스크립트 통과
- [ ] Breaking Change 없음
- [ ] 문서화 완료

### 전체 프로젝트 완료 기준
- [ ] 500줄 제한 100% 준수
- [ ] 중복 코드 30% 감소
- [ ] 모든 스킬에 검증 기준
- [ ] 사용자 가이드 업데이트
- [ ] 테스트 커버리지 80% 이상

---

## 🚀 시작 방법

### Phase 1B 킥오프
```bash
# 1. 검증 스크립트 실행 (현재 상태 확인)
bash scripts/validate-500-line-limit.sh

# 2. router 리팩토링 시작
cd skills/intelligent-task-router

# 3. 작업 브랜치 생성 (선택)
git checkout -b feature/phase1b-router
```

---

**작성자**: Claude Code
**문서 버전**: 1.0
**다음 업데이트**: Phase 1B 완료 시
