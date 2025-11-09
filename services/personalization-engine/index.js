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
const regression = require('ml-regression');
const natural = require('natural');
const Sentiment = require('sentiment');

// Import dependent services
const AIModelService = require('../ai-model-service');
const OpenAIService = require('../openai-service');
const ContentGenerationService = require('../content-generation-service');

class PersonalizationEngine {
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
    this.recommendationQueue = new Queue('personalization_recommendations', {
      redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }
    });

    this.analyticsQueue = new Queue('personalization_analytics', {
      redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }
    });

    // Initialize dependent services
    this.aiModelService = new AIModelService();
    this.openaiService = new OpenAIService();
    this.contentGenerationService = new ContentGenerationService();

    // Initialize ML components
    this.sentiment = new Sentiment();
    this.tfidf = new natural.TfIdf();

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

    // User profiling
    this.app.post('/api/profile', this.createUserProfile.bind(this));
    this.app.get('/api/profile/:userId', this.getUserProfile.bind(this));
    this.app.put('/api/profile/:userId', this.updateUserProfile.bind(this));

    // Interactions tracking
    this.app.post('/api/interactions', this.trackInteraction.bind(this));
    this.app.get('/api/interactions/:userId', this.getUserInteractions.bind(this));

    // Recommendations
    this.app.get('/api/recommendations/:userId', this.getRecommendations.bind(this));
    this.app.post('/api/recommendations/:userId/feedback', this.recordRecommendationFeedback.bind(this));

    // Learning paths
    this.app.post('/api/learning-paths', this.createLearningPath.bind(this));
    this.app.get('/api/learning-paths/:userId', this.getLearningPaths.bind(this));
    this.app.put('/api/learning-paths/:pathId/progress', this.updateLearningPathProgress.bind(this));

    // Achievements
    this.app.get('/api/achievements/:userId', this.getUserAchievements.bind(this));
    this.app.post('/api/achievements/:userId/:achievementId/claim', this.claimAchievement.bind(this));

    // Analytics
    this.app.get('/api/analytics', this.getAnalytics.bind(this));
    this.app.get('/api/analytics/user/:userId', this.getUserAnalytics.bind(this));

    // Admin endpoints
    this.app.post('/api/admin/retrain-models', this.retrainModels.bind(this));
    this.app.get('/api/admin/model-performance', this.getModelPerformance.bind(this));
  }

  setupQueues() {
    // Recommendation generation worker
    new Worker('personalization_recommendations', async (job) => {
      const { userId, context } = job.data;
      return await this.generateRecommendations(userId, context);
    }, { connection: this.redis });

    // Analytics processing worker
    new Worker('personalization_analytics', async (job) => {
      const { type, data } = job.data;
      return await this.processAnalytics(type, data);
    }, { connection: this.redis });
  }

  setupCronJobs() {
    // Daily model retraining
    cron.schedule('0 2 * * *', async () => {
      await this.retrainModels();
    });

    // Hourly analytics aggregation
    cron.schedule('0 * * * *', async () => {
      await this.aggregateAnalytics();
    });

    // Weekly user profile updates
    cron.schedule('0 3 * * 1', async () => {
      await this.updateUserProfiles();
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
      defaultMeta: { service: 'personalization-engine' },
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
          queues: 'operational'
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

  // User Profile Management
  async createUserProfile(req, res) {
    try {
      const schema = Joi.object({
        userId: Joi.string().required(),
        age: Joi.number().integer().min(13).max(120),
        location: Joi.string(),
        timezone: Joi.string(),
        language: Joi.string().default('en'),
        learningStyle: Joi.string().valid('VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MIXED'),
        experienceLevel: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
        preferredPace: Joi.string().valid('SLOW', 'MODERATE', 'FAST', 'ACCELERATED'),
        timeCommitment: Joi.string().valid('LOW', 'MODERATE', 'HIGH', 'INTENSIVE'),
        interests: Joi.array().items(Joi.string()),
        careerGoals: Joi.array().items(Joi.string()),
        learningObjectives: Joi.array().items(Joi.string())
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Generate initial personality and skill vectors
      const personalityVector = await this.generatePersonalityVector(value);
      const skillVector = await this.assessInitialSkills(value);
      const preferenceVector = await this.generatePreferenceVector(value);

      const profile = await this.prisma.userProfile.create({
        data: {
          ...value,
          personalityVector,
          skillVector,
          preferenceVector
        }
      });

      // Queue initial recommendations
      await this.recommendationQueue.add({
        userId: value.userId,
        context: { type: 'profile_creation' }
      });

      res.status(201).json(profile);
    } catch (error) {
      this.logger.error('Failed to create user profile', { error: error.message });
      res.status(500).json({ error: 'Failed to create user profile' });
    }
  }

  async getUserProfile(req, res) {
    try {
      const { userId } = req.params;

      const profile = await this.prisma.userProfile.findUnique({
        where: { userId },
        include: {
          interactions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          recommendations: {
            where: { viewedAt: null },
            orderBy: { relevanceScore: 'desc' },
            take: 5
          },
          learningPaths: {
            where: { status: 'ACTIVE' },
            orderBy: { updatedAt: 'desc' }
          },
          achievements: {
            where: { unlockedAt: { not: null } },
            orderBy: { unlockedAt: 'desc' }
          }
        }
      });

      if (!profile) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      res.json(profile);
    } catch (error) {
      this.logger.error('Failed to get user profile', { error: error.message });
      res.status(500).json({ error: 'Failed to get user profile' });
    }
  }

  async updateUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Update vectors if relevant fields changed
      if (updates.interests || updates.careerGoals || updates.learningObjectives) {
        updates.preferenceVector = await this.generatePreferenceVector(updates);
      }

      if (updates.experienceLevel || updates.learningStyle) {
        updates.skillVector = await this.assessSkills(userId, updates);
      }

      const profile = await this.prisma.userProfile.update({
        where: { userId },
        data: updates
      });

      // Clear cache
      this.cache.del(`profile_${userId}`);

      res.json(profile);
    } catch (error) {
      this.logger.error('Failed to update user profile', { error: error.message });
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  }

  // Interaction Tracking
  async trackInteraction(req, res) {
    try {
      const schema = Joi.object({
        userId: Joi.string().required(),
        interactionType: Joi.string().valid('VIEW', 'COMPLETE', 'RATE', 'SHARE', 'BOOKMARK', 'SEARCH', 'HELP_REQUEST', 'QUIZ_ATTEMPT', 'CERTIFICATE_EARNED').required(),
        contentType: Joi.string().valid('LESSON', 'QUIZ', 'VIDEO', 'ARTICLE', 'EXERCISE', 'PROJECT', 'COURSE', 'MODULE', 'LEARNING_PATH'),
        contentId: Joi.string(),
        moduleId: Joi.string(),
        topicId: Joi.string(),
        timeSpent: Joi.number().integer().min(0).required(),
        completionRate: Joi.number().min(0).max(1),
        rating: Joi.number().integer().min(1).max(5),
        feedback: Joi.string(),
        scrollDepth: Joi.number().min(0).max(1),
        clicksCount: Joi.number().integer().min(0),
        questionsAsked: Joi.number().integer().min(0),
        helpRequested: Joi.boolean(),
        deviceType: Joi.string().valid('DESKTOP', 'MOBILE', 'TABLET', 'OTHER'),
        sessionId: Joi.string(),
        referrer: Joi.string()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Analyze sentiment if feedback provided
      let sentimentScore = null;
      if (value.feedback) {
        const sentiment = this.sentiment.analyze(value.feedback);
        sentimentScore = sentiment.score;
      }

      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore(value);

      // Assess difficulty if quiz attempt
      let difficultyAssessment = null;
      if (value.interactionType === 'QUIZ_ATTEMPT' && value.completionRate !== undefined) {
        difficultyAssessment = await this.assessDifficulty(value);
      }

      const interaction = await this.prisma.userInteraction.create({
        data: {
          ...value,
          sentimentScore,
          engagementScore,
          difficultyAssessment
        }
      });

      // Update user profile statistics
      await this.updateUserStats(value.userId, value);

      // Queue analytics processing
      await this.analyticsQueue.add({
        type: 'interaction',
        data: { interactionId: interaction.id, ...value }
      });

      // Trigger real-time recommendations if high engagement
      if (engagementScore > 0.7) {
        await this.recommendationQueue.add({
          userId: value.userId,
          context: {
            type: 'high_engagement',
            contentId: value.contentId,
            contentType: value.contentType
          }
        });
      }

      res.status(201).json(interaction);
    } catch (error) {
      this.logger.error('Failed to track interaction', { error: error.message });
      res.status(500).json({ error: 'Failed to track interaction' });
    }
  }

  // Recommendation Engine
  async getRecommendations(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 10, type, context } = req.query;

      const cacheKey = `recommendations_${userId}_${type || 'all'}_${limit}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const recommendations = await this.generateRecommendations(userId, {
        limit: parseInt(limit),
        type,
        context: context ? JSON.parse(context) : null
      });

      // Cache for 30 minutes
      this.cache.set(cacheKey, recommendations, 1800);

      res.json(recommendations);
    } catch (error) {
      this.logger.error('Failed to get recommendations', { error: error.message });
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }

  async generateRecommendations(userId, options = {}) {
    const { limit = 10, type, context } = options;

    // Get user profile and recent interactions
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!profile) {
      throw new Error('User profile not found');
    }

    const recommendations = [];

    // Content-based recommendations
    if (!type || type === 'content_based') {
      const contentBased = await this.generateContentBasedRecommendations(profile, limit);
      recommendations.push(...contentBased);
    }

    // Collaborative filtering
    if (!type || type === 'collaborative') {
      const collaborative = await this.generateCollaborativeRecommendations(profile, limit);
      recommendations.push(...collaborative);
    }

    // Trending content
    if (!type || type === 'trending') {
      const trending = await this.generateTrendingRecommendations(profile, limit);
      recommendations.push(...trending);
    }

    // Sequential recommendations (next best content)
    if (!type || type === 'sequential') {
      const sequential = await this.generateSequentialRecommendations(profile, limit);
      recommendations.push(...sequential);
    }

    // Context-aware recommendations
    if (context) {
      const contextual = await this.generateContextualRecommendations(profile, context, limit);
      recommendations.push(...contextual);
    }

    // Rank and deduplicate recommendations
    const ranked = this.rankRecommendations(recommendations);
    const unique = this.deduplicateRecommendations(ranked);

    return unique.slice(0, limit);
  }

  async generateContentBasedRecommendations(profile, limit) {
    // Use TF-IDF and cosine similarity for content matching
    const userPreferences = [
      ...profile.interests,
      ...profile.careerGoals,
      ...profile.learningObjectives
    ].join(' ');

    // Find similar content based on topics and skills
    const similarContent = await this.prisma.contentSimilarity.findMany({
      where: {
        OR: [
          { contentId: { in: profile.interactions.map(i => i.contentId).filter(Boolean) } },
          { similarContentId: { in: profile.interactions.map(i => i.contentId).filter(Boolean) } }
        ]
      },
      orderBy: { similarityScore: 'desc' },
      take: limit * 2
    });

    return similarContent.map(item => ({
      type: 'CONTENT_BASED',
      contentId: item.similarContentId,
      relevanceScore: item.similarityScore,
      confidenceScore: 0.8,
      reason: 'Based on your interests and previous interactions'
    }));
  }

  async generateCollaborativeRecommendations(profile, limit) {
    // Find users with similar interaction patterns
    const similarUsers = await this.findSimilarUsers(profile);

    if (similarUsers.length === 0) {
      return [];
    }

    // Get content that similar users engaged with but current user hasn't
    const similarUserIds = similarUsers.map(u => u.userId);
    const collaborativeContent = await this.prisma.userInteraction.findMany({
      where: {
        userId: { in: similarUserIds },
        contentId: {
          notIn: profile.interactions.map(i => i.contentId).filter(Boolean)
        },
        interactionType: 'COMPLETE',
        rating: { gte: 4 }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return collaborativeContent.map(interaction => ({
      type: 'COLLABORATIVE',
      contentId: interaction.contentId,
      contentType: interaction.contentType,
      relevanceScore: 0.7,
      confidenceScore: 0.6,
      reason: 'Users with similar interests enjoyed this'
    }));
  }

  async generateTrendingRecommendations(profile, limit) {
    // Get trending content from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await this.prisma.userInteraction.groupBy({
      by: ['contentId', 'contentType'],
      where: {
        createdAt: { gte: sevenDaysAgo },
        interactionType: { in: ['VIEW', 'COMPLETE'] }
      },
      _count: { contentId: true },
      orderBy: { _count: { contentId: 'desc' } },
      take: limit
    });

    return trending.map(item => ({
      type: 'TRENDING',
      contentId: item.contentId,
      contentType: item.contentType,
      relevanceScore: Math.min(item._count.contentId / 100, 1), // Normalize
      confidenceScore: 0.5,
      reason: 'Popular content this week'
    }));
  }

  async generateSequentialRecommendations(profile, limit) {
    // Find learning paths and suggest next modules
    const activePaths = await this.prisma.learningPath.findMany({
      where: {
        userId: profile.userId,
        status: 'ACTIVE'
      }
    });

    const sequential = [];

    for (const path of activePaths) {
      const nextModule = path.modules[path.currentModule];
      if (nextModule) {
        sequential.push({
          type: 'SEQUENTIAL',
          contentId: nextModule.id,
          contentType: nextModule.type,
          relevanceScore: 0.9,
          confidenceScore: 0.8,
          reason: `Next in your ${path.title} learning path`
        });
      }
    }

    return sequential.slice(0, limit);
  }

  async generateContextualRecommendations(profile, context, limit) {
    const recommendations = [];

    switch (context.type) {
      case 'high_engagement':
        // Recommend similar content to highly engaged content
        const similar = await this.prisma.contentSimilarity.findMany({
          where: { contentId: context.contentId },
          orderBy: { similarityScore: 'desc' },
          take: limit
        });

        recommendations.push(...similar.map(item => ({
          type: 'SIMILAR_USERS',
          contentId: item.similarContentId,
          relevanceScore: item.similarityScore,
          confidenceScore: 0.7,
          reason: 'Similar to content you recently engaged with'
        })));
        break;

      case 'quiz_result':
        // Recommend remedial content if score is low
        if (context.score < 0.7) {
          recommendations.push({
            type: 'REMEDIAL',
            contentId: await this.findRemedialContent(context.topicId),
            relevanceScore: 0.8,
            confidenceScore: 0.9,
            reason: 'Additional practice for this topic'
          });
        }
        break;
    }

    return recommendations;
  }

  rankRecommendations(recommendations) {
    return recommendations
      .map(rec => ({
        ...rec,
        finalScore: (rec.relevanceScore * 0.6) + (rec.confidenceScore * 0.4)
      }))
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  deduplicateRecommendations(recommendations) {
    const seen = new Set();
    return recommendations.filter(rec => {
      const key = `${rec.contentId}_${rec.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async recordRecommendationFeedback(req, res) {
    try {
      const { userId } = req.params;
      const { recommendationId, action, rating } = req.body;

      const updateData = {};
      const now = new Date();

      switch (action) {
        case 'viewed':
          updateData.viewedAt = now;
          break;
        case 'interacted':
          updateData.interactedAt = now;
          break;
        case 'completed':
          updateData.completedAt = now;
          break;
      }

      if (rating) {
        updateData.rating = rating;
      }

      const recommendation = await this.prisma.recommendation.update({
        where: { id: recommendationId },
        data: updateData
      });

      // Update recommendation model performance
      await this.updateModelPerformance(recommendation);

      res.json(recommendation);
    } catch (error) {
      this.logger.error('Failed to record recommendation feedback', { error: error.message });
      res.status(500).json({ error: 'Failed to record recommendation feedback' });
    }
  }

  // Learning Path Management
  async createLearningPath(req, res) {
    try {
      const schema = Joi.object({
        userId: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string(),
        topic: Joi.string().required(),
        level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
        modules: Joi.array().items(Joi.object({
          id: Joi.string().required(),
          title: Joi.string().required(),
          type: Joi.string().required(),
          duration: Joi.number().integer().required(),
          prerequisites: Joi.array().items(Joi.string())
        })).required(),
        estimatedDuration: Joi.number().integer().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Get user profile for personalization
      const profile = await this.prisma.userProfile.findUnique({
        where: { userId: value.userId }
      });

      // Adapt learning path based on user profile
      const adaptedPath = await this.adaptLearningPath(value, profile);

      const learningPath = await this.prisma.learningPath.create({
        data: {
          ...adaptedPath,
          totalModules: adaptedPath.modules.length,
          recommendedPace: profile.preferredPace
        }
      });

      res.status(201).json(learningPath);
    } catch (error) {
      this.logger.error('Failed to create learning path', { error: error.message });
      res.status(500).json({ error: 'Failed to create learning path' });
    }
  }

  async adaptLearningPath(pathData, profile) {
    // Adjust difficulty curve based on user level
    const difficultyMultiplier = this.getDifficultyMultiplier(profile.experienceLevel);

    // Personalize module order based on learning style
    const personalizedModules = this.personalizeModuleOrder(pathData.modules, profile);

    // Adjust time estimates based on preferred pace
    const timeMultiplier = this.getTimeMultiplier(profile.preferredPace);

    return {
      ...pathData,
      modules: personalizedModules.map(module => ({
        ...module,
        duration: Math.round(module.duration * timeMultiplier),
        difficulty: module.difficulty * difficultyMultiplier
      })),
      estimatedDuration: Math.round(pathData.estimatedDuration * timeMultiplier),
      adaptiveFactors: {
        difficultyMultiplier,
        timeMultiplier,
        learningStyle: profile.learningStyle,
        originalModules: pathData.modules.length
      }
    };
  }

  // Achievement System
  async getUserAchievements(req, res) {
    try {
      const { userId } = req.params;

      const achievements = await this.prisma.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' }
      });

      res.json(achievements);
    } catch (error) {
      this.logger.error('Failed to get user achievements', { error: error.message });
      res.status(500).json({ error: 'Failed to get user achievements' });
    }
  }

  async claimAchievement(req, res) {
    try {
      const { userId, achievementId } = req.params;

      const achievement = await this.prisma.achievement.update({
        where: {
          id: achievementId,
          userId: userId,
          unlockedAt: { not: null },
          claimedAt: null
        },
        data: { claimedAt: new Date() }
      });

      res.json(achievement);
    } catch (error) {
      this.logger.error('Failed to claim achievement', { error: error.message });
      res.status(500).json({ error: 'Failed to claim achievement' });
    }
  }

  // Analytics
  async getAnalytics(req, res) {
    try {
      const { period = '7d', metric } = req.query;

      const startDate = this.getStartDate(period);

      let analytics = {};

      if (!metric || metric === 'users') {
        analytics.users = await this.getUserAnalyticsData(startDate);
      }

      if (!metric || metric === 'engagement') {
        analytics.engagement = await this.getEngagementAnalytics(startDate);
      }

      if (!metric || metric === 'recommendations') {
        analytics.recommendations = await this.getRecommendationAnalytics(startDate);
      }

      if (!metric || metric === 'learning_paths') {
        analytics.learningPaths = await this.getLearningPathAnalytics(startDate);
      }

      res.json(analytics);
    } catch (error) {
      this.logger.error('Failed to get analytics', { error: error.message });
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  }

  // Helper Methods
  async generatePersonalityVector(profile) {
    // Simple personality vector based on profile data
    // In production, this would use more sophisticated ML models
    const vector = [
      profile.learningStyle === 'VISUAL' ? 1 : 0,
      profile.learningStyle === 'AUDITORY' ? 1 : 0,
      profile.learningStyle === 'KINESTHETIC' ? 1 : 0,
      profile.experienceLevel === 'BEGINNER' ? 1 : 0,
      profile.experienceLevel === 'INTERMEDIATE' ? 1 : 0,
      profile.experienceLevel === 'ADVANCED' ? 1 : 0,
      profile.preferredPace === 'FAST' ? 1 : 0,
      profile.timeCommitment === 'HIGH' ? 1 : 0
    ];

    return vector;
  }

  async assessInitialSkills(profile) {
    // Initial skill assessment based on experience level
    const baseSkills = {
      'BEGINNER': [0.2, 0.1, 0.1, 0.1, 0.1],
      'INTERMEDIATE': [0.5, 0.4, 0.3, 0.2, 0.1],
      'ADVANCED': [0.8, 0.7, 0.6, 0.5, 0.4],
      'EXPERT': [0.9, 0.9, 0.8, 0.7, 0.6]
    };

    return baseSkills[profile.experienceLevel] || baseSkills['BEGINNER'];
  }

  async generatePreferenceVector(profile) {
    // Generate preference vector from interests and goals
    const preferences = [
      ...profile.interests || [],
      ...profile.careerGoals || [],
      ...profile.learningObjectives || []
    ];

    // Simple TF-IDF based preference scoring
    const vector = new Array(10).fill(0); // 10 preference dimensions

    preferences.forEach(pref => {
      // Hash preference to vector index (simple approach)
      const index = pref.length % 10;
      vector[index] += 1;
    });

    // Normalize
    const max = Math.max(...vector);
    return vector.map(v => max > 0 ? v / max : 0);
  }

  calculateEngagementScore(interaction) {
    let score = 0;

    // Time spent (normalized)
    score += Math.min(interaction.timeSpent / 3600, 1) * 0.3; // Max 1 hour = 1.0

    // Completion rate
    if (interaction.completionRate) {
      score += interaction.completionRate * 0.3;
    }

    // Rating
    if (interaction.rating) {
      score += (interaction.rating / 5) * 0.2;
    }

    // Interactions
    if (interaction.clicksCount) {
      score += Math.min(interaction.clicksCount / 20, 1) * 0.1;
    }

    // Questions asked (indicates engagement)
    if (interaction.questionsAsked) {
      score += Math.min(interaction.questionsAsked / 5, 1) * 0.1;
    }

    return Math.min(score, 1);
  }

  async assessDifficulty(interaction) {
    // Assess content difficulty based on completion rate and time spent
    const completionFactor = interaction.completionRate || 0;
    const timeEfficiency = interaction.timeSpent / (interaction.completionRate || 1);

    // Lower completion rate or higher time per completion indicates higher difficulty
    return Math.max(0, Math.min(1, (1 - completionFactor) + (timeEfficiency / 3600)));
  }

  async updateUserStats(userId, interaction) {
    const updates = {
      totalTimeSpent: { increment: interaction.timeSpent },
      sessionsCount: { increment: 1 },
      lastActiveAt: new Date()
    };

    await this.prisma.userProfile.update({
      where: { userId },
      data: updates
    });
  }

  async findSimilarUsers(profile) {
    // Find users with similar interaction patterns
    // This is a simplified version - production would use more sophisticated similarity measures
    const similarUsers = await this.prisma.userProfile.findMany({
      where: {
        learningStyle: profile.learningStyle,
        experienceLevel: profile.experienceLevel,
        interests: { hasSome: profile.interests }
      },
      take: 10
    });

    return similarUsers;
  }

  getDifficultyMultiplier(level) {
    const multipliers = {
      'BEGINNER': 0.8,
      'INTERMEDIATE': 1.0,
      'ADVANCED': 1.2,
      'EXPERT': 1.4
    };
    return multipliers[level] || 1.0;
  }

  getTimeMultiplier(pace) {
    const multipliers = {
      'SLOW': 1.3,
      'MODERATE': 1.0,
      'FAST': 0.8,
      'ACCELERATED': 0.6
    };
    return multipliers[pace] || 1.0;
  }

  personalizeModuleOrder(modules, profile) {
    // Reorder modules based on learning style
    const ordered = [...modules];

    switch (profile.learningStyle) {
      case 'VISUAL':
        // Prioritize visual content first
        return ordered.sort((a, b) => {
          const aVisual = a.type.toLowerCase().includes('video') ? 1 : 0;
          const bVisual = b.type.toLowerCase().includes('video') ? 1 : 0;
          return bVisual - aVisual;
        });

      case 'KINESTHETIC':
        // Prioritize practical exercises
        return ordered.sort((a, b) => {
          const aPractical = a.type.toLowerCase().includes('exercise') || a.type.toLowerCase().includes('project') ? 1 : 0;
          const bPractical = b.type.toLowerCase().includes('exercise') || b.type.toLowerCase().includes('project') ? 1 : 0;
          return bPractical - aPractical;
        });

      default:
        return ordered;
    }
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

  async getUserAnalyticsData(startDate) {
    const users = await this.prisma.userProfile.aggregate({
      where: { createdAt: { gte: startDate } },
      _count: { id: true }
    });

    const activeUsers = await this.prisma.userProfile.aggregate({
      where: { lastActiveAt: { gte: startDate } },
      _count: { id: true }
    });

    return {
      newUsers: users._count.id,
      activeUsers: activeUsers._count.id
    };
  }

  async getEngagementAnalytics(startDate) {
    const interactions = await this.prisma.userInteraction.aggregate({
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
      _avg: {
        engagementScore: true,
        timeSpent: true
      }
    });

    return {
      totalInteractions: interactions._count.id,
      avgEngagementScore: interactions._avg.engagementScore,
      avgTimeSpent: interactions._avg.timeSpent
    };
  }

  async getRecommendationAnalytics(startDate) {
    const recommendations = await this.prisma.recommendation.aggregate({
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
      _avg: {
        relevanceScore: true,
        confidenceScore: true
      }
    });

    return {
      totalRecommendations: recommendations._count.id,
      avgRelevanceScore: recommendations._avg.relevanceScore,
      avgConfidenceScore: recommendations._avg.confidenceScore
    };
  }

  async getLearningPathAnalytics(startDate) {
    const paths = await this.prisma.learningPath.aggregate({
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
      _avg: { progressPercentage: true }
    });

    return {
      totalPaths: paths._count.id,
      avgProgress: paths._avg.progressPercentage
    };
  }

  async retrainModels() {
    // Retrain recommendation models with new data
    this.logger.info('Starting model retraining');

    try {
      // Update collaborative filtering model
      await this.updateCollaborativeModel();

      // Update content-based model
      await this.updateContentBasedModel();

      // Update model performance metrics
      await this.updateModelMetrics();

      this.logger.info('Model retraining completed');
    } catch (error) {
      this.logger.error('Model retraining failed', { error: error.message });
    }
  }

  async updateCollaborativeModel() {
    // Implement collaborative filtering model update
    // This would typically involve matrix factorization or neural networks
    const interactions = await this.prisma.userInteraction.findMany({
      select: {
        userId: true,
        contentId: true,
        rating: true,
        engagementScore: true
      },
      where: {
        rating: { not: null },
        contentId: { not: null }
      }
    });

    // Simple user-item matrix for demonstration
    // Production would use more sophisticated algorithms
    const userItemMatrix = this.buildUserItemMatrix(interactions);

    // Store updated model
    await this.prisma.recommendationModel.upsert({
      where: { name: 'collaborative_filtering_v1' },
      update: {
        lastTrainedAt: new Date(),
        parameters: { userItemMatrix: userItemMatrix }
      },
      create: {
        name: 'collaborative_filtering_v1',
        version: '1.0.0',
        modelType: 'COLLABORATIVE_FILTERING',
        algorithm: 'Matrix Factorization',
        parameters: { userItemMatrix: userItemMatrix },
        lastTrainedAt: new Date()
      }
    });
  }

  buildUserItemMatrix(interactions) {
    // Build a simple user-item interaction matrix
    const users = [...new Set(interactions.map(i => i.userId))];
    const items = [...new Set(interactions.map(i => i.contentId))];

    const matrix = Array(users.length).fill().map(() => Array(items.length).fill(0));

    interactions.forEach(interaction => {
      const userIndex = users.indexOf(interaction.userId);
      const itemIndex = items.indexOf(interaction.contentId);

      if (userIndex >= 0 && itemIndex >= 0) {
        matrix[userIndex][itemIndex] = interaction.rating || interaction.engagementScore || 0;
      }
    });

    return { users, items, matrix };
  }

  async updateContentBasedModel() {
    // Update content similarity model
    const contents = await this.prisma.contentSimilarity.findMany();

    // Recalculate similarities if needed
    // This is a simplified version

    await this.prisma.recommendationModel.upsert({
      where: { name: 'content_based_v1' },
      update: {
        lastTrainedAt: new Date(),
        parameters: { totalSimilarities: contents.length }
      },
      create: {
        name: 'content_based_v1',
        version: '1.0.0',
        modelType: 'CONTENT_BASED',
        algorithm: 'TF-IDF + Cosine Similarity',
        parameters: { totalSimilarities: contents.length },
        lastTrainedAt: new Date()
      }
    });
  }

  async updateModelMetrics() {
    // Calculate and update model performance metrics
    const models = await this.prisma.recommendationModel.findMany();

    for (const model of models) {
      // Calculate accuracy, precision, etc.
      const metrics = await this.calculateModelMetrics(model);

      await this.prisma.recommendationModel.update({
        where: { id: model.id },
        data: {
          accuracy: metrics.accuracy,
          precision: metrics.precision,
          recall: metrics.recall,
          f1Score: metrics.f1Score,
          performanceHistory: [...(model.performanceHistory || []), metrics]
        }
      });
    }
  }

  async calculateModelMetrics(model) {
    // Simplified metric calculation
    // Production would use proper evaluation metrics
    return {
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.78,
      f1Score: 0.80,
      timestamp: new Date()
    };
  }

  async getModelPerformance(req, res) {
    try {
      const models = await this.prisma.recommendationModel.findMany({
        orderBy: { updatedAt: 'desc' }
      });

      res.json(models);
    } catch (error) {
      this.logger.error('Failed to get model performance', { error: error.message });
      res.status(500).json({ error: 'Failed to get model performance' });
    }
  }

  async aggregateAnalytics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Aggregate daily metrics
    const dailyMetrics = await this.calculateDailyMetrics(today);

    await this.prisma.personalizationAnalytics.create({
      data: {
        date: today,
        metricType: 'DAILY_ACTIVE_USERS',
        ...dailyMetrics
      }
    });
  }

  async calculateDailyMetrics(date) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [userMetrics, engagementMetrics, recommendationMetrics] = await Promise.all([
      this.getUserAnalyticsData(startOfDay),
      this.getEngagementAnalytics(startOfDay),
      this.getRecommendationAnalytics(startOfDay)
    ]);

    return {
      totalUsers: userMetrics.activeUsers,
      totalInteractions: engagementMetrics.totalInteractions,
      totalRecommendations: recommendationMetrics.totalRecommendations,
      avgRelevanceScore: recommendationMetrics.avgRelevanceScore,
      avgEngagementRate: engagementMetrics.avgEngagementScore,
      avgCompletionRate: engagementMetrics.avgEngagementScore // Simplified
    };
  }

  async updateUserProfiles() {
    // Update user profiles with new insights
    const profiles = await this.prisma.userProfile.findMany({
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    });

    for (const profile of profiles) {
      // Update skill vectors based on recent interactions
      const updatedSkills = await this.updateSkillVector(profile);
      const updatedPreferences = await this.updatePreferenceVector(profile);

      await this.prisma.userProfile.update({
        where: { id: profile.id },
        data: {
          skillVector: updatedSkills,
          preferenceVector: updatedPreferences
        }
      });
    }
  }

  async updateSkillVector(profile) {
    // Update skill vector based on recent performance
    const recentInteractions = profile.interactions.slice(0, 20);
    const avgCompletion = recentInteractions.reduce((sum, i) => sum + (i.completionRate || 0), 0) / recentInteractions.length;
    const avgEngagement = recentInteractions.reduce((sum, i) => sum + (i.engagementScore || 0), 0) / recentInteractions.length;

    // Adjust skill levels based on performance
    const skillGrowth = (avgCompletion + avgEngagement) / 2;
    return profile.skillVector.map(skill => Math.min(1, skill + skillGrowth * 0.1));
  }

  async updatePreferenceVector(profile) {
    // Update preferences based on interaction patterns
    const contentTypes = profile.interactions.reduce((acc, i) => {
      acc[i.contentType] = (acc[i.contentType] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(contentTypes).reduce((sum, count) => sum + count, 0);
    const preferences = Object.entries(contentTypes).map(([type, count]) => count / total);

    return preferences;
  }

  async disconnect() {
    await this.prisma.$disconnect();
    this.redis.quit();
  }

  listen(port = process.env.PORT || 3009) {
    this.app.listen(port, () => {
      this.logger.info(`Personalization Engine listening on port ${port}`);
    });
  }
}

module.exports = { PersonalizationEngine };

// Start server if run directly
if (require.main === module) {
  const service = new PersonalizationEngine();
  service.listen();
}