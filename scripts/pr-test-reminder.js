#!/usr/bin/env node

/**
 * PR Test Reminder
 * 
 * Posts a comment on PRs reminding about testing requirements.
 * Runs in GitHub Actions when a PR is opened or updated.
 */

const fs = require('fs');
const path = require('path');

function getCoverageData() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  
  if (!fs.existsSync(coveragePath)) {
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
    return data.total;
  } catch (error) {
    return null;
  }
}

function generatePRComment() {
  const coverage = getCoverageData();
  
  let comment = `## 🧪 Test Coverage Report\n\n`;

  if (!coverage) {
    comment += `⚠️ **No coverage data found**\n\n`;
    comment += `Please ensure tests are running and coverage is being collected.\n\n`;
    comment += `Run: \`npm test -- --coverage\`\n\n`;
  } else {
    const avgCoverage = (
      coverage.lines.pct +
      coverage.branches.pct +
      coverage.functions.pct +
      coverage.statements.pct
    ) / 4;

    comment += `### Coverage Summary\n\n`;
    comment += `| Metric | Coverage | Status |\n`;
    comment += `|--------|----------|--------|\n`;
    comment += `| Lines | ${coverage.lines.pct.toFixed(1)}% | ${coverage.lines.pct >= 70 ? '✅' : coverage.lines.pct >= 60 ? '⚠️' : '❌'} |\n`;
    comment += `| Branches | ${coverage.branches.pct.toFixed(1)}% | ${coverage.branches.pct >= 65 ? '✅' : coverage.branches.pct >= 55 ? '⚠️' : '❌'} |\n`;
    comment += `| Functions | ${coverage.functions.pct.toFixed(1)}% | ${coverage.functions.pct >= 70 ? '✅' : coverage.functions.pct >= 60 ? '⚠️' : '❌'} |\n`;
    comment += `| Statements | ${coverage.statements.pct.toFixed(1)}% | ${coverage.statements.pct >= 70 ? '✅' : coverage.statements.pct >= 60 ? '⚠️' : '❌'} |\n`;
    comment += `| **Average** | **${avgCoverage.toFixed(1)}%** | ${avgCoverage >= 70 ? '✅' : avgCoverage >= 60 ? '⚠️' : '❌'} |\n\n`;

    if (avgCoverage >= 70) {
      comment += `✅ **Excellent coverage!** Keep up the great work!\n\n`;
    } else if (avgCoverage >= 60) {
      comment += `⚠️ **Good coverage**, but there's room for improvement.\n\n`;
    } else {
      comment += `❌ **Coverage needs improvement.** Please add more tests.\n\n`;
    }
  }

  comment += `### 📋 Testing Checklist\n\n`;
  comment += `Please ensure:\n\n`;
  comment += `- [ ] Tests added for new functionality\n`;
  comment += `- [ ] All tests pass locally\n`;
  comment += `- [ ] Coverage meets minimum requirements (60% for new code)\n`;
  comment += `- [ ] Critical paths have tests (90%+ coverage)\n`;
  comment += `- [ ] Integration tests added for service interactions\n`;
  comment += `- [ ] Error scenarios are tested\n`;
  comment += `- [ ] Test documentation updated\n\n`;

  comment += `### 📚 Resources\n\n`;
  comment += `- [Testing Standards](../docs/testing/TESTING-STANDARDS.md)\n`;
  comment += `- [Test Writing Guide](../docs/testing/TEST-WRITING-GUIDE.md)\n`;
  comment += `- [Testing Checklist](../docs/testing/TESTING-CHECKLIST.md)\n`;
  comment += `- [Test Templates](../tests/templates/)\n\n`;

  comment += `### 🎯 Coverage Requirements\n\n`;
  comment += `| Service Type | Minimum Coverage |\n`;
  comment += `|--------------|------------------|\n`;
  comment += `| Critical (auth, payment) | 80% |\n`;
  comment += `| High Priority (education, marketplace) | 70% |\n`;
  comment += `| Standard Services | 60% |\n`;
  comment += `| Support Services | 50% |\n\n`;

  comment += `### 💡 Quick Commands\n\n`;
  comment += `\`\`\`bash\n`;
  comment += `# Run all tests\n`;
  comment += `npm test\n\n`;
  comment += `# Run with coverage\n`;
  comment += `npm test -- --coverage\n\n`;
  comment += `# Run specific test\n`;
  comment += `npm test -- path/to/test.test.ts\n\n`;
  comment += `# View coverage report\n`;
  comment += `open coverage/index.html\n`;
  comment += `\`\`\`\n\n`;

  comment += `---\n`;
  comment += `*This comment is automatically generated. For questions, see [Testing Documentation](../docs/testing/).*\n`;

  return comment;
}

function main() {
  const comment = generatePRComment();
  
  // Output to stdout for GitHub Actions to capture
  console.log(comment);
  
  // Also save to file for reference
  const outputPath = path.join(process.cwd(), 'pr-test-comment.md');
  fs.writeFileSync(outputPath, comment, 'utf-8');
  
  console.error(`\n✓ PR comment generated and saved to ${outputPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { generatePRComment };
