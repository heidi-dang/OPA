#!/ [OLD SCRIPT CONTENT REDACTED] - I am overwriting the file.
#!/bin/bash

# OpenCode Plugin Installer Script
# Optimized for 100% reliability and flexibility.
# Can install from a GitHub URL or a local directory.

set -e

# --- Configuration ---
PLUGIN_DIR="$HOME/.opencode/plugins"
OPENCODE_CONFIG="$HOME/.opencode/mcp_settings.json"

# --- Colors ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== OpenCode MCP Plugin Installer ===${NC}"

# --- 0. Pre-flight Checks ---
function check_dep() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed but is required.${NC}"
        exit 1
    fi
}

check_dep "git"
check_dep "node"
check_dep "npm"
check_dep "python3"

mkdir -p "$PLUGIN_DIR"
mkdir -p "$(dirname "$OPENCODE_CONFIG")"

if [ ! -f "$OPENCODE_CONFIG" ]; then
    echo '{"mcpServers": {}}' > "$OPENCODE_CONFIG"
fi

# --- 1. Determine Source ---
SOURCE=$1
if [[ -z "$SOURCE" ]]; then
    # If no argument, check if current directory is a valid plugin
    if [ -f "package.json" ]; then
        echo -e "${YELLOW}No source provided. Attempting to install from current directory...${NC}"
        SOURCE=$(pwd)
    else
        read -p "Enter GitHub URL or Local Directory Path: " SOURCE
    fi
fi

if [[ -z "$SOURCE" ]]; then
    echo -e "${RED}Error: Source cannot be empty.${NC}"
    exit 1
fi

# --- 2. Setup Plugin Directory ---
if [[ "$SOURCE" =~ ^https?:// ]]; then
    REPO_NAME=$(basename "$SOURCE" .git)
    TARGET_DIR="$PLUGIN_DIR/$REPO_NAME"
    echo -e "${BLUE}[1/4] Cloning repository into $TARGET_DIR...${NC}"
    if [ -d "$TARGET_DIR" ]; then
        echo -e "${YELLOW}Warning: Directory already exists. Updating...${NC}"
        cd "$TARGET_DIR"
        git pull
    else
        git clone "$SOURCE" "$TARGET_DIR"
        cd "$TARGET_DIR"
    fi
else
    # Local path
    if [ ! -d "$SOURCE" ]; then
        echo -e "${RED}Error: Directory $SOURCE does not exist.${NC}"
        exit 1
    fi
    REPO_NAME=$(basename "$SOURCE")
    TARGET_DIR="$SOURCE"
    echo -e "${BLUE}[1/4] Using local directory: $TARGET_DIR${NC}"
    cd "$TARGET_DIR"
fi

# --- 3. Build & Install ---
echo -e "${BLUE}[2/4] Installing dependencies & Building...${NC}"
if [ -f "yarn.lock" ]; then
    yarn install
else
    npm install
fi

if grep -q '"build":' package.json; then
    echo "Running build script..."
    npm run build
fi

# --- 4. Detect Entry Point ---
echo -e "${BLUE}[3/4] Detecting entry point...${NC}"
CANDIDATES=(
    "dist/mcp.js"
    "build/mcp.js"
    "dist/index.js"
    "build/index.js"
    "index.js"
)

ENTRY_FILE=""

# Try to check candidates
for candidate in "${CANDIDATES[@]}"; do
    if [ -f "$candidate" ]; then
        ENTRY_FILE="$candidate"
        break
    fi
done

# Fallback to package.json main
if [[ -z "$ENTRY_FILE" ]]; then
    PACKAGE_MAIN=$(node -p "require('./package.json').main" 2>/dev/null || echo "")
    if [[ -n "$PACKAGE_MAIN" && -f "$PACKAGE_MAIN" ]]; then
        ENTRY_FILE="$PACKAGE_MAIN"
    fi
fi

if [[ -z "$ENTRY_FILE" ]]; then
    echo -e "${RED}Error: Could not locate entry point (searched dist/, build/, index.js, and package.json).${NC}"
    exit 1
fi

ENTRY_PATH=$(realpath "$ENTRY_FILE")
echo -e "${GREEN}Detected entry point: $ENTRY_PATH${NC}"

# --- 5. Register in OpenCode ---
echo -e "${BLUE}[4/4] Registering in $OPENCODE_CONFIG...${NC}"

python3 -c "
import json
import os
import sys

config_path = sys.argv[1]
plugin_name = sys.argv[2]
entry_path = sys.argv[3]

try:
    with open(config_path, 'r') as f:
        config = json.load(f)
except Exception:
    config = {'mcpServers': {}}

if 'mcpServers' not in config:
    config['mcpServers'] = {}

config['mcpServers'][plugin_name] = {
    'command': 'node',
    'args': [entry_path],
    'env': {}
}

with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)
" "$OPENCODE_CONFIG" "$REPO_NAME" "$ENTRY_PATH"

echo -e "${GREEN}Successfully registered '$REPO_NAME'!${NC}"

# --- Health Check ---
echo -e "${BLUE}Running quick health check...${NC}"
if node "$ENTRY_PATH" --help &> /dev/null || node -e "require('$ENTRY_PATH')" &> /dev/null; then
    echo -e "${GREEN}Health check passed.${NC}"
else
    # Try a short execution test
    if command -v timeout &> /dev/null; then
        if timeout 2s node "$ENTRY_PATH" </dev/null &> /dev/null; then
             echo -e "${GREEN}Health check (execution) passed.${NC}"
        else
             echo -e "${YELLOW}Warning: Plugin started but did not exit cleanly (common for servers). Check logs if it fails to load in OpenCode.${NC}"
        fi
    else
        echo -e "${YELLOW}Skipping execution test (timeout not found).${NC}"
    fi
fi

echo -e "\n${GREEN}=== INSTALLATION COMPLETE ===${NC}"
echo -e "Restart OpenCode to use the new plugin tools."
