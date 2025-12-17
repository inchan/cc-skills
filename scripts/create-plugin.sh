#!/bin/bash
# create-plugin.sh - 새 플러그인 생성 스크립트
#
# 사용법: ./scripts/create-plugin.sh <plugin-name> [description]
# 예시: ./scripts/create-plugin.sh issue-linear "Linear 이슈 관리 플러그인"

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PLUGINS_DIR="$PROJECT_ROOT/plugins"
MARKETPLACE_JSON="$PROJECT_ROOT/.claude-plugin/marketplace.json"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# jq 설치 확인
check_jq() {
    if ! command -v jq &> /dev/null; then
        log_error "jq가 설치되어 있지 않습니다. 'brew install jq'로 설치해주세요."
        exit 1
    fi
}

# 사용법 출력
usage() {
    echo "사용법: $0 <plugin-name> [description]"
    echo ""
    echo "인자:"
    echo "  plugin-name   플러그인 이름 (예: issue-linear)"
    echo "  description   플러그인 설명 (선택사항)"
    echo ""
    echo "예시:"
    echo "  $0 issue-linear \"Linear 이슈 관리 플러그인\""
    exit 1
}

# 플러그인 폴더 구조 생성
create_plugin_structure() {
    local name=$1
    local description=$2
    local plugin_dir="$PLUGINS_DIR/$name"

    log_info "플러그인 폴더 구조 생성: $plugin_dir"

    # 폴더 생성
    mkdir -p "$plugin_dir/.claude-plugin"
    mkdir -p "$plugin_dir/agents"
    mkdir -p "$plugin_dir/commands"

    # plugin.json 생성
    cat > "$plugin_dir/.claude-plugin/plugin.json" << EOF
{
    "name": "$name",
    "version": "0.1.0",
    "description": "$description",
    "author": {
        "name": "inchan",
        "url": "https://github.com/inchan"
    }
}
EOF

    log_success "plugin.json 생성 완료"
}

# marketplace.json에 개별 플러그인 엔트리 추가
add_plugin_entry() {
    local name=$1
    local entry_name="icp-$name"

    log_info "marketplace.json에 '$entry_name' 엔트리 추가"

    # 이미 존재하는지 확인
    if jq -e ".plugins[] | select(.name == \"$entry_name\")" "$MARKETPLACE_JSON" > /dev/null 2>&1; then
        log_warn "'$entry_name' 엔트리가 이미 존재합니다. 건너뜁니다."
        return 0
    fi

    # 새 엔트리 추가
    local new_entry=$(cat << EOF
{
    "name": "$entry_name",
    "source": "./plugins/$name"
}
EOF
)

    jq ".plugins += [$new_entry]" "$MARKETPLACE_JSON" > "$MARKETPLACE_JSON.tmp"
    mv "$MARKETPLACE_JSON.tmp" "$MARKETPLACE_JSON"

    log_success "'$entry_name' 엔트리 추가 완료"
}

# icp 통합 플러그인에 실제 존재하는 컴포넌트만 추가
update_icp_plugin() {
    local name=$1
    local plugin_dir="$PLUGINS_DIR/$name"
    local temp_file="$MARKETPLACE_JSON.tmp"
    local added_commands=0
    local added_agents=0

    log_info "icp 플러그인에 '$name' 컴포넌트 검색 중..."

    # 실제 존재하는 commands/*.md 파일만 추가
    for cmd_file in "$plugin_dir/commands/"*.md; do
        if [ -f "$cmd_file" ]; then
            local relative_path="./plugins/$name/commands/$(basename "$cmd_file")"
            if ! jq -e ".plugins[0].commands | index(\"$relative_path\")" "$MARKETPLACE_JSON" > /dev/null 2>&1; then
                jq ".plugins[0].commands += [\"$relative_path\"]" "$MARKETPLACE_JSON" > "$temp_file"
                mv "$temp_file" "$MARKETPLACE_JSON"
                ((added_commands++))
            fi
        fi
    done

    # 실제 존재하는 agents/*.md 파일만 추가
    for agent_file in "$plugin_dir/agents/"*.md; do
        if [ -f "$agent_file" ]; then
            local relative_path="./plugins/$name/agents/$(basename "$agent_file")"
            if ! jq -e ".plugins[0].agents | index(\"$relative_path\")" "$MARKETPLACE_JSON" > /dev/null 2>&1; then
                jq ".plugins[0].agents += [\"$relative_path\"]" "$MARKETPLACE_JSON" > "$temp_file"
                mv "$temp_file" "$MARKETPLACE_JSON"
                ((added_agents++))
            fi
        fi
    done

    if [ $added_commands -gt 0 ]; then
        log_success "commands $added_commands개 추가 완료"
    else
        log_info "추가할 commands 없음 (파일 미존재 또는 이미 등록됨)"
    fi

    if [ $added_agents -gt 0 ]; then
        log_success "agents $added_agents개 추가 완료"
    else
        log_info "추가할 agents 없음 (파일 미존재 또는 이미 등록됨)"
    fi
}

# 결과 요약 출력
print_summary() {
    local name=$1
    local plugin_dir="$PLUGINS_DIR/$name"

    echo ""
    echo "=========================================="
    echo -e "${GREEN}플러그인 생성 완료!${NC}"
    echo "=========================================="
    echo ""
    echo "생성된 구조:"
    tree -a "$plugin_dir" 2>/dev/null || find "$plugin_dir" -type f -o -type d | sort
    echo ""
    echo "다음 단계:"
    echo "  1. agents/*.md 파일 작성"
    echo "  2. commands/*.md 파일 작성"
    echo "  3. (선택) skills/ 폴더 및 SKILL.md 추가"
    echo ""
}

# 메인 실행
main() {
    check_jq

    if [ $# -lt 1 ]; then
        usage
    fi

    local plugin_name=$1
    local description=${2:-"$plugin_name 플러그인"}

    # 플러그인 이름 검증
    if [[ ! "$plugin_name" =~ ^[a-z][a-z0-9-]*$ ]]; then
        log_error "플러그인 이름은 소문자, 숫자, 하이픈만 사용 가능합니다."
        exit 1
    fi

    log_info "플러그인 생성 시작: $plugin_name"
    echo ""

    create_plugin_structure "$plugin_name" "$description"
    add_plugin_entry "$plugin_name"
    update_icp_plugin "$plugin_name"
    print_summary "$plugin_name"
}

main "$@"
