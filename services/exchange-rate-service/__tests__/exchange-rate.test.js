const request = require('supertest');
const app = require('../index.js');

describe('Exchange Rate Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('exchange-rate-service');
    });
  });

  // Get all exchange rates test
  describe('GET /api/rates', () => {
    it('should return all exchange rates', async () => {
      const response = await request(app)
        .get('/api/rates')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.rates).toBeDefined();
      expect(response.body.data.base).toBe('USD');
    });
  });

  // Get specific currency rate test
  describe('GET /api/rates/:currency', () => {
    it('should return specific currency rate', async () => {
      const response = await request(app)
        .get('/api/rates/EUR')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.currency).toBe('EUR');
      expect(typeof response.body.data.rate).toBe('number');
    });

    it('should return 404 for non-existent currency', async () => {
      const response = await request(app)
        .get('/api/rates/NONEXISTENT')
        .expect(404);
      
      expect(response.body.error).toBe('Currency not found');
    });
  });

  // Update exchange rates test
  describe('POST /api/rates', () => {
    it('should update exchange rates', async () => {
      const ratesData = {
        rates: {
          EUR: 0.95,
          GBP: 0.85
        }
      };

      const response = await request(app)
        .post('/api/rates')
        .send(ratesData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Exchange rates updated successfully');
    });

    it('should return 400 for missing rates object', async () => {
      const response = await request(app)
        .post('/api/rates')
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('Valid rates object is required');
    });
  });

  // Currency conversion test
  describe('POST /api/convert', () => {
    it('should convert currency', async () => {
      const conversionData = {
        from: 'USD',
        to: 'EUR',
        amount: 100
      };

      const response = await request(app)
        .post('/api/convert')
        .send(conversionData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.from).toBe('USD');
      expect(response.body.data.to).toBe('EUR');
      expect(response.body.data.amount).toBe(100);
      expect(typeof response.body.data.convertedAmount).toBe('number');
    });

    it('should return 400 for missing required fields', async () => {
      const conversionData = {
        from: 'USD',
        to: 'EUR'
        // Missing amount
      };

      const response = await request(app)
        .post('/api/convert')
        .send(conversionData)
        .expect(400);
      
      expect(response.body.error).toBe('From currency, to currency, and amount are required');
    });

    it('should return 404 for non-existent from currency', async () => {
      const conversionData = {
        from: 'NONEXISTENT',
        to: 'EUR',
        amount: 100
      };

      const response = await request(app)
        .post('/api/convert')
        .send(conversionData)
        .expect(404);
      
      expect(response.body.error).toBe('Currency NONEXISTENT not found');
    });

    it('should return 404 for non-existent to currency', async () => {
      const conversionData = {
        from: 'USD',
        to: 'NONEXISTENT',
        amount: 100
      };

      const response = await request(app)
        .post('/api/convert')
        .send(conversionData)
        .expect(404);
      
      expect(response.body.error).toBe('Currency NONEXISTENT not found');
    });
  });

  // Batch currency conversion test
  describe('POST /api/convert/batch', () => {
    it('should convert currencies in batch', async () => {
      const batchData = {
        conversions: [
          { from: 'USD', to: 'EUR', amount: 100, id: 'conv1' },
          { from: 'USD', to: 'GBP', amount: 200, id: 'conv2' }
        ]
      };

      const response = await request(app)
        .post('/api/convert/batch')
        .send(batchData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should return 400 for missing conversions array', async () => {
      const response = await request(app)
        .post('/api/convert/batch')
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('Conversions array is required');
    });

    it('should handle errors in batch conversion', async () => {
      const batchData = {
        conversions: [
          { from: 'USD', to: 'EUR', amount: 100 },
          { from: 'NONEXISTENT', to: 'GBP', amount: 200 }
        ]
      };

      const response = await request(app)
        .post('/api/convert/batch')
        .send(batchData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[1].error).toBe('Currency NONEXISTENT not found');
    });
  });

  // Historical rates test
  describe('GET /api/history/:currency', () => {
    it('should return historical rates', async () => {
      const response = await request(app)
        .get('/api/history/EUR')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.currency).toBe('EUR');
      expect(Array.isArray(response.body.data.history)).toBe(true);
    });

    it('should return 404 for non-existent currency', async () => {
      const response = await request(app)
        .get('/api/history/NONEXISTENT')
        .expect(404);
      
      expect(response.body.error).toBe('Historical data not found for this currency');
    });
  });

  // Historical rate for specific date test
  describe('GET /api/history/:currency/:date', () => {
    it('should return historical rate for specific date', async () => {
      // First get historical data to find a valid date
      const historyResponse = await request(app)
        .get('/api/history/EUR')
        .expect(200);

      if (historyResponse.body.data.history.length > 0) {
        const date = historyResponse.body.data.history[0].date;
        
        const response = await request(app)
          .get(`/api/history/EUR/${date}`)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.currency).toBe('EUR');
        expect(response.body.data.date).toBe(date);
        expect(typeof response.body.data.rate).toBe('number');
      }
    });

    it('should return 404 for non-existent currency', async () => {
      const response = await request(app)
        .get('/api/history/NONEXISTENT/2023-01-01')
        .expect(404);
      
      expect(response.body.error).toBe('Historical data not found for this currency');
    });

    it('should return 404 for non-existent date', async () => {
      const response = await request(app)
        .get('/api/history/EUR/2000-01-01')
        .expect(404);
      
      expect(response.body.error).toBe('Historical rate not found for this date');
    });
  });
});