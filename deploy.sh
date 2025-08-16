#!/bin/bash

# OneDesk Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
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
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Check if environment file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your actual values before proceeding."
        exit 1
    fi
}

# Development deployment
deploy_dev() {
    print_status "Starting development deployment..."
    check_docker
    check_env
    
    print_status "Building and starting development containers..."
    docker-compose -f docker-compose.dev.yml up --build -d
    
    print_status "Development deployment completed!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:3001"
    print_status "API Docs: http://localhost:3001/api-docs"
}

# Production deployment
deploy_prod() {
    print_status "Starting production deployment..."
    check_docker
    check_env
    
    print_status "Building and starting production containers..."
    docker-compose up --build -d
    
    print_status "Production deployment completed!"
    print_status "Application: http://localhost"
    print_status "API: http://localhost/api"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    
    if [ -f docker-compose.yml ]; then
        docker-compose down
    fi
    
    if [ -f docker-compose.dev.yml ]; then
        docker-compose -f docker-compose.dev.yml down
    fi
    
    print_status "All services stopped."
}

# View logs
view_logs() {
    if [ -z "$1" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $1..."
        docker-compose logs -f "$1"
    fi
}

# Health check
health_check() {
    print_status "Checking service health..."
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_status "✓ Containers are running"
    else
        print_error "✗ Some containers are not running"
        docker-compose ps
        return 1
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_status "✓ Frontend is healthy"
    else
        print_warning "✗ Frontend health check failed"
    fi
    
    # Check backend health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_status "✓ Backend is healthy"
    else
        print_warning "✗ Backend health check failed"
    fi
}

# Main script logic
case "$1" in
    "dev")
        deploy_dev
        ;;
    "prod")
        deploy_prod
        ;;
    "stop")
        stop_services
        ;;
    "logs")
        view_logs "$2"
        ;;
    "health")
        health_check
        ;;
    *)
        echo "OneDesk Deployment Script"
        echo ""
        echo "Usage: $0 {dev|prod|stop|logs|health}"
        echo ""
        echo "Commands:"
        echo "  dev     - Deploy in development mode"
        echo "  prod    - Deploy in production mode"
        echo "  stop    - Stop all services"
        echo "  logs    - View logs (optionally specify service name)"
        echo "  health  - Check service health"
        echo ""
        echo "Examples:"
        echo "  $0 dev"
        echo "  $0 prod"
        echo "  $0 logs backend"
        echo "  $0 health"
        exit 1
        ;;
esac
