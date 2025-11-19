# Secrets and Variables Reference

This is a quick reference guide for all secrets and environment variables used in the CI/CD workflows.

## Secrets Summary

| Secret Name | Purpose | Used In | Type | Required |
|-------------|---------|---------|------|----------|
| `DOCKER_USERNAME` | Docker Hub username | deploy-staging.yml, deploy-production.yml | Credential | ✓ Yes |
| `DOCKER_PASSWORD` | Docker Hub token | deploy-staging.yml, deploy-production.yml | Credential | ✓ Yes |
| `STAGING_HOST` | Staging server hostname | deploy-staging.yml | Configuration | ✓ Yes |
| `STAGING_USER` | Staging SSH username | deploy-staging.yml | Configuration | ✓ Yes |
| `STAGING_KEY` | Staging SSH private key | deploy-staging.yml | Credential | ✓ Yes |
| `STAGING_DATABASE_URL` | Staging database connection | deploy-staging.yml | Credential | ✓ Yes |
| `PROD_HOST` | Production server hostname | deploy-production.yml | Configuration | ✓ Yes |
| `PROD_USER` | Production SSH username | deploy-production.yml | Configuration | ✓ Yes |
| `PROD_KEY` | Production SSH private key | deploy-production.yml | Credential | ✓ Yes |
| `PROD_DATABASE_URL` | Production database connection | deploy-production.yml | Credential | ✓ Yes |
| `NPM_TOKEN` | npm registry token | release.yml, dependency-update.yml | Credential | ✓ Yes |
| `SLACK_WEBHOOK` | Slack webhook URL | deploy-staging.yml, deploy-production.yml, release.yml | Credential | ✗ Optional |
| `RENOVATE_TOKEN` | GitHub token for Renovate | dependency-update.yml | Credential | ✗ Optional |

## Variables Summary

| Variable Name | Purpose | Used In | Value | Required |
|---------------|---------|---------|-------|----------|
| `NODE_VERSIONS` | Supported Node versions | test.yml, dependency-update.yml | `18.x,20.x,22.x` | ✓ Yes |
| `COVERAGE_THRESHOLD` | Minimum coverage % | test.yml | `80` | ✓ Yes |
| `SECURITY_SEVERITY_THRESHOLD` | Security fail level | security.yml | `high` | ✓ Yes |

## Workflow Access Matrix

### test.yml
- **Secrets**: None
- **Variables**: `NODE_VERSIONS`, `COVERAGE_THRESHOLD`

### security.yml
- **Secrets**: None
- **Variables**: `SECURITY_SEVERITY_THRESHOLD`

### deploy-staging.yml
- **Secrets**: `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `STAGING_HOST`, `STAGING_USER`, `STAGING_KEY`, `STAGING_DATABASE_URL`, `SLACK_WEBHOOK` (optional)
- **Variables**: None

### deploy-production.yml
- **Secrets**: `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `PROD_HOST`, `PROD_USER`, `PROD_KEY`, `PROD_DATABASE_URL`, `SLACK_WEBHOOK` (optional)
- **Variables**: None

### release.yml
- **Secrets**: `NPM_TOKEN`, `SLACK_WEBHOOK` (optional)
- **Variables**: None

### dependency-update.yml
- **Secrets**: `NPM_TOKEN`, `RENOVATE_TOKEN` (optional)
- **Variables**: `NODE_VERSIONS`

## Environment Protection Rules

### Staging Environment
- **Requires Reviewers**: Yes
- **Allowed Branches**: `main`
- **Wait Timer**: None (optional)

### Production Environment
- **Requires Reviewers**: Yes
- **Allowed Branches**: `main` (or tags: `v*`)
- **Wait Timer**: 1 hour (recommended)

## Quick Setup Commands

### Generate SSH Keys for Deployments

```bash
# Generate staging deployment key
ssh-keygen -t ed25519 -f staging-deploy-key -N "" -C "azora-staging-deploy"

# Generate production deployment key
ssh-keygen -t ed25519 -f prod-deploy-key -N "" -C "azora-prod-deploy"

# Display keys for copying to GitHub
echo "=== Staging Public Key ==="
cat staging-deploy-key.pub

echo "=== Staging Private Key ==="
cat staging-deploy-key

echo "=== Production Public Key ==="
cat prod-deploy-key.pub

echo "=== Production Private Key ==="
cat prod-deploy-key
```

### Add Public Keys to Servers

```bash
# On staging server
cat staging-deploy-key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# On production server
cat prod-deploy-key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Generate npm Token

1. Visit https://www.npmjs.com/settings/[your-username]/tokens
2. Click "Generate New Token"
3. Select "Automation" type
4. Copy the token and add to GitHub secrets as `NPM_TOKEN`

### Generate Slack Webhook

1. Visit https://api.slack.com/apps
2. Create new app or select existing
3. Enable "Incoming Webhooks"
4. Click "Add New Webhook to Workspace"
5. Select channel and authorize
6. Copy webhook URL and add to GitHub secrets as `SLACK_WEBHOOK`

## Validation Checklist

Use this checklist to verify all secrets and variables are properly configured:

```bash
#!/bin/bash
# Save as: verify-secrets.sh

echo "Verifying GitHub Secrets and Variables..."
echo ""

# Check secrets (requires GitHub CLI)
echo "Checking Secrets:"
gh secret list --repo azora-os/azora-os | grep -E "DOCKER_USERNAME|DOCKER_PASSWORD|STAGING_HOST|STAGING_USER|STAGING_KEY|STAGING_DATABASE_URL|PROD_HOST|PROD_USER|PROD_KEY|PROD_DATABASE_URL|NPM_TOKEN|SLACK_WEBHOOK"

echo ""
echo "Checking Variables:"
gh variable list --repo azora-os/azora-os | grep -E "NODE_VERSIONS|COVERAGE_THRESHOLD|SECURITY_SEVERITY_THRESHOLD"

echo ""
echo "Checking Environments:"
gh api repos/azora-os/azora-os/environments | jq '.environments[].name'
```

## Rotation Schedule

| Secret | Rotation Frequency | Last Rotated | Next Rotation |
|--------|-------------------|--------------|---------------|
| `DOCKER_PASSWORD` | 90 days | - | - |
| `STAGING_KEY` | 180 days | - | - |
| `PROD_KEY` | 180 days | - | - |
| `NPM_TOKEN` | 90 days | - | - |
| `SLACK_WEBHOOK` | As needed | - | - |

## Troubleshooting Guide

### Secret Not Found Error
```
Error: Secret 'SECRET_NAME' not found
```
**Solution**: 
- Verify secret name is spelled correctly (case-sensitive)
- Check secret is in repository settings, not organization
- Ensure workflow has permission to access secret

### Authentication Failed
```
Error: Authentication failed for Docker Hub
```
**Solution**:
- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` are correct
- Check Docker Hub token hasn't expired
- Ensure token has push permissions

### SSH Connection Failed
```
Error: Permission denied (publickey)
```
**Solution**:
- Verify SSH private key is correct
- Check public key is added to server's `~/.ssh/authorized_keys`
- Ensure SSH key permissions are correct (600)

### npm Publish Failed
```
Error: 401 Unauthorized
```
**Solution**:
- Verify `NPM_TOKEN` is correct and not expired
- Check token has publish permissions
- Ensure package name is correct

## References

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Variables Documentation](https://docs.github.com/en/actions/learn-github-actions/variables)
- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
