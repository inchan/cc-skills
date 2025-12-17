# Scripts

> 플러그인 개발 자동화 스크립트 모음

---

## 개요

이 디렉토리에는 플러그인 생성 및 관리를 자동화하는 셸 스크립트가 포함되어 있습니다.

---

## 스크립트 목록

### create-plugin.sh

> 새 플러그인 폴더 구조를 생성하고 marketplace.json에 등록

**사용법:**
```bash
./scripts/create-plugin.sh <plugin-name> [description]
```

**예시:**
```bash
./scripts/create-plugin.sh issue-linear "Linear 이슈 관리 플러그인"
```

**수행 작업:**
1. `plugins/<plugin-name>/` 폴더 구조 생성
   - `.claude-plugin/plugin.json`
   - `agents/` 디렉토리
   - `commands/` 디렉토리
2. marketplace.json에 `icp-<plugin-name>` 엔트리 추가
3. icp 통합 플러그인에 발견된 컴포넌트 자동 등록

**요구사항:**
- `jq` 설치 필요 (`brew install jq`)

---

### update-marketplace.sh

> plugins/ 폴더를 스캔하여 marketplace.json의 icp 플러그인 자동 업데이트

**사용법:**
```bash
./scripts/update-marketplace.sh
```

**수행 작업:**
1. 모든 플러그인 폴더 스캔
2. 발견된 컴포넌트 수집:
   - `agents`: `plugins/*/agents/*.md` (README.md, resources/ 제외)
   - `commands`: `plugins/*/commands/*.md` (README.md, resources/ 제외)
   - `skills`: `plugins/*/skills/*/SKILL.md`
3. marketplace.json의 `icp` 플러그인 업데이트

**요구사항:**
- `jq` 설치 필요 (`brew install jq`)

**출력 예시:**
```
[INFO] Starting marketplace.json update...
[INFO] Discovering components...
[INFO] Found: 11 agents, 8 commands, 2 skills
[INFO] marketplace.json updated successfully

[INFO] Summary:
  Skills:   2
  Commands: 8
  Agents:   11
[INFO] Complete!
```

---

## 컴포넌트 탐지 규칙

| 컴포넌트 | 경로 패턴 | 제외 |
|---------|----------|------|
| Agents | `plugins/*/agents/*.md` | README.md, resources/ |
| Commands | `plugins/*/commands/*.md` | README.md, resources/ |
| Skills | `plugins/*/skills/*/SKILL.md` | resources/ |

---

## 워크플로우

### 새 플러그인 생성

```bash
# 1. 플러그인 구조 생성
./scripts/create-plugin.sh my-plugin "내 플러그인 설명"

# 2. 에이전트/커맨드 파일 작성
# plugins/my-plugin/agents/my-agent.md
# plugins/my-plugin/commands/my-command.md

# 3. marketplace.json 업데이트 (컴포넌트 자동 등록)
./scripts/update-marketplace.sh
```

### 기존 플러그인에 컴포넌트 추가

```bash
# 1. 새 에이전트/커맨드 파일 작성
# plugins/existing-plugin/agents/new-agent.md

# 2. marketplace.json 업데이트
./scripts/update-marketplace.sh
```

---

## 변경 이력

### v1.0.0 (2025-12-17)
- 초기 릴리스
  - create-plugin.sh 추가
  - update-marketplace.sh 추가
