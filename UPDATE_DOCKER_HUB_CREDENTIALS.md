# 🔧 Docker Hub Credentials Update Guide

## 🚨 **Issue**: Docker Hub Push Access Denied

The current Docker Hub access token has insufficient permissions or has expired, causing push failures:

```
ERROR: failed to push ***msu/devopscanvas-portal:main: push access denied, 
repository does not exist or may require authorization: 
server message: insufficient_scope: authorization failed
```

## 🛠️ **Solution Steps**

### **Step 1: Create New Docker Hub Access Token**

1. **Go to Docker Hub Security Settings**:
   - Visit: https://hub.docker.com/settings/security
   - Login with your Docker Hub account

2. **Create New Access Token**:
   - Click "New Access Token"
   - **Token Name**: `DevOpsCanvas-GitHub-Actions-v2`
   - **Permissions**: Select **"Read, Write, Delete"** (NOT just "Public Repo Read")
   - Click "Generate"
   - **IMPORTANT**: Copy the token immediately (you won't see it again!)

### **Step 2: Verify Repository Access**

1. **Check Repository Exists**:
   - Visit: https://hub.docker.com/r/jtcrump32msu/devopscanvas-portal
   - Ensure the repository exists and you have write access

2. **Repository Settings**:
   - **Name**: `devopscanvas-portal`
   - **Namespace**: `jtcrump32msu`
   - **Visibility**: Public (recommended)

### **Step 3: Update GitHub Secrets**

Run these commands with your new credentials:

```bash
# Update Docker Hub username (if needed)
echo "jtcrump32msu" | gh secret set DOCKER_HUB_USERNAME --repo DevOpsCanvasIO/devopscanvas-portal

# Update Docker Hub token (use your new token with Read, Write, Delete permissions)
echo "YOUR_NEW_TOKEN_HERE" | gh secret set DOCKER_HUB_TOKEN --repo DevOpsCanvasIO/devopscanvas-portal
```

### **Step 4: Test the Credentials**

```bash
# Test Docker Hub authentication locally
echo "YOUR_NEW_TOKEN_HERE" | docker login --username jtcrump32msu --password-stdin

# If successful, test repository access
docker pull jtcrump32msu/devopscanvas-portal:latest || echo "Repository may be empty"

# Logout
docker logout
```

## 🎯 **Quick Fix Commands**

### **Option A: Update with New Token**
```bash
# Replace YOUR_NEW_TOKEN with the actual token from Docker Hub
echo "YOUR_NEW_TOKEN" | gh secret set DOCKER_HUB_TOKEN --repo DevOpsCanvasIO/devopscanvas-portal
```

### **Option B: Skip Docker Hub (Recommended for now)**
```bash
# Run workflow without Docker Hub to avoid issues
gh workflow run devopscanvas-ci-cd.yml \
  --repo DevOpsCanvasIO/devopscanvas-portal \
  --field deployment_target=build-only \
  --field registries=ecr,ghcr \
  --field run_tests=false
```

## 🔍 **Troubleshooting**

### **Common Issues**:

1. **"Insufficient Scope" Error**:
   - Token permissions are too restrictive
   - Create new token with "Read, Write, Delete" permissions

2. **"Repository Does Not Exist" Error**:
   - Repository name mismatch
   - Repository doesn't exist on Docker Hub
   - No write access to repository

3. **"Authentication Failed" Error**:
   - Wrong username/token combination
   - Token has expired
   - Account suspended/limited

### **Verification Steps**:

```bash
# Check current secrets
gh secret list --repo DevOpsCanvasIO/devopscanvas-portal | grep DOCKER

# Test workflow without Docker Hub
gh workflow run devopscanvas-ci-cd.yml \
  --field deployment_target=build-only \
  --field registries=ghcr

# Test workflow with Docker Hub (after fixing credentials)
gh workflow run devopscanvas-ci-cd.yml \
  --field deployment_target=build-only \
  --field registries=dockerhub
```

## 📋 **Token Permissions Checklist**

When creating the Docker Hub access token, ensure:

- ✅ **Read** permission: Can pull images
- ✅ **Write** permission: Can push images  
- ✅ **Delete** permission: Can manage tags
- ✅ **Repository scope**: Access to your repositories
- ✅ **Token name**: Descriptive name for identification

## 🚀 **After Fixing**

Once credentials are updated:

1. **Test Docker Hub Only**:
   ```bash
   gh workflow run devopscanvas-ci-cd.yml \
     --field deployment_target=build-only \
     --field registries=dockerhub
   ```

2. **Test All Registries**:
   ```bash
   gh workflow run devopscanvas-ci-cd.yml \
     --field deployment_target=build-only \
     --field registries=ecr,ghcr,dockerhub
   ```

3. **Full Deployment**:
   ```bash
   gh workflow run devopscanvas-ci-cd.yml \
     --field deployment_target=full-deploy \
     --field registries=ecr,ghcr,dockerhub
   ```

---

**Need help?** The workflow is configured to work without Docker Hub, so you can always use `--field registries=ecr,ghcr` to skip Docker Hub entirely.