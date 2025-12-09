import * as path from 'path';
import { FileChange } from '../ChangesetManager';

export interface PaymentServiceConfig {
  name: string;
  port?: number;
  stripeApiVersion?: string;
  enableSubscriptions?: boolean;
  enableRefunds?: boolean;
  webhookSecret?: string;
}

export class PaymentServiceComponent {
  /**
   * Generate complete Stripe payment integration
   */
  generatePaymentService(config: PaymentServiceConfig, outputDir: string): FileChange[] {
    const changes: FileChange[] = [];
    const serviceName = 'payment-service';
    const serviceDir = path.join(outputDir, 'services', serviceName);

    // Main service file
    changes.push({
      path: path.join(serviceDir, 'src', 'index.ts'),
      type: 'create',
      content: this.generateIndexFile(config),
    });

    // Controllers
    changes.push({
      path: path.join(serviceDir, 'src', 'controllers', 'payment.controller.ts'),
      type: 'create',
      content: this.generatePaymentController(config),
    });

    changes.push({
      path: path.join(serviceDir, 'src', 'controllers', 'webhook.controller.ts'),
      type: 'create',
      content: this.generateWebhookController(config),
    });

    // Services
    changes.push({
      path: path.join(serviceDir, 'src', 'services', 'stripe.service.ts'),
      type: 'create',
      content: this.generateStripeService(config),
    });

    changes.push({
      path: path.join(serviceDir, 'src', 'services', 'payment.service.ts'),
      type: 'create',
      content: this.generatePaymentServiceFile(config),
    });

    if (config.enableSubscriptions) {
      changes.push({
        path: path.join(serviceDir, 'src', 'services', 'subscription.service.ts'),
        type: 'create',
        content: this.generateSubscriptionService(),
      });
    }

    // Repository
    changes.push({
      path: path.join(serviceDir, 'src', 'repositories', 'payment.repository.ts'),
      type: 'create',
      content: this.generatePaymentRepository(),
    });

    // Types
    changes.push({
      path: path.join(serviceDir, 'src', 'types', 'index.ts'),
      type: 'create',
      content: this.generateTypes(config),
    });

    // Validation schemas
    changes.push({
      path: path.join(serviceDir, 'src', 'validation', 'payment.schemas.ts'),
      type: 'create',
      content: this.generateValidationSchemas(config),
    });

    // Prisma schema
    changes.push({
      path: path.join(serviceDir, 'prisma', 'schema.prisma'),
      type: 'create',
      content: this.generatePrismaSchema(config),
    });

    // Configuration files
    changes.push({
      path: path.join(serviceDir, 'package.json'),
      type: 'create',
      content: this.generatePackageJson(config),
    });

    changes.push({
      path: path.join(serviceDir, '.env.example'),
      type: 'create',
      content: this.generateEnvExample(config),
    });

    changes.push({
      path: path.join(serviceDir, 'README.md'),
      type: 'create',
      content: this.generateReadme(config),
    });

    return changes;
  }

  private generateIndexFile(config: PaymentServiceConfig): string {
    const port = config.port || 3002;
    return `import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PaymentController } from './controllers/payment.controller';
import { WebhookController } from './controllers/webhook.controller';
import { errorHandler } from './middleware/error-handler';

const app: Application = express();
const PORT = process.env.PORT || ${port};

// Middleware
app.use(helmet());
app.use(cors());

// Webhook endpoint needs raw body
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'payment-service' });
});

// Routes
const paymentController = new PaymentController();
const webhookController = new WebhookController();

app.use('/api/payments', paymentController.router);
app.use('/api/webhooks', webhookController.router);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(\`Payment service running on port \${PORT}\`);
});

export default app;
`;
  }

  private generatePaymentController(config: PaymentServiceConfig): string {
    return `import { Router, Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
${config.enableSubscriptions ? "import { SubscriptionService } from '../services/subscription.service';" : ''}
import { validate } from '../middleware/validation';
import { PaymentSchemas } from '../validation/payment.schemas';
import { authMiddleware } from '../middleware/auth.middleware';

export class PaymentController {
  public router: Router;
  private paymentService: PaymentService;
${config.enableSubscriptions ? '  private subscriptionService: SubscriptionService;' : ''}

  constructor() {
    this.router = Router();
    this.paymentService = new PaymentService();
${config.enableSubscriptions ? '    this.subscriptionService = new SubscriptionService();' : ''}
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Create payment intent
    this.router.post(
      '/intent',
      authMiddleware,
      validate(PaymentSchemas.createIntent),
      this.createPaymentIntent.bind(this)
    );
    
    // Confirm payment
    this.router.post(
      '/confirm',
      authMiddleware,
      validate(PaymentSchemas.confirmPayment),
      this.confirmPayment.bind(this)
    );
    
    // Get payment by ID
    this.router.get('/:id', authMiddleware, this.getPayment.bind(this));
    
    // List user payments
    this.router.get('/', authMiddleware, this.listPayments.bind(this));
${config.enableRefunds ? `
    // Refund payment
    this.router.post(
      '/:id/refund',
      authMiddleware,
      validate(PaymentSchemas.refund),
      this.refundPayment.bind(this)
    );
` : ''}${config.enableSubscriptions ? `
    // Subscription endpoints
    this.router.post(
      '/subscriptions',
      authMiddleware,
      validate(PaymentSchemas.createSubscription),
      this.createSubscription.bind(this)
    );
    
    this.router.get('/subscriptions', authMiddleware, this.listSubscriptions.bind(this));
    
    this.router.post(
      '/subscriptions/:id/cancel',
      authMiddleware,
      this.cancelSubscription.bind(this)
    );
` : ''}
  }

  private async createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.paymentService.createPaymentIntent({
        ...req.body,
        userId: req.user!.userId,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  private async confirmPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.paymentService.confirmPayment(req.body.paymentIntentId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  private async getPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await this.paymentService.getPayment(req.params.id, req.user!.userId);
      res.json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }

  private async listPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await this.paymentService.listUserPayments(req.user!.userId);
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  }
${config.enableRefunds ? `
  private async refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.paymentService.refundPayment(
        req.params.id,
        req.user!.userId,
        req.body.amount,
        req.body.reason
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
` : ''}${config.enableSubscriptions ? `
  private async createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.subscriptionService.createSubscription({
        ...req.body,
        userId: req.user!.userId,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  private async listSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscriptions = await this.subscriptionService.listUserSubscriptions(req.user!.userId);
      res.json({ success: true, data: subscriptions });
    } catch (error) {
      next(error);
    }
  }

  private async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.subscriptionService.cancelSubscription(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Subscription cancelled' });
    } catch (error) {
      next(error);
    }
  }
` : ''}
}
`;
  }

  private generateWebhookController(config: PaymentServiceConfig): string {
    return `import { Router, Request, Response, NextFunction } from 'express';
import { StripeService } from '../services/stripe.service';
import { PaymentService } from '../services/payment.service';

export class WebhookController {
  public router: Router;
  private stripeService: StripeService;
  private paymentService: PaymentService;

  constructor() {
    this.router = Router();
    this.stripeService = new StripeService();
    this.paymentService = new PaymentService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/stripe', this.handleStripeWebhook.bind(this));
  }

  private async handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const event = this.stripeService.constructWebhookEvent(req.body, signature);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.paymentService.handlePaymentSuccess(event.data.object);
          break;
        
        case 'payment_intent.payment_failed':
          await this.paymentService.handlePaymentFailure(event.data.object);
          break;
${config.enableSubscriptions ? `
        case 'customer.subscription.created':
          await this.paymentService.handleSubscriptionCreated(event.data.object);
          break;
        
        case 'customer.subscription.updated':
          await this.paymentService.handleSubscriptionUpdated(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.paymentService.handleSubscriptionCancelled(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await this.paymentService.handleInvoicePaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.paymentService.handleInvoicePaymentFailed(event.data.object);
          break;
` : ''}${config.enableRefunds ? `
        case 'charge.refunded':
          await this.paymentService.handleRefund(event.data.object);
          break;
` : ''}
        default:
          console.log(\`Unhandled event type: \${event.type}\`);
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
}
`;
  }

  private generateStripeService(config: PaymentServiceConfig): string {
    return `import Stripe from 'stripe';
import { AppError } from '../middleware/error-handler';

export class StripeService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '${config.stripeApiVersion || '2023-10-16'}',
    });

    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
${config.enableRefunds ? `
  async createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<Stripe.Refund> {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });
  }
` : ''}${config.enableSubscriptions ? `
  async createCustomer(email: string, name?: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async createSubscription(customerId: string, priceId: string, metadata?: Record<string, string>): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  async retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }
` : ''}
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (error) {
      throw new AppError(400, 'Invalid webhook signature');
    }
  }
}
`;
  }

  private generatePaymentServiceFile(config: PaymentServiceConfig): string {
    return `import { StripeService } from './stripe.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { AppError } from '../middleware/error-handler';
import { Payment, PaymentStatus, CreatePaymentIntentInput } from '../types';

export class PaymentService {
  private stripeService: StripeService;
  private paymentRepository: PaymentRepository;

  constructor() {
    this.stripeService = new StripeService();
    this.paymentRepository = new PaymentRepository();
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<Payment> {
    const paymentIntent = await this.stripeService.createPaymentIntent(
      input.amount,
      input.currency || 'usd',
      {
        userId: input.userId,
        ...input.metadata,
      }
    );

    const payment = await this.paymentRepository.create({
      userId: input.userId,
      stripePaymentIntentId: paymentIntent.id,
      amount: input.amount,
      currency: input.currency || 'usd',
      status: 'pending',
      metadata: input.metadata,
    });

    return payment;
  }

  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    const paymentIntent = await this.stripeService.confirmPaymentIntent(paymentIntentId);
    
    const payment = await this.paymentRepository.findByStripePaymentIntentId(paymentIntentId);
    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    return this.paymentRepository.update(payment.id, {
      status: paymentIntent.status as PaymentStatus,
    });
  }

  async getPayment(paymentId: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(paymentId);
    
    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    if (payment.userId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    return payment;
  }

  async listUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.findByUserId(userId);
  }
${config.enableRefunds ? `
  async refundPayment(paymentId: string, userId: string, amount?: number, reason?: string): Promise<Payment> {
    const payment = await this.getPayment(paymentId, userId);

    if (payment.status !== 'succeeded') {
      throw new AppError(400, 'Can only refund successful payments');
    }

    await this.stripeService.createRefund(payment.stripePaymentIntentId, amount, reason);

    return this.paymentRepository.update(payment.id, {
      status: 'refunded',
    });
  }
` : ''}
  async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    const payment = await this.paymentRepository.findByStripePaymentIntentId(paymentIntent.id);
    if (payment) {
      await this.paymentRepository.update(payment.id, {
        status: 'succeeded',
      });
    }
  }

  async handlePaymentFailure(paymentIntent: any): Promise<void> {
    const payment = await this.paymentRepository.findByStripePaymentIntentId(paymentIntent.id);
    if (payment) {
      await this.paymentRepository.update(payment.id, {
        status: 'failed',
      });
    }
  }
${config.enableSubscriptions ? `
  async handleSubscriptionCreated(subscription: any): Promise<void> {
    // Handle subscription creation
    console.log('Subscription created:', subscription.id);
  }

  async handleSubscriptionUpdated(subscription: any): Promise<void> {
    // Handle subscription update
    console.log('Subscription updated:', subscription.id);
  }

  async handleSubscriptionCancelled(subscription: any): Promise<void> {
    // Handle subscription cancellation
    console.log('Subscription cancelled:', subscription.id);
  }

  async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    // Handle successful invoice payment
    console.log('Invoice payment succeeded:', invoice.id);
  }

  async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    // Handle failed invoice payment
    console.log('Invoice payment failed:', invoice.id);
  }
` : ''}${config.enableRefunds ? `
  async handleRefund(charge: any): Promise<void> {
    // Handle refund
    console.log('Refund processed:', charge.id);
  }
` : ''}
}
`;
  }

  private generateSubscriptionService(): string {
    return `import { StripeService } from './stripe.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { AppError } from '../middleware/error-handler';
import { Subscription, CreateSubscriptionInput } from '../types';

export class SubscriptionService {
  private stripeService: StripeService;
  private paymentRepository: PaymentRepository;

  constructor() {
    this.stripeService = new StripeService();
    this.paymentRepository = new PaymentRepository();
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
    // Create or get Stripe customer
    let customer = await this.paymentRepository.findCustomerByUserId(input.userId);
    
    if (!customer) {
      const stripeCustomer = await this.stripeService.createCustomer(
        input.email,
        input.name,
        { userId: input.userId }
      );
      customer = await this.paymentRepository.createCustomer({
        userId: input.userId,
        stripeCustomerId: stripeCustomer.id,
        email: input.email,
      });
    }

    // Create subscription
    const stripeSubscription = await this.stripeService.createSubscription(
      customer.stripeCustomerId,
      input.priceId,
      input.metadata
    );

    const subscription = await this.paymentRepository.createSubscription({
      userId: input.userId,
      stripeSubscriptionId: stripeSubscription.id,
      priceId: input.priceId,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    });

    return subscription;
  }

  async listUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.paymentRepository.findSubscriptionsByUserId(userId);
  }

  async cancelSubscription(subscriptionId: string, userId: string): Promise<void> {
    const subscription = await this.paymentRepository.findSubscriptionById(subscriptionId);
    
    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new AppError(403, 'Access denied');
    }

    await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);

    await this.paymentRepository.updateSubscription(subscriptionId, {
      status: 'canceled',
    });
  }
}
`;
  }

  private generatePaymentRepository(): string {
    return `import { PrismaClient } from '@prisma/client';
import { Payment, CreatePaymentInput, UpdatePaymentInput, Customer, Subscription } from '../types';

const prisma = new PrismaClient();

export class PaymentRepository {
  async create(data: CreatePaymentInput): Promise<Payment> {
    return prisma.payment.create({ data });
  }

  async findById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { id } });
  }

  async findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { stripePaymentIntentId } });
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdatePaymentInput): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data,
    });
  }

  async findCustomerByUserId(userId: string): Promise<Customer | null> {
    return prisma.customer.findUnique({ where: { userId } });
  }

  async createCustomer(data: { userId: string; stripeCustomerId: string; email: string }): Promise<Customer> {
    return prisma.customer.create({ data });
  }

  async createSubscription(data: any): Promise<Subscription> {
    return prisma.subscription.create({ data });
  }

  async findSubscriptionById(id: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({ where: { id } });
  }

  async findSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    return prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSubscription(id: string, data: any): Promise<Subscription> {
    return prisma.subscription.update({
      where: { id },
      data,
    });
  }
}
`;
  }

  private generateTypes(config: PaymentServiceConfig): string {
    return `export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'canceled';

export interface Payment {
  id: string;
  userId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  userId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentInput {
  status?: PaymentStatus;
  metadata?: Record<string, any>;
}

export interface CreatePaymentIntentInput {
  userId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
}
${config.enableSubscriptions ? `
export interface Customer {
  id: string;
  userId: string;
  stripeCustomerId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  priceId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionInput {
  userId: string;
  email: string;
  name?: string;
  priceId: string;
  metadata?: Record<string, any>;
}
` : ''}
`;
  }

  private generateValidationSchemas(config: PaymentServiceConfig): string {
    return `import { z } from 'zod';

export const PaymentSchemas = {
  createIntent: z.object({
    body: z.object({
      amount: z.number().positive('Amount must be positive'),
      currency: z.string().length(3).optional(),
      metadata: z.record(z.string()).optional(),
    }),
  }),

  confirmPayment: z.object({
    body: z.object({
      paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
    }),
  }),
${config.enableRefunds ? `
  refund: z.object({
    body: z.object({
      amount: z.number().positive().optional(),
      reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
    }),
  }),
` : ''}${config.enableSubscriptions ? `
  createSubscription: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      name: z.string().optional(),
      priceId: z.string().min(1, 'Price ID is required'),
      metadata: z.record(z.string()).optional(),
    }),
  }),
` : ''}
};
`;
  }

  private generatePrismaSchema(config: PaymentServiceConfig): string {
    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Payment {
  id                    String   @id @default(cuid())
  userId                String
  stripePaymentIntentId String   @unique
  amount                Int
  currency              String
  status                String
  metadata              Json?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
  @@map("payments")
}
${config.enableSubscriptions ? `
model Customer {
  id               String   @id @default(cuid())
  userId           String   @unique
  stripeCustomerId String   @unique
  email            String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@map("customers")
}

model Subscription {
  id                   String   @id @default(cuid())
  userId               String
  stripeSubscriptionId String   @unique
  priceId              String
  status               String
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
  @@map("subscriptions")
}
` : ''}
`;
  }

  private generatePackageJson(config: PaymentServiceConfig): string {
    return JSON.stringify({
      name: 'payment-service',
      version: '1.0.0',
      description: 'Stripe Payment Integration Service',
      main: 'dist/index.js',
      scripts: {
        dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        test: 'jest',
        'test:watch': 'jest --watch',
        'prisma:generate': 'prisma generate',
        'prisma:migrate': 'prisma migrate dev',
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        helmet: '^7.1.0',
        zod: '^3.22.4',
        '@prisma/client': '^5.7.1',
        stripe: '^14.10.0',
      },
      devDependencies: {
        '@types/express': '^4.17.21',
        '@types/cors': '^2.8.17',
        '@types/node': '^20.10.5',
        typescript: '^5.3.3',
        'ts-node-dev': '^2.0.0',
        jest: '^29.7.0',
        '@types/jest': '^29.5.11',
        'ts-jest': '^29.1.1',
        prisma: '^5.7.1',
      },
    }, null, 2);
  }

  private generateEnvExample(config: PaymentServiceConfig): string {
    return `PORT=${config.port || 3002}
NODE_ENV=development

DATABASE_URL=postgresql://user:password@localhost:5432/payment_db

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=${config.webhookSecret || 'whsec_your_webhook_secret'}
`;
  }

  private generateReadme(config: PaymentServiceConfig): string {
    return `# Payment Service

Stripe payment integration service with payment processing${config.enableSubscriptions ? ', subscription billing' : ''}${config.enableRefunds ? ', and refund functionality' : ''}.

## Features

- Payment intent creation and confirmation
- Webhook handling for payment events
${config.enableSubscriptions ? '- Subscription management\n' : ''}${config.enableRefunds ? '- Refund processing\n' : ''}- Secure payment tracking

## Installation

\`\`\`bash
npm install
\`\`\`

## Database Setup

\`\`\`bash
npx prisma migrate dev
npx prisma generate
\`\`\`

## Configuration

Copy \`.env.example\` to \`.env\` and configure:

- \`STRIPE_SECRET_KEY\`: Your Stripe secret key
- \`STRIPE_WEBHOOK_SECRET\`: Your Stripe webhook secret
- \`DATABASE_URL\`: PostgreSQL connection string

## Development

\`\`\`bash
npm run dev
\`\`\`

## Production

\`\`\`bash
npm run build
npm start
\`\`\`

## API Endpoints

### Payments
- \`POST /api/payments/intent\` - Create payment intent
- \`POST /api/payments/confirm\` - Confirm payment
- \`GET /api/payments/:id\` - Get payment by ID
- \`GET /api/payments\` - List user payments
${config.enableRefunds ? '- `POST /api/payments/:id/refund` - Refund payment\n' : ''}
${config.enableSubscriptions ? `### Subscriptions
- \`POST /api/payments/subscriptions\` - Create subscription
- \`GET /api/payments/subscriptions\` - List user subscriptions
- \`POST /api/payments/subscriptions/:id/cancel\` - Cancel subscription

` : ''}### Webhooks
- \`POST /api/webhooks/stripe\` - Stripe webhook endpoint

## Testing

\`\`\`bash
npm test
\`\`\`

## Stripe Webhook Setup

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Forward webhooks to local server:
   \`\`\`bash
   stripe listen --forward-to localhost:${config.port || 3002}/api/webhooks/stripe
   \`\`\`
3. Copy the webhook signing secret to your \`.env\` file
`;
  }
}
