#!/bin/bash

# Trigger GitHub Actions build for DevOpsCanvas Portal
set -e

echo "🚀 Triggering GitHub Actions Build for DevOpsCanvas Portal"
echo "=========================================================="

# Configuration
REPO_OWNER=${GITHUB_REPOSITORY_OWNER:-$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\).*/\1/')}
REPO_NAME=${GITHUB_REPOSITORY_NAME:-$(basename $(git config --get remote.origin.url) .git)}
WORKFLOW_FILE=${1:-"aws-ecr-deploy.yml"}
AWS_REGION=${AWS_REGION:-"us-east-1"}

echo "📋 Configuration:"
echo "   Repository: $REPO_OWNER/$REPO_NAME"
echo "   Workflow: $WORKFLOW_FILE"
echo "   AWS Region: $AWS_REGION"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Please install it:"
    echo "   brew install gh"
    echo "   or visit: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 Please authenticate with GitHub CLI:"
    gh auth login
fi

echo "🔍 Available workflows:"
gh workflow list

echo ""
echo "🚀 Triggering workflow: $WORKFLOW_FILE"

# Trigger the workflow based on the workflow file
case $WORKFLOW_FILE in
    "aws-ecr-deploy.yml")
        gh workflow run $WORKFLOW_FILE \
            --field aws_region="$AWS_REGION" \
            --field environment="production" \
            --field force_deploy="true"
        ;;
    "multi-registry-build.yml")
        gh workflow run $WORKFLOW_FILE \
            --field registries="ecr,dockerhub,ghcr" \
            --field aws_region="$AWS_REGION"
        ;;
    "deploy.yml")
        gh workflow run $WORKFLOW_FILE
        ;;
    "container-build-keyless.yml")
        gh workflow run $WORKFLOW_FILE
        ;;
    *)
        gh workflow run $WORKFLOW_FILE
        ;;
esac

# Wait a moment for the workflow to start
sleep 5

# Get the most recent workflow run
WORKFLOW_RUN_ID=$(gh run list --workflow="$WORKFLOW_FILE" --limit=1 --json databaseId --jq '.[0].databaseId')

if [ -n "$WORKFLOW_RUN_ID" ]; then
    echo "✅ Workflow triggered successfully!"
    echo "   Run ID: $WORKFLOW_RUN_ID"
    echo "   URL: https://github.com/$REPO_OWNER/$REPO_NAME/actions/runs/$WORKFLOW_RUN_ID"
    echo ""
    
    echo "⏳ Monitoring workflow progress..."
    echo "   (Press Ctrl+C to stop monitoring, workflow will continue)"
    
    # Monitor the workflow
    gh run watch $WORKFLOW_RUN_ID --exit-status
    
    echo ""
    echo "📊 Workflow completed! Getting final status..."
    
    # Get final status
    WORKFLOW_STATUS=$(gh run view $WORKFLOW_RUN_ID --json status,conclusion --jq '.conclusion // .status')
    
    case $WORKFLOW_STATUS in
        "success")
            echo "✅ Build and deployment completed successfully!"
            
            # Get workflow outputs/artifacts
            echo ""
            echo "📦 Checking for build artifacts..."
            gh run view $WORKFLOW_RUN_ID --json jobs --jq '.jobs[] | select(.name | contains("build")) | .steps[] | select(.conclusion == "success") | .name'
            
            echo ""
            echo "🌐 Your DevOpsCanvas Portal should be available at:"
            echo "   Check the workflow summary for the exact URL"
            ;;
        "failure")
            echo "❌ Workflow failed!"
            echo ""
            echo "📋 Failed jobs:"
            gh run view $WORKFLOW_RUN_ID --json jobs --jq '.jobs[] | select(.conclusion == "failure") | .name'
            
            echo ""
            echo "🔍 To debug, check the workflow logs:"
            echo "   gh run view $WORKFLOW_RUN_ID --log-failed"
            ;;
        "cancelled")
            echo "⏹️  Workflow was cancelled"
            ;;
        *)
            echo "⏳ Workflow status: $WORKFLOW_STATUS"
            ;;
    esac
else
    echo "❌ Failed to get workflow run ID"
    echo ""
    echo "🔍 Manual steps:"
    echo "   1. Go to: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
    echo "   2. Select the '$WORKFLOW_FILE' workflow"
    echo "   3. Click 'Run workflow'"
    echo "   4. Configure parameters and run"
fi

echo ""
echo "📋 Available workflows for manual triggering:"
echo "   1. aws-ecr-deploy.yml - Enhanced ECR build and ECS deployment"
echo "   2. multi-registry-build.yml - Multi-registry build with testing"
echo "   3. deploy.yml - Original deployment workflow with keyless signing"
echo "   4. container-build-keyless.yml - Keyless container build workflow"
echo ""
echo "💡 Usage examples:"
echo "   ./trigger-github-build.sh aws-ecr-deploy.yml"
echo "   ./trigger-github-build.sh multi-registry-build.yml"
echo ""