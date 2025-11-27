#!/bin/bash

# Jenkins Setup Script for Home Services Application
set -e

echo "🔧 Setting up Jenkins for Home Services Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Jenkins is running
if ! curl -s http://localhost:8080/jenkins > /dev/null; then
    print_error "Jenkins is not running on localhost:8080"
    print_error "Please install and start Jenkins first"
    exit 1
fi

print_step "1. Installing required Jenkins plugins..."

# List of required plugins
PLUGINS=(
    "git"
    "pipeline-stage-view"
    "docker-workflow"
    "docker-plugin"
    "nodejs"
    "maven-plugin"
    "junit"
    "jacoco"
    "htmlpublisher"
    "email-ext"
    "slack"
    "ssh-agent"
    "credentials-binding"
    "pipeline-utility-steps"
    "build-timeout"
    "timestamper"
    "ws-cleanup"
)

for plugin in "${PLUGINS[@]}"; do
    print_status "Installing plugin: $plugin"
    # Note: This would typically be done through Jenkins CLI or REST API
    echo "  - $plugin (install manually through Jenkins UI)"
done

print_step "2. Setting up Jenkins credentials..."

print_status "Please create the following credentials in Jenkins:"
echo "  - docker-hub-credentials (Username/Password)"
echo "  - database-credentials (Username/Password)"
echo "  - tomcat-server-credentials (Username/Password)"
echo "  - staging-server-key (SSH Private Key)"
echo "  - production-server-key (SSH Private Key)"

print_step "3. Setting up Jenkins tools..."

print_status "Please configure the following tools in Jenkins Global Tool Configuration:"
echo "  - JDK-17: OpenJDK 17"
echo "  - Maven-3.9.0: Apache Maven 3.9.0"
echo "  - NodeJS-18: NodeJS 18.x"

print_step "4. Creating Jenkins job..."

print_status "Creating Multibranch Pipeline job..."

# Create job configuration XML
cat > jenkins-job-config.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject plugin="workflow-multibranch@2.26">
  <actions/>
  <description>Home Services Booking Application CI/CD Pipeline</description>
  <properties>
    <org.jenkinsci.plugins.pipeline.modeldefinition.config.GlobalConfig_-GlobalConfigurationCategory plugin="pipeline-model-definition@2.2118">
      <dockerLabel></dockerLabel>
      <registry plugin="docker-commons@1.19"/>
    </org.jenkinsci.plugins.pipeline.modeldefinition.config.GlobalConfig_-GlobalConfigurationCategory>
  </properties>
  <folderViews class="jenkins.branch.MultiBranchProjectViewHolder" plugin="branch-api@2.1046.v0ca_37783ecc5">
    <owner class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject" reference="../.."/>
  </folderViews>
  <healthMetrics>
    <com.cloudbees.hudson.plugins.folder.health.WorstChildHealthMetric plugin="cloudbees-folder@6.758.vfd75d09eea_a_1">
      <nonRecursive>false</nonRecursive>
    </com.cloudbees.hudson.plugins.folder.health.WorstChildHealthMetric>
  </healthMetrics>
  <icon class="jenkins.branch.MetadataActionFolderIcon" plugin="branch-api@2.1046.v0ca_37783ecc5">
    <owner class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject" reference="../.."/>
  </icon>
  <orphanedItemStrategy class="com.cloudbees.hudson.plugins.folder.computed.DefaultOrphanedItemStrategy" plugin="cloudbees-folder@6.758.vfd75d09eea_a_1">
    <pruneDeadBranches>true</pruneDeadBranches>
    <daysToKeep>-1</daysToKeep>
    <numToKeep>-1</numToKeep>
    <abortBuilds>false</abortBuilds>
  </orphanedItemStrategy>
  <triggers>
    <com.cloudbees.hudson.plugins.folder.computed.PeriodicFolderTrigger plugin="cloudbees-folder@6.758.vfd75d09eea_a_1">
      <spec>H/15 * * * *</spec>
      <interval>900000</interval>
    </com.cloudbees.hudson.plugins.folder.computed.PeriodicFolderTrigger>
  </triggers>
  <disabled>false</disabled>
  <sources class="jenkins.branch.MultiBranchProject$BranchSourceList" plugin="branch-api@2.1046.v0ca_37783ecc5">
    <data>
      <jenkins.plugins.git.GitSCMSource plugin="git@4.8.3">
        <id>home-services-repo</id>
        <remote>https://github.com/your-username/home-services-app.git</remote>
        <credentialsId>github-credentials</credentialsId>
        <traits>
          <jenkins.plugins.git.traits.BranchDiscoveryTrait/>
          <jenkins.plugins.git.traits.OriginPullRequestDiscoveryTrait>
            <strategyId>1</strategyId>
          </jenkins.plugins.git.traits.OriginPullRequestDiscoveryTrait>
          <jenkins.plugins.git.traits.ForkPullRequestDiscoveryTrait>
            <strategyId>1</strategyId>
            <trust class="jenkins.plugins.git.traits.ForkPullRequestDiscoveryTrait$TrustPermission"/>
          </jenkins.plugins.git.traits.ForkPullRequestDiscoveryTrait>
        </traits>
      </jenkins.plugins.git.GitSCMSource>
    </data>
    <owner class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject" reference="../.."/>
  </sources>
  <factory class="org.jenkinsci.plugins.workflow.multibranch.WorkflowBranchProjectFactory">
    <owner class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject" reference="../.."/>
    <scriptPath>Jenkinsfile</scriptPath>
  </factory>
</org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject>
EOF

print_status "Job configuration created: jenkins-job-config.xml"
print_status "Import this configuration through Jenkins UI or CLI"

print_step "5. Setting up webhook..."

print_status "Configure GitHub webhook:"
echo "  - URL: http://your-jenkins-server:8080/github-webhook/"
echo "  - Content type: application/json"
echo "  - Events: Push, Pull requests"

print_step "6. Environment setup..."

print_status "Create environment files:"
echo "  - .env.staging (for staging environment)"
echo "  - .env.prod (for production environment)"

print_warning "Security recommendations:"
echo "  - Use Jenkins credentials for all sensitive data"
echo "  - Enable CSRF protection"
echo "  - Configure proper user authentication"
echo "  - Use HTTPS for Jenkins access"
echo "  - Regularly update Jenkins and plugins"

print_status "✅ Jenkins setup guide completed!"
print_status "Please complete the manual steps mentioned above."
