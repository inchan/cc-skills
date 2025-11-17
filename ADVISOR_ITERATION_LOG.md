# Agent Workflow Advisor - Iteration Log

## Overview

This document tracks the iterative improvement process for the Agent Workflow Advisor skill.

---

## Loop 1: Initial Testing

### Test Scenarios

| # | Scenario | Initial Recommendation | Issue Found |
|---|----------|----------------------|-------------|
| 1 | Simple bug fix | Unclear | "No Pattern" case not emphasized |
| 2 | Image upload feature | Sequential or Parallel? | Dependency-based selection unclear |
| 3 | Algorithm optimization | Evaluator | Voting vs Evaluator ambiguous |
| 4 | Auth refactoring | Orchestrator | Over-reliance on complexity score |
| 5 | Test suite execution | Parallel | Missing pattern combination guidance |

### Critical Gaps Identified

1. **"No Pattern" not prominent** - Simple tasks need explicit "don't use pattern" guidance
2. **Sequential vs Parallel boundary** - Dependency test missing
3. **Voting vs Evaluator confusion** - Compare vs Improve distinction unclear
4. **Complexity over-emphasis** - Score driving decisions instead of structure
5. **Pattern combinations** - No guidance on chaining patterns

---

## Loop 2: After Improvements

### Changes Made

1. **Added "No Pattern" as first option**
   - Complexity < 0.3 check
   - Explicit examples of simple tasks
   - "Philosophy: Patterns are tools, not requirements"

2. **Dependency Test for Sequential vs Parallel**
   - "Can I do B without completing A first?"
   - Clear examples with dependency analysis
   - Rule: ANY dependency → Sequential

3. **Compare vs Improve distinction**
   - Voting: "Which approach is best?" (one-time decision)
   - Evaluator: "How to make this better?" (iterative refinement)
   - Concrete scenarios for each

4. **Structure-First Priority**
   1. Structure (dependencies, predictability)
   2. Goal (compare vs improve vs build)
   3. Complexity (tie-breaker only)

5. **Pattern Combinations Section**
   - Router → Any Pattern
   - Orchestrator → Parallel/Sequential (nested)
   - Any Pattern → Evaluator (chain)
   - When NOT to combine

### Re-Test Results

| # | Scenario | New Recommendation | Improvement |
|---|----------|-------------------|-------------|
| 1 | Simple bug fix | **NO PATTERN** | ✅ Clear, explicit |
| 2 | Image upload | **SEQUENTIAL** (dependency exists) | ✅ Dependency test works |
| 3 | Algorithm optimization | **Ask clarification** (Voting vs Evaluator) | ✅ Handles ambiguity |
| 4 | Auth refactoring | **ORCHESTRATOR** (discovery needed) | ✅ Structure-based, not complexity |
| 5 | Test suite | **PARALLEL + Evaluator combo** | ✅ Pattern combination suggested |

---

## Loop 3: Edge Cases and Refinements

### Remaining Issues to Address

1. **Mixed dependency scenarios**
   - Some subtasks dependent, some independent
   - Example: "Build frontend (independent) but API needs DB schema (dependent)"
   - Solution needed: Hybrid Sequential-Parallel guidance

2. **Partial knowledge scenarios**
   - "I know 3 subtasks, might discover 1-2 more"
   - Is this Sequential or Orchestrator?
   - Need clearer threshold for "discovery likelihood"

3. **User overrides**
   - What if user disagrees with recommendation?
   - Need explicit "override guidance" section

4. **Failure recovery**
   - Pattern chosen doesn't work out
   - How to pivot to different pattern mid-execution?

### Proposed Loop 3 Improvements

1. **Add "Hybrid Scenario" handling**
2. **Include "Partial Knowledge" spectrum**
3. **Strengthen "User Override" section**
4. **Add "Pattern Switching" guidance**

---

## Metrics

### Recommendation Accuracy

| Loop | Scenarios Tested | Correct | Ambiguous | Wrong | Accuracy |
|------|-----------------|---------|-----------|-------|----------|
| 1 | 5 | 2 | 2 | 1 | 40% |
| 2 | 5 | 4 | 1 | 0 | **80%** |
| 3 | (pending) | - | - | - | - |

### Clarity Score (Self-Assessment)

| Aspect | Loop 1 | Loop 2 | Target |
|--------|--------|--------|--------|
| "No Pattern" guidance | 3/10 | 9/10 | 9/10 ✅ |
| Sequential vs Parallel | 4/10 | 8/10 | 9/10 |
| Voting vs Evaluator | 5/10 | 9/10 | 9/10 ✅ |
| Complexity usage | 4/10 | 8/10 | 9/10 |
| Pattern combinations | 2/10 | 7/10 | 8/10 |
| Edge case handling | 3/10 | 6/10 | 8/10 |

---

## Next Steps

1. **Test with 5 NEW scenarios** (not previously seen)
2. **Focus on edge cases**: mixed dependencies, partial knowledge
3. **Add user override guidance**
4. **Document failure recovery patterns**
5. **Consider Phase 2: Simple Pipeline implementation**

---

## Lessons Learned

1. **Start simple, iterate** - Phase 1 approach is correct
2. **Structure > Complexity** - Task structure is the primary driver
3. **Explicit is better than implicit** - "No Pattern" needed to be stated clearly
4. **Questions are okay** - Ambiguous cases should prompt clarification
5. **Patterns combine** - Real tasks often need multiple patterns

---

**Next Loop**: Focus on edge cases and user experience improvements
