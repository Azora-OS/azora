/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const nodemailer = require('nodemailer');
const imap = require('imap-simple');
const { simpleParser } = require('mailparser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');

require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-workspace' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Zero-rated optimizations and offline-first architecture
const compression = require('compression');
const offlineStorage = require('./offline-storage');

// Enable compression for zero-rated data usage
app.use(compression({
  level: 9, // Maximum compression
  threshold: 0, // Compress everything
  filter: (req, res) => {
    // Don't compress event streams or already compressed responses
    if (req.headers['accept-encoding']?.includes('gzip')) {
      return compression.filter(req, res);
    }
    return false;
  }
}));

// Offline-first middleware
app.use('/api/offline', offlineStorage.middleware);

// Progressive Web App (PWA) support for zero-rated access
app.get('/manifest.json', (req, res) => {
  res.json({
    name: 'Azora Workspace',
    short_name: 'AzoraWork',
    description: 'Zero-rated email and collaboration platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#00d4ff',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    categories: ['productivity', 'communication'],
    lang: 'en',
    dir: 'ltr'
  });
});

// Service Worker for offline functionality
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    const CACHE_NAME = 'azora-workspace-v1';
    const STATIC_CACHE = 'azora-static-v1';
    const API_CACHE = 'azora-api-v1';

    // Install event - cache static assets
    self.addEventListener('install', event => {
      event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
          return cache.addAll([
            '/',
            '/manifest.json',
            '/offline.html'
          ]);
        })
      );
    });

    // Fetch event - serve from cache when offline
    self.addEventListener('fetch', event => {
      const url = new URL(event.request.url);

      // API requests - cache for offline use
      if (url.pathname.startsWith('/api/')) {
        event.respondWith(
          caches.open(API_CACHE).then(cache => {
            return fetch(event.request).then(response => {
              // Cache successful GET requests
              if (event.request.method === 'GET' && response.status === 200) {
                cache.put(event.request, response.clone());
              }
              return response;
            }).catch(() => {
              // Return cached version if offline
              return cache.match(event.request);
            });
          })
        );
      }
      // Static assets - cache first
      else {
        event.respondWith(
          caches.match(event.request).then(response => {
            return response || fetch(event.request).then(response => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE).then(cache => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
          })
        );
      }
    });

    // Background sync for zero-rated sending
    self.addEventListener('sync', event => {
      if (event.tag === 'background-send-email') {
        event.waitUntil(sendQueuedEmails());
      }
    });

    async function sendQueuedEmails() {
      const cache = await caches.open(API_CACHE);
      const keys = await cache.keys();

      for (const request of keys) {
        if (request.url.includes('/api/emails/send')) {
          try {
            await fetch(request);
            await cache.delete(request);
          } catch (error) {
            console.log('Failed to send queued email:', error);
          }
        }
      }
    }
  `);
});

// Offline page
app.get('/offline.html', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Azora Workspace - Offline</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #0a0a0a;
          color: #ffffff;
          text-align: center;
          padding: 50px;
        }
        .offline-message {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid #00d4ff;
          border-radius: 10px;
          padding: 20px;
          margin: 20px auto;
          max-width: 500px;
        }
      </style>
    </head>
    <body>
      <h1>🔌 Azora Workspace</h1>
      <div class="offline-message">
        <h2>You're Currently Offline</h2>
        <p>Your emails and documents are available offline. We'll sync when you're back online.</p>
        <p><strong>Zero Data Cost</strong> - All Azora services are optimized for low-data usage.</p>
      </div>
    </body>
    </html>
  `);
});

// Zero-rated data optimization middleware
app.use((req, res, next) => {
  // Add headers for zero-rated optimization
  res.setHeader('X-Zero-Rated', 'true');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

  // Compress responses
  if (!res.getHeader('Content-Encoding')) {
    res.setHeader('Content-Encoding', 'gzip');
  }

  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/azora-workspace')
.then(() => logger.info('Connected to MongoDB'))
.catch(err => logger.error('MongoDB connection error:', err));

// Models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  avatar: String,
  role: { type: String, default: 'user' },
  organization: String,
  emailSettings: {
    signature: String,
    autoReply: Boolean,
    autoReplyMessage: String,
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
});

const EmailSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: [{ type: String, required: true }],
  cc: [String],
  bcc: [String],
  subject: { type: String, required: true },
  body: { type: String, required: true },
  html: String,
  attachments: [{
    filename: String,
    contentType: String,
    size: Number,
    path: String,
  }],
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  labels: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  threadId: String,
  sentAt: { type: Date, default: Date.now },
  receivedAt: Date,
});

const WorkspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  channels: [{
    name: String,
    type: { type: String, enum: ['text', 'voice'], default: 'text' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],
  settings: {
    isPublic: { type: Boolean, default: false },
    allowInvites: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Email = mongoose.model('Email', EmailSchema);
const Workspace = mongoose.model('Workspace', WorkspaceSchema);

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'azora-workspace-secret');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Helper function to check online status
const checkOnlineStatus = async () => {
  try {
    // Simple connectivity check - try to reach a reliable endpoint
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Background sync for queued emails
app.post('/api/emails/sync', authenticateToken, async (req, res) => {
  try {
    const queuedEmails = await offlineStorage.getQueuedEmails(req.user._id);

    if (queuedEmails.length === 0) {
      return res.json({
        message: 'No queued emails to sync',
        synced: 0,
        zeroRated: true,
      });
    }

    let synced = 0;
    let failed = 0;
    const results = [];

    for (const queuedEmail of queuedEmails) {
      try {
        // Attempt to send the queued email
        const mailOptions = {
          from: req.user.email,
          to: queuedEmail.emailData.to,
          cc: queuedEmail.emailData.cc || [],
          bcc: queuedEmail.emailData.bcc || [],
          subject: queuedEmail.emailData.subject,
          text: queuedEmail.emailData.text,
          html: queuedEmail.emailData.html,
        };

        await emailTransporter.sendMail(mailOptions);

        // Mark as sent and remove from queue
        await offlineStorage.markEmailSent(queuedEmail.emailId);

        // Update the email record if it exists
        if (queuedEmail.emailId && !queuedEmail.emailId.startsWith('failed-')) {
          await Email.findByIdAndUpdate(queuedEmail.emailId, {
            sentAt: new Date(),
          });
        }

        results.push({
          emailId: queuedEmail.emailId,
          status: 'sent',
          subject: queuedEmail.emailData.subject,
        });

        synced++;
      } catch (error) {
        logger.error(`Failed to send queued email ${queuedEmail.emailId}:`, error);

        // Increment retry count
        await offlineStorage.incrementRetryCount(queuedEmail.emailId);

        // If max retries reached, mark as failed
        if (queuedEmail.retryCount >= 3) {
          await offlineStorage.markEmailFailed(queuedEmail.emailId, error.message);
          results.push({
            emailId: queuedEmail.emailId,
            status: 'failed',
            error: error.message,
            subject: queuedEmail.emailData.subject,
          });
          failed++;
        } else {
          results.push({
            emailId: queuedEmail.emailId,
            status: 'retry',
            retryCount: queuedEmail.retryCount + 1,
            subject: queuedEmail.emailData.subject,
          });
        }
      }
    }

    res.json({
      message: `Synced ${synced} emails, ${failed} failed`,
      synced,
      failed,
      results,
      zeroRated: true,
    });
  } catch (error) {
    logger.error('Email sync error:', error);
    res.status(500).json({
      error: 'Failed to sync emails',
      zeroRated: true,
    });
  }
});

// Get cached emails for offline access
app.get('/api/emails/cached', authenticateToken, async (req, res) => {
  try {
    const cachedEmails = await offlineStorage.getCachedEmails(req.user._id);

    res.json({
      emails: cachedEmails,
      count: cachedEmails.length,
      zeroRated: true,
      cached: true,
    });
  } catch (error) {
    logger.error('Get cached emails error:', error);
    res.status(500).json({
      error: 'Failed to get cached emails',
      zeroRated: true,
    });
  }
});

// Routes

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'azora-workspace-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'azora-workspace-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email routes
app.get('/api/emails', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, folder = 'inbox' } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };

    // Filter by folder/label
    if (folder === 'starred') {
      query.isStarred = true;
    } else if (folder === 'sent') {
      query.from = req.user.email;
    }

    // Check online status
    const isOnline = await checkOnlineStatus();

    let emails = [];
    let cachedEmails = [];
    let total = 0;

    if (isOnline) {
      // Get fresh emails from database
      emails = await Email.find(query)
        .sort({ receivedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'email firstName lastName');

      total = await Email.countDocuments(query);

      // Cache recent emails for offline access
      if (emails.length > 0) {
        for (const email of emails.slice(0, 10)) { // Cache first 10 emails
          await offlineStorage.cacheEmail(email._id, {
            ...email.toObject(),
            cachedAt: new Date(),
          });
        }
      }
    } else {
      // Get cached emails for offline access
      cachedEmails = await offlineStorage.getCachedEmails(req.user._id);
      emails = cachedEmails.slice(skip, skip + parseInt(limit));
      total = cachedEmails.length;
    }

    res.json({
      emails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      offline: !isOnline,
      cached: cachedEmails.length > 0,
      zeroRated: true,
    });
  } catch (error) {
    logger.error('Get emails error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/emails/send', authenticateToken, async (req, res) => {
  try {
    const { to, cc, bcc, subject, body, html, attachments } = req.body;

    // Create email record
    const email = new Email({
      from: req.user.email,
      to: Array.isArray(to) ? to : [to],
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
      subject,
      body,
      html,
      userId: req.user._id,
      sentAt: new Date(),
    });

    await email.save();

    // Check if user is online (has internet connection)
    const isOnline = await checkOnlineStatus();

    if (!isOnline) {
      // Queue email for offline sending
      await offlineStorage.queueEmail({
        emailId: email._id,
        userId: req.user._id,
        emailData: {
          from: req.user.email,
          to: email.to,
          cc: email.cc,
          bcc: email.bcc,
          subject: email.subject,
          text: email.body,
          html: email.html,
        },
        queuedAt: new Date(),
        retryCount: 0,
      });

      return res.status(202).json({
        message: 'Email queued for sending when online',
        email,
        status: 'queued',
        zeroRated: true,
      });
    }

    // Send email via SMTP when online
    const mailOptions = {
      from: req.user.email,
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      subject: email.subject,
      text: email.body,
      html: email.html,
    };

    await emailTransporter.sendMail(mailOptions);

    // Cache sent email for offline access
    await offlineStorage.cacheEmail(email._id, {
      ...email.toObject(),
      status: 'sent',
      cachedAt: new Date(),
    });

    res.status(201).json({
      message: 'Email sent successfully',
      email,
      status: 'sent',
      zeroRated: true,
    });
  } catch (error) {
    logger.error('Send email error:', error);

    // If sending fails, queue for retry
    try {
      await offlineStorage.queueEmail({
        emailId: req.body.emailId || 'failed-' + Date.now(),
        userId: req.user._id,
        emailData: req.body,
        queuedAt: new Date(),
        retryCount: 0,
        error: error.message,
      });
    } catch (queueError) {
      logger.error('Failed to queue email:', queueError);
    }

    res.status(202).json({
      message: 'Email queued for retry',
      error: error.message,
      status: 'queued',
      zeroRated: true,
    });
  }
});

app.put('/api/emails/:id/read', authenticateToken, async (req, res) => {
  try {
    const email = await Email.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json({ email });
  } catch (error) {
    logger.error('Mark email read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Workspace routes
app.post('/api/workspaces', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    const workspace = new Workspace({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    await workspace.save();

    res.status(201).json({
      message: 'Workspace created successfully',
      workspace,
    });
  } catch (error) {
    logger.error('Create workspace error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/workspaces', authenticateToken, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    }).populate('owner', 'email firstName lastName')
      .populate('members', 'email firstName lastName');

    res.json({ workspaces });
  } catch (error) {
    logger.error('Get workspaces error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload route
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      },
    });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Socket.IO for real-time collaboration
io.on('connection', (socket) => {
  logger.info('User connected:', socket.id);

  socket.on('join-workspace', (workspaceId) => {
    socket.join(workspaceId);
    logger.info(`User ${socket.id} joined workspace ${workspaceId}`);
  });

  socket.on('leave-workspace', (workspaceId) => {
    socket.leave(workspaceId);
    logger.info(`User ${socket.id} left workspace ${workspaceId}`);
  });

  socket.on('send-message', (data) => {
    const { workspaceId, channelId, message, userId } = data;
    io.to(workspaceId).emit('new-message', {
      channelId,
      message,
      userId,
      timestamp: new Date(),
    });
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected:', socket.id);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-workspace',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 4100;
server.listen(PORT, () => {
  logger.info(`Azora Workspace service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await mongoose.connection.close();
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(async () => {
    await mongoose.connection.close();
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = app;