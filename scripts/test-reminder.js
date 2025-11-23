#!/usr/bin/env node

/**
 * Test Reminder Script
 * 
 * Provides helpful reminders about testing requirements and best practices.
 * Can be run manually or integrated into CI/CD workflows.
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function printHeader(title) {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize(title.toUpperCase(), 'bright'));
  console.log(colorize('='.repeat(60), 'cyan') + '\n');
}

function printSection(title) {
  console.log(colorize(`\n${title}`, 'blue'));
  console.log(colorize('-'.repeat(title.length), 'blue'));
}

function printSuccess(message) {
  console.log(colorize(`✓ ${message}`, 'green'));
}

function printWarning(message) {
  console.log(colorize(`⚠ ${message}`, 'yellow'));
}

function printError(message) {
  console.log(colorize(`✗ ${message}`, 'red'));
}

function printInfo(message) {
  console.log(colorize(`ℹ ${message}`, 'cyan'));
}

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

function showTestingReminders() {
  printHeader('Testing Reminders');

  printSection('Quick Commands');
  console.log('  npm test                    # Run all tests');
  console.log('  npm test -- --coverage      # Run with coverage');
  console.log('  npm test -- --watch         # Run in watch mode');
  console.log('  npm test -- path/to/test    # Run specific test');

  printSection('Coverage Requirements');
  console.log('  Critical Services:    80%+ coverage');
  console.log('  High Priority:        70%+ coverage');
  console.log('  Standard Services:    60%+ coverage');
  console.log('  Support Services:     50%+ coverage');
  console.log('  New Code:             60%+ coverage');

  printSection('Test Types');
  console.log('  Unit Tests:           60% of coverage (fast, isolated)');
  console.log('  Integration Tests:    30% of coverage (service interactions)');
  console.log('  E2E Tests:            10% of coverage (critical paths)');

  printSection('Best Practices');
  printSuccess('Write tests before or with code (TDD)');
  printSuccess('Follow AAA pattern: Arrange, Act, Assert');
  printSuccess('Keep tests independent and isolated');
  printSuccess('Use factories for test data');
  printSuccess('Mock external dependencies');
  printSuccess('Clean up test data after tests');
  printSuccess('Write descriptive test names');

  printSection('Common Mistakes to Avoid');
  printError('Writing tests without assertions');
  printError('Testing implementation details');
  printError('Sharing state between tests');
  printError('Not cleaning up test data');
  printError('Using production data in tests');
  printError('Ignoring flaky tests');
  printError('Writing slow tests');

  printSection('Resources');
  console.log('  📚 Testing Standards:     docs/testing/TESTING-STANDARDS.md');
  console.log('  📝 Test Writing Guide:    docs/testing/TEST-WRITING-GUIDE.md');
  console.log('  ✅ Testing Checklist:     docs/testing/TESTING-CHECKLIST.md');
  console.log('  🏭 Factory Guide:         docs/testing/FACTORY-GUIDE.md');
  console.log('  🎭 Mock Guide:            docs/testing/MOCK-GUIDE.md');
  console.log('  🔧 Troubleshooting:       docs/testing/TROUBLESHOOTING.md');
  console.log('  📋 Templates:             tests/templates/');
}

function showCoverageStatus() {
  const coverage = getCoverageData();

  if (!coverage) {
    printSection('Coverage Status');
    printWarning('No coverage data found. Run: npm test -- --coverage');
    return;
  }

  printSection('Current Coverage');
  
  const metrics = [
    { name: 'Lines', value: coverage.lines.pct, target: 70 },
    { name: 'Branches', value: coverage.branches.pct, target: 65 },
    { name: 'Functions', value: coverage.functions.pct, target: 70 },
    { name: 'Statements', value: coverage.statements.pct, target: 70 },
  ];

  metrics.forEach(({ name, value, target }) => {
    const status = value >= target ? '✓' : '✗';
    const color = value >= target ? 'green' : value >= target - 10 ? 'yellow' : 'red';
    const bar = '█'.repeat(Math.floor(value / 5)) + '░'.repeat(20 - Math.floor(value / 5));
    
    console.log(
      `  ${colorize(status, color)} ${name.padEnd(12)} ${colorize(bar, color)} ${value.toFixed(1)}% (target: ${target}%)`
    );
  });

  const avgCoverage = (
    coverage.lines.pct +
    coverage.branches.pct +
    coverage.functions.pct +
    coverage.statements.pct
  ) / 4;

  console.log();
  if (avgCoverage >= 70) {
    printSuccess(`Excellent coverage: ${avgCoverage.toFixed(1)}%`);
  } else if (avgCoverage >= 60) {
    printWarning(`Good coverage: ${avgCoverage.toFixed(1)}% - Keep improving!`);
  } else if (avgCoverage >= 50) {
    printWarning(`Adequate coverage: ${avgCoverage.toFixed(1)}% - Needs improvement`);
  } else {
    printError(`Low coverage: ${avgCoverage.toFixed(1)}% - Action required!`);
  }
}

function showNextSteps() {
  printSection('Next Steps');
  
  const coverage = getCoverageData();
  
  if (!coverage) {
    console.log('  1. Run tests with coverage: npm test -- --coverage');
    console.log('  2. Review coverage report: open coverage/index.html');
    console.log('  3. Identify gaps in coverage');
    console.log('  4. Add tests for uncovered code');
  } else {
    const avgCoverage = (
      coverage.lines.pct +
      coverage.branches.pct +
      coverage.functions.pct +
      coverage.statements.pct
    ) / 4;

    if (avgCoverage < 60) {
      console.log('  1. Focus on critical services first');
      console.log('  2. Add tests for auth, payment, and education services');
      console.log('  3. Use test templates: tests/templates/');
      console.log('  4. Review testing guide: docs/testing/TEST-WRITING-GUIDE.md');
    } else if (avgCoverage < 70) {
      console.log('  1. Review coverage report: open coverage/index.html');
      console.log('  2. Identify files with low coverage');
      console.log('  3. Add integration tests for service interactions');
      console.log('  4. Test error scenarios and edge cases');
    } else {
      console.log('  1. Maintain current coverage levels');
      console.log('  2. Add E2E tests for critical paths');
      console.log('  3. Optimize slow tests');
      console.log('  4. Fix any flaky tests');
    }
  }

  console.log('  5. Run tests before committing: npm test');
  console.log('  6. Review PR checklist before submitting');
}

function showMotivation() {
  const quotes = [
    '"Code without tests is broken by design." - Jacob Kaplan-Moss',
    '"Testing leads to failure, and failure leads to understanding." - Burt Rutan',
    '"If you don\'t like testing your product, most likely your customers won\'t like to test it either." - Anonymous',
    '"The bitterness of poor quality remains long after the sweetness of meeting the schedule has been forgotten." - Karl Wiegers',
    '"Quality is not an act, it is a habit." - Aristotle',
  ];

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  
  printSection('Motivation');
  console.log(`  ${colorize(quote, 'cyan')}`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'coverage':
      showCoverageStatus();
      break;
    case 'steps':
      showNextSteps();
      break;
    case 'motivation':
      showMotivation();
      break;
    case 'full':
      showTestingReminders();
      showCoverageStatus();
      showNextSteps();
      showMotivation();
      break;
    default:
      showTestingReminders();
      showCoverageStatus();
      showNextSteps();
  }

  console.log('\n' + colorize('Happy Testing! 🚀', 'green') + '\n');
}

if (require.main === module) {
  main();
}

module.exports = {
  showTestingReminders,
  showCoverageStatus,
  showNextSteps,
  showMotivation,
};
