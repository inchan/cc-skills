#!/usr/bin/env bash
# File: scripts/update-marketplace.sh
# Purpose: Auto-update marketplace.json's "icp" plugin with discovered components
#
# Usage: ./scripts/update-marketplace.sh
#
# Detection rules:
#   - agents:   plugins/*/agents/*.md (exclude README.md, resources/)
#   - commands: plugins/*/commands/*.md (exclude README.md, resources/)
#   - skills:   plugins/*/skills/*/SKILL.md only

set -euo pipefail

# Constants (must be defined before trap)
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly MARKETPLACE_JSON="${ROOT_DIR}/.claude-plugin/marketplace.json"
readonly PLUGINS_DIR="${ROOT_DIR}/plugins"

# Cleanup temp files on exit (even on error)
cleanup() {
    rm -f "${MARKETPLACE_JSON}.tmp" "${MARKETPLACE_JSON}.backup" 2>/dev/null || true
}
trap cleanup EXIT

# Colors
readonly GREEN='\033[0;32m'
readonly RED='\033[0;31m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

check_dependencies() {
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed."
        log_error "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
        exit 1
    fi
}

validate_environment() {
    if [[ ! -d "${PLUGINS_DIR}" ]]; then
        log_error "Plugins directory not found: ${PLUGINS_DIR}"
        exit 1
    fi

    if [[ ! -f "${MARKETPLACE_JSON}" ]]; then
        log_error "marketplace.json not found: ${MARKETPLACE_JSON}"
        exit 1
    fi

    if ! jq -e '.plugins[] | select(.name == "icp")' "${MARKETPLACE_JSON}" &>/dev/null; then
        log_error "Plugin 'icp' not found in marketplace.json"
        exit 1
    fi
}

count_lines() {
    local input="$1"
    if [[ -z "$input" ]]; then
        echo 0
    else
        echo "$input" | wc -l | tr -d ' '
    fi
}

discover_agents() {
    find "${PLUGINS_DIR}" -type f -path '*/agents/*.md' \
        ! -name 'README.md' \
        ! -path '*/resources/*' \
        2>/dev/null | sort | while IFS= read -r file; do
        echo "./${file#"${ROOT_DIR}/"}"
    done
}

discover_commands() {
    find "${PLUGINS_DIR}" -type f -path '*/commands/*.md' \
        ! -name 'README.md' \
        ! -path '*/resources/*' \
        2>/dev/null | sort | while IFS= read -r file; do
        echo "./${file#"${ROOT_DIR}/"}"
    done
}

discover_skills() {
    find "${PLUGINS_DIR}" -type f -name 'SKILL.md' -path '*/skills/*' \
        ! -path '*/resources/*' \
        2>/dev/null | sort | while IFS= read -r file; do
        echo "./${file#"${ROOT_DIR}/"}"
    done
}

list_to_json() {
    local input="$1"
    if [[ -z "$input" ]]; then
        echo "[]"
    else
        echo "$input" | jq -R . | jq -s .
    fi
}

update_marketplace() {
    log_info "Discovering components..."

    # Collect components as newline-separated strings (bash 3.x compatible)
    local agents_list commands_list skills_list
    agents_list=$(discover_agents)
    commands_list=$(discover_commands)
    skills_list=$(discover_skills)

    # Count items
    local agents_count commands_count skills_count
    agents_count=$(count_lines "$agents_list")
    commands_count=$(count_lines "$commands_list")
    skills_count=$(count_lines "$skills_list")

    log_info "Found: ${agents_count} agents, ${commands_count} commands, ${skills_count} skills"

    # Convert to JSON arrays
    local agents_json commands_json skills_json
    agents_json=$(list_to_json "$agents_list")
    commands_json=$(list_to_json "$commands_list")
    skills_json=$(list_to_json "$skills_list")

    # Create backup
    cp "${MARKETPLACE_JSON}" "${MARKETPLACE_JSON}.backup"

    # Update using jq
    jq --argjson agents "${agents_json}" \
       --argjson commands "${commands_json}" \
       --argjson skills "${skills_json}" \
       '(.plugins[] | select(.name == "icp")) |= (
           .skills = $skills |
           .commands = $commands |
           .agents = $agents
       )' "${MARKETPLACE_JSON}" > "${MARKETPLACE_JSON}.tmp"

    # Validate and apply
    if jq empty "${MARKETPLACE_JSON}.tmp" 2>/dev/null; then
        mv "${MARKETPLACE_JSON}.tmp" "${MARKETPLACE_JSON}"
        log_info "marketplace.json updated successfully"
    else
        log_error "Generated invalid JSON, restoring backup"
        mv "${MARKETPLACE_JSON}.backup" "${MARKETPLACE_JSON}"
        exit 1
    fi
}

main() {
    log_info "Starting marketplace.json update..."
    check_dependencies
    validate_environment
    update_marketplace

    # Show summary
    echo ""
    log_info "Summary:"
    jq -r '.plugins[] | select(.name == "icp") |
        "  Skills:   \(.skills | length)\n  Commands: \(.commands | length)\n  Agents:   \(.agents | length)"' \
        "${MARKETPLACE_JSON}"

    log_info "Complete!"
}

main "$@"
