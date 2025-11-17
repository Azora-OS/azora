const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3011;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'azr-token' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// In-memory storage for token data (in production, use a database)
const tokenBalances = new Map();
const burnTransactions = [];
const users = new Map();

// Import the DeflationaryEngine from the existing file
const { DeflationaryEngine } = require('./deflationary-engine');

// Initialize the deflationary engine
const deflationaryEngine = new DeflationaryEngine();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'AZR Token Service',
    timestamp: new Date().toISOString(),
    totalSupply: deflationaryEngine.getTotalSupply()
  });
});

// Get token balance for a user
app.get('/balance/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only check their own balance
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this balance' });
    }

    const balance = tokenBalances.get(userId) || 0;

    res.json({
      success: true,
      data: {
        userId,
        balance,
        totalSupply: deflationaryEngine.getTotalSupply()
      }
    });
  } catch (error) {
    logger.error('Error fetching balance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Transfer tokens between users
app.post('/transfer', authenticateToken, async (req, res) => {
  try {
    const { toUserId, amount } = req.body;
    const fromUserId = req.user.userId;

    if (!toUserId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Recipient and positive amount required' });
    }

    // Check sender balance
    const senderBalance = tokenBalances.get(fromUserId) || 0;
    if (senderBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update balances
    const newSenderBalance = senderBalance - amount;
    const receiverBalance = tokenBalances.get(toUserId) || 0;
    const newReceiverBalance = receiverBalance + amount;

    tokenBalances.set(fromUserId, newSenderBalance);
    tokenBalances.set(toUserId, newReceiverBalance);

    logger.info(`Transfer completed: ${amount} AZR from ${fromUserId} to ${toUserId}`);

    res.status(200).json({
      success: true,
      data: {
        fromUserId,
        toUserId,
        amount,
        senderBalance: newSenderBalance,
        receiverBalance: newReceiverBalance
      }
    });
  } catch (error) {
    logger.error('Error transferring tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle token sale with burn mechanism
app.post('/sell', authenticateToken, async (req, res) => {
  try {
    const { azrAmount, randAmount } = req.body;
    const userId = req.user.userId;

    if (!azrAmount || !randAmount || azrAmount <= 0 || randAmount <= 0) {
      return res.status(400).json({ error: 'Valid AZR and Rand amounts required' });
    }

    // Check user balance
    const userBalance = tokenBalances.get(userId) || 0;
    if (userBalance < azrAmount) {
      return res.status(400).json({ error: 'Insufficient AZR balance' });
    }

    // Process the sale through the deflationary engine
    const burnTransaction = await deflationaryEngine.handleSale(userId, azrAmount, randAmount);

    // Update user balance
    const newUserBalance = userBalance - azrAmount;
    tokenBalances.set(userId, newUserBalance);

    // Record the burn transaction
    burnTransactions.push(burnTransaction);

    logger.info(`Token sale processed: ${azrAmount} AZR sold by ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        burnTransaction,
        userBalance: newUserBalance,
        psychologicalImpact: deflationaryEngine.calculatePsychologicalImpact(burnTransaction.amountBurned)
      }
    });
  } catch (error) {
    logger.error('Error processing token sale:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute a forced buy order
app.post('/buy', authenticateToken, async (req, res) => {
  try {
    const { randAmount } = req.body;

    if (!randAmount || randAmount <= 0) {
      return res.status(400).json({ error: 'Valid Rand amount required' });
    }

    // Execute the forced buy order
    const azrAmount = await deflationaryEngine.forcedBuyOrder(randAmount);

    // Credit tokens to user's account
    const userId = req.user.userId;
    const currentBalance = tokenBalances.get(userId) || 0;
    const newBalance = currentBalance + azrAmount;
    tokenBalances.set(userId, newBalance);

    logger.info(`Forced buy order executed: ${azrAmount} AZR purchased by ${userId} for ${randAmount} Rands`);

    res.status(200).json({
      success: true,
      data: {
        userId,
        azrAmount,
        randAmount,
        newBalance
      }
    });
  } catch (error) {
    logger.error('Error executing buy order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get burn transaction history
app.get('/burns', authenticateToken, isAdmin, (req, res) => {
  try {
    res.json({
      success: true,
      data: burnTransactions,
      totalSupply: deflationaryEngine.getTotalSupply()
    });
  } catch (error) {
    logger.error('Error fetching burn transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// User registration
app.post('/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    for (const user of users.values()) {
      if (user.email === email || user.username === username) {
        return res.status(409).json({ error: 'User already exists' });
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = uuidv4();
    const newUser = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      role: 'user', // 'user' or 'admin'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.set(userId, newUser);

    // Initialize token balance
    tokenBalances.set(userId, 0);

    logger.info(`User registered: ${username} (${email})`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      token
    });
  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
});

// User login
app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    let user = null;
    for (const u of users.values()) {
      if (u.email === email) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
      token
    });
  } catch (error) {
    logger.error('Error logging in:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`AZR Token Service listening on port ${PORT}`);

  // Add some sample data for testing
  const sampleUsers = [
    {
      id: 'user-1',
      username: 'alice',
      email: 'alice@example.com',
      password: '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', // 'password123'
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'user-2',
      username: 'bob',
      email: 'bob@example.com',
      password: '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', // 'password123'
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  sampleUsers.forEach(user => {
    users.set(user.id, user);
    tokenBalances.set(user.id, 1000); // Give each user 1000 AZR tokens
  });

  logger.info(`Added ${sampleUsers.length} sample users with initial token balances`);
});

module.exports = app;
