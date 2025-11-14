const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { PrismaClient } = require('@prisma/client');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const promClient = require('prom-client');

const prisma = new PrismaClient();
const app = express();

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const authAttemptsTotal = new promClient.Counter({
  name: 'auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['method', 'success']
});

const userRegistrations = new promClient.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations'
});

const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of currently active users'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(authAttemptsTotal);
register.registerMetric(userRegistrations);
register.registerMetric(activeUsers);

// Encryption utilities
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const ALGORITHM = 'aes-256-gcm';

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

const decrypt = (encryptedData, iv, authTag) => {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Auth-specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .inc();
  });
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'azora-secret-key-2025';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'azora-refresh-secret-2025';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// OAuth2 Configurations
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Apple OAuth Configuration
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
const APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET;
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY;

const googleOAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${process.env.BASE_URL || 'http://localhost:3001'}/auth/google/callback`
);

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Audit logging middleware
const auditLog = (action, userId, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId: userId || 'anonymous',
    ipAddress: details.ipAddress,
    userAgent: details.userAgent,
    details: JSON.stringify(details.data || {}),
    service: 'auth-service'
  };

  // In production, send to logging service
  console.log('[AUDIT]', JSON.stringify(logEntry));
};

// Audit middleware for sensitive operations
const auditMiddleware = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || req.decoded?.userId;
        auditLog(action, userId, {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          data: {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode
          }
        });
      }
      originalSend.call(this, data);
    };
    next();
  };
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const generateMFABackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }
  return codes;
};

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth-service' });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Validation middleware
const validateRegistration = (req, res, next) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  next();
};

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Register with email verification
app.post('/register', authLimiter, validateRegistration, auditMiddleware('user.register'), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerificationToken,
        emailVerificationExpires,
      }
    });

    // Track user registration
    userRegistrations.inc();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}`;
    await sendEmail(
      email,
      'Verify Your Azora Account',
      `
        <h1>Welcome to Azora OS!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    );

    res.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: { id: user.id, email: user.email, name: user.name, isEmailVerified: false }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login with enhanced security
app.post('/login', authLimiter, validateLogin, auditMiddleware('user.login'), async (req, res) => {
  try {
    const { email, password, mfaToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { sessions: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return res.status(423).json({
        error: 'Account is temporarily locked due to too many failed attempts'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Track failed auth attempt
      authAttemptsTotal.labels('password', 'false').inc();

      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      const updateData = { loginAttempts: newAttempts };

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        updateData.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        updateData.loginAttempts = 0;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Track successful auth attempt
    authAttemptsTotal.labels('password', 'true').inc();

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    // Check MFA if enabled
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(403).json({
          error: 'MFA token required',
          requiresMFA: true
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaToken,
        window: 2 // Allow 2 time steps (30 seconds) tolerance
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid MFA token' });
      }
    }

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockoutUntil: null,
        lastLoginAt: new Date()
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // Create session
    const sessionToken = uuidv4();
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        mfaEnabled: user.mfaEnabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth endpoints
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const authorizationUrl = googleOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
  });

  res.json({ authorizationUrl });
});

app.post('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for tokens
    const { tokens } = await googleOAuth2Client.getToken(code);
    googleOAuth2Client.setCredentials(tokens);

    // Get user info from Google
    const userInfoResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const googleUser = userInfoResponse.data;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          avatar: googleUser.picture,
        }
      });
    } else {
      // Update Google ID if not set
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.id, avatar: googleUser.picture }
        });
      }
    }

    // Generate JWT token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Create session
    const sessionToken = uuidv4();
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      sessionToken,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// GitHub OAuth endpoints
app.get('/auth/github', (req, res) => {
  const scopes = ['user:email', 'read:user'];

  const authorizationUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${scopes.join('%20')}&response_type=code`;

  res.json({ authorizationUrl });
});

app.post('/auth/github/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': 'Azora-OS',
      },
    });

    const githubUser = userResponse.data;

    // Get user email
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': 'Azora-OS',
      },
    });

    const primaryEmail = emailResponse.data.find(email => email.primary)?.email || githubUser.email;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: primaryEmail }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: primaryEmail,
          name: githubUser.name || githubUser.login,
          githubId: githubUser.id.toString(),
          avatar: githubUser.avatar_url,
        }
      });
    } else {
      // Update GitHub ID if not set
      if (!user.githubId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { githubId: githubUser.id.toString(), avatar: githubUser.avatar_url }
        });
      }
    }

    // Generate JWT token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Create session
    const sessionToken = uuidv4();
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      sessionToken,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar }
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'GitHub authentication failed' });
  }
});

// Apple OAuth endpoints
app.get('/auth/apple', (req, res) => {
  // Apple Sign-In requires a more complex flow with JWT client secret
  // This is a simplified implementation - in production, you'd generate a proper JWT

  if (!APPLE_CLIENT_ID) {
    return res.status(400).json({ error: 'Apple OAuth not configured' });
  }

  const scopes = ['name', 'email'];

  const authorizationUrl = `https://appleid.apple.com/auth/authorize?client_id=${APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${process.env.BASE_URL || 'http://localhost:3001'}/auth/apple/callback`)}&response_type=code&scope=${scopes.join('%20')}&response_mode=form_post`;

  res.json({ authorizationUrl });
});

app.post('/auth/apple/callback', async (req, res) => {
  try {
    const { code, user: appleUserData } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://appleid.apple.com/auth/token',
      {
        client_id: APPLE_CLIENT_ID,
        client_secret: APPLE_CLIENT_SECRET, // In production, this should be a JWT
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.BASE_URL || 'http://localhost:3001'}/auth/apple/callback`,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, id_token } = tokenResponse.data;

    if (!id_token) {
      return res.status(400).json({ error: 'Failed to get ID token' });
    }

    // Decode ID token to get user info (simplified - in production use proper JWT verification)
    const decodedToken = jwt.decode(id_token);

    let userEmail = decodedToken.email;
    let userName = 'Apple User';

    // Parse additional user data if provided
    if (appleUserData) {
      try {
        const userInfo = JSON.parse(appleUserData);
        if (userInfo.name) {
          userName = `${userInfo.name.firstName} ${userInfo.name.lastName}`.trim();
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userName,
          appleId: decodedToken.sub,
        }
      });
    } else {
      // Update Apple ID if not set
      if (!user.appleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { appleId: decodedToken.sub }
        });
      }
    }

    // Generate JWT token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Create session
    const sessionToken = uuidv4();
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      sessionToken,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Apple OAuth error:', error);
    res.status(500).json({ error: 'Apple authentication failed' });
  }
});

// Verify token (updated for new token structure)
app.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if it's an access token
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
        mfaEnabled: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get profile
app.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
        mfaEnabled: true,
        lastLoginAt: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Email verification
app.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Resend verification email
app.post('/resend-verification', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires
      }
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}`;
    await sendEmail(
      email,
      'Verify Your Azora Account',
      `
        <h1>Azora OS Email Verification</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    );

    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Request password reset
app.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Reset Your Azora Password',
      `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    );

    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password
app.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Refresh access token
app.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(storedToken.user);

    res.json({
      success: true,
      accessToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
app.post('/logout', async (req, res) => {
  try {
    const { refreshToken, sessionToken } = req.body;

    // Revoke refresh token
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() }
      });
    }

    // Delete session
    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { token: sessionToken }
      });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// MFA Setup
app.post('/mfa/setup', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate MFA secret
    const secret = speakeasy.generateSecret({
      name: `Azora OS (${user.email})`,
      issuer: 'Azora OS'
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = generateMFABackupCodes();

    // Store temporary secret (will be confirmed later)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaSecret: secret.base32,
        mfaBackupCodes: JSON.stringify(backupCodes)
      }
    });

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({ error: 'MFA setup failed' });
  }
});

// MFA Verify Setup
app.post('/mfa/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { mfaToken } = req.body;

    if (!token || !mfaToken) {
      return res.status(400).json({ error: 'Access token and MFA token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.mfaSecret) {
      return res.status(400).json({ error: 'MFA setup not initiated' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: mfaToken,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid MFA token' });
    }

    // Enable MFA
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true }
    });

    res.json({
      success: true,
      message: 'MFA enabled successfully',
      backupCodes: JSON.parse(user.mfaBackupCodes || '[]')
    });
  } catch (error) {
    console.error('MFA verify error:', error);
    res.status(500).json({ error: 'MFA verification failed' });
  }
});

// MFA Disable
app.post('/mfa/disable', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Access token and password required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: JSON.stringify([])
      }
    });

    res.json({ success: true, message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({ error: 'MFA disable failed' });
  }
});

// Get user sessions
app.get('/sessions', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const sessions = await prisma.session.findMany({
      where: {
        userId: decoded.userId,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Revoke session
app.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { sessionId } = req.params;

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    await prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId: decoded.userId
      }
    });

    res.json({ success: true, message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ error: 'Failed to revoke session' });
  }
});

// RBAC: Get user permissions
app.get('/permissions', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get role permissions (simplified - in production, you'd have a proper RBAC system)
    const permissions = getRolePermissions(user.role);

    res.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to get permissions' });
  }
});

// Helper function for role permissions
const getRolePermissions = (role) => {
  const rolePermissions = {
    'admin': [
      'user:create', 'user:read', 'user:update', 'user:delete',
      'payment:create', 'payment:read', 'payment:update', 'payment:delete',
      'course:create', 'course:read', 'course:update', 'course:delete',
      'system:admin'
    ],
    'instructor': [
      'course:create', 'course:read', 'course:update',
      'user:read', 'payment:read'
    ],
    'student': [
      'course:read', 'user:read', 'payment:create'
    ],
    'user': [
      'user:read', 'user:update'
    ]
  };

  return rolePermissions[role] || rolePermissions['user'];
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Load additional routes
const additionalRoutes = require('./routes');
app.use(additionalRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Azora Auth Service running on port ${PORT}`);
  console.log(`📧 Register: POST http://localhost:${PORT}/register`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/login`);
  console.log(`🔍 Verify: GET http://localhost:${PORT}/verify`);
  console.log(`👤 Profile: GET http://localhost:${PORT}/profile`);
  console.log(`🌐 Google OAuth: GET http://localhost:${PORT}/auth/google`);
  console.log(`🐙 GitHub OAuth: GET http://localhost:${PORT}/auth/github`);

  try {
    await prisma.$connect();
    console.log('🗄️  Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});
