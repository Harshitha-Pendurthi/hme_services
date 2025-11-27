# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Home Services Booking Application.

## Table of Contents
1. [Common Issues](#common-issues)
2. [Database Issues](#database-issues)
3. [Backend Issues](#backend-issues)
4. [Frontend Issues](#frontend-issues)
5. [Docker Issues](#docker-issues)
6. [Authentication Issues](#authentication-issues)
7. [Performance Issues](#performance-issues)
8. [Deployment Issues](#deployment-issues)

## Common Issues

### Application Won't Start

#### Symptoms
- Services fail to start
- Connection errors between components
- Port conflicts

#### Diagnosis
\`\`\`bash
# Check if ports are in use
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :3306

# Check Docker containers
docker-compose ps
docker-compose logs
\`\`\`

#### Solutions
\`\`\`bash
# Stop conflicting services
sudo systemctl stop mysql
sudo systemctl stop nginx

# Use different ports
# Edit docker-compose.yml to change port mappings

# Clean up Docker resources
docker-compose down -v
docker system prune -f
\`\`\`

### Services Can't Communicate

#### Symptoms
- Frontend can't reach backend API
- Backend can't connect to database
- CORS errors in browser

#### Diagnosis
\`\`\`bash
# Test network connectivity
docker-compose exec frontend ping backend
docker-compose exec backend ping database

# Check network configuration
docker network ls
docker network inspect home-services_home-services-network
\`\`\`

#### Solutions
\`\`\`bash
# Ensure all services are on same network
# Check docker-compose.yml network configuration

# Verify service names match in configuration
# Frontend should call http://backend:8080/api
# Backend should connect to jdbc:mysql://database:3306/home_services_db

# Restart services in correct order
docker-compose down
docker-compose up database
# Wait for database to be ready
docker-compose up backend
# Wait for backend to be ready
docker-compose up frontend
\`\`\`

## Database Issues

### Database Connection Failed

#### Symptoms
\`\`\`
Connection refused to database
Access denied for user
Unknown database 'home_services_db'
\`\`\`

#### Diagnosis
\`\`\`bash
# Check database container
docker-compose logs database

# Test database connection
docker-compose exec database mysql -u root -p

# Check database exists
docker-compose exec database mysql -u root -p -e "SHOW DATABASES;"
\`\`\`

#### Solutions
\`\`\`bash
# Recreate database with fresh data
docker-compose down -v
docker-compose up database

# Check environment variables
cat .env
# Ensure DB credentials match in backend configuration

# Manual database creation
docker-compose exec database mysql -u root -p
CREATE DATABASE home_services_db;
exit

# Run schema and seed data
docker-compose exec database mysql -u root -p home_services_db < /docker-entrypoint-initdb.d/01-schema.sql
\`\`\`

### Database Performance Issues

#### Symptoms
- Slow query responses
- High CPU usage on database container
- Connection timeouts

#### Diagnosis
\`\`\`bash
# Check database performance
docker-compose exec database mysql -u root -p -e "SHOW PROCESSLIST;"
docker-compose exec database mysql -u root -p -e "SHOW ENGINE INNODB STATUS;"

# Monitor resource usage
docker stats database
\`\`\`

#### Solutions
\`\`\`bash
# Optimize database configuration
# Edit database/my.cnf
innodb_buffer_pool_size=512M
query_cache_size=64M

# Add database indexes
# Check database/schema.sql for existing indexes

# Restart database with new configuration
docker-compose restart database
\`\`\`

### Data Corruption

#### Symptoms
- Inconsistent data
- Foreign key constraint errors
- Table doesn't exist errors

#### Solutions
\`\`\`bash
# Backup current data
docker-compose exec database mysqldump -u root -p home_services_db > backup.sql

# Restore from clean schema
docker-compose down -v
docker-compose up database
# Wait for initialization to complete

# If needed, restore specific data
docker-compose exec -T database mysql -u root -p home_services_db < backup.sql
\`\`\`

## Backend Issues

### Spring Boot Application Won't Start

#### Symptoms
\`\`\`
Port 8080 already in use
Bean creation failed
Configuration property binding failed
\`\`\`

#### Diagnosis
\`\`\`bash
# Check backend logs
docker-compose logs backend

# Check Java process
docker-compose exec backend ps aux | grep java

# Check configuration
docker-compose exec backend cat /app/application.properties
\`\`\`

#### Solutions
\`\`\`bash
# Port conflict
# Change server.port in application.properties or docker-compose.yml

# Configuration issues
# Verify environment variables
docker-compose exec backend env | grep SPRING

# Database connection issues
# Ensure database is running and accessible
docker-compose exec backend ping database

# Restart backend
docker-compose restart backend
\`\`\`

### API Endpoints Not Working

#### Symptoms
- 404 Not Found errors
- 500 Internal Server Error
- Authentication failures

#### Diagnosis
\`\`\`bash
# Test API endpoints
curl http://localhost:8080/api/actuator/health
curl http://localhost:8080/api/categories

# Check backend logs for errors
docker-compose logs backend | grep ERROR

# Verify JWT token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/bookings
\`\`\`

#### Solutions
\`\`\`bash
# Check controller mappings
# Verify @RequestMapping annotations in controllers

# Database connectivity
# Ensure database schema is up to date

# Authentication issues
# Verify JWT secret and token generation

# CORS issues
# Check CORS configuration in WebSecurityConfig
\`\`\`

### Memory Issues

#### Symptoms
- OutOfMemoryError
- High memory usage
- Application becomes unresponsive

#### Diagnosis
\`\`\`bash
# Check memory usage
docker stats backend

# Check JVM memory
docker-compose exec backend jstat -gc 1
\`\`\`

#### Solutions
\`\`\`bash
# Increase memory allocation
# Edit backend/Dockerfile
ENV JAVA_OPTS="-Xmx1024m -Xms512m"

# Or in docker-compose.yml
environment:
  - JAVA_OPTS=-Xmx1024m -Xms512m

# Restart backend
docker-compose restart backend
\`\`\`

## Frontend Issues

### React Application Won't Start

#### Symptoms
- Build failures
- Module not found errors
- Syntax errors

#### Diagnosis
\`\`\`bash
# Check frontend logs
docker-compose logs frontend

# Check Node.js version
docker-compose exec frontend node --version

# Check package.json dependencies
docker-compose exec frontend cat package.json
\`\`\`

#### Solutions
\`\`\`bash
# Clear npm cache and reinstall
docker-compose exec frontend npm cache clean --force
docker-compose exec frontend rm -rf node_modules package-lock.json
docker-compose exec frontend npm install

# Rebuild frontend image
docker-compose build --no-cache frontend
docker-compose up frontend
\`\`\`

### API Calls Failing

#### Symptoms
- Network errors in browser console
- CORS errors
- 401 Unauthorized errors

#### Diagnosis
\`\`\`bash
# Check browser network tab
# Look for failed API calls

# Check frontend configuration
docker-compose exec frontend cat /etc/nginx/nginx.conf

# Test API directly
curl http://localhost:8080/api/categories
\`\`\`

#### Solutions
\`\`\`bash
# CORS issues
# Verify backend CORS configuration allows frontend origin

# Proxy configuration
# Check nginx.conf proxy settings for /api/ routes

# Authentication
# Verify JWT token is being sent with requests
# Check localStorage for stored token
\`\`\`

### Build Issues

#### Symptoms
- npm build failures
- Missing dependencies
- TypeScript errors

#### Solutions
\`\`\`bash
# Update dependencies
docker-compose exec frontend npm update

# Fix security vulnerabilities
docker-compose exec frontend npm audit fix

# Clear build cache
docker-compose exec frontend npm run build -- --no-cache

# Rebuild container
docker-compose build --no-cache frontend
\`\`\`

## Docker Issues

### Container Won't Start

#### Symptoms
- Container exits immediately
- Port binding failures
- Volume mount errors

#### Diagnosis
\`\`\`bash
# Check container status
docker-compose ps

# Check container logs
docker-compose logs [service-name]

# Inspect container
docker inspect [container-name]
\`\`\`

#### Solutions
\`\`\`bash
# Port conflicts
# Change port mappings in docker-compose.yml

# Permission issues
# Check file permissions
sudo chown -R $USER:$USER .

# Volume issues
# Remove volumes and recreate
docker-compose down -v
docker-compose up
\`\`\`

### Image Build Failures

#### Symptoms
- Docker build command fails
- Missing files in build context
- Network timeouts during build

#### Solutions
\`\`\`bash
# Clean Docker cache
docker system prune -a

# Build with no cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker-compose config

# Build individual services
docker build -t test-image ./backend
\`\`\`

### Network Issues

#### Symptoms
- Services can't communicate
- DNS resolution failures
- Connection timeouts

#### Diagnosis
\`\`\`bash
# List networks
docker network ls

# Inspect network
docker network inspect [network-name]

# Test connectivity
docker-compose exec frontend ping backend
\`\`\`

#### Solutions
\`\`\`bash
# Recreate network
docker-compose down
docker network prune
docker-compose up

# Check network configuration in docker-compose.yml
# Ensure all services are on same network
\`\`\`

## Authentication Issues

### JWT Token Problems

#### Symptoms
- Login fails with valid credentials
- Token expired errors
- Invalid token errors

#### Diagnosis
\`\`\`bash
# Check JWT configuration
docker-compose exec backend env | grep JWT

# Check token generation
# Look at backend logs during login

# Decode JWT token (use jwt.io)
\`\`\`

#### Solutions
\`\`\`bash
# Verify JWT secret
# Ensure JWT_SECRET is set and consistent

# Check token expiration
# Verify JWT_EXPIRATION setting

# Clear stored tokens
# Clear localStorage in browser
localStorage.clear()

# Restart backend to reset JWT configuration
docker-compose restart backend
\`\`\`

### Password Issues

#### Symptoms
- Login fails with correct password
- Password encoding errors
- User not found errors

#### Solutions
\`\`\`bash
# Check password encoding
# Verify BCrypt is used consistently

# Reset user password
docker-compose exec database mysql -u root -p
USE home_services_db;
UPDATE users SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P2.nRuvO2mAXSO' WHERE username = 'admin';

# Check user exists
SELECT * FROM users WHERE username = 'your_username';
\`\`\`

## Performance Issues

### Slow Response Times

#### Symptoms
- API calls take too long
- Page load times are slow
- Database queries are slow

#### Diagnosis
\`\`\`bash
# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/services

# Check database performance
docker-compose exec database mysql -u root -p -e "SHOW PROCESSLIST;"

# Monitor resource usage
docker stats
\`\`\`

#### Solutions
\`\`\`bash
# Database optimization
# Add indexes to frequently queried columns
# Optimize query performance

# Backend optimization
# Enable caching
# Optimize JPA queries

# Frontend optimization
# Enable gzip compression
# Optimize bundle size
# Use lazy loading
\`\`\`

### High Resource Usage

#### Symptoms
- High CPU usage
- High memory usage
- Disk space issues

#### Solutions
\`\`\`bash
# Limit container resources
# Add resource limits to docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'

# Clean up Docker resources
docker system prune -a
docker volume prune

# Optimize application
# Profile memory usage
# Optimize database queries
\`\`\`

## Deployment Issues

### Production Deployment Failures

#### Symptoms
- Services fail to start in production
- Environment variable issues
- SSL certificate problems

#### Solutions
\`\`\`bash
# Check production environment
cat .env.prod

# Verify SSL certificates
sudo certbot certificates

# Check nginx configuration
sudo nginx -t

# Monitor deployment
docker-compose -f docker-compose.prod.yml logs -f
\`\`\`

### CI/CD Pipeline Issues

#### Symptoms
- Build failures in Jenkins
- Test failures
- Deployment failures

#### Solutions
\`\`\`bash
# Check Jenkins logs
# Review build console output

# Run tests locally
cd backend && mvn test
cd frontend && npm test

# Verify Docker registry access
docker login

# Check deployment scripts
./scripts/docker-deploy.sh
\`\`\`

## Getting Help

### Log Collection
\`\`\`bash
# Collect all logs
mkdir troubleshooting-logs
docker-compose logs > troubleshooting-logs/docker-compose.log
docker-compose logs database > troubleshooting-logs/database.log
docker-compose logs backend > troubleshooting-logs/backend.log
docker-compose logs frontend > troubleshooting-logs/frontend.log

# System information
docker version > troubleshooting-logs/docker-version.txt
docker-compose version > troubleshooting-logs/compose-version.txt
uname -a > troubleshooting-logs/system-info.txt
\`\`\`

### Health Check Script
\`\`\`bash
#!/bin/bash
# health-check.sh

echo "=== Home Services Health Check ==="

# Check Docker
echo "Docker Status:"
docker --version
docker-compose --version

# Check containers
echo -e "\nContainer Status:"
docker-compose ps

# Check services
echo -e "\nService Health:"
curl -f http://localhost:3000/health && echo "Frontend: OK" || echo "Frontend: FAIL"
curl -f http://localhost:8080/api/actuator/health && echo "Backend: OK" || echo "Backend: FAIL"

# Check database
echo -e "\nDatabase Status:"
docker-compose exec database mysqladmin ping -u root -p$DB_ROOT_PASSWORD && echo "Database: OK" || echo "Database: FAIL"

echo -e "\n=== Health Check Complete ==="
\`\`\`

### Support Resources
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the docs/ directory
- **Community**: Join our Discord/Slack channel
- **Email**: support@homeservices.com

Remember to include relevant logs and system information when seeking help!
