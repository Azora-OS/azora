# Task 8.3 Complete: Accessibility Checking with axe-core

## Summary

Successfully integrated axe-core accessibility checking into AzStudio's verification pipeline. The implementation provides automated accessibility testing with detailed violation reports, fix suggestions, and commit blocking capabilities.

## Implementation Details

### 1. AccessibilityChecker Service

Created `src/main/services/AccessibilityChecker.ts` with the following features:

- **Automated Scanning**: Uses Playwright and axe-core to scan preview pages
- **Severity Categorization**: Violations classified as Critical, Serious, Moderate, or Minor
- **Fix Suggestions**: Provides actionable fix suggestions for 20+ common accessibility issues
- **HTML Reports**: Generates beautiful, detailed HTML reports with violation details
- **Multiple Page Support**: Can check multiple URLs in a single operation
- **Configurable Options**: Supports custom rules, exclusions, and blocking thresholds

### 2. Integration with VerificationPipeline

Updated `src/main/services/VerificationPipeline.ts`:

- Added accessibility checking to the verification workflow
- Integrated with existing test and E2E verification
- Supports optional accessibility checks with preview URL
- Aggregates blockers from all verification sources
- Provides methods for generating accessibility reports

### 3. Comprehensive Testing

Created test files:

- `src/main/services/__tests__/AccessibilityChecker.test.ts`: Unit tests for AccessibilityChecker
- `src/main/services/__tests__/VerificationPipeline.test.ts`: Integration tests
- `tests/e2e/accessibility-verification.spec.ts`: E2E tests demonstrating real-world usage

### 4. Documentation

Created `docs/ACCESSIBILITY-CHECKING.md` with:

- Complete usage guide
- Common violations and fixes
- Integration examples
- Best practices
- Troubleshooting guide

### 5. Project Configuration

- Installed `axe-core` and `@axe-core/playwright` packages
- Set up Jest for unit testing
- Created test fixtures directory
- Added test scripts to package.json

## Features Implemented

### ✅ Run axe-core against preview pages

```typescript
const checker = new AccessibilityChecker(projectRoot);
const report = await checker.checkAccessibility('http://localhost:3000');
```

### ✅ Display violations with severity levels

```typescript
console.log(`Critical: ${report.summary.critical}`);
console.log(`Serious: ${report.summary.serious}`);
console.log(`Moderate: ${report.summary.moderate}`);
console.log(`Minor: ${report.summary.minor}`);
```

### ✅ Provide fix suggestions for common issues

The implementation includes fix suggestions for 20+ common accessibility issues:

- image-alt
- button-name
- color-contrast
- label
- link-name
- heading-order
- html-has-lang
- landmark-one-main
- region
- aria-required-attr
- aria-valid-attr-value
- duplicate-id
- form-field-multiple-labels
- frame-title
- input-button-name
- meta-viewport
- page-has-heading-one
- scrollable-region-focusable
- select-name
- tabindex

### ✅ Block commits on critical violations

```typescript
const options = {
  blockOnCritical: true,
  blockOnSerious: false,
};

const report = await checker.checkAccessibility(url, options);

if (!report.passed) {
  console.error('Cannot commit: Critical accessibility violations found');
  process.exit(1);
}
```

## Usage Examples

### Basic Check

```typescript
import { AccessibilityChecker } from './services/AccessibilityChecker';

const checker = new AccessibilityChecker(projectRoot);
const report = await checker.checkAccessibility('http://localhost:3000');

if (!report.passed) {
  console.log('Accessibility violations found:');
  report.violations.forEach(v => {
    console.log(`  ${v.impact.toUpperCase()}: ${v.help}`);
  });
}

await checker.close();
```

### Integration with Verification Pipeline

```typescript
import { VerificationPipeline } from './services/VerificationPipeline';

const pipeline = new VerificationPipeline(projectRoot);

const report = await pipeline.verify(
  true,  // Include E2E tests
  true,  // Include accessibility check
  'http://localhost:3000'
);

if (report.accessibility) {
  await pipeline.generateAccessibilityReport(
    report.accessibility,
    './reports/a11y-report.html'
  );
}

await pipeline.close();
```

### E2E Test Integration

```typescript
import { test } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Files Created/Modified

### Created Files

1. `src/main/services/AccessibilityChecker.ts` - Main accessibility checker service
2. `src/main/services/__tests__/AccessibilityChecker.test.ts` - Unit tests
3. `src/main/services/__tests__/VerificationPipeline.test.ts` - Integration tests
4. `tests/e2e/accessibility-verification.spec.ts` - E2E tests
5. `docs/ACCESSIBILITY-CHECKING.md` - Complete documentation
6. `jest.config.js` - Jest configuration
7. `src/__tests__/setup.ts` - Jest setup file

### Modified Files

1. `src/main/services/VerificationPipeline.ts` - Added accessibility integration
2. `src/main/services/index.ts` - Exported AccessibilityChecker
3. `package.json` - Added dependencies and test scripts

## Dependencies Added

```json
{
  "devDependencies": {
    "axe-core": "^4.x",
    "@axe-core/playwright": "^4.x",
    "jest": "^29.x",
    "ts-jest": "^29.x",
    "@types/jest": "^29.x",
    "identity-obj-proxy": "^3.x"
  }
}
```

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:coverage
```

## Accessibility Report Features

The generated HTML reports include:

- **Overall Status**: Pass/Fail with visual indicators
- **Summary Statistics**: Count of violations by severity
- **Detailed Violations**: Each violation with:
  - Severity badge (color-coded)
  - Description and help text
  - Link to WCAG documentation
  - Affected HTML elements
  - Failure summaries
  - Actionable fix suggestions
- **Responsive Design**: Works on desktop and mobile
- **Professional Styling**: Clean, modern interface

## Requirements Met

✅ **Requirement 12.2**: Run accessibility checks using axe-core and display violations with severity levels

✅ **Requirement 12.5**: Block commits on critical violations and provide actionable fix suggestions

## Next Steps

The following related tasks can now be implemented:

- **Task 8.4**: Add performance measurement with Lighthouse
- **Task 8.5**: Implement verification gate system

## Notes

- The AccessibilityChecker uses Playwright's chromium browser for testing
- Fix suggestions are based on WCAG 2.1 Level AA guidelines
- The implementation supports custom rule configuration for specific needs
- HTML reports are self-contained and can be shared with team members
- The checker can be integrated into CI/CD pipelines for automated testing

## Verification

To verify the implementation:

1. Start a preview server: `npm run dev`
2. Run accessibility check:
   ```typescript
   const checker = new AccessibilityChecker('./');
   const report = await checker.checkAccessibility('http://localhost:3000');
   await checker.generateHTMLReport(report, './a11y-report.html');
   ```
3. Open `a11y-report.html` in a browser to see the detailed report

## Conclusion

Task 8.3 is complete. AzStudio now has comprehensive accessibility checking capabilities that integrate seamlessly with the verification pipeline, provide detailed reports with fix suggestions, and can block commits when critical violations are found.
