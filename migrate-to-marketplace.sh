#!/bin/bash

# cc-skills 마켓플레이스 구조로 재조직 스크립트
set -e

REPO_ROOT="/Users/chans/workspace/pilot/cc-skills"
cd "$REPO_ROOT"

echo "=== CC-Skills 마켓플레이스 구조 재조직 시작 ==="

# 1. src/ 디렉토리 생성
echo "✓ src/ 디렉토리 생성"
mkdir -p src

# 2. plugin/ 디렉토리 생성
echo "✓ plugin/ 디렉토리 생성 (빌드 결과물용)"
mkdir -p plugin
touch plugin/.gitkeep

# 3. 기존 디렉토리 이동 (git mv로 히스토리 보존)
echo "✓ 디렉토리 이동 시작 (git mv)"

if [ -d "skills" ]; then
  git mv skills src/
  echo "  - skills/ → src/skills/"
fi

if [ -d "commands" ]; then
  git mv commands src/
  echo "  - commands/ → src/commands/"
fi

if [ -d "hooks" ]; then
  git mv hooks src/
  echo "  - hooks/ → src/hooks/"
fi

if [ -d "agents" ]; then
  git mv agents src/
  echo "  - agents/ → src/agents/"
fi

# 4. .gitignore 업데이트
echo "✓ .gitignore 업데이트"
cat >> .gitignore << 'EOF'

# Build output (marketplace plugin directory)
plugin/*
!plugin/.gitkeep
EOF

echo ""
echo "=== 재조직 완료 ==="
echo ""
echo "변경된 구조:"
echo "cc-skills/"
echo "├── src/              # 개발 원본"
echo "│   ├── skills/"
echo "│   ├── commands/"
echo "│   ├── hooks/"
echo "│   └── agents/"
echo "├── plugin/           # 빌드 결과물 (빈 디렉토리)"
echo "│   └── .gitkeep"
echo "└── .claude-plugin/"
echo "    └── plugin.json"
echo ""
echo "다음 단계:"
echo "1. .claude-plugin/plugin.json 경로 업데이트 필요"
echo "2. git status 확인"
echo "3. git commit -m 'refactor: migrate to marketplace structure'"
