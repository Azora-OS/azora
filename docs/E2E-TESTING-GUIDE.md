# E2E Testing Guide

## Overview

This guide covers end-to-end (E2E) testing for Azora OS using Playwright. E2E tests validate complete user journeys and critical workflows across the entire application.

## Test Structure

### Critical Journeys

The E2E test suite covers four critical user journeys:

1. **User Signup Flow** - User registration and account creation
2. **Course Enrollment Flow** - Browsing and enrolling in courses
3. **Payment Flow** - Completing payments for premium courses
4. **Withdrawal Flow** - Requesting and tracking withdrawals

### Test Files

```
tests/e2e/
├── critical-journeys.spec.ts      # Main critical journey tests
├── complete-user-journey.spec.ts  # Full user workflow
├── payment.spec.ts                # Payment system tests
├── student-portal.spec.ts         # Student portal tests
├── marketplace.spec.ts            # Marketplace tests
├── fixtures/
│   ├── test-data.ts              # Test data and fixtures
│   └── test-utils.ts             # Helper functions
└── playwright.setup.ts            # Global setup
```

## Running E2E Tests

### Local Development

Run all E2E tests:
```bash
npm run test:e2e
```

Run tests in a specific browser:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Run a specific test file:
```bash
npx playwright test tests/e2e/critical-journeys.spec.ts
```

Run tests matching a pattern:
```bash
npx playwright test --grep "signup"
```

Run tests in debug mode:
```bash
npx playwright test --debug
```

Run tests with UI mode (interactive):
```bash
npx playwright test --ui
```

### CI/CD Pipeline

E2E tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch
- Daily schedule (2 AM UTC)

Tests run across multiple browsers (Chromium, Firefox, WebKit) and mobile viewports.

## Test Data Setup

### Using Test Fixtures

Test data is defined in `tests/e2e/fixtures/test-data.ts`:

```typescript
import { testUsers, testCourses, testPayments, generateTestEmail } from './fixtures/test-data';

// Use predefined test data
const student = testUsers.student;
const course = testCourses.python;

// Generate unique test data
const uniqueEmail = generateTestEmail('student');
```

### Test Data Categories

- **Users**: Student, Instructor, Admin accounts
- **Courses**: Python, JavaScript, Business courses
- **Payments**: Valid and invalid test cards
- **Bank Accounts**: Primary and secondary accounts
- **Withdrawals**: Small, medium, large amounts

## Using Test Utilities

Common operations are available in `tests/e2e/fixtures/test-utils.ts`:

```typescript
import { 
  loginUser, 
  registerUser, 
  enrollInCourse, 
  completePayment,
  requestWithdrawal 
} from './fixtures/test-utils';

// Login
await loginUser(page, email, password);

// Register
await registerUser(page, firstName, lastName, email, password);

// Enroll in course
await enrollInCourse(page, 'Python Programming');

// Complete payment
await completePayment(page, cardNumber, expiry, cvc);

// Request withdrawal
await requestWithdrawal(page, amount, accountNumber);
```

## Writing E2E Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should perform action', async ({ page }) => {
    // Arrange
    await page.goto('/page');
    
    // Act
    await page.click('button');
    
    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid attributes** for reliable element selection
   ```typescript
   await page.click('[data-testid="submit-button"]');
   ```

2. **Wait for elements explicitly**
   ```typescript
   await expect(page.locator('text=Success')).toBeVisible({ timeout: 3000 });
   ```

3. **Use meaningful test names**
   ```typescript
   test('should complete user registration with valid data', async ({ page }) => {
     // Test implementation
   });
   ```

4. **Organize tests with describe blocks**
   ```typescript
   test.describe('User Authentication', () => {
     test('should login successfully', async ({ page }) => {});
     test('should show error on invalid credentials', async ({ page }) => {});
   });
   ```

5. **Use beforeEach/afterEach for setup/cleanup**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await loginUser(page, email, password);
   });
   ```

## Test Environment Setup

### Database Setup

Tests use a dedicated test database:

```bash
# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

### Environment Variables

Required for E2E tests:

```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:test@localhost:5432/azora_test
REDIS_URL=redis://localhost:6379
BASE_URL=http://localhost:3000
```

### Starting Services

For local testing, start all services:

```bash
npm run dev
```

Or start individual services:

```bash
npm run dev:gateway
npm run dev:auth
npm run dev:education
npm run dev:mint
```

## Debugging Tests

### View Test Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Debug Mode

Run tests in debug mode with step-by-step execution:

```bash
npx playwright test --debug
```

### UI Mode

Interactive test runner with live preview:

```bash
npx playwright test --ui
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots (in `test-results/`)
- Videos (in `test-results/`)
- Traces (in `test-results/`)

View traces:

```bash
npx playwright show-trace test-results/trace.zip
```

## Troubleshooting

### Tests Timeout

**Problem**: Tests timeout waiting for elements

**Solution**:
- Increase timeout: `await expect(element).toBeVisible({ timeout: 10000 })`
- Check if element selector is correct
- Verify application is running and responsive

### Element Not Found

**Problem**: Playwright can't find element

**Solution**:
- Use `page.pause()` to debug
- Check element selector with browser DevTools
- Use `data-testid` attributes for reliable selection
- Wait for element: `await page.waitForSelector(selector)`

### Flaky Tests

**Problem**: Tests pass sometimes, fail other times

**Solution**:
- Add explicit waits instead of fixed delays
- Use `waitForLoadState('networkidle')`
- Avoid relying on timing
- Use `expect().toBeVisible()` instead of `isVisible()`

### Database Issues

**Problem**: Test data not persisting

**Solution**:
- Verify database is running: `docker ps`
- Check DATABASE_URL environment variable
- Run migrations: `npm run db:migrate`
- Seed test data: `npm run db:seed`

## CI/CD Integration

### GitHub Actions Workflow

E2E tests run in `.github/workflows/e2e-tests.yml`:

- Runs on push to main/develop
- Runs on pull requests
- Tests across multiple browsers
- Generates test reports
- Uploads artifacts

### Test Reports

Test results are available as:
- HTML report (Playwright)
- JUnit XML (for CI integration)
- JSON results
- GitHub Actions summary

## Performance Considerations

### Test Execution Time

- Single browser: ~5-10 minutes
- All browsers: ~15-20 minutes
- CI/CD with parallelization: ~10-15 minutes

### Optimization Tips

1. Run tests in parallel (default)
2. Use `fullyParallel: true` in config
3. Limit workers on CI: `workers: 1`
4. Use `--project` to run specific browser
5. Cache dependencies: `cache: 'npm'`

## Accessibility Testing

E2E tests include accessibility checks:

```typescript
// Check heading structure
const h1Count = await page.locator('h1').count();
expect(h1Count).toBeGreaterThanOrEqual(1);

// Check alt text on images
const images = await page.locator('img').all();
for (const img of images) {
  const alt = await img.getAttribute('alt');
  expect(alt).toBeTruthy();
}
```

## Mobile Testing

Tests run on mobile viewports:

- Pixel 5 (Android)
- iPhone 12 (iOS)

Mobile tests verify:
- Responsive layout
- Touch interactions
- Mobile navigation
- Performance on mobile

## Continuous Improvement

### Monitoring Test Health

- Track test pass rates
- Monitor flaky tests
- Analyze failure patterns
- Review test coverage

### Adding New Tests

1. Identify critical user journey
2. Create test file in `tests/e2e/`
3. Use test utilities and fixtures
4. Add to CI/CD workflow
5. Document test purpose

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Debugging](https://playwright.dev/docs/debug)
- [Playwright CI/CD](https://playwright.dev/docs/ci)

## Support

For issues or questions:
1. Check this guide
2. Review test examples
3. Check Playwright documentation
4. Open an issue in the repository
