import { PaymentServiceComponent, PaymentServiceConfig } from '../PaymentServiceComponent';

describe('PaymentServiceComponent', () => {
  let paymentComponent: PaymentServiceComponent;
  const outputDir = '/test/output';

  beforeEach(() => {
    paymentComponent = new PaymentServiceComponent();
  });

  describe('generatePaymentService', () => {
    it('should generate basic payment service files', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
        port: 3002,
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);

      expect(changes).toBeInstanceOf(Array);
      expect(changes.length).toBeGreaterThan(0);

      const filePaths = changes.map(c => c.path);
      expect(filePaths).toContain(expect.stringContaining('index.ts'));
      expect(filePaths).toContain(expect.stringContaining('payment.controller.ts'));
      expect(filePaths).toContain(expect.stringContaining('webhook.controller.ts'));
      expect(filePaths).toContain(expect.stringContaining('stripe.service.ts'));
      expect(filePaths).toContain(expect.stringContaining('payment.service.ts'));
      expect(filePaths).toContain(expect.stringContaining('payment.repository.ts'));
      expect(filePaths).toContain(expect.stringContaining('schema.prisma'));
    });

    it('should include subscription service when enabled', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
        enableSubscriptions: true,
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);
      const filePaths = changes.map(c => c.path);
      
      expect(filePaths).toContain(expect.stringContaining('subscription.service.ts'));
    });

    it('should generate Stripe integration', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);
      const stripeFile = changes.find(c => c.path.includes('stripe.service.ts'));

      expect(stripeFile).toBeDefined();
      expect(stripeFile!.content).toContain('createPaymentIntent');
      expect(stripeFile!.content).toContain('confirmPaymentIntent');
      expect(stripeFile!.content).toContain('constructWebhookEvent');
    });

    it('should include refund functionality when enabled', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
        enableRefunds: true,
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);
      const stripeFile = changes.find(c => c.path.includes('stripe.service.ts'));
      const controllerFile = changes.find(c => c.path.includes('payment.controller.ts'));

      expect(stripeFile!.content).toContain('createRefund');
      expect(controllerFile!.content).toContain('refundPayment');
    });

    it('should generate webhook handling', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
        enableSubscriptions: true,
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);
      const webhookFile = changes.find(c => c.path.includes('webhook.controller.ts'));

      expect(webhookFile).toBeDefined();
      expect(webhookFile!.content).toContain('handleStripeWebhook');
      expect(webhookFile!.content).toContain('payment_intent.succeeded');
      expect(webhookFile!.content).toContain('customer.subscription.created');
    });

    it('should generate payment processing logic', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);
      const serviceFile = changes.find(c => c.path.includes('payment.service.ts'));

      expect(serviceFile).toBeDefined();
      expect(serviceFile!.content).toContain('createPaymentIntent');
      expect(serviceFile!.content).toContain('confirmPayment');
      expect(serviceFile!.content).toContain('handlePaymentSuccess');
      expect(serviceFile!.content).toContain('handlePaymentFailure');
    });

    it('should generate subscription management when enabled', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
        enableSubscriptions: true,
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);
      const subscriptionFile = changes.find(c => c.path.includes('subscription.service.ts'));

      expect(subscriptionFile).toBeDefined();
      expect(subscriptionFile!.content).toContain('createSubscription');
      expect(subscriptionFile!.content).toContain('cancelSubscription');
      expect(subscriptionFile!.content).toContain('listUserSubscriptions');
    });

    it('should generate Prisma schema with Payment model', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);
      const schemaFile = changes.find(c => c.path.includes('schema.prisma'));

      expect(schemaFile).toBeDefined();
      expect(schemaFile!.content).toContain('model Payment');
      expect(schemaFile!.content).toContain('stripePaymentIntentId');
      expect(schemaFile!.content).toContain('amount');
      expect(schemaFile!.content).toContain('status');
    });

    it('should include subscription models when enabled', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
        enableSubscriptions: true,
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);
      const schemaFile = changes.find(c => c.path.includes('schema.prisma'));

      expect(schemaFile).toBeDefined();
      expect(schemaFile!.content).toContain('model Customer');
      expect(schemaFile!.content).toContain('model Subscription');
    });

    it('should generate validation schemas', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
        enableRefunds: true,
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);
      const validationFile = changes.find(c => c.path.includes('payment.schemas.ts'));

      expect(validationFile).toBeDefined();
      expect(validationFile!.content).toContain('createIntent');
      expect(validationFile!.content).toContain('confirmPayment');
      expect(validationFile!.content).toContain('refund');
    });

    it('should generate package.json with Stripe dependency', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);
      const packageFile = changes.find(c => c.path.includes('package.json'));

      expect(packageFile).toBeDefined();
      const packageJson = JSON.parse(packageFile!.content);
      
      expect(packageJson.dependencies).toHaveProperty('stripe');
      expect(packageJson.dependencies).toHaveProperty('@prisma/client');
    });

    it('should generate README with webhook setup instructions', () => {
      const config: PaymentServiceConfig = {
        name: 'test-payment',
        enableSubscriptions: true,
      };

      const changes = paymentComponent.generatePaymentService(config, outputDir);
      const readmeFile = changes.find(c => c.path.includes('README.md'));

      expect(readmeFile).toBeDefined();
      expect(readmeFile!.content).toContain('Payment Service');
      expect(readmeFile!.content).toContain('Stripe webhook');
      expect(readmeFile!.content).toContain('/api/payments/intent');
    });
  });
});
