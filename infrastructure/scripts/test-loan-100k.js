import LendingService from '../services/lending-service/index.js';
import AzoraPayService from '../services/azora-pay-service/index.js';

const userAddress = '0xYourTestAddress'; // Replace with test address

async function testLoan100k() {
  try {
    console.log('Depositing collateral...');
    const depositResult = await LendingService.depositCollateral(userAddress, 150000); // 150% for 100k
    console.log('Deposit result:', depositResult);

    console.log('Approving loan...');
    const loanResult = await LendingService.approveLoan(userAddress, 100000);
    console.log('Loan result:', loanResult);

    console.log('Repaying loan...');
    const repayResult = await LendingService.repayLoan(userAddress, 105000); // 100k + 5k interest
    console.log('Repay result:', repayResult);

    console.log('Test completed!');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testLoan100k();