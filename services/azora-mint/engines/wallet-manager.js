class WalletManager {
  constructor() {
    this.wallets = new Map();
  }

  createWallet(userId) {
    if (this.wallets.has(userId)) {
      return { success: false, reason: 'Wallet already exists' };
    }

    const wallet = {
      userId,
      balances: { AZR: 0, BTC: 0, ETH: 0, USD: 0 },
      transactions: [],
      createdAt: new Date(),
      address: this.generateAddress(userId)
    };

    this.wallets.set(userId, wallet);
    return { success: true, wallet };
  }

  getWallet(userId) {
    let wallet = this.wallets.get(userId);
    if (!wallet) {
      const result = this.createWallet(userId);
      wallet = result.wallet;
    }
    return wallet;
  }

  updateBalance(userId, currency, amount) {
    const wallet = this.getWallet(userId);
    
    if (!wallet.balances.hasOwnProperty(currency)) {
      wallet.balances[currency] = 0;
    }

    wallet.balances[currency] += amount;

    const transaction = {
      txId: this.generateTxId(),
      currency,
      amount,
      type: amount > 0 ? 'credit' : 'debit',
      balance: wallet.balances[currency],
      timestamp: new Date()
    };

    wallet.transactions.push(transaction);
    return { success: true, transaction, newBalance: wallet.balances[currency] };
  }

  transfer(fromUserId, toUserId, currency, amount) {
    const fromWallet = this.getWallet(fromUserId);
    
    if (!fromWallet.balances[currency] || fromWallet.balances[currency] < amount) {
      return { success: false, reason: 'Insufficient balance' };
    }

    this.updateBalance(fromUserId, currency, -amount);
    this.updateBalance(toUserId, currency, amount);

    return {
      success: true,
      from: fromUserId,
      to: toUserId,
      amount,
      currency,
      timestamp: new Date()
    };
  }

  getBalance(userId, currency = null) {
    const wallet = this.getWallet(userId);
    return currency ? wallet.balances[currency] : wallet.balances;
  }

  getTransactionHistory(userId, limit = 50) {
    const wallet = this.getWallet(userId);
    return wallet.transactions.slice(-limit).reverse();
  }

  generateAddress(userId) {
    const crypto = require('crypto');
    return 'AZR' + crypto.createHash('sha256')
      .update(userId + Date.now().toString())
      .digest('hex')
      .substring(0, 40);
  }

  generateTxId() {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  }
}

module.exports = new WalletManager();
