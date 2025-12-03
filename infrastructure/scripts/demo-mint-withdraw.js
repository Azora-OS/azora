const azoraCoinService = require('../services/azora-coin-service/index');
const founderWithdrawalService = require('../services/founder-withdrawal/index');

// Mint 1,000,000 AZR for CEO
azoraCoinService.mint('ceo', 1000000);

// Withdraw 1,000,000 AZR to ZAR
try {
  const result = founderWithdrawalService.withdraw('ceo', 1000000);
  console.log('[RESULT]', result);
} catch (err) {
  console.error('[ERROR]', err.message);
}
