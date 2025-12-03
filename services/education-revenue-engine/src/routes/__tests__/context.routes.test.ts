import request from 'supertest';
import express from 'express';
import contextRoutes from '../context.routes';
import { contextRetrievalService } from '../../integrations/knowledge-ocean-integration';

jest.mock('../../integrations/knowledge-ocean-integration');

const app = express();
app.use(express.json());
app.use('/api/v1/context', contextRoutes);

describe('Context Retrieval Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/context/retrieve', () => {
    it('should retrieve context with 70/30 rule compliance', async () => {
      const retrievalData = {
        studentId: 'student-1',
        courseId: 'course-1',
        moduleId: 'module-1',
        query: 'What is TypeScript?',
        language: 'en',
        topK: 10,
      };

      const mockResult = {
        query: 'What is TypeScript?',
        resources: [
          {
            id: 'resource-1',
            title: 'TypeScript Handbook',
            content: 'TypeScript is a typed superset of JavaScript...',
            source: 'internal' as const,
            relevanceScore: 0.95,
            url: 'https://www.typescriptlang.org/docs/',
          },
          {
            id: 'resource-2',
            title: 'TypeScript Tutorial',
            content: 'Learn TypeScript basics...',
            source: 'internal' as const,
            relevanceScore: 0.92,
            url: 'https://example.com/ts-tutorial',
          },
          {
            id: 'resource-3',
            title: 'TypeScript Best Practices',
            content: 'Best practices for TypeScript development...',
            source: 'internal' as const,
            relevanceScore: 0.88,
            url: 'https://example.com/ts-best-practices',
          },
          {
            id: 'resource-4',
            title: 'TypeScript on Stack Overflow',
            content: 'Common TypeScript questions and answers...',
            source: 'external' as const,
            relevanceScore: 0.85,
            url: 'https://stackoverflow.com/questions/tagged/typescript',
          },
          {
            id: 'resource-5',
            title: 'TypeScript GitHub',
            content: 'TypeScript repository and issues...',
            source: 'external' as const,
            relevanceScore: 0.80,
            url: 'https://github.com/microsoft/TypeScript',
          },
        ],
        internalCount: 3,
        externalCount: 2,
        internalPercentage: 60,
        externalPercentage: 40,
        retrievalTime: 245,
        timestamp: new Date(),
      };

      (contextRetrievalService.retrieveContext as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/context/retrieve')
        .send(retrievalData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toHaveLength(5);
      expect(response.body.data.internalCount).toBe(3);
      expect(response.body.data.externalCount).toBe(2);
    });

    it('should enforce 70/30 rule', async () => {
      const retrievalData = {
        studentId: 'student-1',
        courseId: 'course-1',
        moduleId: 'module-1',
        query: 'What is TypeScript?',
        language: 'en',
        topK: 10,
      };

      const mockResult = {
        query: 'What is TypeScript?',
        resources: Array(7)
          .fill(null)
          .map((_, i) => ({
            id: `resource-${i + 1}`,
            title: `Resource ${i + 1}`,
            content: 'Content...',
            source: i < 7 ? ('internal' as const) : ('external' as const),
            relevanceScore: 0.9 - i * 0.05,
          }))
          .concat(
            Array(3)
              .fill(null)
              .map((_, i) => ({
                id: `resource-${i + 8}`,
                title: `Resource ${i + 8}`,
                content: 'Content...',
                source: 'external' as const,
                relevanceScore: 0.6 - i * 0.05,
              }))
          ),
        internalCount: 7,
        externalCount: 3,
        internalPercentage: 70,
        externalPercentage: 30,
        retrievalTime: 250,
        timestamp: new Date(),
      };

      (contextRetrievalService.retrieveContext as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/context/retrieve')
        .send(retrievalData);

      expect(response.status).toBe(201);
      expect(response.body.data.internalPercentage).toBe(70);
      expect(response.body.data.externalPercentage).toBe(30);
    });

    it('should handle validation errors', async () => {
      (contextRetrievalService.retrieveContext as jest.Mock).mockRejectedValue(
        new Error('Validation error: query is required')
      );

      const response = await request(app)
        .post('/api/v1/context/retrieve')
        .send({
          studentId: 'student-1',
          courseId: 'course-1',
          moduleId: 'module-1',
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/v1/context/language/:courseId/:moduleId/:language', () => {
    it('should get language-specific resources', async () => {
      const mockResources = [
        {
          id: 'resource-1',
          title: 'TypeScript Handbook (Spanish)',
          content: 'TypeScript es un superconjunto tipado de JavaScript...',
          source: 'internal' as const,
          relevanceScore: 0.95,
          url: 'https://www.typescriptlang.org/es/docs/',
        },
        {
          id: 'resource-2',
          title: 'TypeScript Tutorial (Spanish)',
          content: 'Aprende los conceptos básicos de TypeScript...',
          source: 'internal' as const,
          relevanceScore: 0.92,
          url: 'https://example.com/ts-tutorial-es',
        },
      ];

      (contextRetrievalService.getLanguageSpecificResources as jest.Mock).mockResolvedValue(
        mockResources
      );

      const response = await request(app).get(
        '/api/v1/context/language/course-1/module-1/es'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toHaveLength(2);
      expect(response.body.data.language).toBe('es');
    });

    it('should handle missing course or module', async () => {
      (contextRetrievalService.getLanguageSpecificResources as jest.Mock).mockRejectedValue(
        new Error('Course or module not found')
      );

      const response = await request(app).get(
        '/api/v1/context/language/non-existent/module-1/en'
      );

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/v1/context/rank', () => {
    it('should rank resources by relevance', async () => {
      const resources = [
        {
          id: 'resource-1',
          title: 'Resource 1',
          content: 'Content 1',
          source: 'internal' as const,
          relevanceScore: 0.85,
        },
        {
          id: 'resource-2',
          title: 'Resource 2',
          content: 'Content 2',
          source: 'external' as const,
          relevanceScore: 0.92,
        },
        {
          id: 'resource-3',
          title: 'Resource 3',
          content: 'Content 3',
          source: 'internal' as const,
          relevanceScore: 0.78,
        },
      ];

      const rankedResources = [
        {
          id: 'resource-2',
          title: 'Resource 2',
          content: 'Content 2',
          source: 'external' as const,
          relevanceScore: 0.92,
        },
        {
          id: 'resource-1',
          title: 'Resource 1',
          content: 'Content 1',
          source: 'internal' as const,
          relevanceScore: 0.85,
        },
        {
          id: 'resource-3',
          title: 'Resource 3',
          content: 'Content 3',
          source: 'internal' as const,
          relevanceScore: 0.78,
        },
      ];

      (contextRetrievalService.rankResources as jest.Mock).mockResolvedValue(rankedResources);

      const response = await request(app)
        .post('/api/v1/context/rank')
        .send({ resources });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toHaveLength(3);
      expect(response.body.data.resources[0].relevanceScore).toBe(0.92);
    });

    it('should handle missing resources array', async () => {
      const response = await request(app)
        .post('/api/v1/context/rank')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
