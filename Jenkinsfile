pipeline {
    agent any
    
    environment {
        // Docker Hub credentials
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        DOCKER_HUB_REPO = 'your-dockerhub-username/home-services'
        
        // Application configuration
        APP_NAME = 'home-services'
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        GIT_COMMIT_SHORT = "${env.GIT_COMMIT[0..7]}"
        
        // Deployment configuration
        TOMCAT_SERVER = credentials('tomcat-server-credentials')
        DEPLOYMENT_SERVER = 'your-deployment-server.com'
        
        // Database configuration
        DB_CREDENTIALS = credentials('database-credentials')
        
        // Notification configuration
        SLACK_CHANNEL = '#deployments'
        EMAIL_RECIPIENTS = 'team@yourcompany.com'
    }
    
    tools {
        maven 'Maven-3.9.0'
        nodejs 'NodeJS-18'
        jdk 'JDK-17'
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Checking out code from repository..."
                    checkout scm
                    
                    // Get commit information
                    env.GIT_COMMIT_MSG = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()
                    
                    echo "📝 Commit: ${env.GIT_COMMIT_SHORT} - ${env.GIT_COMMIT_MSG}"
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    script {
                        echo "🏗️ Building Spring Boot backend..."
                        
                        // Clean and compile
                        sh 'mvn clean compile'
                        
                        // Run tests
                        sh 'mvn test'
                        
                        // Package application
                        sh 'mvn package -DskipTests'
                        
                        // Archive test results
                        publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                        
                        // Archive artifacts
                        archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
                    }
                }
            }
            post {
                always {
                    // Publish test results
                    junit 'backend/target/surefire-reports/*.xml'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    script {
                        echo "⚛️ Building React frontend..."
                        
                        // Install dependencies
                        sh 'npm ci'
                        
                        // Run tests
                        sh 'npm test -- --coverage --watchAll=false'
                        
                        // Build production bundle
                        sh 'npm run build'
                        
                        // Archive build artifacts
                        archiveArtifacts artifacts: 'build/**/*', fingerprint: true
                    }
                }
            }
            post {
                always {
                    // Publish test coverage
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontend/coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Frontend Coverage Report'
                    ])
                }
            }
        }
        
        stage('Code Quality Analysis') {
            parallel {
                stage('Backend Quality') {
                    steps {
                        dir('backend') {
                            script {
                                echo "🔍 Running backend code quality checks..."
                                
                                // Run SpotBugs
                                sh 'mvn spotbugs:check'
                                
                                // Run Checkstyle
                                sh 'mvn checkstyle:check'
                                
                                // Run PMD
                                sh 'mvn pmd:check'
                            }
                        }
                    }
                }
                
                stage('Frontend Quality') {
                    steps {
                        dir('frontend') {
                            script {
                                echo "🔍 Running frontend code quality checks..."
                                
                                // Run ESLint
                                sh 'npm run lint'
                                
                                // Run Prettier check
                                sh 'npm run format:check'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Backend Security') {
                    steps {
                        dir('backend') {
                            script {
                                echo "🔒 Running backend security scan..."
                                
                                // OWASP Dependency Check
                                sh 'mvn org.owasp:dependency-check-maven:check'
                                
                                // Publish security report
                                publishHTML([
                                    allowMissing: false,
                                    alwaysLinkToLastBuild: true,
                                    keepAll: true,
                                    reportDir: 'target',
                                    reportFiles: 'dependency-check-report.html',
                                    reportName: 'Backend Security Report'
                                ])
                            }
                        }
                    }
                }
                
                stage('Frontend Security') {
                    steps {
                        dir('frontend') {
                            script {
                                echo "🔒 Running frontend security scan..."
                                
                                // NPM Audit
                                sh 'npm audit --audit-level=high'
                                
                                // Snyk security scan (if available)
                                script {
                                    try {
                                        sh 'npx snyk test'
                                    } catch (Exception e) {
                                        echo "⚠️ Snyk not configured, skipping..."
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    echo "🐳 Building Docker images..."
                    
                    // Build database image
                    sh "docker build -t ${DOCKER_HUB_REPO}-db:${BUILD_NUMBER} ./database"
                    sh "docker tag ${DOCKER_HUB_REPO}-db:${BUILD_NUMBER} ${DOCKER_HUB_REPO}-db:latest"
                    
                    // Build backend image
                    sh "docker build -t ${DOCKER_HUB_REPO}-backend:${BUILD_NUMBER} ./backend"
                    sh "docker tag ${DOCKER_HUB_REPO}-backend:${BUILD_NUMBER} ${DOCKER_HUB_REPO}-backend:latest"
                    
                    // Build frontend image
                    sh "docker build -t ${DOCKER_HUB_REPO}-frontend:${BUILD_NUMBER} ./frontend"
                    sh "docker tag ${DOCKER_HUB_REPO}-frontend:${BUILD_NUMBER} ${DOCKER_HUB_REPO}-frontend:latest"
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    echo "🧪 Running integration tests..."
                    
                    try {
                        // Start test environment
                        sh 'docker-compose -f docker-compose.test.yml up -d'
                        
                        // Wait for services to be ready
                        sh 'sleep 60'
                        
                        // Run integration tests
                        dir('backend') {
                            sh 'mvn test -Dtest=**/*IntegrationTest'
                        }
                        
                        // Run API tests with Newman (if Postman collections exist)
                        script {
                            if (fileExists('tests/postman/Home-Services-API.postman_collection.json')) {
                                sh '''
                                    npm install -g newman
                                    newman run tests/postman/Home-Services-API.postman_collection.json \
                                           -e tests/postman/test-environment.json \
                                           --reporters cli,junit \
                                           --reporter-junit-export newman-results.xml
                                '''
                            }
                        }
                        
                    } finally {
                        // Clean up test environment
                        sh 'docker-compose -f docker-compose.test.yml down -v'
                    }
                }
            }
            post {
                always {
                    // Publish integration test results
                    script {
                        if (fileExists('newman-results.xml')) {
                            junit 'newman-results.xml'
                        }
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    buildingTag()
                }
            }
            steps {
                script {
                    echo "📤 Pushing Docker images to registry..."
                    
                    // Login to Docker Hub
                    sh 'echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin'
                    
                    // Push images
                    sh "docker push ${DOCKER_HUB_REPO}-db:${BUILD_NUMBER}"
                    sh "docker push ${DOCKER_HUB_REPO}-db:latest"
                    
                    sh "docker push ${DOCKER_HUB_REPO}-backend:${BUILD_NUMBER}"
                    sh "docker push ${DOCKER_HUB_REPO}-backend:latest"
                    
                    sh "docker push ${DOCKER_HUB_REPO}-frontend:${BUILD_NUMBER}"
                    sh "docker push ${DOCKER_HUB_REPO}-frontend:latest"
                }
            }
            post {
                always {
                    // Logout from Docker Hub
                    sh 'docker logout'
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo "🚀 Deploying to staging environment..."
                    
                    // Deploy to staging server
                    sshagent(['staging-server-key']) {
                        sh '''
                            ssh -o StrictHostKeyChecking=no deploy@staging-server.com "
                                cd /opt/home-services &&
                                docker-compose -f docker-compose.staging.yml pull &&
                                docker-compose -f docker-compose.staging.yml up -d &&
                                docker system prune -f
                            "
                        '''
                    }
                    
                    // Wait for deployment to be ready
                    sh 'sleep 30'
                    
                    // Health check
                    script {
                        def healthCheck = sh(
                            script: 'curl -f http://staging-server.com/api/actuator/health',
                            returnStatus: true
                        )
                        
                        if (healthCheck != 0) {
                            error "Staging deployment health check failed!"
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🎯 Deploying to production environment..."
                    
                    // Manual approval for production deployment
                    timeout(time: 10, unit: 'MINUTES') {
                        input message: 'Deploy to production?', 
                              ok: 'Deploy',
                              submitterParameter: 'DEPLOYER'
                    }
                    
                    echo "Production deployment approved by: ${env.DEPLOYER}"
                    
                    // Create deployment backup
                    sshagent(['production-server-key']) {
                        sh '''
                            ssh -o StrictHostKeyChecking=no deploy@production-server.com "
                                cd /opt/home-services &&
                                docker-compose -f docker-compose.prod.yml exec -T database mysqldump -u root -p\$DB_ROOT_PASSWORD home_services_db > backup-\$(date +%Y%m%d-%H%M%S).sql
                            "
                        '''
                    }
                    
                    // Deploy to production
                    sshagent(['production-server-key']) {
                        sh '''
                            ssh -o StrictHostKeyChecking=no deploy@production-server.com "
                                cd /opt/home-services &&
                                docker-compose -f docker-compose.prod.yml pull &&
                                docker-compose -f docker-compose.prod.yml up -d &&
                                docker system prune -f
                            "
                        '''
                    }
                    
                    // Wait for deployment to be ready
                    sh 'sleep 60'
                    
                    // Production health check
                    script {
                        def healthCheck = sh(
                            script: 'curl -f http://production-server.com/api/actuator/health',
                            returnStatus: true
                        )
                        
                        if (healthCheck != 0) {
                            error "Production deployment health check failed!"
                        }
                    }
                    
                    echo "✅ Production deployment successful!"
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "🧹 Cleaning up workspace..."
                
                // Clean up Docker images
                sh '''
                    docker image prune -f
                    docker container prune -f
                '''
                
                // Archive logs
                archiveArtifacts artifacts: '**/*.log', allowEmptyArchive: true
            }
        }
        
        success {
            script {
                echo "✅ Pipeline completed successfully!"
                
                // Send success notification
                emailext (
                    subject: "✅ Home Services Build #${BUILD_NUMBER} - SUCCESS",
                    body: """
                        <h2>Build Successful! 🎉</h2>
                        <p><strong>Project:</strong> ${APP_NAME}</p>
                        <p><strong>Build Number:</strong> ${BUILD_NUMBER}</p>
                        <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                        <p><strong>Commit:</strong> ${GIT_COMMIT_SHORT} - ${env.GIT_COMMIT_MSG}</p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                        <p><strong>Build URL:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                    """,
                    to: "${EMAIL_RECIPIENTS}",
                    mimeType: 'text/html'
                )
                
                // Slack notification (if configured)
                script {
                    try {
                        slackSend(
                            channel: "${SLACK_CHANNEL}",
                            color: 'good',
                            message: "✅ Home Services Build #${BUILD_NUMBER} succeeded! Branch: ${env.BRANCH_NAME}, Commit: ${GIT_COMMIT_SHORT}"
                        )
                    } catch (Exception e) {
                        echo "Slack notification failed: ${e.getMessage()}"
                    }
                }
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline failed!"
                
                // Send failure notification
                emailext (
                    subject: "❌ Home Services Build #${BUILD_NUMBER} - FAILED",
                    body: """
                        <h2>Build Failed! ❌</h2>
                        <p><strong>Project:</strong> ${APP_NAME}</p>
                        <p><strong>Build Number:</strong> ${BUILD_NUMBER}</p>
                        <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                        <p><strong>Commit:</strong> ${GIT_COMMIT_SHORT} - ${env.GIT_COMMIT_MSG}</p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                        <p><strong>Build URL:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                        <p><strong>Console Output:</strong> <a href="${BUILD_URL}console">${BUILD_URL}console</a></p>
                    """,
                    to: "${EMAIL_RECIPIENTS}",
                    mimeType: 'text/html'
                )
                
                // Slack notification (if configured)
                script {
                    try {
                        slackSend(
                            channel: "${SLACK_CHANNEL}",
                            color: 'danger',
                            message: "❌ Home Services Build #${BUILD_NUMBER} failed! Branch: ${env.BRANCH_NAME}, Commit: ${GIT_COMMIT_SHORT}"
                        )
                    } catch (Exception e) {
                        echo "Slack notification failed: ${e.getMessage()}"
                    }
                }
            }
        }
        
        unstable {
            script {
                echo "⚠️ Pipeline completed with warnings!"
                
                // Send unstable notification
                emailext (
                    subject: "⚠️ Home Services Build #${BUILD_NUMBER} - UNSTABLE",
                    body: """
                        <h2>Build Unstable! ⚠️</h2>
                        <p><strong>Project:</strong> ${APP_NAME}</p>
                        <p><strong>Build Number:</strong> ${BUILD_NUMBER}</p>
                        <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                        <p><strong>Commit:</strong> ${GIT_COMMIT_SHORT} - ${env.GIT_COMMIT_MSG}</p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                        <p><strong>Build URL:</strong> <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                    """,
                    to: "${EMAIL_RECIPIENTS}",
                    mimeType: 'text/html'
                )
            }
        }
    }
}
