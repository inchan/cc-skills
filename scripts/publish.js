#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

// 로그 헬퍼
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}✗ ${msg}${colors.reset}`),
};

// 커맨드 실행 헬퍼
function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
  } catch (error) {
    if (options.ignoreError) {
      return null;
    }
    throw error;
  }
}

// Git 상태 확인
function checkGitStatus() {
  log.info('Git 상태 확인 중...');

  // 현재 브랜치 확인
  const currentBranch = exec('git rev-parse --abbrev-ref HEAD', { silent: true }).trim();
  if (currentBranch !== 'main') {
    log.warning(`현재 브랜치: ${currentBranch} (main 브랜치 권장)`);
  } else {
    log.success(`현재 브랜치: ${currentBranch}`);
  }

  // 커밋되지 않은 변경사항 확인
  const status = exec('git status --porcelain', { silent: true });
  if (status && status.trim()) {
    log.error('커밋되지 않은 변경사항이 있습니다:');
    console.log(status);
    throw new Error('먼저 변경사항을 커밋하거나 stash하세요.');
  }

  log.success('Git 상태 정상');
}

// Semver 형식 검증
function validateVersion(version) {
  const semverRegex = /^\d+\.\d+\.\d+$/;
  if (!semverRegex.test(version)) {
    throw new Error(`잘못된 버전 형식: ${version} (예: 1.2.3)`);
  }
  return version;
}

// 버전 bump 계산
function bumpVersion(currentVersion, bumpType) {
  const parts = currentVersion.split('.').map(Number);

  switch (bumpType) {
    case 'major':
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1] += 1;
      parts[2] = 0;
      break;
    case 'patch':
      parts[2] += 1;
      break;
    default:
      throw new Error(`알 수 없는 bump 타입: ${bumpType}`);
  }

  return parts.join('.');
}

// 현재 버전 읽기
function getCurrentVersion() {
  const pluginJsonPath = path.join(__dirname, '../.claude-plugin/plugin.json');
  const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
  return pluginJson.version;
}

// 새 버전 결정
async function determineNewVersion(currentVersion, args) {
  // CLI 인자로 버전 지정
  if (args.version) {
    return validateVersion(args.version);
  }

  // bump 타입 지정
  if (args.patch || args.minor || args.major) {
    const bumpType = args.major ? 'major' : args.minor ? 'minor' : 'patch';
    const newVersion = bumpVersion(currentVersion, bumpType);
    log.info(`버전 ${bumpType} bump: ${currentVersion} → ${newVersion}`);
    return newVersion;
  }

  // 대화형 모드
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    console.log(`\n현재 버전: ${colors.blue}${currentVersion}${colors.reset}`);
    console.log('선택 가능한 버전:');
    console.log(`  1) patch: ${bumpVersion(currentVersion, 'patch')}`);
    console.log(`  2) minor: ${bumpVersion(currentVersion, 'minor')}`);
    console.log(`  3) major: ${bumpVersion(currentVersion, 'major')}`);
    console.log('  4) 직접 입력\n');

    rl.question('버전 선택 (1-4): ', (answer) => {
      rl.close();

      try {
        let newVersion;
        switch (answer.trim()) {
          case '1':
            newVersion = bumpVersion(currentVersion, 'patch');
            break;
          case '2':
            newVersion = bumpVersion(currentVersion, 'minor');
            break;
          case '3':
            newVersion = bumpVersion(currentVersion, 'major');
            break;
          case '4':
            const rl2 = readline.createInterface({
              input: process.stdin,
              output: process.stdout,
            });
            rl2.question('새 버전 입력 (예: 1.5.0): ', (version) => {
              rl2.close();
              try {
                resolve(validateVersion(version.trim()));
              } catch (error) {
                reject(error);
              }
            });
            return;
          default:
            reject(new Error('잘못된 선택입니다.'));
            return;
        }
        resolve(newVersion);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// 버전 업데이트
function updateVersionFiles(newVersion) {
  log.info('버전 파일 업데이트 중...');

  // plugin.json 업데이트
  const pluginJsonPath = path.join(__dirname, '../.claude-plugin/plugin.json');
  const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
  pluginJson.version = newVersion;
  fs.writeFileSync(pluginJsonPath, JSON.stringify(pluginJson, null, 2) + '\n');
  log.success(`plugin.json 업데이트: ${newVersion}`);

  // marketplace.json 업데이트
  const marketplaceJsonPath = path.join(__dirname, '../.claude-plugin/marketplace.json');
  const marketplaceJson = JSON.parse(fs.readFileSync(marketplaceJsonPath, 'utf8'));
  marketplaceJson.plugins[0].version = newVersion;
  fs.writeFileSync(marketplaceJsonPath, JSON.stringify(marketplaceJson, null, 2) + '\n');
  log.success(`marketplace.json 업데이트: ${newVersion}`);
}

// 빌드 실행
function runBuild() {
  log.info('빌드 실행 중...');
  exec('npm run build');
  log.success('빌드 완료');
}

// Git 커밋 및 태그
function gitCommitAndTag(version) {
  log.info('Git 커밋 및 태그 생성 중...');

  exec('git add .claude-plugin/plugin.json .claude-plugin/marketplace.json plugin/');
  exec(`git commit -m "chore: Release v${version}"`);
  exec(`git tag "v${version}"`);

  log.success(`커밋 및 태그 생성 완료: v${version}`);
}

// Git 푸시
function gitPush(version) {
  log.info('Git 푸시 중...');

  exec('git push origin main');
  exec(`git push origin "v${version}"`);

  log.success('푸시 완료');
}

// CLI 인자 파싱
function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--patch') {
      args.patch = true;
    } else if (arg === '--minor') {
      args.minor = true;
    } else if (arg === '--major') {
      args.major = true;
    } else if (arg === '--push') {
      args.push = true;
    } else if (arg === '--version' && process.argv[i + 1]) {
      args.version = process.argv[i + 1];
      i++;
    }
  }
  return args;
}

// 메인 함수
async function main() {
  try {
    console.log('\n=== cc-skills 배포 자동화 ===\n');

    // CLI 인자 파싱
    const args = parseArgs();

    // 1. Git 상태 확인
    checkGitStatus();

    // 2. 현재 버전 읽기
    const currentVersion = getCurrentVersion();

    // 3. 새 버전 결정
    const newVersion = await determineNewVersion(currentVersion, args);

    // 확인
    console.log(`\n${colors.yellow}배포 정보:${colors.reset}`);
    console.log(`  현재 버전: ${currentVersion}`);
    console.log(`  새 버전:   ${newVersion}`);
    console.log(`  푸시:      ${args.push ? '예' : '아니오'}\n`);

    if (!args.patch && !args.minor && !args.major && !args.version) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const confirmed = await new Promise((resolve) => {
        rl.question('계속하시겠습니까? (y/N): ', (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 'y');
        });
      });

      if (!confirmed) {
        log.warning('배포 취소됨');
        process.exit(0);
      }
    }

    // 4. 버전 업데이트
    updateVersionFiles(newVersion);

    // 5. 빌드 실행
    runBuild();

    // 6. Git 커밋 및 태그
    gitCommitAndTag(newVersion);

    // 7. Git 푸시 (선택적)
    if (args.push) {
      gitPush(newVersion);
    } else {
      log.info('푸시를 건너뜁니다. 수동으로 푸시하려면:');
      console.log(`  git push origin main`);
      console.log(`  git push origin v${newVersion}`);
    }

    console.log(`\n${colors.green}=== 배포 완료: v${newVersion} ===${colors.reset}\n`);

  } catch (error) {
    log.error(`배포 실패: ${error.message}`);
    process.exit(1);
  }
}

// 스크립트 실행
main();
