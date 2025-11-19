# CI/CD Workflow Troubleshooting Guide

## Overview

This guide provides solutions for common CI/CD workflow failures and issues. Each section covers a specific workflow or failure type with diagnostic steps and remediation procedures.

---

## Table of Contents

1. [General Troubleshooting](#general-troubleshooting)
2. [Linting & Type Checking Failures](#linting--type-checking-failures)
3. [Test Failures](#test-failures)
4. [E2E Test Failures](#e2e-test-failures)
5. [Security Scan Failures](#security-scan-failures)
6. [Deployment Failures](#deployment-failures)
7. [Performance Issues](#performance-issues)
8. [Workflow Execution Issues](#workflow-execution-issues)

---

## General Troubleshooting

### Workflow Not Triggering

**Symptoms:**
- Workflow doesn't run on push/PR
- Manual trigger not working
- Scheduled workflow not running

**Diagnostic Steps:**

1. **Check workflow file syntax:**
   ```bash
   # Validate YAML syntax
   npm install -g yaml-validator
   yaml-validator .github/workflows/your-workflow.yml
   ```

2. **Verify trigger conditions:**
   - Check `on:` section in workflow file
   - Ensure branch names match (e.g., `main` vs `master`)
   - Verify branch protection rules aren't blocking

3. **Check workflow status:**
   - Go to Actions tab in GitHub
   - Look for disabled workflows (yellow icon)
   - Check for workflow errors in the UI

**Solutions:**

- **Enable disabled workflow:**
  ```bash
  # Re-enable via GitHub UI: Actions → Select workflow → Enable
  ```

- **Fix branch name mismatch:**
  ```yaml
  on:
    push:
      branches: [main, develop]  # Ensure correct branch names
  ```

- **Check schedule syntax:**
  ```yaml
  schedule:
    - cron: '0 0 * * 1'  # Monday at midnight UTC
  ```

### Workflow Timeout

**Symptoms:**
- Workflow runs for 6+ hours
- Job marked as "timed out"
- No clear error message

**Diagnostic Steps:**

1. **Check job duration:**
   - Review workflow run logs
   - Identify which step is taking longest
   - Look for hanging processes

2. **Identify resource bottlenecks:**
   - Check for infinite loops
   - Look for network timeouts
   - Verify database connections

**Solutions:**

- **Add timeout to jobs:**
  ```yaml
  jobs:
    test:
      runs-on: ubuntu-latest
      timeout-minutes: 30  # Set explicit timeout
  ```

- **Add timeout to steps:**
  ```yaml
  - name: Run tests
    timeout-minutes: 15
    run: npm test
  ```

- **Kill hanging processes:**
  ```bash
  # In workflow step
  - name: Kill hanging processes
    if: always()
    run: |
      pkill -f "node" || true
      pkill -f "npm" || true
  ```

---

## Linting & Type Checking Failures

### ESLint Errors

**Symptoms:**
- Workflow fails with "ESLint errors found"
- PR shows linting violations
- Error message includes file paths and line numbers

**Diagnostic Steps:**

1. **Run linting locally:**
   ```bash
   npm run lint
   ```

2. **Check specific file:**
   ```bash
   npx eslint path/to/file.ts
   ```

3. **Review ESLint config:**
   ```bash
   cat .eslintrc.json
   ```

**Solutions:**

- **Fix linting errors automatically:**
  ```bash
  npm run lint:fix
  ```

- **Fix specific file:**
  ```bash
  npx eslint path/to/file.ts --fix
  ```

- **Disable rule for specific line:**
  ```typescript
  // eslint-disable-next-line rule-name
  const problematicCode = ...;
  ```

- **Update ESLint config:**
  ```json
  {
    "rules": {
      "rule-name": "off"  // Disable rule
    }
  }
  ```

### TypeScript Type Errors

**Symptoms:**
- Workflow fails with "TypeScript compilation error"
- Error shows "Type 'X' is not assignable to type 'Y'"
- "Cannot find module" errors

**Diagnostic Steps:**

1. **Run type checking locally:**
   ```bash
   npm run typecheck
   ```

2. **Check specific file:**
   ```bash
   npx tsc path/to/file.ts --noEmit
   ```

3. **Review tsconfig:**
   ```bash
   cat tsconfig.json
   ```

**Solutions:**

- **Fix type errors:**
  ```typescript
  // Before
  const value: string = 123;  // ❌ Type error
  
  // After
  const value: string = "123";  // ✅ Correct
  ```

- **Add type annotations:**
  ```typescript
  // Before
  function process(data) {  // ❌ Implicit any
    return data.value;
  }
  
  // After
  function process(data: { value: string }): string {  // ✅ Explicit types
    return data.value;
  }
  ```

- **Install missing types:**
  ```bash
  npm install --save-dev @types/package-name
  ```

- **Suppress type error (last resort):**
  ```typescript
  // @ts-ignore
  const value: string = 123;
  ```

---

## Test Failures

### Unit Test Failures

**Symptoms:**
- Workflow fails with "X tests failed"
- Error shows test name and assertion failure
- Coverage below threshold

**Diagnostic Steps:**

1. **Run tests locally:**
   ```bash
   npm run test:unit
   ```

2. **Run specific test file:**
   ```bash
   npm run test:unit -- path/to/test.spec.ts
   ```

3. **Run with verbose output:**
   ```bash
   npm run test:unit -- --verbose
   ```

4. **Check coverage:**
   ```bash
   npm run test:coverage
   ```

**Solutions:**

- **Fix failing test:**
  ```typescript
  // Review test assertion
  expect(result).toBe(expectedValue);
  
  // Debug with console.log
  console.log('Actual:', result);
  console.log('Expected:', expectedValue);
  ```

- **Update test for code change:**
  ```typescript
  // If code behavior changed, update test
  expect(result).toBe(newExpectedValue);
  ```

- **Increase coverage:**
  ```bash
  # Identify uncovered lines
  npm run test:coverage
  
  # Add tests for uncovered code
  ```

- **Skip flaky test temporarily:**
  ```typescript
  it.skip('flaky test', () => {
    // TODO: Fix flaky test
  });
  ```

### Integration Test Failures

**Symptoms:**
- Tests pass locally but fail in CI
- Database connection errors
- Service not available errors

**Diagnostic Steps:**

1. **Check service containers:**
   ```bash
   # In workflow logs, look for service startup errors
   ```

2. **Verify environment variables:**
   ```bash
   # Check if test env vars are set
   echo $DATABASE_URL
   ```

3. **Test database connection:**
   ```bash
   npm run test:integration -- --verbose
   ```

**Solutions:**

- **Wait for services to start:**
  ```yaml
  - name: Wait for services
    run: |
      npm run wait-for-db
      npm run wait-for-redis
  ```

- **Set environment variables:**
  ```yaml
  env:
    DATABASE_URL: postgresql://user:pass@localhost/testdb
    REDIS_URL: redis://localhost:6379
  ```

- **Use service containers:**
  ```yaml
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_PASSWORD: password
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
  ```

### Coverage Below Threshold

**Symptoms:**
- Workflow fails with "Coverage X% below 80% threshold"
- Coverage report shows uncovered lines

**Diagnostic Steps:**

1. **Generate coverage report:**
   ```bash
   npm run test:coverage
   ```

2. **View coverage details:**
   ```bash
   open coverage/index.html  # macOS
   start coverage/index.html  # Windows
   ```

3. **Identify uncovered code:**
   - Red lines in coverage report = uncovered
   - Yellow lines = partially covered

**Solutions:**

- **Add tests for uncovered code:**
  ```typescript
  describe('uncovered function', () => {
    it('should handle case X', () => {
      const result = uncoveredFunction(input);
      expect(result).toBe(expected);
    });
  });
  ```

- **Lower coverage threshold (if justified):**
  ```yaml
  - name: Check coverage threshold
    run: |
      COVERAGE_THRESHOLD=75  # Lower from 80
      # ... rest of check
  ```

---

## E2E Test Failures

### Playwright Test Failures

**Symptoms:**
- Workflow fails with "X E2E tests failed"
- Screenshot shows page in unexpected state
- Timeout waiting for element

**Diagnostic Steps:**

1. **Run E2E tests locally:**
   ```bash
   npm run test:e2e
   ```

2. **Run specific test:**
   ```bash
   npx playwright test path/to/test.spec.ts
   ```

3. **Run in headed mode (see browser):**
   ```bash
   npx playwright test --headed
   ```

4. **Debug specific test:**
   ```bash
   npx playwright test --debug
   ```

**Solutions:**

- **Fix element selector:**
  ```typescript
  // Before - selector too generic
  await page.click('button');
  
  // After - specific selector
  await page.click('button:has-text("Submit")');
  ```

- **Add wait for element:**
  ```typescript
  // Before - element not ready
  await page.click('#submit');
  
  // After - wait for element
  await page.waitForSelector('#submit');
  await page.click('#submit');
  ```

- **Increase timeout:**
  ```typescript
  // Before - default 30s timeout
  await page.goto(url);
  
  // After - custom timeout
  await page.goto(url, { timeout: 60000 });
  ```

- **Handle flaky test:**
  ```typescript
  // Retry flaky test
  test.describe.configure({ retries: 2 });
  
  test('flaky test', async ({ page }) => {
    // test code
  });
  ```

### E2E Test Timeout

**Symptoms:**
- Test times out waiting for element
- Navigation takes too long
- API response slow

**Diagnostic Steps:**

1. **Check test logs:**
   - Look for "Timeout waiting for selector"
   - Check network requests in trace

2. **Review test environment:**
   - Is test database seeded?
   - Are services running?

**Solutions:**

- **Increase test timeout:**
  ```typescript
  test.setTimeout(60000);  // 60 seconds
  ```

- **Add explicit waits:**
  ```typescript
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.loaded');
  ```

- **Check test data:**
  ```bash
  # Verify test database is seeded
  npm run seed:test
  ```

---

## Security Scan Failures

### npm Audit Failures

**Symptoms:**
- Workflow fails with "X vulnerabilities found"
- Error shows package name and CVE

**Diagnostic Steps:**

1. **Run npm audit locally:**
   ```bash
   npm audit
   ```

2. **Get detailed report:**
   ```bash
   npm audit --json > audit-report.json
   ```

3. **Check specific package:**
   ```bash
   npm audit --package=package-name
   ```

**Solutions:**

- **Update vulnerable package:**
  ```bash
  npm update package-name
  ```

- **Update all packages:**
  ```bash
  npm audit fix
  ```

- **Force update (breaking changes possible):**
  ```bash
  npm audit fix --force
  ```

- **Audit specific severity:**
  ```bash
  npm audit --audit-level=high  # Fail on high/critical only
  ```

### Secret Detection Failures

**Symptoms:**
- Workflow fails with "Secrets detected in code"
- Error shows file path and line number

**Diagnostic Steps:**

1. **Run secret scan locally:**
   ```bash
   npm run security:scan
   ```

2. **Check for hardcoded secrets:**
   ```bash
   grep -r "password\|api_key\|secret" src/
   ```

**Solutions:**

- **Remove hardcoded secret:**
  ```typescript
  // Before - ❌ Hardcoded
  const apiKey = "sk_live_abc123";
  
  // After - ✅ Environment variable
  const apiKey = process.env.API_KEY;
  ```

- **Add to .env.example (without value):**
  ```bash
  API_KEY=your_key_here
  ```

- **Rotate compromised secret:**
  - Regenerate API key in service
  - Update GitHub secret
  - Force push to remove from history (if needed)

---

## Deployment Failures

### Staging Deployment Failures

**Symptoms:**
- Workflow fails during "Deploy to staging"
- Health checks fail
- Services not responding

**Diagnostic Steps:**

1. **Check deployment logs:**
   - Review workflow run logs
   - Look for error messages

2. **Verify staging environment:**
   ```bash
   curl https://staging.azora.world/health
   ```

3. **Check service status:**
   ```bash
   # SSH to staging server
   ssh staging-user@staging-host
   docker ps  # Check running containers
   ```

**Solutions:**

- **Check database migrations:**
  ```bash
  # Verify migrations ran successfully
  npm run migrate:status
  ```

- **Verify environment variables:**
  ```bash
  # Check staging secrets are configured
  # GitHub Settings → Environments → staging
  ```

- **Restart services:**
  ```bash
  # On staging server
  docker-compose restart
  ```

- **Check disk space:**
  ```bash
  df -h  # Check available space
  ```

### Production Deployment Failures

**Symptoms:**
- Workflow fails during "Deploy to production"
- Rollback triggered
- Services down

**Diagnostic Steps:**

1. **Check pre-deployment validation:**
   - All status checks passed?
   - Security scan passed?
   - Staging deployment successful?

2. **Review deployment logs:**
   - Look for specific error
   - Check health check failures

3. **Verify production environment:**
   ```bash
   curl https://azora.world/health
   ```

**Solutions:**

- **Check database backup:**
  ```bash
  # Verify backup created before migration
  ls -la /backups/
  ```

- **Verify database migrations:**
  ```bash
  # Check migration status
  npm run migrate:status
  ```

- **Trigger rollback:**
  ```bash
  # If deployment failed, rollback available for 1 hour
  # GitHub Actions → deploy-production → Rollback job
  ```

- **Manual rollback:**
  ```bash
  # On production server
  docker-compose down
  docker-compose up -d  # Previous version
  ```

### Health Check Failures

**Symptoms:**
- Deployment fails at health check step
- Services return 500 error
- Timeout waiting for health endpoint

**Diagnostic Steps:**

1. **Test health endpoint manually:**
   ```bash
   curl -v https://azora.world/health
   ```

2. **Check service logs:**
   ```bash
   docker logs service-name
   ```

3. **Verify dependencies:**
   - Database connection working?
   - Redis connection working?
   - External APIs accessible?

**Solutions:**

- **Increase health check timeout:**
  ```yaml
  env:
    HEALTH_CHECK_TIMEOUT: 600  # 10 minutes
  ```

- **Add startup delay:**
  ```yaml
  - name: Wait for services to start
    run: sleep 30
  ```

- **Check service logs:**
  ```bash
  docker logs -f service-name
  ```

---

## Performance Issues

### Slow Workflow Execution

**Symptoms:**
- Workflow takes 30+ minutes
- Specific job is slow
- Inconsistent execution time

**Diagnostic Steps:**

1. **Review workflow timeline:**
   - Check Actions tab for job durations
   - Identify slowest job

2. **Check resource usage:**
   - CPU usage high?
   - Memory usage high?
   - Disk I/O bottleneck?

**Solutions:**

- **Enable caching:**
  ```yaml
  - uses: actions/setup-node@v4
    with:
      node-version: 20.x
      cache: 'npm'  # Cache node_modules
  ```

- **Parallelize jobs:**
  ```yaml
  strategy:
    matrix:
      node-version: [18.x, 20.x, 22.x]
  ```

- **Skip unnecessary steps:**
  ```yaml
  - name: Run tests
    if: github.event_name == 'pull_request'
    run: npm test
  ```

### Artifact Upload Slow

**Symptoms:**
- "Upload artifacts" step takes 5+ minutes
- Large artifact size

**Diagnostic Steps:**

1. **Check artifact size:**
   ```bash
   du -sh coverage/
   du -sh test-results/
   ```

2. **Review artifact retention:**
   - How many artifacts stored?
   - How old are they?

**Solutions:**

- **Exclude unnecessary files:**
  ```yaml
  - uses: actions/upload-artifact@v3
    with:
      name: coverage
      path: coverage/
      exclude-patterns: |
        **/*.map
        **/node_modules/
  ```

- **Compress artifacts:**
  ```bash
  tar -czf coverage.tar.gz coverage/
  ```

- **Clean old artifacts:**
  ```yaml
  - name: Delete old artifacts
    uses: geekyeggo/delete-artifact@v2
    with:
      name: coverage
  ```

---

## Workflow Execution Issues

### Concurrency Issues

**Symptoms:**
- Multiple workflow runs interfere with each other
- Deployment conflicts
- Database lock errors

**Solutions:**

- **Use concurrency groups:**
  ```yaml
  concurrency:
    group: deploy-${{ github.ref }}
    cancel-in-progress: false  # Don't cancel in-progress
  ```

- **Queue deployments:**
  ```yaml
  concurrency:
    group: production-deploy
    cancel-in-progress: false  # Wait for previous to complete
  ```

### Secrets Not Available

**Symptoms:**
- Workflow fails with "Secret not found"
- Environment variable empty
- Authentication fails

**Diagnostic Steps:**

1. **Verify secret exists:**
   - GitHub Settings → Secrets and variables → Actions
   - Check secret name matches workflow

2. **Check environment:**
   - Is secret in correct environment?
   - Is job using correct environment?

**Solutions:**

- **Add missing secret:**
  ```bash
  # GitHub Settings → Secrets and variables → Actions → New repository secret
  ```

- **Use correct secret name:**
  ```yaml
  env:
    API_KEY: ${{ secrets.API_KEY }}  # Exact name match
  ```

- **Use environment secrets:**
  ```yaml
  jobs:
    deploy:
      environment: production
      env:
        API_KEY: ${{ secrets.API_KEY }}  # From production environment
  ```

### Permission Denied Errors

**Symptoms:**
- "Permission denied" when accessing files
- Cannot write to directory
- SSH key not working

**Solutions:**

- **Check file permissions:**
  ```bash
  ls -la path/to/file
  chmod +x script.sh  # Make executable
  ```

- **Verify SSH key:**
  ```yaml
  - name: Deploy via SSH
    env:
      DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
    run: |
      mkdir -p ~/.ssh
      echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
      chmod 600 ~/.ssh/deploy_key
      ssh-keyscan -H host >> ~/.ssh/known_hosts
  ```

---

## Getting Help

If you can't resolve the issue:

1. **Check workflow logs** - Most detailed information
2. **Review this guide** - Common solutions
3. **Search GitHub issues** - Similar problems
4. **Contact DevOps team** - For infrastructure issues
5. **Create issue** - Document problem and steps to reproduce

## Quick Reference

| Issue | Command |
|-------|---------|
| Run tests locally | `npm run test:unit` |
| Run linting | `npm run lint` |
| Run type checking | `npm run typecheck` |
| Run E2E tests | `npm run test:e2e` |
| Run security scan | `npm run security:audit` |
| Fix linting errors | `npm run lint:fix` |
| Check coverage | `npm run test:coverage` |
| View workflow logs | GitHub Actions tab |

