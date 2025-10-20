#!/bin/bash

# Simple Docker Hub Credentials Update Script
set -e

echo "🔧 Docker Hub Credentials Update"
echo "================================"
echo ""

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it first."
    exit 1
fi

echo "📋 Instructions:"
echo "1. Go to https://hub.docker.com/settings/security"
echo "2. Create new access token with 'Read, Write, Delete' permissions"
echo "3. Copy the token and paste it below"
echo ""

# Get username
read -p "Enter Docker Hub username [jtcrump32msu]: " DOCKER_USERNAME
DOCKER_USERNAME=${DOCKER_USERNAME:-jtcrump32msu}

# Get token
echo ""
read -s -p "Enter Docker Hub access token (with Read, Write, Delete permissions): " DOCKER_TOKEN
echo ""

if [ -z "$DOCKER_TOKEN" ]; then
    echo "❌ Token cannot be empty"
    exit 1
fi

# Update secrets
echo ""
echo "🔐 Updating GitHub secrets..."

echo "$DOCKER_USERNAME" | gh secret set DOCKER_HUB_USERNAME --repo DevOpsCanvasIO/devopscanvas-portal
echo "✅ DOCKER_HUB_USERNAME updated"

echo "$DOCKER_TOKEN" | gh secret set DOCKER_HUB_TOKEN --repo DevOpsCanvasIO/devopscanvas-portal
echo "✅ DOCKER_HUB_TOKEN updated"

echo ""
echo "🧪 Testing credentials..."

# Test login
if echo "$DOCKER_TOKEN" | docker login --username "$DOCKER_USERNAME" --password-stdin > /dev/null 2>&1; then
    echo "✅ Docker Hub authentication successful"
    docker logout > /dev/null 2>&1
    
    echo ""
    echo "🚀 Ready to test! Run this command:"
    echo "gh workflow run devopscanvas-ci-cd.yml \\"
    echo "  --field deployment_target=build-only \\"
    echo "  --field registries=dockerhub"
else
    echo "❌ Docker Hub authentication failed"
    echo "Please check your credentials and try again"
    exit 1
fi

echo ""
echo "✅ Docker Hub credentials updated successfully!"