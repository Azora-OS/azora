import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import winston from 'winston';
import { PrismaClient } from '@prisma/client';
import StripeClientService from './stripe-client';
import PaymentRepository from './payment-repository';
import PaymentProcessor from './payment-processor';
import { PaymentError } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'payment-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

app.use(helmet());
app.use(cors());
app.use(compression());

app.use(express.json());

// Initialize Services
const prisma = new PrismaClient();
const paymentRepository = new PaymentRepository(prisma);

if (!process.env.STRIPE_SECRET_KEY) {
  logger.error('STRIPE_SECRET_KEY is not defined');
  process.exit(1);
}

const stripeClient = new StripeClientService(process.env.STRIPE_SECRET_KEY);
const paymentProcessor = new PaymentProcessor(stripeClient, paymentRepository);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'payment-service',
    timestamp: new Date().toISOString()
  });
});

// Get all payments (Paginated)
app.get('/api/payments', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await paymentRepository.getPaymentHistory(userId, limit, offset);

    res.json({
      success: true,
      data: result.payments,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset
      }
    });
  } catch (error) {
    logger.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific payment
app.get('/api/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentRepository.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new payment
app.post('/api/payments', async (req, res) => {
  try {
    const result = await paymentProcessor.processPayment(req.body);

    if (!result.success) {
      const statusCode = result.error?.code === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: result.error?.message || 'Payment processing failed',
        code: result.error?.code
      });
    }

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refund payment
app.post('/api/payments/:paymentId/refund', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const result = await paymentProcessor.refundPayment(paymentId, amount, reason);

    if (!result.success) {
      const statusCode = result.error?.code === 'NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error?.message || 'Refund failed',
        code: result.error?.code
      });
    }

    res.json(result);
  } catch (error) {
    logger.error('Error processing refund:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe Webhook Handler
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).send('Webhook Error: Missing signature or secret');
  }

  try {
    const event = stripeClient.verifyWebhookSignature(req.body, sig as string, webhookSecret);

    // Handle specific events if needed, or pass to a webhook handler service
    logger.info('Received Stripe webhook event', { type: event.type, id: event.id });

    res.json({ received: true });
  } catch (err: any) {
    logger.error('Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: any, res: any) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;