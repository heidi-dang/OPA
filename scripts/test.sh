#!/bin/bash

# OPA Test Script

echo "Running OPA Tests..."

# Check if sandbox is running
if ! docker ps --filter name=opa-sandbox --format "{{.Names}}" | grep -q opa-sandbox; then
    echo "Starting sandbox for tests..."
    ./scripts/sandbox.sh start
    sleep 5
fi

# Run basic tool tests
echo "Testing basic tools..."

# Test nmap
echo "Testing nmap..."
docker exec opa-sandbox nmap --version

# Test nuclei
echo "Testing nuclei..."
docker exec opa-sandbox nuclei --version

# Test ffuf
echo "Testing ffuf..."
docker exec opa-sandbox ffuf -V

# Test subfinder
echo "Testing subfinder..."
docker exec opa-sandbox subfinder -version

echo "All tests completed!"
