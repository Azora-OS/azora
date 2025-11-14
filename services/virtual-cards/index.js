const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3039;

app.use(cors());
app.use(express.json());

// In-memory card storage (use database in production)
const cards = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'virtual-cards' });
});

// Issue virtual card
app.post('/api/cards/issue', (req, res) => {
  try {
    const { userId, cardType = 'virtual', currency = 'USD', limit } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId required' });
    }
    
    const card = {
      id: crypto.randomUUID(),
      userId,
      cardNumber: generateCardNumber(),
      cvv: generateCVV(),
      expiryMonth: 12,
      expiryYear: new Date().getFullYear() + 3,
      cardType,
      currency,
      limit: limit || 1000,
      balance: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    cards.set(card.id, card);
    
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get card
app.get('/api/cards/:cardId', (req, res) => {
  const card = cards.get(req.params.cardId);
  
  if (!card) {
    return res.status(404).json({ success: false, error: 'Card not found' });
  }
  
  res.json({ success: true, data: card });
});

// Freeze/unfreeze card
app.post('/api/cards/:cardId/freeze', (req, res) => {
  const card = cards.get(req.params.cardId);
  
  if (!card) {
    return res.status(404).json({ success: false, error: 'Card not found' });
  }
  
  card.status = card.status === 'active' ? 'frozen' : 'active';
  cards.set(card.id, card);
  
  res.json({ success: true, data: card });
});

// Process transaction
app.post('/api/cards/:cardId/transaction', (req, res) => {
  try {
    const card = cards.get(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    
    if (card.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Card is not active' });
    }
    
    const { amount, merchant, description } = req.body;
    
    if (card.balance + amount > card.limit) {
      return res.status(400).json({ success: false, error: 'Transaction exceeds limit' });
    }
    
    const transaction = {
      id: crypto.randomUUID(),
      cardId: card.id,
      amount,
      merchant,
      description,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    
    card.balance += amount;
    cards.set(card.id, card);
    
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user cards
app.get('/api/users/:userId/cards', (req, res) => {
  const userCards = Array.from(cards.values())
    .filter(card => card.userId === req.params.userId);
  
  res.json({ success: true, data: userCards });
});

function generateCardNumber() {
  // Generate mock card number (4xxx xxxx xxxx xxxx)
  return '4' + Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
}

function generateCVV() {
  return Math.floor(100 + Math.random() * 900).toString();
}

app.listen(PORT, () => {
  console.log(`💳 Virtual Cards running on port ${PORT}`);
});

module.exports = app;
