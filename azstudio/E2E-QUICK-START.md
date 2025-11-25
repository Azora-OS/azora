# E2E Testing Quick Start Guide

## Installation

1. **Install dependencies**:
   ```bash
   cd azstudio
   npm install
   ```

2. **Install Playwright browsers**:
   ```bash
   npm run playwright:install
   ```

   This will download Chromium, Firefox, and WebKit browsers (~500MB).

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# View HTML report
npm run test:e2e:report
```

### Advanced Commands

```bash
# Run specific test file
npx playwright test tests/e2e/project-creation.spec.ts

# Run with specific browser
npx playwright test --project=chromium

# Run in headed mode (visible browser)
npx playwright test --headed

# Run with slow motion
npx playwright test --headed --slow-mo=1000
```

## First Test Run

1. **Start the application** (if not auto-started):
   ```bash
   npm run dev:renderer
   ```

2. **Run tests**:
   ```bash
   npm run test:e2e
   ```

3. **View results**:
   - Console output shows pass/fail summary
   - Screenshots in `test-results/screenshots/`
   - Videos in `test-results/` (on failure)
   - HTML report: `npm run test:e2e:report`

## Writing Your First Test

1. **Create test file** in `tests/e2e/`:
   ```typescript
   import { test, expect } from '@playwright/test';
   import { createHelpers } from './helpers';

   test.describe('My Feature', () => {
     test('should work correctly', async ({ page }) => {
       const helpers = createHelpers(page);
       
       await page.goto('/');
       await helpers.waitForAppReady();
       
       // Your test logic here
       
       await expect(page).toHaveTitle(/AzStudio/);
     });
   });
   ```

2. **Run your test**:
   ```bash
   npx playwright test tests/e2e/my-feature.spec.ts
   ```

## Common Issues

### Issue: Browsers not installed
**Error**: `Executable doesn't exist at ...`

**Solution**:
```bash
npm run playwright:install
```

### Issue: Preview server not running
**Error**: `net::ERR_CONNECTION_REFUSED`

**Solution**: The config auto-starts the server, but if it fails:
```bash
npm run dev:renderer
```

### Issue: Tests timing out
**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
timeout: 120 * 1000, // 2 minutes
```

## Next Steps

1. Read the full documentation: `docs/E2E-TESTING.md`
2. Explore sample tests in `tests/e2e/`
3. Check out helpers in `tests/e2e/helpers.ts`
4. Add `data-testid` attributes to your components
5. Create tests for your user journeys

## Resources

- [Playwright Docs](https://playwright.dev)
- [AzStudio E2E Testing Guide](docs/E2E-TESTING.md)
- [Test Examples](tests/e2e/)
- [Helper Functions](tests/e2e/helpers.ts)

## Support

For issues or questions:
1. Check `docs/E2E-TESTING.md` troubleshooting section
2. Review Playwright documentation
3. Check test examples in `tests/e2e/`
