# Complete Analysis Example

실제 복잡한 요청에 대한 전체 분석 프로세스 예제입니다.

## User Request

"우리 레거시 모놀리식 앱을 마이크로서비스로 분리하고 싶어요. User, Product, Order 세 개의 서비스로 나눌 계획입니다."

## Analysis

```markdown
## Task Analysis: Monolith to Microservices Migration

### Task Summary
Decompose a legacy monolithic application into 3 microservices: User Service, Product Service, and Order Service.

### Characteristics Detected
- **Structure**: Semi-fixed (3 known services, but internal details unknown)
- **Complexity**: 0.85 (High)
  - Multi-component system changes
  - Database splitting required
  - API contract design needed
  - Integration concerns
- **Subtasks**: Mixed (3 services known, but implementation details will emerge)
- **Dependencies**: Complex (services may have shared data, APIs must be coordinated)

### Pattern Recommendation

**Primary Recommendation**: 🎯 **ORCHESTRATOR** (Dynamic Task Orchestrator)

**Reasoning**:
1. **High complexity (0.85)** - Multiple services with unknown internal requirements
2. **Discovery needed** - Will find hidden dependencies during analysis
3. **Multiple specialists required** - Code analysis, architecture design, implementation, testing
4. **Adaptive planning essential** - Scope will evolve as legacy code is analyzed

**Why not other patterns?**
- ❌ Sequential: Too rigid, can't handle discovered dependencies
- ❌ Parallel: Services aren't fully independent (shared DB, APIs)
- ❌ Router: Not about categorizing, it's about building
- ✅ Evaluator: Could add after, for quality validation

**Alternative Patterns**:
- **PARALLEL (Sectioning)**: Use if services are truly independent with no shared state
  - Condition: Each service has separate database and no inter-service calls
  - Benefit: Faster execution (3 services simultaneously)
  - Risk: Integration issues discovered late

- **SEQUENTIAL + EVALUATOR**: Use if you want strict phase gates
  - Condition: Must validate each service before starting next
  - Benefit: Catch issues early
  - Risk: Slower, less adaptive

### Execution Guidance

If you choose **ORCHESTRATOR**:

1. **First step**: Analyze legacy codebase
   - Assign Code Analyzer Worker
   - Discover actual dependencies
   - Map data flows between modules

2. **Key considerations**:
   - Database splitting strategy (shared → separate)
   - API contract versioning
   - Data migration plan
   - Rollback strategy

3. **Expected workflow**:
   - Start with 3 known services
   - Likely discover 5-8 additional subtasks (shared auth, API gateway, etc.)
   - Expect 3-5 replanning cycles
   - Duration: 2-4 hours of orchestrated work

4. **Success metrics**:
   - All 3 services independently deployable
   - Integration tests passing
   - No direct database sharing
   - API contracts documented

### Questions to Consider

1. **독립성**: 세 서비스가 데이터베이스를 공유하나요, 아니면 각각 분리된 DB를 사용할 예정인가요?
   - If shared DB → Orchestrator definitely (need to plan splitting)
   - If separate DBs → Parallel might work

2. **기존 테스트**: 레거시 앱에 테스트가 있나요?
   - If yes → Use them to validate migration
   - If no → Add Test Engineer worker priority

3. **다운타임**: 마이그레이션 중 다운타임이 허용되나요?
   - If no downtime → Need more careful planning, Orchestrator essential
   - If downtime OK → Simpler migration possible

### My Recommendation

Given the complexity and need for discovery, **start with ORCHESTRATOR**.

To activate:
```
"orchestrator 패턴으로 마이크로서비스 마이그레이션 진행해주세요"
```

Or if you want quality validation at the end:
```
"orchestrator로 마이그레이션 후 evaluator로 품질 검증해주세요"
```

---

**Remember**: You know your project best. This is a recommendation based on task characteristics, but you can always choose differently if you have specific constraints or preferences.
```

## Common Scenarios and Recommendations

### Scenario 1: Bug Fix
**Task**: "로그인 페이지 버그 수정"
**Recommendation**: **SEQUENTIAL** (if multi-step) or **No pattern** (if simple)
- Analyze → Fix → Test → Document
- Clear steps, validation needed

### Scenario 2: New Feature
**Task**: "결제 시스템 추가"
**Recommendation**: **ORCHESTRATOR** (high complexity) or **SEQUENTIAL** (medium)
- Multiple unknowns (payment gateway, security, etc.)
- Will discover requirements during work

### Scenario 3: Performance Optimization
**Task**: "API 응답 속도 개선"
**Recommendation**: **EVALUATOR**
- Clear quality metric (response time)
- Iterative improvement with feedback

### Scenario 4: Code Review
**Task**: "보안 관점으로 코드 리뷰"
**Recommendation**: **PARALLEL (Voting)**
- Multiple perspectives (security, performance, maintainability)
- Consensus-based evaluation

### Scenario 5: Documentation
**Task**: "API 문서화"
**Recommendation**: **SEQUENTIAL** or **No pattern**
- Fixed steps: Analyze API → Write docs → Validate → Examples
- Low complexity, predictable

### Scenario 6: Multi-Component Build
**Task**: "React frontend + Node backend + PostgreSQL DB 앱 구축"
**Recommendation**: **PARALLEL (Sectioning)** or **ORCHESTRATOR**
- If truly independent: Parallel for speed
- If need coordination: Orchestrator for adaptation
