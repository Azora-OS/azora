import request from 'supertest';
import app from '../../index';
import { pricingService } from '../../services/pricing.service';

// Mock the pricing service
jest.mock('../../services/pricing.service', () => ({
  pricingService: {
    getAllTiers: jest.fn(),
    getTierByName: jest.fn(),
    getStudentPricing: jest.fn(),
    getTierLimits: jest.fn(),
    canAccessCourse: jest.fn(),
    calculateStudentPrice: jest.fn(),
    createTier: jest.fn(),
    updateTier: jest.fn(),
  },
}));

describe('Pricing Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/pricing/tiers', () => {
    it('should return all pricing tiers', async () => {
      const mockTiers = [
        {
          id: '1',
          name: 'free',
          monthlyPrice: 0,
          studentDiscount: 0,
          features: [],
          limits: {
            coursesPerMonth: 3,
            aiQueriesPerMonth: 10,
            storageGB: 1,
            supportLevel: 'community',
          },
        },
        {
          id: '2',
          name: 'premium',
          monthlyPrice: 29.99,
          studentDiscount: 50,
          features: [],
          limits: {
            coursesPerMonth: 999999,
            aiQueriesPerMonth: 999999,
            storageGB: 10,
            supportLevel: 'priority',
          },
        },
      ];

      (pricingService.getAllTiers as jest.Mock).mockResolvedValue(mockTiers);

      const response = await request(app).get('/api/v1/pricing/tiers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('free');
    });
  });

  describe('GET /api/v1/pricing/tiers/:tier', () => {
    it('should return a specific pricing tier', async () => {
      const mockTier = {
        id: '2',
        name: 'premium',
        monthlyPrice: 29.99,
        studentDiscount: 50,
        features: [],
        limits: {
          coursesPerMonth: 999999,
          aiQueriesPerMonth: 999999,
          storageGB: 10,
          supportLevel: 'priority',
        },
      };

      (pricingService.getTierByName as jest.Mock).mockResolvedValue(mockTier);

      const response = await request(app).get('/api/v1/pricing/tiers/premium');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('premium');
      expect(response.body.data.monthlyPrice).toBe(29.99);
    });

    it('should return 404 if tier not found', async () => {
      (pricingService.getTierByName as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/v1/pricing/tiers/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/v1/pricing/student/:tier', () => {
    it('should return student pricing with discount', async () => {
      const mockPricing = {
        tier: 'premium',
        originalPrice: 29.99,
        studentDiscount: 50,
        studentPrice: 14.995,
        savings: 14.995,
        features: ['Feature 1', 'Feature 2'],
        limits: {
          coursesPerMonth: 999999,
          aiQueriesPerMonth: 999999,
          storageGB: 10,
          supportLevel: 'priority',
        },
      };

      (pricingService.getStudentPricing as jest.Mock).mockResolvedValue(mockPricing);

      const response = await request(app).get('/api/v1/pricing/student/premium');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.studentPrice).toBeCloseTo(14.995, 2);
      expect(response.body.data.savings).toBeCloseTo(14.995, 2);
    });
  });

  describe('GET /api/v1/pricing/limits/:tier', () => {
    it('should return tier limits', async () => {
      const mockLimits = {
        coursesPerMonth: 999999,
        aiQueriesPerMonth: 999999,
        storageGB: 10,
        supportLevel: 'priority',
      };

      (pricingService.getTierLimits as jest.Mock).mockResolvedValue(mockLimits);

      const response = await request(app).get('/api/v1/pricing/limits/premium');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.coursesPerMonth).toBe(999999);
      expect(response.body.data.storageGB).toBe(10);
    });

    it('should return 404 if tier not found', async () => {
      (pricingService.getTierLimits as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/v1/pricing/limits/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/pricing/check-access', () => {
    it('should allow premium student to access free course', async () => {
      (pricingService.canAccessCourse as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/v1/pricing/check-access')
        .send({
          studentTier: 'premium',
          courseTier: 'free',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.canAccess).toBe(true);
    });

    it('should prevent free student from accessing premium course', async () => {
      (pricingService.canAccessCourse as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/v1/pricing/check-access')
        .send({
          studentTier: 'free',
          courseTier: 'premium',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.canAccess).toBe(false);
    });

    it('should return 400 if required fields missing', async () => {
      const response = await request(app)
        .post('/api/v1/pricing/check-access')
        .send({
          studentTier: 'premium',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/pricing/calculate-price', () => {
    it('should calculate student price with discount', async () => {
      (pricingService.calculateStudentPrice as jest.Mock).mockReturnValue(14.995);

      const response = await request(app)
        .post('/api/v1/pricing/calculate-price')
        .send({
          monthlyPrice: 29.99,
          studentDiscount: 50,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.originalPrice).toBe(29.99);
      expect(response.body.data.studentDiscount).toBe(50);
      expect(response.body.data.studentPrice).toBeCloseTo(14.995, 2);
    });

    it('should return 400 if required fields missing', async () => {
      const response = await request(app)
        .post('/api/v1/pricing/calculate-price')
        .send({
          monthlyPrice: 29.99,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/pricing/tiers', () => {
    it('should create a new pricing tier', async () => {
      const newTier = {
        id: '3',
        name: 'enterprise',
        monthlyPrice: 299.99,
        studentDiscount: 20,
        features: [],
        limits: {
          coursesPerMonth: 999999,
          aiQueriesPerMonth: 999999,
          storageGB: 500,
          supportLevel: 'dedicated',
        },
      };

      (pricingService.createTier as jest.Mock).mockResolvedValue(newTier);

      const response = await request(app)
        .post('/api/v1/pricing/tiers')
        .send({
          name: 'enterprise',
          monthlyPrice: 299.99,
          studentDiscount: 20,
          features: [],
          coursesPerMonth: 999999,
          aiQueriesPerMonth: 999999,
          storageGB: 500,
          supportLevel: 'dedicated',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('enterprise');
    });
  });

  describe('PUT /api/v1/pricing/tiers/:tier', () => {
    it('should update an existing pricing tier', async () => {
      const updatedTier = {
        id: '2',
        name: 'premium',
        monthlyPrice: 39.99,
        studentDiscount: 40,
        features: [],
        limits: {
          coursesPerMonth: 999999,
          aiQueriesPerMonth: 999999,
          storageGB: 10,
          supportLevel: 'priority',
        },
      };

      (pricingService.updateTier as jest.Mock).mockResolvedValue(updatedTier);

      const response = await request(app)
        .put('/api/v1/pricing/tiers/premium')
        .send({
          monthlyPrice: 39.99,
          studentDiscount: 40,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.monthlyPrice).toBe(39.99);
    });
  });
});
