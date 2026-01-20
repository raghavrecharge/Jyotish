#!/bin/bash

# Astro Jyotish Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Start services
start() {
    print_status "Starting Astro Jyotish services..."
    docker-compose up -d
    print_status "Services started!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:8001"
}

# Start with build
start_build() {
    print_status "Building and starting Astro Jyotish services..."
    docker-compose up --build -d
    print_status "Services started!"
}

# Stop services
stop() {
    print_status "Stopping Astro Jyotish services..."
    docker-compose down
    print_status "Services stopped!"
}

# View logs
logs() {
    docker-compose logs -f $1
}

# Setup demo data
setup_demo() {
    print_status "Setting up demo data..."
    sleep 5  # Wait for backend to be ready
    curl -X POST http://localhost:8001/api/demo/setup
    print_status "Demo data setup complete!"
    print_status "Login with: demo@astroos.com / demo123"
}

# Reset everything
reset() {
    print_warning "This will delete all data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Resetting Astro Jyotish..."
        docker-compose down -v
        docker-compose up --build -d
        setup_demo
    fi
}

# Health check
health() {
    print_status "Checking service health..."
    curl -s http://localhost:8001/api/health | python3 -m json.tool 2>/dev/null || echo "Backend not responding"
    curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000
}

# Show help
show_help() {
    echo "Astro Jyotish Docker Management Script"
    echo ""
    echo "Usage: ./docker-run.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  start-build Start with rebuild"
    echo "  stop        Stop all services"
    echo "  logs        View logs (optionally specify service: backend/frontend)"
    echo "  setup       Setup demo data"
    echo "  reset       Reset everything (WARNING: deletes all data)"
    echo "  health      Check service health"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker-run.sh start"
    echo "  ./docker-run.sh logs backend"
    echo "  ./docker-run.sh setup"
}

# Main
check_docker

case "$1" in
    start)
        start
        ;;
    start-build)
        start_build
        ;;
    stop)
        stop
        ;;
    logs)
        logs $2
        ;;
    setup)
        setup_demo
        ;;
    reset)
        reset
        ;;
    health)
        health
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
