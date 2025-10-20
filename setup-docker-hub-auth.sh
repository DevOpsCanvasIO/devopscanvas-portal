#!/bin/bash

# Setup Docker Hub Authentication for GitHub Actions
# This script creates a secure Docker Hub authentication setup to avoid rate limits

set -e

echo "🐳 Setting up Docker Hub Authentication for GitHub Actions"
echo "========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) not found. Please install it:${NC}"
    echo "   brew install gh"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔐 Please authenticate with GitHub CLI:${NC}"
    gh auth login
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Explain the purpose
echo -e "${BLUE}📋 Why Docker Hub Authentication is Important:${NC}"
echo "   • Docker Hub has rate limits for anonymous pulls (100 pulls per 6 hours)"
echo "   • Authenticated users get 200 pulls per 6 hours (free account)"
echo "   • Pro accounts get unlimited pulls"
echo "   • This prevents build failures due to rate limiting"
echo ""

# Check current secrets
echo -e "${BLUE}🔍 Checking existing GitHub secrets...${NC}"
EXISTING_SECRETS=$(gh secret list --repo DevOpsCanvasIO/devopscanvas-portal --json name --jq '.[].name' 2>/dev/null || echo "")

DOCKER_HUB_USERNAME_EXISTS=false
DOCKER_HUB_TOKEN_EXISTS=false

if echo "$EXISTING_SECRETS" | grep -q "DOCKER_HUB_USERNAME"; then
    DOCKER_HUB_USERNAME_EXISTS=true
    echo -e "${GREEN}✅ DOCKER_HUB_USERNAME already exists${NC}"
fi

if echo "$EXISTING_SECRETS" | grep -q "DOCKER_HUB_TOKEN"; then
    DOCKER_HUB_TOKEN_EXISTS=true
    echo -e "${GREEN}✅ DOCKER_HUB_TOKEN already exists${NC}"
fi

# Determine if we need to set up credentials
SETUP_NEEDED=true
if [ "$DOCKER_HUB_USERNAME_EXISTS" = true ] && [ "$DOCKER_HUB_TOKEN_EXISTS" = true ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Docker Hub credentials already exist.${NC}"
    read -p "Do you want to update them? (y/N): " UPDATE_CREDS
    if [[ ! $UPDATE_CREDS =~ ^[Yy]$ ]]; then
        SETUP_NEEDED=false
    fi
fi

if [ "$SETUP_NEEDED" = true ]; then
    echo ""
    echo -e "${BLUE}🔧 Docker Hub Setup Options:${NC}"
    echo "   1. Use existing Docker Hub account"
    echo "   2. Create new Docker Hub account (recommended for CI/CD)"
    echo "   3. Skip setup (builds may fail due to rate limits)"
    echo ""
    
    read -p "Choose option (1-3): " SETUP_OPTION
    
    case $SETUP_OPTION in
        1|2)
            echo ""
            echo -e "${BLUE}📝 Docker Hub Account Setup:${NC}"
            
            if [ "$SETUP_OPTION" = "2" ]; then
                echo -e "${YELLOW}💡 For CI/CD, consider creating a dedicated Docker Hub account:${NC}"
                echo "   • Go to https://hub.docker.com/signup"
                echo "   • Create account like: devopscanvas-ci@yourdomain.com"
                echo "   • This keeps CI credentials separate from personal account"
                echo ""
            fi
            
            echo -e "${BLUE}🔑 Access Token Creation:${NC}"
            echo "   1. Go to https://hub.docker.com/settings/security"
            echo "   2. Click 'New Access Token'"
            echo "   3. Name: 'DevOpsCanvas-GitHub-Actions'"
            echo "   4. Permissions: 'Public Repo Read' (sufficient for pulling base images)"
            echo "   5. Copy the generated token (you won't see it again!)"
            echo ""
            
            # Get credentials
            read -p "Enter Docker Hub username: " DOCKER_HUB_USERNAME
            if [ -z "$DOCKER_HUB_USERNAME" ]; then
                echo -e "${RED}❌ Username cannot be empty${NC}"
                exit 1
            fi
            
            echo ""
            read -s -p "Enter Docker Hub access token: " DOCKER_HUB_TOKEN
            echo ""
            if [ -z "$DOCKER_HUB_TOKEN" ]; then
                echo -e "${RED}❌ Token cannot be empty${NC}"
                exit 1
            fi
            
            # Validate credentials by testing login
            echo ""
            echo -e "${BLUE}🧪 Testing Docker Hub credentials...${NC}"
            if echo "$DOCKER_HUB_TOKEN" | docker login --username "$DOCKER_HUB_USERNAME" --password-stdin > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Docker Hub credentials are valid${NC}"
                docker logout > /dev/null 2>&1
            else
                echo -e "${RED}❌ Invalid Docker Hub credentials. Please check and try again.${NC}"
                exit 1
            fi
            
            # Set GitHub secrets
            echo ""
            echo -e "${BLUE}🔐 Setting GitHub repository secrets...${NC}"
            
            echo "$DOCKER_HUB_USERNAME" | gh secret set DOCKER_HUB_USERNAME --repo DevOpsCanvasIO/devopscanvas-portal
            echo -e "${GREEN}✅ DOCKER_HUB_USERNAME set${NC}"
            
            echo "$DOCKER_HUB_TOKEN" | gh secret set DOCKER_HUB_TOKEN --repo DevOpsCanvasIO/devopscanvas-portal
            echo -e "${GREEN}✅ DOCKER_HUB_TOKEN set${NC}"
            
            echo ""
            echo -e "${GREEN}🎉 Docker Hub authentication configured successfully!${NC}"
            ;;
        3)
            echo ""
            echo -e "${YELLOW}⚠️  Skipping Docker Hub setup.${NC}"
            echo -e "${YELLOW}   Builds may encounter rate limits when pulling base images.${NC}"
            ;;
        *)
            echo -e "${RED}❌ Invalid option selected${NC}"
            exit 1
            ;;
    esac
else
    echo -e "${GREEN}✅ Docker Hub credentials already configured${NC}"
fi

# Show current secrets
echo ""
echo -e "${BLUE}📊 Current GitHub repository secrets:${NC}"
gh secret list --repo DevOpsCanvasIO/devopscanvas-portal

# Create a test workflow to verify the setup
echo ""
echo -e "${BLUE}🧪 Creating test workflow to verify Docker Hub authentication...${NC}"

cat > .github/workflows/test-docker-auth.yml << 'EOF'
name: Test Docker Hub Authentication

on:
  workflow_dispatch:

jobs:
  test-docker-auth:
    runs-on: ubuntu-latest
    steps:
    - name: Test Docker Hub Login
      if: secrets.DOCKER_HUB_USERNAME && secrets.DOCKER_HUB_TOKEN
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_HUB_USERNAME }}
        password: ${{ secrets.DOCKER_HUB_TOKEN }}
    
    - name: Test Base Image Pull
      run: |
        echo "🐳 Testing base image pull..."
        docker pull node:20-bookworm-slim
        echo "✅ Successfully pulled node:20-bookworm-slim"
    
    - name: Check Rate Limit Status
      run: |
        echo "📊 Checking Docker Hub rate limit status..."
        TOKEN=$(curl -s "https://auth.docker.io/token?service=registry.docker.io&scope=repository:ratelimitpreview/test:pull" | jq -r .token)
        curl -H "Authorization: Bearer $TOKEN" https://registry-1.docker.io/v2/ratelimitpreview/test/manifests/latest -I 2>/dev/null | grep -i ratelimit || echo "Rate limit headers not found"
    
    - name: Cleanup
      if: always()
      run: docker logout
EOF

echo -e "${GREEN}✅ Test workflow created: .github/workflows/test-docker-auth.yml${NC}"

# Provide next steps
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo ""
echo "1. Test the Docker Hub authentication:"
echo "   gh workflow run test-docker-auth.yml --repo DevOpsCanvasIO/devopscanvas-portal"
echo ""
echo "2. Monitor the test:"
echo "   gh run list --workflow='test-docker-auth.yml'"
echo ""
echo "3. Run the main build workflows:"
echo "   gh workflow run multi-registry-build.yml --repo DevOpsCanvasIO/devopscanvas-portal"
echo "   gh workflow run aws-ecr-deploy.yml --repo DevOpsCanvasIO/devopscanvas-portal"
echo ""
echo "4. Clean up test workflow (optional):"
echo "   rm .github/workflows/test-docker-auth.yml"
echo ""

# Show benefits
echo -e "${BLUE}✨ Benefits of Docker Hub Authentication:${NC}"
echo "   ✅ Avoid Docker Hub rate limits (200 pulls/6h vs 100 anonymous)"
echo "   ✅ More reliable builds"
echo "   ✅ Faster image pulls"
echo "   ✅ Better error messages if issues occur"
echo "   ✅ Optional: Push to Docker Hub registry"
echo ""

# Security notes
echo -e "${BLUE}🔒 Security Notes:${NC}"
echo "   • Access tokens are stored as encrypted GitHub secrets"
echo "   • Tokens have minimal permissions (Public Repo Read)"
echo "   • Tokens can be revoked anytime from Docker Hub settings"
echo "   • Consider using a dedicated CI/CD Docker Hub account"
echo ""

echo -e "${GREEN}🎉 Docker Hub authentication setup complete!${NC}"