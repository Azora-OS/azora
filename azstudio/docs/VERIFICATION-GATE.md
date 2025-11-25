# Verification Gate System

The Verification Gate System is a comprehensive quality control mechanism that ensures all code changes meet specific requirements before they can be committed. It automatically detects the type of change, runs appropriate verification checks, and provides actionable fix suggestions.

## Overview

The verification gate system:
- **Detects change types** automatically from modified files
- **Defines verification requirements** per change type
- **Runs all required checks** before allowing commits
- **Generates comprehensive reports** with detailed results
- **Provides actionable fix suggestions** for any issues found

## Change Types

The system recognizes the following change types:

### 1. UI Component (`ui-component`)
**Detected when:** Changes to components, pages, or CSS files

**Requirements:**
- ✅ Unit tests (80% coverage minimum)
- ✅ E2E tests
- ✅ Accessibility checks (0 critical violations)
- ✅ Performance checks (90+ score)
- ✅ Type checking
- ✅ Linting

### 2. API Endpoint (`api-endpoint`)
**Detected when:** Changes to API routes, controllers, or endpoints

**Requirements:**
- ✅ Unit tests (90% coverage minimum)
- ✅ Integration tests
- ✅ Type checking
- ✅ Linting

### 3. Database Schema (`database-schema`)
**Detected when:** Changes to Prisma schema or migrations

**Requirements:**
- ✅ Integration tests (80% coverage minimum)
- ✅ Type checking
- ✅ Linting

### 4. Service Logic (`service-logic`)
**Detected when:** Changes to service layer code

**Requirements:**
- ✅ Unit tests (85% coverage minimum)
- ✅ Integration tests
- ✅ Type checking
- ✅ Linting

### 5. Design Filter (`design-filter`)
**Detected when:** Changes to Tailwind config, design tokens, or themes

**Requirements:**
- ✅ E2E tests
- ✅ Accessibility checks (max 5 violations, 0 critical)
- ✅ Performance checks (85+ score)
- ✅ Type checking
- ✅ Linting

### 6. Configuration (`configuration`)
**Detected when:** Changes to config files

**Requirements:**
- ✅ Integration tests
- ✅ Type checking
- ✅ Linting

### 7. Documentation (`documentation`)
**Detected when:** Changes to markdown or documentation files

**Requirements:**
- ✅ Linting only

### 8. Test (`test`)
**Detected when:** Changes to test files

**Requirements:**
- ✅ Unit tests (tests must pass)
- ✅ Type checking
- ✅ Linting

## Usage

### Basic Usage

```typescript
import { VerificationGate } from './services/VerificationGate';

const gate = new VerificationGate('/path/to/project');

// Detect change type from modified files
const modifiedFiles = [
  'src/components/Button.tsx',
  'src/components/Button.css',
];

const changeType = gate.detectChangeType(modifiedFiles);
console.log('Change type:', changeType); // 'ui-component'

// Run verification
const report = await gate.runVerification(
  changeType,
  modifiedFiles,
  'http://localhost:3000' // Preview URL for UI changes
);

// Check if can commit
if (report.canCommit) {
  console.log('✅ All checks passed! Ready to commit.');
} else {
  console.log('❌ Cannot commit. Issues found:');
  report.fixSuggestions.forEach(suggestion => {
    console.log(`- [${suggestion.severity}] ${suggestion.issue}`);
    console.log(`  ${suggestion.suggestion}`);
  });
}

// Generate reports
await gate.generateHTMLReport(report, './verification-report.html');
await gate.generateJSONReport(report, './verification-report.json');
const markdown = gate.generateMarkdownSummary(report);
console.log(markdown);

// Clean up
await gate.close();
```

### Get Requirements for a Change Type

```typescript
const requirements = gate.getRequirements('ui-component');

console.log('Required checks:', requirements.required);
console.log('Thresholds:', requirements.thresholds);
```

### Manual Change Type

```typescript
// If you know the change type, you can specify it directly
const report = await gate.runVerification(
  'api-endpoint',
  ['src/api/users.ts']
);
```

## Verification Report

The verification gate generates a comprehensive report with the following structure:

```typescript
interface VerificationGateReport {
  // Basic verification results
  tests: TestResults;
  e2eTests?: E2EResults;
  accessibility?: A11yReport;
  performance?: PerformanceReport;
  passed: boolean;
  blockers: string[];
  timestamp: Date;
  
  // Gate-specific information
  changeType: ChangeType;
  requirements: VerificationRequirements;
  fixSuggestions: FixSuggestion[];
  canCommit: boolean;
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    skippedChecks: number;
  };
}
```

## Fix Suggestions

Fix suggestions are categorized by severity and category:

### Severity Levels
- **Critical** 🔴: Must be fixed before commit
- **High** 🟠: Should be fixed before commit
- **Medium** 🟡: Should be addressed soon
- **Low** 🟢: Nice to have

### Categories
- **Test** 🧪: Test failures or coverage issues
- **Accessibility** ♿: Accessibility violations
- **Performance** ⚡: Performance issues
- **Code Quality** ✨: Code quality issues

### Example Fix Suggestions

```typescript
{
  issue: "Test failed: Button renders correctly",
  severity: "critical",
  category: "test",
  suggestion: "Fix the failing test in Button.test.tsx. Error: Expected true to be false",
  autoFixable: false
}

{
  issue: "Critical accessibility violation: color-contrast",
  severity: "critical",
  category: "accessibility",
  suggestion: "Elements must have sufficient color contrast. Fix: Ensure text has sufficient contrast. Affected elements: 3",
  autoFixable: false
}

{
  issue: "Performance score (75) below threshold (90)",
  severity: "high",
  category: "performance",
  suggestion: "Improve performance to meet the 90 threshold",
  autoFixable: false
}
```

## Report Formats

### HTML Report

The HTML report provides a visual, interactive view of all verification results:

```typescript
await gate.generateHTMLReport(report, './verification-report.html');
```

Features:
- Color-coded status (green for pass, red for fail)
- Detailed breakdown of all checks
- Fix suggestions with severity indicators
- Test results, accessibility violations, and performance metrics
- Responsive design for viewing on any device

### JSON Report

The JSON report provides machine-readable output for CI/CD integration:

```typescript
await gate.generateJSONReport(report, './verification-report.json');
```

Use cases:
- CI/CD pipeline integration
- Automated analysis
- Historical tracking
- Custom reporting tools

### Markdown Summary

The markdown summary provides a concise, readable overview:

```typescript
const markdown = gate.generateMarkdownSummary(report);
console.log(markdown);
```

Perfect for:
- Pull request comments
- Slack notifications
- Email reports
- Quick status checks

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Verification Gate

on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Verification Gate
        run: |
          node scripts/run-verification-gate.js
      
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: verification-report
          path: verification-report.html
      
      - name: Comment PR
        if: always()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const markdown = fs.readFileSync('verification-summary.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: markdown
            });
```

### Pre-commit Hook Example

```bash
#!/bin/bash
# .husky/pre-commit

# Get modified files
MODIFIED_FILES=$(git diff --cached --name-only)

# Run verification gate
node scripts/run-verification-gate.js "$MODIFIED_FILES"

# Check exit code
if [ $? -ne 0 ]; then
  echo "❌ Verification gate failed. Please fix the issues before committing."
  exit 1
fi

echo "✅ Verification gate passed!"
```

## Best Practices

1. **Run verification locally** before pushing to catch issues early
2. **Review fix suggestions** carefully - they provide actionable guidance
3. **Use appropriate change types** - the system auto-detects but you can override
4. **Set realistic thresholds** - adjust requirements based on your project needs
5. **Generate reports** for documentation and historical tracking
6. **Integrate with CI/CD** to enforce quality gates automatically

## Customization

You can customize verification requirements by modifying the `initializeRequirements()` method in `VerificationGate.ts`:

```typescript
// Example: Relax performance requirements for design filters
requirements.set('design-filter', {
  changeType: 'design-filter',
  required: {
    // ... other requirements
    performance: true,
  },
  thresholds: {
    minPerformanceScore: 80, // Changed from 85
    maxAccessibilityViolations: 10, // Changed from 5
  },
});
```

## Troubleshooting

### Issue: Type check fails but code looks correct
**Solution:** Run `npx tsc --noEmit` locally to see detailed type errors

### Issue: Lint fails with unclear errors
**Solution:** Run `npm run lint` locally to see full lint output

### Issue: Performance score varies between runs
**Solution:** Performance can vary due to system load. Run multiple times and use average

### Issue: Accessibility violations seem incorrect
**Solution:** Review the specific violation details and test with screen readers

## Related Documentation

- [Verification Pipeline](./VERIFICATION-PIPELINE.md)
- [E2E Testing](./E2E-TESTING.md)
- [Accessibility Checking](./ACCESSIBILITY-CHECKING.md)
- [Performance Measurement](./PERFORMANCE-MEASUREMENT.md)
