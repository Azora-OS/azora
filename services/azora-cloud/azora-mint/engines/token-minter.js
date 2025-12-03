class TokenMinter {
  constructor() {
    this.totalSupply = 0;
    this.maxSupply = 1000000000;
    this.mintingRate = 1.0;
    this.transactions = [];
    this.halvingInterval = 210000;
    this.blocksMinted = 0;
  }

  mint(userId, amount, proof) {
    if (this.totalSupply + amount > this.maxSupply) {
      return { 
        success: false, 
        reason: 'Max supply reached',
        currentSupply: this.totalSupply,
        maxSupply: this.maxSupply
      };
    }

    const adjustedAmount = amount * this.mintingRate;
    this.totalSupply += adjustedAmount;
    this.blocksMinted++;

    if (this.blocksMinted % this.halvingInterval === 0) {
      this.mintingRate *= 0.5;
    }

    const transaction = {
      txId: this.generateTxId(),
      userId,
      amount: adjustedAmount,
      proof: proof.activityType,
      proofHash: this.hashProof(proof),
      timestamp: new Date(),
      blockNumber: this.blocksMinted
    };

    this.transactions.push(transaction);

    return {
      success: true,
      transaction,
      newBalance: adjustedAmount,
      totalSupply: this.totalSupply
    };
  }

  calculateInflation() {
    const recentBlocks = Math.min(this.blocksMinted, 10000);
    if (recentBlocks === 0) return 0;

    const recentMinting = this.transactions
      .slice(-recentBlocks)
      .reduce((sum, tx) => sum + tx.amount, 0);

    return (recentMinting / this.totalSupply) * 100;
  }

  generateTxId() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  hashProof(proof) {
    const crypto = require('crypto');
    return crypto.createHash('sha256')
      .update(JSON.stringify(proof))
      .digest('hex');
  }

  getSupplyInfo() {
    return {
      totalSupply: this.totalSupply,
      maxSupply: this.maxSupply,
      remainingSupply: this.maxSupply - this.totalSupply,
      percentageMinted: (this.totalSupply / this.maxSupply) * 100,
      currentMintingRate: this.mintingRate,
      blocksMinted: this.blocksMinted,
      nextHalving: this.halvingInterval - (this.blocksMinted % this.halvingInterval)
    };
  }
}

module.exports = new TokenMinter();
