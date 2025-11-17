const request = require('supertest');
const app = require('../index.js');

describe('Billing Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('billing-service');
    });
  });

  // Get all invoices test
  describe('GET /api/invoices', () => {
    it('should return all invoices', async () => {
      const response = await request(app)
        .get('/api/invoices')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific invoice test
  describe('GET /api/invoices/:invoiceId', () => {
    it('should return specific invoice', async () => {
      const response = await request(app)
        .get('/api/invoices/inv_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('inv_1');
    });

    it('should return 404 for non-existent invoice', async () => {
      const response = await request(app)
        .get('/api/invoices/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Invoice not found');
    });
  });

  // Create a new invoice test
  describe('POST /api/invoices', () => {
    it('should create a new invoice', async () => {
      const invoiceData = {
        customerId: 'customer_1',
        items: [
          { description: 'Test Service', quantity: 1, price: 100 }
        ],
        dueDate: '2023-12-31',
        currency: 'USD'
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.customerId).toBe('customer_1');
      expect(response.body.data.amount).toBe(100);
      expect(response.body.data.status).toBe('pending');
    });

    it('should return 400 for missing required fields', async () => {
      const invoiceData = {
        customerId: 'customer_1'
        // Missing items
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData)
        .expect(400);
      
      expect(response.body.error).toBe('Customer ID and items are required');
    });

    it('should return 404 for non-existent customer', async () => {
      const invoiceData = {
        customerId: 'non-existent',
        items: [
          { description: 'Test Service', quantity: 1, price: 100 }
        ]
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData)
        .expect(404);
      
      expect(response.body.error).toBe('Customer not found');
    });
  });

  // Update invoice status test
  describe('PUT /api/invoices/:invoiceId', () => {
    let invoiceId;

    beforeAll(async () => {
      // Create an invoice first
      const invoiceData = {
        customerId: 'customer_2',
        items: [
          { description: 'Test Service', quantity: 2, price: 150 }
        ]
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData);

      invoiceId = response.body.data.id;
    });

    it('should update invoice status', async () => {
      const updateData = {
        status: 'paid'
      };

      const response = await request(app)
        .put(`/api/invoices/${invoiceId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('paid');
    });

    it('should return 404 for non-existent invoice', async () => {
      const updateData = {
        status: 'paid'
      };

      const response = await request(app)
        .put('/api/invoices/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Invoice not found');
    });
  });

  // Get all payments test
  describe('GET /api/payments', () => {
    it('should return all payments', async () => {
      const response = await request(app)
        .get('/api/payments')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific payment test
  describe('GET /api/payments/:paymentId', () => {
    it('should return specific payment', async () => {
      // First create a payment
      const paymentData = {
        invoiceId: 'inv_1',
        amount: 1500,
        method: 'credit_card'
      };

      const paymentResponse = await request(app)
        .post('/api/payments')
        .send(paymentData);

      const paymentId = paymentResponse.body.data.id;

      // Then fetch it
      const response = await request(app)
        .get(`/api/payments/${paymentId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(paymentId);
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Payment not found');
    });
  });

  // Process a payment test
  describe('POST /api/payments', () => {
    it('should process a payment', async () => {
      const paymentData = {
        invoiceId: 'inv_2',
        amount: 2750,
        method: 'bank_transfer',
        reference: 'REF123456'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.invoiceId).toBe('inv_2');
      expect(response.body.data.amount).toBe(2750);
      expect(response.body.data.method).toBe('bank_transfer');
      expect(response.body.data.status).toBe('completed');
    });

    it('should return 400 for missing required fields', async () => {
      const paymentData = {
        invoiceId: 'inv_1',
        amount: 1500
        // Missing method
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(400);
      
      expect(response.body.error).toBe('Invoice ID, amount, and method are required');
    });

    it('should return 404 for non-existent invoice', async () => {
      const paymentData = {
        invoiceId: 'non-existent',
        amount: 1000,
        method: 'credit_card'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(404);
      
      expect(response.body.error).toBe('Invoice not found');
    });

    it('should return 400 for mismatched payment amount', async () => {
      const paymentData = {
        invoiceId: 'inv_1',
        amount: 1000, // Should be 1500
        method: 'credit_card'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(400);
      
      expect(response.body.error).toBe('Payment amount must match invoice amount');
    });
  });

  // Get all customers test
  describe('GET /api/customers', () => {
    it('should return all customers', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific customer test
  describe('GET /api/customers/:customerId', () => {
    it('should return specific customer', async () => {
      const response = await request(app)
        .get('/api/customers/customer_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('customer_1');
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Customer not found');
    });
  });

  // Create a new customer test
  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        address: '789 Test St, Test City, Test Country'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Customer');
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should return 400 for missing required fields', async () => {
      const customerData = {
        name: 'Test Customer'
        // Missing email
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(400);
      
      expect(response.body.error).toBe('Name and email are required');
    });
  });

  // Get customer invoices test
  describe('GET /api/customers/:customerId/invoices', () => {
    it('should return invoices for a customer', async () => {
      const response = await request(app)
        .get('/api/customers/customer_1/invoices')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/non-existent/invoices')
        .expect(404);
      
      expect(response.body.error).toBe('Customer not found');
    });
  });

  // Get customer payments test
  describe('GET /api/customers/:customerId/payments', () => {
    it('should return payment history for a customer', async () => {
      const response = await request(app)
        .get('/api/customers/customer_1/payments')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/non-existent/payments')
        .expect(404);
      
      expect(response.body.error).toBe('Customer not found');
    });
  });
});