import request from 'supertest';
import app from '../index';

describe('Marketplace Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('marketplace-service');
    });
  });

  // Get all courses test
  describe('GET /api/courses', () => {
    it('should return all courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific course test
  describe('GET /api/courses/:courseId', () => {
    it('should return specific course', async () => {
      const response = await request(app)
        .get('/api/courses/course_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('course_1');
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/courses/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Course not found');
    });
  });

  // Create a new course test
  describe('POST /api/courses', () => {
    it('should create a new course', async () => {
      const courseData = {
        title: 'New Course',
        description: 'A new course for testing',
        instructor: 'Test Instructor',
        price: 49.99
      };

      const response = await request(app)
        .post('/api/courses')
        .send(courseData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Course');
      expect(response.body.data.description).toBe('A new course for testing');
      expect(response.body.data.instructor).toBe('Test Instructor');
    });

    it('should return 400 for missing required fields', async () => {
      const courseData = {
        title: 'New Course'
        // Missing description and instructor
      };

      const response = await request(app)
        .post('/api/courses')
        .send(courseData)
        .expect(400);
      
      expect(response.body.error).toBe('Title, description, and instructor are required');
    });
  });

  // Update course test
  describe('PUT /api/courses/:courseId', () => {
    let courseId: string;

    beforeAll(async () => {
      // Create a course first
      const courseData = {
        title: 'Test Course',
        description: 'Test course for updating',
        instructor: 'Test Instructor'
      };

      const response = await request(app)
        .post('/api/courses')
        .send(courseData);

      courseId = response.body.data.id;
    });

    it('should update course', async () => {
      const updateData = {
        title: 'Updated Course',
        price: 79.99
      };

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Course');
      expect(response.body.data.price).toBe(79.99);
    });

    it('should return 404 for non-existent course', async () => {
      const updateData = {
        title: 'Updated Course'
      };

      const response = await request(app)
        .put('/api/courses/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Course not found');
    });
  });

  // Get all reviews test
  describe('GET /api/reviews', () => {
    it('should return all reviews', async () => {
      const response = await request(app)
        .get('/api/reviews')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get reviews for a specific course test
  describe('GET /api/courses/:courseId/reviews', () => {
    it('should return reviews for a specific course', async () => {
      const response = await request(app)
        .get('/api/courses/course_1/reviews')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Create a new review test
  describe('POST /api/reviews', () => {
    it('should create a new review', async () => {
      const reviewData = {
        courseId: 'course_1',
        userId: 'user_456',
        rating: 4,
        comment: 'Good course, but could be improved'
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.courseId).toBe('course_1');
      expect(response.body.data.userId).toBe('user_456');
      expect(response.body.data.rating).toBe(4);
    });

    it('should return 400 for missing required fields', async () => {
      const reviewData = {
        courseId: 'course_1'
        // Missing userId and rating
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(400);
      
      expect(response.body.error).toBe('Course ID, user ID, and rating are required');
    });
  });
});