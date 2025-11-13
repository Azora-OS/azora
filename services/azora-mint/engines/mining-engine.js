const proofOfKnowledge = require('./proof-of-knowledge');
const tokenMinter = require('./token-minter');
const walletManager = require('./wallet-manager');

class MiningEngine {
  async mine(userId, activity) {
    const validation = proofOfKnowledge.validateProof(activity);
    
    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    const reward = proofOfKnowledge.calculateReward(validation.proof);
    const mintResult = tokenMinter.mint(userId, reward, validation.proof);

    if (!mintResult.success) {
      return mintResult;
    }

    walletManager.updateBalance(userId, 'AZR', reward);

    return {
      success: true,
      reward,
      proof: validation.proof,
      transaction: mintResult.transaction,
      newBalance: mintResult.newBalance
    };
  }

  getMiningStats(userId) {
    const wallet = walletManager.getWallet(userId);
    const recentTransactions = wallet.transactions.filter(t => t.currency === 'AZR').slice(-10);
    
    return {
      totalMined: wallet.balances.AZR,
      recentMining: recentTransactions,
      averageReward: recentTransactions.length > 0 
        ? recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length 
        : 0,
      miningRate: tokenMinter.mintingRate
    };
  }

  getGlobalMiningStats() {
    return {
      totalSupply: tokenMinter.totalSupply,
      maxSupply: tokenMinter.maxSupply,
      mintingRate: tokenMinter.mintingRate,
      inflation: tokenMinter.calculateInflation()
    };
  }
}

module.exports = new MiningEngine();
