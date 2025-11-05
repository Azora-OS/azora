const founderWithdrawalService = require('../services/founder-withdrawal/index');

const AZR_VALUE_USD = 1.02;
const USD_TO_ZAR = 18.36;

async function main() {
  const azrAmount = 10000;
  const zarAmount = azrAmount * AZR_VALUE_USD * USD_TO_ZAR;
  const bankDetails = {
    account: process.env.BANK_ACCOUNT,
    bankCode: process.env.BANK_CODE
  };
  const method = process.env.WITHDRAW_METHOD || 'paystack'; // 'stitch', 'flutterwave', or 'paystack'

  console.log(`Minting ${azrAmount} AZR (worth R${zarAmount.toLocaleString()})...`);

  try {
    const mintTx = await founderWithdrawalService.mintAsCEO(azrAmount);
    if (mintTx.status !== 'success') throw new Error(mintTx.error || 'Mint failed');
    console.log('Minted:', mintTx);

    const withdrawTx = await founderWithdrawalService.instantWithdrawToAccount(azrAmount, method, bankDetails);
    if (withdrawTx.status !== 'success') throw new Error(withdrawTx.error || 'Withdraw failed');
    console.log(`Withdrawn via ${method}:`, withdrawTx);

    const balance = await founderWithdrawalService.checkBalance();
    console.log('CEO AZR Balance:', balance.balance || balance);

  } catch (err) {
    console.error('[ERROR]', err.message);
  }
}

main();