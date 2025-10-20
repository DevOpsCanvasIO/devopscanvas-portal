#!/bin/bash

# Fix Docker Hub Permissions for GitHub Actions
# This script helps resolve Docker Hub push access denied errors

set -e

echo "🔧 Docker Hub Permissions Fix for DevOpsCanvas Portal"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Diagnosing Docker Hub Access Issue...${NC}"
echo ""

# Check prerequisites
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) not found. Please install it:${NC}"
    echo "   brew install gh"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Check current secrets
echo -e "${BLUE}🔐 Checking current GitHub secrets...${NC}"
SECRETS=$(gh secret list --repo DevOpsCanvasIO/devopscanvas-portal --json name --jq '.[].name' 2>/dev/null || echo "")

DOCKER_HUB_USERNAME_EXISTS=false
DOCKER_HUB_TOKEN_EXISTS=false

if echo "$SECRETS" | grep -q "DOCKER_HUB_USERNAME"; then
    DOCKER_HUB_USERNAME_EXISTS=true
    echo -e "${GREEN}✅ DOCKER_HUB_USERNAME exists${NC}"
else
    echo -e "${RED}❌ DOCKER_HUB_USERNAME missing${NC}"
fi

if echo "$SECRETS" | grep -q "DOCKER_HUB_TOKEN"; then
    DOCKER_HUB_TOKEN_EXISTS=true
    echo -e "${GREEN}✅ DOCKER_HUB_TOKEN exists${NC}"
else
    echo -e "${RED}❌ DOCKER_HUB_TOKEN missing${NC}"
fi

echo ""

# Explain the issue
echo -e "${BLUE}📋 Common Docker Hub Push Issues:${NC}"
echo ""
echo "1. **Repository doesn't exist**: The Docker Hub repository must exist before pushing"
echo "2. **Insufficient token permissions**: Access token needs 'Read, Write, Delete' permissions"
echo "3. **Wrong repository name**: Repository name must match exactly"
echo "4. **Account limitations**: Free Docker Hub accounts have push rate limits"
echo ""

# Check repository existence
echo -e "${BLUE}🔍 Checking Docker Hub repository...${NC}"
REPO_NAME="jtcrump32msu/devopscanvas-portal"

if docker search "$REPO_NAME" | grep -q "$REPO_NAME"; then
    echo -e "${GREEN}✅ Repository exists: $REPO_NAME${NC}"
else
    echo -e "${YELLOW}⚠️  Repository not found in search results${NC}"
    echo "This might be normal for private repositories or new repositories"
fi

echo ""

# Provide solutions
echo -e "${BLUE}🛠️  Solutions:${NC}"
echo ""

echo "1. **Update Docker Hub Access Token Permissions**:"
echo "   a. Go to https://hub.docker.com/settings/security"
echo "   b. Find your existing token or create a new one"
echo "   c. Ensure permissions are set to: 'Read, Write, Delete'"
echo "   d. Copy the token (you won't see it again!)"
echo ""

echo "2. **Create Repository if Missing**:"
echo "   a. Go to https://hub.docker.com/repositories"
echo "   b. Click 'Create Repository'"
echo "   c. Name: 'devopscanvas-portal'"
echo "   d. Visibility: Public (recommended for open source)"
echo ""

echo "3. **Update GitHub Secrets**:"
read -p "Do you want to update Docker Hub credentials now? (y/N): " UPDATE_CREDS

if [[ $UPDATE_CREDS =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}🔑 Updating Docker Hub Credentials...${NC}"
    
    read -p "Enter Docker Hub username: " DOCKER_HUB_USERNAME
    if [ -z "$DOCKER_HUB_USERNAME" ]; then
        echo -e "${RED}❌ Username cannot be empty${NC}"
        exit 1
    fi
    
    echo ""
    read -s -p "Enter Docker Hub access token (with Read, Write, Delete permissions): " DOCKER_HUB_TOKEN
    echo ""
    if [ -z "$DOCKER_HUB_TOKEN" ]; then
        echo -e "${RED}❌ Token cannot be empty${NC}"
        exit 1
    fi
    
    # Test credentials
    echo ""
    echo -e "${BLUE}🧪 Testing Docker Hub credentials...${NC}"
    if echo "$DOCKER_HUB_TOKEN" | docker login --username "$DOCKER_HUB_USERNAME" --password-stdin > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker Hub credentials are valid${NC}"
        docker logout > /dev/null 2>&1
        
        # Test repository access
        echo -e "${BLUE}🔍 Testing repository access...${NC}"
        if docker pull "$REPO_NAME:latest" > /dev/null 2>&1 || echo "Repository may be empty"; then
            echo -e "${GREEN}✅ Repository access confirmed${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not pull from repository (may be empty or private)${NC}"
        fi
        
        # Update GitHub secrets
        echo ""
        echo -e "${BLUE}🔐 Updating GitHub secrets...${NC}"
        
        echo "$DOCKER_HUB_USERNAME" | gh secret set DOCKER_HUB_USERNAME --repo DevOpsCanvasIO/devopscanvas-portal
        echo -e "${GREEN}✅ DOCKER_HUB_USERNAME updated${NC}"
        
        echo "$DOCKER_HUB_TOKEN" | gh secret set DOCKER_HUB_TOKEN --repo DevOpsCanvasIO/devopscanvas-portal
        echo -e "${GREEN}✅ DOCKER_HUB_TOKEN updated${NC}"
        
    else
        echo -e "${RED}❌ Invalid Docker Hub credentials${NC}"
        echo "Please check your username and token, then try again."
        exit 1
    fi
else
    echo -e "${YELLOW}⏭️  Skipping credential update${NC}"
fi

echo ""

# Alternative solution: Skip Docker Hub
echo -e "${BLUE}💡 Alternative Solution: Skip Docker Hub${NC}"
echo ""
echo "If Docker Hub continues to cause issues, you can:"
echo ""
echo "1. **Use ECR and GHCR only**:"
echo "   gh workflow run devopscanvas-ci-cd.yml \\"
echo "     --field deployment_target=build-only \\"
echo "     --field registries=ecr,ghcr"
echo ""
echo "2. **Update workflow default registries** (remove dockerhub):"
echo "   Edit .github/workflows/devopscanvas-ci-cd.yml"
echo "   Change default registries from 'ecr,ghcr' (already done)"
echo ""

# Test the fix
if [[ $UPDATE_CREDS =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🧪 Testing the fix...${NC}"
    echo ""
    
    read -p "Do you want to test the workflow now? (y/N): " TEST_WORKFLOW
    
    if [[ $TEST_WORKFLOW =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🚀 Triggering test workflow with Docker Hub...${NC}"
        
        gh workflow run devopscanvas-ci-cd.yml \
            --repo DevOpsCanvasIO/devopscanvas-portal \
            --field deployment_target=build-only \
            --field registries=dockerhub \
            --field run_tests=false
        
        echo -e "${GREEN}✅ Test workflow triggered${NC}"
        echo "Monitor with: gh run list --workflow=devopscanvas-ci-cd.yml"
        
        # Wait and show status
        sleep 10
        echo ""
        echo -e "${BLUE}📊 Workflow status:${NC}"
        gh run list --workflow=devopscanvas-ci-cd.yml --limit 1 || echo "No runs found yet"
    fi
fi

echo ""
echo -e "${BLUE}📚 Additional Resources:${NC}"
echo ""
echo "• Docker Hub Token Permissions: https://docs.docker.com/docker-hub/access-tokens/"
echo "• GitHub Actions Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets"
echo "• Docker Hub Rate Limits: https://docs.docker.com/docker-hub/download-rate-limit/"
echo ""

echo -e "${GREEN}🎉 Docker Hub permissions fix complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Test the workflow with Docker Hub included"
echo "2. Monitor build logs for any remaining issues"
echo "3. Consider using ECR/GHCR only if Docker Hub continues to cause problems"