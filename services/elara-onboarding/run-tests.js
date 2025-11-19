#!/usr/bin/env node

/**
 * Simple test runner to bypass Jest git issues
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  // Run jest with specific configuration
  const cmd = `npx jest --config=${path.join(__dirname, 'jest.config.js')} --testPathPattern=__tests__ --no-coverage --forceExit`;
  
  console.log('Running tests...');
  console.log(`Command: ${cmd}\n`);
  
  execSync(cmd, {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });
  
  process.exit(0);
} catch (error) {
  console.error('Test execution failed');
  process.exit(1);
}
