#!/bin/bash

# Home Services Production Deployment Script
set -e

echo "🚀 Deploying Home Services Application to Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if production environment file exists
if [ ! -f .env.prod ]; then
    print_error "Production environment file (.env.prod) not found!"
    print_error "Please create .env.prod with production configuration."
    exit 1
fi

# Load production environment
export $(cat .env.prod | xargs)

print_step "1. Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

print_step "2. Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

print_step "3. Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

print_step "4. Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

print_step "5. Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check database
if docker-compose -f docker-compose.prod.yml exec -T database mysqladmin ping -h localhost -u root -p$DB_ROOT_PASSWORD > /dev/null 2>&1; then
    print_status "✅ Database is healthy"
else
    print_error "❌ Database health check failed"
fi

# Check backend
if curl -f http://localhost:8080/api/actuator/health > /dev/null 2>&1; then
    print_status "✅ Backend is healthy"
else
    print_error "❌ Backend health check failed"
fi

# Check frontend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_status "✅ Frontend is healthy"
else
    print_error "❌ Frontend health check failed"
fi

print_status "🎉 Production deployment completed!"
print_status "Application is available at: http://localhost"
print_status "API is available at: http://localhost/api"

print_warning "Remember to:"
print_warning "- Set up SSL certificates for HTTPS"
print_warning "- Configure domain name and DNS"
print_warning "- Set up monitoring and logging"
print_warning "- Configure backup strategy"
