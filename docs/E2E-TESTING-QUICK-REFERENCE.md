# E2E Testing Quick Reference

## Quick Start

```bash
# Run all E2E tests
npm run test:e2e

# Run specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test tests/e2e/critical-journeys.spec.ts

# Debug mode
npx playwright test --debug

# UI mode (interactive)
npx playwright test --ui

# View report
npx playwright show-report
```

## Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { loginUser, enrollInCourse } from './fixtures/test-utils';
import { testUsers, testCourses } from './fixtures/test-data';

test.describe('Feature', () => {
  test('should do something', async ({ page }) => {
    // Arrange
    await loginUser(page, testUsers.student.email, testUsers.student.password);
    
    // Act
    await enrollInCourse(page, testCourses.python.title);
    
    // Assert
    await expect(page.locator('text=Successfully enrolled')).toBeVisible();
  });
});
```

## Common Selectors

```typescript
// By text
page.locator('text=Login')
page.locator('button:has-text("Submit")')

// By data-testid (preferred)
page.locator('[data-testid="submit-button"]')

// By name
page.locator('input[name="email"]')

// By placeholder
page.locator('input[placeholder="Enter email"]')

// By class
page.locator('[class*="course-card"]')

// By role
page.locator('button[role="button"]')
```

## Common Actions

```typescript
// Navigation
await page.goto('/courses');
await page.click('a:has-text("Home")');

// Form filling
await page.fill('input[name="email"]', 'test@example.com');
await page.selectOption('select[name="country"]', 'US');
await page.check('input[type="checkbox"]');

// Clicking
await page.click('button:has-text("Submit")');
await page.dblclick('element');
await page.rightClick('element');

// Waiting
await page.waitForLoadState('networkidle');
await page.waitForSelector('text=Success');
await page.waitForTimeout(1000);

// Keyboard
await page.press('input', 'Enter');
await page.keyboard.type('Hello');
```

## Common Assertions

```typescript
// Visibility
await expect(page.locator('text=Success')).toBeVisible();
await expect(page.locator('text=Error')).not.toBeVisible();

// URL
await expect(page).toHaveURL(/\/dashboard/);

// Text content
await expect(page.locator('h1')).toContainText('Welcome');

// Count
await expect(page.locator('[class*="course-card"]')).toHaveCount(5);

// Attributes
await expect(page.locator('button')).toHaveAttribute('disabled');

// Value
await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');

// Enabled/Disabled
await expect(page.locator('button')).toBeEnabled();
await expect(page.locator('button')).toBeDisabled();
```

## Test Utilities

```typescript
import { 
  loginUser,
  logoutUser,
  registerUser,
  enrollInCourse,
  completePayment,
  requestWithdrawal,
  waitForElement,
  getElementText,
  isElementVisible,
  fillFormField,
  clickButton,
  verifyPageTitle,
  verifySuccessMessage,
  verifyErrorMessage,
  takeScreenshot,
  measurePageLoadTime,
  checkAccessibility
} from './fixtures/test-utils';

// Login
await loginUser(page, 'user@example.com', 'password');

// Register
await registerUser(page, 'John', 'Doe', 'john@example.com', 'password');

// Enroll in course
await enrollInCourse(page, 'Python Programming');

// Complete payment
await completePayment(page, '4242424242424242', '12/25', '123');

// Request withdrawal
await requestWithdrawal(page, 100, '1234567890');

// Verify messages
await verifySuccessMessage(page, 'Successfully enrolled');
await verifyErrorMessage(page, 'Invalid email');

// Take screenshot
await takeScreenshot(page, 'signup-form');

// Measure performance
const loadTime = await measurePageLoadTime(page, '/courses');
console.log(`Page loaded in ${loadTime}ms`);
```

## Test Data

```typescript
import { 
  testUsers,
  testCourses,
  testPayments,
  testBankAccounts,
  testWithdrawals,
  generateTestEmail,
  generateTestUsername,
  getTestUser,
  getTestCourse
} from './fixtures/test-data';

// Predefined data
const student = testUsers.student;
const course = testCourses.python;
const payment = testPayments.validCard;

// Generate unique data
const email = generateTestEmail('student');
const username = generateTestUsername('user');

// Get by type
const instructor = getTestUser('instructor');
const jsCoursee = getTestCourse('javascript');
```

## Setup and Teardown

```typescript
test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Run before each test
    await loginUser(page, email, password);
  });

  test.afterEach(async ({ page }) => {
    // Run after each test
    await logoutUser(page);
  });

  test.beforeAll(async ({ browser }) => {
    // Run once before all tests
  });

  test.afterAll(async () => {
    // Run once after all tests
  });

  test('test 1', async ({ page }) => {});
  test('test 2', async ({ page }) => {});
});
```

## Debugging

```typescript
// Pause execution
await page.pause();

// Log to console
console.log('Debug info:', await page.locator('h1').textContent());

// Take screenshot
await page.screenshot({ path: 'debug.png' });

// Get page content
const html = await page.content();

// Evaluate JavaScript
const result = await page.evaluate(() => {
  return document.title;
});

// Check network requests
page.on('response', response => {
  console.log(response.url(), response.status());
});
```

## Performance Testing

```typescript
// Measure page load time
const startTime = Date.now();
await page.goto('/courses');
const loadTime = Date.now() - startTime;
expect(loadTime).toBeLessThan(3000); // 3 seconds

// Measure API response time
const startTime = Date.now();
await page.click('button:has-text("Load More")');
await page.waitForLoadState('networkidle');
const responseTime = Date.now() - startTime;
console.log(`API response: ${responseTime}ms`);
```

## Mobile Testing

```typescript
// Set mobile viewport
await page.setViewportSize({ width: 375, height: 667 });

// Test touch interactions
await page.tap('button');

// Test mobile navigation
await page.click('[data-testid="mobile-menu"]');
```

## Accessibility Testing

```typescript
// Check heading structure
const h1Count = await page.locator('h1').count();
expect(h1Count).toBeGreaterThanOrEqual(1);

// Check alt text
const images = await page.locator('img').all();
for (const img of images) {
  const alt = await img.getAttribute('alt');
  expect(alt).toBeTruthy();
}

// Check form labels
const inputs = await page.locator('input').all();
for (const input of inputs) {
  const label = await input.getAttribute('aria-label');
  expect(label).toBeTruthy();
}
```

## Environment Variables

```env
# Required
NODE_ENV=test
DATABASE_URL=postgresql://postgres:test@localhost:5432/azora_test
REDIS_URL=redis://localhost:6379

# Optional
BASE_URL=http://localhost:3000
PLAYWRIGHT_JUNIT_OUTPUT_NAME=junit.xml
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout: `{ timeout: 10000 }` |
| Element not found | Use `page.pause()` to debug, check selector |
| Flaky tests | Use explicit waits, avoid timing |
| Database issues | Check DATABASE_URL, run migrations |
| Port already in use | Kill process: `lsof -i :3000` |
| Browser not found | Install: `npx playwright install` |

## Resources

- [Playwright Docs](https://playwright.dev)
- [Selectors](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Debugging](https://playwright.dev/docs/debug)
- [CI/CD](https://playwright.dev/docs/ci)
