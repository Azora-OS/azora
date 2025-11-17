import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

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

// In-memory storage for payments (in production, use a database)
const payments = new Map();

// Initialize with sample data
payments.set('payment_1', {
  id: 'payment_1',
  amount: 99.99,
  currency: 'USD',
  status: 'completed',
  method: 'credit_card',
  customerId: 'customer_123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'payment-service',
    timestamp: new Date().toISOString()
  });
});

// Get all payments
app.get('/api/payments', (req, res) => {
  try {
    const paymentList = Array.from(payments.values());
    
    res.json({
      success: true,
      data: paymentList,
      count: paymentList.length
    });
  } catch (error) {
    logger.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific payment
app.get('/api/payments/:paymentId', (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = payments.get(paymentId);
    
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
app.post('/api/payments', (req, res) => {
  try {
    const { amount, currency, method, customerId } = req.body;
    
    // Validate input
    if (!amount || !currency || !method || !customerId) {
      return res.status(400).json({ error: 'Amount, currency, method, and customer ID are required' });
    }
    
    const paymentId = uuidv4();
    const payment = {
      id: paymentId,
      amount,
      currency,
      status: 'pending',
      method,
      customerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    payments.set(paymentId, payment);
    
    logger.info(`Payment ${paymentId} created for customer ${customerId}`);
    
    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment status
app.put('/api/payments/:paymentId', (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;
    
    const payment = payments.get(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update payment status
    payment.status = status || payment.status;
    payment.updatedAt = new Date().toISOString();
    
    payments.set(paymentId, payment);
    
    logger.info(`Payment ${paymentId} status updated to ${status}`);
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Error updating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process refund
app.post('/api/payments/:paymentId/refund', (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = payments.get(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Process refund (in production, integrate with payment provider)
    payment.status = 'refunded';
    payment.updatedAt = new Date().toISOString();
    
    payments.set(paymentId, payment);
    
    logger.info(`Payment ${paymentId} refunded`);
    
    res.json({
      success: true,
      data: payment,
      message: 'Payment refunded successfully'
    });
  } catch (error) {
    logger.error('Error processing refund:', error);
    res.status(500).json({ error: 'Internal server error' });
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