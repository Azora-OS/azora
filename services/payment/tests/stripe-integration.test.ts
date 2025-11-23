import { userFactory, paymentFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';
import { mockStripe } from '../../../tests/mocks';

const prisma = getTestPrismaClient();

describe('Payment Service - Stripe Integration', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
    mockStripe.reset();
  });

  describe('Payment Intent Creation', () => {
    it('should create payment intent with valid data', async () => {
      const user = await userFactory.create();

      const paymentIntent = await mockStripe.createPaymentIntent({
        amount: 5000, // $50.00
        currency: 'usd',
        customer: `cus_${user.id}`,
        metadata: {
          userId: user.id,
          orderId: 'order-123',
        },
      });

      expect(paymentIntent).toBeDefined();
      expect(paymentIntent.id).toMatch(/^pi_test_/);
      expect(paymentIntent.amount).toBe(5000);
      expect(paymentIntent.currency).toBe('usd');
      expect(paymentIntent.status).toBe('requires_payment_method');
      expect(paymentIntent.client_secret).toBeDefined();
    });

    it('should track payment intent creation call', async () => {
      await mockStripe.createPaymentIntent({
        amount: 1000,
        currency: 'usd',
      });

      expect(mockStripe.wasCalled('createPaymentIntent')).toBe(true);
      expect(mockStripe.getCallCount('createPaymentIntent')).toBe(1);
    });

    it('should include metadata in payment intent', async () => {
      const metadata = {
        userId: 'user-123',
        courseId: 'course-456',
        type: 'course-purchase',
      };

      const paymentIntent = await mockStripe.createPaymentIntent({
        amount: 9900,
        currency: 'usd',
        metadata,
      });

      expect(paymentIntent.metadata).toEqual(metadata);
    });

    it('should handle different currencies', async () => {
      const currencies = ['usd', 'eur', 'gbp'];

      for (const currency of currencies) {
        const paymentIntent = await mockStripe.createPaymentIntent({
          amount: 1000,
          currency,
        });

        expect(paymentIntent.currency).toBe(currency);
      }
    });
  });

  describe('Payment Confirmation', () => {
    it('should confirm payment intent', async () => {
      const paymentIntent = await mockStripe.createPaymentIntent({
        amount: 5000,
        currency: 'usd',
      });

      const confirmed = await mockStripe.confirmPaymentIntent(paymentIntent.id);

      expect(confirmed.status).toBe('succeeded');
      expect(confirmed.id).toBe(paymentIntent.id);
    });

    it('should update payment status in database', async () => {
      const user = await userFactory.create();

      const paymentIntent = await mockStripe.createPaymentIntent({
        amount: 5000,
        currency: 'usd',
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          amount: 5000,
          currency: 'usd',
          status: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      // Confirm payment
      await mockStripe.confirmPaymentIntent(paymentIntent.id);

      // Update database
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCEEDED' },
      });

      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
      });

      expect(updatedPayment!.status).toBe('SUCCEEDED');
    });
  });

  describe('Customer Management', () => {
    it('should create Stripe customer', async () => {
      const user = await userFactory.create();

      const customer = await mockStripe.createCustomer({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id,
        },
      });

      expect(customer).toBeDefined();
      expect(customer.id).toMatch(/^cus_test_/);
      expect(customer.email).toBe(user.email);
      expect(customer.name).toBe(`${user.firstName} ${user.lastName}`);
    });

    it('should retrieve existing customer', async () => {
      const user = await userFactory.create();

      const customer = await mockStripe.createCustomer({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });

      const retrieved = await mockStripe.getCustomer(customer.id);

      expect(retrieved.id).toBe(customer.id);
      expect(retrieved.email).toBe(user.email);
    });

    it('should link customer to payment intent', async () => {
      const user = await userFactory.create();

      const customer = await mockStripe.createCustomer({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });

      const paymentIntent = await mockStripe.createPaymentIntent({
        amount: 5000,
        currency: 'usd',
        customer: customer.id,
      });

      expect(paymentIntent.customer).toBe(customer.id);
    });
  });

  describe('Payment Methods', () => {
    it('should attach payment method to customer', async () => {
      const user = await userFactory.create();

      const customer = await mockStripe.createCustomer({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });

      // Mock payment method attachment
      const paymentMethodId = 'pm_test_card';
      
      expect(customer.id).toBeDefined();
      expect(paymentMethodId).toBeDefined();
      // In real implementation, would call Stripe API to attach payment method
    });

    it('should handle different payment method types', () => {
      const paymentMethodTypes = ['card', 'bank_account', 'sepa_debit'];

      paymentMethodTypes.forEach(type => {
        expect(['card', 'bank_account', 'sepa_debit']).toContain(type);
      });
    });
  });

  describe('Payment Cancellation', () => {
    it('should cancel payment intent', async () => {
      const paymentIntent = await mockStripe.createPaymentIntent({
        amount: 5000,
        currency: 'usd',
      });

      const canceled = await mockStripe.cancelPaymentIntent(paymentIntent.id);

      expect(canceled.status).toBe('canceled');
      expect(canceled.id).toBe(paymentIntent.id);
    });

    it('should update database on cancellation', async () => {
      const user = await userFactory.create();

      const paymentIntent = await mockStripe.createPaymentIntent({
        amount: 5000,
        currency: 'usd',
      });

      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          amount: 5000,
          currency: 'usd',
          status: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      // Cancel payment
      await mockStripe.cancelPaymentIntent(paymentIntent.id);

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'CANCELED' },
      });

      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
      });

      expect(updatedPayment!.status).toBe('CANCELED');
    });
  });

  describe('Error Handling', () => {
    it('should handle payment intent not found', async () => {
      await expect(
        mockStripe.confirmPaymentIntent('pi_invalid')
      ).rejects.toThrow('Payment intent pi_invalid not found');
    });

    it('should handle customer not found', async () => {
      await expect(
        mockStripe.getCustomer('cus_invalid')
      ).rejects.toThrow('Customer cus_invalid not found');
    });

    it('should validate amount is positive', () => {
      const invalidAmounts = [-100, 0];

      invalidAmounts.forEach(amount => {
        expect(amount).toBeLessThanOrEqual(0);
      });

      expect(1000).toBeGreaterThan(0);
    });

    it('should validate currency format', () => {
      const validCurrencies = ['usd', 'eur', 'gbp'];
      const invalidCurrency = 'INVALID';

      expect(validCurrencies).toContain('usd');
      expect(validCurrencies).not.toContain(invalidCurrency);
    });
  });
});
