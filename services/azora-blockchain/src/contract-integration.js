const { ethers } = require('ethers');
require('dotenv').config();

// Ubuntu Blockchain Integration - Connect Smart Contracts to Services
class UbuntuContractIntegration {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', this.provider);
    
    // Contract Addresses (from deployment)
    this.contracts = {
      AZRToken: process.env.AZR_TOKEN_ADDRESS || '0x...',
      UbuntuGovernance: process.env.GOVERNANCE_ADDRESS || '0x...',
      Staking: process.env.STAKING_ADDRESS || '0x...',
      NFTCertificate: process.env.NFT_ADDRESS || '0x...'
    };

    // Contract ABIs (simplified for integration)
    this.abis = {
      AZRToken: [
        'function balanceOf(address owner) view returns (uint256)',
        'function transfer(address to, uint256 amount) returns (bool)',
        'function mint(address to, uint256 amount)',
        'function burn(uint256 amount)',
        'function knowledgeScore(address user) view returns (uint256)',
        'function ubuntuMining(address miner, uint256 amount, string knowledgeProof)',
        'function ubuntuContribution(address contributor, uint256 amount, string action)'
      ],
      UbuntuGovernance: [
        'function createProposal(string title, string description, uint256 votingPeriod)',
        'function vote(uint256 proposalId, bool support)',
        'function executeProposal(uint256 proposalId)',
        'function getProposal(uint256 proposalId) view returns (tuple)'
      ],
      Staking: [
        'function stake(uint256 amount, uint256 duration)',
        'function unstake(uint256 stakeId)',
        'function getStake(address user, uint256 stakeId) view returns (tuple)',
        'function calculateRewards(uint256 amount, uint256 duration) view returns (uint256)'
      ]
    };

    // Initialize contract instances
    this.initializeContracts();
  }

  initializeContracts() {
    try {
      this.AZRToken = new ethers.Contract(
        this.contracts.AZRToken,
        this.abis.AZRToken,
        this.wallet
      );

      this.Governance = new ethers.Contract(
        this.contracts.UbuntuGovernance,
        this.abis.UbuntuGovernance,
        this.wallet
      );

      this.Staking = new ethers.Contract(
        this.contracts.Staking,
        this.abis.Staking,
        this.wallet
      );

      console.log('🔗 Ubuntu Smart Contracts connected');
      console.log('🌍 Blockchain integration ready for Ubuntu economics');
    } catch (error) {
      console.error('❌ Contract initialization failed:', error.message);
    }
  }

  // Mint AZR tokens for Proof-of-Knowledge mining
  async mintKnowledgeTokens(userAddress, knowledgeProof, contributionAmount) {
    try {
      const baseAmount = ethers.parseEther('10'); // 10 AZR base reward
      const ubuntuBonus = contributionAmount > 5 ? baseAmount * BigInt(150) / BigInt(100) : baseAmount; // 1.5x bonus
      
      const tx = await this.AZRToken.ubuntuMining(userAddress, ubuntuBonus, knowledgeProof);
      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        amount: ethers.formatEther(ubuntuBonus),
        knowledgeProof,
        ubuntu: 'Ubuntu knowledge rewarded - I learn because we grow'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        ubuntu: 'Ubuntu handles challenges with collective wisdom'
      };
    }
  }

  // Get user's token balance
  async getTokenBalance(userAddress) {
    try {
      const balance = await this.AZRToken.balanceOf(userAddress);
      const knowledgeScore = await this.AZRToken.knowledgeScore(userAddress);

      return {
        balance: ethers.formatEther(balance),
        knowledgeScore: knowledgeScore.toString(),
        ubuntu: 'Ubuntu prosperity measured in collective knowledge'
      };
    } catch (error) {
      return {
        balance: '0',
        knowledgeScore: '0',
        error: error.message
      };
    }
  }

  // Transfer tokens with Ubuntu purpose
  async transferTokens(fromAddress, toAddress, amount, purpose) {
    try {
      const transferAmount = ethers.parseEther(amount.toString());
      const tx = await this.AZRToken.transfer(toAddress, transferAmount);
      await tx.wait();

      // Log Ubuntu contribution
      await this.AZRToken.ubuntuContribution(fromAddress, transferAmount, purpose || 'Ubuntu sharing');

      return {
        success: true,
        transactionHash: tx.hash,
        amount,
        purpose,
        ubuntu: 'Ubuntu sharing strengthens our collective'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        ubuntu: 'Ubuntu transfers require collective harmony'
      };
    }
  }

  // Create governance proposal
  async createProposal(title, description, votingPeriod = 7) {
    try {
      const votingPeriodSeconds = votingPeriod * 24 * 60 * 60; // Convert days to seconds
      const tx = await this.Governance.createProposal(title, description, votingPeriodSeconds);
      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        proposalId: await this.getLatestProposalId(),
        ubuntu: 'Ubuntu governance - we decide together'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        ubuntu: 'Ubuntu proposals require collective wisdom'
      };
    }
  }

  // Vote on proposal
  async voteOnProposal(proposalId, support, voterAddress) {
    try {
      const tx = await this.Governance.vote(proposalId, support);
      await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        proposalId,
        support,
        ubuntu: 'Ubuntu voting - every voice matters'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        ubuntu: 'Ubuntu voting requires honest participation'
      };
    }
  }

  // Stake tokens for Ubuntu rewards
  async stakeTokens(userAddress, amount, duration) {
    try {
      const stakeAmount = ethers.parseEther(amount.toString());
      const durationSeconds = duration * 24 * 60 * 60; // Convert days to seconds
      
      const tx = await this.Staking.stake(stakeAmount, durationSeconds);
      await tx.wait();

      const rewards = await this.Staking.calculateRewards(stakeAmount, durationSeconds);

      return {
        success: true,
        transactionHash: tx.hash,
        amount,
        duration,
        expectedRewards: ethers.formatEther(rewards),
        ubuntu: 'Ubuntu staking - commitment to collective growth'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        ubuntu: 'Ubuntu staking strengthens our foundation'
      };
    }
  }

  // Get Ubuntu network statistics
  async getNetworkStats() {
    try {
      // Get total supply (if available)
      const totalSupply = await this.AZRToken.totalSupply ? 
        await this.AZRToken.totalSupply() : 
        ethers.parseEther('100000000'); // 100M default

      return {
        totalSupply: ethers.formatEther(totalSupply),
        activeContracts: Object.keys(this.contracts),
        networkStatus: 'active',
        ubuntu: 'Ubuntu network thriving through collective participation'
      };
    } catch (error) {
      return {
        totalSupply: '100000000',
        activeContracts: Object.keys(this.contracts),
        networkStatus: 'active',
        error: error.message
      };
    }
  }

  // Helper to get latest proposal ID
  async getLatestProposalId() {
    try {
      // This would typically query events or use a counter
      return Math.floor(Math.random() * 1000); // Placeholder
    } catch (error) {
      return 1;
    }
  }

  // Health check for contract integration
  async healthCheck() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      const network = await this.provider.getNetwork();

      return {
        status: 'healthy',
        walletBalance: ethers.formatEther(balance),
        network: {
          name: network.name,
          chainId: network.chainId.toString()
        },
        contractsConnected: Object.keys(this.contracts).length,
        ubuntu: 'Ubuntu blockchain integration operational'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        ubuntu: 'Ubuntu blockchain facing temporary challenges'
      };
    }
  }
}

module.exports = UbuntuContractIntegration;
