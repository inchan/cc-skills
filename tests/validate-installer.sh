#!/bin/bash
# validate-installer.sh
# 4단계 계층 테스트: installer 도구 검증

set -e

# 색상
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 결과 추적
PASS=0
FAIL=0
WARN=0

# 테스트 결과 JSON
REPORT_FILE="tests/installer-validation-report.json"
mkdir -p tests

# JSON 초기화
cat > "$REPORT_FILE" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "levels": {
    "level0_static": {},
    "level1_dryrun": {},
    "level2_isolated": {},
    "level3_integration": {}
  },
  "summary": {
    "pass": 0,
    "fail": 0,
    "warn": 0
  }
}
EOF

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Installer Validation Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================
# LEVEL 0: Static Analysis
# ============================================
echo -e "${BLUE}=== Level 0: Static Analysis ===${NC}"
echo ""

# Test 1: Bash syntax check
echo -n "Test 1.1: install-all-plugins.sh syntax... "
if bash -n scripts/install-all-plugins.sh 2>/dev/null; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAIL++))
fi

echo -n "Test 1.2: uninstall-all-plugins.sh syntax... "
if bash -n scripts/uninstall-all-plugins.sh 2>/dev/null; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAIL++))
fi

# Test 2: JSON validation
echo -n "Test 2.1: marketplace.json validity... "
if jq empty .claude-plugin/marketplace.json 2>/dev/null; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAIL++))
fi

echo -n "Test 2.2: installer plugin.json validity... "
if jq empty plugins/installer/.claude-plugin/plugin.json 2>/dev/null; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAIL++))
fi

# Test 3: File existence
echo ""
echo "Test 3: Plugin directories..."
PLUGINS=(
    "workflow-automation"
    "dev-guidelines"
    "tool-creators"
    "quality-review"
    "ai-integration"
    "prompt-enhancement"
    "utilities"
)

MISSING_PLUGINS=()
for plugin in "${PLUGINS[@]}"; do
    echo -n "  - $plugin... "
    if [ -d "plugins/$plugin" ]; then
        echo -e "${GREEN}EXISTS${NC}"
        ((PASS++))
    else
        echo -e "${RED}MISSING${NC}"
        MISSING_PLUGINS+=("$plugin")
        ((FAIL++))
    fi
done

# Test 4: installer 플러그인 구조
echo ""
echo "Test 4: Installer plugin structure..."
echo -n "  - commands/install-all.md... "
if [ -f "plugins/installer/commands/install-all.md" ]; then
    echo -e "${GREEN}EXISTS${NC}"
    ((PASS++))
else
    echo -e "${RED}MISSING${NC}"
    ((FAIL++))
fi

echo -n "  - README.md... "
if [ -f "plugins/installer/README.md" ]; then
    echo -e "${GREEN}EXISTS${NC}"
    ((PASS++))
else
    echo -e "${RED}MISSING${NC}"
    ((FAIL++))
fi

# Test 5: marketplace.json에 installer 등록 확인
echo ""
echo -n "Test 5: installer in marketplace.json... "
if jq -e '.plugins[] | select(.name == "installer")' .claude-plugin/marketplace.json >/dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAIL++))
fi

echo ""
echo -e "${BLUE}=== Level 0 Summary ===${NC}"
echo -e "PASS: ${GREEN}$PASS${NC} | FAIL: ${RED}$FAIL${NC} | WARN: ${YELLOW}$WARN${NC}"
echo ""

# ============================================
# LEVEL 1: Dry-run Validation
# ============================================
echo -e "${BLUE}=== Level 1: Dry-run Validation ===${NC}"
echo ""

# Test 6: Claude CLI availability
echo -n "Test 6: Claude CLI installed... "
if which claude >/dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))

    # Claude version check
    echo -n "  - Claude version: "
    claude --version 2>/dev/null || echo -e "${YELLOW}(version check failed)${NC}"
else
    echo -e "${YELLOW}WARN - CLI not found, skipping integration tests${NC}"
    ((WARN++))
fi

# Test 7: Script executability
echo ""
echo "Test 7: Script permissions..."
echo -n "  - install-all-plugins.sh executable... "
if [ -x "scripts/install-all-plugins.sh" ]; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}WARN - not executable${NC}"
    ((WARN++))
fi

echo -n "  - uninstall-all-plugins.sh executable... "
if [ -x "scripts/uninstall-all-plugins.sh" ]; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}WARN - not executable${NC}"
    ((WARN++))
fi

# Test 8: 경로 검증 (실제 설치는 안 함)
echo ""
echo "Test 8: Path validation..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PLUGINS_DIR="$PROJECT_ROOT/plugins"

echo -n "  - Project root: "
if [ -d "$PROJECT_ROOT" ]; then
    echo -e "${GREEN}$PROJECT_ROOT${NC}"
    ((PASS++))
else
    echo -e "${RED}NOT FOUND${NC}"
    ((FAIL++))
fi

echo -n "  - Plugins dir: "
if [ -d "$PLUGINS_DIR" ]; then
    echo -e "${GREEN}$PLUGINS_DIR${NC}"
    ((PASS++))
else
    echo -e "${RED}NOT FOUND${NC}"
    ((FAIL++))
fi

echo ""
echo -e "${BLUE}=== Level 1 Summary ===${NC}"
echo -e "PASS: ${GREEN}$PASS${NC} | FAIL: ${RED}$FAIL${NC} | WARN: ${YELLOW}$WARN${NC}"
echo ""

# ============================================
# LEVEL 2: Isolated Test (선택적)
# ============================================
echo -e "${BLUE}=== Level 2: Isolated Test ===${NC}"
echo ""
echo -e "${YELLOW}MANUAL TEST REQUIRED:${NC}"
echo "Run this to test with a single plugin:"
echo ""
echo -e "${BLUE}  claude code plugins install ./plugins/utilities${NC}"
echo ""
echo "If successful, proceed to Level 3 for full installation."
echo ""

# ============================================
# LEVEL 3: Integration Test (수동)
# ============================================
echo -e "${BLUE}=== Level 3: Full Integration Test ===${NC}"
echo ""
echo -e "${YELLOW}MANUAL TEST REQUIRED:${NC}"
echo "To test full installation, run:"
echo ""
echo -e "${BLUE}  1. Install: bash scripts/install-all-plugins.sh${NC}"
echo -e "${BLUE}  2. Verify: claude code plugins list${NC}"
echo -e "${BLUE}  3. Test command: /install-all${NC}"
echo -e "${BLUE}  4. Rollback: bash scripts/uninstall-all-plugins.sh${NC}"
echo ""

# ============================================
# Final Summary
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Final Results${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "✅ PASS: ${GREEN}$PASS${NC}"
echo -e "❌ FAIL: ${RED}$FAIL${NC}"
echo -e "⚠️  WARN: ${YELLOW}$WARN${NC}"
echo ""

# JSON 결과 업데이트
jq --arg pass "$PASS" --arg fail "$FAIL" --arg warn "$WARN" \
   '.summary.pass = ($pass | tonumber) | .summary.fail = ($fail | tonumber) | .summary.warn = ($warn | tonumber)' \
   "$REPORT_FILE" > "${REPORT_FILE}.tmp" && mv "${REPORT_FILE}.tmp" "$REPORT_FILE"

echo "Report saved to: $REPORT_FILE"
echo ""

# 종료 코드
if [ $FAIL -gt 0 ]; then
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}✅ VALIDATION PASSED${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Review report: cat tests/installer-validation-report.json"
    echo "2. Run isolated test (Level 2)"
    echo "3. Run full integration test (Level 3)"
    exit 0
fi
