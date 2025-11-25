# Accessibility Checking with axe-core

AzStudio integrates axe-core to automatically check accessibility violations in your preview pages. This ensures your applications meet WCAG standards and are accessible to all users.

## Features

- **Automated Accessibility Scanning**: Run axe-core against preview pages automatically
- **Severity Levels**: Violations categorized as Critical, Serious, Moderate, or Minor
- **Fix Suggestions**: Get actionable suggestions for common accessibility issues
- **Commit Blocking**: Optionally block commits when critical violations are found
- **HTML Reports**: Generate detailed HTML reports with violation details
- **Multiple Page Checking**: Check accessibility across multiple pages at once

## Usage

### Basic Accessibility Check

```typescript
import { AccessibilityChecker } from './services/AccessibilityChecker';

const checker = new AccessibilityChecker(projectRoot);

// Check a single page
const report = await checker.checkAccessibility('http://localhost:3000');

console.log(`Total violations: ${report.summary.total}`);
console.log(`Critical: ${report.summary.critical}`);
console.log(`Passed: ${report.passed}`);

// Close when done
await checker.close();
```

### Check Multiple Pages

```typescript
const urls = [
  'http://localhost:3000',
  'http://localhost:3000/about',
  'http://localhost:3000/contact',
];

const reports = await checker.checkMultiplePages(urls);

reports.forEach(report => {
  console.log(`${report.url}: ${report.passed ? 'PASSED' : 'FAILED'}`);
  console.log(`  Violations: ${report.summary.total}`);
});
```

### Custom Options

```typescript
const options = {
  blockOnCritical: true,      // Block if critical violations found
  blockOnSerious: true,        // Block if serious violations found
  includeFixSuggestions: true, // Include fix suggestions
  timeout: 30000,              // Timeout in milliseconds
  rules: ['image-alt', 'color-contrast'], // Check specific rules
  excludeRules: ['region'],    // Exclude specific rules
};

const report = await checker.checkAccessibility(
  'http://localhost:3000',
  options
);
```

### Generate HTML Report

```typescript
const report = await checker.checkAccessibility('http://localhost:3000');

await checker.generateHTMLReport(
  report,
  './reports/accessibility-report.html'
);
```

### Integration with Verification Pipeline

```typescript
import { VerificationPipeline } from './services/VerificationPipeline';

const pipeline = new VerificationPipeline(projectRoot);

// Run full verification including accessibility
const report = await pipeline.verify(
  true,  // Include E2E tests
  true,  // Include accessibility check
  'http://localhost:3000' // Preview URL
);

if (!report.passed) {
  console.log('Verification failed:');
  report.blockers.forEach(blocker => console.log(`  - ${blocker}`));
}

// Generate accessibility report if checked
if (report.accessibility) {
  await pipeline.generateAccessibilityReport(
    report.accessibility,
    './reports/a11y-report.html'
  );
}

await pipeline.close();
```

## Violation Severity Levels

### Critical
Issues that will severely impact accessibility and must be fixed immediately.

Examples:
- Missing alt text on images
- Form inputs without labels
- Missing page language

### Serious
Issues that will seriously impact accessibility and should be fixed soon.

Examples:
- Insufficient color contrast
- Missing ARIA attributes
- Improper heading hierarchy

### Moderate
Issues that will moderately impact accessibility.

Examples:
- Redundant links
- Missing landmarks
- Improper list structure

### Minor
Issues that will slightly impact accessibility.

Examples:
- Missing meta viewport
- Redundant alternative text
- Minor ARIA issues

## Common Violations and Fixes

### Image Alt Text

**Violation**: `image-alt`

**Fix**:
```html
<!-- Before -->
<img src="logo.png">

<!-- After -->
<img src="logo.png" alt="Company Logo">

<!-- Decorative image -->
<img src="decoration.png" alt="" role="presentation">
```

### Color Contrast

**Violation**: `color-contrast`

**Fix**:
```css
/* Before - Insufficient contrast */
.text {
  color: #777;
  background: #fff;
}

/* After - Sufficient contrast (4.5:1 ratio) */
.text {
  color: #333;
  background: #fff;
}
```

### Form Labels

**Violation**: `label`

**Fix**:
```html
<!-- Before -->
<input type="text" name="email">

<!-- After -->
<label for="email">Email Address</label>
<input type="text" id="email" name="email">

<!-- Or with aria-label -->
<input type="text" name="email" aria-label="Email Address">
```

### Button Names

**Violation**: `button-name`

**Fix**:
```html
<!-- Before -->
<button><i class="icon-close"></i></button>

<!-- After -->
<button aria-label="Close dialog">
  <i class="icon-close"></i>
</button>

<!-- Or with visible text -->
<button>
  <i class="icon-close"></i>
  <span>Close</span>
</button>
```

### Link Names

**Violation**: `link-name`

**Fix**:
```html
<!-- Before -->
<a href="/article">Read more</a>

<!-- After -->
<a href="/article">Read more about accessibility testing</a>

<!-- Or with aria-label -->
<a href="/article" aria-label="Read more about accessibility testing">
  Read more
</a>
```

### Heading Order

**Violation**: `heading-order`

**Fix**:
```html
<!-- Before - Skips heading levels -->
<h1>Page Title</h1>
<h3>Section Title</h3>

<!-- After - Sequential order -->
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
```

## Blocking Commits on Violations

Configure the verification pipeline to block commits when accessibility violations are found:

```typescript
const options = {
  blockOnCritical: true,  // Block on critical violations
  blockOnSerious: false,  // Don't block on serious violations
};

const report = await checker.checkAccessibility(url, options);

if (!report.passed) {
  console.error('Cannot commit: Accessibility violations found');
  process.exit(1);
}
```

## E2E Test Integration

Use axe-core in your Playwright E2E tests:

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await injectAxe(page);
  await checkA11y(page);
});

test('should have no critical violations', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await injectAxe(page);
  await checkA11y(page, undefined, {
    includedImpacts: ['critical'],
  });
});
```

## Report Structure

The accessibility report includes:

```typescript
interface A11yReport {
  url: string;                    // URL checked
  timestamp: Date;                // When check was performed
  violations: A11yViolation[];    // Array of violations found
  passes: number;                 // Number of passed checks
  incomplete: number;             // Number of incomplete checks
  inapplicable: number;           // Number of inapplicable checks
  summary: {
    critical: number;             // Count of critical violations
    serious: number;              // Count of serious violations
    moderate: number;             // Count of moderate violations
    minor: number;                // Count of minor violations
    total: number;                // Total violations
  };
  passed: boolean;                // Overall pass/fail status
  blockers: string[];             // Blocking issues
}
```

Each violation includes:

```typescript
interface A11yViolation {
  id: string;                     // Rule ID (e.g., 'image-alt')
  impact: ViolationSeverity;      // Severity level
  description: string;            // Description of the issue
  help: string;                   // How to fix it
  helpUrl: string;                // Link to documentation
  nodes: A11yViolationNode[];     // Affected elements
  tags: string[];                 // WCAG tags
}
```

## Best Practices

1. **Run Early and Often**: Check accessibility during development, not just before deployment
2. **Fix Critical Issues First**: Prioritize critical and serious violations
3. **Use Automated and Manual Testing**: Automated tools catch ~30-40% of issues; manual testing is still needed
4. **Test with Real Users**: Include users with disabilities in your testing process
5. **Document Exceptions**: If you must exclude a rule, document why
6. **Educate Your Team**: Train developers on accessibility best practices
7. **Set Coverage Goals**: Aim for zero critical violations, minimize serious ones

## WCAG Compliance Levels

- **Level A**: Minimum level of conformance
- **Level AA**: Recommended level (most common target)
- **Level AAA**: Highest level of conformance

AzStudio checks against WCAG 2.1 Level AA by default.

## Resources

- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Deque University](https://dequeuniversity.com/)

## Troubleshooting

### Browser Not Launching

If Playwright fails to launch the browser:

```bash
# Install browsers
npx playwright install

# Or install specific browser
npx playwright install chromium
```

### Timeout Issues

Increase the timeout for slow pages:

```typescript
const options = {
  timeout: 60000, // 60 seconds
};

const report = await checker.checkAccessibility(url, options);
```

### False Positives

Exclude specific rules that don't apply:

```typescript
const options = {
  excludeRules: ['color-contrast'], // If using custom themes
};
```

### Memory Issues

Check multiple pages in batches:

```typescript
const urls = [...]; // Large array of URLs

// Process in batches of 10
for (let i = 0; i < urls.length; i += 10) {
  const batch = urls.slice(i, i + 10);
  const reports = await checker.checkMultiplePages(batch);
  // Process reports
}
```

## Contributing

To add new fix suggestions:

1. Edit `AccessibilityChecker.ts`
2. Add to the `fixMap` in `generateFixSuggestions()`
3. Include clear, actionable steps
4. Add examples when possible

Example:

```typescript
'new-rule-id': [
  'Clear description of the fix',
  'Step-by-step instructions',
  'Example: <code>',
],
```
