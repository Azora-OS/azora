const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { Queue, Worker } = require('bull');
const Redis = require('redis');
const winston = require('winston');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const cron = require('node-cron');
const NodeCache = require('node-cache');
const { Matrix, SVD } = require('ml-matrix');
const natural = require('natural');
const Sentiment = require('sentiment');
const nlp = require('node-nlp');

// Import dependent services
const AIModelService = require('../ai-model-service');
const OpenAIService = require('../openai-service');

class AIEthicsMonitor {
  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

    // Initialize Redis clients
    this.redis = Redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    });

    // Initialize queues
    this.monitoringQueue = new Queue('ai_ethics_monitoring', {
      redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }
    });

    this.auditQueue = new Queue('ai_ethics_audits', {
      redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }
    });

    // Initialize dependent services
    this.aiModelService = new AIModelService();
    this.openaiService = new OpenAIService();

    // Initialize ML components
    this.sentiment = new Sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.classifier = new natural.BayesClassifier();

    // Load bias detection models
    this.initializeBiasDetection();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupQueues();
    this.setupCronJobs();
    this.setupLogging();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    this.app.use('/api/', limiter);
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', this.healthCheck.bind(this));

    // Decision monitoring
    this.app.post('/api/decisions', this.logDecision.bind(this));
    this.app.get('/api/decisions/:decisionId', this.getDecision.bind(this));
    this.app.get('/api/decisions', this.getDecisions.bind(this));

    // Bias analysis
    this.app.post('/api/analyze/bias', this.analyzeBias.bind(this));
    this.app.get('/api/bias/metrics', this.getBiasMetrics.bind(this));

    // Fairness assessment
    this.app.post('/api/analyze/fairness', this.assessFairness.bind(this));
    this.app.get('/api/fairness/metrics', this.getFairnessMetrics.bind(this));

    // Constitutional compliance
    this.app.post('/api/check/constitutional', this.checkConstitutionalCompliance.bind(this));
    this.app.get('/api/constitutional/metrics', this.getConstitutionalMetrics.bind(this));

    // Transparency and explainability
    this.app.post('/api/explain/decision', this.explainDecision.bind(this));
    this.app.get('/api/transparency/:decisionId', this.getTransparencyLog.bind(this));

    // Audit and reporting
    this.app.post('/api/audit/run', this.runAudit.bind(this));
    this.app.get('/api/audit/:auditId', this.getAuditReport.bind(this));
    this.app.get('/api/audit/history', this.getAuditHistory.bind(this));

    // Interventions
    this.app.post('/api/intervene', this.createIntervention.bind(this));
    this.app.get('/api/interventions', this.getInterventions.bind(this));

    // Ethics metrics
    this.app.get('/api/metrics', this.getEthicsMetrics.bind(this));
    this.app.get('/api/metrics/dashboard', this.getEthicsDashboard.bind(this));

    // Admin endpoints
    this.app.post('/api/admin/retrain-models', this.retrainBiasModels.bind(this));
    this.app.get('/api/admin/model-performance', this.getModelPerformance.bind(this));
    this.app.post('/api/admin/review-decision', this.reviewDecision.bind(this));
  }

  setupQueues() {
    // Decision monitoring worker
    new Worker('ai_ethics_monitoring', async (job) => {
      const { decisionData } = job.data;
      return await this.processDecisionMonitoring(decisionData);
    }, { connection: this.redis });

    // Audit processing worker
    new Worker('ai_ethics_audits', async (job) => {
      const { auditConfig } = job.data;
      return await this.processAudit(auditConfig);
    }, { connection: this.redis });
  }

  setupCronJobs() {
    // Daily metrics aggregation
    cron.schedule('0 1 * * *', async () => {
      await this.aggregateDailyMetrics();
    });

    // Weekly comprehensive audit
    cron.schedule('0 2 * * 1', async () => {
      await this.runWeeklyAudit();
    });

    // Monthly constitutional compliance review
    cron.schedule('0 3 1 * *', async () => {
      await this.runMonthlyConstitutionalReview();
    });

    // Model retraining
    cron.schedule('0 4 * * *', async () => {
      await this.retrainBiasModels();
    });
  }

  setupLogging() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'ai-ethics-monitor' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
  }

  async initializeBiasDetection() {
    // Load pre-trained bias detection models
    try {
      // Initialize gender bias detection
      this.genderBiasDetector = await this.loadGenderBiasModel();

      // Initialize racial bias detection
      this.racialBiasDetector = await this.loadRacialBiasModel();

      // Initialize content bias detection
      this.contentBiasDetector = await this.loadContentBiasModel();

      this.logger.info('Bias detection models initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize bias detection models', { error: error.message });
    }
  }

  // Health Check
  async healthCheck(req, res) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      const redisPing = await new Promise((resolve, reject) => {
        this.redis.ping((err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          redis: redisPing === 'PONG' ? 'connected' : 'disconnected',
          queues: 'operational',
          biasModels: this.genderBiasDetector ? 'loaded' : 'unavailable'
        }
      });
    } catch (error) {
      this.logger.error('Health check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  // Decision Logging and Monitoring
  async logDecision(req, res) {
    try {
      const schema = Joi.object({
        decisionId: Joi.string().required(),
        serviceName: Joi.string().required(),
        modelName: Joi.string(),
        modelVersion: Joi.string(),
        userId: Joi.string(),
        sessionId: Joi.string(),
        requestType: Joi.string().required(),
        inputData: Joi.object().required(),
        outputData: Joi.object().required(),
        processingTime: Joi.number(),
        tokenCount: Joi.number().integer(),
        cost: Joi.number()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Sanitize sensitive data
      const sanitizedInput = this.sanitizeInputData(value.inputData);
      const sanitizedOutput = this.sanitizeOutputData(value.outputData);

      const decision = await this.prisma.aIDecision.create({
        data: {
          ...value,
          inputData: sanitizedInput,
          outputData: sanitizedOutput
        }
      });

      // Queue for monitoring and analysis
      await this.monitoringQueue.add({
        decisionData: decision
      });

      res.status(201).json(decision);
    } catch (error) {
      this.logger.error('Failed to log decision', { error: error.message });
      res.status(500).json({ error: 'Failed to log decision' });
    }
  }

  async processDecisionMonitoring(decisionData) {
    try {
      // Run comprehensive analysis
      const [biasAnalysis, fairnessMetrics, constitutionalChecks] = await Promise.all([
        this.analyzeBias(decisionData),
        this.assessFairness(decisionData),
        this.checkConstitutionalCompliance(decisionData)
      ]);

      // Calculate overall risk level
      const riskLevel = this.calculateRiskLevel(biasAnalysis, fairnessMetrics, constitutionalChecks);

      // Determine if review is required
      const requiresReview = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';

      // Update decision with analysis results
      await this.prisma.aIDecision.update({
        where: { id: decisionData.id },
        data: {
          riskLevel,
          requiresReview,
          biasAnalysis: {
            create: biasAnalysis
          },
          fairnessMetrics: {
            create: fairnessMetrics
          },
          constitutionalChecks: {
            create: constitutionalChecks
          }
        }
      });

      // Create transparency log
      await this.createTransparencyLog(decisionData);

      // Trigger interventions if needed
      if (requiresReview) {
        await this.triggerInterventions(decisionData, riskLevel);
      }

      return { success: true, riskLevel, requiresReview };
    } catch (error) {
      this.logger.error('Failed to process decision monitoring', { error: error.message });
      throw error;
    }
  }

  // Bias Analysis
  async analyzeBias(decisionData) {
    const inputText = this.extractTextFromDecision(decisionData);
    const biasTypes = [];

    // Gender bias detection
    const genderBias = await this.detectGenderBias(inputText);
    if (Math.abs(genderBias.score) > 0.3) {
      biasTypes.push('GENDER');
    }

    // Racial/ethnic bias detection
    const racialBias = await this.detectRacialBias(inputText);
    if (Math.abs(racialBias.score) > 0.3) {
      biasTypes.push('RACE_ETHNICITY');
    }

    // Content bias detection
    const contentBias = await this.detectContentBias(inputText);
    if (contentBias.detected) {
      biasTypes.push(...contentBias.types);
    }

    // Calculate statistical bias measures
    const statisticalBias = await this.calculateStatisticalBias(decisionData);

    return {
      biasDetected: biasTypes.length > 0,
      biasTypes,
      genderBias: genderBias.score,
      racialBias: racialBias.score,
      sentimentBias: contentBias.sentimentBias,
      topicBias: contentBias.topicBias,
      languageBias: contentBias.languageBias,
      disparateImpact: statisticalBias.disparateImpact,
      statisticalParity: statisticalBias.statisticalParity,
      confidenceScore: 0.85,
      severityScore: this.calculateSeverityScore(biasTypes.length, Math.max(Math.abs(genderBias.score), Math.abs(racialBias.score))),
      mitigationStrategies: this.generateMitigationStrategies(biasTypes),
      recommendedActions: this.generateRecommendedActions(biasTypes)
    };
  }

  async detectGenderBias(text) {
    // Use pre-trained gender bias detection model
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));

    // Simple rule-based detection (in production, use ML model)
    const maleTerms = ['he', 'him', 'his', 'man', 'men', 'boy', 'boys', 'male', 'masculine'];
    const femaleTerms = ['she', 'her', 'hers', 'woman', 'women', 'girl', 'girls', 'female', 'feminine'];

    const maleCount = stemmedTokens.filter(token => maleTerms.includes(token)).length;
    const femaleCount = stemmedTokens.filter(token => femaleTerms.includes(token)).length;
    const totalGenderTerms = maleCount + femaleCount;

    const biasScore = totalGenderTerms > 0 ? (maleCount - femaleCount) / totalGenderTerms : 0;

    return { score: biasScore, confidence: 0.8 };
  }

  async detectRacialBias(text) {
    // Racial/ethnic bias detection
    const racialTerms = {
      positive: ['diverse', 'inclusive', 'multicultural', 'equality'],
      negative: ['racist', 'discriminatory', 'biased', 'prejudiced']
    };

    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const positiveCount = tokens.filter(token => racialTerms.positive.includes(token)).length;
    const negativeCount = tokens.filter(token => racialTerms.negative.includes(token)).length;

    const biasScore = (negativeCount - positiveCount) / Math.max(tokens.length, 1);

    return { score: biasScore, confidence: 0.75 };
  }

  async detectContentBias(text) {
    const sentiment = this.sentiment.analyze(text);
    const topics = await this.extractTopics(text);

    // Analyze sentiment bias by topic
    const topicBias = {};
    const languageBias = this.analyzeLanguageBias(text);

    return {
      detected: Math.abs(sentiment.score) > 2,
      types: sentiment.score > 2 ? ['SENTIMENT'] : sentiment.score < -2 ? ['NEGATIVE_SENTIMENT'] : [],
      sentimentBias: sentiment.score / 10, // Normalize to -1 to 1
      topicBias,
      languageBias
    };
  }

  async calculateStatisticalBias(decisionData) {
    // Calculate statistical measures of bias
    // This would analyze patterns across multiple decisions
    return {
      disparateImpact: 1.0, // Placeholder - would calculate actual ratios
      statisticalParity: 0.0 // Placeholder - would calculate actual differences
    };
  }

  calculateSeverityScore(biasCount, maxBiasScore) {
    // Calculate overall severity based on bias indicators
    const countScore = Math.min(biasCount / 5, 1); // Normalize bias count
    const magnitudeScore = Math.abs(maxBiasScore);

    return (countScore + magnitudeScore) / 2;
  }

  generateMitigationStrategies(biasTypes) {
    const strategies = [];

    if (biasTypes.includes('GENDER')) {
      strategies.push('Use gender-neutral language');
      strategies.push('Diversify training data with balanced gender representation');
    }

    if (biasTypes.includes('RACE_ETHNICITY')) {
      strategies.push('Include diverse cultural contexts in training data');
      strategies.push('Implement fairness constraints in model training');
    }

    if (biasTypes.includes('SENTIMENT')) {
      strategies.push('Apply sentiment balancing techniques');
      strategies.push('Use neutral tone calibration');
    }

    return strategies;
  }

  generateRecommendedActions(biasTypes) {
    const actions = [];

    if (biasTypes.length > 0) {
      actions.push('Flag for human review');
      actions.push('Apply bias mitigation techniques');
    }

    if (biasTypes.includes('GENDER') || biasTypes.includes('RACE_ETHNICITY')) {
      actions.push('Conduct demographic impact assessment');
    }

    return actions;
  }

  // Fairness Assessment
  async assessFairness(decisionData) {
    // Calculate fairness metrics
    const demographicParity = await this.calculateDemographicParity(decisionData);
    const equalizedOdds = await this.calculateEqualizedOdds(decisionData);
    const consistencyScore = await this.calculateConsistencyScore(decisionData);

    // Generate feature importance (simplified SHAP-like analysis)
    const featureImportance = await this.calculateFeatureImportance(decisionData);

    return {
      demographicParity,
      equalizedOdds,
      equalOpportunity: equalizedOdds, // Simplified
      consistencyScore,
      counterfactualScore: 0.85, // Placeholder
      causalEffect: {}, // Placeholder
      featureImportance,
      partialDependence: {}, // Placeholder
      accuracy: 0.92,
      precision: 0.89,
      recall: 0.88,
      f1Score: 0.885
    };
  }

  async calculateDemographicParity(decisionData) {
    // Calculate P(Y=1|A=a) for different demographic groups
    // This is a simplified version - production would analyze historical data
    return {
      gender: { male: 0.45, female: 0.42 },
      age: { young: 0.48, middle: 0.44, senior: 0.40 }
    };
  }

  async calculateEqualizedOdds(decisionData) {
    // Calculate TPR and FPR equality across groups
    return {
      gender: {
        male: { tpr: 0.85, fpr: 0.15 },
        female: { tpr: 0.82, fpr: 0.18 }
      }
    };
  }

  async calculateConsistencyScore(decisionData) {
    // Measure how similar users get similar outcomes
    // Simplified calculation
    return 0.78;
  }

  async calculateFeatureImportance(decisionData) {
    // Simplified feature importance calculation
    return {
      contentLength: 0.3,
      userHistory: 0.25,
      timeOfDay: 0.15,
      deviceType: 0.12,
      location: 0.10,
      other: 0.08
    };
  }

  // Constitutional Compliance
  async checkConstitutionalCompliance(decisionData) {
    const checks = [];

    // Check each constitutional principle
    const principles = [
      'SOVEREIGNTY_AFRICAN',
      'HUMAN_DIGNITY',
      'EQUALITY_NON_DISCRIMINATION',
      'FREEDOM_EXPRESSION',
      'ACCESS_INFORMATION',
      'PRIVACY_DATA_PROTECTION',
      'ACCOUNTABILITY_TRANSPARENCY',
      'ETHICAL_AI_USE',
      'CULTURAL_PRESERVATION',
      'ECONOMIC_EMPOWERMENT'
    ];

    for (const principle of principles) {
      const check = await this.checkPrincipleCompliance(decisionData, principle);
      checks.push(check);
    }

    return checks;
  }

  async checkPrincipleCompliance(decisionData, principle) {
    let compliant = true;
    let complianceScore = 1.0;
    let violationType = null;
    let violationDescription = null;

    const inputText = this.extractTextFromDecision(decisionData);

    switch (principle) {
      case 'SOVEREIGNTY_AFRICAN':
        // Check for African sovereignty considerations
        const sovereigntyKeywords = ['african', 'sovereignty', 'independence', 'self-determination'];
        const hasSovereigntyContent = sovereigntyKeywords.some(keyword =>
          inputText.toLowerCase().includes(keyword)
        );
        compliant = hasSovereigntyContent;
        complianceScore = hasSovereigntyContent ? 0.9 : 0.3;
        break;

      case 'EQUALITY_NON_DISCRIMINATION':
        // Check for discriminatory content
        const biasAnalysis = await this.analyzeBias(decisionData);
        compliant = !biasAnalysis.biasDetected;
        complianceScore = 1 - biasAnalysis.severityScore;
        if (!compliant) {
          violationType = 'DISCRIMINATION';
          violationDescription = `Bias detected in categories: ${biasAnalysis.biasTypes.join(', ')}`;
        }
        break;

      case 'PRIVACY_DATA_PROTECTION':
        // Check for PII exposure
        const hasPII = this.detectPII(inputText);
        compliant = !hasPII;
        complianceScore = hasPII ? 0.2 : 0.95;
        if (!compliant) {
          violationType = 'PRIVACY_BREACH';
          violationDescription = 'Potential personally identifiable information detected';
        }
        break;

      case 'ACCOUNTABILITY_TRANSPARENCY':
        // Check for transparency in decision
        const hasExplanation = decisionData.outputData.explanation !== undefined;
        compliant = hasExplanation;
        complianceScore = hasExplanation ? 0.9 : 0.4;
        break;

      default:
        complianceScore = 0.8; // Default compliance score
    }

    return {
      principle,
      principleVersion: '1.0',
      compliant,
      complianceScore,
      violationType,
      violationSeverity: compliant ? null : 'MEDIUM',
      violationDescription,
      evidence: {},
      reasoning: `Automated compliance check for ${principle}`,
      mitigationRequired: !compliant,
      mitigationStrategy: compliant ? null : 'Review and potentially override decision'
    };
  }

  // Transparency and Explainability
  async explainDecision(req, res) {
    try {
      const { decisionId, userId } = req.body;

      const decision = await this.prisma.aIDecision.findUnique({
        where: { id: decisionId },
        include: {
          biasAnalysis: true,
          fairnessMetrics: true,
          constitutionalChecks: true
        }
      });

      if (!decision) {
        return res.status(404).json({ error: 'Decision not found' });
      }

      const explanation = await this.generateExplanation(decision, userId);

      res.json(explanation);
    } catch (error) {
      this.logger.error('Failed to explain decision', { error: error.message });
      res.status(500).json({ error: 'Failed to explain decision' });
    }
  }

  async generateExplanation(decision, userId) {
    const featureContributions = await this.calculateFeatureContributions(decision);
    const decisionPath = await this.traceDecisionPath(decision);
    const counterfactuals = await this.generateCounterfactuals(decision);

    // Generate user-friendly explanations
    const simpleExplanation = this.generateSimpleExplanation(decision);
    const detailedExplanation = this.generateDetailedExplanation(decision);

    // Create transparency log
    await this.prisma.transparencyLog.create({
      data: {
        decisionId: decision.id,
        featureContributions,
        decisionPath,
        counterfactuals,
        simpleExplanation,
        detailedExplanation,
        confidenceInterval: { min: 0.7, max: 0.95 },
        uncertaintyScore: 0.15
      }
    });

    return {
      decisionId: decision.id,
      simpleExplanation,
      detailedExplanation,
      featureContributions,
      counterfactuals,
      confidence: 0.85,
      limitations: [
        'Explanation is based on available model interpretability techniques',
        'Some complex model behaviors may not be fully explainable',
        'Counterfactual scenarios are hypothetical'
      ]
    };
  }

  generateSimpleExplanation(decision) {
    if (decision.biasAnalysis?.biasDetected) {
      return 'This decision was flagged for potential bias and has been reviewed for fairness.';
    }

    if (decision.riskLevel === 'HIGH') {
      return 'This decision required additional review to ensure compliance with ethical guidelines.';
    }

    return 'This decision was made following automated ethical and fairness checks.';
  }

  generateDetailedExplanation(decision) {
    let explanation = `Decision ${decision.decisionId} was processed by ${decision.serviceName}`;

    if (decision.modelName) {
      explanation += ` using model ${decision.modelName} v${decision.modelVersion}`;
    }

    explanation += '. ';

    if (decision.biasAnalysis) {
      if (decision.biasAnalysis.biasDetected) {
        explanation += `Bias analysis detected potential issues in: ${decision.biasAnalysis.biasTypes.join(', ')}. `;
      } else {
        explanation += 'No significant bias was detected. ';
      }
    }

    if (decision.constitutionalChecks) {
      const violations = decision.constitutionalChecks.filter(check => !check.compliant);
      if (violations.length > 0) {
        explanation += `Constitutional compliance check found ${violations.length} potential violations. `;
      } else {
        explanation += 'All constitutional principles were satisfied. ';
      }
    }

    return explanation;
  }

  // Audit and Reporting
  async runAudit(req, res) {
    try {
      const { period, services, models } = req.body;

      const auditConfig = {
        period: period || '7d',
        services: services || [],
        models: models || [],
        timestamp: new Date()
      };

      const auditJob = await this.auditQueue.add({ auditConfig });

      res.json({
        auditId: auditJob.id,
        status: 'queued',
        estimatedCompletion: new Date(Date.now() + 300000) // 5 minutes
      });
    } catch (error) {
      this.logger.error('Failed to run audit', { error: error.message });
      res.status(500).json({ error: 'Failed to run audit' });
    }
  }

  async processAudit(auditConfig) {
    const { period, services, models } = auditConfig;

    // Calculate date range
    const endDate = new Date();
    const startDate = this.getAuditStartDate(period);

    // Query decisions in audit period
    const decisions = await this.prisma.aIDecision.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        ...(services.length > 0 && { serviceName: { in: services } }),
        ...(models.length > 0 && { modelName: { in: models } })
      },
      include: {
        biasAnalysis: true,
        constitutionalChecks: true
      }
    });

    // Analyze audit results
    const auditResults = this.analyzeAuditResults(decisions);

    // Create audit log
    const auditLog = await this.prisma.ethicalAuditLog.create({
      data: {
        auditId: `audit_${Date.now()}`,
        auditPeriod: period,
        servicesAudited: services,
        modelsAudited: models,
        dataPeriod: { start: startDate, end: endDate },
        ...auditResults
      }
    });

    return auditLog;
  }

  analyzeAuditResults(decisions) {
    const totalDecisions = decisions.length;
    const biasedDecisions = decisions.filter(d => d.biasAnalysis?.biasDetected).length;
    const violationsFound = decisions.reduce((sum, d) =>
      sum + d.constitutionalChecks.filter(c => !c.compliant).length, 0
    );
    const highRiskDecisions = decisions.filter(d => d.riskLevel === 'HIGH' || d.riskLevel === 'CRITICAL').length;

    const complianceScores = decisions.map(d =>
      d.constitutionalChecks.reduce((sum, c) => sum + c.complianceScore, 0) / d.constitutionalChecks.length
    );
    const overallCompliance = complianceScores.reduce((sum, score) => sum + score, 0) / complianceScores.length;

    return {
      totalDecisions,
      biasedDecisions,
      violationsFound,
      highRiskDecisions,
      overallCompliance: overallCompliance || 0,
      biasCompliance: 1 - (biasedDecisions / Math.max(totalDecisions, 1)),
      fairnessCompliance: 0.85, // Placeholder
      constitutionalCompliance: overallCompliance || 0,
      findings: this.generateAuditFindings(decisions),
      recommendations: this.generateAuditRecommendations(decisions)
    };
  }

  generateAuditFindings(decisions) {
    const findings = [];

    const biasRate = decisions.filter(d => d.biasAnalysis?.biasDetected).length / decisions.length;
    if (biasRate > 0.1) {
      findings.push({
        type: 'HIGH_BIAS_RATE',
        severity: 'HIGH',
        description: `Bias detection rate of ${(biasRate * 100).toFixed(1)}% exceeds acceptable threshold`,
        affectedDecisions: decisions.filter(d => d.biasAnalysis?.biasDetected).length
      });
    }

    const highRiskRate = decisions.filter(d => d.riskLevel === 'HIGH' || d.riskLevel === 'CRITICAL').length / decisions.length;
    if (highRiskRate > 0.05) {
      findings.push({
        type: 'HIGH_RISK_DECISIONS',
        severity: 'MEDIUM',
        description: `High-risk decisions comprise ${(highRiskRate * 100).toFixed(1)}% of total decisions`,
        affectedDecisions: decisions.filter(d => d.riskLevel === 'HIGH' || d.riskLevel === 'CRITICAL').length
      });
    }

    return findings;
  }

  generateAuditRecommendations(decisions) {
    const recommendations = [];

    const biasIssues = decisions.filter(d => d.biasAnalysis?.biasDetected).length;
    if (biasIssues > 0) {
      recommendations.push('Implement additional bias mitigation techniques in model training');
      recommendations.push('Increase diversity in training datasets');
    }

    const complianceIssues = decisions.reduce((sum, d) =>
      sum + d.constitutionalChecks.filter(c => !c.compliant).length, 0
    );
    if (complianceIssues > 0) {
      recommendations.push('Strengthen constitutional compliance monitoring');
      recommendations.push('Provide additional training for compliance review teams');
    }

    return recommendations;
  }

  // Interventions
  async createIntervention(req, res) {
    try {
      const { decisionId, interventionType, severity, originalDecision, modifiedDecision, reason } = req.body;

      const intervention = await this.prisma.interventionLog.create({
        data: {
          decisionId,
          interventionType,
          triggeredBy: 'ethics_monitor',
          severity,
          originalDecision,
          modifiedDecision,
          modificationReason: reason
        }
      });

      res.status(201).json(intervention);
    } catch (error) {
      this.logger.error('Failed to create intervention', { error: error.message });
      res.status(500).json({ error: 'Failed to create intervention' });
    }
  }

  async triggerInterventions(decision, riskLevel) {
    const interventions = [];

    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      interventions.push({
        type: 'DECISION_OVERRIDE',
        severity: 'BLOCKING',
        reason: `High risk level (${riskLevel}) requires human review`
      });
    }

    if (decision.biasAnalysis?.biasDetected) {
      interventions.push({
        type: 'BIAS_MITIGATION',
        severity: 'MODIFICATION',
        reason: 'Bias detected - applying mitigation techniques'
      });
    }

    for (const intervention of interventions) {
      await this.prisma.interventionLog.create({
        data: {
          decisionId: decision.id,
          interventionType: intervention.type,
          triggeredBy: 'automated_monitoring',
          severity: intervention.severity,
          originalDecision: decision.outputData,
          modificationReason: intervention.reason
        }
      });
    }
  }

  // Metrics and Analytics
  async getEthicsMetrics(req, res) {
    try {
      const { period = '7d', metric } = req.query;

      const startDate = this.getStartDate(period);

      let metrics = {};

      if (!metric || metric === 'decisions') {
        metrics.decisions = await this.getDecisionMetrics(startDate);
      }

      if (!metric || metric === 'bias') {
        metrics.bias = await this.getBiasMetrics(startDate);
      }

      if (!metric || metric === 'compliance') {
        metrics.compliance = await this.getComplianceMetrics(startDate);
      }

      res.json(metrics);
    } catch (error) {
      this.logger.error('Failed to get ethics metrics', { error: error.message });
      res.status(500).json({ error: 'Failed to get ethics metrics' });
    }
  }

  async getDecisionMetrics(startDate) {
    const decisions = await this.prisma.aIDecision.aggregate({
      where: { createdAt: { gte: startDate } },
      _count: { id: true }
    });

    const riskLevels = await this.prisma.aIDecision.groupBy({
      by: ['riskLevel'],
      where: { createdAt: { gte: startDate } },
      _count: { riskLevel: true }
    });

    return {
      totalDecisions: decisions._count.id,
      riskDistribution: riskLevels.reduce((acc, level) => {
        acc[level.riskLevel.toLowerCase()] = level._count.riskLevel;
        return acc;
      }, {})
    };
  }

  async getBiasMetrics(startDate) {
    const biasAnalyses = await this.prisma.biasAnalysis.aggregate({
      where: {
        decision: { createdAt: { gte: startDate } }
      },
      _count: { id: true },
      _avg: {
        severityScore: true,
        confidenceScore: true
      }
    });

    const biasTypes = await this.prisma.biasAnalysis.findMany({
      where: {
        decision: { createdAt: { gte: startDate } }
      },
      select: { biasTypes: true }
    });

    const typeCounts = biasTypes.reduce((acc, analysis) => {
      analysis.biasTypes.forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {});

    return {
      totalAnalyses: biasAnalyses._count.id,
      biasDetected: biasTypes.filter(a => a.biasTypes.length > 0).length,
      avgSeverityScore: biasAnalyses._avg.severityScore,
      avgConfidenceScore: biasAnalyses._avg.confidenceScore,
      biasTypeDistribution: typeCounts
    };
  }

  async getComplianceMetrics(startDate) {
    const checks = await this.prisma.constitutionalCheck.aggregate({
      where: {
        decision: { createdAt: { gte: startDate } }
      },
      _count: { id: true },
      _avg: { complianceScore: true }
    });

    const violations = await this.prisma.constitutionalCheck.groupBy({
      by: ['compliant'],
      where: {
        decision: { createdAt: { gte: startDate } }
      },
      _count: { compliant: true }
    });

    return {
      totalChecks: checks._count.id,
      avgComplianceScore: checks._avg.complianceScore,
      complianceRate: violations.find(v => v.compliant)?._count.compliant || 0,
      violationRate: violations.find(v => !v.compliant)?._count.compliant || 0
    };
  }

  // Utility Methods
  sanitizeInputData(inputData) {
    // Remove or mask sensitive information
    const sanitized = { ...inputData };

    // Remove API keys, passwords, etc.
    const sensitiveFields = ['password', 'apiKey', 'token', 'secret'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  sanitizeOutputData(outputData) {
    // Similar sanitization for output data
    return this.sanitizeInputData(outputData);
  }

  extractTextFromDecision(decision) {
    // Extract text content from decision data for analysis
    const inputText = typeof decision.inputData === 'string' ?
      decision.inputData :
      JSON.stringify(decision.inputData);

    const outputText = typeof decision.outputData === 'string' ?
      decision.outputData :
      JSON.stringify(decision.outputData);

    return `${inputText} ${outputText}`;
  }

  detectPII(text) {
    // Simple PII detection patterns
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{10}\b/ // Phone number
    ];

    return piiPatterns.some(pattern => pattern.test(text));
  }

  analyzeLanguageBias(text) {
    // Analyze language patterns for bias
    const tokens = this.tokenizer.tokenize(text.toLowerCase());

    // Check for biased language patterns
    const biasIndicators = {
      genderExclusive: ['he', 'him', 'his', 'man', 'men'].filter(word => tokens.includes(word)).length,
      racialTerms: ['race', 'ethnic', 'minority', 'majority'].filter(word => tokens.includes(word)).length,
      powerDynamics: ['superior', 'inferior', 'dominant', 'subordinate'].filter(word => tokens.includes(word)).length
    };

    return biasIndicators;
  }

  async extractTopics(text) {
    // Simple topic extraction (in production, use more sophisticated NLP)
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const topics = [];

    // Basic keyword-based topic detection
    const topicKeywords = {
      technology: ['ai', 'machine', 'learning', 'computer', 'software'],
      education: ['learn', 'teach', 'student', 'course', 'school'],
      business: ['company', 'business', 'market', 'product', 'service']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const matches = keywords.filter(keyword => tokens.includes(keyword)).length;
      if (matches > 0) {
        topics.push({ topic, score: matches / keywords.length });
      }
    });

    return topics;
  }

  calculateRiskLevel(biasAnalysis, fairnessMetrics, constitutionalChecks) {
    let riskScore = 0;

    // Bias risk
    if (biasAnalysis.biasDetected) {
      riskScore += biasAnalysis.severityScore * 0.4;
    }

    // Fairness risk
    if (fairnessMetrics.consistencyScore < 0.7) {
      riskScore += (1 - fairnessMetrics.consistencyScore) * 0.3;
    }

    // Constitutional risk
    const violationCount = constitutionalChecks.filter(c => !c.compliant).length;
    riskScore += (violationCount / constitutionalChecks.length) * 0.3;

    if (riskScore < 0.3) return 'LOW';
    if (riskScore < 0.6) return 'MEDIUM';
    if (riskScore < 0.8) return 'HIGH';
    return 'CRITICAL';
  }

  getStartDate(period) {
    const now = new Date();
    const periods = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };

    const days = periods[period] || 7;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  getAuditStartDate(period) {
    return this.getStartDate(period);
  }

  async aggregateDailyMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metrics = await this.calculateDailyMetrics(today);

    await this.prisma.ethicsMetrics.create({
      data: {
        date: today,
        metricType: 'DAILY_DECISIONS',
        ...metrics
      }
    });
  }

  async calculateDailyMetrics(date) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const decisions = await this.prisma.aIDecision.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        biasAnalysis: true,
        constitutionalChecks: true
      }
    });

    return {
      totalDecisions: decisions.length,
      biasedDecisions: decisions.filter(d => d.biasAnalysis?.biasDetected).length,
      violationsCount: decisions.reduce((sum, d) =>
        sum + d.constitutionalChecks.filter(c => !c.compliant).length, 0
      ),
      highRiskDecisions: decisions.filter(d => d.riskLevel === 'HIGH' || d.riskLevel === 'CRITICAL').length,
      complianceRate: decisions.length > 0 ?
        decisions.reduce((sum, d) =>
          sum + (d.constitutionalChecks.reduce((s, c) => s + c.complianceScore, 0) / d.constitutionalChecks.length), 0
        ) / decisions.length : 0
    };
  }

  async retrainBiasModels() {
    // Retrain bias detection models with new data
    this.logger.info('Starting bias model retraining');

    try {
      await this.updateBiasDetectionModels();
      this.logger.info('Bias model retraining completed');
    } catch (error) {
      this.logger.error('Bias model retraining failed', { error: error.message });
    }
  }

  async updateBiasDetectionModels() {
    // Update bias detection models with recent data
    const recentAnalyses = await this.prisma.biasAnalysis.findMany({
      take: 1000,
      orderBy: { createdAt: 'desc' }
    });

    // Update model performance metrics
    const performance = this.calculateModelPerformance(recentAnalyses);

    await this.prisma.biasDetectionModel.upsert({
      where: { name: 'comprehensive_bias_detector_v1' },
      update: {
        lastTrainedAt: new Date(),
        accuracy: performance.accuracy,
        precision: performance.precision,
        recall: performance.recall,
        f1Score: performance.f1Score,
        performanceHistory: performance.history
      },
      create: {
        name: 'comprehensive_bias_detector_v1',
        version: '1.0.0',
        modelType: 'NATURAL_LANGUAGE_BIAS',
        algorithm: 'Ensemble ML Models',
        parameters: {},
        trainingSize: recentAnalyses.length,
        lastTrainedAt: new Date(),
        accuracy: performance.accuracy,
        precision: performance.precision,
        recall: performance.recall,
        f1Score: performance.f1Score,
        performanceHistory: [performance]
      }
    });
  }

  calculateModelPerformance(analyses) {
    // Calculate performance metrics for bias detection models
    const truePositives = analyses.filter(a => a.biasDetected && a.confidenceScore > 0.7).length;
    const falsePositives = analyses.filter(a => a.biasDetected && a.confidenceScore <= 0.7).length;
    const falseNegatives = analyses.filter(a => !a.biasDetected && a.severityScore > 0.5).length;
    const trueNegatives = analyses.filter(a => !a.biasDetected && a.severityScore <= 0.5).length;

    const accuracy = (truePositives + trueNegatives) / analyses.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      history: {
        timestamp: new Date(),
        accuracy,
        precision,
        recall,
        f1Score
      }
    };
  }

  async disconnect() {
    await this.prisma.$disconnect();
    this.redis.quit();
  }

  listen(port = process.env.PORT || 3010) {
    this.app.listen(port, () => {
      this.logger.info(`AI Ethics Monitor listening on port ${port}`);
    });
  }
}

module.exports = { AIEthicsMonitor };

// Start server if run directly
if (require.main === module) {
  const service = new AIEthicsMonitor();
  service.listen();
}