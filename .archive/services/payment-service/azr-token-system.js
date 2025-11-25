const crypto = require('crypto');

class AZRTokenSystem {
  constructor() {
    this.wallets = new Map();
    this.transactions = new Map();
    this.exchangeRates = {
      'USD': 0.10, // 1 AZR = $0.10
      'ZAR': 1.80, // 1 AZR = R1.80
      'EUR': 0.09, // 1 AZR = €0.09
      'GBP': 0.08  // 1 AZR = £0.08
    };
    this.totalSupply = 0;
    this.maxSupply = 1000000000; // 1 billion AZR
  }

  // Create wallet
  createWallet(userId) {
    if (this.wallets.has(userId)) {
      return this.wallets.get(userId);
    }

    const wallet = {
      userId,
      address: this.generateAddress(),
      balance: 0,
      stakedBalance: 0,
      earnedTotal: 0,
      spentTotal: 0,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.wallets.set(userId, wallet);
    return wallet;
  }

  // Generate unique wallet address
  generateAddress() {
    return 'azr_' + crypto.randomBytes(16).toString('hex');
  }

  // Get wallet
  getWallet(userId) {
    return this.wallets.get(userId);
  }

  // Get balance
  getBalance(userId) {
    const wallet = this.wallets.get(userId);
    if (!wallet) return null;

    return {
      available: wallet.balance,
      staked: wallet.stakedBalance,
      total: wallet.balance + wallet.stakedBalance,
      earned: wallet.earnedTotal,
      spent: wallet.spentTotal
    };
  }

  // Mint tokens (for rewards, learning achievements)
  mintTokens(userId, amount, reason = 'reward') {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    if (this.totalSupply + amount > this.maxSupply) {
      return { success: false, error: 'Would exceed maximum supply' };
    }

    let wallet = this.wallets.get(userId);
    if (!wallet) {
      wallet = this.createWallet(userId);
    }

    const transactionId = this.generateTransactionId();
    const transaction = {
      id: transactionId,
      type: 'mint',
      userId,
      amount,
      reason,
      timestamp: new Date(),
      status: 'completed'
    };

    wallet.balance += amount;
    wallet.earnedTotal += amount;
    wallet.lastActivity = new Date();
    this.totalSupply += amount;

    this.transactions.set(transactionId, transaction);

    return {
      success: true,
      transactionId,
      newBalance: wallet.balance,
      amount,
      reason
    };
  }

  // Transfer tokens
  transferTokens(fromUserId, toUserId, amount, description = '') {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    const fromWallet = this.wallets.get(fromUserId);
    if (!fromWallet) {
      return { success: false, error: 'Sender wallet not found' };
    }

    if (fromWallet.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    let toWallet = this.wallets.get(toUserId);
    if (!toWallet) {
      toWallet = this.createWallet(toUserId);
    }

    const transactionId = this.generateTransactionId();
    const transaction = {
      id: transactionId,
      type: 'transfer',
      fromUserId,
      toUserId,
      amount,
      description,
      timestamp: new Date(),
      status: 'completed'
    };

    fromWallet.balance -= amount;
    fromWallet.spentTotal += amount;
    fromWallet.lastActivity = new Date();

    toWallet.balance += amount;
    toWallet.earnedTotal += amount;
    toWallet.lastActivity = new Date();

    this.transactions.set(transactionId, transaction);

    return {
      success: true,
      transactionId,
      fromBalance: fromWallet.balance,
      toBalance: toWallet.balance,
      amount
    };
  }

  // Spend tokens (for course enrollment, purchases)
  spendTokens(userId, amount, purpose = 'purchase') {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    const wallet = this.wallets.get(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    if (wallet.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    const transactionId = this.generateTransactionId();
    const transaction = {
      id: transactionId,
      type: 'spend',
      userId,
      amount,
      purpose,
      timestamp: new Date(),
      status: 'completed'
    };

    wallet.balance -= amount;
    wallet.spentTotal += amount;
    wallet.lastActivity = new Date();

    this.transactions.set(transactionId, transaction);

    return {
      success: true,
      transactionId,
      newBalance: wallet.balance,
      amount,
      purpose
    };
  }

  // Stake tokens
  stakeTokens(userId, amount) {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    const wallet = this.wallets.get(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    if (wallet.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    const transactionId = this.generateTransactionId();
    const transaction = {
      id: transactionId,
      type: 'stake',
      userId,
      amount,
      timestamp: new Date(),
      status: 'completed'
    };

    wallet.balance -= amount;
    wallet.stakedBalance += amount;
    wallet.lastActivity = new Date();

    this.transactions.set(transactionId, transaction);

    return {
      success: true,
      transactionId,
      availableBalance: wallet.balance,
      stakedBalance: wallet.stakedBalance,
      amount
    };
  }

  // Unstake tokens
  unstakeTokens(userId, amount) {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    const wallet = this.wallets.get(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    if (wallet.stakedBalance < amount) {
      return { success: false, error: 'Insufficient staked balance' };
    }

    const transactionId = this.generateTransactionId();
    const transaction = {
      id: transactionId,
      type: 'unstake',
      userId,
      amount,
      timestamp: new Date(),
      status: 'completed'
    };

    wallet.stakedBalance -= amount;
    wallet.balance += amount;
    wallet.lastActivity = new Date();

    this.transactions.set(transactionId, transaction);

    return {
      success: true,
      transactionId,
      availableBalance: wallet.balance,
      stakedBalance: wallet.stakedBalance,
      amount
    };
  }

  // Calculate staking rewards
  calculateStakingReward(userId, days = 30) {
    const wallet = this.wallets.get(userId);
    if (!wallet || wallet.stakedBalance <= 0) {
      return { success: false, error: 'No staked balance found' };
    }

    // 5% annual return, calculated daily
    const annualRate = 0.05;
    const dailyRate = annualRate / 365;
    const reward = wallet.stakedBalance * dailyRate * days;

    return {
      success: true,
      stakedAmount: wallet.stakedBalance,
      days,
      annualRate: annualRate * 100,
      reward: Math.round(reward * 100) / 100
    };
  }

  // Convert AZR to fiat currency
  convertToFiat(azrAmount, currency = 'USD') {
    const rate = this.exchangeRates[currency.toUpperCase()];
    if (!rate) {
      return { success: false, error: 'Unsupported currency' };
    }

    const fiatAmount = azrAmount * rate;
    return {
      success: true,
      azrAmount,
      fiatAmount: Math.round(fiatAmount * 100) / 100,
      currency: currency.toUpperCase(),
      exchangeRate: rate
    };
  }

  // Convert fiat to AZR
  convertFromFiat(fiatAmount, currency = 'USD') {
    const rate = this.exchangeRates[currency.toUpperCase()];
    if (!rate) {
      return { success: false, error: 'Unsupported currency' };
    }

    const azrAmount = fiatAmount / rate;
    return {
      success: true,
      fiatAmount,
      azrAmount: Math.round(azrAmount * 100) / 100,
      currency: currency.toUpperCase(),
      exchangeRate: rate
    };
  }

  // Purchase AZR with fiat
  purchaseAZR(userId, fiatAmount, currency = 'USD', paymentMethod = 'stripe') {
    const conversion = this.convertFromFiat(fiatAmount, currency);
    if (!conversion.success) {
      return conversion;
    }

    const mintResult = this.mintTokens(userId, conversion.azrAmount, 'purchase');
    if (!mintResult.success) {
      return mintResult;
    }

    const transactionId = this.generateTransactionId();
    const transaction = {
      id: transactionId,
      type: 'purchase',
      userId,
      fiatAmount,
      currency,
      azrAmount: conversion.azrAmount,
      exchangeRate: conversion.exchangeRate,
      paymentMethod,
      timestamp: new Date(),
      status: 'completed'
    };

    this.transactions.set(transactionId, transaction);

    return {
      success: true,
      transactionId,
      purchased: conversion.azrAmount,
      cost: fiatAmount,
      currency,
      newBalance: this.getBalance(userId).total
    };
  }

  // Get transaction history
  getTransactionHistory(userId, limit = 50) {
    const userTransactions = Array.from(this.transactions.values())
      .filter(t => t.userId === userId || t.fromUserId === userId || t.toUserId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return {
      success: true,
      transactions: userTransactions,
      count: userTransactions.length
    };
  }

  // Get system statistics
  getSystemStats() {
    return {
      totalSupply: this.totalSupply,
      maxSupply: this.maxSupply,
      circulatingSupply: this.totalSupply,
      totalWallets: this.wallets.size,
      totalTransactions: this.transactions.size,
      exchangeRates: this.exchangeRates,
      supplyPercentage: (this.totalSupply / this.maxSupply) * 100
    };
  }

  // Generate transaction ID
  generateTransactionId() {
    return 'azr_' + crypto.randomBytes(8).toString('hex') + '_' + Date.now();
  }

  // Learning rewards system
  rewardLearning(userId, activityType, points = 0) {
    const rewardRates = {
      'course_completion': 100,
      'quiz_passed': 25,
      'assignment_submitted': 50,
      'discussion_participation': 10,
      'peer_help': 15,
      'daily_login': 5,
      'streak_bonus': 20
    };

    const baseReward = rewardRates[activityType] || points;
    if (baseReward <= 0) {
      return { success: false, error: 'Invalid activity type or points' };
    }

    return this.mintTokens(userId, baseReward, `learning_reward_${activityType}`);
  }

  // Bulk operations for admin
  bulkMint(operations) {
    const results = [];
    for (const op of operations) {
      const result = this.mintTokens(op.userId, op.amount, op.reason);
      results.push({ ...op, result });
    }
    return results;
  }

  // Emergency functions
  freezeWallet(userId, reason = 'security') {
    const wallet = this.wallets.get(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    wallet.frozen = true;
    wallet.freezeReason = reason;
    wallet.frozenAt = new Date();

    return { success: true, message: 'Wallet frozen', reason };
  }

  unfreezeWallet(userId) {
    const wallet = this.wallets.get(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    wallet.frozen = false;
    delete wallet.freezeReason;
    delete wallet.frozenAt;

    return { success: true, message: 'Wallet unfrozen' };
  }
}

module.exports = AZRTokenSystem;