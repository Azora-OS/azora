import dotenv from 'dotenv';
dotenv.config();

import AzoraPayService from '../services/azora-pay-service/index.js';
import LendingService from '../services/lending-service/index.js';
import VirtualCardService from '../services/virtual-card-service/index.js';
import DecentralizedBanking from '../services/decentralized-banking/index.js';
import EmailService from '../services/email-service/index.js';
import ComplianceService from '../services/compliance-service/index.js';
import AirtimeRewardsService from '../services/airtime-rewards-service/index.js';

class AzoraOS {
  constructor() {
    this.payService = AzoraPayService;
    this.lending = LendingService;
    this.cards = VirtualCardService;
    this.banking = DecentralizedBanking;
    this.email = EmailService;
    this.compliance = ComplianceService;
    this.airtime = AirtimeRewardsService;
  }

  async fullFlow(userAddress, phoneNumber) {
    // 1. Check compliance
    const kyc = await this.compliance.checkKYC({ name: 'User', idNumber: '1234567890123' });
    if (!kyc.approved) return { error: 'KYC failed' };

    // 2. Approve loan (100k AZR)
    const loan = await this.lending.approveLoan(userAddress, 100000);
    if (loan.error) return loan;

    // 3. Issue virtual card
    const card = await this.cards.issueCard(userAddress, 1000);
    if (card.error) return card;

    // 4. Deposit to decentralized banking
    const deposit = await this.banking.depositToPool(process.env.AZR_CONTRACT_ADDRESS, 50000);
    if (deposit.error) return deposit;

    // 5. Buy airtime with AZR
    const airtime = await this.airtime.buyAirtimeWithAZR(userAddress, phoneNumber, 100);
    if (airtime.error) return airtime;

    // 6. Send email notification
    await this.email.sendEmail(userAddress, 'Azora Loan Approved', `Loan: ${loan.loanAmount} AZR, Card: ${card.cardId}`);

    return {
      kyc,
      loan,
      card,
      deposit,
      airtime,
      status: 'Full integration successful'
    };
  }
}

export default new AzoraOS();

// Test
const azora = new AzoraOS();
azora.fullFlow('0xUserAddress', '27XXXXXXXXX').then(console.log);
