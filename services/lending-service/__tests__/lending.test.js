const request = require('supertest');
const app = require('../index.js');

describe('Lending Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('lending-service');
    });
  });

  // Get all loan applications test
  describe('GET /api/loans', () => {
    it('should return all loan applications', async () => {
      const response = await request(app)
        .get('/api/loans')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific loan application test
  describe('GET /api/loans/:loanId', () => {
    it('should return specific loan application', async () => {
      const response = await request(app)
        .get('/api/loans/loan_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('loan_1');
    });

    it('should return 404 for non-existent loan', async () => {
      const response = await request(app)
        .get('/api/loans/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Loan not found');
    });
  });

  // Submit a new loan application test
  describe('POST /api/loans', () => {
    it('should submit a new loan application', async () => {
      const loanData = {
        applicantId: 'user_3',
        applicantName: 'Bob Johnson',
        amount: 15000,
        term: 24,
        purpose: 'Home improvement'
      };

      const response = await request(app)
        .post('/api/loans')
        .send(loanData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.applicantId).toBe('user_3');
      expect(response.body.data.amount).toBe(15000);
      expect(response.body.data.status).toBe('pending');
    });

    it('should return 400 for missing required fields', async () => {
      const loanData = {
        applicantId: 'user_3',
        applicantName: 'Bob Johnson',
        amount: 15000
        // Missing term
      };

      const response = await request(app)
        .post('/api/loans')
        .send(loanData)
        .expect(400);
      
      expect(response.body.error).toBe('Applicant ID, name, amount, and term are required');
    });
  });

  // Update loan application status test
  describe('PUT /api/loans/:loanId', () => {
    let loanId;

    beforeAll(async () => {
      // Create a loan application first
      const loanData = {
        applicantId: 'user_4',
        applicantName: 'Alice Brown',
        amount: 20000,
        term: 36
      };

      const response = await request(app)
        .post('/api/loans')
        .send(loanData);

      loanId = response.body.data.id;
    });

    it('should update loan application status', async () => {
      const updateData = {
        status: 'approved',
        interestRate: 4.5,
        notes: 'Approved based on excellent credit history'
      };

      const response = await request(app)
        .put(`/api/loans/${loanId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.interestRate).toBe(4.5);
    });

    it('should return 404 for non-existent loan', async () => {
      const updateData = {
        status: 'approved'
      };

      const response = await request(app)
        .put('/api/loans/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Loan not found');
    });
  });

  // Credit evaluation test
  describe('POST /api/credit-evaluation', () => {
    it('should evaluate applicant credit', async () => {
      const evaluationData = {
        applicantId: 'user_5',
        applicantName: 'Charlie Wilson',
        amount: 10000,
        income: 50000,
        employment: 'Software Engineer'
      };

      const response = await request(app)
        .post('/api/credit-evaluation')
        .send(evaluationData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.applicantId).toBe('user_5');
      expect(typeof response.body.data.creditScore).toBe('number');
      expect(typeof response.body.data.approved).toBe('boolean');
    });

    it('should return 400 for missing required fields', async () => {
      const evaluationData = {
        applicantId: 'user_5',
        applicantName: 'Charlie Wilson'
        // Missing amount
      };

      const response = await request(app)
        .post('/api/credit-evaluation')
        .send(evaluationData)
        .expect(400);
      
      expect(response.body.error).toBe('Applicant ID, name, and amount are required');
    });
  });

  // Get credit history for applicant test
  describe('GET /api/credit-evaluation/:applicantId', () => {
    let applicantId;

    beforeAll(async () => {
      // Create a credit evaluation first
      const evaluationData = {
        applicantId: 'user_6',
        applicantName: 'Diana Miller',
        amount: 15000
      };

      const response = await request(app)
        .post('/api/credit-evaluation')
        .send(evaluationData);

      applicantId = evaluationData.applicantId;
    });

    it('should return credit history for applicant', async () => {
      const response = await request(app)
        .get(`/api/credit-evaluation/${applicantId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(1);
    });

    it('should return 404 for applicant with no credit history', async () => {
      const response = await request(app)
        .get('/api/credit-evaluation/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('No credit evaluations found for this applicant');
    });
  });

  // Get applicant info test
  describe('GET /api/applicants/:applicantId', () => {
    let applicantId;

    beforeAll(async () => {
      // Create a credit evaluation first to register the applicant
      const evaluationData = {
        applicantId: 'user_7',
        applicantName: 'Ethan Davis',
        amount: 12000
      };

      await request(app)
        .post('/api/credit-evaluation')
        .send(evaluationData);

      applicantId = evaluationData.applicantId;
    });

    it('should return applicant info', async () => {
      const response = await request(app)
        .get(`/api/applicants/${applicantId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(applicantId);
      expect(response.body.data.name).toBe('Ethan Davis');
    });

    it('should return 404 for non-existent applicant', async () => {
      const response = await request(app)
        .get('/api/applicants/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Applicant not found');
    });
  });

  // Search loans by status test
  describe('GET /api/loans/search', () => {
    it('should search loans by status', async () => {
      const response = await request(app)
        .get('/api/loans/search?status=approved')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 400 for missing status parameter', async () => {
      const response = await request(app)
        .get('/api/loans/search')
        .expect(400);
      
      expect(response.body.error).toBe('Status parameter is required');
    });
  });
});