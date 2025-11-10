/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/* global require, process, console */
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * @file Advanced Authentication Service
 * @description Multi-tenant authentication with OAuth2, SAML, MFA, biometric auth, and enterprise security features
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const redis = require('redis');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const OAuth2Strategy = require('passport-oauth2').Strategy;
const SamlStrategy = require('passport-saml').Strategy;
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3002;

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'auth' },
  transports: [
    new winston.transports.File({ filename: 'logs/auth.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Redis client for sessions and caching
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// In-memory user store (in production, use database)
const users = new Map();
const tenants = new Map();
// Session storage (unused in current implementation)
// const sessions = new Map();

// Initialize default tenant
tenants.set('default', {
  id: 'default',
  name: 'Default Tenant',
  config: {
    mfaRequired: false,
    passwordPolicy: { minLength: 8, requireSpecialChars: true },
    sessionTimeout: 3600000, // 1 hour
  },
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  })
);

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts per window
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Session configuration
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    },
  })
);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = users.get(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Local Strategy (username/password)
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const tenantId = req.headers['x-tenant-id'] || 'default';
        const user = Array.from(users.values()).find(
          u => u.email === email && u.tenantId === tenantId
        );

        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(
          password,
          user.passwordHash
        );
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        // Check if MFA is required
        if (user.mfaEnabled) {
          // Store temp session for MFA verification
          const jwtSecret = process.env.JWT_SECRET;
          if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is required');
          }
          const tempToken = jwt.sign(
            { userId: user.id, mfaRequired: true },
            jwtSecret,
            { expiresIn: '5m' }
          );
          return done(null, false, {
            message: 'MFA required',
            tempToken,
            mfaRequired: true,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: req => {
        const authHeader = req.headers['authorization'];
        return authHeader && authHeader.split(' ')[1];
      },
      secretOrKey: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return secret;
      })(),
    },
    async (payload, done) => {
      try {
        const user = users.get(payload.id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// OAuth2 Strategy (Google, etc.)
passport.use(
  'oauth2',
  new OAuth2Strategy(
    {
      authorizationURL:
        process.env.OAUTH2_AUTH_URL ||
        'https://accounts.google.com/o/oauth2/auth',
      tokenURL:
        process.env.OAUTH2_TOKEN_URL || 'https://oauth2.googleapis.com/token',
      clientID: process.env.OAUTH2_CLIENT_ID || 'your-client-id',
      clientSecret: process.env.OAUTH2_CLIENT_SECRET || 'your-client-secret',
      callbackURL: '/auth/oauth2/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user from OAuth profile
        let user = Array.from(users.values()).find(
          u => u.oauthId === profile.id
        );

        if (!user) {
          const userId = uuidv4();
          user = {
            id: userId,
            email: profile.emails[0].value,
            name: profile.displayName,
            oauthId: profile.id,
            provider: 'oauth2',
            tenantId: 'default',
            roles: ['user'],
            createdAt: new Date(),
            mfaEnabled: false,
          };
          users.set(userId, user);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// SAML Strategy
passport.use(
  'saml',
  new SamlStrategy(
    {
      entryPoint:
        process.env.SAML_ENTRY_POINT || 'https://saml-provider.com/sso',
      issuer: process.env.SAML_ISSUER || 'azora-os',
      callbackUrl: '/auth/saml/callback',
      cert: process.env.SAML_CERT || 'your-cert',
    },
    (profile, done) => {
      // SAML profile handling
      const user = {
        id: profile.nameID,
        email: profile.email,
        name: profile.displayName,
        samlId: profile.nameID,
        provider: 'saml',
        tenantId: 'default',
        roles: profile.roles || ['user'],
      };
      return done(null, user);
    }
  )
);

// Add Google OAuth strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Google OAuth Strategy
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user from Google profile
        let user = Array.from(users.values()).find(
          u => u.email === profile.emails[0].value
        );

        if (!user) {
          // Create new user from Google profile
          const userId = uuidv4();
          user = {
            id: userId,
            email: profile.emails[0].value,
            name: profile.displayName,
            passwordHash: null, // No password for OAuth users
            tenantId: 'default',
            roles: ['user'],
            mfaEnabled: false,
            createdAt: new Date(),
            lastLogin: new Date(),
            provider: 'google',
            providerId: profile.id,
            profile: profile,
          };

          users.set(userId, user);
          logger.info('New user registered via Google OAuth', {
            userId,
            email: user.email,
          });
        } else {
          // Update existing user with Google profile info
          user.provider = 'google';
          user.providerId = profile.id;
          user.profile = profile;
          user.lastLogin = new Date();
          users.set(user.id, user);
        }

        return done(null, user);
      } catch (error) {
        logger.error('Google OAuth error', { error: error.message });
        return done(error);
      }
    }
  )
);

// GitHub OAuth Strategy
const GitHubStrategy = require('passport-github2').Strategy;
passport.use(
  'github',
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
      clientSecret:
        process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
      callbackURL: '/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user from GitHub profile
        let user = Array.from(users.values()).find(
          u =>
            u.email ===
            (profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null)
        );

        if (!user && profile.emails && profile.emails[0]) {
          // Create new user from GitHub profile
          const userId = uuidv4();
          user = {
            id: userId,
            email: profile.emails[0].value,
            name: profile.displayName || profile.username,
            passwordHash: null, // No password for OAuth users
            tenantId: 'default',
            roles: ['user'],
            mfaEnabled: false,
            createdAt: new Date(),
            lastLogin: new Date(),
            provider: 'github',
            providerId: profile.id,
            profile: profile,
          };

          users.set(userId, user);
          logger.info('New user registered via GitHub OAuth', {
            userId,
            email: user.email,
          });
        } else if (user) {
          // Update existing user with GitHub profile info
          user.provider = 'github';
          user.providerId = profile.id;
          user.profile = profile;
          user.lastLogin = new Date();
          users.set(user.id, user);
        }

        return done(null, user);
      } catch (error) {
        logger.error('GitHub OAuth error', { error: error.message });
        return done(error);
      }
    }
  )
);

// Microsoft OAuth Strategy
const MicrosoftStrategy = require('passport-microsoft').Strategy;
passport.use(
  'microsoft',
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID || 'your-microsoft-client-id',
      clientSecret:
        process.env.MICROSOFT_CLIENT_SECRET || 'your-microsoft-client-secret',
      callbackURL: '/auth/microsoft/callback',
      scope: ['user.read'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user from Microsoft profile
        let user = Array.from(users.values()).find(
          u => u.email === profile.emails[0].value
        );

        if (!user) {
          // Create new user from Microsoft profile
          const userId = uuidv4();
          user = {
            id: userId,
            email: profile.emails[0].value,
            name: profile.displayName,
            passwordHash: null, // No password for OAuth users
            tenantId: 'default',
            roles: ['user'],
            mfaEnabled: false,
            createdAt: new Date(),
            lastLogin: new Date(),
            provider: 'microsoft',
            providerId: profile.id,
            profile: profile,
          };

          users.set(userId, user);
          logger.info('New user registered via Microsoft OAuth', {
            userId,
            email: user.email,
          });
        } else {
          // Update existing user with Microsoft profile info
          user.provider = 'microsoft';
          user.providerId = profile.id;
          user.profile = profile;
          user.lastLogin = new Date();
          users.set(user.id, user);
        }

        return done(null, user);
      } catch (error) {
        logger.error('Microsoft OAuth error', { error: error.message });
        return done(error);
      }
    }
  )
);

// Utility functions
const generateTokens = user => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || 'noreply@azora-os.com',
    to,
    subject,
    html,
  });
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    users: users.size,
    tenants: tenants.size,
  });
});

// User registration
app.post('/register', generalLimiter, async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      tenantId = 'default',
      role = 'user',
      company,
      location,
      preferences = {},
    } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    const existingUser = Array.from(users.values()).find(
      u => u.email === email && u.tenantId === tenantId
    );
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with comprehensive profile
    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      name,
      passwordHash,
      tenantId,
      roles: [role],
      mfaEnabled: false,
      createdAt: new Date(),
      lastLogin: null,
      company: company || '',
      location: location || '',
      preferences: preferences,
      // Elara AI integration fields
      elaraPersonalization: {
        learningStyle: preferences.learningStyle || 'adaptive',
        communicationPreference: preferences.communicationPreference || 'email',
        interests: preferences.interests || [],
        goals: preferences.goals || [],
        skillLevel: preferences.skillLevel || 'beginner',
      },
      // For email personalization
      profileDescription: generateProfileDescription({
        name,
        role,
        company,
        location,
      }),
    };

    users.set(userId, user);

    // Notify Elara AI of new user
    notifyElaraOfNewUser(user);

    logger.info('User registered', { userId, email, tenantId });

    res.status(201).json({
      message: 'User registered successfully',
      userId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        tenantId: user.tenantId,
        company: user.company,
        location: user.location,
      },
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Local authentication
app.post('/login', authLimiter, (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    try {
      if (err) {
        logger.error('Login error', { error: err.message });
        return res.status(500).json({ error: 'Authentication error' });
      }

      if (!user) {
        if (info.mfaRequired) {
          return res.json({
            mfaRequired: true,
            tempToken: info.tempToken,
            message: 'MFA verification required',
          });
        }
        return res.status(401).json({ error: info.message });
      }

      // Update last login
      user.lastLogin = new Date();
      users.set(user.id, user);

      const { accessToken, refreshToken } = generateTokens(user);

      logger.info('User logged in', { userId: user.id, email: user.email });

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          tenantId: user.tenantId,
        },
      });
    } catch (error) {
      logger.error('Login processing error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  })(req, res, next);
});

// MFA verification
app.post('/mfa/verify', async (req, res) => {
  try {
    const { tempToken, code } = req.body;

    const decoded = jwt.verify(
      tempToken,
      process.env.JWT_SECRET || 'your-secret-key'
    );
    if (!decoded.mfaRequired) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const user = users.get(decoded.userId);
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ error: 'MFA not configured' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid MFA code' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    logger.error('MFA verification error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Setup MFA
app.post(
  '/mfa/setup',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      // Generate MFA secret
      const secret = speakeasy.generateSecret({
        name: `Azora OS (${user.email})`,
        issuer: 'Azora OS',
      });

      user.mfaSecret = secret.base32;
      user.mfaEnabled = false; // Will be enabled after verification
      users.set(user.id, user);

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        message:
          'Scan QR code with authenticator app, then verify with initial code',
      });
    } catch (error) {
      logger.error('MFA setup error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Enable MFA
app.post(
  '/mfa/enable',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { code } = req.body;
      const user = req.user;

      if (!user.mfaSecret) {
        return res.status(400).json({ error: 'MFA not set up' });
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: code,
        window: 2,
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid MFA code' });
      }

      user.mfaEnabled = true;
      users.set(user.id, user);

      res.json({ message: 'MFA enabled successfully' });
    } catch (error) {
      logger.error('MFA enable error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Refresh token
app.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
    );
    const user = users.get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (error) {
    logger.error('Token refresh error', { error: error.message });
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// OAuth2 routes
app.get('/auth/oauth2', passport.authenticate('oauth2'));
app.get(
  '/auth/oauth2/callback',
  passport.authenticate('oauth2', { failureRedirect: '/login' }),
  (req, res) => {
    const { accessToken, refreshToken } = generateTokens(req.user);
    res.redirect(
      `${
        process.env.FRONTEND_URL || 'http://localhost:5173'
      }/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);

// Google OAuth routes
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const { accessToken, refreshToken } = generateTokens(req.user);
    res.redirect(
      `${
        process.env.FRONTEND_URL || 'http://localhost:3000'
      }/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);

// GitHub OAuth routes
app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);
app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const { accessToken, refreshToken } = generateTokens(req.user);
    res.redirect(
      `${
        process.env.FRONTEND_URL || 'http://localhost:3000'
      }/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);

// Microsoft OAuth routes
app.get('/auth/microsoft', passport.authenticate('microsoft'));
app.get(
  '/auth/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  (req, res) => {
    const { accessToken, refreshToken } = generateTokens(req.user);
    res.redirect(
      `${
        process.env.FRONTEND_URL || 'http://localhost:3000'
      }/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);

// SAML routes
app.get('/auth/saml', passport.authenticate('saml'));
app.post(
  '/auth/saml/callback',
  passport.authenticate('saml', { failureRedirect: '/login' }),
  (req, res) => {
    const { accessToken, refreshToken } = generateTokens(req.user);
    res.redirect(
      `${
        process.env.FRONTEND_URL || 'http://localhost:5173'
      }/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);

// Password reset
app.post('/forgot-password', generalLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = Array.from(users.values()).find(u => u.email === email);

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        message: 'If the email exists, a reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    users.set(user.id, user);

    // Send email
    const resetUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:5173'
    }/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Password Reset - Azora OS',
      `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
    );

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    logger.error('Password reset error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User profile
app.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const user = req.user;
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      tenantId: user.tenantId,
      mfaEnabled: user.mfaEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    });
  }
);

// Logout
app.post(
  '/logout',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // In a real implementation, you might want to blacklist the token
    logger.info('User logged out', { userId: req.user.id });
    res.json({ message: 'Logged out successfully' });
  }
);

// Admin routes
app.get(
  '/admin/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const tenantUsers = Array.from(users.values())
      .filter(u => u.tenantId === req.user.tenantId)
      .map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        roles: u.roles,
        mfaEnabled: u.mfaEnabled,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
      }));

    res.json({ users: tenantUsers });
  }
);

// Error handling
app.use((err, req, res /* _next */) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Helper function to generate user profile description for emails
const generateProfileDescription = user => {
  let description = `a valued member of our community`;

  if (user.role === 'student') {
    description = `an ambitious student pursuing knowledge and growth`;
  } else if (user.role === 'developer') {
    description = `a talented developer building the future`;
  } else if (user.role === 'entrepreneur') {
    description = `an innovative entrepreneur driving change`;
  } else if (user.role === 'educator') {
    description = `a dedicated educator shaping minds`;
  } else if (user.company) {
    description = `a professional at ${user.company}`;
  }

  if (user.location) {
    description += ` from ${user.location}`;
  }

  return description;
};

// Helper function to notify Elara AI of new user registration
const notifyElaraOfNewUser = user => {
  // In a real implementation, this would send a message to Elara AI
  // For now, we'll just log it
  logger.info('New user registered - notifying Elara AI', {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.roles[0],
    company: user.company,
    location: user.location,
  });

  // This would typically be an API call to Elara's system
  // Example: elaraAPI.notifyNewUser(user);
};

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing gracefully');
  redisClient.quit();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    await redisClient.connect();

    // Create a demo user for testing
    const demoUserId = uuidv4();
    const demoUser = {
      id: demoUserId,
      email: 'demo@azora-os.com',
      name: 'Demo User',
      passwordHash: await bcrypt.hash('password123', 12),
      tenantId: 'default',
      roles: ['user', 'admin'],
      mfaEnabled: false,
      createdAt: new Date(),
      lastLogin: null,
    };
    users.set(demoUserId, demoUser);

    app.listen(PORT, () => {
      logger.info(
        `🚀 Advanced Authentication Service v2.0 running on port ${PORT}`,
        {
          features: [
            'Multi-tenant Support',
            'OAuth2 Integration',
            'SAML Authentication',
            'MFA/TOTP',
            'JWT Tokens',
            'Password Reset',
            'Role-based Access Control',
            'Session Management',
            'Rate Limiting',
          ],
        }
      );
      console.log(
        `🚀 Advanced Authentication Service listening on port ${PORT}`
      );
      console.log(`Demo user: demo@azora-os.com / password123`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();
