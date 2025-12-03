const request = require('supertest');
const { app } = require('../index');

describe('Azora Study Spaces Service', () => {
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('azora-studyspaces');
      expect(response.body.ubuntu).toBe('I study because we learn together');
    });
  });

  describe('Study Spaces API', () => {
    it('should create a new study space', async () => {
      const spaceData = {
        name: 'Test Study Space',
        description: 'A test study space for unit testing',
        privacy: 'PUBLIC',
        status: 'ACTIVE',
        creatorId: 'test-user-1'
      };

      const response = await request(app)
        .post('/api/spaces')
        .send(spaceData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Study space created successfully');
      expect(response.body.data).toHaveProperty('id');
    });

    it('should get all study spaces', async () => {
      const response = await request(app)
        .get('/api/spaces')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get study space by ID', async () => {
      // First create a space
      const spaceData = {
        name: 'Test Space for Get',
        description: 'Test space',
        privacy: 'PUBLIC',
        status: 'ACTIVE',
        creatorId: 'test-user-1'
      };

      const createResponse = await request(app)
        .post('/api/spaces')
        .send(spaceData);
      
      const spaceId = createResponse.body.data.id;

      // Then get it
      const response = await request(app)
        .get(`/api/spaces/${spaceId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(spaceId);
    });
  });

  describe('Study Sessions API', () => {
    let spaceId;

    beforeEach(async () => {
      // Create a test space
      const spaceData = {
        name: 'Session Test Space',
        description: 'Test space for sessions',
        privacy: 'PUBLIC',
        status: 'ACTIVE',
        creatorId: 'test-user-1'
      };

      const response = await request(app)
        .post('/api/spaces')
        .send(spaceData);
      
      spaceId = response.body.data.id;
    });

    it('should create a study session', async () => {
      const sessionData = {
        title: 'Test Study Session',
        description: 'A test session',
        scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        duration: 60,
        hostId: 'test-user-1'
      };

      const response = await request(app)
        .post(`/api/spaces/${spaceId}/sessions`)
        .send(sessionData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Study session created successfully');
    });

    it('should get study space sessions', async () => {
      const response = await request(app)
        .get(`/api/spaces/${spaceId}/sessions`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Study Resources API', () => {
    let spaceId;

    beforeEach(async () => {
      // Create a test space
      const spaceData = {
        name: 'Resource Test Space',
        description: 'Test space for resources',
        privacy: 'PUBLIC',
        status: 'ACTIVE',
        creatorId: 'test-user-1'
      };

      const response = await request(app)
        .post('/api/spaces')
        .send(spaceData);
      
      spaceId = response.body.data.id;
    });

    it('should upload a resource to study space', async () => {
      const resourceData = {
        title: 'Test Resource',
        description: 'A test resource',
        type: 'DOCUMENT',
        url: 'https://example.com/test.pdf',
        uploaderId: 'test-user-1'
      };

      const response = await request(app)
        .post(`/api/spaces/${spaceId}/resources`)
        .send(resourceData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Resource uploaded successfully');
    });

    it('should get study space resources', async () => {
      const response = await request(app)
        .get(`/api/spaces/${spaceId}/resources`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Study Tasks API', () => {
    let spaceId;

    beforeEach(async () => {
      // Create a test space
      const spaceData = {
        name: 'Task Test Space',
        description: 'Test space for tasks',
        privacy: 'PUBLIC',
        status: 'ACTIVE',
        creatorId: 'test-user-1'
      };

      const response = await request(app)
        .post('/api/spaces')
        .send(spaceData);
      
      spaceId = response.body.data.id;
    });

    it('should create a task in study space', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task',
        dueDate: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
        priority: 'MEDIUM',
        assignerId: 'test-user-1'
      };

      const response = await request(app)
        .post(`/api/spaces/${spaceId}/tasks`)
        .send(taskData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task created successfully');
    });

    it('should get study space tasks', async () => {
      const response = await request(app)
        .get(`/api/spaces/${spaceId}/tasks`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent study space', async () => {
      const response = await request(app)
        .get('/api/spaces/non-existent-id')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Study space not found');
    });

    it('should return 404 for non-existent endpoint', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
    });
  });
});

describe('Focus Tracking API', () => {
  it('should start a focus session', async () => {
    const focusData = {
      userId: 'test-user-1',
      spaceId: 'test-space-1',
      duration: 25
    };

    const response = await request(app)
      .post('/api/focus/start')
      .send(focusData)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Focus session started');
    expect(response.body.data).toHaveProperty('id');
  });

  it('should get focus stats for user', async () => {
    const response = await request(app)
      .get('/api/focus/stats/test-user-1')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('totalSessions');
    expect(response.body.data).toHaveProperty('completedSessions');
    expect(response.body.data).toHaveProperty('completionRate');
  });
});