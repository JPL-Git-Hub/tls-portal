#!/bin/bash
set -e

# Script to automatically run yarn install when package.json changes
# This runs in the background during development

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${GREEN}=== Dependency Auto-Installer ===${NC}"
echo -e "${YELLOW}Watching for package.json changes...${NC}"
echo -e "Press Ctrl+C to stop"

# Watch package.json files for changes and run yarn install
nodemon \
  --watch "$PROJECT_ROOT/package.json" \
  --watch "$PROJECT_ROOT/src/*/package.json" \
  --ext json \
  --exec "echo -e '${YELLOW}Package.json changed, running yarn install...${NC}' && yarn install && echo -e '${GREEN}✓ Dependencies updated${NC}'" \
  --delay 1000

echo -e "${YELLOW}Dependency watcher stopped${NC}"