#!/bin/bash

# Home Services Docker Build Script
set -e

echo "🏠 Building Home Services Application..."

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please update the .env file with your configuration before running the application."
fi

# Build the application
print_status "Building Docker images..."

# Build database image
print_status "Building database image..."
docker build -t home-services-db ./database

# Build backend image
print_status "Building backend image..."
docker build -t home-services-backend ./backend

# Build frontend image
print_status "Building frontend image..."
docker build -t home-services-frontend ./frontend

print_status "All images built successfully!"

# Option to start the application
read -p "Do you want to start the application now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting Home Services application..."
    docker-compose up -d
    
    print_status "Application is starting up..."
    print_status "Frontend will be available at: http://localhost:3000"
    print_status "Backend API will be available at: http://localhost:8080/api"
    print_status "Database will be available at: localhost:3306"
    
    print_status "Use 'docker-compose logs -f' to view logs"
    print_status "Use 'docker-compose down' to stop the application"
else
    print_status "Build completed. Use 'docker-compose up -d' to start the application."
fi
