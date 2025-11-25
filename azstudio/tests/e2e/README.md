# AzStudio E2E Tests

This directory contains end-to-end tests for AzStudio using Playwright.

## Overview

E2E tests verify complete user workflows from start to finish, ensuring that all components work together correctly. Tests run against a local preview server and simulate real user interactions.

## Test Structure

### Test Files

- `project-creation.spec.ts` - Tests for creating new projects from templates
- `visual-design.spec.ts` - Tests for visual canvas and code generation
- `code-editing.spec.ts` - Tests for Monaco editor and AI code actions
- `helpers.ts` - Common helper functions for E2E tests

### Test Scenarios

Each test file contains scenarios that follow specific user journeys:

1. **Project Creation**
   - Create new project from template
   - Configure project settings
   - Verify project structure

2. **Visual Design**
   - Drag components to canvas
   - Configure component properties
   - Generate code from visual design
   - Sync between canvas and code editor

3. **Code Editing**
   - Open and edit files
   - Use AI code actions
   - Save changes
   - Verify syntax checking

## Running Tests

### Prerequisites

Install Playwright browsers:

```bash
npm run playwright:install
```

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode

```bash
npm run test:e2e:ui
```

### Run Tests in Debug Mode

```bash
npm run test:e2e:debug
```

### Run Specific Test File

```bash
npx playwright test tests/e2e/project-creation.spec.ts
```

### View Test Report

```bash
npm run test:e2e:report
```

## Test Configuration

Configuration is in `playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit
- **Base URL**: http://localhost:3000
- **Timeout**: 60 seconds per test
- **Retries**: 2 retries in CI, 0 locally
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Traces**: Collected on first retry

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { createHelpers } from './helpers';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }, testInfo) => {
    const helpers = createHelpers(page);
    
    // Navigate to app
    await page.goto('/');
    await helpers.waitForAppReady();
    
    // Perform actions
    await helpers.openProject('my-project');
    
    // Take screenshot
    await helpers.takeScreenshot('feature-step-1');
    
    // Verify results
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### Using Helpers

The `helpers.ts` file provides common functions:

```typescript
const helpers = createHelpers(page);

// Wait for app to load
await helpers.waitForAppReady();

// Switch view modes
await helpers.switchViewMode('visual');

// Open files
await helpers.openFile('src/index.ts');

// Drag components
await helpers.dragComponentToCanvas('service', 100, 100);

// Set properties
await helpers.setComponentProperty('name', 'auth-service');

// Save files
await helpers.saveFile();

// Take screenshots
await helpers.takeScreenshot('my-test-step');
```

### Test Data Attributes

Use `data-testid` attributes in components for reliable selectors:

```typescript
// Good - stable selector
await page.locator('[data-testid="visual-canvas"]').click();

// Avoid - fragile selector
await page.locator('.canvas-container > div:nth-child(2)').click();
```

## Test Artifacts

### Screenshots

Screenshots are automatically captured:
- On test failure
- When explicitly called with `page.screenshot()`
- Stored in `test-results/screenshots/`

### Videos

Videos are recorded:
- On test failure
- Stored in `test-results/`
- Format: WebM

### Traces

Traces are collected:
- On first retry
- Viewable with `npx playwright show-trace trace.zip`
- Contains timeline, network, console, and DOM snapshots

## Debugging Tests

### Debug Mode

Run tests in debug mode to step through:

```bash
npm run test:e2e:debug
```

### Headed Mode

Run tests with visible browser:

```bash
npx playwright test --headed
```

### Slow Motion

Run tests in slow motion:

```bash
npx playwright test --headed --slow-mo=1000
```

### Inspector

Use Playwright Inspector:

```bash
npx playwright test --debug
```

## CI/CD Integration

Tests run automatically in CI with:
- 2 retries on failure
- Single worker (no parallelization)
- HTML and JSON reports
- Artifacts uploaded on failure

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for network idle** before assertions
3. **Take screenshots** at key steps for debugging
4. **Use helpers** for common operations
5. **Test critical paths** first
6. **Keep tests independent** - no shared state
7. **Clean up** after tests (close modals, clear data)
8. **Use meaningful test names** that describe the scenario
9. **Add comments** for complex user journeys
10. **Handle async operations** properly with waitFor

## Troubleshooting

### Tests Timing Out

- Increase timeout in `playwright.config.ts`
- Check if preview server is running
- Verify network requests complete

### Flaky Tests

- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use `waitFor` with conditions
- Avoid hard-coded timeouts

### Element Not Found

- Check if element exists: `await element.isVisible()`
- Wait for element: `await element.waitFor({ state: 'visible' })`
- Verify selector is correct

### Screenshots Not Captured

- Check `test-results/` directory
- Verify screenshot path is correct
- Ensure directory has write permissions

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Selectors Guide](https://playwright.dev/docs/selectors)
