#!/usr/bin/env node

/**
 * Phase 0: 스킬 간 의존성 분석 스크립트
 *
 * 분석 항목:
 * 1. Skill() 호출 - 다른 스킬을 직접 호출하는 경우
 * 2. 파일 참조 - 다른 스킬의 파일을 참조하는 경우
 * 3. Command에서 Skill 호출
 * 4. Agent에서 Skill 호출
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 플러그인 분류 (제안된 구조)
const pluginMapping = {
  'workflow-automation': [
    'agent-workflow-manager',
    'agent-workflow-advisor',
    'agent-workflow-orchestrator',
    'intelligent-task-router',
    'sequential-task-processor',
    'parallel-task-executor',
    'dynamic-task-orchestrator'
  ],
  'dev-guidelines': [
    'frontend-dev-guidelines',
    'backend-dev-guidelines',
    'error-tracking'
  ],
  'tool-creators': [
    'skill-generator-tool',
    'skill-developer',
    'command-creator',
    'subagent-creator',
    'hooks-creator'
  ],
  'quality-review': [
    'iterative-quality-enhancer',
    'reflection-review'
  ],
  'ai-integration': [
    'dual-ai-loop',
    'cli-updater',
    'cli-adapters'
  ],
  'prompt-enhancement': [
    'meta-prompt-generator',
    'prompt-enhancer'
  ],
  'utilities': [
    'route-tester'
  ]
};

// 스킬 → 플러그인 역매핑
const skillToPlugin = {};
for (const [plugin, skills] of Object.entries(pluginMapping)) {
  for (const skill of skills) {
    skillToPlugin[skill] = plugin;
  }
}

// 의존성 저장
const dependencies = {
  skillToSkill: [],      // 스킬 간 호출
  commandToSkill: [],    // 커맨드 → 스킬
  agentToSkill: [],      // 에이전트 → 스킬
  fileReferences: []     // 파일 참조
};

/**
 * 파일에서 Skill() 호출 패턴 추출
 */
function extractSkillCalls(content, sourceFile) {
  const patterns = [
    /Skill\(['"]([^'"]+)['"]\)/g,           // Skill("skill-name")
    /invoke.*skill.*['"]([^'"]+)['"]/gi,    // invoke skill "skill-name"
    /use.*skill.*['"]([^'"]+)['"]/gi,       // use skill "skill-name"
    /call.*skill.*['"]([^'"]+)['"]/gi       // call skill "skill-name"
  ];

  const calls = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      calls.push({
        skillName: match[1],
        sourceFile: sourceFile,
        pattern: match[0]
      });
    }
  }
  return calls;
}

/**
 * 디렉토리 재귀 탐색
 */
function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (entry.isFile()) {
      callback(fullPath);
    }
  }
}

/**
 * 스킬 디렉토리 분석
 */
function analyzeSkills() {
  log('\n━━━ 스킬 분석 ━━━', 'blue');

  const skillsDir = path.join(__dirname, '..', 'src', 'skills');
  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const skillDir of skillDirs) {
    const skillPath = path.join(skillsDir, skillDir);

    walkDir(skillPath, (filePath) => {
      // .md, .js, .sh, .py 파일만 분석
      if (!/\.(md|js|sh|py)$/.test(filePath)) return;

      const content = fs.readFileSync(filePath, 'utf8');
      const calls = extractSkillCalls(content, filePath);

      for (const call of calls) {
        const targetSkill = call.skillName;

        // 자기 자신 호출 제외
        if (targetSkill === skillDir) continue;

        dependencies.skillToSkill.push({
          source: skillDir,
          target: targetSkill,
          sourceFile: filePath.replace(skillPath, `skills/${skillDir}`),
          pattern: call.pattern,
          sourcePlugin: skillToPlugin[skillDir],
          targetPlugin: skillToPlugin[targetSkill]
        });
      }
    });
  }

  log(`✓ ${skillDirs.length}개 스킬 분석 완료`, 'green');
}

/**
 * 커맨드 분석
 */
function analyzeCommands() {
  log('\n━━━ 커맨드 분석 ━━━', 'blue');

  const commandsDir = path.join(__dirname, '..', 'src', 'commands');
  if (!fs.existsSync(commandsDir)) {
    log('⚠ commands 디렉토리 없음', 'yellow');
    return;
  }

  const commandFiles = fs.readdirSync(commandsDir)
    .filter(f => f.endsWith('.md'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const calls = extractSkillCalls(content, filePath);

    for (const call of calls) {
      dependencies.commandToSkill.push({
        command: file.replace('.md', ''),
        skill: call.skillName,
        skillPlugin: skillToPlugin[call.skillName],
        pattern: call.pattern
      });
    }
  }

  log(`✓ ${commandFiles.length}개 커맨드 분석 완료`, 'green');
}

/**
 * 에이전트 분석
 */
function analyzeAgents() {
  log('\n━━━ 에이전트 분석 ━━━', 'blue');

  const agentsDir = path.join(__dirname, '..', 'src', 'agents');
  if (!fs.existsSync(agentsDir)) {
    log('⚠ agents 디렉토리 없음', 'yellow');
    return;
  }

  const agentFiles = fs.readdirSync(agentsDir)
    .filter(f => f.endsWith('.md'));

  for (const file of agentFiles) {
    const filePath = path.join(agentsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const calls = extractSkillCalls(content, filePath);

    for (const call of calls) {
      dependencies.agentToSkill.push({
        agent: file.replace('.md', ''),
        skill: call.skillName,
        skillPlugin: skillToPlugin[call.skillName],
        pattern: call.pattern
      });
    }
  }

  log(`✓ ${agentFiles.length}개 에이전트 분석 완료`, 'green');
}

/**
 * 결과 출력
 */
function printResults() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  의존성 분석 결과', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // 1. 스킬 간 의존성
  log('📌 스킬 간 의존성:', 'yellow');
  if (dependencies.skillToSkill.length === 0) {
    log('  없음', 'dim');
  } else {
    // 플러그인 간 의존성만 필터링
    const crossPlugin = dependencies.skillToSkill.filter(
      d => d.sourcePlugin !== d.targetPlugin
    );

    log(`\n  총 ${dependencies.skillToSkill.length}개 호출 (플러그인 간 ${crossPlugin.length}개)\n`, 'dim');

    if (crossPlugin.length > 0) {
      log('  ⚠️  플러그인 간 의존성 (주의 필요):', 'red');
      for (const dep of crossPlugin) {
        log(`    ${dep.source} [${dep.sourcePlugin}]`, 'yellow');
        log(`      → ${dep.target} [${dep.targetPlugin}]`, 'yellow');
        log(`      파일: ${dep.sourceFile}`, 'dim');
        log(`      패턴: ${dep.pattern}\n`, 'dim');
      }
    }

    // 플러그인 내부 의존성
    const internalDeps = dependencies.skillToSkill.filter(
      d => d.sourcePlugin === d.targetPlugin
    );

    if (internalDeps.length > 0) {
      log(`\n  ✓ 플러그인 내부 의존성 (${internalDeps.length}개):`, 'green');
      const grouped = {};
      for (const dep of internalDeps) {
        const key = dep.sourcePlugin;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(`${dep.source} → ${dep.target}`);
      }

      for (const [plugin, deps] of Object.entries(grouped)) {
        log(`\n    [${plugin}]`, 'cyan');
        for (const dep of deps) {
          log(`      ${dep}`, 'dim');
        }
      }
    }
  }

  // 2. 커맨드 → 스킬
  log('\n\n📌 커맨드 → 스킬 의존성:', 'yellow');
  if (dependencies.commandToSkill.length === 0) {
    log('  없음', 'dim');
  } else {
    for (const dep of dependencies.commandToSkill) {
      log(`  ${dep.command} → ${dep.skill} [${dep.skillPlugin}]`, 'dim');
    }
  }

  // 3. 에이전트 → 스킬
  log('\n📌 에이전트 → 스킬 의존성:', 'yellow');
  if (dependencies.agentToSkill.length === 0) {
    log('  없음', 'dim');
  } else {
    for (const dep of dependencies.agentToSkill) {
      log(`  ${dep.agent} → ${dep.skill} [${dep.skillPlugin}]`, 'dim');
    }
  }

  // 4. 요약 및 권장사항
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  요약 및 권장사항', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  const crossPluginDeps = dependencies.skillToSkill.filter(
    d => d.sourcePlugin !== d.targetPlugin
  );

  if (crossPluginDeps.length === 0) {
    log('✅ 플러그인 간 의존성 없음 - 안전하게 분리 가능', 'green');
  } else {
    log(`⚠️  ${crossPluginDeps.length}개 플러그인 간 의존성 발견`, 'yellow');
    log('\n해결 방법:', 'yellow');
    log('  1. 플러그인 간 스킬 호출 시 전체 경로 사용:', 'dim');
    log('     Skill("plugin-name:skill-name")', 'dim');
    log('  2. 의존성이 많은 스킬은 같은 플러그인으로 재분류', 'dim');
    log('  3. plugin.json에 dependencies 명시', 'dim');
  }

  log('');
}

/**
 * JSON 저장
 */
function saveResults() {
  const outputPath = path.join(__dirname, '..', 'tests', 'dependency-analysis.json');

  const output = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSkillToSkill: dependencies.skillToSkill.length,
      crossPluginDeps: dependencies.skillToSkill.filter(
        d => d.sourcePlugin !== d.targetPlugin
      ).length,
      commandToSkill: dependencies.commandToSkill.length,
      agentToSkill: dependencies.agentToSkill.length
    },
    pluginMapping,
    dependencies
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  log(`\n💾 분석 결과 저장: ${outputPath}`, 'green');
}

/**
 * 메인 실행
 */
async function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  Phase 0: 의존성 분석 시작', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

  try {
    analyzeSkills();
    analyzeCommands();
    analyzeAgents();
    printResults();
    saveResults();

    log('\n✅ 분석 완료\n', 'green');
    process.exit(0);

  } catch (err) {
    log(`\n❌ 에러 발생: ${err.message}`, 'red');
    if (err.stack) {
      log(`\n${err.stack}`, 'dim');
    }
    process.exit(1);
  }
}

main();
