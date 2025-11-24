#!/bin/bash
# install-all-plugins.sh
# 모든 cc-skills 플러그인을 한번에 설치하는 스크립트

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CC-Skills Plugin Installer${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Marketplace 이름 (기본값: inchan-cc-skills)
MARKETPLACE="${CC_SKILLS_MARKETPLACE:-inchan-cc-skills}"

echo -e "${BLUE}Using marketplace: ${YELLOW}$MARKETPLACE${NC}"
echo ""

# Marketplace 업데이트
echo -e "${BLUE}Updating marketplace...${NC}"
if claude plugin marketplace update "$MARKETPLACE" 2>&1 | grep -q "Successfully updated"; then
    echo -e "${GREEN}✓ Marketplace updated${NC}"
else
    echo -e "${YELLOW}⚠ Marketplace update failed or not needed${NC}"
fi
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
)

# 설치 카운터
INSTALLED=0
FAILED=0
SKIPPED=0

echo -e "${YELLOW}Found ${#PLUGINS[@]} plugins to install${NC}"
echo ""

# 각 플러그인 설치
for plugin in "${PLUGINS[@]}"
do
    echo -e "${BLUE}Installing $plugin...${NC}"

    # 이미 설치되어 있는지 확인
    if claude plugin list 2>/dev/null | grep -q "^  ❯ $plugin$"; then
        echo -e "${YELLOW}⊘ $plugin already installed, skipping${NC}"
        ((SKIPPED++))
        echo ""
        continue
    fi

    if claude plugin install "${plugin}@${MARKETPLACE}" 2>&1 | grep -q "Successfully installed"; then
        echo -e "${GREEN}✓ $plugin installed successfully${NC}"
        ((INSTALLED++))
    else
        echo -e "${RED}⨯ $plugin installation failed${NC}"
        ((FAILED++))
    fi

    echo ""
done

# 결과 요약
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Successfully installed: $INSTALLED${NC}"
if [ $SKIPPED -gt 0 ]; then
    echo -e "${YELLOW}Already installed: $SKIPPED${NC}"
fi
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
fi
echo -e "${BLUE}========================================${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $INSTALLED -gt 0 ]; then
        echo -e "${GREEN}All plugins installed successfully! 🎉${NC}"
    else
        echo -e "${GREEN}All plugins are already installed! ✓${NC}"
    fi
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Plugins are now active (no restart needed)"
    echo "2. Try '/install-all' command for guided installation"
    echo "3. Check available commands with '/help'"
    exit 0
else
    echo -e "${YELLOW}Some plugins failed to install. Check errors above.${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "1. Verify marketplace: claude plugin marketplace list"
    echo "2. Update marketplace: claude plugin marketplace update $MARKETPLACE"
    echo "3. Check GitHub repo has latest changes pushed"
    exit 1
fi
