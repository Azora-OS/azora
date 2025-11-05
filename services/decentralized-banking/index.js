require('dotenv').config();
const AzoraPayService = require('./services/azora-pay-service/index.js');
const LendingService = require('./services/lending-service/index.js');
const VirtualCardService = require('./services/virtual-card-service/index.js');
const DecentralizedBanking = require('./services/decentralized-banking/index.js');
const EmailService = require('./services/email-service/index.js');
const ComplianceService = require('./services/compliance-service/index.js');
const ethers = require('ethers');

class AzoraOS {
  constructor() {
    this.payService = AzoraPayService;
    this.lending = LendingService;
    this.cards = VirtualCardService;
    this.banking = DecentralizedBanking;
    this.email = EmailService;
    this.compliance = ComplianceService;
  }

  async mintAndLend(userAddress, amount) {
    // Check compliance
    const kyc = await this.compliance.checkKYC({ name: 'User', idNumber: '123' });
    if (!kyc.approved) return { error: 'KYC failed' };

    // Mint loan
    const loan = await this.lending.approveLoan(userAddress, amount);
    if (loan.error) return loan;

    // Deposit to Aave pool
    const deposit = await this.banking.depositToPool(process.env.AZR_CONTRACT_ADDRESS, amount);
    if (deposit.error) return deposit;

    // Send email
    await this.email.sendEmail(userAddress, 'Loan Approved', `You received ${amount} AZR`);

    return { status: 'Loan approved and deposited', loan, deposit };
  }

  async withdrawAndCard(userAddress, amount) {
    // Borrow from pool
    const borrow = await this.banking.borrowFromPool(process.env.AZR_CONTRACT_ADDRESS, amount);
    if (borrow.error) return borrow;

    // Issue virtual card
    const card = await this.cards.issueCard(userAddress, amount);
    if (card.error) return card;

    // Withdraw to Luno
    const withdraw = await this.payService.withdrawToLuno(amount * 18.36); // Convert to ZAR
    if (withdraw.error) return withdraw;

    return { status: 'Borrowed, card issued, withdrawn', borrow, card, withdraw };
  }
}

module.exports = new AzoraOS();

// Example usage
const azora = require('./app.js');
azora.mintAndLend('0xUserAddress', 1000).then(console.log);
azora.withdrawAndCard('0xUserAddress', 500).then(console.log);