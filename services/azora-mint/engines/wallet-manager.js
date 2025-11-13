class WalletManager {
  constructor() {
    this.wallets = new Map();
  }

  createWallet(userId) {
    const wallet = {
      id: `wallet_${Date.now()}`,
      userId,
      address: this.generateAddress(userId),
      balances: {
        AZR: 0,
        USD: 0,
        BTC: 0,
        ETH: 0
      },
      transactions: [],
      createdAt: new Date()
    };

    this.wallets.set(userId, wallet);
    return wallet;
  }

  generateAddress(userId) {
    return `azr_${Buffer.from(userId + Date.now().toString()).toString('hex').slice(0, 40)}`;
  }

  getWallet(userId) {
    return this.wallets.get(userId) || this.createWallet(userId);
  }

  updateBalance(userId, currency, amount) {
    const wallet = this.getWallet(userId);
    wallet.balances[currency] = (wallet.balances[currency] || 0) + amount;
    
    wallet.transactions.push({
      id: `tx_${Date.now()}`,
      type: amount > 0 ? 'credit' : 'debit',
      currency,
      amount: Math.abs(amount),
      timestamp: new Date()
    });

    return wallet;
  }

  transfer(fromUserId, toUserId, currency, amount) {
    const fromWallet = this.getWallet(fromUserId);
    
    if (fromWallet.balances[currency] < amount) {
      return { success: false, reason: 'Insufficient balance' };
    }

    this.updateBalance(fromUserId, currency, -amount);
    this.updateBalance(toUserId, currency, amount);

    return {
      success: true,
      from: fromUserId,
      to: toUserId,
      amount,
      currency
    };
  }

  getTransactionHistory(userId, limit = 50) {
    const wallet = this.getWallet(userId);
    return wallet.transactions.slice(-limit).reverse();
  }
}

module.exports = new WalletManager();
