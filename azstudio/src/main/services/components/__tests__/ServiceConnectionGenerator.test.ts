import { ServiceConnectionGenerator, ServiceConnection } from '../ServiceConnectionGenerator';

describe('ServiceConnectionGenerator', () => {
  let generator: ServiceConnectionGenerator;
  const outputDir = '/test/output';

  beforeEach(() => {
    generator = new ServiceConnectionGenerator();
  });

  describe('generateServiceConnection', () => {
    it('should generate API routes and service client', () => {
      const connection: ServiceConnection = {
        sourceService: 'user-service',
        targetService: 'payment-service',
        endpoints: [
          {
            method: 'POST',
            path: '/payments',
            description: 'Create payment',
            requestSchema: 'CreatePaymentRequest',
            responseSchema: 'PaymentResponse',
          },
        ],
      };

      const changes = generator.generateServiceConnection(connection, outputDir);

      expect(changes).toBeInstanceOf(Array);
      expect(changes.length).toBeGreaterThan(0);

      const filePaths = changes.map(c => c.path);
      expect(filePaths).toContain(expect.stringContaining('user-service.controller.ts'));
      expect(filePaths).toContain(expect.stringContaining('user-service.service.ts'));
      expect(filePaths).toContain(expect.stringContaining('payment-service.client.ts'));
    });

    it('should generate authentication middleware when enabled', () => {
      const connection: ServiceConnection = {
        sourceService: 'user-service',
        targetService: 'payment-service',
        authentication: true,
        endpoints: [
          {
            method: 'GET',
            path: '/payments/:id',
            description: 'Get payment',
          },
        ],
      };

      const changes = generator.generateServiceConnection(connection, outputDir);
      const filePaths = changes.map(c => c.path);

      expect(filePaths).toContain(expect.stringContaining('auth.middleware.ts'));
    });

    it('should generate route controller with endpoints', () => {
      const connection: ServiceConnection = {
        sourceService: 'user-service',
        targetService: 'payment-service',
        endpoints: [
          {
            method: 'GET',
            path: '/payments',
            description: 'List payments',
          },
          {
            method: 'POST',
            path: '/payments',
            description: 'Create payment',
          },
        ],
      };

      const changes = generator.generateServiceConnection(connection, outputDir);
      const controllerFile = changes.find(c => c.path.includes('user-service.controller.ts'));

      expect(controllerFile).toBeDefined();
      expect(controllerFile!.content).toContain('router.get');
      expect(controllerFile!.content).toContain('router.post');
      expect(controllerFile!.content).toContain('List payments');
      expect(controllerFile!.content).toContain('Create payment');
    });

    it('should generate service client with methods', () => {
      const connection: ServiceConnection = {
        sourceService: 'user-service',
        targetService: 'payment-service',
        endpoints: [
          {
            method: 'GET',
            path: '/payments/:id',
            description: 'Get payment',
            responseSchema: 'PaymentResponse',
          },
        ],
      };

      const changes = generator.generateServiceConnection(connection, outputDir);
      const clientFile = changes.find(c => c.path.includes('payment-service.client.ts'));

      expect(clientFile).toBeDefined();
      expect(clientFile!.content).toContain('class PaymentServiceClient');
      expect(clientFile!.content).toContain('axios');
      expect(clientFile!.content).toContain('async getPayments');
    });

    it('should include authentication in client when enabled', () => {
      const connection: ServiceConnection = {
        sourceService: 'user-service',
        targetService: 'payment-service',
        authentication: true,
        endpoints: [
          {
            method: 'GET',
            path: '/payments',
            description: 'List payments',
          },
        ],
      };

      const changes = generator.generateServiceConnection(connection, outputDir);
      const clientFile = changes.find(c => c.path.includes('payment-service.client.ts'));

      expect(clientFile).toBeDefined();
      expect(clientFile!.content).toContain('authToken');
      expect(clientFile!.content).toContain('setAuthToken');
      expect(clientFile!.content).toContain('Authorization');
    });

    it('should generate validation schemas for endpoints with request schemas', () => {
      const connection: ServiceConnection = {
        sourceService: 'user-service',
        targetService: 'payment-service',
        endpoints: [
          {
            method: 'POST',
            path: '/payments',
            description: 'Create payment',
            requestSchema: 'CreatePaymentRequest',
          },
        ],
      };

      const changes = generator.generateServiceConnection(connection, outputDir);
      const validationFile = changes.find(c => c.path.includes('user-service.schemas.ts'));

      expect(validationFile).toBeDefined();
      expect(validationFile!.content).toContain('z.object');
      expect(validationFile!.content).toContain('UserServiceSchemas');
    });

    it('should generate client types for request and response schemas', () => {
      const connection: ServiceConnection = {
        sourceService: 'user-service',
        targetService: 'payment-service',
        endpoints: [
          {
            method: 'POST',
            path: '/payments',
            description: 'Create payment',
            requestSchema: 'CreatePaymentRequest',
            responseSchema: 'PaymentResponse',
          },
        ],
      };

      const changes = generator.generateServiceConnection(connection, outputDir);
      const typesFile = changes.find(c => c.path.includes('payment-service.types.ts'));

      expect(typesFile).toBeDefined();
      expect(typesFile!.content).toContain('interface CreatePaymentRequest');
      expect(typesFile!.content).toContain('interface PaymentResponse');
    });

    it('should handle path parameters in endpoints', () => {
      const connection: ServiceConnection = {
        sourceService: 'user-service',
        targetService: 'payment-service',
        endpoints: [
          {
            method: 'GET',
            path: '/payments/:id',
            description: 'Get payment by ID',
          },
        ],
      };

      const changes = generator.generateServiceConnection(connection, outputDir);
      const controllerFile = changes.find(c => c.path.includes('user-service.controller.ts'));
      const serviceFile = changes.find(c => c.path.includes('user-service.service.ts'));

      expect(controllerFile!.content).toContain('req.params.id');
      expect(serviceFile!.content).toContain('id: string');
    });

    it('should generate multiple endpoint methods', () => {
      const connection: ServiceConnection = {
        sourceService: 'user-service',
        targetService: 'payment-service',
        endpoints: [
          {
            method: 'GET',
            path: '/payments',
            description: 'List payments',
          },
          {
            method: 'POST',
            path: '/payments',
            description: 'Create payment',
          },
          {
            method: 'PUT',
            path: '/payments/:id',
            description: 'Update payment',
          },
          {
            method: 'DELETE',
            path: '/payments/:id',
            description: 'Delete payment',
          },
        ],
      };

      const changes = generator.generateServiceConnection(connection, outputDir);
      const clientFile = changes.find(c => c.path.includes('payment-service.client.ts'));

      expect(clientFile).toBeDefined();
      expect(clientFile!.content).toContain('async getPayments');
      expect(clientFile!.content).toContain('async postPayments');
      expect(clientFile!.content).toContain('async putPayments');
      expect(clientFile!.content).toContain('async deletePayments');
    });

    it('should generate service auth middleware', () => {
      const connection: ServiceConnection = {
        sourceService: 'user-service',
        targetService: 'payment-service',
        authentication: true,
        endpoints: [
          {
            method: 'GET',
            path: '/payments',
            description: 'List payments',
          },
        ],
      };

      const changes = generator.generateServiceConnection(connection, outputDir);
      const middlewareFile = changes.find(c => c.path.includes('auth.middleware.ts'));

      expect(middlewareFile).toBeDefined();
      expect(middlewareFile!.content).toContain('authMiddleware');
      expect(middlewareFile!.content).toContain('serviceAuthMiddleware');
      expect(middlewareFile!.content).toContain('x-api-key');
    });
  });
});
