const request = require('supertest');
const app = require('../index.js');

describe('AZR Token Service', () => {
  // Close the server after all tests
  afterAll((done) => {
    // Close any open connections
    done();
  });

  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('AZR Token Service');
    });
  });

  // User registration test
  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(userData.username);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
    });
  });

  // User login test
  describe('POST /users/login', () => {
    it('should login an existing user', async () => {
      const loginData = {
        email: 'alice@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(loginData.email);
      expect(response.body.token).toBeDefined();
    });
  });

  // Get balance test
  describe('GET /balance/:userId', () => {
    let userToken;

    beforeAll(async () => {
      // Login to get token
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'alice@example.com',
          password: 'password123'
        });

      userToken = response.body.token;
    });

    it('should get user balance', async () => {
      const response = await request(app)
        .get('/balance/user-1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe('user-1');
      expect(response.body.data.balance).toBeGreaterThanOrEqual(0);
    });
  });

  // Token transfer test
  describe('POST /transfer', () => {
    let userToken;

    beforeAll(async () => {
      // Login to get token
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'alice@example.com',
          password: 'password123'
        });

      userToken = response.body.token;
    });

    it('should transfer tokens between users', async () => {
      const transferData = {
        toUserId: 'user-2',
        amount: 10
      };

      const response = await request(app)
        .post('/transfer')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transferData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fromUserId).toBe('user-1');
      expect(response.body.data.toUserId).toBe('user-2');
      expect(response.body.data.amount).toBe(10);
    });
  });
});
