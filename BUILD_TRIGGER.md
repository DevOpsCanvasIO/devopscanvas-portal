# Build Trigger

This file is used to trigger GitHub Actions builds.

**Last triggered**: $(date)
**Trigger reason**: Manual keyless signing workflow test
**Build ID**: $(uuidgen)

## Keyless Signing Workflow

This build will:
1. ✅ Run tests and linting
2. ✅ Build Docker image
3. ✅ Push to GHCR (ghcr.io/devopscanvasio/devopscanvas-portal)
4. ✅ Sign with Cosign (keyless)
5. ✅ Create GitOps PR for deployment

## Expected Artifacts

- **Signed Container**: `ghcr.io/devopscanvasio/devopscanvas-portal:latest`
- **SBOM**: Software Bill of Materials
- **Cosign Signature**: Keyless signature verification
- **GitOps PR**: Automated deployment update

---
*Triggered at: $(date)*