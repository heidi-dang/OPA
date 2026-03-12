#!/bin/bash

# OPA Local Sandbox Setup Script
# This script sets up the complete local development environment

set -e

echo "🚀 Setting up OPA Local Sandbox Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Create workspace directories
create_workspace() {
    print_status "Creating workspace directories..."
    
    mkdir -p workspace/{reports,temp,logs,scans,exploits,configs,scripts}
    mkdir -p workspace/logs/{sandbox,tools,scans}
    
    print_success "Workspace directories created!"
}

# Build Docker image
build_docker_image() {
    print_status "Building local sandbox Docker image..."
    
    if docker build -t opa-local-sandbox:latest -f Dockerfile.local .; then
        print_success "Docker image built successfully!"
    else
        print_error "Failed to build Docker image."
        exit 1
    fi
}

# Install Node.js dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    if npm install; then
        print_success "Dependencies installed successfully!"
    else
        print_error "Failed to install dependencies."
        exit 1
    fi
}

# Build TypeScript project
build_project() {
    print_status "Building TypeScript project..."
    
    if npm run build; then
        print_success "Project built successfully!"
    else
        print_warning "Build failed, but continuing..."
    fi
}

# Create configuration files
create_configs() {
    print_status "Creating configuration files..."
    
    # Create environment file
    cat > .env.local << EOF
# OPA Local Sandbox Configuration
OPA_SANDBOX_ENV=local
OPA_WORKSPACE=./workspace
OPA_REPORTS_DIR=./workspace/reports
OPA_TEMP_DIR=./workspace/temp
OPA_LOGS_DIR=./workspace/logs

# Docker Configuration
DOCKER_IMAGE=opa-local-sandbox:latest
CONTAINER_NAME=opa-sandbox

# Tool Configuration
NMAP_TIMEOUT=300
NUCLEI_TIMEOUT=600
FFUF_TIMEOUT=300
EOF

    # Create OPA configuration
    cat > workspace/configs/opa.conf << EOF
# OPA Tool Configuration
timeout.default=300
timeout.nmap=600
timeout.nuclei=900
timeout.ffuf=300

# Parallel execution limits
parallel.max_workers=4
parallel.high_priority_workers=2
parallel.medium_priority_workers=3
parallel.low_priority_workers=4

# Security settings
security.require_approval=true
security.safe_mode=true
security.log_level=info
EOF

    print_success "Configuration files created!"
}

# Create utility scripts
create_utility_scripts() {
    print_status "Creating utility scripts..."
    
    # Sandbox management script
    cat > scripts/sandbox.sh << 'EOF'
#!/bin/bash

# OPA Sandbox Management Script

case "$1" in
    start)
        echo "Starting OPA sandbox..."
        docker run -d --name opa-sandbox \
            -v $(pwd)/workspace:/workspace \
            --network host \
            opa-local-sandbox:latest
        echo "Sandbox started!"
        ;;
    stop)
        echo "Stopping OPA sandbox..."
        docker stop opa-sandbox 2>/dev/null || true
        echo "Sandbox stopped!"
        ;;
    restart)
        echo "Restarting OPA sandbox..."
        docker stop opa-sandbox 2>/dev/null || true
        docker rm opa-sandbox 2>/dev/null || true
        docker run -d --name opa-sandbox \
            -v $(pwd)/workspace:/workspace \
            --network host \
            opa-local-sandbox:latest
        echo "Sandbox restarted!"
        ;;
    status)
        echo "OPA Sandbox Status:"
        docker ps -a --filter name=opa-sandbox --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        ;;
    logs)
        echo "OPA Sandbox Logs:"
        docker logs -f opa-sandbox
        ;;
    shell)
        echo "Opening shell in sandbox..."
        docker exec -it opa-sandbox /bin/bash
        ;;
    clean)
        echo "Cleaning up sandbox..."
        docker stop opa-sandbox 2>/dev/null || true
        docker rm opa-sandbox 2>/dev/null || true
        echo "Sandbox cleaned up!"
        ;;
    rebuild)
        echo "Rebuilding sandbox image..."
        docker stop opa-sandbox 2>/dev/null || true
        docker rm opa-sandbox 2>/dev/null || true
        docker rmi opa-local-sandbox:latest 2>/dev/null || true
        docker build -t opa-local-sandbox:latest -f Dockerfile.local .
        echo "Sandbox rebuilt!"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|shell|clean|rebuild}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the sandbox container"
        echo "  stop    - Stop the sandbox container"
        echo "  restart - Restart the sandbox container"
        echo "  status  - Show sandbox status"
        echo "  logs    - Show sandbox logs"
        echo "  shell   - Open shell in sandbox"
        echo "  clean   - Stop and remove sandbox container"
        echo "  rebuild - Rebuild sandbox image"
        exit 1
        ;;
esac
EOF

    chmod +x scripts/sandbox.sh
    
    # Development script
    cat > scripts/dev.sh << 'EOF'
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
EOF

    chmod +x scripts/dev.sh
    
    # Test script
    cat > scripts/test.sh << 'EOF'
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
EOF

    chmod +x scripts/test.sh
    
    print_success "Utility scripts created!"
}

# Create development environment file
create_dev_env() {
    print_status "Creating development environment..."
    
    # Create package.json scripts if they don't exist
    if ! grep -q "dev" package.json; then
        npm pkg set scripts.dev="node dist/mcp.js"
        npm pkg set scripts.sandbox="./scripts/sandbox.sh"
        npm pkg set scripts.test-local="./scripts/test.sh"
    fi
    
    print_success "Development environment configured!"
}

# Main setup function
main() {
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              OPA LOCAL SANDBOX SETUP SCRIPT                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_prerequisites
    create_workspace
    install_dependencies
    build_project
    create_configs
    create_utility_scripts
    create_dev_env
    build_docker_image
    
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    SETUP COMPLETED!                           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    print_success "OPA Local Sandbox setup completed successfully!"
    echo ""
    echo "🎉 Next Steps:"
    echo "1. Start the sandbox: ./scripts/sandbox.sh start"
    echo "2. Check status: ./scripts/sandbox.sh status"
    echo "3. Open shell: ./scripts/sandbox.sh shell"
    echo "4. Run tests: ./scripts/test.sh"
    echo "5. Start development: ./scripts/dev.sh"
    echo ""
    echo "📁 Workspace Structure:"
    echo "• workspace/ - Main workspace directory"
    echo "• workspace/reports/ - Generated reports"
    echo "• workspace/temp/ - Temporary files"
    echo "• workspace/logs/ - Log files"
    echo "• workspace/scans/ - Scan results"
    echo "• workspace/exploits/ - Generated exploits"
    echo "• scripts/ - Utility scripts"
    echo ""
    echo "🔧 Available Commands:"
    echo "• ./scripts/sandbox.sh {start|stop|restart|status|logs|shell|clean|rebuild}"
    echo "• ./scripts/dev.sh - Start development environment"
    echo "• ./scripts/test.sh - Run tests"
    echo ""
    print_success "Happy hacking with OPA! 🚀"
}

# Run main function
main "$@"
