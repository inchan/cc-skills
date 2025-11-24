#!/bin/bash
# uninstall-all-plugins.sh
# 모든 cc-skills 플러그인을 한번에 제거하는 스크립트

set -e

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CC-Skills Plugin Uninstaller${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 플러그인 목록
PLUGINS=(
    "workflow-automation"
    "dev-guidelines"
    "tool-creators"
    "quality-review"
    "ai-integration"
    "prompt-enhancement"
    "utilities"
    "installer"
    "cc-skills-hooks"
)

# 제거 카운터
REMOVED=0
FAILED=0

echo -e "${YELLOW}Found ${#PLUGINS[@]} plugins to uninstall${NC}"
echo ""

# 확인 프롬프트
read -p "Are you sure you want to uninstall all plugins? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${YELLOW}Uninstall cancelled.${NC}"
    exit 0
fi

echo ""

# 각 플러그인 제거
for plugin in "${PLUGINS[@]}"
do
    echo -e "${BLUE}Uninstalling $plugin...${NC}"

    if claude plugin uninstall "$plugin" 2>/dev/null; then
        echo -e "${GREEN}✓ $plugin uninstalled successfully${NC}"
        ((REMOVED++))
    else
        echo -e "${YELLOW}⊘ $plugin not installed or already removed${NC}"
        ((FAILED++))
    fi

    echo ""
done

# 결과 요약
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Successfully uninstalled: $REMOVED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${YELLOW}Not found/Failed: $FAILED${NC}"
fi
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${GREEN}Uninstall complete! 🗑️${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Plugins are now removed (no restart needed)"
echo "2. Verify with: claude plugin list"
