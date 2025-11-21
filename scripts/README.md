# Scripts

Claude Code Skills 프로젝트의 설치/제거 스크립트 모음입니다.

> **참고**: 테스트 파일들은 `/tests` 폴더에 있습니다.

## 스크립트 목록

### install-skills.js

현재 프로젝트의 `.claude` 리소스를 global 또는 workspace에 설치합니다.

#### 사용법

```bash
# 대화형 모드
node scripts/install-skills.js

# 직접 지정
node scripts/install-skills.js --target global     # ~/.claude에 설치
node scripts/install-skills.js --target workspace  # ./.claude에 설치

# 특정 경로에 설치
node scripts/install-skills.js --path /custom/path/.claude

# 미리보기 (실제 변경 없음)
node scripts/install-skills.js --dry-run

# 비대화형 (확인 생략)
node scripts/install-skills.js --target global --yes
node scripts/install-skills.js --path /other/project/.claude -y
```

#### 주요 기능

- **설치 위치 선택**: global (`~/.claude`) 또는 workspace (`./.claude`)
- **백업**: 덮어쓰기 전 기존 파일을 `.backup/` 폴더에 타임스탬프와 함께 저장
- **JSON 병합**: `skill-rules.json`과 설정 파일은 병합 처리
- **npm install**: hooks 의존성 자동 설치
- **롤백**: 설치 실패 시 롤백 옵션 제공
- **Dry-run**: 실제 변경 없이 미리보기

#### 설정 파일 처리

Claude Code 공식 구조에 맞게 설정 파일을 설치합니다:

| 설치 위치 | 설정 파일 | hooks 경로 | 용도 |
|----------|----------|:----------:|------|
| global | `~/.claude/settings.json` | 절대 경로 | 사용자 전역 설정 (모든 프로젝트 적용) |
| workspace | `.claude/settings.local.json` | 상대 경로 | 로컬 프로젝트 설정 (커밋 제외) |

> **Global hooks**: 절대 경로(`/Users/.../~/.claude/hooks/...`)로 변환되어 모든 프로젝트에서 동작합니다.

> **참고**: `.claude/settings.json`은 프로젝트 설정으로 커밋되며, 별도 생성이 필요합니다.

#### 설치 대상

- 23개 스킬 폴더
- 4개 커맨드 파일
- 3개 훅 파일 + package.json

---

### uninstall-skills.js

설치된 스킬, 커맨드, 훅을 제거하거나 백업에서 복원합니다.

#### 사용법

```bash
# 대화형 모드
node scripts/uninstall-skills.js

# 직접 지정
node scripts/uninstall-skills.js --target global     # ~/.claude에서 제거
node scripts/uninstall-skills.js --target workspace  # ./.claude에서 제거

# 미리보기 (실제 변경 없음)
node scripts/uninstall-skills.js --dry-run

# 백업에서 복원
node scripts/uninstall-skills.js --restore

# 특정 스킬만 제거
node scripts/uninstall-skills.js --skill agent-workflow-manager

# 특정 경로에서 제거
node scripts/uninstall-skills.js --path /custom/path/.claude

# 비대화형 (확인 생략)
node scripts/uninstall-skills.js --target global --yes

# 조합 사용
node scripts/uninstall-skills.js --path /project/.claude --skill prompt-enhancer --dry-run
```

#### 주요 기능

- **제거 위치 선택**: global (`~/.claude`) 또는 workspace (`./.claude`)
- **스킬 제거**: 24개 스킬 폴더 제거 (동적 스캔)
- **부분 제거**: `--skill` 옵션으로 특정 스킬만 제거
- **커맨드 제거**: commands 폴더 내 파일 제거
- **훅 제거**: hooks 폴더 전체 제거
- **설정 정리**: settings 파일에서 hooks 설정 제거
- **백업 복원**: 이전 백업에서 파일 복원
- **Dry-run**: 실제 변경 없이 상세 미리보기
- **진행 상황**: 대량 제거 시 프로그레스 바 표시

#### 제거 대상

- 23개 스킬 폴더
- 4개 커맨드 파일
- hooks 폴더 전체
- skill-rules.json (빈 객체로 초기화)

---

### build.js

플러그인을 빌드하여 `plugin/` 디렉토리에 배포 가능한 형태로 생성합니다.

#### 사용법

```bash
npm run build
```

#### 동작

- `src/` 디렉토리의 모든 스킬, 커맨드, 훅, 에이전트를 `plugin/` 디렉토리로 복사
- `.claude-plugin/plugin.json` 복사
- 빌드 완료 메시지 출력

---

### publish.js

버전 관리 및 배포를 자동화하는 스크립트입니다.

#### 사용법

```bash
# 대화형 모드 (버전 선택)
npm run publish

# 자동 버전 bump
npm run publish:patch   # 1.4.0 → 1.4.1
npm run publish:minor   # 1.4.0 → 1.5.0
npm run publish:major   # 1.4.0 → 2.0.0

# 직접 버전 지정
node scripts/publish.js --version 2.0.0

# 푸시까지 자동 실행
node scripts/publish.js --minor --push
```

#### 배포 프로세스

1. **Git 상태 확인**
   - 커밋되지 않은 변경사항 감지
   - 현재 브랜치 확인 (main 권장)

2. **버전 결정**
   - 현재 버전: `.claude-plugin/plugin.json`의 `version` 필드
   - 새 버전: CLI 인자 또는 대화형 선택

3. **버전 업데이트**
   - `.claude-plugin/plugin.json` → `version` 필드
   - `.claude-plugin/marketplace.json` → `plugins[0].version` 필드

4. **빌드 실행**
   ```bash
   npm run build
   ```

5. **Git 작업**
   ```bash
   git add .claude-plugin/plugin.json .claude-plugin/marketplace.json plugin/
   git commit -m "chore: Release v${VERSION}"
   git tag "v${VERSION}"
   ```

6. **푸시 (선택적)**
   - `--push` 플래그가 있을 때만 실행

#### CLI 옵션

| 옵션 | 설명 | 예시 |
|------|------|------|
| `--patch` | 패치 버전 증가 (1.4.0 → 1.4.1) | `npm run publish:patch` |
| `--minor` | 마이너 버전 증가 (1.4.0 → 1.5.0) | `npm run publish:minor` |
| `--major` | 메이저 버전 증가 (1.4.0 → 2.0.0) | `npm run publish:major` |
| `--version <ver>` | 버전 직접 지정 | `node scripts/publish.js --version 2.0.0` |
| `--push` | 푸시까지 자동 실행 | `node scripts/publish.js --minor --push` |

#### 오류 처리

스크립트는 다음 상황에서 종료됩니다:

- **커밋되지 않은 변경사항이 있을 때**: 먼저 변경사항을 커밋하거나 stash하세요.
- **잘못된 버전 형식**: Semver 형식 (x.y.z) 필요
- **빌드 실패**: npm run build가 실패하면 배포가 중단됩니다.

---

### sync-to-marketplace.sh

로컬 마켓플레이스에 플러그인을 동기화합니다.

#### 사용법

```bash
# 미리보기 (dry-run)
npm run sync:dry-run

# 실제 동기화
npm run sync
```

#### 동작

- `plugin/` 디렉토리를 `~/.claude/marketplace/cc-skills/`로 복사
- `.claude-plugin/marketplace.json`을 `~/.claude/marketplace/marketplace.json`에 병합

---

## 개발 가이드

### 일반적인 개발 사이클

```bash
# 1. 코드 수정 (src/ 디렉토리)
vim src/skills/my-skill/SKILL.md

# 2. 빌드
npm run build

# 3. 로컬 테스트
npm run sync
# Claude Code 재시작

# 4. 변경사항 커밋
git add .
git commit -m "feat: add new skill"

# 5. 배포 (버전 증가 + 빌드 + Git 태그)
npm run publish:patch

# 6. 푸시 (선택)
git push origin main
git push origin v1.4.1
```

### 빠른 배포 (자동 푸시)

```bash
# 모든 변경사항 커밋
git add .
git commit -m "feat: add new features"

# 배포 및 푸시 자동 실행
npm run publish:minor -- --push
```

### 문제 해결

#### "커밋되지 않은 변경사항이 있습니다" 오류

**원인:** Git working directory가 깨끗하지 않음

**해결:**
```bash
# 변경사항 확인
git status

# 옵션 1: 커밋
git add .
git commit -m "your message"

# 옵션 2: Stash
git stash
```

#### "빌드 실패" 오류

**원인:** `npm run build` 실행 중 오류 발생

**해결:**
```bash
# 빌드 로그 확인
npm run build

# plugin/ 디렉토리 권한 확인
ls -la plugin/

# 필요시 plugin/ 디렉토리 삭제 후 재빌드
rm -rf plugin/
npm run build
```

#### 버전 충돌

**원인:** 동일한 버전 태그가 이미 존재

**해결:**
```bash
# 기존 태그 확인
git tag

# 태그 삭제 (필요시)
git tag -d v1.4.1
git push origin :refs/tags/v1.4.1

# 다시 배포
npm run publish:patch
```

### 새 스크립트 추가

1. `scripts/` 폴더에 파일 생성
2. 실행 권한 설정: `chmod +x scripts/your-script.js`
3. shebang 추가: `#!/usr/bin/env node`
4. 이 README에 문서화

### 테스트 작성

테스트 파일은 `/tests` 폴더에 작성합니다. 자세한 내용은 `/tests/README.md`를 참고하세요.
