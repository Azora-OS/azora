/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

import { getServiceBrand } from './lib/branding/service-config.js';
import { contactRoutes } from './routes/contact.js';
import { newsletterRoutes } from './routes/newsletter.js';
import { healthRoutes } from './routes/health.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000; // Changed to 4000 to match docs

// --- Security Middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Unsafe-inline needed for some legacy scripts
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173'],
    },
  },
}));

const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// --- Body Parsing ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
const brand = getServiceBrand('backend'); // Get branding for the backend

app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: brand.name,
    tagline: brand.tagline,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/health', healthRoutes);

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'An unexpected error occurred.',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
});

// --- 404 Handler ---
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// --- Graceful Shutdown ---
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully.`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`🚀 ${brand.name} backend listening on port ${PORT}`)
  console.log(`      Environment: ${process.env.NODE_ENV || 'development'}`)
});
