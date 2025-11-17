const { execSync } = require('child_process');

try {
  const result = execSync('npx jest services/ai-routing/__tests__/query-classifier.test.ts --no-coverage --detectOpenHandles', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  process.exit(0);
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}
