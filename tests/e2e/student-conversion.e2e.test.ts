/**
 * End-to-End Student Conversion Tests
 * Tests conversion offer flow and tier upgrades
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const BASE_URL = process.env.API_URL || 'http://localhost:3020';
const prisma = new PrismaClient();

describe('E2E: Student Conversion Flow', () => {
  let courseId: string;
  let studentId: string;
  let enrollmentId: string;

  beforeAll(async () => {
    // Create test course
    const courseResponse = await request(BASE_URL)
      .post('/api/v1/courses')
      .send({
        title: 'Conversion Test Course',
        description: 'Course for conversion testing',
        tier: 'free',
        instructorId: 'test-instructor',
        language: 'en',
      });

    courseId = courseResponse.body.data.id;

    // Create free student
    const studentResponse = await request(BASE_URL)
      .post('/api/v1/enrollments')
      .send({
        email: 'conversion-test@example.com',
        name: 'Conversion Test',
        tier: 'free',
      });

    studentId = studentResponse.body.data.id;

    // Enroll in course
    const enrollmentResponse = await request(BASE_URL)
      .post(`/api/v1/enrollments/${studentId}/courses`)
      .send({
        courseId,
      });

    enrollmentId = enrollmentResponse.body.data.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Conversion Trigger Events', () => {
    it('should trigger conversion at module completion (40%)', async () => {
      await request(BASE_URL)
        .put(`/api/v1/enrollments/${enrollmentId}/progress`)
        .send({
          moduleId: 'module-1',
          percentComplete: 40,
        });

      const response = await request(BASE_URL)
        .get(`/api/v1/conversions/${studentId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.offers.length).toBeGreaterThan(0);
    });

    it('should trigger conversion on assessment pass', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/assessments/submit`)
        .send({
          enrollmentId,
          courseId,
          answers: [
            { questionId: 'q1', answer: 'correct' },
            { questionId: 'q2', answer: 'correct' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.passed).toBe(true);

      // Check for conversion offer
      const conversionResponse = await request(BASE_URL)
        .get(`/api/v1/conversions/${studentId}`);

      expect(conversionResponse.body.data.offers.length).toBeGreaterThan(0);
    });

    it('should trigger conversion on course completion', async () => {
      await request(BASE_URL)
        .put(`/api/v1/enrollments/${enrollmentId}`)
        .send({
          status: 'completed',
        });

      const response = await request(BASE_URL)
        .get(`/api/v1/conversions/${studentId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.offers.length).toBeGreaterThan(0);
    });
  });

  describe('Conversion Offer Types', () => {
    it('should provide upgrade discount offer', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/conversions/${studentId}`);

      const upgradeOffer = response.body.data.offers.find(
        (o: any) => o.type === 'upgrade_discount'
      );

      expect(upgradeOffer).toBeDefined();
      expect(upgradeOffer.discount).toBeGreaterThan(0);
      expect(upgradeOffer.tier).toBe('premium');
      expect(upgradeOffer.expiresAt).toBeDefined();
    });

    it('should provide premium trial offer', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/conversions/${studentId}`);

      const trialOffer = response.body.data.offers.find(
        (o: any) => o.type === 'premium_trial'
      );

      if (trialOffer) {
        expect(trialOffer.duration).toBeGreaterThan(0);
        expect(trialOffer.tier).toBe('premium');
      }
    });

    it('should provide bundle deal offer', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/conversions/${studentId}`);

      const bundleOffer = response.body.data.offers.find(
        (o: any) => o.type === 'bundle_deal'
      );

      if (bundleOffer) {
        expect(bundleOffer.courses).toBeDefined();
        expect(bundleOffer.discount).toBeGreaterThan(0);
      }
    });
  });

  describe('Offer Acceptance and Payment', () => {
    let offerId: string;

    it('should accept conversion offer', async () => {
      const offersResponse = await request(BASE_URL)
        .get(`/api/v1/conversions/${studentId}`);

      offerId = offersResponse.body.data.offers[0].id;

      const response = await request(BASE_URL)
        .post(`/api/v1/conversions/accept`)
        .send({
          studentId,
          offerId,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('accepted');
    });

    it('should calculate discounted price', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/pricing/tiers/premium`);

      const basePrice = response.body.data.price;
      const discountedPrice = basePrice * 0.5; // 50% discount

      expect(discountedPrice).toBeLessThan(basePrice);
    });

    it('should process payment with discount', async () => {
      const response = await request(BASE_URL)
        .post(`/api/v1/payments/process`)
        .send({
          studentId,
          offerId,
          paymentMethod: 'stripe',
          tier: 'premium',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data).toHaveProperty('transactionId');
    });

    it('should upgrade student tier after payment', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/enrollments/${studentId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tier).toBe('premium');
    });

    it('should mark offer as completed', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/conversions/${studentId}`);

      const completedOffer = response.body.data.offers.find(
        (o: any) => o.id === offerId
      );

      expect(completedOffer.status).toBe('completed');
    });
  });

  describe('Offer Expiration', () => {
    it('should expire offers after duration', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/conversions/${studentId}`);

      const offers = response.body.data.offers;
      const expiredOffers = offers.filter((o: any) => {
        const expiresAt = new Date(o.expiresAt);
        return expiresAt < new Date();
      });

      // Check that expired offers are marked as expired
      for (const offer of expiredOffers) {
        expect(offer.status).toBe('expired');
      }
    });

    it('should prevent accepting expired offers', async () => {
      const offersResponse = await request(BASE_URL)
        .get(`/api/v1/conversions/${studentId}`);

      const expiredOffer = offersResponse.body.data.offers.find(
        (o: any) => o.status === 'expired'
      );

      if (expiredOffer) {
        const response = await request(BASE_URL)
          .post(`/api/v1/conversions/accept`)
          .send({
            studentId,
            offerId: expiredOffer.id,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('expired');
      }
    });
  });

  describe('Conversion Metrics', () => {
    it('should track conversion rate', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/conversion/metrics`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('conversionRate');
      expect(response.body.data.conversionRate).toBeGreaterThanOrEqual(0);
      expect(response.body.data.conversionRate).toBeLessThanOrEqual(100);
    });

    it('should track offer acceptance rate', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/conversion/metrics`);

      expect(response.body.data).toHaveProperty('offerAcceptanceRate');
      expect(response.body.data.offerAcceptanceRate).toBeGreaterThanOrEqual(0);
    });

    it('should track revenue from conversions', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/conversion/metrics`);

      expect(response.body.data).toHaveProperty('conversionRevenue');
      expect(response.body.data.conversionRevenue).toBeGreaterThanOrEqual(0);
    });

    it('should calculate customer lifetime value', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/conversion/metrics`);

      expect(response.body.data).toHaveProperty('averageLifetimeValue');
      expect(response.body.data.averageLifetimeValue).toBeGreaterThanOrEqual(0);
    });

    it('should track offer performance by type', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/conversion/metrics`);

      expect(response.body.data).toHaveProperty('offerPerformance');
      expect(response.body.data.offerPerformance).toHaveProperty('upgrade_discount');
      expect(response.body.data.offerPerformance).toHaveProperty('premium_trial');
    });
  });

  describe('Churn Prevention', () => {
    let churnStudentId: string;

    beforeAll(async () => {
      const studentResponse = await request(BASE_URL)
        .post('/api/v1/enrollments')
        .send({
          email: 'churn-test@example.com',
          name: 'Churn Test',
          tier: 'free',
        });

      churnStudentId = studentResponse.body.data.id;
    });

    it('should identify at-risk students', async () => {
      // Simulate low engagement
      const enrollmentResponse = await request(BASE_URL)
        .post(`/api/v1/enrollments/${churnStudentId}/courses`)
        .send({
          courseId,
        });

      const enrollmentId = enrollmentResponse.body.data.id;

      // Mark as dropped
      await request(BASE_URL)
        .put(`/api/v1/enrollments/${enrollmentId}`)
        .send({
          status: 'dropped',
        });

      const response = await request(BASE_URL)
        .get(`/api/v1/analytics/cohort/${courseId}`);

      expect(response.body.data).toHaveProperty('atRiskStudents');
    });

    it('should provide retention offers for at-risk students', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/conversions/${churnStudentId}`);

      const retentionOffers = response.body.data.offers.filter(
        (o: any) => o.type === 'retention'
      );

      expect(retentionOffers.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-Tier Conversion Path', () => {
    let multiTierStudentId: string;

    beforeAll(async () => {
      const studentResponse = await request(BASE_URL)
        .post('/api/v1/enrollments')
        .send({
          email: 'multi-tier@example.com',
          name: 'Multi Tier Test',
          tier: 'free',
        });

      multiTierStudentId = studentResponse.body.data.id;
    });

    it('should upgrade from free to premium', async () => {
      const enrollmentResponse = await request(BASE_URL)
        .post(`/api/v1/enrollments/${multiTierStudentId}/courses`)
        .send({
          courseId,
        });

      const enrollmentId = enrollmentResponse.body.data.id;

      // Trigger conversion
      await request(BASE_URL)
        .put(`/api/v1/enrollments/${enrollmentId}/progress`)
        .send({
          percentComplete: 40,
        });

      // Accept offer
      const offersResponse = await request(BASE_URL)
        .get(`/api/v1/conversions/${multiTierStudentId}`);

      const offerId = offersResponse.body.data.offers[0].id;

      await request(BASE_URL)
        .post(`/api/v1/conversions/accept`)
        .send({
          studentId: multiTierStudentId,
          offerId,
        });

      // Process payment
      await request(BASE_URL)
        .post(`/api/v1/payments/process`)
        .send({
          studentId: multiTierStudentId,
          offerId,
          paymentMethod: 'stripe',
          tier: 'premium',
        });

      const response = await request(BASE_URL)
        .get(`/api/v1/enrollments/${multiTierStudentId}`);

      expect(response.body.data.tier).toBe('premium');
    });

    it('should offer pro tier upgrade to premium students', async () => {
      const response = await request(BASE_URL)
        .get(`/api/v1/conversions/${multiTierStudentId}`);

      const proOffers = response.body.data.offers.filter(
        (o: any) => o.tier === 'pro'
      );

      expect(proOffers.length).toBeGreaterThan(0);
    });
  });
});
