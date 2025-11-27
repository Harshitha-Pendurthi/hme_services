# Deployment Guide

This guide covers different deployment scenarios for the Home Services Booking Application.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [CI/CD Setup](#cicd-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)

## Local Development

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Java 17+
- Maven 3.9+
- MySQL 8.0 (optional, can use Docker)

### Quick Start
\`\`\`bash
# Clone repository
git clone https://github.com/your-username/home-services-app.git
cd home-services-app

# Start with Docker
docker-compose up -d

# Or build and start
./scripts/docker-build.sh
\`\`\`

### Manual Setup

#### 1. Database Setup
\`\`\`bash
# Install MySQL
sudo apt-get install mysql-server

# Create database
mysql -u root -p
CREATE DATABASE home_services_db;

# Run schema and seed data
mysql -u root -p home_services_db < database/schema.sql
mysql -u root -p home_services_db < database/seed_data.sql
\`\`\`

#### 2. Backend Setup
\`\`\`bash
cd backend

# Configure application.properties
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Edit database connection
vim src/main/resources/application.properties

# Build and run
mvn clean install
mvn spring-boot:run
\`\`\`

#### 3. Frontend Setup
\`\`\`bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
\`\`\`

## Docker Deployment

### Development Environment

#### Using Docker Compose
\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up (removes volumes)
docker-compose down -v
\`\`\`

#### Individual Services
\`\`\`bash
# Build images
docker build -t home-services-db ./database
docker build -t home-services-backend ./backend
docker build -t home-services-frontend ./frontend

# Run database
docker run -d --name home-services-db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=home_services_db \
  -p 3306:3306 \
  home-services-db

# Run backend
docker run -d --name home-services-backend \
  --link home-services-db:database \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://database:3306/home_services_db \
  -p 8080:8080 \
  home-services-backend

# Run frontend
docker run -d --name home-services-frontend \
  --link home-services-backend:backend \
  -p 3000:80 \
  home-services-frontend
\`\`\`

### Production Environment

#### Using Production Compose File
\`\`\`bash
# Create production environment file
cp .env.example .env.prod

# Edit production settings
vim .env.prod

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

#### Production Environment Variables
\`\`\`env
# .env.prod
DB_ROOT_PASSWORD=your_secure_root_password
DB_USER=homeservices
DB_PASSWORD=your_secure_db_password
JWT_SECRET=your_very_long_and_secure_jwt_secret_key
FRONTEND_URL=https://your-domain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
\`\`\`

## Production Deployment

### Server Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

#### Recommended Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS

### Server Setup

#### 1. Install Dependencies
\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (for reverse proxy)
sudo apt install nginx -y

# Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y
\`\`\`

#### 2. Application Deployment
\`\`\`bash
# Create application directory
sudo mkdir -p /opt/home-services
sudo chown $USER:$USER /opt/home-services
cd /opt/home-services

# Clone repository
git clone https://github.com/your-username/home-services-app.git .

# Create production environment
cp .env.example .env.prod
# Edit .env.prod with production values

# Deploy application
./scripts/docker-deploy.sh
\`\`\`

#### 3. Nginx Configuration
\`\`\`nginx
# /etc/nginx/sites-available/home-services
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

#### 4. SSL Certificate
\`\`\`bash
# Enable site
sudo ln -s /etc/nginx/sites-available/home-services /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
\`\`\`

### Database Backup Strategy

#### Automated Backups
\`\`\`bash
# Create backup script
sudo tee /opt/home-services/scripts/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/home-services/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="home_services_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

docker-compose -f /opt/home-services/docker-compose.prod.yml exec -T database \
  mysqldump -u root -p$DB_ROOT_PASSWORD home_services_db > $BACKUP_DIR/$BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

sudo chmod +x /opt/home-services/scripts/backup-db.sh

# Schedule daily backups
sudo crontab -e
# Add: 0 2 * * * /opt/home-services/scripts/backup-db.sh
\`\`\`

## Cloud Deployment

### AWS Deployment

#### Using EC2
1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.medium (minimum)
   - Security Group: Allow ports 22, 80, 443

2. **Setup Application**
   \`\`\`bash
   # Connect to instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Follow production deployment steps above
   \`\`\`

#### Using ECS (Elastic Container Service)
1. **Create Task Definition**
2. **Setup ECS Cluster**
3. **Configure Load Balancer**
4. **Setup RDS for Database**

#### Using EKS (Kubernetes)
\`\`\`yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: home-services-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: home-services-backend
  template:
    metadata:
      labels:
        app: home-services-backend
    spec:
      containers:
      - name: backend
        image: your-repo/home-services-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_DATASOURCE_URL
          value: "jdbc:mysql://mysql-service:3306/home_services_db"
\`\`\`

### Google Cloud Platform

#### Using Compute Engine
Similar to AWS EC2 deployment.

#### Using Cloud Run
\`\`\`bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/your-project/home-services-backend ./backend
gcloud builds submit --tag gcr.io/your-project/home-services-frontend ./frontend

# Deploy to Cloud Run
gcloud run deploy home-services-backend \
  --image gcr.io/your-project/home-services-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
\`\`\`

### Azure Deployment

#### Using Container Instances
\`\`\`bash
# Create resource group
az group create --name home-services-rg --location eastus

# Deploy containers
az container create \
  --resource-group home-services-rg \
  --name home-services-app \
  --image your-repo/home-services-backend:latest \
  --ports 8080 \
  --environment-variables SPRING_DATASOURCE_URL=your-db-url
\`\`\`

## CI/CD Setup

### Jenkins Setup

#### 1. Install Jenkins
\`\`\`bash
# Install Java
sudo apt install openjdk-11-jdk -y

# Add Jenkins repository
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'

# Install Jenkins
sudo apt update
sudo apt install jenkins -y

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
\`\`\`

#### 2. Configure Jenkins
\`\`\`bash
# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Access Jenkins at http://your-server:8080
# Install suggested plugins
# Create admin user
\`\`\`

#### 3. Setup Pipeline
1. Create new Multibranch Pipeline job
2. Configure Git repository
3. Add Jenkinsfile to repository root
4. Configure webhooks for automatic builds

### GitHub Actions (Alternative)

\`\`\`yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Test Backend
      run: |
        cd backend
        mvn test
    
    - name: Test Frontend
      run: |
        cd frontend
        npm ci
        npm test
    
    - name: Build Docker Images
      run: |
        docker build -t home-services-backend ./backend
        docker build -t home-services-frontend ./frontend
    
    - name: Deploy to Staging
      if: github.ref == 'refs/heads/develop'
      run: |
        # Deploy to staging server
        echo "Deploying to staging..."
\`\`\`

## Monitoring & Maintenance

### Health Monitoring

#### Application Health Checks
\`\`\`bash
# Backend health
curl http://localhost:8080/api/actuator/health

# Frontend health
curl http://localhost:3000/health

# Database health
docker-compose exec database mysqladmin ping -u root -p
\`\`\`

#### Automated Monitoring Script
\`\`\`bash
#!/bin/bash
# /opt/home-services/scripts/health-check.sh

BACKEND_URL="http://localhost:8080/api/actuator/health"
FRONTEND_URL="http://localhost:3000/health"
EMAIL="admin@your-domain.com"

# Check backend
if ! curl -f $BACKEND_URL > /dev/null 2>&1; then
    echo "Backend is down!" | mail -s "Home Services Alert" $EMAIL
fi

# Check frontend
if ! curl -f $FRONTEND_URL > /dev/null 2>&1; then
    echo "Frontend is down!" | mail -s "Home Services Alert" $EMAIL
fi
\`\`\`

### Log Management

#### Centralized Logging
\`\`\`bash
# Install ELK Stack (Elasticsearch, Logstash, Kibana)
docker run -d --name elasticsearch \
  -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  elasticsearch:7.14.0

docker run -d --name kibana \
  -p 5601:5601 \
  --link elasticsearch:elasticsearch \
  kibana:7.14.0
\`\`\`

#### Log Rotation
\`\`\`bash
# Configure logrotate
sudo tee /etc/logrotate.d/home-services << 'EOF'
/opt/home-services/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF
\`\`\`

### Performance Monitoring

#### Application Metrics
- Use Micrometer with Prometheus
- Monitor response times, error rates
- Track business metrics (bookings, revenue)

#### Infrastructure Metrics
- CPU, Memory, Disk usage
- Network traffic
- Database performance

### Security Maintenance

#### Regular Updates
\`\`\`bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d

# Update SSL certificates
sudo certbot renew
\`\`\`

#### Security Scanning
\`\`\`bash
# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image home-services-backend:latest
\`\`\`

### Backup and Recovery

#### Database Backup
\`\`\`bash
# Manual backup
docker-compose exec database mysqldump -u root -p home_services_db > backup.sql

# Restore from backup
docker-compose exec -T database mysql -u root -p home_services_db < backup.sql
\`\`\`

#### Application Backup
\`\`\`bash
# Backup application files
tar -czf home-services-backup-$(date +%Y%m%d).tar.gz /opt/home-services

# Backup to cloud storage (AWS S3)
aws s3 cp home-services-backup-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
\`\`\`

### Disaster Recovery

#### Recovery Plan
1. **Database Recovery**: Restore from latest backup
2. **Application Recovery**: Redeploy from Git repository
3. **Configuration Recovery**: Restore environment files
4. **SSL Certificate Recovery**: Re-issue certificates if needed

#### Testing Recovery
\`\`\`bash
# Test database restore
docker-compose -f docker-compose.test.yml up -d
# Restore test data
# Verify application functionality
docker-compose -f docker-compose.test.yml down
\`\`\`

This deployment guide covers various scenarios from local development to production cloud deployment. Choose the approach that best fits your infrastructure and requirements.
