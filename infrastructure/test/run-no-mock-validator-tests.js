const assert = require('assert');
const path = require('path');
const fs = require('fs');
const NoMockValidator = require('../no-mock-validator.js');

async function run() {
  const fixturesDir = path.resolve(__dirname, 'fixtures');

  // 1) Default behavior: test files ignored
  const validator1 = new NoMockValidator({ basePattern: path.join(fixturesDir, '**/*.{js,ts,jsx,tsx}'), shouldExit: false });
  const result1 = await validator1.validate();
  console.log('Result1:', result1);
  assert.strictEqual(result1.success, false, 'Expected a violation (production file has a mock)');
  // expected single violation: prod-file.js (exception file should be ignored by inline comment)
  assert.strictEqual(result1.violations.length, 1, 'Expected 1 violation when tests are ignored');

  // 2) With ALLOW_MOCKS_IN_TESTS enabled: test mocks should be flagged
  process.env.ALLOW_MOCKS_IN_TESTS = '1';
  const validator2 = new NoMockValidator({ basePattern: path.join(fixturesDir, '**/*.{js,ts,jsx,tsx}'), shouldExit: false });
  const result2 = await validator2.validate();
  console.log('Result2:', result2);
  // Now both production and test-file.test.js should be flagged (prod-file + test-file)
  assert.strictEqual(result2.success, false, 'Expected violations when scanning tests too');
  assert.strictEqual(result2.violations.length >= 2, true, 'Expected at least 2 violations when tests scanned');

  // 3) With ALLOW_MOCKS_IN_TESTS and allowlist removing prod-file -> should still flag the test-file
  const allowlistPath = path.resolve(__dirname, '..', 'no-mock-allowlist.json');
  const allowlistBackup = fs.existsSync(allowlistPath) ? fs.readFileSync(allowlistPath, 'utf8') : null;
  try {
    // Temporarily add fixture to allowlist
    const allowlist = ['**/infrastructure/test/fixtures/prod-file.js'];
    fs.writeFileSync(allowlistPath, JSON.stringify(allowlist, null, 2));
    const validator3 = new NoMockValidator({ basePattern: path.join(fixturesDir, '**/*.{js,ts,jsx,tsx}'), shouldExit: false });
    const result3 = await validator3.validate();
    console.log('Result3:', result3);
    assert.strictEqual(result3.success, false, 'Expected violations still (test-file still flagged)');
    // Should have >=1 violation: test-file
    assert.strictEqual(result3.violations.length >= 1, true, 'Expected at least 1 violation after allowlist');
  } finally {
    if (allowlistBackup) fs.writeFileSync(allowlistPath, allowlistBackup);
    else fs.unlinkSync(allowlistPath);
  }

  console.log('\n✅ All no-mock-validator tests passed');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
