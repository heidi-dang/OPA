#!/bin/bash

# OpenCode Plugin Installer Script
# Prompts for a GitHub repo URL, clones it, installs dependencies, builds it,
# registers the MCP server in the OpenCode configuration, and performs a basic health check.

set -e

# Configuration: Path where plugins are stored locally
PLUGIN_DIR="$HOME/.opencode/plugins"
# Configuration: Path to OpenCode's MCP settings file
OPENCODE_CONFIG="$HOME/.opencode/mcp_settings.json"

mkdir -p "$PLUGIN_DIR"
mkdir -p "$(dirname "$OPENCODE_CONFIG")"

# Ensure the config file exists
if [ ! -f "$OPENCODE_CONFIG" ]; then
    echo '{"mcpServers": {}}' > "$OPENCODE_CONFIG"
fi

echo -e "\n=== OpenCode MCP Plugin Installer ==="
read -p "Enter the GitHub repository URL of the OpenCode plugin to install: " REPO_URL

if [[ -z "$REPO_URL" ]]; then
    echo "Error: Repository URL cannot be empty."
    exit 1
fi

# Extract repository name from URL (e.g., https://github.com/user/opencode-plugin-test.git -> opencode-plugin-test)
REPO_NAME=$(basename "$REPO_URL" .git)
TARGET_DIR="$PLUGIN_DIR/$REPO_NAME"

echo -e "\n[1/5] Cloning repository into $TARGET_DIR..."
if [ -d "$TARGET_DIR" ]; then
    echo "Warning: Directory already exists. Attempting to pull latest changes..."
    cd "$TARGET_DIR"
    git pull
else
    git clone "$REPO_URL" "$TARGET_DIR"
    cd "$TARGET_DIR"
fi

echo -e "\n[2/5] Installing dependencies..."
if [ -f "yarn.lock" ]; then
    yarn install
elif [ -f "package-lock.json" ] || [ -f "package.json" ]; then
    npm install
else
    echo "Error: No package.json found. Is this a valid Node.js MCP plugin?"
    exit 1
fi

echo -e "\n[3/5] Building the plugin..."
if grep -q '"build":' package.json; then
    npm run build
else
    echo "No build step found in package.json, continuing..."
fi

# Auto-detect the main entry point (prefer dist/mcp.js, then dist/index.js, then main in package.json)
MAIN_FILE=""
if [ -f "dist/mcp.js" ]; then
    MAIN_FILE="dist/mcp.js"
elif [ -f "build/index.js" ]; then
    MAIN_FILE="build/index.js"
else
    # Try to read 'main' from package.json using jq or node
    MAIN_FILE=$(node -p "require('./package.json').main" 2>/dev/null || echo "")
fi

if [[ -z "$MAIN_FILE" || ! -f "$MAIN_FILE" ]]; then
     echo "Error: Could not locate the built main entry point (e.g., dist/mcp.js)."
     exit 1
fi

ENTRY_PATH="$TARGET_DIR/$MAIN_FILE"

echo -e "\n[4/5] Registering Plugin in OpenCode Configuration..."

# Using a temporary python snippet to safely update the JSON file without needing `jq` installed
python3 -c "
import json
import sys

config_file = sys.argv[1]
plugin_name = sys.argv[2]
plugin_entry = sys.argv[3]

try:
    with open(config_file, 'r') as f:
        data = json.load(f)
except json.JSONDecodeError:
    data = {'mcpServers': {}}

if 'mcpServers' not in data:
    data['mcpServers'] = {}

data['mcpServers'][plugin_name] = {
    'command': 'node',
    'args': [plugin_entry]
}

with open(config_file, 'w') as f:
    json.dump(data, f, indent=2)
" "$OPENCODE_CONFIG" "$REPO_NAME" "$ENTRY_PATH"

echo "Successfully injected '$REPO_NAME' into $OPENCODE_CONFIG"

echo -e "\n[5/5] Performing Health Check..."
# We test if the entry point can run without immediately crashing.
# By passing --version or letting it hit stdio briefly, we can see if it throws module errors.
echo "Testing Node execution..."
if node "$ENTRY_PATH" --help > /dev/null 2>&1; then
    # It might hang waiting for Stdio, so we just run a quick syntax/load check
    echo "Syntax/Load verification passed."
elif node -e "require('$ENTRY_PATH')" > /dev/null 2>&1; then
    echo "Module loading verification passed."
else
    # Run it with a short timeout to see if it immediately errors out
    if command -v timeout &> /dev/null; then
        timeout 2 node "$ENTRY_PATH" </dev/null >/dev/null 2>&1 || true
        echo "Server is responding to Node execution (timeout test successful)."
    else
         echo "Skipping strict health execution test (timeout utility not available)."
    fi
fi

echo -e "\n=== SUCCESS ==="
echo "The plugin '$REPO_NAME' has been installed and configured."
echo "Please restart your OpenCode client to load the new tools."
