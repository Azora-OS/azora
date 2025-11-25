const { AIEthicsMonitor } = require('./index');
const { PrismaClient } = require('@prisma/client');
const { Queue, Worker } = require('bull');
const NodeCache = require('node-cache');
const { jest } = require('@jest/globals');

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('bull');
jest.mock('node-cache');
jest.mock('../ai-model-service');
jest.mock('../openai-service');

const mockPrisma = {
  aIDecision: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn()
  },
  biasAnalysis: {
    create: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn()
  },
  fairnessMetrics: {
    create: jest.fn()
  },
  constitutionalCheck: {
    create: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn()
  },
  transparencyLog: {
    create: jest.fn()
  },
  ethicalAuditLog: {
    create: jest.fn(),
    findMany: jest.fn()
  },
  interventionLog: {
    create: jest.fn(),
    findMany: jest.fn()
  },
  ethicsMetrics: {
    create: jest.fn()
  },
  biasDetectionModel: {
    upsert: jest.fn()
  },
  $queryRaw: jest.fn(),
  $disconnect: jest.fn()
};

const mockQueue = {
  add: jest.fn(),
  process: jest.fn(),
  on: jest.fn()
};

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn()
};

const mockAIModelService = {};
const mockOpenAIService = {};

PrismaClient.mockImplementation(() => mockPrisma);
Queue.mockImplementation(() => mockQueue);
NodeCache.mockImplementation(() => mockCache);

describe('AIEthicsMonitor', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AIEthicsMonitor();
  });

  afterEach(async () => {
    await service.disconnect();
  });

  describe('Initialization', () => {
    test('should initialize with correct configuration', () => {
      expect(service.prisma).toBeDefined();
      expect(service.monitoringQueue).toBeDefined();
      expect(service.auditQueue).toBeDefined();
      expect(service.cache).toBeDefined();
    });

    test('should set up queues and cron jobs', () => {
      expect(mockQueue.process).toHaveBeenCalledTimes(2);
      expect(mockQueue.on).toHaveBeenCalled();
    });
  });

  describe('Decision Logging', () => {
    const mockDecision = {
      decisionId: 'dec_123',
      serviceName: 'content-generation',
      modelName: 'gpt-4',
      requestType: 'content_generation',
      inputData: { topic: 'AI Ethics' },
      outputData: { content: 'Generated content' },
      processingTime: 1000,
      tokenCount: 150
    };

    test('should log decision successfully', async () => {
      mockPrisma.aIDecision.create.mockResolvedValue({
        id: 'decision_123',
        ...mockDecision
      });

      const response = await request(service.app)
        .post('/api/decisions')
        .send(mockDecision);

      expect(response.status).toBe(201);
      expect(mockPrisma.aIDecision.create).toHaveBeenCalledWith({
        data: expect.objectContaining(mockDecision)
      });
    });

    test('should validate decision input', async () => {
      const invalidDecision = {
        serviceName: '',
        inputData: {}
      };

      const response = await request(service.app)
        .post('/api/decisions')
        .send(invalidDecision);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should sanitize sensitive data', () => {
      const inputData = {
        apiKey: 'secret123',
        password: 'pass123',
        normalField: 'value'
      };

      const sanitized = service.sanitizeInputData(inputData);

      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.normalField).toBe('value');
    });
  });

  describe('Bias Analysis', () => {
    const mockDecision = {
      inputData: 'This is a test about male doctors and female nurses',
      outputData: 'Content about healthcare workers'
    };

    test('should detect gender bias', async () => {
      const biasResult = await service.analyzeBias(mockDecision);

      expect(biasResult).toHaveProperty('biasDetected');
      expect(biasResult).toHaveProperty('genderBias');
      expect(biasResult).toHaveProperty('biasTypes');
      expect(biasResult).toHaveProperty('mitigationStrategies');
    });

    test('should detect racial bias', async () => {
      const racialContent = {
        inputData: 'This content discusses racial equality and diversity',
        outputData: 'Educational content'
      };

      const biasResult = await service.detectRacialBias(racialContent.inputData);

      expect(biasResult).toHaveProperty('score');
      expect(biasResult).toHaveProperty('confidence');
    });

    test('should calculate statistical bias measures', async () => {
      const statisticalResult = await service.calculateStatisticalBias(mockDecision);

      expect(statisticalResult).toHaveProperty('disparateImpact');
      expect(statisticalResult).toHaveProperty('statisticalParity');
    });

    test('should generate mitigation strategies', () => {
      const biasTypes = ['GENDER', 'RACE_ETHNICITY'];
      const strategies = service.generateMitigationStrategies(biasTypes);

      expect(strategies).toContain('Use gender-neutral language');
      expect(strategies).toContain('Include diverse cultural contexts in training data');
    });

    test('should calculate severity score', () => {
      const severity = service.calculateSeverityScore(2, 0.8);
      expect(severity).toBeGreaterThan(0);
      expect(severity).toBeLessThanOrEqual(1);
    });
  });

  describe('Fairness Assessment', () => {
    test('should assess fairness metrics', async () => {
      const mockDecision = {
        inputData: { predictions: [0.8, 0.6] },
        outputData: { outcomes: [1, 0] }
      };

      const fairnessResult = await service.assessFairness(mockDecision);

      expect(fairnessResult).toHaveProperty('demographicParity');
      expect(fairnessResult).toHaveProperty('equalizedOdds');
      expect(fairnessResult).toHaveProperty('consistencyScore');
      expect(fairnessResult).toHaveProperty('featureImportance');
    });

    test('should calculate demographic parity', async () => {
      const demographicResult = await service.calculateDemographicParity({});

      expect(demographicResult).toHaveProperty('gender');
      expect(demographicResult).toHaveProperty('age');
    });

    test('should calculate consistency score', async () => {
      const consistency = await service.calculateConsistencyScore({});
      expect(typeof consistency).toBe('number');
      expect(consistency).toBeGreaterThanOrEqual(0);
      expect(consistency).toBeLessThanOrEqual(1);
    });
  });

  describe('Constitutional Compliance', () => {
    test('should check constitutional compliance', async () => {
      const mockDecision = {
        inputData: 'Content about educational equality',
        outputData: 'Educational material'
      };

      const complianceResult = await service.checkConstitutionalCompliance(mockDecision);

      expect(Array.isArray(complianceResult)).toBe(true);
      expect(complianceResult.length).toBeGreaterThan(0);
      expect(complianceResult[0]).toHaveProperty('principle');
      expect(complianceResult[0]).toHaveProperty('compliant');
      expect(complianceResult[0]).toHaveProperty('complianceScore');
    });

    test('should check specific principle compliance', async () => {
      const mockDecision = {
        inputData: 'Content with potential PII: email@test.com',
        outputData: 'User data'
      };

      const privacyCheck = await service.checkPrincipleCompliance(
        mockDecision,
        'PRIVACY_DATA_PROTECTION'
      );

      expect(privacyCheck.principle).toBe('PRIVACY_DATA_PROTECTION');
      expect(privacyCheck.compliant).toBe(false);
      expect(privacyCheck.violationType).toBe('PRIVACY_BREACH');
    });

    test('should detect PII in content', () => {
      const contentWithPII = 'Contact: john@example.com or call 555-123-4567';
      const hasPII = service.detectPII(contentWithPII);

      expect(hasPII).toBe(true);

      const cleanContent = 'This is clean content without PII';
      const noPII = service.detectPII(cleanContent);

      expect(noPII).toBe(false);
    });
  });

  describe('Transparency and Explainability', () => {
    test('should generate decision explanation', async () => {
      const mockDecision = {
        id: 'dec_123',
        biasAnalysis: { biasDetected: false },
        constitutionalChecks: [
          { compliant: true, complianceScore: 0.95 }
        ]
      };

      mockPrisma.aIDecision.findUnique.mockResolvedValue(mockDecision);

      const response = await request(service.app)
        .post('/api/explain/decision')
        .send({ decisionId: 'dec_123', userId: 'user_123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('simpleExplanation');
      expect(response.body).toHaveProperty('detailedExplanation');
    });

    test('should generate simple explanation', () => {
      const decision = {
        biasAnalysis: { biasDetected: true }
      };

      const simple = service.generateSimpleExplanation(decision);
      expect(typeof simple).toBe('string');
      expect(simple).toContain('bias');
    });

    test('should generate detailed explanation', () => {
      const decision = {
        serviceName: 'content-generation',
        modelName: 'gpt-4',
        biasAnalysis: { biasDetected: false },
        constitutionalChecks: [{ compliant: true }]
      };

      const detailed = service.generateDetailedExplanation(decision);
      expect(typeof detailed).toBe('string');
      expect(detailed).toContain('content-generation');
    });
  });

  describe('Audit System', () => {
    test('should run audit successfully', async () => {
      mockQueue.add.mockResolvedValue({ id: 'audit_job_123' });

      const response = await request(service.app)
        .post('/api/audit/run')
        .send({
          period: '7d',
          services: ['content-generation']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('auditId');
      expect(response.body).toHaveProperty('status', 'queued');
    });

    test('should process audit results', async () => {
      const mockDecisions = [
        {
          biasAnalysis: { biasDetected: true },
          constitutionalChecks: [
            { compliant: true },
            { compliant: false }
          ],
          riskLevel: 'HIGH'
        }
      ];

      mockPrisma.aIDecision.findMany.mockResolvedValue(mockDecisions);
      mockPrisma.ethicalAuditLog.create.mockResolvedValue({
        id: 'audit_123',
        auditId: 'audit_123'
      });

      const auditConfig = { period: '7d', services: [] };
      const result = await service.processAudit(auditConfig);

      expect(result).toHaveProperty('totalDecisions', 1);
      expect(result).toHaveProperty('biasedDecisions', 1);
      expect(result).toHaveProperty('violationsFound', 1);
      expect(result).toHaveProperty('highRiskDecisions', 1);
    });

    test('should generate audit findings', () => {
      const decisions = [
        { biasAnalysis: { biasDetected: true } },
        { riskLevel: 'HIGH' }
      ];

      const findings = service.generateAuditFindings(decisions);

      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0]).toHaveProperty('type');
      expect(findings[0]).toHaveProperty('severity');
    });
  });

  describe('Interventions', () => {
    test('should create intervention', async () => {
      const interventionData = {
        decisionId: 'dec_123',
        interventionType: 'BIAS_MITIGATION',
        severity: 'MEDIUM',
        originalDecision: { content: 'original' },
        modifiedDecision: { content: 'modified' },
        reason: 'Bias detected'
      };

      mockPrisma.interventionLog.create.mockResolvedValue({
        id: 'intervention_123',
        ...interventionData
      });

      const response = await request(service.app)
        .post('/api/intervene')
        .send(interventionData);

      expect(response.status).toBe(201);
      expect(mockPrisma.interventionLog.create).toHaveBeenCalled();
    });

    test('should trigger interventions for high risk', async () => {
      const decision = {
        id: 'dec_123',
        biasAnalysis: { biasDetected: true }
      };

      await service.triggerInterventions(decision, 'HIGH');

      expect(mockPrisma.interventionLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          decisionId: 'dec_123',
          interventionType: 'BIAS_MITIGATION'
        })
      });
    });
  });

  describe('Metrics and Analytics', () => {
    test('should get ethics metrics', async () => {
      mockPrisma.aIDecision.aggregate.mockResolvedValue({ _count: { id: 100 } });
      mockPrisma.biasAnalysis.aggregate.mockResolvedValue({
        _count: { id: 100 },
        _avg: { severityScore: 0.2 }
      });

      const response = await request(service.app)
        .get('/api/metrics?period=7d&metric=bias');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bias');
      expect(response.body.bias).toHaveProperty('totalAnalyses', 100);
    });

    test('should aggregate daily metrics', async () => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);

      mockPrisma.aIDecision.findMany.mockResolvedValue([
        { biasAnalysis: { biasDetected: true }, constitutionalChecks: [{ compliant: false }] }
      ]);

      await service.aggregateDailyMetrics();

      expect(mockPrisma.ethicsMetrics.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          date: date,
          metricType: 'DAILY_DECISIONS'
        })
      });
    });

    test('should calculate daily metrics', async () => {
      const date = new Date();
      const mockDecisions = [
        {
          biasAnalysis: { biasDetected: true },
          constitutionalChecks: [{ compliant: false }],
          riskLevel: 'HIGH'
        }
      ];

      mockPrisma.aIDecision.findMany.mockResolvedValue(mockDecisions);

      const metrics = await service.calculateDailyMetrics(date);

      expect(metrics).toHaveProperty('totalDecisions', 1);
      expect(metrics).toHaveProperty('biasedDecisions', 1);
      expect(metrics).toHaveProperty('violationsCount', 1);
      expect(metrics).toHaveProperty('highRiskDecisions', 1);
    });
  });

  describe('Model Training and Updates', () => {
    test('should retrain bias models', async () => {
      mockPrisma.biasAnalysis.findMany.mockResolvedValue([
        { biasDetected: true, confidenceScore: 0.8, severityScore: 0.3 }
      ]);

      await service.retrainBiasModels();

      expect(mockPrisma.biasDetectionModel.upsert).toHaveBeenCalled();
    });

    test('should calculate model performance', () => {
      const analyses = [
        { biasDetected: true, confidenceScore: 0.9, severityScore: 0.1 },
        { biasDetected: false, confidenceScore: 0.8, severityScore: 0.8 }
      ];

      const performance = service.calculateModelPerformance(analyses);

      expect(performance).toHaveProperty('accuracy');
      expect(performance).toHaveProperty('precision');
      expect(performance).toHaveProperty('recall');
      expect(performance).toHaveProperty('f1Score');
    });
  });

  describe('Utility Functions', () => {
    test('should extract text from decision', () => {
      const decision = {
        inputData: { text: 'Input text' },
        outputData: 'Output text'
      };

      const text = service.extractTextFromDecision(decision);
      expect(text).toContain('Input text');
      expect(text).toContain('Output text');
    });

    test('should analyze language bias', () => {
      const text = 'The man worked hard while the woman stayed home';
      const bias = service.analyzeLanguageBias(text);

      expect(bias).toHaveProperty('genderExclusive');
      expect(bias).toHaveProperty('racialTerms');
      expect(bias.genderExclusive).toBeGreaterThan(0);
    });

    test('should calculate risk level', () => {
      const biasAnalysis = { biasDetected: true, severityScore: 0.8 };
      const fairnessMetrics = { consistencyScore: 0.6 };
      const constitutionalChecks = [
        { compliant: false },
        { compliant: true }
      ];

      const riskLevel = service.calculateRiskLevel(
        biasAnalysis,
        fairnessMetrics,
        constitutionalChecks
      );

      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(riskLevel);
    });

    test('should get start date for periods', () => {
      const startDate = service.getStartDate('7d');
      const expected = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      expect(startDate.getDate()).toBe(expected.getDate());
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      mockPrisma.aIDecision.create.mockRejectedValue(new Error('DB Error'));

      const response = await request(service.app)
        .post('/api/decisions')
        .send({
          decisionId: 'dec_123',
          serviceName: 'test',
          requestType: 'test',
          inputData: {},
          outputData: {}
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to log decision');
    });

    test('should handle invalid JSON input', async () => {
      const response = await request(service.app)
        .post('/api/decisions')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);
      const mockRedis = { ping: jest.fn().mockResolvedValue('PONG') };
      service.redis = mockRedis;

      const response = await request(service.app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    test('should return unhealthy when database fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));
      const mockRedis = { ping: jest.fn().mockResolvedValue('PONG') };
      service.redis = mockRedis;

      const response = await request(service.app).get('/health');

      expect(response.status).toBe(503);
      expect(response.body.status).toBe('unhealthy');
    });
  });
});