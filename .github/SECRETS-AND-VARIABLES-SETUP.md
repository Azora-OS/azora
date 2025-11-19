# GitHub Secrets and Environment Variables Setup Guide

This document outlines all required secrets and environment variables needed for the CI/CD workflows to function properly.

## Overview

The CI/CD pipeline requires several secrets and environment variables to be configured in GitHub repository settings. These are used for:
- Docker image building and pushing
- Deployment to staging and production environments
- npm package publishing
- Slack notifications
- Database access
- Security scanning

## Required Secrets

Secrets are sensitive values that should never be committed to the repository. They are encrypted and only available to workflows.

### Docker Registry Secrets

**`DOCKER_USERNAME`**
- **Purpose**: Docker Hub username for authentication
- **Used in**: `deploy-staging.yml`, `deploy-production.yml`
- **How to set**: 
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: `DOCKER_USERNAME`
  4. Value: Your Docker Hub username
  5. Click "Add secret"

**`DOCKER_PASSWORD`**
- **Purpose**: Docker Hub password or personal access token
- **Used in**: `deploy-staging.yml`, `deploy-production.yml`
- **Security Note**: Use a personal access token instead of your password
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: `DOCKER_PASSWORD`
  4. Value: Your Docker Hub personal access token
  5. Click "Add secret"

### Deployment Secrets

**`STAGING_HOST`**
- **Purpose**: Hostname or IP address of staging environment
- **Used in**: `deploy-staging.yml`
- **Example**: `staging.azora.world` or `192.168.1.100`
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: `STAGING_HOST`
  4. Value: Your staging environment hostname/IP
  5. Click "Add secret"

**`STAGING_USER`**
- **Purpose**: SSH username for staging environment
- **Used in**: `deploy-staging.yml`
- **Example**: `deploy` or `ubuntu`
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: `STAGING_USER`
  4. Value: SSH username for staging
  5. Click "Add secret"

**`STAGING_KEY`**
- **Purpose**: SSH private key for staging environment authentication
- **Used in**: `deploy-staging.yml`
- **Security Note**: Use a dedicated deployment key, not your personal SSH key
- **How to set**:
  1. Generate a new SSH key: `ssh-keygen -t ed25519 -f staging-deploy-key -N ""`
  2. Add public key to staging server: `cat staging-deploy-key.pub >> ~/.ssh/authorized_keys`
  3. Go to GitHub repository → Settings → Secrets and variables → Actions
  4. Click "New repository secret"
  5. Name: `STAGING_KEY`
  6. Value: Contents of `staging-deploy-key` (private key)
  7. Click "Add secret"

**`STAGING_DATABASE_URL`**
- **Purpose**: Database connection string for staging environment
- **Used in**: `deploy-staging.yml`
- **Format**: `postgresql://user:password@host:port/database`
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: `STAGING_DATABASE_URL`
  4. Value: Your staging database connection string
  5. Click "Add secret"

**`PROD_HOST`**
- **Purpose**: Hostname or IP address of production environment
- **Used in**: `deploy-production.yml`
- **Example**: `azora.world` or `10.0.1.100`
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: `PROD_HOST`
  4. Value: Your production environment hostname/IP
  5. Click "Add secret"

**`PROD_USER`**
- **Purpose**: SSH username for production environment
- **Used in**: `deploy-production.yml`
- **Example**: `deploy` or `ubuntu`
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: `PROD_USER`
  4. Value: SSH username for production
  5. Click "Add secret"

**`PROD_KEY`**
- **Purpose**: SSH private key for production environment authentication
- **Used in**: `deploy-production.yml`
- **Security Note**: Use a dedicated deployment key, not your personal SSH key
- **How to set**:
  1. Generate a new SSH key: `ssh-keygen -t ed25519 -f prod-deploy-key -N ""`
  2. Add public key to production server: `cat prod-deploy-key.pub >> ~/.ssh/authorized_keys`
  3. Go to GitHub repository → Settings → Secrets and variables → Actions
  4. Click "New repository secret"
  5. Name: `PROD_KEY`
  6. Value: Contents of `prod-deploy-key` (private key)
  7. Click "Add secret"

**`PROD_DATABASE_URL`**
- **Purpose**: Database connection string for production environment
- **Used in**: `deploy-production.yml`
- **Format**: `postgresql://user:password@host:port/database`
- **Security Note**: Use a read-only or limited-privilege account for backups
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: `PROD_DATABASE_URL`
  4. Value: Your production database connection string
  5. Click "Add secret"

### Package Publishing Secrets

**`NPM_TOKEN`**
- **Purpose**: npm registry authentication token for publishing packages
- **Used in**: `release.yml`, `dependency-update.yml`
- **How to generate**:
  1. Go to https://www.npmjs.com/settings/[your-username]/tokens
  2. Click "Generate New Token"
  3. Select "Automation" type
  4. Copy the token
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: `NPM_TOKEN`
  4. Value: Your npm automation token
  5. Click "Add secret"

### Notification Secrets

**`SLACK_WEBHOOK`**
- **Purpose**: Slack webhook URL for sending workflow notifications
- **Used in**: `deploy-staging.yml`, `deploy-production.yml`, `release.yml`
- **How to generate**:
  1. Go to https://api.slack.com/apps
  2. Create a new app or select existing
  3. Enable "Incoming Webhooks"
  4. Click "Add New Webhook to Workspace"
  5. Select channel and authorize
  6. Copy the webhook URL
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: `SLACK_WEBHOOK`
  4. Value: Your Slack webhook URL
  5. Click "Add secret"

### Dependency Management Secrets

**`RENOVATE_TOKEN`** (Optional)
- **Purpose**: GitHub token for Renovate bot to create PRs
- **Used in**: `dependency-update.yml`
- **Default**: Uses `GITHUB_TOKEN` if not set
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: `RENOVATE_TOKEN`
  4. Value: Your GitHub personal access token with repo scope
  5. Click "Add secret"

## Required Environment Variables

Environment variables are non-sensitive configuration values that can be committed to the repository or set in GitHub.

### Node.js Configuration

**`NODE_VERSIONS`**
- **Purpose**: Supported Node.js versions for testing
- **Value**: `18.x,20.x,22.x`
- **Used in**: `test.yml`, `dependency-update.yml`
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository variable"
  3. Name: `NODE_VERSIONS`
  4. Value: `18.x,20.x,22.x`
  5. Click "Add variable"

### Testing Configuration

**`COVERAGE_THRESHOLD`**
- **Purpose**: Minimum code coverage percentage required
- **Value**: `80`
- **Used in**: `test.yml`
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository variable"
  3. Name: `COVERAGE_THRESHOLD`
  4. Value: `80`
  5. Click "Add variable"

### Security Configuration

**`SECURITY_SEVERITY_THRESHOLD`**
- **Purpose**: Minimum severity level to fail security checks
- **Value**: `high` (options: low, moderate, high, critical)
- **Used in**: `security.yml`
- **How to set**:
  1. Go to GitHub repository → Settings → Secrets and variables → Actions
  2. Click "New repository variable"
  3. Name: `SECURITY_SEVERITY_THRESHOLD`
  4. Value: `high`
  5. Click "Add variable"

## Environment Protection Rules

Environment protection rules ensure that deployments to staging and production require additional approvals and checks.

### Staging Environment Protection

1. Go to GitHub repository → Settings → Environments
2. Click "New environment"
3. Name: `staging`
4. Configure protection rules:
   - ✓ Enable "Require reviewers"
   - Add reviewers: Select team members who can approve staging deployments
   - ✓ Enable "Restrict deployments to specific branches"
   - Allowed branches: `main`
5. Click "Save protection rules"

### Production Environment Protection

1. Go to GitHub repository → Settings → Environments
2. Click "New environment"
3. Name: `production`
4. Configure protection rules:
   - ✓ Enable "Require reviewers"
   - Add reviewers: Select team members who can approve production deployments
   - ✓ Enable "Restrict deployments to specific branches"
   - Allowed branches: `main` (or use tags: `v*`)
   - ✓ Enable "Wait timer"
   - Wait time: 1 hour (allows time to catch issues before full rollout)
5. Click "Save protection rules"

## Verification Checklist

After setting up all secrets and variables, verify they are accessible to workflows:

- [ ] `DOCKER_USERNAME` secret is set
- [ ] `DOCKER_PASSWORD` secret is set
- [ ] `STAGING_HOST` secret is set
- [ ] `STAGING_USER` secret is set
- [ ] `STAGING_KEY` secret is set
- [ ] `STAGING_DATABASE_URL` secret is set
- [ ] `PROD_HOST` secret is set
- [ ] `PROD_USER` secret is set
- [ ] `PROD_KEY` secret is set
- [ ] `PROD_DATABASE_URL` secret is set
- [ ] `NPM_TOKEN` secret is set
- [ ] `SLACK_WEBHOOK` secret is set
- [ ] `NODE_VERSIONS` variable is set
- [ ] `COVERAGE_THRESHOLD` variable is set
- [ ] `SECURITY_SEVERITY_THRESHOLD` variable is set
- [ ] Staging environment protection rules are configured
- [ ] Production environment protection rules are configured

## Testing Secrets and Variables

To verify that secrets and variables are properly configured:

1. Create a test workflow file `.github/workflows/test-secrets.yml`:

```yaml
name: Test Secrets and Variables

on: workflow_dispatch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check secrets
        run: |
          echo "Checking secrets..."
          [ -n "${{ secrets.DOCKER_USERNAME }}" ] && echo "✓ DOCKER_USERNAME" || echo "✗ DOCKER_USERNAME"
          [ -n "${{ secrets.DOCKER_PASSWORD }}" ] && echo "✓ DOCKER_PASSWORD" || echo "✗ DOCKER_PASSWORD"
          [ -n "${{ secrets.STAGING_HOST }}" ] && echo "✓ STAGING_HOST" || echo "✗ STAGING_HOST"
          [ -n "${{ secrets.STAGING_USER }}" ] && echo "✓ STAGING_USER" || echo "✗ STAGING_USER"
          [ -n "${{ secrets.STAGING_KEY }}" ] && echo "✓ STAGING_KEY" || echo "✗ STAGING_KEY"
          [ -n "${{ secrets.STAGING_DATABASE_URL }}" ] && echo "✓ STAGING_DATABASE_URL" || echo "✗ STAGING_DATABASE_URL"
          [ -n "${{ secrets.PROD_HOST }}" ] && echo "✓ PROD_HOST" || echo "✗ PROD_HOST"
          [ -n "${{ secrets.PROD_USER }}" ] && echo "✓ PROD_USER" || echo "✗ PROD_USER"
          [ -n "${{ secrets.PROD_KEY }}" ] && echo "✓ PROD_KEY" || echo "✗ PROD_KEY"
          [ -n "${{ secrets.PROD_DATABASE_URL }}" ] && echo "✓ PROD_DATABASE_URL" || echo "✗ PROD_DATABASE_URL"
          [ -n "${{ secrets.NPM_TOKEN }}" ] && echo "✓ NPM_TOKEN" || echo "✗ NPM_TOKEN"
          [ -n "${{ secrets.SLACK_WEBHOOK }}" ] && echo "✓ SLACK_WEBHOOK" || echo "✗ SLACK_WEBHOOK"
      
      - name: Check variables
        run: |
          echo "Checking variables..."
          [ -n "${{ vars.NODE_VERSIONS }}" ] && echo "✓ NODE_VERSIONS" || echo "✗ NODE_VERSIONS"
          [ -n "${{ vars.COVERAGE_THRESHOLD }}" ] && echo "✓ COVERAGE_THRESHOLD" || echo "✗ COVERAGE_THRESHOLD"
          [ -n "${{ vars.SECURITY_SEVERITY_THRESHOLD }}" ] && echo "✓ SECURITY_SEVERITY_THRESHOLD" || echo "✗ SECURITY_SEVERITY_THRESHOLD"
```

2. Run the workflow manually from the Actions tab
3. Check the output to verify all secrets and variables are accessible

## Security Best Practices

1. **Rotate secrets regularly**: Update deployment keys and tokens every 90 days
2. **Use dedicated accounts**: Create separate accounts for CI/CD deployments
3. **Limit permissions**: Use personal access tokens with minimal required scopes
4. **Monitor access**: Review GitHub audit logs for secret access
5. **Never commit secrets**: Use `.gitignore` to prevent accidental commits
6. **Use environment protection**: Require approvals for production deployments
7. **Audit trail**: Keep records of who has access to secrets

## Troubleshooting

### Workflow fails with "Secret not found"
- Verify the secret name matches exactly (case-sensitive)
- Check that the secret is set in the correct repository (not organization-level)
- Ensure the workflow has permission to access the secret

### Deployment fails with authentication error
- Verify the secret value is correct and not expired
- For SSH keys, ensure the public key is added to the target server
- For tokens, check that the token has not been revoked

### Slack notifications not sending
- Verify the webhook URL is correct and not expired
- Check that the Slack workspace still has the app installed
- Review workflow logs for error messages

## References

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Environment Variables](https://docs.github.com/en/actions/learn-github-actions/variables)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Docker Hub Personal Access Tokens](https://docs.docker.com/docker-hub/access-tokens/)
- [npm Tokens](https://docs.npmjs.com/about-access-tokens)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)
