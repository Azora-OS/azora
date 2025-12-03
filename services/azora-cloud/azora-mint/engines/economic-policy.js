class EconomicPolicy {
  constructor() {
    this.ubiRate = 10;
    this.ubiInterval = 86400000;
    this.lastUBIDistribution = Date.now();
  }

  calculateUBI(userActivity) {
    const baseUBI = this.ubiRate;
    const activityMultiplier = Math.min(2.0, 1 + (userActivity.score / 100));
    return Math.floor(baseUBI * activityMultiplier);
  }

  shouldDistributeUBI() {
    return Date.now() - this.lastUBIDistribution >= this.ubiInterval;
  }

  distributeUBI(users) {
    if (!this.shouldDistributeUBI()) {
      return { distributed: false, reason: 'Too soon' };
    }

    const distributions = users.map(user => ({
      userId: user.id,
      amount: this.calculateUBI(user.activity),
      timestamp: new Date()
    }));

    this.lastUBIDistribution = Date.now();

    return {
      distributed: true,
      count: distributions.length,
      totalAmount: distributions.reduce((sum, d) => sum + d.amount, 0),
      distributions
    };
  }

  monitorEconomy(metrics) {
    const { totalSupply, circulatingSupply, velocity, activeUsers } = metrics;
    
    const health = {
      supplyRatio: circulatingSupply / totalSupply,
      velocityScore: velocity > 1.5 ? 'high' : velocity > 0.8 ? 'healthy' : 'low',
      userEngagement: activeUsers / 1000,
      recommendation: 'maintain'
    };

    if (health.supplyRatio > 0.9) {
      health.recommendation = 'increase_supply';
    } else if (health.velocityScore === 'low') {
      health.recommendation = 'increase_incentives';
    }

    return health;
  }

  adjustPolicy(economicHealth) {
    if (economicHealth.recommendation === 'increase_supply') {
      this.ubiRate = Math.min(20, this.ubiRate * 1.1);
    } else if (economicHealth.recommendation === 'increase_incentives') {
      this.ubiRate = Math.min(15, this.ubiRate * 1.05);
    }

    return {
      newUBIRate: this.ubiRate,
      reason: economicHealth.recommendation
    };
  }
}

module.exports = new EconomicPolicy();
