# E2E Testing with Playwright

## Overview

AzStudio uses Playwright for end-to-end testing to verify complete user workflows and ensure all components work together correctly. The E2E testing system is integrated into the VerificationPipeline and can be run both manually and automatically.

## Architecture

### Components

1. **PlaywrightRunner** (`src/main/services/PlaywrightRunner.ts`)
   - Core service for running E2E tests
   - Generates test scenarios from user journeys
   - Manages test execution and result parsing
   - Captures screenshots, videos, and traces on failure

2. **VerificationPipeline** (`src/main/services/VerificationPipeline.ts`)
   - Integrates E2E tests with unit/integration tests
   - Provides unified verification interface
   - Manages preview server lifecycle

3. **Test Files** (`tests/e2e/*.spec.ts`)
   - Individual test scenarios
   - Follow Playwright test conventions
   - Use data-testid attributes for stable selectors

4. **Helpers** (`tests/e2e/helpers.ts`)
   - Common test utilities
   - Reusable actions (open file, drag component, etc.)
   - Screenshot and wait helpers

## Setup

### Installation

1. Install Playwright and dependencies:

```bash
cd azstudio
npm install
npm run playwright:install
```

2. Verify installation:

```bash
npx playwright --version
```

### Configuration

Configuration is in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60 * 1000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## Usage

### Running Tests

#### Command Line

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/project-creation.spec.ts

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run with specific browser
npx playwright test --project=chromium

# Run headed (visible browser)
npx playwright test --headed
```

#### Programmatic Usage

```typescript
import { PlaywrightRunner } from './src/main/services/PlaywrightRunner';

const runner = new PlaywrightRunner(projectRoot);

// Generate scenarios from user journeys
const userJourneys = [
  ['Open app', 'Create project', 'Verify structure'],
  ['Open app', 'Edit code', 'Save file'],
];

const scenarios = runner.generateTestScenarios(userJourneys);

// Generate test files
for (const scenario of scenarios) {
  await runner.generateTestFile(scenario);
}

// Configure and run tests
await runner.configure();
await runner.startPreviewServer();
const results = await runner.runTests(scenarios);
await runner.stopPreviewServer();

console.log(`Passed: ${results.passed}, Failed: ${results.failed}`);
```

#### Integration with VerificationPipeline

```typescript
import { VerificationPipeline } from './src/main/services/VerificationPipeline';

const pipeline = new VerificationPipeline(projectRoot);

// Run all verification including E2E tests
const report = await pipeline.verify(true);

console.log('Tests passed:', report.tests.passed);
console.log('E2E tests passed:', report.e2eTests?.passed);
console.log('Overall passed:', report.passed);
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { createHelpers } from './helpers';

test.describe('Feature Name', () => {
  test('should complete user journey', async ({ page }, testInfo) => {
    const helpers = createHelpers(page);
    
    // Step 1: Navigate
    await page.goto('/');
    await helpers.waitForAppReady();
    await helpers.takeScreenshot(`${testInfo.title}-step-1`);
    
    // Step 2: Perform action
    await helpers.openProject('my-project');
    await helpers.takeScreenshot(`${testInfo.title}-step-2`);
    
    // Step 3: Verify result
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
    await helpers.takeScreenshot(`${testInfo.title}-step-3`);
  });
});
```

### Using Test Helpers

```typescript
const helpers = createHelpers(page);

// Navigation
await helpers.waitForAppReady();
await helpers.openProject('project-name');
await helpers.openFile('src/index.ts');

// View modes
await helpers.switchViewMode('visual');
await helpers.switchViewMode('code');
await helpers.switchViewMode('split');

// Visual canvas
await helpers.dragComponentToCanvas('service', 100, 100);
await helpers.setComponentProperty('name', 'auth-service');

// File operations
await helpers.saveFile();
await helpers.waitForFileSaved('index.ts');

// AI operations
await helpers.waitForAIOperation();

// Verification
await helpers.runVerification();

// Screenshots
await helpers.takeScreenshot('my-step');

// Error handling
const hasError = await helpers.hasErrorMessage();
const errorText = await helpers.getErrorMessage();
```

### Test Data Attributes

Add `data-testid` attributes to components for stable selectors:

```tsx
// Component
<button data-testid="create-project-button">Create Project</button>

// Test
await page.locator('[data-testid="create-project-button"]').click();
```

### Generating Tests from User Journeys

```typescript
const runner = new PlaywrightRunner(projectRoot);

const userJourneys = [
  [
    'Open AzStudio',
    'Click "New Project"',
    'Select template',
    'Configure settings',
    'Create project',
    'Verify structure',
  ],
];

const scenarios = runner.generateTestScenarios(userJourneys);

for (const scenario of scenarios) {
  await runner.generateTestFile(scenario);
}
```

## Test Artifacts

### Screenshots

- Automatically captured on failure
- Manually captured with `page.screenshot()` or `helpers.takeScreenshot()`
- Stored in `test-results/screenshots/`
- Format: PNG

### Videos

- Automatically recorded on failure
- Stored in `test-results/`
- Format: WebM
- Viewable in browser or video player

### Traces

- Collected on first retry
- Contains timeline, network, console, DOM snapshots
- Stored in `test-results/`
- View with: `npx playwright show-trace trace.zip`

### HTML Report

- Generated after test run
- View with: `npm run test:e2e:report`
- Contains all test results, screenshots, videos
- Stored in `test-results/html/`

## CI/CD Integration

### GitHub Actions

Example workflow (`.github/workflows/e2e-tests.yml`):

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: test-results/
```

## Best Practices

### 1. Use Stable Selectors

```typescript
// Good - stable
await page.locator('[data-testid="submit-button"]').click();

// Bad - fragile
await page.locator('.btn.btn-primary:nth-child(2)').click();
```

### 2. Wait for Network Idle

```typescript
await page.goto('/');
await page.waitForLoadState('networkidle');
```

### 3. Handle Async Operations

```typescript
// Wait for element
await page.locator('[data-testid="result"]').waitFor({ state: 'visible' });

// Wait for condition
await page.waitForFunction(() => window.dataLoaded === true);
```

### 4. Take Screenshots at Key Steps

```typescript
await helpers.takeScreenshot('before-action');
await performAction();
await helpers.takeScreenshot('after-action');
```

### 5. Keep Tests Independent

```typescript
// Each test should set up its own state
test('test 1', async ({ page }) => {
  await setupTestData();
  // ... test logic
  await cleanupTestData();
});
```

### 6. Use Descriptive Test Names

```typescript
// Good
test('should create new project from Education Platform template', ...);

// Bad
test('test 1', ...);
```

### 7. Handle Errors Gracefully

```typescript
const element = page.locator('[data-testid="optional-element"]');
if (await element.isVisible()) {
  await element.click();
}
```

### 8. Clean Up After Tests

```typescript
test.afterEach(async ({ page }) => {
  await helpers.clearNotifications();
  // Close any open modals
  // Reset state
});
```

## Debugging

### Debug Mode

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for step-by-step debugging.

### Headed Mode

```bash
npx playwright test --headed
```

Shows browser window during test execution.

### Slow Motion

```bash
npx playwright test --headed --slow-mo=1000
```

Slows down test execution by 1000ms per action.

### Console Logs

```typescript
page.on('console', msg => console.log('Browser:', msg.text()));
```

### Pause Execution

```typescript
await page.pause();
```

Pauses test and opens inspector.

## Troubleshooting

### Tests Timing Out

**Problem**: Tests exceed timeout limit

**Solutions**:
- Increase timeout in config: `timeout: 120 * 1000`
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Check if preview server is running

### Flaky Tests

**Problem**: Tests pass/fail inconsistently

**Solutions**:
- Add explicit waits instead of `waitForTimeout`
- Use `waitFor` with conditions
- Increase retries in config
- Check for race conditions

### Element Not Found

**Problem**: Selector doesn't match any elements

**Solutions**:
- Verify element exists: `await element.isVisible()`
- Wait for element: `await element.waitFor({ state: 'visible' })`
- Check selector syntax
- Use Playwright Inspector to find correct selector

### Screenshots Not Captured

**Problem**: Screenshots missing from test results

**Solutions**:
- Check `test-results/screenshots/` directory
- Verify path in `page.screenshot({ path: '...' })`
- Ensure directory has write permissions
- Check disk space

## Performance

### Parallel Execution

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 1 : undefined, // Parallel locally
  fullyParallel: true,
});
```

### Test Sharding

```bash
# Run tests in 4 shards
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

### Selective Testing

```bash
# Run only critical tests
npx playwright test --grep @critical

# Skip slow tests
npx playwright test --grep-invert @slow
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Guide](https://playwright.dev/docs/ci)
