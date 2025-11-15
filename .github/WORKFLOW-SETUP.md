# GitHub Workflows Setup Guide

## Quick Start (5 Minutes)

### Step 1: Configure Secrets (2 min)

Go to **Settings → Secrets and variables → Actions** and add:

#### Essential Secrets (Required for basic CI/CD)
```bash
DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_token
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

#### Deployment Secrets (Required for staging/production)
```bash
STAGING_HOST=staging.azora.world
STAGING_USER=deploy
STAGING_KEY=<your-ssh-private-key>

PROD_HOST=azora.world
PROD_USER=deploy
PROD_KEY=<your-ssh-private-key>
PROD_DATABASE_URL=postgresql://user:pass@host:5432/azora_prod
```

#### Publishing Secrets (Optional - for releases)
```bash
NPM_TOKEN=npm_xxxxxxxxxxxxx
RENOVATE_TOKEN=github_pat_xxxxxxxxxxxxx
```

### Step 2: Configure Environments (1 min)

Go to **Settings → Environments** and create:

#### Staging Environment
- Name: `staging`
- URL: `https://staging.azora.world`
- Protection rules: None (auto-deploy)

#### Production Environment
- Name: `production`
- URL: `https://azora.world`
- Protection rules:
  - ✅ Required reviewers: 1
  - ✅ Wait timer: 5 minutes
  - ✅ Deployment branches: `main` only

### Step 3: Test Workflows (2 min)

```bash
# 1. Create a test branch
git checkout -b test/workflows

# 2. Make a small change
echo "# Test" >> TEST.md

# 3. Commit and push
git add TEST.md
git commit -m "test: validate workflows"
git push origin test/workflows

# 4. Create PR and watch workflows run
```

## Detailed Configuration

### Docker Hub Setup

1. Create Docker Hub account at https://hub.docker.com
2. Create access token:
   - Account Settings → Security → New Access Token
   - Name: `github-actions`
   - Permissions: Read, Write, Delete
3. Add to GitHub secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: The access token (not your password!)

### Slack Notifications Setup

1. Create Slack app at https://api.slack.com/apps
2. Enable Incoming Webhooks
3. Create webhook for your channel
4. Add webhook URL to GitHub secret `SLACK_WEBHOOK`

### SSH Key Setup for Deployments

```bash
# 1. Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions@azora.world" -f deploy_key

# 2. Add public key to servers
cat deploy_key.pub | ssh user@staging.azora.world 'cat >> ~/.ssh/authorized_keys'
cat deploy_key.pub | ssh user@azora.world 'cat >> ~/.ssh/authorized_keys'

# 3. Add private key to GitHub secrets
cat deploy_key | pbcopy  # Copy to clipboard
# Paste into STAGING_KEY and PROD_KEY secrets
```

### npm Publishing Setup

1. Create npm account at https://www.npmjs.com
2. Generate access token:
   - Account Settings → Access Tokens → Generate New Token
   - Type: Automation
3. Add to GitHub secret `NPM_TOKEN`

### Renovate Setup

1. Install Renovate GitHub App: https://github.com/apps/renovate
2. Create GitHub Personal Access Token:
   - Settings → Developer settings → Personal access tokens
   - Scopes: `repo`, `workflow`
3. Add to GitHub secret `RENOVATE_TOKEN`

## Workflow Triggers

### Automatic Triggers

| Workflow | Trigger | When |
|----------|---------|------|
| Test Suite | Push, PR | Every commit |
| E2E Tests | Push, PR, Schedule | Every commit + daily 2 AM |
| Code Quality | Push, PR | Every commit |
| TypeScript | Push, PR | Every commit |
| Security | Push, PR, Schedule | Every commit + weekly Monday |
| Deploy Staging | Push to develop | Auto on develop |
| Deploy Production | Push to main, Tags | Auto on main |
| Release | Tags v*.*.* | Manual or tag push |
| Dependencies | Schedule | Weekly Monday |

### Manual Triggers

All workflows support manual triggering:

1. Go to **Actions** tab
2. Select workflow
3. Click **Run workflow**
4. Choose branch
5. Click **Run workflow** button

## Monitoring Workflows

### GitHub Actions Dashboard

View all workflow runs:
- Go to **Actions** tab
- Filter by workflow, status, branch
- Click run for detailed logs

### Status Badges

Add to README.md:

```markdown
![Test](https://github.com/Sizwe780/azora-os/workflows/Test%20Suite/badge.svg)
![Security](https://github.com/Sizwe780/azora-os/workflows/Security%20Scanning/badge.svg)
![Deploy](https://github.com/Sizwe780/azora-os/workflows/Deploy%20Production/badge.svg)
```

### Slack Notifications

Configured workflows send notifications:
- ✅ Successful deployments
- ❌ Failed deployments
- 🚀 New releases

## Troubleshooting

### Workflow Not Triggering

**Problem**: Workflow doesn't run on push/PR

**Solutions**:
1. Check workflow file syntax: `npm run validate:workflows`
2. Verify branch matches trigger conditions
3. Check if workflow is disabled in Actions tab
4. Ensure `.github/workflows/` directory is committed

### Secrets Not Available

**Problem**: Workflow fails with "secret not found"

**Solutions**:
1. Verify secret name matches exactly (case-sensitive)
2. Check secret is in correct scope (repository/environment)
3. Ensure workflow has permission to access environment
4. Re-add secret if recently changed

### Tests Failing in CI

**Problem**: Tests pass locally but fail in CI

**Solutions**:
1. Check Node.js version matches (20.x)
2. Verify environment variables are set
3. Check service containers are running
4. Review test logs for specific errors
5. Run tests with same conditions locally:
   ```bash
   NODE_ENV=test npm test
   ```

### Deployment Failures

**Problem**: Deployment workflow fails

**Solutions**:
1. Verify SSH keys are correct
2. Check server is accessible
3. Verify Docker credentials
4. Check health endpoint is responding
5. Review deployment logs
6. Test SSH connection manually:
   ```bash
   ssh -i deploy_key user@host
   ```

### Docker Build Failures

**Problem**: Docker build fails in workflow

**Solutions**:
1. Test build locally: `docker-compose build`
2. Check Dockerfile syntax
3. Verify base images are accessible
4. Check Docker Hub credentials
5. Review build logs for specific errors

## Validation

Run validation script to check workflows:

```bash
# Install dependencies
npm install js-yaml

# Run validation
node scripts/validate-workflows.js
```

Expected output:
```
🔍 Validating GitHub Workflows...

✅ test.yml: VALID
✅ e2e.yml: VALID
✅ lint.yml: VALID
✅ typecheck.yml: VALID
✅ security.yml: VALID
✅ deploy-staging.yml: VALID
✅ deploy-production.yml: VALID
✅ release.yml: VALID
✅ dependency-update.yml: VALID

📊 Summary:
   Total Workflows: 9
   Valid: 9
   Invalid: 0
   Missing: 0
   Errors: 0
   Warnings: 0

✅ All workflows validated successfully!
```

## Best Practices

### 1. Always Test Locally First
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

### 2. Use Feature Branches
```bash
git checkout -b feature/my-feature
# Make changes
git push origin feature/my-feature
# Create PR - workflows run automatically
```

### 3. Monitor Workflow Performance
- Check workflow duration trends
- Optimize slow steps
- Use caching effectively
- Parallelize independent jobs

### 4. Keep Secrets Secure
- Never commit secrets to repository
- Rotate secrets regularly
- Use environment-specific secrets
- Limit secret access to necessary workflows

### 5. Review Dependency Updates
- Don't auto-merge major updates
- Test updates in staging first
- Review changelogs
- Monitor for breaking changes

## Maintenance Schedule

### Daily
- ✅ Monitor workflow runs
- ✅ Fix failing workflows immediately
- ✅ Review E2E test results

### Weekly
- ✅ Review dependency update PRs
- ✅ Check security scan results
- ✅ Monitor workflow performance

### Monthly
- ✅ Audit secrets and permissions
- ✅ Review workflow efficiency
- ✅ Update workflow documentation
- ✅ Optimize caching strategies

### Quarterly
- ✅ Update GitHub Actions versions
- ✅ Review and update security policies
- ✅ Evaluate new CI/CD features
- ✅ Conduct workflow performance audit

## Support

Need help?

1. **Check Documentation**: Read workflow README.md
2. **Review Logs**: Check Actions tab for detailed logs
3. **Run Validation**: Use validation script
4. **Contact Team**: Create issue or contact DevOps

## Success Criteria

✅ All 9 workflows created and validated
✅ All required secrets configured
✅ Environment protection rules set up
✅ Test PR successfully runs all workflows
✅ Staging deployment successful
✅ Production deployment successful
✅ Notifications working (Slack)
✅ Monitoring dashboard active

---

**Setup Time**: ~5 minutes (basic) | ~30 minutes (complete)  
**Maintained By**: Q-Infrastructure Agent  
**Last Updated**: 2025-01-10
