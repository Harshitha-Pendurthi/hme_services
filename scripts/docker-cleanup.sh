#!/bin/bash

# Home Services Docker Cleanup Script
set -e

echo "🧹 Cleaning up Home Services Docker resources..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop all containers
print_status "Stopping all Home Services containers..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Remove containers
print_status "Removing Home Services containers..."
docker rm -f home-services-db home-services-backend home-services-frontend home-services-tomcat home-services-nginx 2>/dev/null || true

# Remove images
print_status "Removing Home Services images..."
docker rmi -f home-services-db home-services-backend home-services-frontend 2>/dev/null || true

# Remove volumes (with confirmation)
read -p "Do you want to remove database volumes? This will delete all data! (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Removing volumes and all data..."
    docker volume rm mysql_data mysql_logs mysql_prod_data mysql_prod_logs 2>/dev/null || true
    print_status "Volumes removed."
else
    print_status "Volumes preserved."
fi

# Remove networks
print_status "Removing networks..."
docker network rm home-services-network home-services-prod-network 2>/dev/null || true

# Clean up unused resources
print_status "Cleaning up unused Docker resources..."
docker system prune -f

print_status "🎉 Cleanup completed!"
