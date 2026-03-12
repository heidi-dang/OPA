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
