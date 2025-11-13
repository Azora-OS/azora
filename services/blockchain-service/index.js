#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

class BlockchainService {
  constructor() {
    this.contracts = new Map();
    this.transactions = [];
    this.nfts = new Map();
    this.defi = new Map();
    this.initBlockchain();
  }

  initBlockchain() {
    this.contracts.set('azr-token', {
      id: 'azr-token',
      name: 'AZR Token Contract',
      address: '0x' + Math.random().toString(16).substr(2, 40),
      totalSupply: 21000000,
      deployed: true
    });

    this.contracts.set('certificate-nft', {
      id: 'certificate-nft',
      name: 'Certificate NFT Contract',
      address: '0x' + Math.random().toString(16).substr(2, 40),
      totalMinted: 450,
      deployed: true
    });
  }

  deployContract(contractData) {
    const contract = {
      id: `contract_${Date.now()}`,
      ...contractData,
      address: '0x' + Math.random().toString(16).substr(2, 40),
      deployedAt: new Date(),
      deployed: true
    };
    this.contracts.set(contract.id, contract);
    return contract;
  }

  mintNFT(recipient, metadata) {
    const nft = {
      id: `nft_${Date.now()}`,
      tokenId: this.nfts.size + 1,
      recipient,
      metadata,
      mintedAt: new Date(),
      txHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
    this.nfts.set(nft.id, nft);
    return nft;
  }

  createStakingPool(tokenAddress, rewardRate) {
    const pool = {
      id: `pool_${Date.now()}`,
      tokenAddress,
      rewardRate,
      totalStaked: 0,
      participants: 0,
      createdAt: new Date()
    };
    this.defi.set(pool.id, pool);
    return pool;
  }

  processTransaction(from, to, amount, type = 'transfer') {
    const tx = {
      id: `tx_${Date.now()}`,
      hash: '0x' + Math.random().toString(16).substr(2, 64),
      from,
      to,
      amount,
      type,
      status: 'confirmed',
      timestamp: new Date(),
      gasUsed: Math.floor(Math.random() * 50000) + 21000
    };
    this.transactions.push(tx);
    return tx;
  }
}

const blockchain = new BlockchainService();

app.get('/api/contracts', (req, res) => {
  res.json({ success: true, data: Array.from(blockchain.contracts.values()) });
});

app.post('/api/contracts/deploy', (req, res) => {
  try {
    const contract = blockchain.deployContract(req.body);
    res.json({ success: true, data: contract });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/nft/mint', (req, res) => {
  try {
    const { recipient, metadata } = req.body;
    const nft = blockchain.mintNFT(recipient, metadata);
    res.json({ success: true, data: nft });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/defi/stake', (req, res) => {
  try {
    const { tokenAddress, rewardRate } = req.body;
    const pool = blockchain.createStakingPool(tokenAddress, rewardRate);
    res.json({ success: true, data: pool });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/transactions', (req, res) => {
  try {
    const { from, to, amount, type } = req.body;
    const tx = blockchain.processTransaction(from, to, amount, type);
    res.json({ success: true, data: tx });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/transactions', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const txs = blockchain.transactions.slice(-limit);
  res.json({ success: true, data: txs });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'Blockchain Service',
    status: 'healthy',
    timestamp: new Date(),
    stats: { contracts: blockchain.contracts.size, transactions: blockchain.transactions.length },
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 4027;
app.listen(PORT, () => {
  console.log(`⛓️ Blockchain Service running on port ${PORT}`);
});

module.exports = app;