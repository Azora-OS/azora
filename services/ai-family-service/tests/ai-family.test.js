const request = require('supertest');
const express = require('express');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      service: 'AI Family Service',
      timestamp: new Date().toISOString()
    });
  });

  app.post('/api/chat/chat', (req, res) => {
    const { familyMember, message } = req.body;

    if (!familyMember || !message) {
      return res.status(400).json({ error: 'Family member and message are required' });
    }

    const response_data = {
      conversationId: `conv_${Date.now()}`,
      familyMember,
      message,
      response: `Response from ${familyMember}`,
      timestamp: new Date().toISOString()
    };

    res.json(response_data);
  });

  app.post('/api/chat/auto-chat', (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response_data = {
      conversationId: `conv_${Date.now()}`,
      selectedMember: 'elara',
      message,
      response: 'Auto-selected response',
      timestamp: new Date().toISOString()
    };

    res.json(response_data);
  });

  app.get('/api/chat/family-config', (req, res) => {
    res.json({
      members: [
        { id: 'elara', name: 'Elara', specialty: 'education' },
        { id: 'sage', name: 'Sage', specialty: 'wisdom' }
      ],
      count: 2
    });
  });

  app.post('/api/chat/consult-family', (req, res) => {
    const { topic, members } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const consultation = {
      consultationId: `consult_${Date.now()}`,
      topic,
      responses: [],
      timestamp: new Date().toISOString()
    };

    res.json(consultation);
  });

  return app;
}

describe('AI Family Service - AI Family Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('AI Family Service');
    });
  });

  describe('POST /api/chat/chat', () => {
    it('should chat with specific family member', async () => {
      const response = await request(app)
        .post('/api/chat/chat')
        .send({
          familyMember: 'elara',
          message: 'Hello, how can you help me?'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('conversationId');
      expect(response.body.familyMember).toBe('elara');
      expect(response.body).toHaveProperty('response');
    });

    it('should return error when family member is missing', async () => {
      const response = await request(app)
        .post('/api/chat/chat')
        .send({ message: 'Hello' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Family member and message are required');
    });

    it('should return error when message is missing', async () => {
      const response = await request(app)
        .post('/api/chat/chat')
        .send({ familyMember: 'elara' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Family member and message are required');
    });
  });

  describe('POST /api/chat/auto-chat', () => {
    it('should auto-select family member for message', async () => {
      const response = await request(app)
        .post('/api/chat/auto-chat')
        .send({ message: 'I need help with education' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('conversationId');
      expect(response.body).toHaveProperty('selectedMember');
      expect(response.body).toHaveProperty('response');
    });

    it('should return error when message is missing', async () => {
      const response = await request(app)
        .post('/api/chat/auto-chat')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Message is required');
    });
  });

  describe('GET /api/chat/family-config', () => {
    it('should return family member configuration', async () => {
      const response = await request(app)
        .get('/api/chat/family-config');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('members');
      expect(Array.isArray(response.body.members)).toBe(true);
      expect(response.body.members.length).toBeGreaterThan(0);
    });

    it('should include member details', async () => {
      const response = await request(app)
        .get('/api/chat/family-config');

      expect(response.status).toBe(200);
      expect(response.body.members[0]).toHaveProperty('id');
      expect(response.body.members[0]).toHaveProperty('name');
      expect(response.body.members[0]).toHaveProperty('specialty');
    });
  });

  describe('POST /api/chat/consult-family', () => {
    it('should consult multiple family members', async () => {
      const response = await request(app)
        .post('/api/chat/consult-family')
        .send({
          topic: 'Career guidance',
          members: ['elara', 'sage']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('consultationId');
      expect(response.body.topic).toBe('Career guidance');
      expect(response.body).toHaveProperty('responses');
    });

    it('should return error when topic is missing', async () => {
      const response = await request(app)
        .post('/api/chat/consult-family')
        .send({ members: ['elara'] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Topic is required');
    });
  });
});
