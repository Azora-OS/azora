# Performance Measurement with Lighthouse

AzStudio integrates Google Lighthouse to provide comprehensive performance measurement and optimization recommendations for your web applications.

## Overview

The Lighthouse integration allows you to:
- Measure Core Web Vitals (LCP, FID, CLS)
- Get performance scores across multiple categories
- Receive actionable optimization recommendations
- Track performance over time
- Compare performance between versions

## Quick Start

```typescript
import { LighthouseRunner } from './services/LighthouseRunner';

const runner = new LighthouseRunner('/path/to/project');

// Initialize (installs Lighthouse if needed)
await runner.initialize();

// Run audit on a preview page
const report = await runner.runAudit('http://localhost:3000');

console.log('Performance Score:', report.scores.performance);
console.log('LCP:', report.coreWebVitals.LCP, 'ms');
console.log('Passed:', report.passed);
```

## Core Web Vitals

### What are Core Web Vitals?

Core Web Vitals are a set of metrics that measure real-world user experience:

- **LCP (Largest Contentful Paint)**: Measures loading performance
  - Good: ≤ 2.5s
  - Needs Improvement: 2.5s - 4.0s
  - Poor: > 4.0s

- **FID (First Input Delay)**: Measures interactivity
  - Good: ≤ 100ms
  - Needs Improvement: 100ms - 300ms
  - Poor: > 300ms

- **CLS (Cumulative Layout Shift)**: Measures visual stability
  - Good: ≤ 0.1
  - Needs Improvement: 0.1 - 0.25
  - Poor: > 0.25

### Measuring Core Web Vitals

```typescript
const vitals = await runner.measureCoreWebVitals('http://localhost:3000');

console.log('LCP:', vitals.LCP, 'ms');
console.log('FID:', vitals.FID, 'ms');
console.log('CLS:', vitals.CLS);
console.log('FCP:', vitals.FCP, 'ms');
console.log('TTI:', vitals.TTI, 'ms');
console.log('TBT:', vitals.TBT, 'ms');
console.log('SI:', vitals.SI, 'ms');
```

## Performance Scores

Lighthouse provides scores across multiple categories:

```typescript
const scores = await runner.getPerformanceScores('http://localhost:3000');

console.log('Performance:', scores.performance);      // 0-100
console.log('Accessibility:', scores.accessibility);  // 0-100
console.log('Best Practices:', scores.bestPractices); // 0-100
console.log('SEO:', scores.seo);                      // 0-100
console.log('PWA:', scores.pwa);                      // 0-100
```

### Score Interpretation

- **90-100**: Good (Green)
- **50-89**: Needs Improvement (Orange)
- **0-49**: Poor (Red)

## Optimization Recommendations

Get actionable recommendations to improve performance:

```typescript
const recommendations = await runner.getRecommendations('http://localhost:3000');

for (const rec of recommendations) {
  console.log(`[${rec.score}] ${rec.title}`);
  console.log(`  ${rec.description}`);
  if (rec.displayValue) {
    console.log(`  Impact: ${rec.displayValue}`);
  }
}
```

Common recommendations include:
- Eliminate render-blocking resources
- Reduce unused JavaScript
- Properly size images
- Minimize main-thread work
- Reduce server response times
- Enable text compression

## Audit Options

Customize Lighthouse audits with options:

```typescript
const report = await runner.runAudit('http://localhost:3000', {
  formFactor: 'mobile',           // 'mobile' | 'desktop'
  throttling: 'mobile3G',         // 'mobile3G' | 'mobile4G' | 'none'
  onlyCategories: ['performance'], // Limit to specific categories
  output: 'html',                 // 'json' | 'html' | 'csv'
  outputPath: './reports/perf.html',
});
```

### Form Factors

- **Desktop**: Simulates desktop browsing (default)
- **Mobile**: Simulates mobile device with slower CPU

### Throttling

- **none**: No throttling (default)
- **mobile3G**: Simulates 3G connection
- **mobile4G**: Simulates 4G connection

## Multiple Page Audits

Audit multiple pages in one go:

```typescript
const urls = [
  'http://localhost:3000',
  'http://localhost:3000/about',
  'http://localhost:3000/products',
  'http://localhost:3000/contact',
];

const reports = await runner.runMultipleAudits(urls, {
  formFactor: 'mobile',
});

for (const report of reports) {
  console.log(`${report.url}: ${report.scores.performance}`);
}
```

## Performance History

Track performance over time:

```typescript
// Run audits over time
await runner.runAudit('http://localhost:3000');
// ... make changes ...
await runner.runAudit('http://localhost:3000');
// ... make more changes ...
await runner.runAudit('http://localhost:3000');

// Get history
const history = runner.getHistory('http://localhost:3000');
console.log('Total reports:', history.reports.length);

// Get trend data
const trend = runner.getTrend('http://localhost:3000');
console.log('Performance trend:', trend.performance);
console.log('LCP trend:', trend.LCP);
console.log('FID trend:', trend.FID);
console.log('CLS trend:', trend.CLS);
```

History is automatically saved to `.azstudio/performance-history.json` and persists across sessions.

## Comparing Reports

Compare performance between versions:

```typescript
const baseline = await runner.runAudit('http://localhost:3000');

// Make changes to your app

const current = await runner.runAudit('http://localhost:3000');

const comparison = runner.compareReports(baseline, current);

console.log('Performance change:', comparison.scores.performance);
console.log('LCP change:', comparison.coreWebVitals.LCP, 'ms');
console.log('Improved:', comparison.improved);
```

## HTML Reports

Generate beautiful HTML reports:

```typescript
const report = await runner.runAudit('http://localhost:3000');

await runner.generateHTMLReport(
  report,
  './reports/performance-report.html'
);
```

The HTML report includes:
- Performance scores with color coding
- Core Web Vitals with status badges
- Top 10 recommendations with descriptions
- Timestamp and URL information

## Integration with Verification Pipeline

The Lighthouse runner is integrated into the verification pipeline:

```typescript
import { VerificationPipeline } from './services/VerificationPipeline';

const pipeline = new VerificationPipeline('/path/to/project');

// Run full verification including performance
const report = await pipeline.verify(
  true,  // includeE2E
  true,  // includeAccessibility
  true,  // includePerformance
  'http://localhost:3000'
);

if (report.performance) {
  console.log('Performance Score:', report.performance.scores.performance);
  console.log('LCP:', report.performance.coreWebVitals.LCP);
  console.log('Passed:', report.performance.passed);
}

// Get specific performance metrics
const vitals = await pipeline.measureCoreWebVitals('http://localhost:3000');
const scores = await pipeline.getPerformanceScores('http://localhost:3000');
const recommendations = await pipeline.getPerformanceRecommendations('http://localhost:3000');
```

## Performance Thresholds

By default, a performance report is considered "passed" if:
- Performance score ≥ 90

You can customize this logic by checking specific metrics:

```typescript
const report = await runner.runAudit('http://localhost:3000');

const customPassed = 
  report.scores.performance >= 85 &&
  report.coreWebVitals.LCP <= 2500 &&
  report.coreWebVitals.FID <= 100 &&
  report.coreWebVitals.CLS <= 0.1;

if (!customPassed) {
  console.log('Performance requirements not met!');
}
```

## Best Practices

### 1. Run Audits on Production-Like Builds

Always audit production builds, not development builds:

```bash
# Build for production
npm run build

# Start production server
npm start

# Then run audit
```

### 2. Use Consistent Conditions

For accurate comparisons, use the same:
- Form factor (mobile/desktop)
- Throttling settings
- Network conditions
- Browser version

### 3. Run Multiple Times

Performance can vary. Run audits 3-5 times and average the results:

```typescript
const runs = 5;
const reports = [];

for (let i = 0; i < runs; i++) {
  const report = await runner.runAudit('http://localhost:3000');
  reports.push(report);
}

const avgPerformance = reports.reduce((sum, r) => sum + r.scores.performance, 0) / runs;
console.log('Average Performance Score:', avgPerformance);
```

### 4. Focus on Core Web Vitals

While overall scores are useful, prioritize Core Web Vitals as they directly impact user experience.

### 5. Track Trends

Don't just look at absolute scores. Track trends over time to ensure performance doesn't regress.

## Troubleshooting

### Lighthouse Not Found

If you get "Lighthouse not found" errors:

```bash
cd azstudio
npm install --save-dev lighthouse
```

### Chrome Not Found

Lighthouse requires Chrome. If you get Chrome errors:

```bash
# Install Chrome or Chromium
# On Windows, download from google.com/chrome
```

### Timeout Errors

If audits timeout, increase the timeout:

```typescript
// Modify the timeout in LighthouseRunner.ts
timeout: 180000, // 3 minutes instead of 2
```

### Inconsistent Results

If results vary significantly:
- Close other applications
- Disable browser extensions
- Use throttling for consistent network conditions
- Run multiple times and average

## Examples

### Example 1: CI/CD Integration

```typescript
// In your CI/CD pipeline
const runner = new LighthouseRunner(process.cwd());
await runner.initialize();

const report = await runner.runAudit(process.env.PREVIEW_URL);

if (report.scores.performance < 90) {
  console.error('Performance score below threshold!');
  process.exit(1);
}

if (report.coreWebVitals.LCP > 2500) {
  console.error('LCP too high!');
  process.exit(1);
}
```

### Example 2: Performance Dashboard

```typescript
// Generate reports for all pages
const pages = ['/home', '/about', '/products', '/contact'];
const baseUrl = 'http://localhost:3000';

const reports = await runner.runMultipleAudits(
  pages.map(p => baseUrl + p)
);

// Create summary
const summary = reports.map(r => ({
  url: r.url,
  performance: r.scores.performance,
  lcp: r.coreWebVitals.LCP,
  fid: r.coreWebVitals.FID,
  cls: r.coreWebVitals.CLS,
}));

console.table(summary);
```

### Example 3: Regression Detection

```typescript
// Load baseline from history
const history = runner.getHistory('http://localhost:3000');
const baseline = history?.reports[0];

if (baseline) {
  const current = await runner.runAudit('http://localhost:3000');
  const comparison = runner.compareReports(baseline, current);
  
  if (!comparison.improved) {
    console.warn('Performance regression detected!');
    console.warn('Performance:', comparison.scores.performance);
    console.warn('LCP:', comparison.coreWebVitals.LCP, 'ms');
  }
}
```

## API Reference

See the [LighthouseRunner TypeScript definitions](../src/main/services/LighthouseRunner.ts) for complete API documentation.

## Related Documentation

- [E2E Testing](./E2E-TESTING.md)
- [Accessibility Checking](./ACCESSIBILITY-CHECKING.md)
- [Verification Pipeline](./VERIFICATION-PIPELINE.md)
- [Preview Generation](./PREVIEW-GENERATION.md)
