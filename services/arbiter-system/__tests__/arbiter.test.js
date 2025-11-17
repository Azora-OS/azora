const request = require('supertest');
const app = require('../index.js');

describe('Arbiter System', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('arbiter-system');
    });
  });

  // Get all disputes test
  describe('GET /api/disputes', () => {
    it('should return all disputes', async () => {
      const response = await request(app)
        .get('/api/disputes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific dispute test
  describe('GET /api/disputes/:disputeId', () => {
    it('should return specific dispute data', async () => {
      const response = await request(app)
        .get('/api/disputes/dispute_1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('dispute_1');
    });

    it('should return 404 for non-existent dispute', async () => {
      const response = await request(app)
        .get('/api/disputes/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Dispute not found');
    });
  });

  // Submit a new dispute test
  describe('POST /api/disputes', () => {
    it('should submit a new dispute', async () => {
      const disputeData = {
        parties: ['party_x', 'party_y'],
        type: 'contractual',
        description: 'Contract terms disagreement'
      };

      const response = await request(app)
        .post('/api/disputes')
        .send(disputeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.parties).toEqual(['party_x', 'party_y']);
      expect(response.body.data.type).toBe('contractual');
    });

    it('should return 400 for missing parties', async () => {
      const disputeData = {
        type: 'contractual',
        description: 'Contract terms disagreement'
      };

      const response = await request(app)
        .post('/api/disputes')
        .send(disputeData)
        .expect(400);

      expect(response.body.error).toBe('At least two parties are required');
    });

    it('should return 400 for missing type or description', async () => {
      const disputeData = {
        parties: ['party_x', 'party_y'],
        description: 'Contract terms disagreement'
      };

      const response = await request(app)
        .post('/api/disputes')
        .send(disputeData)
        .expect(400);

      expect(response.body.error).toBe('Type and description are required');
    });
  });

  // Update dispute status test
  describe('PUT /api/disputes/:disputeId', () => {
    let disputeId;

    beforeAll(async () => {
      // Create a dispute first
      const disputeData = {
        parties: ['party_m', 'party_n'],
        type: 'technical',
        description: 'API integration issue'
      };

      const response = await request(app)
        .post('/api/disputes')
        .send(disputeData);

      disputeId = response.body.data.id;
    });

    it('should update dispute status', async () => {
      const updateData = {
        status: 'in_progress',
        resolution: 'Parties are negotiating'
      };

      const response = await request(app)
        .put(`/api/disputes/${disputeId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data.resolution).toBe('Parties are negotiating');
    });

    it('should return 404 for non-existent dispute', async () => {
      const updateData = {
        status: 'resolved'
      };

      const response = await request(app)
        .put('/api/disputes/non-existent')
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Dispute not found');
    });
  });

  // Schedule mediation session test
  describe('POST /api/mediation', () => {
    let disputeId;

    beforeAll(async () => {
      // Create a dispute first
      const disputeData = {
        parties: ['party_p', 'party_q'],
        type: 'financial',
        description: 'Payment dispute'
      };

      const response = await request(app)
        .post('/api/disputes')
        .send(disputeData);

      disputeId = response.body.data.id;
    });

    it('should schedule a mediation session', async () => {
      const mediationData = {
        disputeId: disputeId,
        mediator: 'mediator_123'
      };

      const response = await request(app)
        .post('/api/mediation')
        .send(mediationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.disputeId).toBe(disputeId);
      expect(response.body.data.mediator).toBe('mediator_123');
      expect(response.body.data.status).toBe('scheduled');
    });

    it('should return 400 for missing dispute ID or mediator', async () => {
      const mediationData = {
        mediator: 'mediator_123'
      };

      const response = await request(app)
        .post('/api/mediation')
        .send(mediationData)
        .expect(400);

      expect(response.body.error).toBe('Dispute ID and mediator are required');
    });

    it('should return 404 for non-existent dispute', async () => {
      const mediationData = {
        disputeId: 'non-existent',
        mediator: 'mediator_123'
      };

      const response = await request(app)
        .post('/api/mediation')
        .send(mediationData)
        .expect(404);

      expect(response.body.error).toBe('Dispute not found');
    });
  });

  // Get all mediation sessions test
  describe('GET /api/mediation', () => {
    it('should return all mediation sessions', async () => {
      const response = await request(app)
        .get('/api/mediation')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific mediation session test
  describe('GET /api/mediation/:sessionId', () => {
    let sessionId;

    beforeAll(async () => {
      // Create a dispute first
      const disputeData = {
        parties: ['party_r', 'party_s'],
        type: 'service',
        description: 'Service quality issue'
      };

      const disputeResponse = await request(app)
        .post('/api/disputes')
        .send(disputeData);

      const disputeId = disputeResponse.body.data.id;

      // Schedule a mediation session
      const mediationData = {
        disputeId: disputeId,
        mediator: 'mediator_456'
      };

      const mediationResponse = await request(app)
        .post('/api/mediation')
        .send(mediationData);

      sessionId = mediationResponse.body.data.id;
    });

    it('should return specific mediation session', async () => {
      const response = await request(app)
        .get(`/api/mediation/${sessionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(sessionId);
    });

    it('should return 404 for non-existent mediation session', async () => {
      const response = await request(app)
        .get('/api/mediation/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Mediation session not found');
    });
  });

  // Get all arbitrators test
  describe('GET /api/arbitrators', () => {
    it('should return all arbitrators', async () => {
      const response = await request(app)
        .get('/api/arbitrators')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Register a new arbitrator test
  describe('POST /api/arbitrators', () => {
    it('should register a new arbitrator', async () => {
      const arbitratorData = {
        name: 'John Doe',
        expertise: ['contract_law', 'commercial_law'],
        credentials: ['LLB', 'LLM']
      };

      const response = await request(app)
        .post('/api/arbitrators')
        .send(arbitratorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.expertise).toEqual(['contract_law', 'commercial_law']);
    });

    it('should return 400 for missing name or expertise', async () => {
      const arbitratorData = {
        expertise: ['contract_law']
      };

      const response = await request(app)
        .post('/api/arbitrators')
        .send(arbitratorData)
        .expect(400);

      expect(response.body.error).toBe('Name and expertise are required');
    });
  });
});
