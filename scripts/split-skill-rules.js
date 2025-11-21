#!/usr/bin/env node

/**
 * Split skill-rules.json into plugin-specific files
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcSkillRulesPath = path.join(rootDir, 'src/skills/skill-rules.json');

// Plugin → Skills mapping
const pluginMapping = {
  'workflow-automation': [
    'agent-workflow-manager',
    'agent-workflow-advisor',
    'intelligent-task-router',
    'parallel-task-executor',
    'dynamic-task-orchestrator',
    'sequential-task-processor'
  ],
  'dev-guidelines': [
    'backend-dev-guidelines',
    'frontend-dev-guidelines',
    'error-tracking'
  ],
  'tool-creators': [
    'skill-developer',
    'skill-generator-tool',
    'command-creator',
    'hooks-creator',
    'subagent-creator'
  ],
  'quality-review': [
    'iterative-quality-enhancer',
    'reflection-review'
  ],
  'prompt-enhancement': [
    'meta-prompt-generator',
    'prompt-enhancer'
  ],
  'utilities': [
    'route-tester'
  ]
};

// Read original skill-rules.json
const originalRules = JSON.parse(fs.readFileSync(srcSkillRulesPath, 'utf8'));

// Split into plugin-specific files
for (const [plugin, skillNames] of Object.entries(pluginMapping)) {
  const pluginRules = {
    version: originalRules.version,
    description: `Skill activation triggers for ${plugin} plugin`,
    skills: {},
    notes: originalRules.notes
  };

  // Extract skills for this plugin
  for (const skillName of skillNames) {
    if (originalRules.skills[skillName]) {
      pluginRules.skills[skillName] = originalRules.skills[skillName];
    }
  }

  // Write to plugin directory
  const outputPath = path.join(rootDir, 'plugins', plugin, 'skills', 'skill-rules.json');
  fs.writeFileSync(outputPath, JSON.stringify(pluginRules, null, 4) + '\n');

  console.log(`✓ ${plugin}: ${skillNames.length} skills`);
}

console.log('\n✅ skill-rules.json 분할 완료');
