# Advanced Scenarios

복잡한 시나리오에서 패턴을 선택하기 위한 심화 가이드입니다.

## Mixed Dependencies: Phased Execution

**Problem**: Some subtasks are independent AFTER a dependency is resolved.

```markdown
## Example: Backend API + Frontend + Mobile

Dependency Structure:
- Backend API: Independent (start first)
- Frontend UI: Depends on API
- Mobile App: Depends on API
- Frontend ↔ Mobile: Independent of each other

**Wrong Approach**: Pure Sequential
1. Build API
2. Build Frontend
3. Build Mobile
→ Total time: 3 units

**Right Approach**: Phased Execution
Phase 1 (Sequential): Build API (blocker)
Phase 2 (Parallel): Build Frontend AND Mobile simultaneously
→ Total time: 2 units (33% faster)
```

**Pattern**: **SEQUENTIAL with Parallel Phases**

```
[Blocker Task] → [Parallel Tasks] → [Integration]
```

**How to Identify**:
1. List all subtasks
2. Map dependencies (what blocks what?)
3. Group independent tasks after blockers
4. Execute: Blockers sequentially, then independents in parallel

**Decision Rule**:
- If dependencies exist BUT some tasks are independent after blocker → Phased Execution
- If ALL tasks are sequential → Pure Sequential
- If ALL tasks are independent → Pure Parallel

## Partial Knowledge: Discovery Likelihood

**Problem**: You know SOME subtasks, but might discover more.

**Spectrum**:
```
|--------------------|--------------------|---------------------|
Low Discovery        Medium Discovery     High Discovery
(90% known)          (60-80% known)       (<60% known)
↓                    ↓                    ↓
SEQUENTIAL           FLEXIBLE SEQUENTIAL  ORCHESTRATOR
(proceed, adjust     (plan for extras,    (expect significant
if needed)           reserve 20% buffer)  scope evolution)
```

**Assessment Questions**:
1. What percentage of work is clearly defined?
2. How likely is scope expansion?
3. How impactful would undiscovered tasks be?

**Example Assessments**:

```markdown
## Low Discovery (Use Sequential)
Task: "Add notification system - Email, SMS, Push"
- 3 known channels: 90% of work
- Possible extras: Common interface (10%)
- Impact if missed: Minor refactor
→ Use SEQUENTIAL, add tasks if discovered

## Medium Discovery (Use Flexible Sequential)
Task: "Implement payment system"
- Known: Card payment, basic flow (60%)
- Likely extras: Refunds, webhooks, fraud detection (30-40%)
- Impact if missed: Significant redesign
→ Use SEQUENTIAL with checkpoints, prepare for additions

## High Discovery (Use Orchestrator)
Task: "Modernize legacy system"
- Known: Some pain points (40%)
- Unknown: Full scope of issues (60%+)
- Impact if missed: Project failure
→ Use ORCHESTRATOR for adaptive planning
```

## External Changes vs Internal Discovery

**Two types of uncertainty**:

1. **Internal Discovery** (Orchestrator territory)
   - New subtasks emerge from doing the work
   - Technical complexity reveals hidden requirements
   - "We found out we need X while building Y"

2. **External Changes** (Requires human checkpoint)
   - Requirements change from outside
   - Business priorities shift
   - "Client changed their mind about Z"

**Handling**:
- Internal Discovery → Orchestrator (adaptive planning)
- External Changes → Sequential with Human Checkpoints
- Both → Orchestrator + User Reviews at milestones

```markdown
## Example: Legacy Refactoring with Possible Requirement Changes

"Refactor auth module, but requirements might change"

**Analysis**:
- Internal discovery likely (hidden tech debt)
- External changes possible (business priorities)

**Recommendation**: ORCHESTRATOR + User Checkpoints
- Orchestrator handles internal discoveries
- User checkpoints catch external changes
- Review at: 25%, 50%, 75% completion
```

## Unclear Quality Criteria: Prerequisite Questions

**Problem**: Evaluator pattern needs clear metrics, but user provides vague goals.

**Before recommending Evaluator, ask**:

```markdown
## Prerequisite Questions for Quality Improvement

Your goal: "Make this code better"

**I need clarity on**:

1. **What dimensions matter most?**
   - [ ] Performance (speed, memory)
   - [ ] Security (vulnerabilities, auth)
   - [ ] Readability (clean code, maintainability)
   - [ ] Test coverage
   - [ ] Documentation

2. **What are your thresholds?**
   - Performance: Target response time? (e.g., < 200ms)
   - Security: Compliance level? (e.g., OWASP Top 10)
   - Readability: Complexity score? (e.g., cyclomatic < 10)
   - Coverage: Percentage? (e.g., > 80%)

3. **What's "good enough"?**
   - Perfect score on all dimensions?
   - Meeting minimum thresholds?
   - Relative improvement? (e.g., 30% better)

4. **Constraints?**
   - Max iterations allowed?
   - Time budget?
   - Breaking changes acceptable?

**Once you provide these, I can recommend Evaluator with confidence.**

**If you can't define these**:
Consider if you need comparison (Voting) instead of improvement (Evaluator).
"I don't know what's best" → Try multiple approaches → PARALLEL (Voting)
"I want this specific thing better" → Iterative refinement → EVALUATOR
```

## User Override: When You Disagree

**Scenario**: You recommend X, user wants Y.

**Response Framework**:

```markdown
## Override Acknowledgment

You want: [Pattern Y]
My recommendation was: [Pattern X]

**Respectful pushback** (if pattern seems wrong):

"I understand you want to use [Y]. Before proceeding, consider:

- **Risk**: [What could go wrong with Y]
- **Overhead**: [Extra cost of using Y]
- **Alternative**: [Why X might be better]

If you still prefer [Y], I'll support that choice. You know your context best.

**Questions to confirm**:
- What information do you have that changes the analysis?
- Is there a specific reason Y fits better?
- Are you willing to accept the trade-offs?"

**Full support** (if pattern is reasonable):

"You chose [Y] instead of [X]. Both are valid options.

Your choice makes sense if:
- [Condition where Y works]
- [Another valid reason]

Proceeding with [Y]."

**Strong warning** (if pattern is clearly wrong):

"⚠️ Using [Y] for this task has significant risks:

- [Critical issue 1]
- [Critical issue 2]

This could result in:
- [Consequence]

I strongly recommend reconsidering. If you proceed, please be aware of these risks."
```

**Examples**:

```markdown
## Example 1: Mild Override
Task: "Simple bug fix"
My rec: No Pattern
User wants: Sequential (for learning)

Response: "Using Sequential for a simple bug fix adds overhead, but it's fine for learning purposes. Proceed."

## Example 2: Reasonable Override
Task: "Build 3 microservices"
My rec: Parallel (Sectioning)
User wants: Sequential (wants validation)

Response: "Sequential works if you want quality gates between each service. You'll trade speed for validation. Valid choice."

## Example 3: Strong Warning
Task: "Write hello world"
User wants: Orchestrator (thinks it's complex)

Response: "⚠️ Orchestrator is for complex, open-ended projects. 'Hello world' is a single line of code. Using Orchestrator here wastes resources. Please reconsider."
```
