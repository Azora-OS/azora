const crypto = require('crypto');

class TokenMinter {
  constructor(economicPolicy) {
    this.policy = economicPolicy;
    this.wallets = new Map();
    this.transactions = [];
    this.blocks = [];
  }

  createWallet(userId) {
    const address = crypto.randomBytes(20).toString('hex');
    const wallet = {
      userId,
      address,
      balance: 0,
      staked: 0,
      earned: 0,
      created: Date.now()
    };
    this.wallets.set(address, wallet);
    return wallet;
  }

  getWallet(address) {
    return this.wallets.get(address);
  }

  mintReward(address, amount, reason) {
    const result = this.policy.mintTokens(amount, reason);
    if (!result.success) return result;

    const wallet = this.wallets.get(address);
    if (!wallet) return { success: false, message: 'Wallet not found' };

    wallet.balance += amount;
    wallet.earned += amount;

    this.transactions.push({
      id: crypto.randomBytes(16).toString('hex'),
      type: 'mint',
      to: address,
      amount,
      reason,
      timestamp: Date.now()
    });

    return { success: true, balance: wallet.balance, minted: amount };
  }

  transfer(fromAddress, toAddress, amount) {
    const from = this.wallets.get(fromAddress);
    const to = this.wallets.get(toAddress);

    if (!from || !to) return { success: false, message: 'Wallet not found' };

    const validation = this.policy.validateTransaction(amount, from.balance);
    if (!validation.valid) return validation;

    from.balance -= amount;
    to.balance += amount;

    this.transactions.push({
      id: crypto.randomBytes(16).toString('hex'),
      type: 'transfer',
      from: fromAddress,
      to: toAddress,
      amount,
      timestamp: Date.now()
    });

    return { success: true, from: from.balance, to: to.balance };
  }

  stake(address, amount) {
    const wallet = this.wallets.get(address);
    if (!wallet) return { success: false, message: 'Wallet not found' };

    const validation = this.policy.validateTransaction(amount, wallet.balance);
    if (!validation.valid) return validation;

    wallet.balance -= amount;
    wallet.staked += amount;

    return { success: true, staked: wallet.staked, balance: wallet.balance };
  }

  unstake(address, amount) {
    const wallet = this.wallets.get(address);
    if (!wallet || amount > wallet.staked) {
      return { success: false, message: 'Invalid unstake' };
    }

    wallet.staked -= amount;
    wallet.balance += amount;

    return { success: true, staked: wallet.staked, balance: wallet.balance };
  }

  getBalance(address) {
    const wallet = this.wallets.get(address);
    return wallet ? { balance: wallet.balance, staked: wallet.staked, earned: wallet.earned } : null;
  }
}

module.exports = TokenMinter;
