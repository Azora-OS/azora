const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3029;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'billing-service' },
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

// In-memory storage for invoices, payments, and customers (in production, use a database)
const invoices = new Map();
const payments = new Map();
const customers = new Map();

// Initialize with sample data
customers.set('customer_1', {
  id: 'customer_1',
  name: 'John Doe',
  email: 'john@example.com',
  address: '123 Main St, City, Country',
  createdAt: new Date().toISOString()
});

customers.set('customer_2', {
  id: 'customer_2',
  name: 'Jane Smith',
  email: 'jane@example.com',
  address: '456 Oak Ave, City, Country',
  createdAt: new Date().toISOString()
});

invoices.set('inv_1', {
  id: 'inv_1',
  customerId: 'customer_1',
  customerName: 'John Doe',
  amount: 1500,
  currency: 'USD',
  status: 'paid',
  dueDate: '2023-12-01',
  items: [
    { description: 'Service A', quantity: 1, price: 1000 },
    { description: 'Service B', quantity: 1, price: 500 }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

invoices.set('inv_2', {
  id: 'inv_2',
  customerId: 'customer_2',
  customerName: 'Jane Smith',
  amount: 2750,
  currency: 'USD',
  status: 'pending',
  dueDate: '2023-12-15',
  items: [
    { description: 'Service C', quantity: 2, price: 1000 },
    { description: 'Service D', quantity: 1, price: 750 }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'billing-service', 
    timestamp: new Date().toISOString() 
  });
});

// Get all invoices
app.get('/api/invoices', (req, res) => {
  try {
    const invoiceList = Array.from(invoices.values());
    
    res.json({
      success: true,
      data: invoiceList,
      count: invoiceList.length
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific invoice
app.get('/api/invoices/:invoiceId', (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = invoices.get(invoiceId);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error('Error fetching invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new invoice
app.post('/api/invoices', (req, res) => {
  try {
    const { customerId, items, dueDate, currency } = req.body;
    
    // Validate input
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer ID and items are required' });
    }
    
    // Check if customer exists
    const customer = customers.get(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Calculate total amount
    const amount = items.reduce((total, item) => total + (item.quantity * item.price), 0);
    
    const invoiceId = uuidv4();
    const invoice = {
      id: invoiceId,
      customerId,
      customerName: customer.name,
      amount,
      currency: currency || 'USD',
      status: 'pending',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days from now
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    invoices.set(invoiceId, invoice);
    
    logger.info(`Invoice ${invoiceId} created for customer ${customerId}`);
    
    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update invoice status
app.put('/api/invoices/:invoiceId', (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;
    
    const invoice = invoices.get(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Update invoice
    invoice.status = status || invoice.status;
    invoice.updatedAt = new Date().toISOString();
    
    invoices.set(invoiceId, invoice);
    
    logger.info(`Invoice ${invoiceId} status updated to ${status}`);
    
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error('Error updating invoice:', error);
    res.status(500).json({ error: error.message });
  }
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

// Process a payment
app.post('/api/payments', (req, res) => {
  try {
    const { invoiceId, amount, method, reference } = req.body;
    
    // Validate input
    if (!invoiceId || !amount || !method) {
      return res.status(400).json({ error: 'Invoice ID, amount, and method are required' });
    }
    
    // Check if invoice exists
    const invoice = invoices.get(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Check if amount matches invoice amount (simplified validation)
    if (amount !== invoice.amount) {
      return res.status(400).json({ error: 'Payment amount must match invoice amount' });
    }
    
    const paymentId = uuidv4();
    const payment = {
      id: paymentId,
      invoiceId,
      customerId: invoice.customerId,
      amount,
      currency: invoice.currency,
      method,
      reference: reference || '',
      status: 'completed',
      processedAt: new Date().toISOString()
    };
    
    payments.set(paymentId, payment);
    
    // Update invoice status
    invoice.status = 'paid';
    invoice.updatedAt = new Date().toISOString();
    invoices.set(invoiceId, invoice);
    
    logger.info(`Payment ${paymentId} processed for invoice ${invoiceId}`);
    
    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all customers
app.get('/api/customers', (req, res) => {
  try {
    const customerList = Array.from(customers.values());
    
    res.json({
      success: true,
      data: customerList,
      count: customerList.length
    });
  } catch (error) {
    logger.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific customer
app.get('/api/customers/:customerId', (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = customers.get(customerId);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    logger.error('Error fetching customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new customer
app.post('/api/customers', (req, res) => {
  try {
    const { name, email, address } = req.body;
    
    // Validate input
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const customerId = uuidv4();
    const customer = {
      id: customerId,
      name,
      email,
      address: address || '',
      createdAt: new Date().toISOString()
    };
    
    customers.set(customerId, customer);
    
    logger.info(`Customer ${customerId} created`);
    
    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    logger.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get invoice by customer
app.get('/api/customers/:customerId/invoices', (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Check if customer exists
    const customer = customers.get(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Filter invoices by customer
    const customerInvoices = Array.from(invoices.values()).filter(invoice => invoice.customerId === customerId);
    
    res.json({
      success: true,
      data: customerInvoices,
      count: customerInvoices.length
    });
  } catch (error) {
    logger.error('Error fetching customer invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment history by customer
app.get('/api/customers/:customerId/payments', (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Check if customer exists
    const customer = customers.get(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Filter payments by customer
    const customerPayments = Array.from(payments.values()).filter(payment => payment.customerId === customerId);
    
    res.json({
      success: true,
      data: customerPayments,
      count: customerPayments.length
    });
  } catch (error) {
    logger.error('Error fetching customer payments:', error);
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

app.listen(PORT, () => {
  logger.info(`Billing Service running on port ${PORT}`);
});

module.exports = app;