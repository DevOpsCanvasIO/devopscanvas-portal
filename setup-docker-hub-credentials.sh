#!/bin/bash

# Setup Docker Hub Credentials for GitHub Actions
# This helps avoid Docker Hub rate limits during builds

set -e

echo "🐳 Setting up Docker Hub credentials for GitHub Actions"
echo "======================================================"

# Check prerequisites
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Please install it:"
    echo "   brew install gh"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "🔐 Please authenticate with GitHub CLI:"
    gh auth login
fi

echo "ℹ️  Docker Hub credentials help avoid rate limits when pulling base images"
echo "   during GitHub Actions builds. This is optional but recommended."
echo ""

# Check if secrets already exist
echo "🔍 Checking existing secrets..."
EXISTING_SECRETS=$(gh secret list --repo DevOpsCanvasIO/devopscanvas-portal --json name --jq '.[].name')

if echo "$EXISTING_SECRETS" | grep -q "DOCKER_HUB_USERNAME"; then
    echo "✅ DOCKER_HUB_USERNAME already exists"
    read -p "Do you want to update it? (y/N): " UPDATE_USERNAME
    if [[ $UPDATE_USERNAME =~ ^[Yy]$ ]]; then
        UPDATE_DOCKER_HUB=true
    else
        UPDATE_DOCKER_HUB=false
    fi
else
    UPDATE_DOCKER_HUB=true
fi

if [[ $UPDATE_DOCKER_HUB == true ]]; then
    echo ""
    echo "📝 Docker Hub Setup:"
    echo "   1. Go to https://hub.docker.com/settings/security"
    echo "   2. Create a new Access Token with 'Public Repo Read' permissions"
    echo "   3. Enter your Docker Hub username and token below"
    echo ""

    read -p "Enter Docker Hub username: " DOCKER_HUB_USERNAME
    if [ -z "$DOCKER_HUB_USERNAME" ]; then
        echo "❌ Username cannot be empty"
        exit 1
    fi

    read -s -p "Enter Docker Hub access token: " DOCKER_HUB_TOKEN
    echo ""
    if [ -z "$DOCKER_HUB_TOKEN" ]; then
        echo "❌ Token cannot be empty"
        exit 1
    fi

    echo ""
    echo "🔐 Setting GitHub secrets..."
    
    echo "$DOCKER_HUB_USERNAME" | gh secret set DOCKER_HUB_USERNAME --repo DevOpsCanvasIO/devopscanvas-portal
    echo "✅ DOCKER_HUB_USERNAME set"
    
    echo "$DOCKER_HUB_TOKEN" | gh secret set DOCKER_HUB_TOKEN --repo DevOpsCanvasIO/devopscanvas-portal
    echo "✅ DOCKER_HUB_TOKEN set"
    
    echo ""
    echo "🎉 Docker Hub credentials configured successfully!"
    echo ""
    echo "Benefits:"
    echo "  ✅ Avoid Docker Hub rate limits during builds"
    echo "  ✅ Enable pushing to Docker Hub registry (optional)"
    echo "  ✅ Faster and more reliable builds"
else
    echo "⏭️  Skipping Docker Hub credential update"
fi

echo ""
echo "📊 Current GitHub secrets:"
gh secret list --repo DevOpsCanvasIO/devopscanvas-portal

echo ""
echo "🚀 Next steps:"
echo "  1. Test the build: gh workflow run multi-registry-build.yml"
echo "  2. Monitor progress: gh run list"
echo "  3. View logs: gh run view <run-id> --log"

echo ""
echo "💡 Note: Docker Hub credentials are optional. Builds will work without them"
echo "   but may be slower due to rate limits on anonymous pulls."