import { ServiceGenerator } from '../../src/main/services/ServiceGenerator';
import { CodeExecutor } from '../../src/main/services/CodeExecutor';
import { VerificationPipeline } from '../../src/main/services/VerificationPipeline';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Integration tests for end-to-end service generation
 * Tests the complete flow from specification to working service
 */
describe('Service Generation End-to-End', () => {
  let serviceGenerator: ServiceGenerator;
  let codeExecutor: CodeExecutor;
  let verificationPipeline: VerificationPipeline;
  const testProjectPath = '/test/project';
  const outputPath = path.join(testProjectPath, 'src/services');

  beforeEach(() => {
    serviceGenerator = new ServiceGenerator(testProjectPath);
    codeExecutor = new CodeExecutor();
    verificationPipeline = new VerificationPipeline(testProjectPath);
  });

  afterEach(async () => {
    // Cleanup generated files
    if (fs.existsSync(outputPath)) {
      await fs.promises.rm(outputPath, { recursive: true, force: true });
    }
  });

  describe('Auth Service Generation', () => {
    it('should generate complete auth service with all files', async () => {
      const spec = {
        name: 'AuthService',
        type: 'auth',
        features: ['jwt', 'registration', 'login', 'password-reset'],
        database: 'postgresql',
        framework: 'express',
      };

      const result = await serviceGenerator.generateService(spec);

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);

      // Verify all expected files are generated
      const expectedFiles = [
        'auth-service.ts',
        'auth-controller.ts',
        'auth-middleware.ts',
        'user-model.ts',
        'auth-routes.ts',
      ];

      for (const file of expectedFiles) {
        const filePath = path.join(outputPath, file);
        expect(result.files).toContain(filePath);
      }
    });

    it('should generate working JWT authentication', async () => {
      const spec = {
        name: 'AuthService',
        type: 'auth',
        features: ['jwt'],
      };

      const result = await serviceGenerator.generateService(spec);
      const authFile = result.files.find(f => f.includes('auth-service.ts'));

      expect(authFile).toBeDefined();

      // Verify JWT functionality is present
      const content = await fs.promises.readFile(authFile!, 'utf-8');
      expect(content).toContain('jsonwebtoken');
      expect(content).toContain('sign');
      expect(content).toContain('verify');
    });

    it('should generate password hashing with bcrypt', async () => {
      const spec = {
        name: 'AuthService',
        type: 'auth',
        features: ['registration'],
      };

      const result = await serviceGenerator.generateService(spec);
      const userModelFile = result.files.find(f => f.includes('user-model.ts'));

      expect(userModelFile).toBeDefined();

      const content = await fs.promises.readFile(userModelFile!, 'utf-8');
      expect(content).toContain('bcrypt');
      expect(content).toContain('hash');
    });
  });

  describe('Payment Service Generation', () => {
    it('should generate Stripe integration', async () => {
      const spec = {
        name: 'PaymentService',
        type: 'payment',
        provider: 'stripe',
        features: ['payment-processing', 'webhooks', 'refunds'],
      };

      const result = await serviceGenerator.generateService(spec);

      expect(result.success).toBe(true);

      const paymentFile = result.files.find(f => f.includes('payment-service.ts'));
      const content = await fs.promises.readFile(paymentFile!, 'utf-8');

      expect(content).toContain('stripe');
      expect(content).toContain('paymentIntents');
      expect(content).toContain('webhooks');
      expect(content).toContain('refunds');
    });

    it('should generate webhook handlers', async () => {
      const spec = {
        name: 'PaymentService',
        type: 'payment',
        provider: 'stripe',
        features: ['webhooks'],
      };

      const result = await serviceGenerator.generateService(spec);
      const webhookFile = result.files.find(f => f.includes('webhook'));

      expect(webhookFile).toBeDefined();

      const content = await fs.promises.readFile(webhookFile!, 'utf-8');
      expect(content).toContain('constructEvent');
      expect(content).toContain('payment_intent.succeeded');
    });
  });

  describe('Email Service Generation', () => {
    it('should generate email service with templates', async () => {
      const spec = {
        name: 'EmailService',
        type: 'email',
        provider: 'sendgrid',
        features: ['transactional', 'templates'],
      };

      const result = await serviceGenerator.generateService(spec);

      expect(result.success).toBe(true);

      const emailFile = result.files.find(f => f.includes('email-service.ts'));
      const content = await fs.promises.readFile(emailFile!, 'utf-8');

      expect(content).toContain('sendgrid');
      expect(content).toContain('send');
      expect(content).toContain('template');
    });
  });

  describe('Storage Service Generation', () => {
    it('should generate S3 storage service', async () => {
      const spec = {
        name: 'StorageService',
        type: 'storage',
        provider: 's3',
        features: ['upload', 'download', 'signed-urls'],
      };

      const result = await serviceGenerator.generateService(spec);

      expect(result.success).toBe(true);

      const storageFile = result.files.find(f => f.includes('storage-service.ts'));
      const content = await fs.promises.readFile(storageFile!, 'utf-8');

      expect(content).toContain('aws-sdk');
      expect(content).toContain('S3');
      expect(content).toContain('upload');
      expect(content).toContain('getSignedUrl');
    });
  });

  describe('Service Integration', () => {
    it('should generate services that work together', async () => {
      // Generate auth service
      const authSpec = {
        name: 'AuthService',
        type: 'auth',
        features: ['jwt'],
      };
      const authResult = await serviceGenerator.generateService(authSpec);

      // Generate protected API service
      const apiSpec = {
        name: 'UserAPI',
        type: 'api',
        authentication: 'jwt',
        authService: 'AuthService',
      };
      const apiResult = await serviceGenerator.generateService(apiSpec);

      expect(authResult.success).toBe(true);
      expect(apiResult.success).toBe(true);

      // Verify API uses auth middleware
      const apiFile = apiResult.files.find(f => f.includes('user-api.ts'));
      const content = await fs.promises.readFile(apiFile!, 'utf-8');

      expect(content).toContain('authMiddleware');
      expect(content).toContain('AuthService');
    });

    it('should generate database models for services', async () => {
      const spec = {
        name: 'UserService',
        type: 'crud',
        database: 'postgresql',
        model: {
          name: 'User',
          fields: [
            { name: 'email', type: 'string', unique: true },
            { name: 'name', type: 'string' },
            { name: 'age', type: 'number', optional: true },
          ],
        },
      };

      const result = await serviceGenerator.generateService(spec);

      expect(result.success).toBe(true);

      // Verify Prisma schema is generated
      const schemaFile = result.files.find(f => f.includes('schema.prisma'));
      expect(schemaFile).toBeDefined();

      const content = await fs.promises.readFile(schemaFile!, 'utf-8');
      expect(content).toContain('model User');
      expect(content).toContain('email');
      expect(content).toContain('@unique');
    });
  });

  describe('Code Quality', () => {
    it('should generate code that passes linting', async () => {
      const spec = {
        name: 'TestService',
        type: 'api',
      };

      const result = await serviceGenerator.generateService(spec);
      expect(result.success).toBe(true);

      // Run linting on generated files
      for (const file of result.files) {
        const content = await fs.promises.readFile(file, 'utf-8');
        const ast = codeExecutor.parseCode(content, file);
        expect(ast).toBeDefined();
      }
    });

    it('should generate code with proper TypeScript types', async () => {
      const spec = {
        name: 'TypedService',
        type: 'api',
      };

      const result = await serviceGenerator.generateService(spec);
      const serviceFile = result.files.find(f => f.includes('typed-service.ts'));
      const content = await fs.promises.readFile(serviceFile!, 'utf-8');

      // Verify type annotations are present
      expect(content).toMatch(/:\s*(string|number|boolean|Promise)/);
      expect(content).toContain('interface');
    });

    it('should generate code with error handling', async () => {
      const spec = {
        name: 'SafeService',
        type: 'api',
      };

      const result = await serviceGenerator.generateService(spec);
      const serviceFile = result.files.find(f => f.includes('safe-service.ts'));
      const content = await fs.promises.readFile(serviceFile!, 'utf-8');

      expect(content).toContain('try');
      expect(content).toContain('catch');
      expect(content).toContain('throw');
    });
  });

  describe('Testing', () => {
    it('should generate tests for services', async () => {
      const spec = {
        name: 'TestedService',
        type: 'api',
        generateTests: true,
      };

      const result = await serviceGenerator.generateService(spec);
      const testFile = result.files.find(f => f.includes('.test.ts'));

      expect(testFile).toBeDefined();

      const content = await fs.promises.readFile(testFile!, 'utf-8');
      expect(content).toContain('describe');
      expect(content).toContain('it');
      expect(content).toContain('expect');
    });

    it('should generate test mocks', async () => {
      const spec = {
        name: 'MockedService',
        type: 'api',
        generateTests: true,
        dependencies: ['database', 'email'],
      };

      const result = await serviceGenerator.generateService(spec);
      const testFile = result.files.find(f => f.includes('.test.ts'));
      const content = await fs.promises.readFile(testFile!, 'utf-8');

      expect(content).toContain('jest.mock');
      expect(content).toContain('mockResolvedValue');
    });
  });

  describe('Verification', () => {
    it('should verify generated service passes all checks', async () => {
      const spec = {
        name: 'VerifiedService',
        type: 'api',
      };

      const result = await serviceGenerator.generateService(spec);
      expect(result.success).toBe(true);

      // Run verification pipeline
      const verification = await verificationPipeline.verify(true, false);

      expect(verification.passed).toBe(true);
      expect(verification.tests?.passed).toBe(true);
      expect(verification.linting?.passed).toBe(true);
    });
  });
});
