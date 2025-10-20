#!/bin/bash

# Migration Script: Transition to Consolidated DevOpsCanvas CI/CD Workflow
# This script helps migrate from multiple individual workflows to the new consolidated workflow

set -e

echo "🚀 DevOpsCanvas Portal - Workflow Migration Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f ".github/workflows/devopscanvas-ci-cd.yml" ]; then
    echo -e "${RED}❌ Error: devopscanvas-ci-cd.yml not found${NC}"
    echo "Please run this script from the repository root where the new workflow exists."
    exit 1
fi

echo -e "${BLUE}📋 Migration Overview:${NC}"
echo "This script will:"
echo "  1. Backup existing workflows"
echo "  2. Validate the new consolidated workflow"
echo "  3. Test the new workflow"
echo "  4. Provide migration guidance"
echo ""

# Step 1: Backup existing workflows
echo -e "${BLUE}📦 Step 1: Backing up existing workflows...${NC}"

# Create backup directory
BACKUP_DIR=".github/workflows/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# List of old workflows to backup
OLD_WORKFLOWS=(
    "aws-ecr-deploy.yml"
    "multi-registry-build.yml"
    "deploy.yml"
    "container-build-keyless.yml"
    "test-docker-auth.yml"
)

BACKED_UP_COUNT=0
for workflow in "${OLD_WORKFLOWS[@]}"; do
    if [ -f ".github/workflows/$workflow" ]; then
        mv ".github/workflows/$workflow" "$BACKUP_DIR/"
        echo -e "${GREEN}✅ Backed up: $workflow${NC}"
        ((BACKED_UP_COUNT++))
    else
        echo -e "${YELLOW}⚠️  Not found: $workflow${NC}"
    fi
done

if [ $BACKED_UP_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Backed up $BACKED_UP_COUNT workflows to: $BACKUP_DIR${NC}"
else
    echo -e "${YELLOW}⚠️  No old workflows found to backup${NC}"
fi

echo ""

# Step 2: Validate new workflow
echo -e "${BLUE}🔍 Step 2: Validating new consolidated workflow...${NC}"

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI available${NC}"
    
    # Validate workflow syntax
    if gh workflow list | grep -q "DevOpsCanvas Portal - Complete CI/CD Pipeline"; then
        echo -e "${GREEN}✅ New workflow detected by GitHub${NC}"
    else
        echo -e "${YELLOW}⚠️  New workflow not yet detected by GitHub (may need to push changes)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI not available - skipping workflow validation${NC}"
fi

# Check required secrets
echo -e "${BLUE}🔐 Checking required secrets...${NC}"

if command -v gh &> /dev/null; then
    SECRETS=$(gh secret list --json name --jq '.[].name' 2>/dev/null || echo "")
    
    # Required secrets
    REQUIRED_SECRETS=("AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY")
    OPTIONAL_SECRETS=("DOCKER_HUB_USERNAME" "DOCKER_HUB_TOKEN")
    
    for secret in "${REQUIRED_SECRETS[@]}"; do
        if echo "$SECRETS" | grep -q "$secret"; then
            echo -e "${GREEN}✅ Required secret: $secret${NC}"
        else
            echo -e "${RED}❌ Missing required secret: $secret${NC}"
        fi
    done
    
    for secret in "${OPTIONAL_SECRETS[@]}"; do
        if echo "$SECRETS" | grep -q "$secret"; then
            echo -e "${GREEN}✅ Optional secret: $secret${NC}"
        else
            echo -e "${YELLOW}⚠️  Optional secret missing: $secret (Docker Hub rate limits may apply)${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  Cannot check secrets without GitHub CLI${NC}"
fi

echo ""

# Step 3: Test new workflow
echo -e "${BLUE}🧪 Step 3: Testing new consolidated workflow...${NC}"

read -p "Do you want to test the new workflow now? (y/N): " TEST_WORKFLOW

if [[ $TEST_WORKFLOW =~ ^[Yy]$ ]]; then
    if command -v gh &> /dev/null; then
        echo -e "${BLUE}🚀 Triggering test build (build-only mode)...${NC}"
        
        # Trigger a safe build-only test
        gh workflow run devopscanvas-ci-cd.yml \
            --field deployment_target=build-only \
            --field registries=ghcr \
            --field run_tests=false
        
        echo -e "${GREEN}✅ Test workflow triggered${NC}"
        echo "Monitor progress with: gh run list --workflow=devopscanvas-ci-cd.yml"
        echo ""
        
        # Wait a moment and show status
        sleep 5
        echo -e "${BLUE}📊 Current workflow status:${NC}"
        gh run list --workflow=devopscanvas-ci-cd.yml --limit 3 || echo "No runs found yet"
    else
        echo -e "${RED}❌ Cannot trigger workflow without GitHub CLI${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipping workflow test${NC}"
fi

echo ""

# Step 4: Migration guidance
echo -e "${BLUE}📚 Step 4: Migration Guidance${NC}"
echo ""

echo -e "${GREEN}🎉 Migration Steps Completed!${NC}"
echo ""

echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""

echo "1. **Commit and Push Changes:**"
echo "   git add ."
echo "   git commit -m 'feat: consolidate CI/CD workflows into single pipeline'"
echo "   git push origin main"
echo ""

echo "2. **Test Different Deployment Modes:**"
echo "   # Build only"
echo "   gh workflow run devopscanvas-ci-cd.yml --field deployment_target=build-only"
echo ""
echo "   # AWS ECS deployment"
echo "   gh workflow run devopscanvas-ci-cd.yml --field deployment_target=aws-ecs"
echo ""
echo "   # GitOps deployment"
echo "   gh workflow run devopscanvas-ci-cd.yml --field deployment_target=gitops-pr"
echo ""
echo "   # Full deployment (ECS + GitOps)"
echo "   gh workflow run devopscanvas-ci-cd.yml --field deployment_target=full-deploy"
echo ""

echo "3. **Configure Missing Secrets (if needed):**
if ! echo "$SECRETS" | grep -q "DOCKER_HUB_USERNAME" 2>/dev/null; then
    echo "   # Configure Docker Hub authentication to avoid rate limits"
    echo "   ./setup-docker-hub-auth.sh"
    echo ""
fi

echo "4. **Update Documentation:**"
echo "   - Update README.md with new workflow instructions"
echo "   - Update deployment guides and runbooks"
echo "   - Notify team members of the new workflow"
echo ""

echo "5. **Monitor First Production Deployment:**"
echo "   # Watch the workflow execution"
echo "   gh run watch \$(gh run list --workflow=devopscanvas-ci-cd.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
echo ""

# Show workflow comparison
echo -e "${BLUE}📊 Workflow Comparison:${NC}"
echo ""
echo "| Feature | Old Workflows | New Consolidated Workflow |"
echo "|---------|---------------|---------------------------|"
echo "| Files | 5 separate files | 1 unified file ✅ |"
echo "| Multi-registry | Separate workflows | Single workflow ✅ |"
echo "| Security scanning | Limited | Comprehensive ✅ |"
echo "| Keyless signing | Separate workflow | Integrated ✅ |"
echo "| Deployment options | Fixed | Flexible ✅ |"
echo "| Rate limit handling | Basic | Advanced ✅ |"
echo "| Error handling | Basic | Comprehensive ✅ |"
echo "| Documentation | Scattered | Centralized ✅ |"
echo ""

# Show backup information
if [ $BACKED_UP_COUNT -gt 0 ]; then
    echo -e "${BLUE}💾 Backup Information:${NC}"
    echo "Old workflows have been backed up to: $BACKUP_DIR"
    echo "You can restore them if needed:"
    echo "  mv $BACKUP_DIR/* .github/workflows/"
    echo ""
    echo "Or permanently remove them after successful migration:"
    echo "  rm -rf $BACKUP_DIR"
    echo ""
fi

# Show useful commands
echo -e "${BLUE}🛠️  Useful Commands:${NC}"
echo ""
echo "# Monitor workflow runs"
echo "gh run list --workflow=devopscanvas-ci-cd.yml"
echo ""
echo "# View specific run details"
echo "gh run view <run-id>"
echo ""
echo "# View workflow logs"
echo "gh run view <run-id> --log"
echo ""
echo "# List available workflows"
echo "gh workflow list"
echo ""

# Final status
echo -e "${GREEN}🎉 Migration Complete!${NC}"
echo ""
echo -e "${BLUE}The DevOpsCanvas Portal now uses a single, comprehensive CI/CD workflow that provides:${NC}"
echo "✅ Multi-registry container builds (ECR, GHCR, Docker Hub)"
echo "✅ Flexible deployment options (ECS, GitOps, or both)"
echo "✅ Comprehensive security scanning and keyless signing"
echo "✅ Docker Hub rate limit prevention"
echo "✅ Detailed logging and status reporting"
echo "✅ Easy troubleshooting and maintenance"
echo ""

echo -e "${BLUE}📖 For detailed usage instructions, see:${NC}"
echo "- CONSOLIDATED_WORKFLOW_GUIDE.md"
echo "- .github/workflows/devopscanvas-ci-cd.yml"
echo ""

echo -e "${GREEN}Happy deploying! 🚀${NC}"