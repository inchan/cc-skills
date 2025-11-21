#!/usr/bin/env bash

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 경로 설정
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/plugin"
TARGET_DIR="$HOME/.claude/plugins/marketplaces/inchan/cc-skills"

# dry-run 플래그 확인
DRY_RUN=false
if [[ "$1" == "--dry-run" || "$1" == "-n" ]]; then
    DRY_RUN=true
    echo -e "${BLUE}[INFO] Dry-run mode enabled${NC}"
fi

# SOURCE_DIR 존재 확인
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}[ERROR] Source directory not found: $SOURCE_DIR${NC}"
    echo -e "${YELLOW}[WARN] Run 'npm run build' first${NC}"
    exit 1
fi

# TARGET_DIR 부모 디렉토리 생성
TARGET_PARENT="$(dirname "$TARGET_DIR")"
if [ ! -d "$TARGET_PARENT" ]; then
    echo -e "${BLUE}[INFO] Creating parent directory: $TARGET_PARENT${NC}"
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$TARGET_PARENT"
    fi
fi

# TARGET_DIR 생성 (존재하지 않으면)
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${BLUE}[INFO] Creating target directory: $TARGET_DIR${NC}"
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$TARGET_DIR"
    fi
fi

# rsync 실행
echo -e "${BLUE}[INFO] Syncing from $SOURCE_DIR to $TARGET_DIR${NC}"

if [ "$DRY_RUN" = true ]; then
    rsync -av --delete --dry-run "$SOURCE_DIR/" "$TARGET_DIR/"
    echo -e "${YELLOW}[DRY-RUN] No files were actually synced${NC}"
else
    if rsync -av --delete "$SOURCE_DIR/" "$TARGET_DIR/"; then
        echo -e "${GREEN}[SUCCESS] Plugin synced to marketplace directory${NC}"
    else
        echo -e "${RED}[ERROR] Sync failed${NC}"
        exit 1
    fi
fi
