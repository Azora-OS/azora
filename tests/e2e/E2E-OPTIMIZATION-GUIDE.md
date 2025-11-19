# E2E Testing Optimization Guide

## Overview

This guide documents the optimized E2E testing workflow for Azora OS, including configuration, best practices, and troubleshooting.

## Test Environment Setup

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15 (for test database)
- Redis 7 (for caching)
- Playwright browsers installed

### Environment Variables

```bash
NODE_ENV=test
DATABASE_URL=postgresql://postgres:test@localhost:5432/azora_test
REDIS_URL=redis://localhost:6379
BASE_URL=http://localhost:3000
```

### Database Seeding

The test environment is automatically seeded with:
- Test users (student, instructor, admin)
- Sample courses with lessons
- Test payment methods
- Mock transaction history

Run seeding manually:
```bash
npm run db:migrate
npm run db:seed
```

## Running E2E Tests

### Local Development

Run all E2E tests:
```bash
npm run test:e2e
```

Run tests for specific browser:
```bash
npx playwright test --project=chromium
```

Run tests in headed mode (see browser):
```bash
npx playwright test --headed
```

Run specific test file:
```bash
npx playwright test tests/e2e/subscription-flow.spec.ts
```

Run tests matching pattern:
```bash
npx playwright test -g "subscription"
```

### CI/CD Pipeline

The GitHub Actions workflow runs:
- **3 browsers**: Chromium, Firefox, WebKit
- **4 shards per browser**: Parallel execution
- **4 workers per shard**: Maximum parallelization
- **2 retries on failure**: For flaky tests

Total test matrix: 3 browsers × 4 shards × 4 workers = 48 parallel test executions

## Test Configuration

### Playwright Config (`playwright.config.ts`)

Key settings:
- **Timeout**: 30 seconds per test
- **Expect timeout**: 5 seconds for assertions
- **Action timeout**: 10 seconds per action
- **Retries**: 2 on CI, 0 locally
- **Workers**: 4 on CI, unlimited locally
- **Trace**: Captured on first retry
- **Screenshots**: Only on failure
- **Videos**: Retained on failure

### Test Utilities (`tests/e2e/fixtures/test-utils.ts`)

Common helpers:
- `loginUser()` - Authenticate user
- `registerUser()` - Create new user
- `enrollInCourse()` - Enroll in course
- `completePayment()` - Process payment
- `requestWithdrawal()` - Request token withdrawal
- `waitForElement()` - Wait for element visibility
- `verifySuccessMessage()` - Verify success notification
- `verifyErrorMessage()` - Verify error notification
- `retryAction()` - Retry with exponential backoff
- `getPerformanceMetrics()` - Measure page load time
- `verifyAPIResponse()` - Verify API calls
- `waitForNetworkIdle()` - Wait for network idle
- `clearBrowserStorage()` - Clear localStorage/sessionStorage
- `captureConsoleLogs()` - Capture console output
- `verifyNoConsoleErrors()` - Check for console errors

### Test Data (`tests/e2e/fixtures/test-data.ts`)

Predefined test data:
- Test users (student, instructor, admin)
- Test courses (Python, JavaScript, Business)
- Test payment methods (valid, invalid)
- Test bank accounts
- Test withdrawal amounts

## Test Organization

### Test Structure

```
tests/e2e/
├── fixtures/
│   ├── test-utils.ts       # Helper functions
│   └── test-data.ts        # Test data fixtures
├── auth/                   # Authentication tests
├── education/              # Course/education tests
├── tests/                  # Additional test suites
├── playwright.config.ts    # Playwright configuration
├── playwright.setup.ts     # Global setup/teardown
└── *.spec.ts              # Test files
```

### Test File Naming

- `*.spec.ts` - Playwright test files
- `*.setup.ts` - Setup/teardown files
- `*.test.ts` - Jest test files (not E2E)

## Best Practices

### 1. Test Isolation

Each test should be independent:
- Use unique test data (timestamps, random IDs)
- Clean up after tests (logout, clear storage)
- Don't depend on test execution order

```typescript
test('should complete subscription flow', async ({ page }) => {
  const testEmail = `test-${Date.now()}@azora.test`;
  // Test code...
});
```

### 2. Waits and Timeouts

Use appropriate waits:
- `waitForLoadState()` - Wait for page load
- `waitForSelector()` - Wait for element
- `waitForNavigation()` - Wait for navigation
- `waitForResponse()` - Wait for API response

```typescript
await page.waitForLoadState('networkidle');
await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });
```

### 3. Error Handling

Capture failures for debugging:
- Screenshots on failure (automatic)
- Videos on failure (automatic)
- Console logs (use `captureConsoleLogs()`)
- Network logs (use `verifyAPIResponse()`)

### 4. Performance

Optimize test execution:
- Use parallel execution (sharding)
- Minimize waits and timeouts
- Reuse test data where possible
- Cache dependencies

### 5. Accessibility

Include accessibility checks:
- Verify heading structure
- Check alt text on images
- Test keyboard navigation
- Verify ARIA labels

```typescript
await checkAccessibility(page);
```

## Debugging

### View Test Report

After running tests:
```bash
npx playwright show-report
```

### Debug Single Test

Run with inspector:
```bash
npx playwright test --debug tests/e2e/subscription-flow.spec.ts
```

### Headed Mode

See browser during test:
```bash
npx playwright test --headed --project=chromium
```

### Trace Viewer

View recorded trace:
```bash
npx playwright show-trace trace.zip
```

### Console Logs

Capture and verify console output:
```typescript
const logs = await captureConsoleLogs(page);
const errors = await verifyNoConsoleErrors(page);
```

## Troubleshooting

### Flaky Tests

**Problem**: Tests pass sometimes, fail other times

**Solutions**:
- Increase timeout values
- Use `retryAction()` for unreliable operations
- Wait for network idle before assertions
- Avoid hard-coded delays (use `waitForElement()`)

### Timeout Errors

**Problem**: "Timeout waiting for element"

**Solutions**:
- Check element selector is correct
- Verify element is visible (not hidden)
- Increase timeout value
- Check if page navigation occurred

### Database Issues

**Problem**: "Database connection failed"

**Solutions**:
```bash
# Verify database is running
psql -U postgres -d azora_test -c "SELECT 1"

# Reset database
npm run db:migrate
npm run db:seed

# Check environment variables
echo $DATABASE_URL
```

### Browser Issues

**Problem**: "Browser launch failed"

**Solutions**:
```bash
# Reinstall browsers
npx playwright install --with-deps

# Check browser compatibility
npx playwright install-deps
```

## CI/CD Integration

### GitHub Actions Workflow

The workflow (`e2e-tests.yml`) includes:

1. **Setup Job**: Prepares test environment
   - Installs dependencies
   - Runs database migrations
   - Seeds test data

2. **Test Jobs**: Runs tests in parallel
   - 3 browsers × 4 shards = 12 parallel jobs
   - Each job runs 4 workers
   - Retries failed tests 2 times

3. **Results Job**: Publishes test results
   - Aggregates JUnit XML results
   - Posts results to PR
   - Generates summary

4. **Summary Job**: Creates workflow summary
   - Lists test configuration
   - Shows artifact locations
   - Reports overall status

### Artifact Retention

- HTML reports: 30 days
- JUnit results: 30 days
- Videos: 7 days (on failure)
- Screenshots: 7 days (on failure)

### Status Checks

E2E tests are optional but recommended:
- Required: Lint, TypeScript, Unit tests
- Recommended: E2E tests, Security scan

## Performance Metrics

### Expected Execution Times

- Single test: 5-30 seconds
- Full suite (local): 10-15 minutes
- Full suite (CI): 5-10 minutes (with parallelization)

### Optimization Tips

1. **Parallel Execution**: Use sharding and workers
2. **Caching**: Cache dependencies and build artifacts
3. **Selective Testing**: Run only affected tests
4. **Scheduled Runs**: Run full suite on schedule, quick tests on PR

## Maintenance

### Regular Tasks

- Review and update test data
- Update selectors if UI changes
- Monitor test execution times
- Review flaky test patterns
- Update Playwright version quarterly

### Updating Playwright

```bash
npm install @playwright/test@latest
npx playwright install --with-deps
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Debugging](https://playwright.dev/docs/debug)
- [Playwright CI/CD](https://playwright.dev/docs/ci)

## Support

For issues or questions:
1. Check this guide and troubleshooting section
2. Review test reports and artifacts
3. Check Playwright documentation
4. Open issue with test logs and reproduction steps
