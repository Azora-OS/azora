import AzoraPayService from '../azora-pay-service/index.js';
import AirtimeRewardsService from '../airtime-rewards-service/index.js';

class LendingService {
  constructor() {
    this.interestRate = 0.05; // 5%
    this.loanPeriod = 30; // days
    this.collateralRatio = 1.5; // 150%
    this.maxLoan = 100000; // Max 100,000 AZR
  }

  async approveLoan(userAddress, amount) {
    if (amount > this.maxLoan) return { error: 'Loan exceeds max 100,000 AZR' };

    const balance = await AzoraPayService.getAZRBalance(userAddress);
    const requiredCollateral = amount * this.collateralRatio;
    if (balance.balance < requiredCollateral) {
      return { error: `Insufficient collateral. Need ${requiredCollateral} AZR` };
    }

    const mintResult = await AzoraPayService.mintAZR(userAddress, amount);
    if (mintResult.error) return mintResult;

    const interest = amount * this.interestRate;
    const totalRepay = amount + interest;
    const dueDate = new Date(Date.now() + this.loanPeriod * 24 * 60 * 60 * 1000);

    return {
      loanAmount: amount,
      interest,
      totalRepay,
      dueDate,
      collateral: requiredCollateral,
      txHash: mintResult.txHash
    };
  }

  async repayLoan(userAddress, amount) {
    const loanDetails = await this.getLoanDetails(userAddress);
    if (!loanDetails) return { error: 'No active loan' };

    if (amount < loanDetails.totalRepay) return { error: 'Insufficient repayment' };

    // Burn interest to strengthen AZR
    const burnInterestResult = await AzoraPayService.burnAZR(userAddress, loanDetails.interest);
    if (burnInterestResult.error) return burnInterestResult;

    const repayResult = await AzoraPayService.burnAZR(userAddress, loanDetails.loanAmount);
    if (repayResult.error) return repayResult;

    // Reward student with airtime for repaying on time
    if (Date.now() < loanDetails.dueDate.getTime()) {
      await AirtimeRewardsService.rewardStudentAirtime(userAddress, 50); // 50 ZAR airtime
    }

    return { status: 'Loan repaid, interest burned to strengthen AZR, airtime rewarded', burnInterestResult, repayResult };
  }

  async getLoanDetails(userAddress) {
    // Placeholder: Fetch from contract
    const details = await AzoraPayService.callContract('getLoanDetails', [userAddress]);
    if (details.error) return null;
    return {
      loanAmount: details.amount,
      interest: details.interest,
      totalRepay: details.amount + details.interest,
      dueDate: new Date(details.dueDate * 1000),
      collateral: details.collateral,
      active: details.active
    };
  }

  async depositCollateral(userAddress, amount) {
    return await AzoraPayService.callContract('depositCollateral', [amount], userAddress);
  }

  async withdrawCollateral(userAddress, amount) {
    return await AzoraPayService.callContract('withdrawCollateral', [amount], userAddress);
  }

  async checkAndLiquidate(userAddress) {
    return await AzoraPayService.callContract('checkAndLiquidate', [userAddress]);
  }
}

export default new LendingService();