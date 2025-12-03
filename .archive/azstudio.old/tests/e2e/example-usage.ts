/**
 * Example: Using PlaywrightRunner programmatically
 * 
 * This file demonstrates how to use the PlaywrightRunner service
 * to generate and run E2E tests from user journeys.
 */

import { PlaywrightRunner, E2ETestScenario } from '../../src/main/services/PlaywrightRunner';

async function runE2ETestsExample() {
  // Initialize the runner
  const projectRoot = process.cwd();
  const runner = new PlaywrightRunner(projectRoot);

  // Define user journeys
  const userJourneys = [
    [
      'Open AzStudio',
      'Click "New Project"',
      'Select "Education Platform" template',
      'Enter project name',
      'Click "Create"',
      'Verify project structure is created',
    ],
    [
      'Open existing project',
      'Switch to visual canvas mode',
      'Drag "Auth Service" component to canvas',
      'Configure service properties',
      'Verify code is generated',
    ],
    [
      'Open file in editor',
      'Edit code',
      'Trigger AI code action',
      'Review suggestions',
      'Apply changes',
      'Save file',
    ],
  ];

  // Generate test scenarios
  const scenarios = runner.generateTestScenarios(userJourneys);

  console.log(`Generated ${scenarios.length} test scenarios:`);
  scenarios.forEach((scenario, index) => {
    console.log(`\n${index + 1}. ${scenario.name} (${scenario.priority})`);
    console.log(`   ${scenario.description}`);
  });

  // Generate test files
  console.log('\nGenerating test files...');
  for (const scenario of scenarios) {
    const testFile = await runner.generateTestFile(scenario);
    console.log(`✓ Created: ${testFile}`);
  }

  // Configure Playwright
  console.log('\nConfiguring Playwright...');
  await runner.configure();

  // Start preview server
  console.log('Starting preview server...');
  await runner.startPreviewServer();

  // Run tests
  console.log('\nRunning E2E tests...');
  const results = await runner.runTests(scenarios);

  // Display results
  console.log('\n=== Test Results ===');
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Duration: ${results.duration}ms`);

  if (results.failed > 0) {
    console.log('\nFailed tests:');
    results.results
      .filter(r => !r.passed)
      .forEach(result => {
        console.log(`\n✗ ${result.scenario}`);
        console.log(`  Error: ${result.error}`);
        if (result.screenshots && result.screenshots.length > 0) {
          console.log(`  Screenshots: ${result.screenshots.join(', ')}`);
        }
        if (result.video) {
          console.log(`  Video: ${result.video}`);
        }
      });
  }

  // Generate HTML report
  if (results.reportPath) {
    console.log(`\nHTML Report: ${results.reportPath}`);
  }

  // Stop preview server
  await runner.stopPreviewServer();

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  runE2ETestsExample().catch(error => {
    console.error('Error running E2E tests:', error);
    process.exit(1);
  });
}

export { runE2ETestsExample };
