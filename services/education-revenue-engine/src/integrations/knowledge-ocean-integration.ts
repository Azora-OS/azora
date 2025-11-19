import axios, { AxiosInstance } from 'axios';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import Joi from 'joi';

const contextRetrievalSchema = Joi.object({
  studentId: Joi.string().required(),
  courseId: Joi.string().required(),
  moduleId: Joi.string().required(),
  query: Joi.string().required().min(5),
  language: Joi.string().optional().default('en'),
  topK: Joi.number().optional().default(10),
});

interface RetrievedResource {
  id: string;
  title: string;
  content: string;
  source: 'internal' | 'external';
  relevanceScore: number;
  url?: string;
}

interface ContextRetrievalResult {
  query: string;
  resources: RetrievedResource[];
  internalCount: number;
  externalCount: number;
  internalPercentage: number;
  externalPercentage: number;
  retrievalTime: number;
  timestamp: Date;
}

export class ContextRetrievalService {
  private knowledgeOceanClient: AxiosInstance;
  private knowledgeOceanUrl: string;
  private internalResourceCache: Map<string, RetrievedResource[]>;
  private cacheExpiry: number;

  constructor() {
    this.knowledgeOceanUrl = process.env.KNOWLEDGE_OCEAN_URL || 'http://localhost:3002';
    this.knowledgeOceanClient = axios.create({
      baseURL: this.knowledgeOceanUrl,
      timeout: 10000,
    });
    this.internalResourceCache = new Map();
    this.cacheExpiry = 3600000; // 1 hour
  }

  /**
   * Retrieve context for a student query
   */
  async retrieveContext(data: any): Promise<ContextRetrievalResult> {
    try {
      const { error, value } = contextRetrievalSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      const startTime = Date.now();

      // Get course and module context
      const course = await prisma.course.findUnique({
        where: { id: value.courseId },
      });

      if (!course) {
        throw new Error('Course not found');
      }

      const module = await prisma.module.findUnique({
        where: { id: value.moduleId },
      });

      if (!module) {
        throw new Error('Module not found');
      }

      // Build search context
      const searchContext = {
        courseTitle: course.title,
        moduleTitle: module.title,
        language: value.language,
        tier: 'all', // Can be filtered by student tier
      };

      // Call Knowledge Ocean for retrieval
      const response = await this.knowledgeOceanClient.post('/api/knowledge-ocean/retrieve', {
        query: value.query,
        context: searchContext,
        topK: value.topK * 2, // Fetch more to apply 70/30 rule
      });

      // Apply 70/30 rule: 70% internal, 30% external
      const resources = this.applySeventyThirtyRule(response.data.documents, value.topK);

      // Calculate metrics
      const internalCount = resources.filter(r => r.source === 'internal').length;
      const externalCount = resources.filter(r => r.source === 'external').length;
      const totalCount = internalCount + externalCount;

      const result: ContextRetrievalResult = {
        query: value.query,
        resources,
        internalCount,
        externalCount,
        internalPercentage: totalCount > 0 ? (internalCount / totalCount) * 100 : 0,
        externalPercentage: totalCount > 0 ? (externalCount / totalCount) * 100 : 0,
        retrievalTime: Date.now() - startTime,
        timestamp: new Date(),
      };

      logger.info(
        `Context retrieved for student ${value.studentId}: ${internalCount} internal, ${externalCount} external`
      );

      return result;
    } catch (error) {
      logger.error('Error retrieving context:', error);
      throw error;
    }
  }

  /**
   * Apply 70/30 rule: 70% internal sources, 30% external sources
   */
  private applySeventyThirtyRule(documents: any[], targetCount: number): RetrievedResource[] {
    const internalTarget = Math.ceil(targetCount * 0.7);
    const externalTarget = Math.floor(targetCount * 0.3);

    const internal = documents
      .filter((d: any) => d.source === 'internal')
      .map((d: any) => this.mapToResource(d, 'internal'));

    const external = documents
      .filter((d: any) => d.source === 'external')
      .map((d: any) => this.mapToResource(d, 'external'));

    // Take top documents from each source up to target
    const selectedInternal = internal.slice(0, internalTarget);
    const selectedExternal = external.slice(0, externalTarget);

    // Combine and sort by relevance
    const combined = [...selectedInternal, ...selectedExternal];

    // If we don't have enough, fill with remaining
    if (combined.length < targetCount) {
      const remaining = targetCount - combined.length;
      if (selectedInternal.length < internalTarget) {
        const additionalInternal = internal.slice(internalTarget, internalTarget + remaining);
        combined.push(...additionalInternal);
      } else if (selectedExternal.length < externalTarget) {
        const additionalExternal = external.slice(externalTarget, externalTarget + remaining);
        combined.push(...additionalExternal);
      }
    }

    return combined
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, targetCount);
  }

  /**
   * Map document to resource
   */
  private mapToResource(doc: any, source: 'internal' | 'external'): RetrievedResource {
    return {
      id: doc.id || `resource-${Date.now()}`,
      title: doc.title || doc.name || 'Untitled',
      content: doc.content || doc.text || '',
      source,
      relevanceScore: doc.score || 0.5,
      url: doc.url,
    };
  }

  /**
   * Get language-specific resources
   */
  async getLanguageSpecificResources(
    courseId: string,
    moduleId: string,
    language: string
  ): Promise<RetrievedResource[]> {
    try {
      // Check cache first
      const cacheKey = `${courseId}-${moduleId}-${language}`;
      const cached = this.internalResourceCache.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for language resources: ${language}`);
        return cached;
      }

      // Get course and module
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      const module = await prisma.module.findUnique({
        where: { id: moduleId },
      });

      if (!course || !module) {
        throw new Error('Course or module not found');
      }

      // Call Knowledge Ocean for language-specific resources
      const response = await this.knowledgeOceanClient.post(
        '/api/knowledge-ocean/retrieve-language',
        {
          courseTitle: course.title,
          moduleTitle: module.title,
          language,
        }
      );

      const resources = response.data.documents.map((d: any) =>
        this.mapToResource(d, d.source || 'external')
      );

      // Cache the resources
      this.internalResourceCache.set(cacheKey, resources);
      setTimeout(() => this.internalResourceCache.delete(cacheKey), this.cacheExpiry);

      logger.info(`Retrieved ${resources.length} language-specific resources for ${language}`);

      return resources;
    } catch (error) {
      logger.error('Error getting language-specific resources:', error);
      throw error;
    }
  }

  /**
   * Rank resources by relevance
   */
  async rankResources(resources: RetrievedResource[]): Promise<RetrievedResource[]> {
    try {
      // Call Knowledge Ocean for ranking
      const response = await this.knowledgeOceanClient.post('/api/knowledge-ocean/rank', {
        documents: resources,
      });

      const rankedResources = response.data.rankedDocuments.map((d: any) =>
        this.mapToResource(d, d.source || 'external')
      );

      logger.info(`Ranked ${rankedResources.length} resources`);

      return rankedResources;
    } catch (error) {
      logger.error('Error ranking resources:', error);
      // Return original resources if ranking fails
      return resources;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.internalResourceCache.clear();
    logger.info('Context retrieval cache cleared');
  }
}

export const contextRetrievalService = new ContextRetrievalService();
