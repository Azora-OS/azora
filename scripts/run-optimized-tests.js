#!/usr/bin/env node

/**
 * Run tests with optimizations enabled
 * 
 * This script runs Jest with all performance optimizations:
 * - Database transaction rollback
 * - Redis pipeline operations
 * - Mock response caching
 * - Test result caching
 */

const { execSync } = require('child_process');
const path = require('path');

// Set optimization environment variables
process.env.USE_TEST_OPTIMIZATIONS = 'true';
process.env.TEST_CACHE = 'true';
process.env.NODE_ENV = 'test';

// Parse command line arguments
const args = process.argv.slice(2);
const isCI = process.env.CI === 'true';
const isCoverage = args.includes('--coverage');
const isWatch = args.includes('--watch');
const isSelective = args.includes('--selective');

// Build Jest command
const jestArgs = [
  'jest',
  '--config', 'jest.config.cjs',
];

// Add coverage if requested
if (isCoverage) {
  jestArgs.push('--coverage');
}

// Add watch mode if requested
if (isWatch) {
  jestArgs.push('--watch');
}

// Add CI-specific options
if (isCI) {
  jestArgs.push('--ci');
  jestArgs.push('--maxWorkers=4');
  jestArgs.push('--bail=1');
}

// Add any additional arguments
const additionalArgs = args.filter(arg => 
  !['--coverage', '--watch', '--selective'].includes(arg)
);
jestArgs.push(...additionalArgs);

// Run selective tests if requested
if (isSelective) {
  console.log('🔍 Running selective test analysis...');
  try {
    const { selectTestsToRun, generateTestSelectionReport } = require('../tests/utils/selective-testing');
    const analysis = selectTestsToRun();
    
    console.log(generateTestSelectionReport(analysis));
    
    if (analysis.affectedTests.length === 0) {
      console.log('✅ No tests affected by changes');
      process.exit(0);
    }
    
    // Add affected tests to Jest args
    jestArgs.push('--testPathPattern', `(${analysis.affectedTests.join('|')})`);
  } catch (error) {
    console.error('❌ Selective testing failed:', error.message);
    console.log('Falling back to running all tests...');
  }
}

// Print optimization info
console.log('⚡ Running tests with optimizations enabled');
console.log('📊 Optimizations:');
console.log('  ✓ Database transaction rollback');
console.log('  ✓ Redis pipeline operations');
console.log('  ✓ Mock response caching');
console.log('  ✓ Test result caching');
console.log('');

// Run Jest
const command = jestArgs.join(' ');
console.log(`Running: ${command}\n`);

try {
  execSync(command, {
    stdio: 'inherit',
    env: process.env,
  });
  
  console.log('\n✅ Tests completed successfully');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Tests failed');
  process.exit(1);
}
