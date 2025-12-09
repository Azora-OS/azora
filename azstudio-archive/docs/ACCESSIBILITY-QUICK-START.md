# Accessibility Checking - Quick Start Guide

## Installation

Dependencies are already installed. If needed:

```bash
npm install --save-dev axe-core @axe-core/playwright
```

## Basic Usage

### 1. Check a Single Page

```typescript
import { AccessibilityChecker } from './services/AccessibilityChecker';

const checker = new AccessibilityChecker('./');
const report = await checker.checkAccessibility('http://localhost:3000');

console.log(`Violations: ${report.summary.total}`);
console.log(`Critical: ${report.summary.critical}`);
console.log(`Passed: ${report.passed}`);

await checker.close();
```

### 2. Generate HTML Report

```typescript
await checker.generateHTMLReport(report, './a11y-report.html');
```

### 3. Check Multiple Pages

```typescript
const urls = [
  'http://localhost:3000',
  'http://localhost:3000/about',
  'http://localhost:3000/contact',
];

const reports = await checker.checkMultiplePages(urls);
```

### 4. Block on Critical Violations

```typescript
const options = {
  blockOnCritical: true,
  includeFixSuggestions: true,
};

const report = await checker.checkAccessibility(url, options);

if (!report.passed) {
  console.error('Critical violations found!');
  process.exit(1);
}
```

## Integration with Verification Pipeline

```typescript
import { VerificationPipeline } from './services/VerificationPipeline';

const pipeline = new VerificationPipeline('./');

// Run full verification
const report = await pipeline.verify(
  true,  // Include E2E tests
  true,  // Include accessibility
  'http://localhost:3000'
);

// Generate report
if (report.accessibility) {
  await pipeline.generateAccessibilityReport(
    report.accessibility,
    './reports/a11y.html'
  );
}

await pipeline.close();
```

## E2E Test Example

```typescript
import { test } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('accessibility check', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Common Options

```typescript
const options = {
  blockOnCritical: true,      // Block if critical violations
  blockOnSerious: false,       // Don't block on serious
  includeFixSuggestions: true, // Include fix suggestions
  timeout: 30000,              // 30 second timeout
  rules: ['image-alt'],        // Check specific rules
  excludeRules: ['region'],    // Exclude rules
};
```

## Quick Fixes

### Missing Alt Text
```html
<img src="logo.png" alt="Company Logo">
```

### Color Contrast
```css
.text { color: #333; background: #fff; }
```

### Form Labels
```html
<label for="email">Email</label>
<input id="email" type="text">
```

### Button Names
```html
<button aria-label="Close">×</button>
```

## Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage
```

## Resources

- Full documentation: `docs/ACCESSIBILITY-CHECKING.md`
- E2E examples: `tests/e2e/accessibility-verification.spec.ts`
- Unit tests: `src/main/services/__tests__/AccessibilityChecker.test.ts`
