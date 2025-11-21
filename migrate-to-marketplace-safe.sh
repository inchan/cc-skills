#!/bin/bash

# cc-skills 마켓플레이스 구조로 재조직 스크립트 (안전 버전)
set -e

REPO_ROOT="/Users/chans/workspace/pilot/cc-skills"
cd "$REPO_ROOT"

echo "=== CC-Skills 마켓플레이스 구조 재조직 시작 ==="
echo ""

# Git 상태 확인
echo "현재 Git 상태:"
git status --short
echo ""

# 1. src/ 디렉토리 생성
echo "1. src/ 디렉토리 생성"
mkdir -p src
echo "   ✓ 완료"
echo ""

# 2. plugin/ 디렉토리 생성
echo "2. plugin/ 디렉토리 생성 (빌드 결과물용)"
mkdir -p plugin
touch plugin/.gitkeep
echo "   ✓ 완료"
echo ""

# 3. 기존 디렉토리 이동
echo "3. 디렉토리 이동 시작"

# 각 디렉토리 존재 확인 및 이동
for dir in skills commands hooks agents; do
  if [ -d "$dir" ] && [ ! -d "src/$dir" ]; then
    echo "   - $dir/ → src/$dir/"
    mv "$dir" "src/"
  elif [ -d "src/$dir" ]; then
    echo "   ⚠ src/$dir/ 이미 존재함 (스킵)"
  else
    echo "   ⚠ $dir/ 디렉토리 없음 (스킵)"
  fi
done
echo "   ✓ 완료"
echo ""

# 4. .gitignore 업데이트
echo "4. .gitignore 업데이트"
if ! grep -q "plugin/\*" .gitignore 2>/dev/null; then
  cat >> .gitignore << 'EOF'

# Build output (marketplace plugin directory)
plugin/*
!plugin/.gitkeep
EOF
  echo "   ✓ 추가 완료"
else
  echo "   ✓ 이미 설정됨"
fi
echo ""

# 5. 결과 검증
echo "=== 검증 ==="
echo "src/ 디렉토리 구조:"
ls -la src/ 2>/dev/null || echo "   (src/ 디렉토리 내용 없음)"
echo ""

echo "plugin/ 디렉토리:"
ls -la plugin/ 2>/dev/null || echo "   (plugin/ 디렉토리 내용 없음)"
echo ""

# 6. Git 상태 확인
echo "변경 후 Git 상태:"
git status --short
echo ""

echo "=== 재조직 완료 ==="
echo ""
echo "최종 구조:"
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
echo "📌 다음 단계:"
echo "1. .claude-plugin/plugin.json 경로 업데이트 필요"
echo "   - agents 경로: ./src/agents/*.md"
echo "   - hooks 경로: ./src/hooks/hooks.json"
echo "2. 변경사항을 스테이지에 추가:"
echo "   git add -A"
echo "3. 커밋:"
echo "   git commit -m 'refactor: migrate to marketplace structure'"
