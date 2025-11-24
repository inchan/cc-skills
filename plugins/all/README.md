# All Plugin

Meta-plugin for installing all cc-skills plugins at once.

## Purpose

Instead of manually installing 7 plugins one by one, this plugin provides:
- Convenient `/install-all` command to install all cc-skills plugins in a single operation

## Architecture

This plugin provides a single convenience command:

```
plugins/all/
├── .claude-plugin/plugin.json    # "name": "all"
├── commands/
│   └── install-all.md            # Installation command
└── README.md
```

## Installation

Install this plugin:

```bash
claude plugin install ./plugins/all
```

This will activate:
- ✅ `/install-all` command

## Usage

### Install All Plugins

```bash
/install-all
```

This will:
1. Check current plugin installation status
2. Install all 7 cc-skills plugins:
   - workflow-automation
   - dev-guidelines
   - tool-creators
   - quality-review
   - ai-integration
   - prompt-enhancement
   - utilities
3. Verify installation
4. Report results

### Alternative: Direct Script

```bash
bash scripts/install-all-plugins.sh
```

## What Gets Installed

- **23 skills** across 7 plugins
- **4 workflow commands** (auto-workflow, workflow-simple/parallel/complex)
- **3 specialized agents** (code-reviewer, architect, workflow-orchestrator)

**Note**: Global hooks are provided by the separate `cc-skills-hooks` plugin. Install it separately for skill auto-activation.

## Global Hooks (Optional)

Global hooks are now provided by the separate `cc-skills-hooks` plugin:

```bash
claude plugin install <path-to-cc-skills>/hooks
```

This will activate:
- **UserPromptSubmit Hook**: Auto-activates skills based on keywords
- **Stop Hook**: Lint and translate on stop event

## Post-Installation

After installation:
1. No restart required - plugins are immediately active
2. Run `claude plugin list` to verify
3. Try `/help` to see all available commands
4. Skills will auto-activate based on your prompts

## Verification

Check that the plugin is properly installed:

```bash
# List installed plugins
claude plugin list

# Should include: all, workflow-automation, dev-guidelines, etc.
```

## Troubleshooting

### Hooks Not Working

If you need global hooks (skill auto-activation):
1. Install the `cc-skills-hooks` plugin separately:
   ```bash
   claude plugin install <path-to-cc-skills>/hooks
   ```
2. Verify installation:
   ```bash
   claude plugin list | grep cc-skills-hooks
   ```

### Installation Fails

If installation fails:
- Ensure Claude Code CLI is installed
- Check file permissions on plugins/ directory
- Try individual plugin installation
- Check error messages for specific issues

## Uninstalling

To uninstall all plugins:

```bash
claude plugin uninstall workflow-automation dev-guidelines tool-creators quality-review ai-integration prompt-enhancement utilities all
```

Or use the uninstall script:

```bash
bash scripts/uninstall-all-plugins.sh
```

## Technical Notes

### Separation of Concerns

This plugin focuses solely on convenience installation:
- **all plugin**: Provides `/install-all` command
- **cc-skills-hooks plugin**: Provides global hooks (separate installation)

**Advantages:**
- ✅ No duplication of hook scripts
- ✅ Single source of truth for hooks (`/hooks/`)
- ✅ Users can choose: install all features or just what they need
- ✅ Cleaner plugin architecture

### Future Improvements

- [ ] Add pre-install hook to verify dependencies
- [ ] Add post-install verification hook
- [ ] Support custom plugin selection
- [ ] Add rollback on partial installation failure
