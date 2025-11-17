---
name: agent-workflow-orchestrator
description: Full integration of 5 agent patterns (Router, Sequential, Parallel, Orchestrator, Evaluator) into automated workflow pipelines. Analyzes tasks, selects optimal pattern combinations, and executes end-to-end with quality validation. Use for complex projects requiring intelligent pattern selection and automatic execution flow.
---

# Agent Workflow Orchestrator

## Overview

This skill represents **Phase 4: Full Integration** - the complete orchestration layer that combines all 5 agent patterns into intelligent, automated workflows. It builds upon:

- **Phase 1**: Pattern Advisor (recommendation)
- **Phase 2**: Simple Pipelines (predefined sequences)
- **Phase 3**: Dynamic Composition (auto-selection)
- **Phase 4**: Full Integration (automated execution)

**Reference**: https://www.anthropic.com/engineering/building-effective-agents

### Core Philosophy

> "Start with the simplest solution possible, adding complexity only when demonstrably improving outcomes."

This orchestrator adds automation **only where it provides clear value**, maintaining user control and transparency throughout.

---

## Architecture

```
[User Request]
       ↓
[Task Analysis Engine] ─→ Complexity, Structure, Dependencies
       ↓
[Pattern Selection] ─→ Choose optimal pattern or combination
       ↓
[Pipeline Construction] ─→ Build execution plan
       ↓
[Execution Engine] ─→ Run patterns with coordination
       ↓
[Quality Gate] ─→ Evaluator validates output
       ↓
[Final Output + Report]
```

---

## Phase 2: Predefined Pipelines

### Standard Workflow Templates

#### Pipeline 1: Simple Feature (Low Complexity)
```
[Request] → [SEQUENTIAL] → [EVALUATOR] → [Output]
```
**Use when**: Well-defined feature with clear steps
**Example**: "Add password reset to auth system"

```markdown
## Pipeline Execution: Simple Feature

### Stage 1: SEQUENTIAL (5 steps)
1. Requirements analysis → Gate: Complete?
2. Design specification → Gate: Feasible?
3. Implementation → Gate: Compiles?
4. Testing → Gate: Tests pass?
5. Documentation → Gate: Complete?

### Stage 2: EVALUATOR (Quality Check)
- Functionality: 9.5/10 ✓
- Code Quality: 9.2/10 ✓
- Security: 9.8/10 ✓
- Documentation: 8.7/10 ✓

**Pipeline Result**: SUCCESS
**Total Time**: 45 minutes
```

#### Pipeline 2: Multi-Component Build (Medium Complexity)
```
[Request] → [ROUTER] → [PARALLEL (Sectioning)] → [EVALUATOR] → [Output]
```
**Use when**: Independent components that can be built concurrently
**Example**: "Build frontend, backend, and mobile app"

```markdown
## Pipeline Execution: Multi-Component

### Stage 1: ROUTER
- Task Type: feature_development
- Components: 3 (independent)
- Route to: PARALLEL (Sectioning)

### Stage 2: PARALLEL (Sectioning)
Worker 1: Frontend → Complete
Worker 2: Backend → Complete
Worker 3: Mobile → Complete
[Merge Results]

### Stage 3: EVALUATOR
- Integration Quality: 9.0/10 ✓
- Consistency: 8.8/10 ✓

**Pipeline Result**: SUCCESS
**Speedup**: 2.8x vs sequential
```

#### Pipeline 3: Complex Project (High Complexity)
```
[Request] → [ROUTER] → [ORCHESTRATOR] → [EVALUATOR] → [Output]
```
**Use when**: Open-ended project with discovery needs
**Example**: "Build e-commerce platform from scratch"

```markdown
## Pipeline Execution: Complex Project

### Stage 1: ROUTER
- Complexity: 0.85
- Discovery Needed: High
- Route to: ORCHESTRATOR

### Stage 2: ORCHESTRATOR
- Initial Subtasks: 5
- Final Subtasks: 12 (7 discovered)
- Workers Used: 6
- Replanning Cycles: 4

### Stage 3: EVALUATOR
- Overall Quality: 9.3/10 ✓
- Completeness: 100% ✓

**Pipeline Result**: SUCCESS
**Adaptive Value**: Discovered 7 critical subtasks
```

#### Pipeline 4: Optimization Focus
```
[Request] → [EVALUATOR (iterative)] → [Output]
```
**Use when**: Improving existing code quality
**Example**: "Optimize API performance and security"

```markdown
## Pipeline Execution: Optimization

### EVALUATOR (3 iterations)
Iteration 1: 5.6/10 → 7.2/10 (Security fixes)
Iteration 2: 7.2/10 → 8.5/10 (Performance)
Iteration 3: 8.5/10 → 9.3/10 (Documentation)

**Final Score**: 9.3/10 ✓
**Improvement**: +66% quality
```

#### Pipeline 5: Decision Making
```
[Request] → [PARALLEL (Voting)] → [SEQUENTIAL (Implementation)] → [Output]
```
**Use when**: Multiple approaches need evaluation before implementation
**Example**: "Choose best algorithm then implement"

```markdown
## Pipeline Execution: Decision + Implementation

### Stage 1: PARALLEL (Voting)
- Approach A: Score 7.9/10
- Approach B: Score 7.7/10
- Approach C: Score 8.7/10 ✓ Winner

### Stage 2: SEQUENTIAL (Implement Winner)
1. Design → Gate ✓
2. Implement → Gate ✓
3. Test → Gate ✓
4. Document → Gate ✓

**Pipeline Result**: SUCCESS
**Best approach selected and implemented**
```

---

## Phase 3: Dynamic Composition

### Automatic Pattern Selection

When you provide a task, the orchestrator automatically:

1. **Analyzes** task characteristics
2. **Selects** optimal pattern(s)
3. **Constructs** execution pipeline
4. **Executes** with monitoring
5. **Validates** final output

### Selection Algorithm

```markdown
## Dynamic Pattern Selection

### Input: Task Description
"Build user authentication with OAuth, JWT, and 2FA support"

### Analysis
- Complexity: 0.78 (High)
- Structure: Multiple known components + likely discoveries
- Dependencies: Some sequential, some parallel
- Quality Critical: Yes (security)

### Pattern Selection
1. Initial: ORCHESTRATOR (high complexity, discovery likely)
2. Within Orchestrator:
   - JWT + OAuth + 2FA: PARALLEL (Sectioning) - independent
   - Each implementation: SEQUENTIAL (gates needed)
3. Final: EVALUATOR (security critical)

### Constructed Pipeline
```
ORCHESTRATOR {
  Phase 1: Design all components
  Phase 2: PARALLEL {
    Worker A: JWT (SEQUENTIAL internally)
    Worker B: OAuth (SEQUENTIAL internally)
    Worker C: 2FA (SEQUENTIAL internally)
  }
  Phase 3: Integration
  Phase 4: EVALUATOR (security focus)
}
```

### Execution Coordination

```markdown
## Orchestrated Execution

### Phase 1: Dynamic Analysis
Orchestrator discovers:
- Need shared auth middleware
- Need token refresh logic
- Need rate limiting
**Subtasks**: 3 → 6

### Phase 2: Parallel Implementation
```
[JWT Branch]
├─ Step 1: Token generation
├─ Step 2: Verification middleware
└─ Step 3: Refresh logic

[OAuth Branch] (parallel)
├─ Step 1: Provider configuration
├─ Step 2: Callback handling
└─ Step 3: Token mapping

[2FA Branch] (parallel)
├─ Step 1: TOTP implementation
├─ Step 2: Recovery codes
└─ Step 3: Device management
```

### Phase 3: Integration
- Merge branches
- Resolve conflicts (shared middleware)
- Integration testing

### Phase 4: Quality Validation
EVALUATOR scores:
- Security: 9.8/10 ✓
- Functionality: 9.5/10 ✓
- Code Quality: 9.2/10 ✓
```

---

## Phase 4: Full Integration

### Complete Automated Workflow

```markdown
## Full Integration Mode

### User Request
"사용자 대시보드 시스템 구축 - 실시간 분석, 맞춤 위젯, 데이터 시각화"

### Automatic Orchestration

#### Step 1: Deep Analysis
- **Primary Task**: Dashboard system
- **Sub-components**:
  - Real-time analytics (complex, discovery likely)
  - Custom widgets (modular, parallel possible)
  - Data visualization (multiple approaches viable)
- **Overall Complexity**: 0.82
- **Discovery Likelihood**: High (65% known)
- **Quality Requirements**: Performance critical

#### Step 2: Pipeline Construction
```
[ORCHESTRATOR] as main coordinator
├─ Phase 1: Requirements & Architecture (SEQUENTIAL)
│   └─ Gates: Requirements complete? Architecture valid?
│
├─ Phase 2: Core Implementation
│   ├─ Real-time Engine (ORCHESTRATOR - sub-discovery)
│   ├─ Widget System (PARALLEL - Sectioning)
│   └─ Visualization (PARALLEL - Voting then implement)
│
├─ Phase 3: Integration
│   └─ Merge all components (conflict resolution)
│
└─ Phase 4: Quality Assurance
    └─ EVALUATOR (performance focus, 3 iterations max)
```

#### Step 3: Execution with Monitoring

```markdown
## Execution Log

[00:00] ORCHESTRATOR: Starting dashboard project
[00:05] SEQUENTIAL: Requirements analysis
        Gate 1: ✓ Requirements complete
[00:15] SEQUENTIAL: Architecture design
        Gate 2: ✓ Architecture valid
[00:30] PARALLEL: Starting 3 component branches

[Branch A: Real-time Engine]
[00:30] ORCHESTRATOR (nested): Analyzing real-time requirements
[00:35] Discovery: Need WebSocket server
[00:40] Discovery: Need event queue system
[00:50] Implementation: WebSocket + Event Queue
[01:10] Complete: Real-time engine ready

[Branch B: Widget System]
[00:30] PARALLEL: 4 widget types simultaneously
[00:45] Worker 1: Chart widget ✓
[00:48] Worker 2: Table widget ✓
[00:42] Worker 3: Metric widget ✓
[00:50] Worker 4: Custom widget ✓
[00:55] Merge: Widget registry complete

[Branch C: Data Visualization]
[00:30] PARALLEL (Voting): Comparing libraries
[00:35] D3.js: 7.8/10
[00:35] Chart.js: 8.2/10
[00:35] Recharts: 8.7/10 ✓ Winner
[00:40] SEQUENTIAL: Implement with Recharts
[01:00] Complete: Visualization layer ready

[01:15] Integration: Merging all branches
[01:20] Conflict: Real-time + Widgets state management
[01:25] Resolution: Shared Redux store pattern
[01:30] Integration tests: 98% passing

[01:35] EVALUATOR: Quality assessment
        Iteration 1:
        - Performance: 7.2/10 (needs optimization)
        - Functionality: 9.5/10 ✓
        - Code Quality: 8.8/10 ✓
        Feedback: Optimize real-time data batching

[01:45] Applying optimizations...
        Iteration 2:
        - Performance: 9.1/10 ✓
        - Functionality: 9.5/10 ✓
        - Code Quality: 9.0/10 ✓

[01:50] Final validation: All thresholds met

[01:55] PROJECT COMPLETE
```

#### Step 4: Final Report

```markdown
## Project Completion Report

### Summary
- **Task**: User Dashboard System
- **Duration**: 1 hour 55 minutes
- **Status**: SUCCESS ✓

### Patterns Used
- ORCHESTRATOR: Main coordination (1x)
- ORCHESTRATOR: Nested for real-time (1x)
- SEQUENTIAL: Requirements/Architecture (2 executions)
- PARALLEL (Sectioning): Widgets (1x)
- PARALLEL (Voting): Library selection (1x)
- EVALUATOR: Quality optimization (2 iterations)

### Metrics
- Initial Subtasks: 8
- Final Subtasks: 14 (6 discovered)
- Parallel Speedup: 2.4x
- Quality Improvement: 7.2 → 9.1 (26% gain)
- Test Coverage: 98%

### Deliverables
1. Real-time analytics engine (WebSocket + Event Queue)
2. Widget system (4 types + registry)
3. Data visualization (Recharts integration)
4. Shared state management (Redux)
5. Performance-optimized codebase
6. Complete documentation

### Key Decisions Made
- **Library**: Recharts (voted, 8.7/10)
- **State**: Redux (conflict resolution)
- **Real-time**: WebSocket + Event batching (discovery)
- **Architecture**: Modular widgets with registry pattern

### Recommendations
- Monitor WebSocket connections in production
- Consider lazy loading for widget types
- Set up performance monitoring dashboard
```

---

## User Control Points

### Checkpoints

Even in full automation, user maintains control:

```markdown
## User Checkpoints

### Pre-Execution Approval
"I've constructed this pipeline for your task:
[Pipeline visualization]
Proceed? [Yes/Modify/Cancel]"

### Mid-Execution Review (for long tasks)
"Progress Report:
- Phase 1: Complete ✓
- Phase 2: 60% (ongoing)
- Discoveries: 3 new subtasks

Continue as planned? [Yes/Adjust/Pause]"

### Post-Discovery Notification
"Discovered significant new requirement:
[Description]
This will extend timeline by ~20 minutes.
Proceed? [Yes/Defer/Cancel]"

### Final Approval
"Project complete. Quality score: 9.1/10
Review results? [Accept/Request Revisions/Reject]"
```

### Manual Overrides

```markdown
## Override Commands

### Force Pattern
User: "Use SEQUENTIAL for this, not ORCHESTRATOR"
Orchestrator: "Acknowledged. Proceeding with SEQUENTIAL.
Note: May miss discoveries. Acceptable?"

### Skip Phase
User: "Skip the Evaluator phase"
Orchestrator: "Warning: Skipping quality validation.
Final output may not meet optimal standards. Proceed?"

### Inject Custom Step
User: "Add security audit before integration"
Orchestrator: "Adding security audit step:
[Updated pipeline visualization]
New timeline: +15 minutes"

### Pause & Resume
User: "Pause after Phase 2"
Orchestrator: "Checkpoint set. Will pause for your review."
```

---

## Error Handling

### Pattern Failure Recovery

```markdown
## Failure Scenarios

### Worker Failure
**Scenario**: Developer worker fails on JWT implementation

**Recovery**:
1. Retry with different approach (3 max)
2. If persistent, decompose task further
3. If still failing, escalate to user
4. Optional: Switch to alternative pattern

**Orchestrator Response**:
"JWT implementation failed after 2 retries.
Options:
1. Decompose into smaller tasks
2. Use simpler auth method
3. Manual intervention
Choose: [1/2/3]"

### Evaluator Loop Stuck
**Scenario**: Quality threshold not met after 5 iterations

**Recovery**:
1. Analyze diminishing returns
2. Report best achieved score
3. Suggest acceptance or manual optimization

**Orchestrator Response**:
"Quality plateau reached:
- Current: 8.7/10
- Target: 9.5/10
- Iterations: 5/5

Recommend accepting current quality or manual optimization.
[Accept 8.7/10 / Manual Optimization / Lower Target]"

### Pipeline Conflict
**Scenario**: Parallel branches have incompatible outputs

**Recovery**:
1. Identify conflict source
2. Apply conflict resolution strategy
3. If unresolvable, sequentialize conflicting parts

**Orchestrator Response**:
"Merge conflict detected:
- Branch A uses PostgreSQL
- Branch B uses MongoDB

Resolution options:
1. Standardize on PostgreSQL (rework Branch B)
2. Standardize on MongoDB (rework Branch A)
3. Multi-database architecture (complex)
Choose: [1/2/3]"
```

---

## Configuration

### Orchestrator Settings

```json
{
  "orchestration": {
    "mode": "full_auto",  // "advisor", "pipeline", "dynamic", "full_auto"
    "user_checkpoints": true,
    "approval_required": ["pipeline_construction", "major_discovery"],
    "max_iterations": {
      "evaluator": 5,
      "orchestrator_replan": 10
    }
  },
  "execution": {
    "parallel_workers": 5,
    "timeout_minutes": 120,
    "checkpoint_frequency": "on_phase_complete"
  },
  "quality": {
    "auto_evaluator": true,
    "min_threshold": 0.85,
    "target_threshold": 0.90
  },
  "safety": {
    "max_depth": 3,  // nested orchestrator limit
    "prevent_circular": true,
    "resource_limits": {
      "max_subtasks": 50,
      "max_workers": 10
    }
  }
}
```

---

## Best Practices

### 1. Start with Advisor Mode
Before full automation, use advisor to understand pattern selection.

### 2. Use Checkpoints
Enable user checkpoints for critical projects.

### 3. Monitor Discoveries
High discovery rate may indicate under-specified requirements.

### 4. Review Evaluator Feedback
Evaluator insights often reveal architectural issues.

### 5. Respect Resource Limits
Don't let complexity grow unbounded.

### 6. Trust but Verify
Automation helps but final judgment is yours.

---

## Integration Commands

### Activate Modes

```bash
# Advisor only (Phase 1)
/workflow-advisor "Build payment system"

# Pipeline mode (Phase 2)
/workflow-pipeline simple "Add user profile feature"

# Dynamic composition (Phase 3)
/workflow-dynamic "Create real-time chat application"

# Full integration (Phase 4)
/workflow-full "Build complete e-commerce platform"
```

### Monitor Execution

```bash
# Check status
/workflow-status

# View current phase
/workflow-phase

# See pattern usage
/workflow-patterns

# Get quality metrics
/workflow-quality
```

---

## Summary

The Agent Workflow Orchestrator provides **layered automation**:

1. **Phase 1**: Recommendations with reasoning
2. **Phase 2**: Predefined, validated pipelines
3. **Phase 3**: Automatic pattern composition
4. **Phase 4**: Full end-to-end automation

Each phase adds capability while maintaining:
- User control and transparency
- Error recovery mechanisms
- Quality validation
- Adaptive planning

**The goal is not to replace human judgment, but to augment it with intelligent automation that handles complexity while keeping you in control.**

---

**Remember**: This orchestrator is a tool. Like all tools, it's most effective when you understand its capabilities and limitations. Start with simpler modes, graduate to full automation as you gain confidence.

*Complexity should be added only when it demonstrably improves outcomes.*
