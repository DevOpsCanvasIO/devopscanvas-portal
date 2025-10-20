# 🚀 DevOpsCanvas Portal - Consolidated CI/CD Workflow Guide

## 📋 **Overview**

This document describes the new consolidated GitHub Actions workflow that replaces all previous individual workflows with a single, comprehensive CI/CD pipeline for the DevOpsCanvas Portal.

## 🔄 **Workflow Consolidation**

### **Previous Workflows (Replaced):**
- ❌ `aws-ecr-deploy.yml` - AWS ECR build and ECS deployment
- ❌ `multi-registry-build.yml` - Multi-registry container builds
- ❌ `deploy.yml` - Main deployment with GitOps
- ❌ `container-build-keyless.yml` - Keyless signing workflow
- ❌ `test-docker-auth.yml` - Docker Hub authentication test

### **New Consolidated Workflow:**
- ✅ `devopscanvas-ci-cd.yml` - Complete CI/CD pipeline with all features

## 🎯 **Key Features**

### **🔧 Comprehensive Build Pipeline**
- **Multi-Registry Support**: ECR, GitHub Container Registry (GHCR), Docker Hub
- **Platform Support**: linux/amd64 (configurable)
- **Caching**: GitHub Actions cache for faster builds
- **Security**: Trivy vulnerability scanning, keyless signing with Cosign
- **Attestations**: SBOM (Software Bill of Materials) and provenance

### **🚀 Flexible Deployment Options**
- **Build Only**: Just build and push container images
- **AWS ECS**: Direct deployment to AWS ECS with health checks
- **GitOps**: Create pull requests for GitOps-based deployments
- **Full Deploy**: Both ECS and GitOps deployment

### **🔒 Security & Compliance**
- **Docker Hub Rate Limit Prevention**: Automatic authentication
- **Keyless Container Signing**: Cosign signatures for supply chain security
- **Vulnerability Scanning**: Trivy security scans with SARIF upload
- **Secure Secrets Management**: Encrypted GitHub secrets

### **🧪 Testing Integration**
- **Optional Testing**: Can be enabled via workflow inputs or for PRs
- **TypeScript Compilation**: Type checking and linting
- **Build Validation**: Backend and frontend build verification

## 📝 **Workflow Configuration**

### **Trigger Events**

```yaml
on:
  push:
    branches: [ main, develop ]    # Automatic builds
    tags: [ 'v*' ]                # Release builds
  pull_request:
    branches: [ main ]            # PR validation
  workflow_dispatch:              # Manual execution
```

### **Manual Workflow Inputs**

| Input | Description | Options | Default |
|-------|-------------|---------|---------|
| `deployment_target` | What to deploy | `build-only`, `aws-ecs`, `gitops-pr`, `full-deploy` | `build-only` |
| `registries` | Target registries | `ecr`, `ghcr`, `dockerhub`, combinations | `ecr,ghcr` |
| `aws_region` | AWS region | `us-east-1`, `us-west-2`, `eu-west-1`, `ap-southeast-1` | `us-east-1` |
| `environment` | Deployment env | `development`, `staging`, `production` | `production` |
| `force_deploy` | Skip health checks | `true`, `false` | `false` |
| `run_tests` | Run tests | `true`, `false` | `false` |

## 🏗️ **Pipeline Jobs**

### **1. Test Job (Optional)**
```yaml
Triggers: PR builds, manual with run_tests=true
Duration: ~5-10 minutes
Actions:
  - Install dependencies
  - TypeScript type checking
  - Code linting
  - Backend build
  - Frontend build
```

### **2. Build & Push Job (Core)**
```yaml
Triggers: Always (after tests pass/skip)
Duration: ~15-25 minutes
Actions:
  - Docker Hub authentication (rate limit prevention)
  - Multi-registry authentication (ECR, GHCR, Docker Hub)
  - Container image build with Buildx
  - Push to selected registries
  - Security scanning with Trivy
  - Keyless signing with Cosign
  - SBOM and provenance generation
```

### **3. AWS ECS Deploy Job (Conditional)**
```yaml
Triggers: 
  - Manual: deployment_target = aws-ecs or full-deploy
  - Automatic: Push to main branch
Conditions: ECR image available
Duration: ~5-10 minutes
Actions:
  - Update ECS task definition
  - Deploy to ECS cluster
  - Wait for deployment stability
  - Health check validation
```

### **4. GitOps Deploy Job (Conditional)**
```yaml
Triggers:
  - Manual: deployment_target = gitops-pr or full-deploy  
  - Automatic: Push to main branch
Duration: ~2-5 minutes
Actions:
  - Checkout GitOps repository
  - Update image tags in manifests
  - Create pull request for deployment
```

### **5. Cleanup Job (Always)**
```yaml
Triggers: Always (after all jobs complete)
Duration: ~1 minute
Actions:
  - Docker logout from all registries
  - Generate final pipeline summary
```

## 🔐 **Required Secrets**

### **AWS Secrets (Required for ECR/ECS)**
```bash
AWS_ACCESS_KEY_ID      # AWS access key
AWS_SECRET_ACCESS_KEY  # AWS secret key
```

### **Docker Hub Secrets (Optional, for rate limit prevention)**
```bash
DOCKER_HUB_USERNAME    # Docker Hub username
DOCKER_HUB_TOKEN       # Docker Hub access token
```

### **GitHub Secrets (Automatic)**
```bash
GITHUB_TOKEN          # Automatically provided by GitHub
```

## 🚀 **Usage Examples**

### **1. Build Only (Default)**
```bash
# Manual trigger - just build and push images
gh workflow run devopscanvas-ci-cd.yml \
  --field deployment_target=build-only \
  --field registries=ecr,ghcr
```

### **2. Full AWS ECS Deployment**
```bash
# Deploy to AWS ECS in us-east-1
gh workflow run devopscanvas-ci-cd.yml \
  --field deployment_target=aws-ecs \
  --field aws_region=us-east-1 \
  --field environment=production
```

### **3. GitOps Deployment**
```bash
# Create GitOps PR for deployment
gh workflow run devopscanvas-ci-cd.yml \
  --field deployment_target=gitops-pr \
  --field registries=ghcr
```

### **4. Complete Pipeline with Testing**
```bash
# Full pipeline: test, build, deploy to ECS and GitOps
gh workflow run devopscanvas-ci-cd.yml \
  --field deployment_target=full-deploy \
  --field registries=ecr,ghcr,dockerhub \
  --field run_tests=true \
  --field environment=production
```

### **5. Development Build**
```bash
# Development environment build
gh workflow run devopscanvas-ci-cd.yml \
  --field deployment_target=aws-ecs \
  --field environment=development \
  --field aws_region=us-west-2
```

## 📊 **Automatic Behavior**

### **Push to Main Branch**
```yaml
Automatic Actions:
  - Build and push to ECR + GHCR (+ Docker Hub if credentials available)
  - Deploy to AWS ECS (production environment)
  - Create GitOps PR for deployment
  - Run security scans and keyless signing
```

### **Push to Develop Branch**
```yaml
Automatic Actions:
  - Build and push to available registries
  - No automatic deployment
  - Security scans and signing
```

### **Pull Request**
```yaml
Automatic Actions:
  - Run tests (TypeScript, linting, builds)
  - Build and push to GHCR only
  - No deployment or security scans
```

### **Tag Push (Release)**
```yaml
Automatic Actions:
  - Build with release tag
  - Push to all available registries
  - Full security scanning and signing
  - No automatic deployment (manual decision)
```

## 🔧 **Configuration Files**

### **Environment Variables**
```yaml
# Registry Configuration
ECR_REPOSITORY: devopscanvas-portal
DOCKER_HUB_REPOSITORY: jtcrump32msu/devopscanvas-portal
GHCR_REPOSITORY: devopscanvas-portal

# AWS ECS Configuration  
ECS_CLUSTER: devopscanvas-cluster
ECS_SERVICE: devopscanvas-portal-service
ECS_TASK_DEFINITION: devopscanvas-portal-task

# Build Configuration
DOCKERFILE: Dockerfile.backstage
PLATFORM: linux/amd64
```

### **Registry Selection Logic**
```yaml
Pull Request: ghcr only
Manual: User-specified registries
Push (with Docker Hub creds): ecr,ghcr,dockerhub  
Push (without Docker Hub creds): ecr,ghcr
```

## 📈 **Monitoring & Observability**

### **GitHub Actions Summary**
- **Build Details**: Image tags, digests, registries
- **Security Status**: Scan results, signing status
- **Deployment Status**: ECS health, GitOps PR links
- **Performance Metrics**: Build times, cache hit rates

### **Logs & Debugging**
```bash
# View workflow runs
gh run list --workflow=devopscanvas-ci-cd.yml

# View specific run logs
gh run view <run-id> --log

# View failed runs only
gh run list --workflow=devopscanvas-ci-cd.yml --status=failure
```

## 🛠️ **Migration from Old Workflows**

### **Step 1: Backup Old Workflows**
```bash
# Move old workflows to backup directory
mkdir -p .github/workflows/backup
mv .github/workflows/aws-ecr-deploy.yml .github/workflows/backup/
mv .github/workflows/multi-registry-build.yml .github/workflows/backup/
mv .github/workflows/deploy.yml .github/workflows/backup/
mv .github/workflows/container-build-keyless.yml .github/workflows/backup/
```

### **Step 2: Test New Workflow**
```bash
# Test build-only first
gh workflow run devopscanvas-ci-cd.yml \
  --field deployment_target=build-only

# Test full deployment
gh workflow run devopscanvas-ci-cd.yml \
  --field deployment_target=full-deploy
```

### **Step 3: Update Documentation**
- Update README.md with new workflow instructions
- Update deployment guides
- Notify team of new workflow usage

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Docker Hub Rate Limits**
```bash
# Solution: Configure Docker Hub authentication
./setup-docker-hub-auth.sh
```

#### **AWS ECS Deployment Failures**
```bash
# Check ECS service and task definition names
aws ecs describe-services --cluster devopscanvas-cluster
aws ecs list-task-definitions --family-prefix devopscanvas-portal
```

#### **GitOps Repository Access**
```bash
# Ensure GITHUB_TOKEN has access to GitOps repo
# Repository must exist: devopscanvas-gitops
```

#### **Build Failures**
```bash
# Check Dockerfile and build context
docker build -f Dockerfile.backstage .

# Verify Node.js and Yarn setup
node --version
yarn --version
```

## 📚 **Best Practices**

### **Security**
- ✅ Use access tokens instead of passwords
- ✅ Enable keyless signing for supply chain security
- ✅ Run vulnerability scans on production images
- ✅ Use minimal container base images

### **Performance**
- ✅ Enable GitHub Actions cache for faster builds
- ✅ Use Docker Hub authentication to avoid rate limits
- ✅ Build only necessary platforms (linux/amd64)
- ✅ Use multi-stage Dockerfiles for smaller images

### **Reliability**
- ✅ Implement proper health checks
- ✅ Use graceful fallbacks for optional features
- ✅ Set appropriate timeouts for deployments
- ✅ Monitor build and deployment metrics

### **Maintainability**
- ✅ Use clear, descriptive job and step names
- ✅ Generate comprehensive summaries and logs
- ✅ Document all configuration options
- ✅ Version control all workflow changes

---

## 🎉 **Benefits of Consolidation**

### **✅ Simplified Management**
- Single workflow file to maintain
- Consistent configuration across all deployment types
- Unified secrets and environment management

### **✅ Enhanced Features**
- Comprehensive security scanning and signing
- Flexible deployment options
- Better error handling and logging

### **✅ Improved Reliability**
- Docker Hub rate limit prevention
- Graceful fallbacks for missing credentials
- Comprehensive health checks

### **✅ Better Developer Experience**
- Clear workflow inputs and options
- Detailed summaries and status reporting
- Easy troubleshooting and debugging

**The consolidated workflow provides a production-ready, secure, and maintainable CI/CD pipeline for the DevOpsCanvas Portal!**