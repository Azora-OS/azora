/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import crypto from 'crypto';

class LendingService {
  constructor() {
    this.app = express();
    this.port = process.env.LENDING_PORT || 3010;
    this.loans = new Map();
    this.collateral = new Map();
    this.config = {
      interestRate: 0.05, // 5% annual
      collateralRatio: 1.5, // 150%
      maxLoan: 100000, // Max 100,000 AZR
      minLoan: 100, // Min 100 AZR
      loanPeriod: 30 // days
    };
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'Lending Service', activeLoans: this.loans.size });
    });

    this.app.post('/api/loans/apply', this.applyForLoan.bind(this));
    this.app.get('/api/loans/:userId', this.getLoan.bind(this));
    this.app.post('/api/loans/:loanId/repay', this.repayLoan.bind(this));
    this.app.post('/api/collateral/deposit', this.depositCollateral.bind(this));
    this.app.post('/api/collateral/withdraw', this.withdrawCollateral.bind(this));
    this.app.get('/api/collateral/:userId', this.getCollateral.bind(this));
    this.app.get('/api/loans/:loanId/status', this.getLoanStatus.bind(this));
  }

  async applyForLoan(req, res) {
    try {
      const { userId, amount, purpose } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({ error: 'userId and amount required' });
      }

      if (amount < this.config.minLoan || amount > this.config.maxLoan) {
        return res.status(400).json({ error: `Loan amount must be between ${this.config.minLoan} and ${this.config.maxLoan} AZR` });
      }

      // Check collateral
      const userCollateral = this.collateral.get(userId) || 0;
      const requiredCollateral = amount * this.config.collateralRatio;

      if (userCollateral < requiredCollateral) {
        return res.status(400).json({
          error: 'Insufficient collateral',
          required: requiredCollateral,
          available: userCollateral
        });
      }

      // Check existing loans
      const existingLoan = Array.from(this.loans.values())
        .find(loan => loan.userId === userId && loan.status === 'active');

      if (existingLoan) {
        return res.status(400).json({ error: 'User already has an active loan' });
      }

      const loanId = `LOAN-${crypto.randomUUID()}`;
      const interest = amount * this.config.interestRate * (this.config.loanPeriod / 365);
      const totalRepay = amount + interest;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + this.config.loanPeriod);

      const loan = {
        loanId,
        userId,
        amount,
        interest,
        totalRepay,
        purpose,
        collateral: requiredCollateral,
        status: 'active',
        disbursedAt: new Date(),
        dueDate,
        repaidAmount: 0
      };

      this.loans.set(loanId, loan);

      res.json({
        loan,
        message: 'Loan approved and disbursed'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getLoan(req, res) {
    const userLoans = Array.from(this.loans.values())
      .filter(loan => loan.userId === req.params.userId);
    res.json({ loans: userLoans });
  }

  async repayLoan(req, res) {
    try {
      const { amount } = req.body;
      const loan = this.loans.get(req.params.loanId);

      if (!loan) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      if (loan.status !== 'active') {
        return res.status(400).json({ error: 'Loan is not active' });
      }

      loan.repaidAmount += amount;
      const remaining = loan.totalRepay - loan.repaidAmount;

      if (remaining <= 0) {
        loan.status = 'repaid';
        loan.repaidAt = new Date();
        
        // Release collateral
        const userCollateral = this.collateral.get(loan.userId) || 0;
        this.collateral.set(loan.userId, userCollateral - loan.collateral);

        // Early repayment bonus
        const isEarly = new Date() < loan.dueDate;
        const bonus = isEarly ? loan.amount * 0.01 : 0; // 1% bonus

        res.json({
          message: 'Loan fully repaid',
          loan,
          collateralReleased: loan.collateral,
          earlyRepaymentBonus: bonus
        });
      } else {
        res.json({
          message: 'Partial repayment recorded',
          loan,
          remaining
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async depositCollateral(req, res) {
    try {
      const { userId, amount } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({ error: 'userId and amount required' });
      }

      const current = this.collateral.get(userId) || 0;
      this.collateral.set(userId, current + amount);

      res.json({
        message: 'Collateral deposited',
        userId,
        deposited: amount,
        total: current + amount
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async withdrawCollateral(req, res) {
    try {
      const { userId, amount } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({ error: 'userId and amount required' });
      }

      const current = this.collateral.get(userId) || 0;

      // Check if user has active loans
      const activeLoans = Array.from(this.loans.values())
        .filter(loan => loan.userId === userId && loan.status === 'active');

      const requiredCollateral = activeLoans.reduce((sum, loan) => sum + loan.collateral, 0);
      const available = current - requiredCollateral;

      if (amount > available) {
        return res.status(400).json({
          error: 'Insufficient available collateral',
          available,
          requested: amount
        });
      }

      this.collateral.set(userId, current - amount);

      res.json({
        message: 'Collateral withdrawn',
        userId,
        withdrawn: amount,
        remaining: current - amount
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getCollateral(req, res) {
    const amount = this.collateral.get(req.params.userId) || 0;
    const activeLoans = Array.from(this.loans.values())
      .filter(loan => loan.userId === req.params.userId && loan.status === 'active');
    const locked = activeLoans.reduce((sum, loan) => sum + loan.collateral, 0);

    res.json({
      userId: req.params.userId,
      total: amount,
      locked,
      available: amount - locked
    });
  }

  getLoanStatus(req, res) {
    const loan = this.loans.get(req.params.loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const daysRemaining = Math.ceil((loan.dueDate - new Date()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysRemaining < 0;

    res.json({
      loan,
      daysRemaining: Math.max(0, daysRemaining),
      isOverdue,
      healthScore: this.calculateLoanHealth(loan)
    });
  }

  calculateLoanHealth(loan) {
    const repaymentProgress = loan.repaidAmount / loan.totalRepay;
    const timeProgress = (new Date() - loan.disbursedAt) / (loan.dueDate - loan.disbursedAt);
    const health = repaymentProgress / timeProgress;
    return Math.min(100, Math.max(0, health * 100));
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🏦 Lending Service running on port ${this.port}`);
    });
  }
}

const service = new LendingService();
if (import.meta.url === `file://${process.argv[1]}`) {
  service.start();
}

export default service;