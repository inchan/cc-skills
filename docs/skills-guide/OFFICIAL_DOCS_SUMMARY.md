# Official Documentation Summary

**Compiled**: 2025-11-16
**Source**: docs.claude.com (via web search, direct access blocked by 403)

This document summarizes information verified from official Anthropic documentation.

---

## Agent Skills (docs.claude.com/en/docs/claude-code/skills)

### YAML Frontmatter Validation

**Required Fields:**
```yaml
name: my-skill
# - Maximum 64 characters
# - Lowercase letters, numbers, and hyphens ONLY
# - No XML tags
# - No reserved words

description: Brief description of what this Skill does
# - Maximum 1024 characters
# - Non-empty (required)
# - No XML tags
```

**Optional Fields:**
```yaml
allowed-tools: Read, Grep, Glob
# - Limits which tools Claude can use when Skill is active
# - Comma-separated list
```

### Progressive Disclosure Architecture

**Official Statement:**
> "This filesystem-based architecture enables progressive disclosure: Claude loads information in stages as needed, rather than consuming context upfront."

**Three-Level Loading:**
1. **Startup**: Only metadata (name + description) from all Skills pre-loaded
2. **Triggered**: Claude reads SKILL.md only when Skill becomes relevant
3. **On-Demand**: Reads additional files only as needed

**500-Line Rule:**
> "Keep SKILL.md body under 500 lines for optimal performance."
> "If your content exceeds this, split it into separate files using the progressive disclosure patterns described earlier."

**No Practical Limit on Bundled Content:**
> "Because files don't consume context until accessed, Skills can include comprehensive API documentation, large datasets, extensive examples, or any reference materials you need."

### Model-Invoked Activation

> "Skills are model-invoked—Claude autonomously decides when to use them based on your request and the Skill's description."

---

## Subagents (docs.claude.com/en/docs/claude-code/sub-agents)

### Definition

> "Custom subagents in Claude Code are specialized AI assistants that can be invoked to handle specific types of tasks."
> "They enable more efficient problem-solving by providing task-specific configurations with customized system prompts, tools and a **separate context window**."

### Storage Locations

- **User subagents**: `~/.claude/agents/` - Available across all your projects
- **Project subagents**: `.claude/agents/` - Specific to your project and can be shared with your team

### Key Benefits

> "Context efficiency: Agents help preserve main context, enabling longer overall sessions"

### Official Best Practices

1. **Start with Claude-generated agents**:
   > "We highly recommend generating your initial subagent with Claude and then iterating on it to make it personally yours."

2. **Design focused subagents**:
   > "Create subagents with single, clear responsibilities rather than trying to make one subagent do everything."

3. **Limit tool access**:
   > "Only grant tools that are necessary for the subagent's purpose."

---

## Hooks (docs.claude.com/en/docs/claude-code/hooks)

### Hook Types

**PreToolUse:**
> "PreToolUse runs after Claude creates tool parameters and before processing the tool call."
> "PreToolUse hooks can block tool calls while providing Claude feedback on what to do differently."
> "When Claude Code makes a tool call, PreToolUse hooks run before the permission system runs."

**PostToolUse:**
> "PostToolUse runs immediately after a tool completes successfully."

### Configuration Locations

- **User settings**: `~/.claude/settings.json` (applies to all projects)
- **Project settings**: `.claude/settings.json` (team-shared)
- **Local project settings**: `.claude/settings.local.json` (personal)

### Hook Output Options

Hooks can return structured JSON with properties:
- `continue`: boolean
- `stopReason`: string
- `suppressOutput`: boolean
- `systemMessage`: string
- `permissionDecision`: 'allow' | 'deny' | 'ask' (PreToolUse only)

---

## Slash Commands (docs.claude.com/en/docs/claude-code/slash-commands)

### YAML Frontmatter Example

```yaml
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit
model: claude-3-5-haiku-20241022
---
```

### Argument Syntax

- `$ARGUMENTS`: Captures all arguments
- `$1`, `$2`, etc.: Positional arguments

### Dynamic Execution

- `!git status`: Include bash output in command context (requires Bash tool permission)
- `@file.js`: Include file content as reference

### Storage Locations

- Project: `.claude/commands/` (team-shared, version controlled)
- User: `~/.claude/commands/` (personal, cross-project)

---

## CLAUDE.md Memory (docs.claude.com/en/docs/claude-code/memory)

### Import Syntax

```markdown
@README
@package.json
@docs/git-instructions.md
```

**Rules:**
- Both relative and absolute paths allowed
- Maximum depth of **5 jumps** (recursive imports)
- Imports NOT evaluated within markdown code spans/blocks
- Importing files in user's home dir allows individual team member instructions

### Memory Loading

> "All memory files are automatically loaded into Claude Code's context when launched."
> "Files higher in the hierarchy take precedence and are loaded first, providing a foundation that more specific memories build upon."

---

## Claude Agent SDK (docs.claude.com/en/docs/agent-sdk/overview)

### Rename

> "The Claude Code SDK has been renamed to the Claude Agent SDK."

### Programmatic vs Filesystem

**Subagents:**
> "Subagents can be defined in two ways: Programmatically (using the agents parameter) or Filesystem-based (placing markdown files in designated directories)."
> "Programmatically defined agents take precedence over filesystem-based agents with the same name."

**Skills:**
> "The SDK does not provide a programmatic API for registering Skills."
> "Skills are loaded from configured filesystem locations."
> "You must specify settingSources (TypeScript) or setting_sources (Python) to load Skills from the filesystem."

### SDK Settings

> "The SDK no longer reads from filesystem settings (CLAUDE.md, settings.json, slash commands, etc.) by default."
> "If your application relied on filesystem settings, add settingSources: ['user', 'project', 'local'] to your options."

---

## Claude Code v2.0.0 (September 2025)

### Major Features

1. **Rewind**:
   > "Introduced in v2.0.0, Rewind lets you roll back both Claude's conversation context and code state to previous points."
   > "Our new checkpoint system automatically saves your code state before each change, and you can instantly rewind to previous versions by tapping Esc twice or using the /rewind command."

2. **Default Model**:
   > "Claude Sonnet 4.5 is the new default model in Claude Code."

3. **VS Code Extension**:
   > "We're introducing several upgrades to Claude Code: a native VS Code extension"

### Recent Updates

- **@-mention support**: Typeahead for custom agents
- **MCP "project" scope**: Add MCP servers to .mcp.json files committed to repository
- **Progress messages**: Bash tool shows last 5 lines of command output
- **CLAUDE_CODE_SHELL_PREFIX**: Environment variable for wrapping shell commands
- **Enhanced /doctor command**: Includes CLAUDE.md and MCP tool context

---

## API Skills (Beta) (docs.claude.com/en/api/skills-guide)

### Required Beta Headers

```python
client = Anthropic(
    default_headers={
        "anthropic-beta": "code-execution-2025-08-25,files-api-2025-04-14,skills-2025-10-02"
    }
)
```

**Headers:**
- `code-execution-2025-08-25`: Enables skill code execution
- `files-api-2025-04-14`: Required for file downloads
- `skills-2025-10-02`: Enables Skills feature access

---

## Key Takeaways

1. **Skills support `allowed-tools`** - This is optional but can restrict tool access when skill is active
2. **Strict validation rules** - name (64 chars, lowercase+numbers+hyphens), description (1024 chars)
3. **Progressive Disclosure is core** - Files don't consume context until accessed
4. **500-line rule is performance optimization** - Not a hard limit, but strongly recommended
5. **Subagents have isolated context** - This is their key differentiator
6. **SDK requires explicit filesystem settings** - Must opt-in to read from filesystem
7. **Programmatic agents override filesystem agents** - Priority order matters

---

## Information Gaps

Information NOT confirmed from official docs:

1. Exact context window token costs
2. Skill deactivation behavior
3. Multiple skill interaction patterns
4. Performance benchmarks for hook execution
5. Complete list of supported matchers for hooks

These areas require testing or additional documentation access.
