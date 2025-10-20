#!/bin/bash

# Setup GitHub Actions for DevOpsCanvas Portal AWS Deployment
set -e

echo "🔧 Setting up GitHub Actions for DevOpsCanvas Portal"
echo "=================================================="

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Please install it:"
    echo "   brew install gh"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it:"
    echo "   brew install awscli"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "🔐 Please authenticate with GitHub CLI:"
    gh auth login
fi

echo "✅ Prerequisites check passed"
echo ""

# Get repository information
REPO_OWNER=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\).*/\1/')
REPO_NAME=$(basename $(git config --get remote.origin.url) .git)

echo "📋 Repository Information:"
echo "   Owner: $REPO_OWNER"
echo "   Name: $REPO_NAME"
echo ""

# Get AWS information
echo "🔍 Getting AWS account information..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo "   AWS Account ID: $AWS_ACCOUNT_ID"
echo "   AWS Region: $AWS_REGION"
echo ""

# Check if ECR repository exists
echo "🔍 Checking ECR repository..."
ECR_REPO_NAME="devopscanvas-portal"

if aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION &> /dev/null; then
    echo "✅ ECR repository '$ECR_REPO_NAME' exists"
else
    echo "📦 Creating ECR repository '$ECR_REPO_NAME'..."
    aws ecr create-repository \
        --repository-name $ECR_REPO_NAME \
        --region $AWS_REGION \
        --image-scanning-configuration scanOnPush=true
    echo "✅ ECR repository created"
fi

ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"
echo "   ECR URI: $ECR_URI"
echo ""

# Setup GitHub Secrets
echo "🔐 Setting up GitHub repository secrets..."

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3
    
    echo "   Setting $secret_name..."
    echo "$secret_value" | gh secret set "$secret_name"
    echo "     ✅ $description"
}

# AWS Credentials
echo "🔑 AWS Credentials Setup:"
echo "   You need to provide AWS credentials for GitHub Actions."
echo "   These should be for an IAM user with ECR and ECS permissions."
echo ""

read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -s -p "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
echo ""

set_secret "AWS_ACCESS_KEY_ID" "$AWS_ACCESS_KEY_ID" "AWS Access Key ID"
set_secret "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET_ACCESS_KEY" "AWS Secret Access Key"

# Docker Hub Credentials (optional)
echo ""
echo "🐳 Docker Hub Setup (optional):"
read -p "Enter Docker Hub username (or press Enter to skip): " DOCKER_HUB_USERNAME

if [ -n "$DOCKER_HUB_USERNAME" ]; then
    read -s -p "Enter Docker Hub token/password: " DOCKER_HUB_TOKEN
    echo ""
    
    set_secret "DOCKER_HUB_USERNAME" "$DOCKER_HUB_USERNAME" "Docker Hub Username"
    set_secret "DOCKER_HUB_TOKEN" "$DOCKER_HUB_TOKEN" "Docker Hub Token"
    echo "✅ Docker Hub credentials configured"
else
    echo "⏭️  Docker Hub setup skipped"
fi

echo ""
echo "✅ GitHub secrets configured successfully!"
echo ""

# Test AWS permissions
echo "🧪 Testing AWS permissions..."

echo "   Testing ECR access..."
if aws ecr get-login-password --region $AWS_REGION > /dev/null; then
    echo "   ✅ ECR access confirmed"
else
    echo "   ❌ ECR access failed"
fi

echo "   Testing ECS access..."
if aws ecs list-clusters --region $AWS_REGION > /dev/null; then
    echo "   ✅ ECS access confirmed"
else
    echo "   ❌ ECS access failed - this is OK if ECS cluster doesn't exist yet"
fi

echo ""

# Show workflow files
echo "📄 Available GitHub Actions workflows:"
ls -la .github/workflows/*.yml | awk '{print "   " $9}' | sed 's|.github/workflows/||'

echo ""
echo "🚀 Setup completed! You can now:"
echo ""
echo "1. Trigger a build manually:"
echo "   ./trigger-github-build.sh"
echo ""
echo "2. Push code to trigger automatic builds:"
echo "   git add ."
echo "   git commit -m 'Trigger GitHub Actions build'"
echo "   git push origin main"
echo ""
echo "3. Use workflow dispatch from GitHub UI:"
echo "   https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo ""

# Create a summary file
cat > github-actions-setup-summary.md << EOF
# GitHub Actions Setup Summary

## Repository Information
- **Repository**: $REPO_OWNER/$REPO_NAME
- **AWS Account**: $AWS_ACCOUNT_ID
- **AWS Region**: $AWS_REGION
- **ECR Repository**: $ECR_URI

## Configured Secrets
- ✅ AWS_ACCESS_KEY_ID
- ✅ AWS_SECRET_ACCESS_KEY
$([ -n "$DOCKER_HUB_USERNAME" ] && echo "- ✅ DOCKER_HUB_USERNAME" || echo "- ⏭️ DOCKER_HUB_USERNAME (skipped)")
$([ -n "$DOCKER_HUB_USERNAME" ] && echo "- ✅ DOCKER_HUB_TOKEN" || echo "- ⏭️ DOCKER_HUB_TOKEN (skipped)")

## Available Workflows
- **deploy.yml**: Original deployment workflow with keyless signing
- **container-build-keyless.yml**: Keyless container build workflow
- **aws-ecr-deploy.yml**: Enhanced ECR build and ECS deployment
- **multi-registry-build.yml**: Multi-registry build with testing

## Next Steps
1. Test build: \`./trigger-github-build.sh\`
2. Deploy infrastructure if not done: \`cd infra && terraform apply\`

## Useful Commands
\`\`\`bash
# Trigger build
./trigger-github-build.sh aws-ecr-deploy.yml

# Monitor workflows
gh run list

# View workflow logs
gh run view <run-id> --log
\`\`\`

Generated on: $(date)
EOF

echo "📄 Setup summary saved to: github-actions-setup-summary.md"
echo ""
echo "🎉 GitHub Actions setup completed successfully!"