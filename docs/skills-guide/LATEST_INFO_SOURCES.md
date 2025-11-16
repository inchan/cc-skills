# Where to Find Latest Information on Claude Code Skills

**Stay current with Claude Code developments. This guide lists authoritative sources ranked by reliability and how to use them.**

---

## Source Priority Hierarchy

```
Priority 1: Official Anthropic Sources (Highest Trust)
Priority 2: GitHub Repository (Source of Truth)
Priority 3: Community Analysis (Interpretation & Examples)
Priority 4: Personal Experimentation (Ground Truth Testing)
```

---

## Priority 1: Official Anthropic Sources

### 1.1 Anthropic Engineering Blog

**URL**: https://www.anthropic.com/engineering

**Why Use This:**
- Written by Claude Code developers
- Deep technical explanations
- Design philosophy and rationale
- First-party implementation details

**Key Articles:**
- "Equipping agents for the real world with Agent Skills" - Core skills architecture
- "Claude Code Best Practices" - Official recommendations
- "Enabling Claude Code to work more autonomously" - Latest autonomous features

**How to Monitor:**
```bash
# RSS feed (if available)
https://www.anthropic.com/engineering/rss

# Or bookmark and check monthly
```

**Reliability**: ⭐⭐⭐⭐⭐ (Highest - Primary Source)

---

### 1.2 Official Documentation

**URLs:**
- https://docs.claude.com/en/docs/claude-code/skills
- https://docs.claude.com/en/docs/claude-code/slash-commands
- https://docs.claude.com/en/docs/claude-code/sub-agents
- https://docs.claude.com/en/docs/claude-code/hooks

**Why Use This:**
- Canonical reference
- Updated with releases
- Official API specifications
- Complete feature documentation

**How to Access:**
```bash
# Direct URLs
https://docs.claude.com/en/docs/claude-code/

# Search functionality
https://docs.claude.com/en/search
```

**Known Issue**: Some URLs return 403. Try alternative paths or check GitHub for mirrors.

**Reliability**: ⭐⭐⭐⭐⭐ (Highest - Canonical)

---

### 1.3 Anthropic Academy

**URL**: https://www.anthropic.com/learn/build-with-claude

**Why Use This:**
- Structured learning paths
- Official tutorials
- Best practices courses
- Video content

**When to Use:**
- Learning new features
- Understanding design patterns
- Following official workflows

**Reliability**: ⭐⭐⭐⭐⭐ (Highest - Educational)

---

## Priority 2: GitHub Repository

### 2.1 Claude Code Issues

**URL**: https://github.com/anthropics/claude-code/issues

**Why Use This:**
- Bug reports reveal undocumented behavior
- Feature requests show roadmap hints
- Developer discussions
- Real-world problem solutions

**Key Labels to Watch:**
- `documentation` - Docs updates needed
- `enhancement` - New feature discussions
- `bug` - Known issues
- `question` - Common problems

**Search Queries:**
```bash
# Skills-related issues
is:issue skills label:documentation

# Sub-agent behavior
is:issue subagent OR sub-agent

# Recent activity
is:issue created:>2025-01-01 sort:updated-desc
```

**Important Recent Issues:**
- #10993: CLAUDE_CODE_SUBAGENT_MODEL behavior unclear
- #8624: /agents command removed (not documented)
- #4750: Subagent behavior in Plan Mode undefined

**Reliability**: ⭐⭐⭐⭐ (High - Source Code Discussions)

---

### 2.2 Official Skills Repository

**URL**: https://github.com/anthropics/skills

**Why Use This:**
- Reference skill implementations
- Official skill structure
- Best practice examples
- Template skills

**Contents:**
- 14+ example skills (algorithmic-art, brand-guidelines, etc.)
- skill-creator meta-skill
- Document processing skills (PDF, DOCX, PPTX, XLSX)

**How to Use:**
```bash
# Clone for reference
git clone https://github.com/anthropics/skills

# Study structure
tree skills/skill-creator

# Examine patterns
cat skills/skill-creator/SKILL.md
```

**Reliability**: ⭐⭐⭐⭐⭐ (Highest - Official Examples)

---

### 2.3 Claude Code Releases

**URL**: https://github.com/anthropics/claude-code/releases

**Why Use This:**
- Version history
- Breaking changes
- New features
- Migration guides

**Note**: As of 2025-11, no formal releases published on GitHub. Check CHANGELOG.md in repository instead.

**Alternative:**
```bash
# Check CHANGELOG directly
https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md

# Or via npm
npm view @anthropic-ai/claude-code changelog
```

**Reliability**: ⭐⭐⭐⭐ (High - Release Notes)

---

### 2.4 Claude Agent SDK

**URL**: https://github.com/anthropics/claude-agent-sdk-python

**Why Use This:**
- Programmatic Skills API
- Session forking
- Advanced patterns
- SDK documentation

**For Advanced Users** who need programmatic control over skills.

**Reliability**: ⭐⭐⭐⭐ (High - Official SDK)

---

## Priority 3: Community Analysis

### 3.1 Simon Willison's Blog

**URL**: https://simonwillison.net/

**Why Use This:**
- Expert technical analysis
- Critical evaluation
- Practical insights
- Real-world testing

**Notable Article**: "Claude Skills are awesome, maybe a bigger deal than MCP"

**Reliability**: ⭐⭐⭐⭐ (High - Expert Analysis)

---

### 3.2 Medium/Substack Technical Articles

**Notable Authors:**
- Tyler Folkman: Context window management
- Vuong Ngo: Reverse engineering Claude Code
- Daniel Miessler: Practical use cases

**How to Find:**
```
Search: "Claude Code Skills" site:medium.com OR site:substack.com
Filter: Last month
```

**Reliability**: ⭐⭐⭐ (Medium - Community Analysis)

---

### 3.3 Developer Communities

**Platforms:**
- Reddit r/ClaudeAI
- Discord (Anthropic community)
- Twitter/X #ClaudeCode
- LinkedIn Claude Code posts

**Use For:**
- Real user experiences
- Workarounds for issues
- Use case inspiration
- Community solutions

**Caution**: Verify information against official sources.

**Reliability**: ⭐⭐ (Medium-Low - Anecdotal)

---

## Priority 4: Personal Experimentation

### 4.1 Version Checking

```bash
# Check current Claude Code version
claude --version

# Check for updates
npm update -g @anthropic-ai/claude-code

# See what's new
claude --help | grep -i new
```

### 4.2 Testing Skill Behavior

```bash
# Test skill activation
echo '{"prompt":"test keywords"}' | \
  npx tsx .claude/hooks/skill-activation-prompt.ts

# Check skill loading
claude "What skills are available?"

# Verify trigger patterns
# (Create test skill, trigger with various prompts)
```

### 4.3 Feature Discovery

```bash
# List all available commands
ls ~/.claude/commands/
ls .claude/commands/

# Check hook events
cat .claude/settings.json | jq '.hooks'

# Explore skill structure
find .claude/skills -name "SKILL.md" -exec head -20 {} \;
```

**Reliability**: ⭐⭐⭐⭐⭐ (Highest - Ground Truth)

---

## Recommended Monitoring Strategy

### Weekly

1. **Check GitHub Issues** (10 min)
   - Filter by `created:>@today-7d`
   - Look for `skills`, `subagent`, `hooks` mentions
   - Note any `DOCS` or `breaking` labels

2. **Test Current Setup** (5 min)
   - Verify skills still activate correctly
   - Check for deprecation warnings
   - Update if new version available

### Monthly

1. **Review Anthropic Blog** (15 min)
   - New engineering posts
   - Feature announcements
   - Best practice updates

2. **Update Documentation** (30 min)
   - Sync with official docs
   - Verify examples still work
   - Update version references

### Quarterly

1. **Deep Dive Analysis** (2 hours)
   - Read all new official documentation
   - Test major new features
   - Update skill implementations
   - Refactor based on new patterns

2. **Community Research** (1 hour)
   - Read top blog posts
   - Review GitHub discussions
   - Check for new patterns/anti-patterns

---

## Red Flags for Outdated Information

⚠️ **Warning Signs:**

1. **Version Mismatch**
   - Article mentions old version (< 2.0)
   - References deprecated commands (/agents removed in 2.0)
   - Uses old file locations

2. **Date Issues**
   - Article older than 6 months
   - No date listed (assume outdated)
   - References "upcoming features" that may have changed

3. **Contradiction with Official Docs**
   - Behavior described differs from docs
   - Uses unsupported parameters
   - Claims features that don't exist

4. **No Source Verification**
   - No links to official docs
   - No version numbers mentioned
   - No testing evidence

---

## Quick Reference: Information Sources

| Source | URL | Update Frequency | Use For |
|--------|-----|-----------------|---------|
| Anthropic Blog | anthropic.com/engineering | Monthly | Design philosophy, new features |
| Official Docs | docs.claude.com | With releases | Canonical reference |
| GitHub Issues | github.com/anthropics/claude-code/issues | Daily | Bugs, discussions, edge cases |
| Skills Repo | github.com/anthropics/skills | As needed | Example implementations |
| Community Blogs | Various | Weekly | Practical insights, workarounds |
| Personal Testing | Your machine | As needed | Ground truth verification |

---

## Bookmarks to Save

```
# Essential (Check Monthly)
https://www.anthropic.com/engineering
https://docs.claude.com/en/docs/claude-code
https://github.com/anthropics/claude-code/issues

# Reference (Check When Needed)
https://github.com/anthropics/skills
https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md

# Community (Browse Occasionally)
https://simonwillison.net/
Medium/Substack search results
```

---

## Summary

**Stay current by:**

1. **Prioritize official sources** - Engineering blog > Docs > GitHub
2. **Monitor GitHub issues** - Real problems and solutions
3. **Test locally** - Your environment is ground truth
4. **Verify community info** - Cross-reference with official sources
5. **Note versions** - Features change between versions

**Remember**: Claude Code is rapidly evolving. Information from 6+ months ago may be outdated. Always verify against current version behavior.

---

**Next**: See [COMMON_PITFALLS.md](COMMON_PITFALLS.md) for mistakes to avoid
