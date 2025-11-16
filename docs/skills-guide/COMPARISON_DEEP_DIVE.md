# Deep Dive: Technical Comparison of Skills, Commands, Sub-agents, and Hooks

**A technical analysis of how these four extension mechanisms differ at the architectural level.**

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐     │
│  │  SKILLS  │    │ COMMANDS │    │  SUB-AGENTS  │     │
│  │(Context) │    │(Shortcut)│    │  (Isolated)  │     │
│  └────┬─────┘    └────┬─────┘    └──────┬───────┘     │
│       │               │                  │              │
│       └───────────────┼──────────────────┘              │
│                       │                                 │
│                ┌──────▼──────┐                          │
│                │    HOOKS    │                          │
│                │   (Events)  │                          │
│                └─────────────┘                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Context Window Management

### Skills: Shared Context with Progressive Disclosure

```
[System Prompt] + [Skill Metadata] + [User Message] = Initial Context
                           ↓
                  Claude decides to load skill
                           ↓
[System Prompt] + [SKILL.md Content] + [User Message] = Expanded Context
                           ↓
                  Claude needs reference file
                           ↓
[System Prompt] + [SKILL.md] + [reference.md] + [Messages] = Full Context
```

**Key Properties:**
- Context grows as skill loads more content
- All loaded content visible to conversation
- No way to "unload" skill content
- Progressive disclosure controls growth rate

**Token Budget Example:**
```
Initial: ~10,000 tokens (system + metadata + conversation)
After skill load: ~13,000 tokens (+3,000 for SKILL.md)
After reference: ~15,000 tokens (+2,000 for reference)
Maximum: Context window limit (varies by model)
```

---

### Commands: Prompt Expansion

```
User: /deploy production
         ↓
Command file read and expanded:
         ↓
System sees: "Deploy to production environment. Steps: 1..."
```

**Key Properties:**
- One-time prompt expansion
- Adds to current context temporarily
- Tool restrictions apply immediately
- Model override if specified

**Token Impact:**
```
Command invoke: +100-500 tokens (prompt expansion)
Tool restrictions: No token impact
Model override: No token impact
Bash execution (!cmd): Output adds to context
File references (@file): File content adds to context
```

---

### Sub-agents: Isolated Context

```
Main Context (unchanged):
[System Prompt] + [Conversation History]
                    ↓
            Task tool invoked
                    ↓
New Independent Context:
[Agent System Prompt] + [Task Description] + [Tool Access]
                    ↓
            Agent performs task
                    ↓
            Returns single result
                    ↓
Main Context (receives result only):
[System Prompt] + [Conversation] + [Agent Result]
```

**Key Properties:**
- Completely separate context window
- No access to main conversation history
- Must rebuild any needed context
- Only final result returns to main

**Token Budget:**
```
Main context: Unchanged during execution
Agent context: Starts fresh (~0 + system prompt)
Agent builds up: +tokens as agent works
Main receives: +Result size (typically <1000 tokens)
```

**Critical Difference**: Sub-agents don't see conversation history. They start fresh and must be given all needed context in the task description.

---

## Tool Permissions

### Skills: No Tool Control

```yaml
# SKILL.md
---
name: my-skill
description: My skill description
# NO tools field - inherits all parent tools
---
```

**Behavior:**
- Skills cannot restrict tools
- Skills cannot grant new tools
- Uses whatever tools parent conversation has
- No security boundary

**Why?** Skills are context providers, not execution controllers. They provide knowledge, not capabilities.

---

### Commands: Granular Control

```yaml
---
description: Security audit command
allowed-tools: Read, Grep, Glob  # Only these tools available
model: claude-3-5-haiku-20241022  # Can override model
---
```

**Tool Patterns:**
```yaml
# Specific tool only
allowed-tools: Read

# Multiple specific tools
allowed-tools: Read, Grep, Glob

# Bash with pattern restriction
allowed-tools: Bash(git:*), Bash(npm:test)

# MCP tool access
allowed-tools: mcp__github__*, mcp__slack__post

# Everything (default)
# (omit allowed-tools field)
```

**Why?** Commands are user-controlled actions that need safety boundaries.

---

### Sub-agents: Complete Control

```yaml
---
name: code-reviewer
description: Reviews code for issues
tools: Read, Grep, Glob  # Explicit tool list
model: sonnet  # Model selection
---
```

**Security Patterns:**
```
Read-only reviewer: tools: Read, Grep, Glob
Implementer: tools: Read, Write, Edit, Bash, Grep, Glob, TodoWrite
Researcher: tools: Read, Grep, Glob, WebSearch, WebFetch
Tester: tools: Read, Bash, Grep, Glob
```

**Why?** Sub-agents are autonomous workers that need appropriate capabilities.

---

## Activation Mechanisms

### Skills: Semantic Matching

```
User: "Create a React component for user profiles"
                    ↓
Claude evaluates skill descriptions:
  - "React/TypeScript/MUI patterns" → HIGH MATCH
  - "Backend API patterns" → LOW MATCH
  - "Database verification" → NO MATCH
                    ↓
Loads React skill automatically
```

**Matching Factors:**
1. Semantic similarity to description
2. Keyword presence
3. Task context
4. Claude's judgment

**Control Level:** Low (Claude decides)

---

### Commands: Explicit Invocation

```
User: /review-pr 123
         ↓
System finds: .claude/commands/review-pr.md
         ↓
Expands prompt with argument substitution:
  "$1" → "123"
         ↓
Executes expanded prompt
```

**No ambiguity** - User explicitly requests specific command.

**Control Level:** High (User decides)

---

### Sub-agents: Delegated Tasks

```
Main Claude: I need to delegate this complex analysis
                    ↓
Uses Task tool:
{
  "subagent_type": "code-reviewer",
  "prompt": "Analyze auth.ts for security issues",
  "model": "sonnet"
}
                    ↓
Sub-agent spawns, performs task, returns result
```

**Control Level:** Medium (Claude or User can delegate)

---

### Hooks: Event-Based

```
Events:
  - UserPromptSubmit: Before Claude sees prompt
  - PreToolUse: Before tool executes
  - PostToolUse: After tool executes
  - Stop: After Claude finishes response

Hook Response:
  - exit 0: Success, continue (stdout becomes context)
  - exit 1: Error, blocks (stderr shown to user)
  - exit 2: Critical block (for guardrails)
```

**Control Level:** Automatic (Event-driven)

---

## Execution Flow Comparison

### Skill Activation Flow

```
1. User sends message
2. Claude receives message + skill metadata
3. Claude analyzes if skill relevant
4. IF relevant:
   - Claude uses Read tool to load SKILL.md
   - Content added to context
   - Claude may load references as needed
5. Claude responds using skill knowledge
```

**Time**: Instantaneous (no separate process)
**Isolation**: None (shared context)
**Result**: Knowledge integrated into response

---

### Command Execution Flow

```
1. User types /command args
2. System finds command file
3. System expands prompt:
   - Read file content
   - Substitute $1, $ARGUMENTS
   - Execute !bash commands
   - Include @file references
4. Expanded prompt sent to Claude
5. Claude responds following command instructions
```

**Time**: Near-instantaneous (just file read)
**Isolation**: None (shared context)
**Result**: Claude follows expanded instructions

---

### Sub-agent Execution Flow

```
1. Task tool invoked (by Claude or via command)
2. New context window created
3. Agent system prompt loaded
4. Task description provided
5. Agent performs work independently:
   - Uses allowed tools
   - Builds internal reasoning
   - No access to main conversation
6. Agent returns single result message
7. Result added to main conversation
```

**Time**: Can be significant (rebuilding context)
**Isolation**: Complete (separate context)
**Result**: Isolated analysis returned

---

### Hook Execution Flow

```
1. Event occurs (e.g., PreToolUse)
2. Hook script executed with JSON input
3. Script analyzes and decides:
   - Allow (exit 0)
   - Block (exit 2)
   - Error (exit 1)
4. Script output processed:
   - stdout → Added to context
   - stderr → Shown as error
5. Event continues or blocks based on exit code
```

**Time**: Depends on script complexity
**Isolation**: External process
**Result**: Event allowed/blocked with feedback

---

## Data Flow Patterns

### Skills: Knowledge Injection

```
[Knowledge Base] → [On-Demand Loading] → [Context Integration]
                                              ↓
                                       [Claude Response]
```

**Pattern**: Pull-based (Claude pulls what it needs)

---

### Commands: Instruction Templating

```
[Command Template] + [User Args] → [Expanded Instructions]
                                           ↓
                                    [Claude Execution]
```

**Pattern**: Transformation (template to instructions)

---

### Sub-agents: Task Delegation

```
[Complex Task] → [Agent Pool] → [Specialized Processing]
                                          ↓
                                   [Result Synthesis]
```

**Pattern**: Distributed (isolated processing)

---

### Hooks: Event Interception

```
[Event Stream] → [Hook Handlers] → [Modified Behavior]
                                           ↓
                                    [Controlled Flow]
```

**Pattern**: Interceptor (modify event flow)

---

## Performance Characteristics

| Metric | Skills | Commands | Sub-agents | Hooks |
|--------|--------|----------|------------|-------|
| **Startup Latency** | ~0ms (metadata preloaded) | ~10ms (file read) | ~500ms+ (context build) | ~50ms (script spawn) |
| **Context Cost** | Moderate (on-demand) | Low (temporary) | None (isolated) | Minimal |
| **Execution Speed** | Fast (in-context) | Fast (in-context) | Slow (new context) | Fast (external) |
| **Parallelism** | No | No | Yes (multiple agents) | Yes (async) |
| **Resource Usage** | Context tokens | Context tokens | New context window | External process |

---

## Security Model

### Skills

```
Trust Level: High (runs in main context)
Isolation: None
Attack Surface: Can include malicious instructions
Mitigation: Only install from trusted sources
```

**Risks:**
- Prompt injection via SKILL.md content
- Malicious scripts bundled with skill
- Resource exhaustion (loading huge files)

---

### Commands

```
Trust Level: Medium (restricted tools)
Isolation: Tool-level only
Attack Surface: Prompt expansion can be exploited
Mitigation: allowed-tools field
```

**Risks:**
- Argument injection
- Unintended tool access
- Bash command execution

---

### Sub-agents

```
Trust Level: Low (isolated context)
Isolation: Complete context isolation
Attack Surface: Limited to granted tools
Mitigation: Minimal tool permissions
```

**Risks:**
- Tool misuse within permissions
- Resource consumption
- Leaked information via results

---

### Hooks

```
Trust Level: External (shell execution)
Isolation: Separate process
Attack Surface: Shell script vulnerabilities
Mitigation: Input validation, sandboxing
```

**Risks:**
- Command injection in scripts
- Environment variable leakage
- Infinite loops blocking events

---

## Memory and State

### Skills: Session-Scoped

- Loaded content persists in conversation
- No cross-session memory
- State managed via conversation context

### Commands: Stateless

- Each invocation is independent
- No memory between calls
- Arguments reset each time

### Sub-agents: Completely Stateless

- Each invocation starts fresh
- No memory of previous invocations
- Must receive all context in prompt

### Hooks: External State

- Can maintain state in files
- Session tracking possible
- State survives conversation reset

---

## Integration Patterns

### Skill + Hook Integration

```
UserPromptSubmit Hook:
  - Analyzes user prompt
  - Matches against skill-rules.json
  - Suggests relevant skills

Example: User mentions "frontend" → Hook suggests frontend-dev-guidelines skill
```

### Command + Sub-agent Integration

```
Command: /analyze-security

Content:
  Use Task tool to launch security-scanner subagent
  Provide current file context
  Return comprehensive security report
```

### Skill + Command Integration

```
Command: /review-code

Content:
  Use code-review skill guidelines
  Apply criteria from SKILL.md
  Generate structured review
```

### Hook + Hook Chaining

```
PreToolUse Hook → Validates operation
PostToolUse Hook → Logs changes
Stop Hook → Final cleanup
```

---

## Summary: When to Use What

**Skills**: When you need domain knowledge that Claude should automatically access
**Commands**: When you want user-controlled shortcuts with tool restrictions
**Sub-agents**: When you need isolated, specialized task delegation
**Hooks**: When you need event-based automation and control

Each serves a distinct architectural purpose. Master the differences, and you'll build powerful, maintainable Claude Code extensions.

---

**See Also:**
- [README.md](README.md) - Core concepts overview
- [DECISION_TREE.md](DECISION_TREE.md) - Practical decision guide
- [COMMON_PITFALLS.md](COMMON_PITFALLS.md) - Mistakes to avoid
