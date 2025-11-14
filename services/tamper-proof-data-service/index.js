const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const crypto = require('crypto');

class TamperProofDataService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3049;
    this.data = new Map();
    this.chain = [];
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'tamper-proof-data', records: this.data.size, chainLength: this.chain.length });
    });

    this.app.post('/api/data/store', this.store.bind(this));
    this.app.get('/api/data/:id', this.retrieve.bind(this));
    this.app.post('/api/data/:id/verify', this.verify.bind(this));
    this.app.get('/api/chain', this.getChain.bind(this));
  }

  store(req, res) {
    const { data, metadata } = req.body;
    const id = `data_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    const hash = this.calculateHash(data);
    const previousHash = this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : '0';
    
    const record = {
      id,
      data,
      metadata,
      hash,
      previousHash,
      timestamp: new Date(),
      blockNumber: this.chain.length
    };

    const blockHash = this.calculateHash(record);
    const block = { ...record, hash: blockHash };
    
    this.data.set(id, block);
    this.chain.push(block);
    
    res.status(201).json({ success: true, id, hash: blockHash, blockNumber: block.blockNumber });
  }

  retrieve(req, res) {
    const record = this.data.get(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ record });
  }

  verify(req, res) {
    const record = this.data.get(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    const calculatedHash = this.calculateHash(record.data);
    const isValid = calculatedHash === record.hash;
    const chainValid = this.verifyChain(record.blockNumber);

    res.json({ 
      id: req.params.id,
      valid: isValid && chainValid,
      dataIntegrity: isValid,
      chainIntegrity: chainValid,
      hash: record.hash,
      calculatedHash
    });
  }

  getChain(req, res) {
    res.json({ chain: this.chain.slice(-10), length: this.chain.length });
  }

  calculateHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  verifyChain(blockNumber) {
    if (blockNumber === 0) return true;
    
    const block = this.chain[blockNumber];
    const previousBlock = this.chain[blockNumber - 1];
    
    return block.previousHash === previousBlock.hash;
  }

  start() {
    this.app.listen(this.port, () => console.log(`Tamper Proof Data Service on port ${this.port}`));
  }
}

const service = new TamperProofDataService();
if (require.main === module) service.start();
module.exports = service;
