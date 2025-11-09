/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import crypto from 'crypto';

class VirtualCardService {
  constructor() {
    this.app = express();
    this.port = process.env.VIRTUAL_CARD_PORT || 3007;
    this.cards = new Map();
    this.transactions = new Map();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'Virtual Card Service', cards: this.cards.size });
    });

    this.app.post('/api/cards/issue', this.issueCard.bind(this));
    this.app.get('/api/cards/:cardId', this.getCard.bind(this));
    this.app.post('/api/cards/:cardId/freeze', this.freezeCard.bind(this));
    this.app.post('/api/cards/:cardId/unfreeze', this.unfreezeCard.bind(this));
    this.app.delete('/api/cards/:cardId', this.deleteCard.bind(this));
    this.app.post('/api/cards/:cardId/transaction', this.processTransaction.bind(this));
    this.app.get('/api/cards/:cardId/transactions', this.getTransactions.bind(this));
  }

  async issueCard(req, res) {
    try {
      const { userId, amount, currency = 'ZAR', type = 'virtual' } = req.body;
      
      if (!userId || !amount) {
        return res.status(400).json({ error: 'userId and amount required' });
      }

      const cardId = `CARD-${crypto.randomUUID()}`;
      const cardNumber = this.generateCardNumber();
      const expiry = this.generateExpiry();
      const cvv = this.generateCVV();

      const card = {
        cardId,
        userId,
        cardNumber,
        expiry,
        cvv,
        balance: amount,
        currency,
        type,
        status: 'active',
        createdAt: new Date(),
        limits: {
          daily: amount * 0.2,
          transaction: amount * 0.1
        }
      };

      this.cards.set(cardId, card);

      res.json({
        cardId,
        cardNumber: this.maskCardNumber(cardNumber),
        expiry,
        cvv,
        balance: amount,
        currency,
        status: 'active'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getCard(req, res) {
    const card = this.cards.get(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    
    res.json({
      ...card,
      cardNumber: this.maskCardNumber(card.cardNumber)
    });
  }

  freezeCard(req, res) {
    const card = this.cards.get(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    
    card.status = 'frozen';
    res.json({ cardId: card.cardId, status: 'frozen' });
  }

  unfreezeCard(req, res) {
    const card = this.cards.get(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    
    card.status = 'active';
    res.json({ cardId: card.cardId, status: 'active' });
  }

  deleteCard(req, res) {
    const card = this.cards.get(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    
    this.cards.delete(req.params.cardId);
    res.json({ message: 'Card deleted successfully' });
  }

  async processTransaction(req, res) {
    try {
      const { amount, merchant, description } = req.body;
      const card = this.cards.get(req.params.cardId);
      
      if (!card) return res.status(404).json({ error: 'Card not found' });
      if (card.status !== 'active') return res.status(403).json({ error: 'Card not active' });
      if (amount > card.balance) return res.status(400).json({ error: 'Insufficient balance' });
      if (amount > card.limits.transaction) return res.status(400).json({ error: 'Transaction limit exceeded' });

      const txId = `TX-${crypto.randomUUID()}`;
      const transaction = {
        txId,
        cardId: card.cardId,
        amount,
        merchant,
        description,
        timestamp: new Date(),
        status: 'completed'
      };

      card.balance -= amount;
      this.transactions.set(txId, transaction);

      res.json({ transaction, newBalance: card.balance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getTransactions(req, res) {
    const transactions = Array.from(this.transactions.values())
      .filter(tx => tx.cardId === req.params.cardId);
    res.json({ transactions });
  }

  generateCardNumber() {
    return `4${Math.floor(Math.random() * 1e15).toString().padStart(15, '0')}`;
  }

  generateExpiry() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  }

  generateCVV() {
    return Math.floor(Math.random() * 900 + 100).toString();
  }

  maskCardNumber(cardNumber) {
    return `****-****-****-${cardNumber.slice(-4)}`;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🎴 Virtual Card Service running on port ${this.port}`);
    });
  }
}

const service = new VirtualCardService();
if (import.meta.url === `file://${process.argv[1]}`) {
  service.start();
}

export default service;