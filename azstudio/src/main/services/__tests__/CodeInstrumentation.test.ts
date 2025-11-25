import { CodeInstrumentation, InstrumentationConfig } from '../CodeInstrumentation';

describe('CodeInstrumentation', () => {
  const defaultConfig: InstrumentationConfig = {
    logging: {
      enabled: true,
      level: 'info',
      provider: 'winston',
    },
    metrics: {
      enabled: true,
      provider: 'prometheus',
      customMetrics: [],
    },
    tracing: {
      enabled: true,
      provider: 'opentelemetry',
      sampleRate: 1.0,
    },
    events: {
      enabled: true,
      customEvents: ['userSignup', 'paymentProcessed'],
    },
  };

  describe('instrumentService', () => {
    it('should add logging to service functions', async () => {
      const instrumentation = new CodeInstrumentation(defaultConfig);
      const code = `
        export function processPayment(amount: number) {
          return { success: true, amount };
        }
      `;

      const result = await instrumentation.instrumentService(code, 'PaymentService');

      expect(result.instrumentedCode).toContain('logger.info');
      expect(result.addedImports).toContain("import { logger } from './utils/logger';");
    });

    it('should add metrics to Express routes', async () => {
      const instrumentation = new CodeInstrumentation(defaultConfig);
      const code = `
        app.get('/api/users', async (req, res) => {
          const users = await getUsers();
          res.json(users);
        });
      `;

      const result = await instrumentation.instrumentService(code, 'UserService');

      expect(result.instrumentedCode).toContain('metrics.increment');
      expect(result.instrumentedCode).toContain('http_requests_total');
      expect(result.metricsEndpoint).toBe('/metrics');
    });

    it('should add distributed tracing spans', async () => {
      const instrumentation = new CodeInstrumentation(defaultConfig);
      const code = `
        export async function fetchUserData(userId: string) {
          const user = await db.user.findUnique({ where: { id: userId } });
          return user;
        }
      `;

      const result = await instrumentation.instrumentService(code, 'UserService');

      expect(result.instrumentedCode).toContain('tracer.startSpan');
      expect(result.instrumentedCode).toContain('span.end()');
    });

    it('should add custom event tracking', async () => {
      const instrumentation = new CodeInstrumentation(defaultConfig);
      const code = `
        export function userSignup(email: string) {
          createUser(email);
          return { success: true };
        }
      `;

      const result = await instrumentation.instrumentService(code, 'AuthService');

      expect(result.instrumentedCode).toContain('analytics.track');
    });

    it('should handle disabled instrumentation', async () => {
      const minimalConfig: InstrumentationConfig = {
        logging: { enabled: false, level: 'info', provider: 'console' },
        metrics: { enabled: false, provider: 'prometheus', customMetrics: [] },
        tracing: { enabled: false, provider: 'opentelemetry', sampleRate: 0 },
        events: { enabled: false, customEvents: [] },
      };

      const instrumentation = new CodeInstrumentation(minimalConfig);
      const code = `export function test() { return true; }`;

      const result = await instrumentation.instrumentService(code, 'TestService');

      expect(result.addedImports).toHaveLength(0);
      expect(result.addedMiddleware).toHaveLength(0);
      expect(result.metricsEndpoint).toBeUndefined();
    });
  });

  describe('generateMonitoringUtils', () => {
    it('should generate logger utility', () => {
      const instrumentation = new CodeInstrumentation(defaultConfig);
      const utils = instrumentation.generateMonitoringUtils();

      expect(utils['utils/logger.ts']).toBeDefined();
      expect(utils['utils/logger.ts']).toContain('winston');
    });

    it('should generate metrics utility', () => {
      const instrumentation = new CodeInstrumentation(defaultConfig);
      const utils = instrumentation.generateMonitoringUtils();

      expect(utils['utils/metrics.ts']).toBeDefined();
      expect(utils['utils/metrics.ts']).toContain('prom-client');
    });

    it('should generate tracing utility', () => {
      const instrumentation = new CodeInstrumentation(defaultConfig);
      const utils = instrumentation.generateMonitoringUtils();

      expect(utils['utils/tracing.ts']).toBeDefined();
      expect(utils['utils/tracing.ts']).toContain('@opentelemetry');
    });

    it('should generate analytics utility', () => {
      const instrumentation = new CodeInstrumentation(defaultConfig);
      const utils = instrumentation.generateMonitoringUtils();

      expect(utils['utils/analytics.ts']).toBeDefined();
      expect(utils['utils/analytics.ts']).toContain('analytics');
    });
  });
});
