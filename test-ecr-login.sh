#!/bin/bash

# Test ECR Login Script for DevOpsCanvas Portal
set -e

echo "🔐 Testing ECR Login for DevOpsCanvas Portal"
echo "============================================="

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPOSITORY="devopscanvas-portal"

# Get AWS Account ID
echo "🔍 Getting AWS Account ID..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

echo "   AWS Account ID: $AWS_ACCOUNT_ID"
echo "   ECR Registry: $ECR_URI"
echo "   Repository: $ECR_REPOSITORY"
echo ""

# Test ECR login using secure password-stdin method
echo "🔐 Testing ECR login with password-stdin..."
if aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI; then
    echo "✅ ECR login successful!"
else
    echo "❌ ECR login failed!"
    exit 1
fi

# Test ECR repository access
echo ""
echo "📦 Testing ECR repository access..."
if aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION > /dev/null 2>&1; then
    echo "✅ ECR repository '$ECR_REPOSITORY' is accessible"
    
    # List recent images
    echo ""
    echo "🖼️  Recent images in repository:"
    aws ecr describe-images \
        --repository-name $ECR_REPOSITORY \
        --region $AWS_REGION \
        --query 'imageDetails[*].{Tags:imageTags[0],Pushed:imagePushedAt,Size:imageSizeInBytes}' \
        --output table \
        --max-items 5 || echo "   No images found in repository"
else
    echo "❌ ECR repository '$ECR_REPOSITORY' not found or not accessible"
    echo ""
    echo "💡 To create the repository:"
    echo "   aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION"
fi

echo ""
echo "🎯 ECR Login Test Complete!"
echo ""
echo "📋 For GitHub Actions, use this secure login method:"
echo "   aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI"
echo ""
echo "🚫 Avoid this insecure method:"
echo "   docker login -u AWS -p \$(aws ecr get-login-password --region $AWS_REGION) $ECR_URI"