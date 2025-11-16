# E2E Testing Troubleshooting Guide

## Common Issues and Solutions

### 1. Tests Timeout

**Symptom**: Tests fail with "Timeout waiting for element"

**Causes**:
- Application not responding
- Element takes too long to appear
- Network issues
- Database not ready

**Solutions**:

```typescript
// Increase timeout for specific assertion
await expect(page.locator('text=Success')).toBeVisible({ timeout: 10000 });

// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Wait for specific element
await page.waitForSelector('[data-testid="submit-button"]');

// Wait for navigation
await page.waitForNavigation();
```

**Debugging**:
```bash
# Run with verbose logging
DEBUG=pw:api npx playwright test

# Run in debug mode
npx playwright test --debug

# Run with UI mode
npx playwright test --ui
```

---

### 2. Element Not Found

**Symptom**: "Locator did not resolve to any elements"

**Causes**:
- Incorrect selector
- Element not rendered
- Element in iframe
- Dynamic content not loaded

**Solutions**:

```typescript
// Use data-testid (most reliable)
await page.click('[data-testid="submit-button"]');

// Wait for element to appear
await page.waitForSelector('[data-testid="submit-button"]');

// Use more specific selector
await page.click('button[type="submit"]:has-text("Submit")');

// Check if element exists
const exists = await page.locator('[data-testid="element"]').isVisible();
if (exists) {
  await page.click('[data-testid="element"]');
}

// Handle iframe
const frameHandle = await page.$('iframe');
const frame = await frameHandle.contentFrame();
await frame.click('button');
```

**Debugging**:
```typescript
// Pause and inspect
await page.pause();

// Log all elements matching selector
const elements = await page.locator('button').all();
console.log(`Found ${elements.length} buttons`);

// Get element details
const element = page.locator('[data-testid="element"]');
console.log('Visible:', await element.isVisible());
console.log('Enabled:', await element.isEnabled());
console.log('Text:', await element.textContent());
```

---

### 3. Flaky Tests

**Symptom**: Tests pass sometimes, fail other times

**Causes**:
- Race conditions
- Timing dependencies
- Network variability
- Database state issues

**Solutions**:

```typescript
// ❌ Bad: Fixed delay
await page.waitForTimeout(1000);

// ✅ Good: Wait for condition
await expect(page.locator('text=Success')).toBeVisible();

// ❌ Bad: Check visibility without waiting
if (await page.locator('text=Success').isVisible()) {
  // ...
}

// ✅ Good: Explicit wait with timeout
await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });

// ✅ Good: Wait for network
await page.waitForLoadState('networkidle');

// ✅ Good: Wait for specific response
await page.waitForResponse(response => 
  response.url().includes('/api/courses') && response.status() === 200
);
```

**Prevention**:
- Use explicit waits instead of timeouts
- Avoid relying on timing
- Use `expect()` for assertions
- Wait for network to be idle
- Use `data-testid` for reliable selection

---

### 4. Database Issues

**Symptom**: "Connection refused" or "Database not found"

**Causes**:
- PostgreSQL not running
- Redis not running
- Wrong connection string
- Migrations not run

**Solutions**:

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Start PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=test postgres:15

# Check if Redis is running
docker ps | grep redis

# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Check connection
psql postgresql://postgres:test@localhost:5432/azora_test
```

**Environment Variables**:
```env
DATABASE_URL=postgresql://postgres:test@localhost:5432/azora_test
REDIS_URL=redis://localhost:6379
```

---

### 5. Application Not Starting

**Symptom**: "Failed to connect to http://localhost:3000"

**Causes**:
- Port already in use
- Application crashed
- Dependencies not installed
- Build failed

**Solutions**:

```bash
# Check if port is in use
lsof -i :3000

# Kill process on port
kill -9 <PID>

# Install dependencies
npm ci

# Build application
npm run build

# Start application
npm run dev

# Start specific service
npm run dev:gateway
npm run dev:auth
npm run dev:education
```

**Debugging**:
```bash
# Check application logs
npm run dev 2>&1 | tee app.log

# Check if port is listening
netstat -an | grep 3000

# Test connectivity
curl http://localhost:3000
```

---

### 6. Payment Test Failures

**Symptom**: Payment tests fail or timeout

**Causes**:
- Payment gateway not mocked
- Invalid test card
- Form validation issues
- Network timeout

**Solutions**:

```typescript
// Use valid test card
const validCard = {
  number: '4242424242424242',
  expiry: '12/25',
  cvc: '123'
};

// Use invalid test card for error testing
const invalidCard = {
  number: '4000000000000002',
  expiry: '12/25',
  cvc: '123'
};

// Wait for payment form
await expect(page.locator('text=Payment')).toBeVisible({ timeout: 5000 });

// Fill payment form carefully
const cardInput = page.locator('input[placeholder*="card"]').first();
await cardInput.fill(validCard.number);
await page.fill('input[placeholder*="MM/YY"]', validCard.expiry);
await page.fill('input[placeholder*="CVC"]', validCard.cvc);

// Wait for processing
await page.waitForLoadState('networkidle');
```

---

### 7. Authentication Issues

**Symptom**: Login fails or session expires

**Causes**:
- Invalid credentials
- Session timeout
- Cookie issues
- CSRF token missing

**Solutions**:

```typescript
// Use correct credentials
const email = 'test@example.com';
const password = 'SecureTest123!@#';

// Login with utility
import { loginUser } from './fixtures/test-utils';
await loginUser(page, email, password);

// Verify login success
await expect(page).toHaveURL(/\/dashboard/);

// Check for auth token
const cookies = await page.context().cookies();
const authCookie = cookies.find(c => c.name === 'auth_token');
expect(authCookie).toBeTruthy();

// Handle session expiry
test.beforeEach(async ({ page }) => {
  await loginUser(page, email, password);
});
```

---

### 8. Selector Issues

**Symptom**: "Locator did not resolve" or "Multiple elements found"

**Causes**:
- Ambiguous selector
- Dynamic IDs
- Similar elements
- Selector too broad

**Solutions**:

```typescript
// ❌ Bad: Too broad
page.locator('button')

// ✅ Good: Specific selector
page.locator('button[type="submit"]:has-text("Login")')

// ✅ Good: Use data-testid
page.locator('[data-testid="login-button"]')

// ✅ Good: Use role
page.locator('button[role="button"]:has-text("Login")')

// ✅ Good: Combine selectors
page.locator('form').locator('button[type="submit"]')

// ✅ Good: Use nth-child for specific element
page.locator('button').nth(0)

// ✅ Good: Use filter
page.locator('button').filter({ hasText: 'Login' })
```

**Best Practices**:
- Use `data-testid` attributes
- Avoid relying on text content
- Use specific selectors
- Test selectors in browser console

---

### 9. Network Issues

**Symptom**: Tests fail with network errors

**Causes**:
- API not responding
- Network timeout
- CORS issues
- Rate limiting

**Solutions**:

```typescript
// Wait for specific API response
await page.waitForResponse(response => 
  response.url().includes('/api/courses') && response.status() === 200
);

// Mock API response
await page.route('**/api/courses', route => {
  route.abort('failed');
});

// Intercept and modify response
await page.route('**/api/courses', route => {
  route.continue({
    response: {
      status: 200,
      body: JSON.stringify([{ id: 1, title: 'Test Course' }])
    }
  });
});

// Check network requests
page.on('response', response => {
  console.log(`${response.url()} - ${response.status()}`);
});

// Wait for network to be idle
await page.waitForLoadState('networkidle');
```

---

### 10. Memory and Performance Issues

**Symptom**: Tests slow down or crash

**Causes**:
- Memory leak
- Too many browser instances
- Large screenshots/videos
- Inefficient selectors

**Solutions**:

```typescript
// Limit workers
workers: 1  // In playwright.config.ts

// Close pages properly
test.afterEach(async ({ page }) => {
  await page.close();
});

// Disable video/screenshot for passing tests
screenshot: 'only-on-failure',
video: 'retain-on-failure',

// Use smaller viewport for faster rendering
use: {
  viewport: { width: 1280, height: 720 }
}

// Avoid large loops
// ❌ Bad
for (let i = 0; i < 1000; i++) {
  await page.click('button');
}

// ✅ Good
const buttons = await page.locator('button').all();
for (const button of buttons.slice(0, 10)) {
  await button.click();
}
```

---

## Debugging Techniques

### 1. Use Debug Mode

```bash
npx playwright test --debug
```

### 2. Use UI Mode

```bash
npx playwright test --ui
```

### 3. Pause Execution

```typescript
await page.pause();
```

### 4. Take Screenshots

```typescript
await page.screenshot({ path: 'debug.png' });
```

### 5. Log Information

```typescript
console.log('Current URL:', page.url());
console.log('Page title:', await page.title());
console.log('Element text:', await page.locator('h1').textContent());
```

### 6. View Test Report

```bash
npx playwright show-report
```

### 7. Check Traces

```bash
npx playwright show-trace test-results/trace.zip
```

---

## Getting Help

1. **Check logs**: Review test output and error messages
2. **Use debug mode**: Run with `--debug` flag
3. **Check documentation**: Review Playwright docs
4. **Search issues**: Look for similar problems
5. **Create minimal reproduction**: Isolate the issue
6. **Ask for help**: Open an issue with details

---

## Performance Optimization

### Reduce Test Execution Time

```typescript
// Run tests in parallel
fullyParallel: true

// Use specific browser
npx playwright test --project=chromium

// Run specific test file
npx playwright test tests/e2e/critical-journeys.spec.ts

// Run tests matching pattern
npx playwright test --grep "signup"
```

### Optimize Test Code

```typescript
// ❌ Slow: Multiple page loads
test('test 1', async ({ page }) => {
  await page.goto('/');
  // ...
});

test('test 2', async ({ page }) => {
  await page.goto('/');
  // ...
});

// ✅ Fast: Shared setup
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('test 1', async ({ page }) => {
  // ...
});

test('test 2', async ({ page }) => {
  // ...
});
```

---

## Resources

- [Playwright Troubleshooting](https://playwright.dev/docs/troubleshooting)
- [Playwright Debugging](https://playwright.dev/docs/debug)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [GitHub Issues](https://github.com/microsoft/playwright/issues)
