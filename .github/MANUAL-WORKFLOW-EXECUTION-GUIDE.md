# Manual Workflow Execution Guide

## Overview

This guide explains how to manually trigger GitHub Actions workflows, useful for testing, debugging, or running workflows outside their normal triggers.

---

## Table of Contents

1. [Manual Trigger via GitHub UI](#manual-trigger-via-github-ui)
2. [Manual Trigger via GitHub CLI](#manual-trigger-via-github-cli)
3. [Workflow-Specific Instructions](#workflow-specific-instructions)
4. [Monitoring Manual Runs](#monitoring-manual-runs)
5. [Troubleshooting Manual Runs](#troubleshooting-manual-runs)

---

## Manual Trigger via GitHub UI

### Step-by-Step Instructions

**Step 1: Navigate to Actions tab**
1. Go to GitHub repository: https://github.com/azora/azora-os
2. Click "Actions" tab at top
3. You'll see list of all workflows

**Step 2: Select workflow**
1. Click on the workflow you want to run
2. Example: "Test Suite", "Security Scanning", "Deploy Staging"

**Step 3: Click "Run workflow"**
1. Look for "Run workflow" button (right side)
2. Click dropdown arrow next to it
3. Select branch to run on (usually `main` or `develop`)

**Step 4: Configure options (if available)**
Some workflows have input options:
- Branch selection
- Environment selection
- Custom parameters

**Step 5: Click "Run workflow"**
1. Confirm branch selection
2. Click green "Run workflow" button
3. Workflow will start immediately

**Step 6: Monitor execution**
1. You'll see workflow run appear in list
2. Click on run to see detailed logs
3. Watch for completion or failures

### Example: Running Test Suite Manually

```
1. Actions tab
2. Click "Test Suite" workflow
3. Click "Run workflow" dropdown
4. Select branch: main
5. Click "Run workflow" button
6. Wait for tests to complete
```

---

## Manual Trigger via GitHub CLI

### Installation

```bash
# Install GitHub CLI
# macOS
brew install gh

# Windows
choco install gh

# Linux
sudo apt install gh

# Verify installation
gh --version
```

### Authentication

```bash
# Login to GitHub
gh auth login

# Follow prompts:
# - Choose GitHub.com
# - Choose HTTPS
# - Authenticate with browser
```

### Running Workflows

**Basic syntax:**
```bash
gh workflow run <workflow-file> -r <branch>
```

**Examples:**

```bash
# Run test suite on main branch
gh workflow run test.yml -r main

# Run security scan on develop branch
gh workflow run security.yml -r develop

# Run E2E tests on feature branch
gh workflow run e2e-tests.yml -r feature/my-feature

# Run linting on current branch
gh workflow run ci-lint-and-type-check.yml -r $(git rev-parse --abbrev-ref HEAD)
```

### Passing Inputs to Workflows

Some workflows accept input parameters:

```bash
# Workflow with inputs
gh workflow run deploy-staging.yml \
  -r main \
  -f environment=staging \
  -f skip-tests=false
```

### Listing Workflows

```bash
# List all workflows
gh workflow list

# List workflows with status
gh workflow list --all

# Get workflow ID
gh workflow list | grep "Test Suite"
```

### Monitoring Runs

```bash
# List recent runs
gh run list

# List runs for specific workflow
gh run list --workflow test.yml

# Watch specific run
gh run watch <run-id>

# View run details
gh run view <run-id>

# View run logs
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>
```

---

## Workflow-Specific Instructions

### Test Suite (`test.yml`)

**When to run manually:**
- Testing after code changes
- Debugging test failures
- Verifying fix before PR

**Manual trigger:**

```bash
# Via UI
Actions → Test Suite → Run workflow → main

# Via CLI
gh workflow run test.yml -r main
```

**Monitor:**
```bash
# Watch execution
gh run watch

# View logs
gh run view <run-id> --log

# Download coverage report
gh run download <run-id> -n coverage
```

**Expected output:**
- Test results for Node 18, 20, 22
- Coverage report
- Summary of passed/failed tests

---

### Linting & Type Checking (`ci-lint-and-type-check.yml`)

**When to run manually:**
- Verify linting before commit
- Debug type errors
- Check formatting

**Manual trigger:**

```bash
# Via UI
Actions → Linting & Type Checking → Run workflow → main

# Via CLI
gh workflow run ci-lint-and-type-check.yml -r main
```

**Monitor:**
```bash
# Watch execution
gh run watch

# View specific errors
gh run view <run-id> --log | grep -i error
```

**Expected output:**
- ESLint results
- TypeScript compilation results
- Prettier formatting check

---

### Security Scanning (`security.yml`)

**When to run manually:**
- Check for vulnerabilities
- Verify security fixes
- Audit dependencies

**Manual trigger:**

```bash
# Via UI
Actions → Security Scanning → Run workflow → main

# Via CLI
gh workflow run security.yml -r main
```

**Monitor:**
```bash
# Watch execution
gh run watch

# Download security report
gh run download <run-id> -n security-report
```

**Expected output:**
- npm audit results
- SAST scan results
- Secret detection results

---

### E2E Tests (`e2e-tests.yml`)

**When to run manually:**
- Test critical user flows
- Verify UI changes
- Debug E2E failures

**Manual trigger:**

```bash
# Via UI
Actions → E2E Tests → Run workflow → main

# Via CLI
gh workflow run e2e-tests.yml -r main
```

**Monitor:**
```bash
# Watch execution
gh run watch

# Download test report
gh run download <run-id> -n e2e-report

# Download screenshots
gh run download <run-id> -n screenshots
```

**Expected output:**
- E2E test results
- Screenshots on failure
- Video recordings

---

### Deploy Staging (`deploy-staging.yml`)

**When to run manually:**
- Deploy specific branch to staging
- Test deployment process
- Verify staging environment

**Manual trigger:**

```bash
# Via UI
Actions → Deploy Staging → Run workflow → main

# Via CLI
gh workflow run deploy-staging.yml -r main
```

**Monitor:**
```bash
# Watch execution
gh run watch

# View deployment logs
gh run view <run-id> --log

# Download deployment report
gh run download <run-id> -n deployment-logs
```

**Expected output:**
- Build successful
- Database migrations applied
- Health checks passed
- Services deployed

**Verify deployment:**
```bash
# Test staging environment
curl https://staging.azora.world/health

# Check service status
curl https://staging.azora.world/version
```

---

### Deploy Production (`deploy-production.yml`)

**When to run manually:**
- Deploy release to production
- Emergency hotfix deployment
- Verify production deployment

**Manual trigger:**

```bash
# Via UI
Actions → Deploy Production → Run workflow → main

# Via CLI
gh workflow run deploy-production.yml -r main
```

**⚠️ CAUTION:**
- Requires approval
- Affects live users
- Verify all checks pass first
- Have rollback plan ready

**Monitor:**
```bash
# Watch execution
gh run watch

# View deployment logs
gh run view <run-id> --log

# Monitor health checks
curl https://azora.world/health
```

**Expected output:**
- Pre-deployment checks passed
- Database backup created
- Migrations applied
- Services deployed
- Health checks passed

---

### Release Automation (`release.yml`)

**When to run manually:**
- Create new release
- Bump version
- Generate changelog

**Manual trigger:**

```bash
# Via UI
Actions → Release Automation → Run workflow → main

# Via CLI
gh workflow run release.yml -r main
```

**Monitor:**
```bash
# Watch execution
gh run watch

# View release details
gh release list

# Download release artifacts
gh release download <version>
```

**Expected output:**
- Version bumped
- Changelog generated
- GitHub release created
- npm package published

---

### Dependency Updates (`dependency-update.yml`)

**When to run manually:**
- Check for dependency updates
- Update dependencies immediately
- Test dependency updates

**Manual trigger:**

```bash
# Via UI
Actions → Dependency Updates → Run workflow → main

# Via CLI
gh workflow run dependency-update.yml -r main
```

**Monitor:**
```bash
# Watch execution
gh run watch

# View created PRs
gh pr list --state open --label dependencies
```

**Expected output:**
- Dependency update PRs created
- Tests run on update PRs
- Updates merged if tests pass

---

## Monitoring Manual Runs

### Via GitHub UI

**View run details:**
1. Actions tab
2. Click workflow name
3. Click specific run
4. View logs and artifacts

**Check status:**
- Green checkmark = Success
- Red X = Failed
- Yellow circle = In progress
- Gray dash = Skipped

**Download artifacts:**
1. Click run
2. Scroll to "Artifacts" section
3. Click artifact to download

### Via GitHub CLI

**List recent runs:**
```bash
gh run list --limit 10
```

**View specific run:**
```bash
gh run view <run-id>
```

**Watch run in real-time:**
```bash
gh run watch <run-id>
```

**View run logs:**
```bash
gh run view <run-id> --log
```

**Download artifacts:**
```bash
gh run download <run-id>
```

**Get run status:**
```bash
gh run view <run-id> --json status
```

### Monitoring Dashboard

**Real-time status:**
- GitHub Actions tab shows all runs
- Color-coded status indicators
- Execution time displayed

**Notifications:**
- Email notifications for failures
- Slack notifications (if configured)
- GitHub notifications

---

## Troubleshooting Manual Runs

### Workflow Not Appearing

**Problem:** Workflow doesn't show in Actions tab

**Solutions:**
1. Refresh page (Ctrl+R or Cmd+R)
2. Check workflow file exists in `.github/workflows/`
3. Verify workflow file has valid YAML syntax
4. Check workflow is not disabled

```bash
# Verify workflow file
ls -la .github/workflows/test.yml

# Check YAML syntax
npm install -g yaml-validator
yaml-validator .github/workflows/test.yml
```

### Run Not Starting

**Problem:** Clicked "Run workflow" but nothing happens

**Solutions:**
1. Check GitHub permissions
2. Verify branch exists
3. Try again (may be temporary issue)
4. Use GitHub CLI instead

```bash
# Verify branch exists
git branch -a

# Try CLI
gh workflow run test.yml -r main
```

### Run Stuck or Hanging

**Problem:** Workflow runs for hours without completing

**Solutions:**
1. Cancel run and try again
2. Check for infinite loops in code
3. Increase timeout
4. Check resource usage

```bash
# Cancel run
gh run cancel <run-id>

# View logs to identify issue
gh run view <run-id> --log | tail -100
```

### Artifacts Not Available

**Problem:** Cannot download artifacts from run

**Solutions:**
1. Wait for run to complete
2. Check artifact retention policy
3. Verify artifact was created
4. Try downloading via CLI

```bash
# List artifacts
gh run view <run-id> --json artifacts

# Download via CLI
gh run download <run-id>
```

### Secrets Not Available

**Problem:** Workflow fails with "Secret not found"

**Solutions:**
1. Verify secret exists in GitHub Settings
2. Check secret name matches workflow
3. Verify secret is in correct environment
4. Re-create secret if needed

```bash
# Verify secret exists (via GitHub UI)
Settings → Secrets and variables → Actions
```

---

## Best Practices

### Before Running Manually

1. **Verify code is ready**
   ```bash
   git status
   git log --oneline -5
   ```

2. **Run tests locally first**
   ```bash
   npm run test:unit
   npm run lint
   npm run typecheck
   ```

3. **Check branch is up to date**
   ```bash
   git pull origin main
   ```

### During Execution

1. **Monitor progress**
   - Watch workflow logs
   - Check for errors early
   - Don't close browser tab

2. **Document what you're testing**
   - Note the run ID
   - Record timestamp
   - Note any issues

### After Completion

1. **Review results**
   - Check all steps passed
   - Download artifacts if needed
   - Verify expected output

2. **Take action**
   - Fix any failures
   - Commit changes
   - Re-run if needed

3. **Clean up**
   - Delete old artifacts
   - Archive logs if needed
   - Update documentation

---

## Quick Reference

### Common Commands

```bash
# List workflows
gh workflow list

# Run workflow
gh workflow run <workflow-file> -r <branch>

# List runs
gh run list

# Watch run
gh run watch <run-id>

# View logs
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>

# Cancel run
gh run cancel <run-id>
```

### Workflow Files

| Workflow | File | Purpose |
|----------|------|---------|
| Test Suite | `test.yml` | Run tests |
| Linting | `ci-lint-and-type-check.yml` | Check code quality |
| Security | `security.yml` | Security scanning |
| E2E Tests | `e2e-tests.yml` | End-to-end tests |
| Deploy Staging | `deploy-staging.yml` | Deploy to staging |
| Deploy Production | `deploy-production.yml` | Deploy to production |
| Release | `release.yml` | Create release |
| Dependencies | `dependency-update.yml` | Update dependencies |

### Useful Links

- **GitHub Actions:** https://github.com/azora/azora-os/actions
- **Workflow Runs:** https://github.com/azora/azora-os/actions/runs
- **GitHub CLI Docs:** https://cli.github.com/manual/
- **Workflow Syntax:** https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

