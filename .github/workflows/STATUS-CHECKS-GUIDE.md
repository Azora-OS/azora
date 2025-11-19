# CI/CD Status Checks & PR Integration Guide

## Overview

The CI/CD Status Checks workflow aggregates all required and optional checks for pull requests, providing clear visibility into the health of your code before merging. This guide explains how the status checks work and how to troubleshoot failures.

## Status Check Categories

### 🔴 Required Checks (Must Pass to Merge)

These checks must pass before a PR can be merged to `main` or `develop` branches:

1. **CI - Linting & Type Checking**
   - ESLint validation across all TypeScript/JavaScript files
   - TypeScript strict mode type checking
   - No implicit any types allowed
   - Runs on: Every push and PR

2. **Test Suite**
   - Jest unit tests across Node 18, 20, 22
   - Integration tests with database and Redis
   - Minimum 80% code coverage enforcement
   - Runs on: Every push and PR

3. **Security Scanning**
   - npm audit for dependency vulnerabilities
   - CodeQL SAST analysis for code-level issues
   - TruffleHog secret detection
   - Runs on: Every push and PR (plus weekly schedule)

### 🟡 Optional Checks (Recommended)

These checks are recommended but don't block merging:

1. **E2E Tests**
   - Playwright end-to-end tests across Chromium, Firefox, WebKit
   - Tests critical user journeys
   - Parallel execution with 4 workers per browser
   - Runs on: Every PR and daily schedule

## PR Integration Features

### Status Summary Comment

When you open or update a PR, the workflow automatically posts a status summary comment showing:

- ✅ Passed checks
- ❌ Failed checks
- ⏳ In-progress checks
- ⊘ Skipped checks

Example:
```
## ✅ Status Checks Summary

### 🔴 Required Checks

| Check | Status |
|-------|--------|
| CI - Linting & Type Checking | ✅ success |
| Test Suite | ✅ success |
| Security Scanning | ✅ success |

### 🟡 Optional Checks (Recommended)

| Check | Status |
|-------|--------|
| E2E Tests | ⏳ in_progress |

### 🎉 Merge Ready
All required checks have passed. This PR is ready to merge.
```

### Failure Guidance

If any required checks fail, the workflow automatically posts a troubleshooting guide with:

- What went wrong
- How to fix it locally
- Common issues and solutions
- Links to relevant documentation

### Status Badges

The README displays real-time status badges for each workflow:

```markdown
[![Tests](https://github.com/Sizwe780/azora-os/workflows/Test%20Suite/badge.svg?branch=main)](...)
[![Linting & Type Check](https://github.com/Sizwe780/azora-os/workflows/CI%20-%20Linting%20%26%20Type%20Checking/badge.svg?branch=main)](...)
[![Security Scan](https://github.com/Sizwe780/azora-os/workflows/Security%20Scanning/badge.svg?branch=main)](...)
[![E2E Tests](https://github.com/Sizwe780/azora-os/workflows/E2E%20Tests/badge.svg?branch=main)](...)
```

## Troubleshooting Failed Checks

### ❌ Linting & Type Checking Failed

**Symptoms:**
- ESLint errors in PR comment
- TypeScript compilation errors
- "no implicit any" violations

**How to fix:**

1. Run locally to see all errors:
   ```bash
   npm run lint
   npm run typecheck
   ```

2. Auto-fix style issues:
   ```bash
   npm run lint:fix
   ```

3. Manually fix remaining issues:
   - Review error messages for file paths and line numbers
   - Check the [ESLint rules](../.eslintrc.json)
   - Ensure all types are properly defined

4. Commit and push:
   ```bash
   git add .
   git commit -m "fix: resolve linting and type errors"
   git push
   ```

**Common issues:**
- Unused imports: Remove or use them
- Undefined variables: Check spelling and scope
- Type mismatches: Ensure types match function signatures
- Missing semicolons: Run `npm run lint:fix`

### ❌ Test Suite Failed

**Symptoms:**
- Unit or integration tests failing
- Coverage below 80% threshold
- Test timeout errors

**How to fix:**

1. Run tests locally:
   ```bash
   npm run test:unit
   npm run test:integration
   npm run test:coverage
   ```

2. Review test output:
   - Check which tests are failing
   - Review the error messages and stack traces
   - Look at the test file to understand what's being tested

3. Fix the code or tests:
   - If the code is wrong, fix the implementation
   - If the test is wrong, fix the test
   - Ensure all new code has corresponding tests

4. Check coverage:
   ```bash
   npm run test:coverage
   ```
   - Coverage must be at least 80%
   - Add tests for uncovered code paths

5. Commit and push:
   ```bash
   git add .
   git commit -m "fix: resolve test failures and improve coverage"
   git push
   ```

**Common issues:**
- Database connection errors: Ensure PostgreSQL and Redis are running
- Timeout errors: Increase timeout or optimize slow tests
- Coverage below threshold: Add tests for uncovered code
- Flaky tests: Review test setup and teardown

### ❌ Security Scanning Failed

**Symptoms:**
- npm audit vulnerabilities found
- CodeQL security issues detected
- Hardcoded secrets detected

**How to fix:**

1. Review npm audit results:
   ```bash
   npm audit
   ```

2. Update vulnerable packages:
   ```bash
   npm audit fix
   ```

3. For packages that can't be auto-fixed:
   - Update package.json manually
   - Run `npm ci` to update lock file
   - Test thoroughly to ensure compatibility

4. For CodeQL issues:
   - Review the security issue details
   - Apply the recommended fix
   - Test the change

5. For detected secrets:
   - Remove the secret from the code
   - Use environment variables instead
   - Rotate the exposed credential
   - Add the pattern to .gitignore

6. Commit and push:
   ```bash
   git add .
   git commit -m "fix: resolve security vulnerabilities"
   git push
   ```

**Common issues:**
- Outdated dependencies: Run `npm audit fix`
- Hardcoded credentials: Use environment variables
- Unsafe code patterns: Review CodeQL recommendations
- Transitive dependencies: May require updating parent packages

### ⏳ E2E Tests Failed (Optional)

**Symptoms:**
- Playwright tests failing
- Screenshots/videos showing test failures
- Timeout errors in E2E tests

**How to fix:**

1. Download test artifacts:
   - Go to the GitHub Actions run
   - Download screenshots and videos
   - Review what went wrong

2. Run E2E tests locally:
   ```bash
   npm run test:e2e
   ```

3. Debug the failing test:
   - Review the test code
   - Check if the application is running
   - Verify test data is seeded correctly
   - Use Playwright Inspector: `PWDEBUG=1 npm run test:e2e`

4. Fix the test or application:
   - If the application is broken, fix the code
   - If the test is flaky, improve the test
   - Add waits for dynamic content if needed

5. Commit and push:
   ```bash
   git add .
   git commit -m "fix: resolve E2E test failures"
   git push
   ```

**Note:** E2E test failures don't block merging, but should be addressed before deployment.

## Local Workflow Simulation

To simulate the CI/CD pipeline locally before pushing:

```bash
# Run all checks in order
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:coverage
npm audit
npm run test:e2e
```

Or run individual checks:

```bash
# Linting
npm run lint
npm run lint:fix  # Auto-fix style issues

# Type checking
npm run typecheck

# Testing
npm run test:unit
npm run test:integration
npm run test:coverage

# Security
npm audit
npm audit fix

# E2E
npm run test:e2e
```

## Understanding Check Status

### Status Values

- **✅ success**: Check passed
- **❌ failure**: Check failed (blocks merge if required)
- **⏳ in_progress**: Check is still running
- **⊘ skipped**: Check was skipped (usually due to conditions)
- **⚠️ neutral**: Check completed but didn't pass or fail

### Merge Requirements

A PR can be merged when:
1. ✅ All required checks have passed
2. ✅ At least one approval from a code reviewer
3. ✅ No conflicts with the base branch

Optional checks don't block merging but are recommended to pass.

## Artifacts & Reports

Each workflow generates artifacts that are available for 30-365 days:

### Test Suite Artifacts
- Coverage reports (HTML, JSON, LCOV)
- Test results (JSON format)
- Retention: 30 days

### Security Scanning Artifacts
- npm audit reports
- CodeQL analysis results
- Secret detection reports
- Retention: 365 days

### E2E Testing Artifacts
- HTML test reports
- JUnit XML results
- Test videos (on failure)
- Test screenshots (on failure)
- Retention: 30 days (7 days for videos/screenshots)

### Accessing Artifacts

1. Go to the GitHub Actions run
2. Scroll to "Artifacts" section
3. Download the artifact you want to review
4. Extract and open in your browser or text editor

## Performance Considerations

### Workflow Execution Time

- **Linting & Type Check**: ~2-3 minutes
- **Test Suite**: ~5-10 minutes (parallel across Node versions)
- **Security Scanning**: ~3-5 minutes
- **E2E Tests**: ~10-15 minutes (parallel across browsers)
- **Total**: ~15-25 minutes for all checks

### Optimization Tips

1. **Use npm caching**: Workflows cache dependencies automatically
2. **Run checks locally first**: Catch issues before pushing
3. **Parallel execution**: Checks run in parallel where possible
4. **Selective testing**: E2E tests can be skipped for documentation-only changes

## Workflow Configuration

### Required Secrets

The following secrets must be configured in GitHub repository settings:

- `SAST_API_KEY` - For SAST scanning (if using external tool)
- `NPM_TOKEN` - For npm package publishing (if applicable)

### Environment Variables

- `NODE_VERSIONS`: Supported Node versions (18, 20, 22)
- `COVERAGE_THRESHOLD`: Minimum coverage percentage (80%)
- `SECURITY_SEVERITY_THRESHOLD`: Fail on high/critical vulnerabilities

### Branch Protection Rules

Recommended branch protection rules for `main` and `develop`:

1. Require status checks to pass:
   - CI - Linting & Type Checking
   - Test Suite
   - Security Scanning

2. Require code review approvals: 1-2 reviewers

3. Require branches to be up to date before merging

4. Require conversation resolution before merging

## FAQ

**Q: Can I merge if E2E tests fail?**
A: Yes, E2E tests are optional. However, you should investigate and fix failures before deploying to production.

**Q: How do I skip a check?**
A: You can't skip required checks. For optional checks, they'll be skipped if conditions aren't met. Contact the team if you need to disable a check.

**Q: Why is my check taking so long?**
A: Checks run in parallel but may queue if GitHub Actions is busy. Large test suites or security scans can take longer. Check the workflow logs for details.

**Q: Can I re-run a failed check?**
A: Yes, click "Re-run failed jobs" on the GitHub Actions run page. This will re-run only the failed checks.

**Q: How do I update the status badges?**
A: The badges are automatically generated by GitHub. They update in real-time as workflows complete.

**Q: What if a check is flaky?**
A: Flaky checks (that sometimes pass, sometimes fail) should be investigated and fixed. Contact the team if you suspect a check is flaky.

## Support

For questions or issues with CI/CD checks:

1. Check this guide for troubleshooting steps
2. Review the individual workflow documentation
3. Check the GitHub Actions logs for detailed error messages
4. Ask in #dev-help on Slack
5. Create an issue in the repository

## Related Documentation

- [Linting & Type Checking Guide](./.github/workflows/LINTING-TYPECHECK-GUIDE.md)
- [Security Scanning Guide](./.github/workflows/SECURITY-SCANNING-GUIDE.md)
- [E2E Testing Guide](./.github/workflows/E2E-OPTIMIZATION-GUIDE.md)
- [Testing Guidelines](../../docs/TESTING-GUIDELINES.md)
- [CI/CD Workflows README](./README.md)
