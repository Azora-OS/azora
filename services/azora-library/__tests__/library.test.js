const request = require('supertest');
const app = require('../index.js');

describe('Azora Library Service', () => {
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
      expect(response.body.service).toBe('Azora Library');
    });
  });

  // AI Librarian info test
  describe('GET /ai-librarian', () => {
    it('should return AI librarian information', async () => {
      const response = await request(app)
        .get('/ai-librarian')
        .expect(200);

      expect(response.body.name).toBe('Libra');
      expect(response.body.capabilities).toEqual(
        expect.arrayContaining(['search', 'recommend', 'summarize', 'categorize'])
      );
    });
  });

  // Get all books test
  describe('GET /books', () => {
    it('should return a list of books', async () => {
      const response = await request(app)
        .get('/books')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
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
        email: 'test@example.com',
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

  // Education system integration tests
  describe('Education System Integration', () => {
    let adminToken;
    let testBookId;
    let testCourseId = 'course-123';

    // Register and login as admin for testing
    beforeAll(async () => {
      // Register admin user
      const adminData = {
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'adminpassword123'
      };

      await request(app)
        .post('/users/register')
        .send(adminData);

      // Login to get token
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'admin@example.com',
          password: 'adminpassword123'
        });

      adminToken = response.body.token;
    });

    // Create a test book
    beforeAll(async () => {
      const bookData = {
        title: 'Test Book for Education Integration',
        author: 'Test Author',
        description: 'A test book for education integration',
        category: 'Education',
        price: 0
      };

      const response = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bookData);

      testBookId = response.body.data.id;
    });

    // Test assigning a book to a course
    it('should assign a book to a course', async () => {
      const response = await request(app)
        .post(`/courses/${testCourseId}/books/${testBookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ required: true })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courseId).toBe(testCourseId);
      expect(response.body.data.bookId).toBe(testBookId);
      expect(response.body.data.required).toBe(true);
    });

    // Test getting books for a course
    it('should get all books for a course', async () => {
      const response = await request(app)
        .get(`/courses/${testCourseId}/books`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].id).toBe(testBookId);
    });

    // Test getting courses for a book
    it('should get all courses that use a specific book', async () => {
      const response = await request(app)
        .get(`/books/${testBookId}/courses`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookId).toBe(testBookId);
      expect(Array.isArray(response.body.data.courseIds)).toBe(true);
      expect(response.body.data.courseIds).toContain(testCourseId);
    });

    // Test student recommendations
    it('should get book recommendations for a student', async () => {
      const response = await request(app)
        .get('/students/student-123/recommendations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.aiLibrarian).toBeDefined();
    });

    // Test removing a book from a course
    it('should remove a book from a course', async () => {
      const response = await request(app)
        .delete(`/courses/${testCourseId}/books/${testBookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Book removed from course successfully');
    });
  });
});
