const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class DeFiLendingService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3056;
    this.loans = new Map();
    this.deposits = new Map();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'defi-lending', loans: this.loans.size });
    });

    this.app.post('/api/deposit', this.deposit.bind(this));
    this.app.post('/api/loans/request', this.requestLoan.bind(this));
    this.app.post('/api/loans/:loanId/repay', this.repayLoan.bind(this));
    this.app.get('/api/balance/:userId', this.getBalance.bind(this));
    this.app.get('/api/loans/:userId', this.getUserLoans.bind(this));
  }

  deposit(req, res) {
    const { userId, amount } = req.body;
    this.deposits.set(userId, (this.deposits.get(userId) || 0) + amount);
    res.json({ success: true, balance: this.deposits.get(userId) });
  }

  requestLoan(req, res) {
    const { studentId, amount, collateral, interestRate, term } = req.body;
    
    if (collateral < amount * 1.5) {
      return res.status(400).json({ error: 'Insufficient collateral' });
    }

    const loanId = `LOAN-${Date.now()}`;
    const loan = {
      id: loanId,
      studentId,
      amount,
      collateral,
      interestRate: interestRate || 0.05,
      term,
      startDate: new Date(),
      status: 'active',
      remaining: amount
    };

    this.loans.set(loanId, loan);
    this.deposits.set(studentId, (this.deposits.get(studentId) || 0) + amount);
    
    res.status(201).json({ success: true, loan });
  }

  repayLoan(req, res) {
    const { loanId } = req.params;
    const { amount } = req.body;
    const loan = this.loans.get(loanId);

    if (!loan || loan.status !== 'active') {
      return res.status(404).json({ error: 'Loan not found or not active' });
    }

    loan.remaining -= amount;
    if (loan.remaining <= 0) {
      loan.status = 'repaid';
      loan.repaidDate = new Date();
    }

    res.json({ success: true, loan });
  }

  getBalance(req, res) {
    const balance = this.deposits.get(req.params.userId) || 0;
    res.json({ userId: req.params.userId, balance });
  }

  getUserLoans(req, res) {
    const userLoans = Array.from(this.loans.values())
      .filter(loan => loan.studentId === req.params.userId);
    res.json({ loans: userLoans, count: userLoans.length });
  }

  listen() {
    this.app.listen(this.port, () => console.log(`DeFi Lending on port ${this.port}`));
  }
}

const service = new DeFiLendingService();
if (require.main === module) service.listen();
module.exports = service.app;
