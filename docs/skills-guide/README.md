# Claude Code Skills - Comprehensive Guide

**Version**: 1.0.0
**Last Updated**: 2025-11-16
**Information Sources**: Anthropic Engineering Blog, GitHub repositories, Web research
**Verified Against**: Claude Code v2.0+

---

## Table of Contents

- [What Are Skills?](#what-are-skills)
- [Core Concepts](#core-concepts)
- [Skills vs Commands vs Sub-agents](#skills-vs-commands-vs-sub-agents)
- [Skill Structure](#skill-structure)
- [Context Management](#context-management)
- [Trigger Mechanisms](#trigger-mechanisms)
- [Capabilities](#capabilities)
- [Limitations](#limitations)
- [Quick Reference](#quick-reference)
- [Further Reading](#further-reading)

---

## What Are Skills?

**Skills are organized folders of instructions, scripts, and resources that Claude loads dynamically to perform better at specific tasks.**

Think of Skills as "just-in-time expertise" - Claude doesn't load everything at startup. Instead, it scans skill metadata and loads full content only when the current task matches a skill's domain.

### Why Skills Exist

Skills solve the **Context Window Problem**:

1. Limited context window capacity (can't load everything)
2. Need domain-specific expertise (different tasks need different knowledge)
3. Progressive information disclosure (load only what's needed)
4. Repeatable workflows (consistent behavior across sessions)

---

## Core Concepts

### 1. Progressive Disclosure

The defining feature of Skills. Information is loaded in layers:

```
Level 1: Metadata (name + description) - Loaded at startup
         ↓ Claude sees task matches description
Level 2: SKILL.md content - Loaded when skill triggered
         ↓ Claude needs specific detail
Level 3: Reference files - Loaded on-demand
```

**Why this matters:**
- Efficient context window usage
- Claude only loads what it needs
- Scales to many skills without overhead

### 2. Auto-Invocation

Skills are **model-invoked** - Claude decides when to use them based on:
- Description matching task context
- Semantic similarity analysis
- Current conversation needs

Unlike Commands (user-triggered) or Sub-agents (explicitly delegated), Skills activate automatically.

### 3. Shared Context

Skills operate within the **same context window** as the main conversation:
- ✅ Can reference previous messages
- ✅ Immediate access to conversation history
- ✅ No context reconstruction overhead
- ❌ Cannot have isolated reasoning space

---

## Skills vs Commands vs Sub-agents

| Feature | **Skills** | **Commands** | **Sub-agents** |
|---------|-----------|--------------|----------------|
| **Activation** | Auto (Claude decides) | Manual (`/command`) | Delegated (Task tool) |
| **Context** | Shared with main | Shared with main | **Isolated** (new window) |
| **Control** | Claude-controlled | User-controlled | Autonomous |
| **Best For** | Domain expertise, guidelines | Repeatable shortcuts | Complex delegation |
| **File Location** | `.claude/skills/*/SKILL.md` | `.claude/commands/*.md` | `.claude/agents/*.md` |
| **Tool Restrictions** | ✅ `allowed-tools` (optional) | ✅ `allowed-tools` | ✅ `tools` field |
| **Model Override** | Not supported | ✅ Supported | ✅ Supported |
| **Progressive Disclosure** | ✅ Supported | Not applicable | Not applicable |

### When to Use What

See [DECISION_TREE.md](DECISION_TREE.md) for detailed decision framework.

**Quick Guide:**

- **Skills**: "I need Claude to automatically know about X when relevant"
- **Commands**: "I want a shortcut to do X every time I ask"
- **Sub-agents**: "I need to delegate X to an independent agent"

---

## Skill Structure

### Minimum Viable Skill

```markdown
---
name: my-skill
description: Brief description that triggers this skill
---

# My Skill

Instructions and guidance here.
```

### Complete Structure

```
.claude/skills/
└── my-skill/
    ├── SKILL.md           # Required: Main file
    ├── resources/         # Optional: Reference files
    │   ├── patterns.md
    │   └── examples.md
    └── scripts/           # Optional: Executable code
        └── helper.py
```

### YAML Frontmatter

**Required Fields:**
- `name`: Max **64 characters**, lowercase letters/numbers/hyphens only, no XML tags
- `description`: Max **1024 characters**, non-empty, no XML tags

**Optional Fields:**
- `allowed-tools`: Limit which tools Claude can use when Skill is active (e.g., `Read, Grep, Glob`)

**Best Practices:**
- Include ALL trigger keywords in description
- Be specific about when skill should activate
- Keep name in gerund form (verb+-ing): `processing-pdfs`
- Use `allowed-tools` to restrict tool access for security-sensitive skills

### The 500-Line Rule

**CRITICAL**: Keep SKILL.md under 500 lines.

This forces Progressive Disclosure:
- Main concepts in SKILL.md (< 500 lines)
- Details in reference files
- Each reference file < 500 lines
- Add table of contents to files > 100 lines

---

## Context Management

### How Skills Manage Context

1. **Startup**: Only metadata (name + description) loaded
2. **Trigger**: Full SKILL.md content loaded into context
3. **On-Demand**: Reference files loaded when needed
4. **Cleanup**: Not explicitly removed (persists in conversation)

### Context Window Impact

```
Initial Context: System Prompt + Metadata (~200 tokens)
After Trigger: + SKILL.md (~1000-3000 tokens)
With References: + Reference File (~1000-2000 tokens each)
```

**Optimization Tips:**
- Keep SKILL.md focused (core info only)
- Use references for detailed examples
- Avoid loading unnecessary resources
- One skill at a time when possible

### Progressive Disclosure Pattern

```markdown
## SKILL.md (Main File)
Quick reference + core concepts

## For More Information:
- [Detailed Patterns](resources/patterns.md)
- [Complete Examples](resources/examples.md)
```

Claude reads references **only when needed**.

---

## Trigger Mechanisms

### 1. Description Matching (Built-in)

Claude matches user requests against skill descriptions using semantic similarity.

**Example:**
```yaml
description: React/TypeScript/MUI v7 development patterns
```
Triggers when user mentions: React, TypeScript, MUI, frontend, components

### 2. Custom Triggers (via Hooks)

Using `.claude/hooks/` you can implement:

**Keyword Triggers:**
```json
{
  "keywords": ["backend", "API", "route", "express"]
}
```

**Intent Pattern Triggers:**
```json
{
  "intentPatterns": ["(create|add).*?(feature|endpoint)"]
}
```

**File Path Triggers:**
```json
{
  "pathPatterns": ["frontend/src/**/*.tsx"]
}
```

**Content Triggers:**
```json
{
  "contentPatterns": ["import.*Prisma"]
}
```

See [TRIGGER_TYPES](../skills/skill-developer/TRIGGER_TYPES.md) for complete reference.

### 3. Enforcement Levels

- **SUGGEST**: Advisory, skill recommended but not required
- **BLOCK**: Critical, blocks action until skill used (guardrail)
- **WARN**: Low priority suggestion

---

## Capabilities

### What Skills CAN Do

1. **Provide Domain Knowledge**
   - Best practices
   - Code patterns
   - Architecture guidelines
   - Anti-patterns to avoid

2. **Include Reference Materials**
   - Documentation
   - Examples
   - Templates
   - Checklists

3. **Bundle Executable Code**
   - Helper scripts (Python, Bash)
   - Validation tools
   - Code generators
   - Data processors

4. **Auto-Activate Based on Context**
   - Semantic matching
   - Keyword detection
   - File pattern matching
   - Content analysis

5. **Progressive Information Loading**
   - Load metadata first
   - Load full content when needed
   - Load references on-demand

6. **Restrict Tool Access (Optional)**
   - Use `allowed-tools` in frontmatter
   - Limit tools when skill is active
   - Security for sensitive operations

---

## Limitations

### What Skills CANNOT Do

1. **Add New Tools Beyond Parent**
   - Skills can restrict tools via `allowed-tools`
   - But cannot grant tools the parent doesn't have
   - Tool restriction is optional, not mandatory

2. **Change Model Selection**
   - Uses parent conversation's model
   - Cannot specify different model
   - Unlike Commands and Sub-agents

3. **Isolate Context**
   - Always shares main context
   - Cannot have private reasoning
   - All loaded info visible to conversation

4. **Guarantee Activation**
   - Claude decides based on description
   - May not trigger when expected
   - Requires well-written descriptions

5. **Execute Autonomously**
   - Provides guidance only
   - Cannot make decisions independently
   - Unlike Sub-agents

6. **Cross-Session Memory**
   - No persistence between sessions
   - Must be re-triggered each session
   - State resets after conversation

### Platform Limitations (Current)

- **Claude Code Only**: Custom filesystem-based skills
- **No API Upload**: Can't programmatically update skills
- **Manual Installation**: Must copy files manually or via marketplace

---

## Quick Reference

### Create a Skill

```bash
# 1. Create directory
mkdir -p .claude/skills/my-skill

# 2. Create SKILL.md
cat > .claude/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: When to use this skill (include keywords)
---

# My Skill

## Purpose
What this skill does

## When to Use
Specific scenarios

## Quick Reference
Key information
EOF
```

### Skill Locations

- **Project**: `.claude/skills/*/SKILL.md` (team-shared)
- **User**: `~/.claude/skills/*/SKILL.md` (personal)
- **Priority**: Project skills override user skills

### Best Practices Summary

1. ✅ **500-line rule** - Keep main file concise
2. ✅ **Rich descriptions** - Include all trigger keywords
3. ✅ **Progressive disclosure** - Use reference files
4. ✅ **Test before documenting** - Build 3+ evaluations first
5. ✅ **Gerund naming** - Use verb+-ing form
6. ❌ **Don't overload** - One domain per skill
7. ❌ **Don't duplicate** - Check existing skills first
8. ❌ **Don't assume activation** - Test trigger patterns

---

## Further Reading

### Reference Documents

- [DECISION_TREE.md](DECISION_TREE.md) - When to use Skills vs Commands vs Sub-agents
- [LATEST_INFO_SOURCES.md](LATEST_INFO_SOURCES.md) - Where to find latest updates
- [COMPARISON_DEEP_DIVE.md](COMPARISON_DEEP_DIVE.md) - Detailed technical comparison
- [COMMON_PITFALLS.md](COMMON_PITFALLS.md) - Mistakes to avoid

### Internal Project Resources

- [Skill Developer Guide](../skills/skill-developer/SKILL.md)
- [Trigger Types Reference](../skills/skill-developer/TRIGGER_TYPES.md)
- [Skills Rules Reference](../skills/skill-developer/SKILL_RULES_REFERENCE.md)

### Official Sources (Priority Order)

1. **Anthropic Engineering Blog**: https://www.anthropic.com/engineering
2. **GitHub Issues**: https://github.com/anthropics/claude-code/issues
3. **Official Skills Repo**: https://github.com/anthropics/skills
4. **Claude Docs**: https://docs.claude.com/en/docs/claude-code

### Community Resources

- Simon Willison's Blog: Real-world Skills analysis
- Tyler Folkman's Guide: Context window management
- Medium/Substack Articles: Use cases and patterns

**Note**: Community sources may contain outdated information. Always verify against official sources.

---

## Summary

**Claude Code Skills** are your tool for extending Claude with domain-specific expertise through progressive disclosure. They excel at providing contextual knowledge that Claude loads automatically when relevant, unlike Commands (user-triggered shortcuts) or Sub-agents (isolated delegated tasks).

**Key Takeaways:**

1. Skills use **Progressive Disclosure** - metadata first, content on-demand
2. Skills are **Auto-Invoked** - Claude decides when to use them
3. Skills share **Main Context** - unlike isolated Sub-agents
4. Keep SKILL.md **under 500 lines** - use references for details
5. **Description quality** directly impacts trigger reliability

---

**Line Count**: ~490 lines (following 500-line rule)
**Next**: See [DECISION_TREE.md](DECISION_TREE.md) for choosing the right tool
