const { PersonalizationEngine } = require('./index');
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
jest.mock('../content-generation-service');

const mockPrisma = {
  userProfile: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn()
  },
  userInteraction: {
    create: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn()
  },
  recommendation: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn()
  },
  learningPath: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn()
  },
  achievement: {
    findMany: jest.fn(),
    update: jest.fn()
  },
  personalizationAnalytics: {
    create: jest.fn()
  },
  recommendationModel: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn()
  },
  contentSimilarity: {
    findMany: jest.fn()
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

const mockAIModelService = {
  selectModel: jest.fn()
};

const mockOpenAIService = {
  generateContent: jest.fn()
};

const mockContentGenerationService = {
  generateContent: jest.fn()
};

PrismaClient.mockImplementation(() => mockPrisma);
Queue.mockImplementation(() => mockQueue);
NodeCache.mockImplementation(() => mockCache);

describe('PersonalizationEngine', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PersonalizationEngine();
  });

  afterEach(async () => {
    await service.disconnect();
  });

  describe('Initialization', () => {
    test('should initialize with correct configuration', () => {
      expect(service.prisma).toBeDefined();
      expect(service.recommendationQueue).toBeDefined();
      expect(service.analyticsQueue).toBeDefined();
      expect(service.cache).toBeDefined();
    });

    test('should set up middleware and routes', () => {
      expect(service.app).toBeDefined();
      // Routes are set up in setupRoutes method
    });
  });

  describe('Health Check', () => {
    test('should return healthy status when services are available', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);
      const mockRedis = { ping: jest.fn().mockResolvedValue('PONG') };
      service.redis = mockRedis;

      const response = await request(service.app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    test('should return unhealthy status when database fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('DB Error'));
      const mockRedis = { ping: jest.fn().mockResolvedValue('PONG') };
      service.redis = mockRedis;

      const response = await request(service.app).get('/health');

      expect(response.status).toBe(503);
      expect(response.body.status).toBe('unhealthy');
    });
  });

  describe('User Profile Management', () => {
    const mockProfile = {
      userId: 'user123',
      age: 25,
      learningStyle: 'VISUAL',
      experienceLevel: 'INTERMEDIATE',
      interests: ['AI', 'Web Development']
    };

    test('should create user profile successfully', async () => {
      mockPrisma.userProfile.create.mockResolvedValue({
        id: 'profile123',
        ...mockProfile
      });

      const response = await request(service.app)
        .post('/api/profile')
        .send(mockProfile);

      expect(response.status).toBe(201);
      expect(mockPrisma.userProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining(mockProfile)
      });
    });

    test('should validate profile input', async () => {
      const invalidProfile = {
        userId: '',
        age: 150 // Invalid age
      };

      const response = await request(service.app)
        .post('/api/profile')
        .send(invalidProfile);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should get user profile with related data', async () => {
      const mockProfileData = {
        id: 'profile123',
        ...mockProfile,
        interactions: [],
        recommendations: [],
        learningPaths: [],
        achievements: []
      };

      mockPrisma.userProfile.findUnique.mockResolvedValue(mockProfileData);

      const response = await request(service.app)
        .get('/api/profile/user123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfileData);
    });
  });

  describe('Interaction Tracking', () => {
    const mockInteraction = {
      userId: 'user123',
      interactionType: 'COMPLETE',
      contentType: 'LESSON',
      contentId: 'lesson456',
      timeSpent: 1800,
      completionRate: 0.95,
      rating: 5
    };

    test('should track interaction successfully', async () => {
      mockPrisma.userInteraction.create.mockResolvedValue({
        id: 'interaction123',
        ...mockInteraction
      });

      const response = await request(service.app)
        .post('/api/interactions')
        .send(mockInteraction);

      expect(response.status).toBe(201);
      expect(mockPrisma.userInteraction.create).toHaveBeenCalled();
    });

    test('should calculate engagement score', () => {
      const interaction = {
        timeSpent: 1800,
        completionRate: 0.9,
        rating: 4,
        clicksCount: 10
      };

      const score = service.calculateEngagementScore(interaction);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('should update user statistics', async () => {
      mockPrisma.userProfile.update.mockResolvedValue({});

      await service.updateUserStats('user123', mockInteraction);

      expect(mockPrisma.userProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        data: expect.objectContaining({
          totalTimeSpent: { increment: 1800 },
          sessionsCount: { increment: 1 }
        })
      });
    });
  });

  describe('Recommendation Engine', () => {
    test('should generate content-based recommendations', async () => {
      const mockProfile = {
        userId: 'user123',
        interests: ['AI', 'Machine Learning'],
        interactions: [
          { contentId: 'content1', interactionType: 'COMPLETE' }
        ]
      };

      mockPrisma.userProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.contentSimilarity.findMany.mockResolvedValue([
        {
          contentId: 'content1',
          similarContentId: 'content2',
          similarityScore: 0.85
        }
      ]);

      const recommendations = await service.generateContentBasedRecommendations(mockProfile, 5);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0]).toEqual(expect.objectContaining({
        type: 'CONTENT_BASED',
        contentId: 'content2',
        relevanceScore: 0.85
      }));
    });

    test('should generate collaborative recommendations', async () => {
      const mockProfile = {
        userId: 'user123',
        learningStyle: 'VISUAL',
        interactions: []
      };

      const mockSimilarUsers = [
        { userId: 'user456' },
        { userId: 'user789' }
      ];

      mockPrisma.userProfile.findMany.mockResolvedValue(mockSimilarUsers);
      mockPrisma.userInteraction.findMany.mockResolvedValue([
        {
          contentId: 'content1',
          contentType: 'LESSON',
          rating: 5
        }
      ]);

      const recommendations = await service.generateCollaborativeRecommendations(mockProfile, 5);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0]).toEqual(expect.objectContaining({
        type: 'COLLABORATIVE',
        contentId: 'content1'
      }));
    });

    test('should rank and deduplicate recommendations', () => {
      const recommendations = [
        { contentId: 'content1', relevanceScore: 0.8, confidenceScore: 0.7 },
        { contentId: 'content2', relevanceScore: 0.9, confidenceScore: 0.6 },
        { contentId: 'content1', relevanceScore: 0.7, confidenceScore: 0.8 } // Duplicate
      ];

      const ranked = service.rankRecommendations(recommendations);
      const unique = service.deduplicateRecommendations(ranked);

      expect(unique).toHaveLength(2);
      expect(unique[0].finalScore).toBeGreaterThan(unique[1].finalScore);
    });

    test('should get recommendations from cache when available', async () => {
      const cachedRecommendations = [
        { contentId: 'content1', relevanceScore: 0.8 }
      ];

      mockCache.get.mockReturnValue(cachedRecommendations);

      const response = await request(service.app)
        .get('/api/recommendations/user123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedRecommendations);
      expect(mockCache.get).toHaveBeenCalledWith('recommendations_user123_all_10');
    });
  });

  describe('Learning Path Management', () => {
    const mockLearningPath = {
      userId: 'user123',
      title: 'Web Development Path',
      topic: 'Web Development',
      level: 'BEGINNER',
      modules: [
        { id: 'module1', title: 'HTML Basics', type: 'LESSON', duration: 3600 }
      ],
      estimatedDuration: 3600
    };

    test('should create personalized learning path', async () => {
      const mockProfile = {
        userId: 'user123',
        learningStyle: 'VISUAL',
        experienceLevel: 'BEGINNER',
        preferredPace: 'MODERATE'
      };

      mockPrisma.userProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.learningPath.create.mockResolvedValue({
        id: 'path123',
        ...mockLearningPath
      });

      const response = await request(service.app)
        .post('/api/learning-paths')
        .send(mockLearningPath);

      expect(response.status).toBe(201);
      expect(mockPrisma.learningPath.create).toHaveBeenCalled();
    });

    test('should adapt learning path based on user profile', async () => {
      const profile = {
        learningStyle: 'VISUAL',
        experienceLevel: 'BEGINNER',
        preferredPace: 'FAST'
      };

      const adapted = await service.adaptLearningPath(mockLearningPath, profile);

      expect(adapted.adaptiveFactors.difficultyMultiplier).toBeDefined();
      expect(adapted.adaptiveFactors.timeMultiplier).toBeDefined();
      expect(adapted.modules[0].duration).toBeLessThan(3600); // Faster pace = less time
    });

    test('should personalize module order for visual learners', () => {
      const modules = [
        { id: '1', title: 'Text Lesson', type: 'article' },
        { id: '2', title: 'Video Tutorial', type: 'video' },
        { id: '3', title: 'Code Exercise', type: 'exercise' }
      ];

      const profile = { learningStyle: 'VISUAL' };
      const ordered = service.personalizeModuleOrder(modules, profile);

      // Video should come first for visual learners
      expect(ordered[0].type).toBe('video');
    });
  });

  describe('Achievement System', () => {
    test('should get user achievements', async () => {
      const mockAchievements = [
        { id: 'ach1', title: 'First Lesson', unlockedAt: new Date() },
        { id: 'ach2', title: 'Week Streak', unlockedAt: new Date() }
      ];

      mockPrisma.achievement.findMany.mockResolvedValue(mockAchievements);

      const response = await request(service.app)
        .get('/api/achievements/user123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAchievements);
    });

    test('should claim achievement', async () => {
      mockPrisma.achievement.update.mockResolvedValue({
        id: 'ach1',
        claimedAt: new Date()
      });

      const response = await request(service.app)
        .post('/api/achievements/user123/ach1/claim');

      expect(response.status).toBe(200);
      expect(mockPrisma.achievement.update).toHaveBeenCalledWith({
        where: {
          id: 'ach1',
          userId: 'user123',
          unlockedAt: { not: null },
          claimedAt: null
        },
        data: { claimedAt: expect.any(Date) }
      });
    });
  });

  describe('Analytics', () => {
    test('should get personalization analytics', async () => {
      mockPrisma.userProfile.aggregate.mockResolvedValue({ _count: { id: 100 } });
      mockPrisma.userInteraction.aggregate.mockResolvedValue({
        _count: { id: 1000 },
        _avg: { engagementScore: 0.75, timeSpent: 1200 }
      });

      const response = await request(service.app)
        .get('/api/analytics?period=7d&metric=engagement');

      expect(response.status).toBe(200);
      expect(response.body.engagement).toBeDefined();
      expect(response.body.engagement.totalInteractions).toBe(1000);
    });

    test('should aggregate daily analytics', async () => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);

      mockPrisma.userProfile.aggregate.mockResolvedValue({ _count: { id: 50 } });
      mockPrisma.personalizationAnalytics.create.mockResolvedValue({});

      await service.aggregateAnalytics();

      expect(mockPrisma.personalizationAnalytics.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          date: date,
          metricType: 'DAILY_ACTIVE_USERS'
        })
      });
    });
  });

  describe('Model Training and Updates', () => {
    test('should retrain models successfully', async () => {
      mockPrisma.userInteraction.findMany.mockResolvedValue([
        { userId: 'user1', contentId: 'content1', rating: 5 }
      ]);

      await service.retrainModels();

      expect(mockPrisma.recommendationModel.upsert).toHaveBeenCalled();
    });

    test('should update collaborative model', async () => {
      const interactions = [
        { userId: 'user1', contentId: 'content1', rating: 5 },
        { userId: 'user2', contentId: 'content1', rating: 4 }
      ];

      mockPrisma.userInteraction.findMany.mockResolvedValue(interactions);

      await service.updateCollaborativeModel();

      expect(mockPrisma.recommendationModel.upsert).toHaveBeenCalledWith({
        where: { name: 'collaborative_filtering_v1' },
        update: expect.objectContaining({
          lastTrainedAt: expect.any(Date)
        }),
        create: expect.objectContaining({
          name: 'collaborative_filtering_v1',
          modelType: 'COLLABORATIVE_FILTERING'
        })
      });
    });

    test('should build user-item matrix', () => {
      const interactions = [
        { userId: 'user1', contentId: 'content1', rating: 5 },
        { userId: 'user1', contentId: 'content2', rating: 4 },
        { userId: 'user2', contentId: 'content1', rating: 3 }
      ];

      const matrix = service.buildUserItemMatrix(interactions);

      expect(matrix.users).toContain('user1');
      expect(matrix.users).toContain('user2');
      expect(matrix.items).toContain('content1');
      expect(matrix.items).toContain('content2');
      expect(matrix.matrix).toHaveLength(2); // 2 users
      expect(matrix.matrix[0]).toHaveLength(2); // 2 items
    });
  });

  describe('Utility Functions', () => {
    test('should generate personality vector', async () => {
      const profile = {
        learningStyle: 'VISUAL',
        experienceLevel: 'INTERMEDIATE',
        preferredPace: 'FAST'
      };

      const vector = await service.generatePersonalityVector(profile);

      expect(vector).toHaveLength(8); // 8 personality dimensions
      expect(vector.every(v => v >= 0 && v <= 1)).toBe(true);
    });

    test('should assess initial skills', async () => {
      const profile = { experienceLevel: 'BEGINNER' };

      const skills = await service.assessInitialSkills(profile);

      expect(skills).toHaveLength(5); // 5 skill dimensions
      expect(skills[0]).toBe(0.2); // Beginner level
    });

    test('should get difficulty multiplier', () => {
      expect(service.getDifficultyMultiplier('BEGINNER')).toBe(0.8);
      expect(service.getDifficultyMultiplier('ADVANCED')).toBe(1.2);
      expect(service.getDifficultyMultiplier('UNKNOWN')).toBe(1.0);
    });

    test('should get time multiplier', () => {
      expect(service.getTimeMultiplier('SLOW')).toBe(1.3);
      expect(service.getTimeMultiplier('FAST')).toBe(0.8);
      expect(service.getTimeMultiplier('UNKNOWN')).toBe(1.0);
    });

    test('should get start date for periods', () => {
      const startDate = service.getStartDate('7d');
      const expected = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      expect(startDate.getDate()).toBe(expected.getDate());
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      mockPrisma.userProfile.findUnique.mockRejectedValue(new Error('DB Error'));

      const response = await request(service.app)
        .get('/api/profile/user123');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to get user profile');
    });

    test('should handle invalid input validation', async () => {
      const response = await request(service.app)
        .post('/api/interactions')
        .send({}); // Empty body

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    test('should invalidate cache on profile update', async () => {
      mockPrisma.userProfile.update.mockResolvedValue({ userId: 'user123' });

      await request(service.app)
        .put('/api/profile/user123')
        .send({ interests: ['New Interest'] });

      expect(mockCache.del).toHaveBeenCalledWith('profile_user123');
    });
  });
});