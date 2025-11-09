const { AIEthicsMonitor } = require('./index');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { jest } = require('@jest/globals');

// Mock external dependencies
jest.mock('@prisma/client');
jest.mock('axios');
jest.mock('../ai-model-service');
jest.mock('../openai-service');
jest.mock('../content-generation-service');
jest.mock('../personalization-engine');

const mockPrisma = {
  aIDecision: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn()
  },
  biasAnalysis: {
    create: jest.fn(),
    findMany: jest.fn()
  },
  constitutionalCheck: {
    create: jest.fn(),
    aggregate: jest.fn()
  },
  transparencyLog: {
    create: jest.fn()
  },
  ethicalAuditLog: {
    create: jest.fn()
  },
  interventionLog: {
    create: jest.fn()
  },
  $disconnect: jest.fn()
};

const mockAxios = {
  post: jest.fn(),
  get: jest.fn()
};

PrismaClient.mockImplementation(() => mockPrisma);
axios.create.mockReturnValue(mockAxios);

describe('AI Ethics Monitor Integration Tests', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AIEthicsMonitor();
  });

  afterEach(async () => {
    await service.disconnect();
  });

  describe('End-to-End Decision Flow', () => {
    test('should process complete decision lifecycle from content generation', async () => {
      // Mock content generation service request
      const contentRequest = {
        topic: 'AI Ethics in Healthcare',
        audience: 'medical professionals',
        tone: 'professional'
      };

      const generatedContent = {
        content: 'Comprehensive analysis of AI ethics in healthcare...',
        metadata: {
          wordCount: 500,
          readingTime: 3,
          sentiment: 'neutral'
        }
      };

      // Mock AI model service response
      mockAxios.post
        .mockResolvedValueOnce({ data: { model: 'gpt-4', version: 'latest' } })
        .mockResolvedValueOnce({ data: generatedContent });

      // Mock decision logging
      mockPrisma.aIDecision.create.mockResolvedValue({
        id: 'dec_123',
        serviceName: 'content-generation',
        decisionId: 'cg_123'
      });

      // Mock bias analysis
      mockPrisma.biasAnalysis.create.mockResolvedValue({
        id: 'bias_123',
        biasDetected: false,
        confidenceScore: 0.95
      });

      // Mock constitutional checks
      mockPrisma.constitutionalCheck.create.mockResolvedValue({
        id: 'const_123',
        principle: 'EQUALITY_FAIRNESS',
        compliant: true,
        complianceScore: 0.92
      });

      // Process the decision
      const decisionData = {
        decisionId: 'cg_123',
        serviceName: 'content-generation',
        modelName: 'gpt-4',
        requestType: 'content_generation',
        inputData: contentRequest,
        outputData: generatedContent,
        processingTime: 1200,
        tokenCount: 300
      };

      const result = await service.logDecision(decisionData);

      expect(result.decisionId).toBe('dec_123');
      expect(mockPrisma.aIDecision.create).toHaveBeenCalled();
      expect(mockPrisma.biasAnalysis.create).toHaveBeenCalled();
      expect(mockPrisma.constitutionalCheck.create).toHaveBeenCalled();
    });

    test('should handle biased content generation and trigger intervention', async () => {
      const biasedRequest = {
        topic: 'Gender roles in technology',
        audience: 'general',
        tone: 'neutral'
      };

      const biasedContent = {
        content: 'Men are naturally better at programming while women excel at design work...',
        metadata: {
          wordCount: 200,
          sentiment: 'neutral'
        }
      };

      // Mock high bias detection
      mockPrisma.biasAnalysis.create.mockResolvedValue({
        id: 'bias_456',
        biasDetected: true,
        biasTypes: ['GENDER'],
        severityScore: 0.85,
        confidenceScore: 0.88
      });

      // Mock constitutional violation
      mockPrisma.constitutionalCheck.create.mockResolvedValue({
        id: 'const_456',
        principle: 'EQUALITY_FAIRNESS',
        compliant: false,
        violationType: 'DISCRIMINATORY_CONTENT',
        complianceScore: 0.45
      });

      // Mock intervention creation
      mockPrisma.interventionLog.create.mockResolvedValue({
        id: 'int_456',
        interventionType: 'CONTENT_MODIFICATION',
        severity: 'HIGH'
      });

      const decisionData = {
        decisionId: 'cg_456',
        serviceName: 'content-generation',
        modelName: 'gpt-4',
        requestType: 'content_generation',
        inputData: biasedRequest,
        outputData: biasedContent,
        processingTime: 800,
        tokenCount: 150
      };

      const result = await service.logDecision(decisionData);

      expect(result.riskLevel).toBe('HIGH');
      expect(mockPrisma.interventionLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          interventionType: 'CONTENT_MODIFICATION',
          severity: 'HIGH'
        })
      });
    });
  });

  describe('Multi-Service Integration', () => {
    test('should coordinate with personalization engine for user recommendations', async () => {
      const userProfile = {
        userId: 'user_123',
        preferences: {
          topics: ['technology', 'ethics'],
          contentTypes: ['articles', 'videos']
        },
        demographics: {
          age: 28,
          gender: 'female',
          location: 'Kenya'
        }
      };

      const recommendations = [
        { contentId: 'content_1', score: 0.95, reason: 'High user engagement' },
        { contentId: 'content_2', score: 0.87, reason: 'Topic relevance' }
      ];

      // Mock personalization service
      mockAxios.post.mockResolvedValue({ data: recommendations });

      // Mock decision with personalization data
      const decisionData = {
        decisionId: 'pers_123',
        serviceName: 'personalization-engine',
        modelName: 'recommendation-model-v2',
        requestType: 'user_recommendations',
        inputData: userProfile,
        outputData: recommendations,
        processingTime: 500,
        tokenCount: 200
      };

      // Mock fair recommendations
      mockPrisma.biasAnalysis.create.mockResolvedValue({
        id: 'bias_789',
        biasDetected: false,
        fairnessMetrics: {
          demographicParity: 0.98,
          equalizedOdds: 0.95
        }
      });

      const result = await service.logDecision(decisionData);

      expect(result.fairnessAssessment.demographicParity).toBeGreaterThan(0.9);
      expect(mockPrisma.biasAnalysis.create).toHaveBeenCalled();
    });

    test('should validate AI model service integration', async () => {
      const modelRequest = {
        modelType: 'text-generation',
        task: 'content-moderation',
        requirements: {
          accuracy: 0.95,
          fairness: 0.90
        }
      };

      const modelSelection = {
        selectedModel: 'gpt-4-turbo',
        confidence: 0.92,
        alternatives: ['claude-3', 'gemini-pro']
      };

      // Mock AI model service
      mockAxios.post.mockResolvedValue({ data: modelSelection });

      const decisionData = {
        decisionId: 'model_123',
        serviceName: 'ai-model-service',
        modelName: 'model-selector-v1',
        requestType: 'model_selection',
        inputData: modelRequest,
        outputData: modelSelection,
        processingTime: 300,
        tokenCount: 100
      };

      const result = await service.logDecision(decisionData);

      expect(result.modelSelection.confidence).toBeGreaterThan(0.9);
      expect(result.transparencyLog).toBeDefined();
    });
  });

  describe('Constitutional Compliance Integration', () => {
    test('should enforce African sovereignty in content generation', async () => {
      const sovereigntyContent = {
        topic: 'Digital Infrastructure Development',
        content: 'Foreign companies should lead African tech development...',
        targetAudience: 'African policymakers'
      };

      // Mock constitutional violation for sovereignty
      mockPrisma.constitutionalCheck.create.mockResolvedValue({
        id: 'const_789',
        principle: 'AFRICAN_SOVEREIGNTY',
        compliant: false,
        violationType: 'EXTERNAL_DEPENDENCE',
        complianceScore: 0.3,
        recommendedActions: [
          'Promote local African tech companies',
          'Include African-led initiatives',
          'Emphasize sovereignty benefits'
        ]
      });

      const decisionData = {
        decisionId: 'sovereignty_123',
        serviceName: 'content-generation',
        modelName: 'gpt-4',
        requestType: 'sovereignty_check',
        inputData: { topic: sovereigntyContent.topic },
        outputData: sovereigntyContent,
        processingTime: 600,
        tokenCount: 180
      };

      const result = await service.logDecision(decisionData);

      expect(result.constitutionalChecks).toContainEqual(
        expect.objectContaining({
          principle: 'AFRICAN_SOVEREIGNTY',
          compliant: false
        })
      );

      expect(mockPrisma.interventionLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          interventionType: 'CONTENT_REWRITE',
          reason: expect.stringContaining('sovereignty')
        })
      });
    });

    test('should validate positive impact focus', async () => {
      const impactContent = {
        topic: 'AI for Social Good',
        content: 'AI can solve world hunger through efficient food distribution...',
        impactMetrics: {
          beneficiaries: 1000000,
          sustainability: 0.85,
          scalability: 0.9
        }
      };

      // Mock positive impact compliance
      mockPrisma.constitutionalCheck.create.mockResolvedValue({
        id: 'const_101',
        principle: 'POSITIVE_IMPACT_FOCUS',
        compliant: true,
        complianceScore: 0.95,
        impactAssessment: {
          socialBenefit: 0.92,
          environmentalImpact: 0.88,
          economicValue: 0.85
        }
      });

      const decisionData = {
        decisionId: 'impact_123',
        serviceName: 'content-generation',
        modelName: 'gpt-4',
        requestType: 'impact_assessment',
        inputData: { topic: impactContent.topic },
        outputData: impactContent,
        processingTime: 700,
        tokenCount: 220
      };

      const result = await service.logDecision(decisionData);

      expect(result.constitutionalChecks[0].impactAssessment.socialBenefit).toBeGreaterThan(0.9);
      expect(result.complianceScore).toBeGreaterThan(0.9);
    });
  });

  describe('Audit and Compliance Reporting', () => {
    test('should generate comprehensive audit report', async () => {
      const auditPeriod = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        services: ['content-generation', 'personalization-engine']
      };

      const mockDecisions = [
        {
          id: 'dec_1',
          serviceName: 'content-generation',
          biasAnalysis: { biasDetected: false },
          constitutionalChecks: [{ compliant: true }],
          riskLevel: 'LOW'
        },
        {
          id: 'dec_2',
          serviceName: 'personalization-engine',
          biasAnalysis: { biasDetected: true, severityScore: 0.7 },
          constitutionalChecks: [{ compliant: false }],
          riskLevel: 'HIGH'
        }
      ];

      mockPrisma.aIDecision.findMany.mockResolvedValue(mockDecisions);
      mockPrisma.ethicalAuditLog.create.mockResolvedValue({
        id: 'audit_123',
        auditId: 'audit_123'
      });

      const auditResult = await service.processAudit(auditPeriod);

      expect(auditResult.totalDecisions).toBe(2);
      expect(auditResult.biasedDecisions).toBe(1);
      expect(auditResult.violationsFound).toBe(1);
      expect(auditResult.complianceRate).toBe(0.5);
      expect(auditResult.findings).toBeDefined();
      expect(auditResult.recommendations).toBeDefined();
    });

    test('should export compliance data for regulatory reporting', async () => {
      const exportRequest = {
        format: 'JSON',
        period: '30d',
        includeDetails: true,
        recipient: 'regulatory_body@azora.os'
      };

      const mockComplianceData = {
        period: '2024-Q1',
        overallCompliance: 0.94,
        principleCompliance: {
          PRIVACY_DATA_PROTECTION: 0.96,
          EQUALITY_FAIRNESS: 0.92,
          TRANSPARENCY_ACCOUNTABILITY: 0.95,
          HUMAN_CENTRIC_DESIGN: 0.93,
          AFRICAN_SOVEREIGNTY: 0.98,
          POSITIVE_IMPACT_FOCUS: 0.91
        },
        interventions: 23,
        audits: 4,
        highRiskDecisions: 5
      };

      mockPrisma.constitutionalCheck.aggregate.mockResolvedValue({
        _avg: { complianceScore: 0.94 }
      });

      const exportResult = await service.exportComplianceData(exportRequest);

      expect(exportResult.format).toBe('JSON');
      expect(exportResult.data.overallCompliance).toBeGreaterThan(0.9);
      expect(exportResult.data.principleCompliance).toHaveProperty('AFRICAN_SOVEREIGNTY');
      expect(exportResult.metadata.generatedAt).toBeDefined();
      expect(exportResult.metadata.regulatoryCompliant).toBe(true);
    });
  });

  describe('Real-time Monitoring and Alerts', () => {
    test('should trigger alerts for critical violations', async () => {
      const criticalDecision = {
        decisionId: 'critical_123',
        serviceName: 'content-generation',
        modelName: 'gpt-4',
        requestType: 'content_generation',
        inputData: { topic: 'Sensitive Topic' },
        outputData: {
          content: 'Content with severe privacy violations and discriminatory language...',
          metadata: { sensitivity: 'high' }
        },
        processingTime: 1000,
        tokenCount: 250
      };

      // Mock critical violations
      mockPrisma.biasAnalysis.create.mockResolvedValue({
        id: 'bias_crit',
        biasDetected: true,
        severityScore: 0.95,
        biasTypes: ['RACE_ETHNICITY', 'GENDER', 'DISABILITY']
      });

      mockPrisma.constitutionalCheck.create.mockResolvedValue({
        id: 'const_crit',
        principle: 'PRIVACY_DATA_PROTECTION',
        compliant: false,
        violationType: 'MASSIVE_DATA_BREACH',
        complianceScore: 0.1
      });

      // Mock alert system
      const alertMock = jest.fn();
      service.alertSystem = { triggerCriticalAlert: alertMock };

      await service.logDecision(criticalDecision);

      expect(alertMock).toHaveBeenCalledWith({
        level: 'CRITICAL',
        violations: expect.arrayContaining([
          expect.objectContaining({ violationType: 'MASSIVE_DATA_BREACH' })
        ]),
        decisionId: 'critical_123',
        immediateActionRequired: true
      });
    });

    test('should monitor service health and performance', async () => {
      // Mock service health checks
      mockAxios.get
        .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' } }) // AI Model Service
        .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' } }) // OpenAI Service
        .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' } }) // Content Generation
        .mockResolvedValueOnce({ status: 200, data: { status: 'healthy' } }); // Personalization

      mockPrisma.aIDecision.aggregate.mockResolvedValue({
        _count: { id: 150 },
        _avg: { processingTime: 850 }
      });

      const healthReport = await service.generateHealthReport();

      expect(healthReport.overallHealth).toBe('HEALTHY');
      expect(healthReport.serviceStatuses.aiModelService).toBe('UP');
      expect(healthReport.performanceMetrics.averageProcessingTime).toBeLessThan(1000);
      expect(healthReport.decisionVolume).toBe(150);
    });
  });

  describe('Continuous Learning and Model Improvement', () => {
    test('should update bias detection models with new data', async () => {
      const trainingData = [
        {
          input: 'Text about male doctors and female nurses',
          biasDetected: true,
          biasType: 'GENDER_STEREOTYPE',
          severity: 0.8
        },
        {
          input: 'Neutral content about healthcare professionals',
          biasDetected: false,
          biasType: null,
          severity: 0.1
        }
      ];

      mockPrisma.biasAnalysis.findMany.mockResolvedValue(trainingData);

      const modelUpdate = await service.retrainBiasModels();

      expect(modelUpdate.modelVersion).toBeDefined();
      expect(modelUpdate.accuracy).toBeGreaterThan(0.8);
      expect(modelUpdate.trainingDataSize).toBe(2);
      expect(modelUpdate.lastTrained).toBeDefined();
    });

    test('should adapt to new constitutional requirements', async () => {
      const newPrinciple = {
        name: 'DATA_LOCALIZATION',
        description: 'All user data must be stored within African borders',
        requirements: ['geographic_restriction', 'data_sovereignty'],
        enforcement: 'strict'
      };

      await service.addConstitutionalPrinciple(newPrinciple);

      const decisionWithNewPrinciple = {
        decisionId: 'localization_123',
        serviceName: 'data-processing',
        inputData: { dataLocation: 'EU', userLocation: 'Kenya' },
        outputData: { processed: true }
      };

      const compliance = await service.checkPrincipleCompliance(
        decisionWithNewPrinciple,
        'DATA_LOCALIZATION'
      );

      expect(compliance.compliant).toBe(false);
      expect(compliance.violationType).toBe('GEOGRAPHIC_VIOLATION');
    });
  });
});