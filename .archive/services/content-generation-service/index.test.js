const { ContentGenerationService } = require('./index');
const { PrismaClient } = require('@prisma/client');
const { Queue } = require('bull');
const { jest } = require('@jest/globals');

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('bull');
jest.mock('../ai-model-service');
jest.mock('../openai-service');

const mockPrisma = {
  content: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  learningPath: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  contentAnalytics: {
    create: jest.fn(),
    aggregate: jest.fn(),
  },
  $disconnect: jest.fn(),
};

const mockQueue = {
  add: jest.fn(),
  getJob: jest.fn(),
  getJobs: jest.fn(),
  process: jest.fn(),
  on: jest.fn(),
};

const mockAIModelService = {
  selectModel: jest.fn(),
  validateConstitutionalCompliance: jest.fn(),
};

const mockOpenAIService = {
  generateContent: jest.fn(),
  validateContent: jest.fn(),
};

PrismaClient.mockImplementation(() => mockPrisma);
Queue.mockImplementation(() => mockQueue);

describe('ContentGenerationService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ContentGenerationService();
  });

  afterEach(async () => {
    await service.disconnect();
  });

  describe('Initialization', () => {
    test('should initialize with correct configuration', () => {
      expect(service.prisma).toBeDefined();
      expect(service.contentQueue).toBeDefined();
      expect(service.learningPathQueue).toBeDefined();
      expect(service.aiModelService).toBeDefined();
      expect(service.openaiService).toBeDefined();
    });

    test('should set up queue processors', () => {
      expect(mockQueue.process).toHaveBeenCalledTimes(2);
      expect(mockQueue.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(mockQueue.on).toHaveBeenCalledWith('failed', expect.any(Function));
    });
  });

  describe('Health Check', () => {
    test('should return healthy status when all services are available', async () => {
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ 1: 1 }]);

      const health = await service.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.database).toBe('connected');
      expect(health.queues).toBe('operational');
    });

    test('should return unhealthy status when database is down', async () => {
      mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('DB Error'));

      const health = await service.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.database).toBe('disconnected');
    });
  });

  describe('Content Generation', () => {
    const mockRequest = {
      type: 'lesson',
      topic: 'Machine Learning',
      level: 'intermediate',
      learnerProfile: {
        learningStyle: 'visual',
        interests: ['AI', 'data science']
      },
      userId: 'user123',
      priority: 'high'
    };

    test('should add content generation job to queue', async () => {
      mockQueue.add.mockResolvedValue({ id: 'job123' });
      mockAIModelService.selectModel.mockResolvedValue({
        model: 'gpt-4',
        constitutionalScore: 0.95
      });

      const result = await service.generateContent(mockRequest);

      expect(mockAIModelService.selectModel).toHaveBeenCalledWith(
        'content_generation',
        expect.objectContaining({
          topic: 'Machine Learning',
          level: 'intermediate'
        })
      );
      expect(mockQueue.add).toHaveBeenCalledWith(
        'generate_content',
        expect.objectContaining({
          ...mockRequest,
          selectedModel: { model: 'gpt-4', constitutionalScore: 0.95 }
        }),
        { priority: 1 }
      );
      expect(result).toEqual({
        jobId: 'job123',
        status: 'queued',
        estimatedTime: expect.any(Number)
      });
    });

    test('should handle content generation job processing', async () => {
      const job = {
        id: 'job123',
        data: {
          type: 'lesson',
          topic: 'Machine Learning',
          selectedModel: { model: 'gpt-4' },
          userId: 'user123'
        }
      };

      mockOpenAIService.generateContent.mockResolvedValue({
        content: 'Generated lesson content',
        metadata: { tokens: 150 }
      });

      mockPrisma.content.create.mockResolvedValue({
        id: 'content123',
        type: 'lesson',
        topic: 'Machine Learning'
      });

      await service.processContentGeneration(job);

      expect(mockOpenAIService.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'lesson',
          topic: 'Machine Learning',
          model: 'gpt-4'
        })
      );
      expect(mockPrisma.content.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'lesson',
          topic: 'Machine Learning',
          content: 'Generated lesson content',
          userId: 'user123',
          metadata: expect.any(Object)
        })
      });
    });
  });

  describe('Learning Path Generation', () => {
    const mockLearningPathRequest = {
      topic: 'Web Development',
      learnerId: 'learner456',
      currentLevel: 'beginner',
      goals: ['Build full-stack applications'],
      timeCommitment: 'moderate',
      preferences: {
        pace: 'steady',
        focus: 'practical'
      }
    };

    test('should generate personalized learning path', async () => {
      mockQueue.add.mockResolvedValue({ id: 'lp_job123' });
      mockPrisma.learningPath.create.mockResolvedValue({
        id: 'lp123',
        topic: 'Web Development',
        learnerId: 'learner456'
      });

      const result = await service.generateLearningPath(mockLearningPathRequest);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'generate_learning_path',
        expect.objectContaining(mockLearningPathRequest),
        { priority: 1 }
      );
      expect(result).toEqual({
        jobId: 'lp_job123',
        status: 'queued',
        estimatedTime: expect.any(Number)
      });
    });

    test('should process learning path generation job', async () => {
      const job = {
        id: 'lp_job123',
        data: {
          topic: 'Web Development',
          learnerId: 'learner456',
          currentLevel: 'beginner',
          goals: ['Build full-stack applications']
        }
      };

      mockOpenAIService.generateContent.mockResolvedValue({
        content: {
          modules: [
            { title: 'HTML Basics', duration: '2 hours' },
            { title: 'CSS Fundamentals', duration: '3 hours' }
          ],
          totalDuration: '5 hours'
        }
      });

      mockPrisma.learningPath.create.mockResolvedValue({
        id: 'lp123',
        topic: 'Web Development'
      });

      await service.processLearningPathGeneration(job);

      expect(mockOpenAIService.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'learning_path',
          topic: 'Web Development'
        })
      );
      expect(mockPrisma.learningPath.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          topic: 'Web Development',
          learnerId: 'learner456',
          content: expect.any(Object),
          metadata: expect.any(Object)
        })
      });
    });
  });

  describe('Job Status and Retrieval', () => {
    test('should get job status from queue', async () => {
      const mockJob = {
        id: 'job123',
        finishedOn: null,
        failedReason: null,
        opts: { priority: 1 },
        progress: 50
      };

      mockQueue.getJob.mockResolvedValue(mockJob);

      const status = await service.getJobStatus('job123', 'content');

      expect(status).toEqual({
        jobId: 'job123',
        status: 'active',
        progress: 50,
        priority: 1
      });
    });

    test('should retrieve generated content', async () => {
      const mockContent = {
        id: 'content123',
        type: 'lesson',
        topic: 'Machine Learning',
        content: 'Lesson content',
        createdAt: new Date()
      };

      mockPrisma.content.findUnique.mockResolvedValue(mockContent);

      const content = await service.getContent('content123');

      expect(content).toEqual(mockContent);
      expect(mockPrisma.content.findUnique).toHaveBeenCalledWith({
        where: { id: 'content123' }
      });
    });

    test('should get learning paths for learner', async () => {
      const mockPaths = [
        { id: 'lp1', topic: 'Web Dev', status: 'active' },
        { id: 'lp2', topic: 'AI', status: 'completed' }
      ];

      mockPrisma.learningPath.findMany.mockResolvedValue(mockPaths);

      const paths = await service.getLearningPaths('learner456');

      expect(paths).toEqual(mockPaths);
      expect(mockPrisma.learningPath.findMany).toHaveBeenCalledWith({
        where: { learnerId: 'learner456' },
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('Analytics', () => {
    test('should get content analytics', async () => {
      const mockAnalytics = {
        totalContent: 150,
        totalLearningPaths: 25,
        averageGenerationTime: 45,
        successRate: 0.95
      };

      mockPrisma.contentAnalytics.aggregate.mockResolvedValue({
        _count: { id: 150 }
      });
      mockPrisma.learningPath.findMany.mockResolvedValue(Array(25));
      mockPrisma.contentAnalytics.aggregate.mockResolvedValue({
        _avg: { generationTime: 45 }
      });

      const analytics = await service.getAnalytics('7d');

      expect(analytics).toEqual(expect.objectContaining({
        totalContent: 150,
        totalLearningPaths: 25,
        averageGenerationTime: 45
      }));
    });
  });

  describe('Error Handling', () => {
    test('should handle content generation failures', async () => {
      const job = {
        id: 'job123',
        data: { type: 'lesson', topic: 'Test' }
      };

      mockOpenAIService.generateContent.mockRejectedValue(
        new Error('OpenAI API Error')
      );

      await expect(service.processContentGeneration(job)).rejects.toThrow('OpenAI API Error');
    });

    test('should validate input parameters', async () => {
      const invalidRequest = {
        type: 'invalid_type',
        topic: '',
        level: 'invalid_level'
      };

      await expect(service.generateContent(invalidRequest)).rejects.toThrow();
    });
  });

  describe('Constitutional AI Integration', () => {
    test('should validate constitutional compliance', async () => {
      const content = 'Generated content about sensitive topic';

      mockAIModelService.validateConstitutionalCompliance.mockResolvedValue({
        compliant: true,
        score: 0.92,
        issues: []
      });

      const result = await service.validateContentCompliance(content);

      expect(mockAIModelService.validateConstitutionalCompliance).toHaveBeenCalledWith(content);
      expect(result.compliant).toBe(true);
    });

    test('should handle non-compliant content', async () => {
      const content = 'Potentially biased content';

      mockAIModelService.validateConstitutionalCompliance.mockResolvedValue({
        compliant: false,
        score: 0.45,
        issues: ['Bias detected', 'Inaccurate information']
      });

      const result = await service.validateContentCompliance(content);

      expect(result.compliant).toBe(false);
      expect(result.issues).toContain('Bias detected');
    });
  });

  describe('Queue Management', () => {
    test('should handle job completion events', () => {
      const mockJob = { id: 'job123', data: { userId: 'user123' } };
      const mockResult = { contentId: 'content123' };

      service.handleJobCompleted(mockJob, mockResult);

      expect(mockPrisma.contentAnalytics.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          jobId: 'job123',
          status: 'completed',
          result: mockResult
        })
      });
    });

    test('should handle job failure events', () => {
      const mockJob = { id: 'job123', data: { userId: 'user123' } };
      const mockError = new Error('Generation failed');

      service.handleJobFailed(mockJob, mockError);

      expect(mockPrisma.contentAnalytics.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          jobId: 'job123',
          status: 'failed',
          error: 'Generation failed'
        })
      });
    });
  });
});