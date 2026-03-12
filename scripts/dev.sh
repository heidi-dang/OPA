#!/bin/bash

# OPA Development Script

echo "Starting OPA Development Environment..."

# Start sandbox if not running
if ! docker ps --filter name=opa-sandbox --format "{{.Names}}" | grep -q opa-sandbox; then
    echo "Starting sandbox..."
    ./scripts/sandbox.sh start
fi

# Build and start the MCP server
echo "Building and starting OPA MCP server..."
npm run build

# Start the server in development mode
echo "Starting OPA MCP server..."
npm run dev
