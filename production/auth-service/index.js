const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getPrismaClient } = require('../shared/database');
const logger = require('../shared/logger');
const { AppError, errorHandler, asyncHandler } = require('../shared/errorHandler');

const app = express();
const prisma = getPrismaClient();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

const JWT_SECRET = process.env.JWT_SECRET || 'azora-jwt-secret-2024-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register
app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { email, password, name, role = 'STUDENT' } = req.body;

  if (!email || !password || !name) {
    throw new AppError('Email, password, and name are required', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  logger.info(`User registered: ${email}`);

  res.status(201).json({
    success: true,
    data: {
      accessToken: token,
      user,
    },
  });
}));

// Login
app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    data: {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
  });
}));

// Auth middleware
const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new AppError('No token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
});

// Get profile
app.get('/api/auth/profile', authMiddleware, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      profile: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ success: true, data: user });
}));

// Update profile
app.patch('/api/auth/profile', authMiddleware, asyncHandler(async (req, res) => {
  const { name, bio, avatar, location, timezone } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      ...(name && { name }),
      profile: {
        upsert: {
          create: { bio, avatar, location, timezone },
          update: { bio, avatar, location, timezone },
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      profile: true,
    },
  });

  logger.info(`Profile updated: ${req.user.email}`);

  res.json({ success: true, data: updated });
}));

// Logout (client-side token invalidation)
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  logger.info(`User logged out: ${req.user.email}`);
  res.json({ success: true, message: 'Logged out successfully' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

// Export for testing
module.exports = { app, authMiddleware };

// Start server if not in test mode
if (require.main === module) {
  const PORT = process.env.AUTH_PORT || 4001;
  app.listen(PORT, () => {
    logger.info(`✅ Auth service running on port ${PORT}`);
  });
}
