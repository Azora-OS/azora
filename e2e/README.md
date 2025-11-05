# E2E Testing with Playwright

End-to-end testing for Azora OS using Playwright.

## Setup

```bash
npm install --save-dev @playwright/test
npx playwright install
```

## Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run tests for specific browser
npx playwright test --project=chromium

# Generate test report
npx playwright show-report
```

## Test Structure

- `tests/nexus-services.spec.ts` - Tests for Azora Nexus services
- `playwright.config.ts` - Playwright configuration

## Writing Tests

Tests are written using Playwright's test API. Example:

```typescript
import { test, expect } from '@playwright/test'

test('should respond to health check', async ({ request }) => {
  const response = await request.get('http://localhost:4100/health')
  expect(response.ok()).toBeTruthy()
})
```

## CI/CD Integration

E2E tests run automatically in CI/CD pipelines defined in `.github/workflows/`.

