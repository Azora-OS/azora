class EconomicPolicyEngine {
  constructor() {
    this.maxSupply = 21000000;
    this.currentSupply = 0;
    this.blockReward = 50;
    this.halvingInterval = 210000;
    this.inflationRate = 0.02;
    this.ubiRate = 0.01;
    this.stakingAPY = 0.08;
  }

  calculateBlockReward(blockHeight) {
    const halvings = Math.floor(blockHeight / this.halvingInterval);
    return this.blockReward / Math.pow(2, halvings);
  }

  mintTokens(amount, reason) {
    if (this.currentSupply + amount > this.maxSupply) {
      return { success: false, message: 'Max supply reached' };
    }
    this.currentSupply += amount;
    return { success: true, minted: amount, supply: this.currentSupply, reason };
  }

  calculateUBI(userCount, period = 'monthly') {
    const totalUBI = this.currentSupply * this.ubiRate;
    const perUser = totalUBI / userCount;
    return { totalUBI, perUser, period };
  }

  calculateStakingReward(stakedAmount, days) {
    const dailyRate = this.stakingAPY / 365;
    const reward = stakedAmount * dailyRate * days;
    return Math.floor(reward);
  }

  adjustInflation(marketConditions) {
    if (marketConditions.demand > marketConditions.supply) {
      this.inflationRate = Math.min(this.inflationRate * 1.1, 0.05);
    } else {
      this.inflationRate = Math.max(this.inflationRate * 0.9, 0.01);
    }
    return this.inflationRate;
  }

  getEconomicStats() {
    return {
      currentSupply: this.currentSupply,
      maxSupply: this.maxSupply,
      circulationRate: (this.currentSupply / this.maxSupply) * 100,
      blockReward: this.blockReward,
      inflationRate: this.inflationRate,
      ubiRate: this.ubiRate,
      stakingAPY: this.stakingAPY
    };
  }

  validateTransaction(amount, balance) {
    if (amount <= 0) return { valid: false, message: 'Invalid amount' };
    if (amount > balance) return { valid: false, message: 'Insufficient balance' };
    return { valid: true };
  }
}

module.exports = EconomicPolicyEngine;
