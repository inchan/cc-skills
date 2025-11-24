---
description: Install all cc-skills plugins at once
allowed-tools: Bash, Read, Write, TodoWrite
---

# Install All CC-Skills Plugins

You are tasked with installing all 7 cc-skills plugins in one go.

## Plugin List

The following plugins should be installed:

1. **workflow-automation** - Task orchestration and routing (7 skills, 4 commands, 1 agent)
2. **dev-guidelines** - Frontend/Backend development patterns (3 skills)
3. **tool-creators** - Skill/Command/Agent/Hook creation tools (5 skills)
4. **quality-review** - Code quality and review tools (2 skills, 2 agents)
5. **ai-integration** - External AI CLI integration (3 skills)
6. **prompt-enhancement** - Prompt optimization tools (2 skills)
7. **utilities** - Utility tools (1 skill)

## Installation Steps

1. **Check Current Installation Status**
   ```bash
   claude plugin list
   ```

2. **Run Installation Script**
   ```bash
   bash scripts/install-all-plugins.sh
   ```

3. **Verify Installation**
   After installation, verify all plugins are loaded:
   ```bash
   claude plugin list | grep -E "(workflow-automation|dev-guidelines|tool-creators|quality-review|ai-integration|prompt-enhancement|utilities)"
   ```

4. **Report Results**
   - List successfully installed plugins
   - Report any failures with error messages
   - Provide next steps

## Fallback: Individual Installation

If the batch script fails, fall back to installing each plugin individually:

```bash
claude plugin install ./plugins/workflow-automation
claude plugin install ./plugins/dev-guidelines
claude plugin install ./plugins/tool-creators
claude plugin install ./plugins/quality-review
claude plugin install ./plugins/ai-integration
claude plugin install ./plugins/prompt-enhancement
claude plugin install ./plugins/utilities
```

## Success Criteria

- All 7 plugins installed without errors
- `claude plugin list` shows all 7 plugins
- No duplicate installations
- Clear summary of installation results

## Post-Installation

After successful installation, inform the user:

1. **No restart required**: Plugins are immediately active
2. **Available features**:
   - 23 skills now available
   - 4 workflow commands: `/auto-workflow`, `/workflow-simple`, `/workflow-parallel`, `/workflow-complex`
   - 3 specialized agents: code-reviewer, architect, workflow-orchestrator
3. **Quick start**: "Try '/help' to see all available commands"

## Troubleshooting

If installation fails:
- Check that Claude Code CLI is installed and in PATH
- Verify plugins/ directory exists and contains all 7 plugins
- Check file permissions on plugin directories
- Look for specific error messages in the output
- Try individual plugin installation to isolate the issue

Start the installation process now.
