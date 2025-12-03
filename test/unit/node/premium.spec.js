const assert = require('assert');
const path = require('path');

describe('AzStudio Premium Gate (compiled out)', function() {
  it('should return false by default', function() {
    // load compiled product code from out
    const prodRoot = path.resolve(__dirname, '../../../out');
    const premiumGate = require(prodRoot + '/vs/workbench/contrib/azstudio/browser/premiumGate.js');
    // Clear env
    const prev = process.env.AZSTUDIO_PREMIUM;
    delete process.env.AZSTUDIO_PREMIUM;
    return premiumGate.isPremiumEntitled().then(res => {
      assert.strictEqual(res, false);
      if (prev === undefined) delete process.env.AZSTUDIO_PREMIUM; else process.env.AZSTUDIO_PREMIUM = prev;
    });
  });
});
