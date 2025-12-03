require('dotenv').config();
const AzoraPayService = require('../services/azora-pay-service/index.js');

const USER_ADDRESS = process.env.CEO_ADDRESS;

async function autoWithdrawHalf() {
  try {
    const balanceResult = await AzoraPayService.getAZRBalance(USER_ADDRESS);
    if (balanceResult.error) {
      console.error('Error fetching balance:', balanceResult.error);
      return;
    }
    const fullAmount = balanceResult.balance;
    console.log(`Full AZR balance: ${fullAmount}`);
    const halfAmount = Math.floor(fullAmount / 2);

    if (halfAmount <= 0) {
      console.log('No funds to withdraw.');
      return;
    }

    // 1 AZR = 1 USD, convert to ZAR
    const usdToZar = 18.36;
    const zarAmount = halfAmount * usdToZar;
    console.log(`Withdrawing ${halfAmount} AZR (${zarAmount} ZAR) to Luno`);

    const withdrawResult = await AzoraPayService.withdrawToLuno(zarAmount);
    if (withdrawResult.success) {
      console.log('Withdraw to Luno result:', withdrawResult);
    } else {
      console.error('Withdrawal error:', withdrawResult.error);
    }
  } catch (err) {
    console.error('Script error:', err.message);
  }
}

autoWithdrawHalf();