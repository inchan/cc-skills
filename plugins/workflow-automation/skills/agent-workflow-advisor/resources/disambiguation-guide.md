# Critical Decision Points (Disambiguations)

이 가이드는 패턴 선택 시 자주 발생하는 혼란을 명확히 합니다.

## 1. Sequential vs Parallel: The Dependency Test

**Ask**: "Can I do task B without completing task A first?"

```markdown
## Dependency Analysis

Task: "Build user profile feature with upload, crop, and save"

Subtasks:
1. Design UI component
2. Create backend API
3. Set up S3 storage
4. Implement image processing

**Dependency Check:**
- UI needs API contract? → **YES, dependency exists**
- API needs S3 config? → **YES, dependency exists**
- UI and S3 setup simultaneously? → **NO, UI needs final endpoint**

**Result**: Sequential (dependencies force ordering)
**Alternative**: Define API contract FIRST, then Parallel for implementation

---

Task: "Run unit tests, integration tests, E2E tests"

**Dependency Check:**
- Unit tests need integration tests? → **NO**
- E2E needs unit tests? → **NO** (can run independently)

**Result**: Parallel (Sectioning) - all independent
```

**Rule**: If ANY subtask depends on another's OUTPUT, use Sequential. If all independent, use Parallel.

## 2. Parallel(Voting) vs Evaluator: Compare or Improve?

**Ask**: "Am I comparing different approaches OR improving a single approach?"

```markdown
## Voting vs Evaluator Decision

**Scenario A: Algorithm Selection**
"Best algorithm for user search - linear, binary, or hash?"

- Multiple approaches exist
- Need to compare and pick best
- One-time decision

**Result**: PARALLEL (Voting)
- Try all 3 approaches
- Score each on criteria
- Select winner

---

**Scenario B: Code Quality Improvement**
"Improve this API endpoint's security and performance"

- One existing implementation
- Need iterative improvement
- Clear quality thresholds to meet

**Result**: EVALUATOR
- Evaluate current state
- Provide feedback
- Apply improvements
- Re-evaluate until threshold met
```

**Key Distinction**:
- **Voting**: "Which approach is best?" (comparison)
- **Evaluator**: "How do I make this better?" (refinement)

## 3. Sequential vs Orchestrator: Known vs Discovered

**Ask**: "Do I know ALL subtasks upfront, or will I discover them?"

```markdown
## Known vs Discovered Subtasks

**Scenario A: User Authentication**
"Add JWT auth, OAuth, 2FA support"

Known upfront:
1. JWT implementation
2. OAuth integration
3. 2FA setup

But wait... during implementation:
- Need token refresh logic (discovered)
- Need rate limiting (discovered)
- Need session management (discovered)

**Result**: ORCHESTRATOR
- Initial subtasks known, but more will emerge
- Need adaptive planning

---

**Scenario B: Report Generation**
"Generate quarterly sales report"

Known upfront:
1. Fetch data
2. Calculate metrics
3. Generate charts
4. Compile PDF

No new subtasks expected.

**Result**: SEQUENTIAL
- All steps predictable
- Use gates for validation
```

**Rule**:
- Known and fixed → Sequential
- Known but will grow → Orchestrator

## 4. Complexity Score: Guide, Not Gospel

**The score is a signal, not a decision:**

```markdown
## Complexity as Secondary Factor

**High Complexity (0.8) but Simple Structure**
"Migrate 100 database tables to new schema"
- Complexity: 0.8 (lots of work)
- Structure: Repetitive (same operation 100x)
- Pattern: PARALLEL (Sectioning) - batch process

NOT Orchestrator just because complexity is high.

---

**Low Complexity (0.4) but Needs Gates**
"Add input validation to API endpoint"
- Complexity: 0.4 (straightforward)
- Structure: Needs verification at each step
- Pattern: SEQUENTIAL - validate each change

NOT "No Pattern" just because complexity is low.
```

**Priority Order**:
1. **Structure** (dependencies, predictability)
2. **Goal** (compare vs improve vs build)
3. **Complexity** (as tie-breaker)

## Pattern Combinations

Sometimes one pattern isn't enough:

### Common Combinations

**1. Router → Any Pattern**
```
Task comes in → Router classifies → Routes to appropriate pattern
```
Use when: Multiple types of tasks need handling

**2. Orchestrator → Parallel/Sequential (nested)**
```
Orchestrator decomposes → Some subtasks are parallel, some sequential
```
Use when: Complex project with mixed dependency structures

**3. Any Pattern → Evaluator (chain)**
```
Pattern completes → Evaluator validates quality → Feedback loop if needed
```
Use when: Quality assurance is critical

**4. Sequential with Parallel Steps**
```
Step 1 → Step 2 (parallel: A,B,C) → Step 3 → Step 4
```
Use when: Some steps have independent subtasks

### When NOT to Combine

- Don't add Evaluator if quality is already checked by gates (Sequential)
- Don't use Router if task type is already clear
- Don't nest Orchestrator inside Orchestrator (too complex)
