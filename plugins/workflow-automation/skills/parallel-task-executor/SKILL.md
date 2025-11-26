---
name: parallel-task-executor
description: Implements Anthropic's Parallelization pattern with two modes - Sectioning (independent subtasks in parallel) and Voting (multiple approaches evaluated). Use when tasks decompose into independent units or when comparing implementation strategies. Delivers 2-10x speedup or consensus-based decisions.
---

# Parallel Task Executor (Parallelization Pattern)

## Overview

This skill implements the **Parallelization** workflow pattern from Anthropic's "Building Effective Agents". The core principle is to execute LLM tasks simultaneously and programmatically aggregate results, using either **Sectioning** (split work) or **Voting** (multiple approaches).

**Reference**: https://www.anthropic.com/engineering/building-effective-agents

### Key Principle

> "Parallelization: LLMs can sometimes work simultaneously on a task and have their outputs aggregated programmatically."

**Two Manifestations:**

1. **Sectioning**: "Breaking a task into independent subtasks run in parallel"
2. **Voting**: "Running the same task multiple times to get diverse outputs"

**Trade-off**: Additional compute cost for speed (sectioning) or confidence (voting).

## When to Use This Skill

### Use Sectioning Mode When:
- Task breaks into **independent subtasks** (no dependencies)
- Speed is critical (deadline pressure)
- Components can be **merged programmatically**
- Work spans multiple domains (frontend + backend + database)

**Examples:**
- Build microservices architecture (3-5 services in parallel)
- Run test suite (unit + integration + e2e concurrently)
- Create documentation (API docs + user guide + tutorials)
- Deploy multi-region infrastructure

### Use Voting Mode When:
- **Multiple valid approaches** exist
- Need **confidence** in the solution
- Evaluating **trade-offs** between strategies
- Detecting **bugs or vulnerabilities** (diverse perspectives)

**Examples:**
- Code review (security + performance + maintainability perspectives)
- Algorithm selection (functional vs. imperative vs. hybrid)
- Content generation (different tones/styles)
- Risk assessment (multiple analyst perspectives)

### Do NOT Use When:
- Task is inherently sequential (strong dependencies)
- Overhead exceeds benefit (simple tasks)
- Limited resources (compute/memory constraints)
- Results cannot be merged programmatically

## Sectioning Mode Workflow

### Step 1: Task Decomposition

Identify independent subtasks:

```markdown
## Sectioning Analysis: [Main Task]

### Main Task
[Full task description]

### Independent Subtasks
1. **Subtask A**: [Description] - Dependencies: None
2. **Subtask B**: [Description] - Dependencies: None
3. **Subtask C**: [Description] - Dependencies: None

### Dependency Graph
```
[A] ──┐
[B] ──┼──→ [Merge] → [Final Output]
[C] ──┘
```

### Parallelization Plan
- **Parallel Execution**: A, B, C (simultaneously)
- **Sync Point**: After all complete
- **Merge Strategy**: [How to combine results]
- **Expected Speedup**: 3x (3 tasks, 1 time unit)
```

### Step 2: Parallel Execution

Execute all independent subtasks simultaneously:

```markdown
## Parallel Execution

### Worker 1: [Subtask A]
**Status**: In Progress
**Output**: [Result A]

### Worker 2: [Subtask B]
**Status**: In Progress
**Output**: [Result B]

### Worker 3: [Subtask C]
**Status**: In Progress
**Output**: [Result C]

### Sync Point
**All workers completed**: Yes
**Ready for merge**: Yes
```

### Step 3: Result Aggregation

Merge results from parallel workers:

```markdown
## Merge Results

### Inputs
- Worker 1 output: [Result A]
- Worker 2 output: [Result B]
- Worker 3 output: [Result C]

### Merge Process
1. **Import consolidation**: Deduplicate shared dependencies
2. **Interface alignment**: Ensure consistent API contracts
3. **Configuration unification**: Single config file
4. **Integration testing**: Verify merged system works

### Conflicts Detected
- [Conflict 1]: How resolved
- [Conflict 2]: How resolved

### Final Output
[Integrated result with all components working together]
```

## Voting Mode Workflow

### Step 1: Define Evaluation Criteria

```markdown
## Voting Setup: [Task]

### Task
[Task to be solved with multiple approaches]

### Evaluation Criteria (Weighted)
1. **Performance**: 40% weight - Execution speed, memory usage
2. **Readability**: 30% weight - Code clarity, maintainability
3. **Robustness**: 30% weight - Error handling, edge cases

### Voting Strategies
- Strategy A: [Approach description]
- Strategy B: [Approach description]
- Strategy C: [Approach description]

### Success Threshold
- Minimum score: 70/100
- Consensus requirement: 2/3 voters agree on key aspects
```

### Step 2: Execute Multiple Approaches

```markdown
## Voting Execution

### Voter 1: [Strategy A - e.g., Functional Approach]
**Implementation**:
[Code/solution using this approach]

**Self-Assessment**:
- Performance: 7/10
- Readability: 9/10
- Robustness: 8/10

### Voter 2: [Strategy B - e.g., Object-Oriented Approach]
**Implementation**:
[Code/solution using this approach]

**Self-Assessment**:
- Performance: 8/10
- Readability: 7/10
- Robustness: 8/10

### Voter 3: [Strategy C - e.g., Hybrid Approach]
**Implementation**:
[Code/solution using this approach]

**Self-Assessment**:
- Performance: 9/10
- Readability: 8/10
- Robustness: 9/10
```

### Step 3: Aggregate and Select Winner

```markdown
## Vote Aggregation

### Scoring Matrix
| Voter | Performance (40%) | Readability (30%) | Robustness (30%) | Total |
|-------|-------------------|-------------------|-------------------|-------|
| A (Functional) | 7 × 0.4 = 2.8 | 9 × 0.3 = 2.7 | 8 × 0.3 = 2.4 | 7.9 |
| B (OOP) | 8 × 0.4 = 3.2 | 7 × 0.3 = 2.1 | 8 × 0.3 = 2.4 | 7.7 |
| C (Hybrid) | 9 × 0.4 = 3.6 | 8 × 0.3 = 2.4 | 9 × 0.3 = 2.7 | 8.7 |

### Winner
**Strategy C (Hybrid)** with score 8.7/10

### Rationale
- Highest performance score (critical for this use case)
- Good readability (above threshold)
- Best robustness (handles edge cases)

### Consensus Points
- All approaches agree on: [common patterns]
- Key differentiator: [what made winner stand out]

### Final Decision
[Chosen approach with justification]
```


## Complete Examples

For detailed implementation examples:

### Sectioning Mode
See [examples/fullstack-sectioning-example.md](examples/fullstack-sectioning-example.md) for:
- Full-stack e-commerce application (React + Node.js + PostgreSQL)
- Phase-based parallel execution
- Conflict resolution during integration
- Docker composition

### Voting Mode
See [examples/algorithm-voting-example.md](examples/algorithm-voting-example.md) for:
- Algorithm comparison (Linear vs Binary vs Hash)
- Weighted scoring matrix
- Performance benchmarking
- Winner selection process

## Integration with Other Skills

### From Router
```
Router identifies: "This task has 3 independent components"
→ Routes to: parallel-task-executor (sectioning mode)
```

### To Evaluator
```
Parallel execution complete
→ Send merged results to: iterative-quality-enhancer
→ Request: "Evaluate integration quality and suggest improvements"
```

### With Sequential Processor
```
Each parallel worker can use sequential processing internally:
Worker 1: [Sequential steps for component A]
Worker 2: [Sequential steps for component B]
Worker 3: [Sequential steps for component C]
```

### With Orchestrator
```
Orchestrator: "I need 3 services built"
→ Delegates to: parallel-task-executor
→ Parallel builds all 3
→ Returns to: orchestrator for overall coordination
```

## Best Practices

### 1. Verify Independence
Before parallelizing, confirm subtasks truly have no dependencies:
- No shared state
- No sequential data flow
- No mutual exclusion requirements

### 2. Define Clear Contracts
When splitting work:
- API interfaces before implementation
- Shared types/schemas upfront
- Clear integration points

### 3. Plan Merge Strategy
Know how results will combine:
- File merging rules
- Conflict resolution strategy
- Integration testing approach

### 4. Monitor Speedup
Track actual vs. expected speedup:
- If < 1.5x, reconsider parallelization
- Overhead costs (context, merge) matter

### 5. Use Voting for Uncertainty
When unsure of best approach:
- Define clear criteria
- Weight criteria by importance
- Document decision rationale

### 6. Respect Resource Limits
Don't over-parallelize:
- 2-10 workers is typical range
- More workers ≠ more speedup
- Memory and CPU constraints matter

## Performance Characteristics

### Sectioning Mode
- **Ideal speedup**: N times (N parallel tasks)
- **Realistic speedup**: 2-5x (overhead costs)
- **Overhead sources**: Task distribution, result merging, conflict resolution

### Voting Mode
- **Value**: Confidence in decision, not speed
- **Typical voters**: 3-5 approaches
- **Cost**: 3-5x compute for single decision
- **Benefit**: Higher quality solution

### When to Avoid
| Scenario | Reason |
|----------|--------|
| Strong dependencies | Can't parallelize |
| Simple task (<5 min) | Overhead exceeds benefit |
| Resource constrained | Memory/CPU limits |
| Real-time response needed | Merge adds latency |

## Summary

The Parallel Task Executor implements Anthropic's Parallelization pattern by:

1. **Sectioning**: Breaking independent work into parallel units
2. **Executing**: Running multiple workers simultaneously
3. **Aggregating**: Merging results programmatically
4. **Voting**: Comparing multiple approaches for best solution
5. **Selecting**: Choosing optimal approach based on criteria

This pattern excels when:
- Tasks decompose into truly independent subtasks (Sectioning)
- Multiple valid solutions exist and need evaluation (Voting)
- Speed or confidence matters more than compute cost

**Remember**: Parallelization trades **compute cost** for **speed** (sectioning) or **confidence** (voting). Only use when the trade-off is worthwhile.
