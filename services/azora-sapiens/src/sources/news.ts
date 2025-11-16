import axios from 'axios';
import { KnowledgeSource } from '../knowledge-ocean';

export interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export class NewsDataSource {
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch news articles from NewsAPI
   */
  async fetchNews(
    query: string,
    options: {
      language?: string;
      sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
      pageSize?: number;
    } = {}
  ): Promise<NewsArticle[]> {
    const { language = 'en', sortBy = 'publishedAt', pageSize = 100 } = options;

    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: query,
          language,
          sortBy,
          pageSize,
          apiKey: this.apiKey,
        },
      });

      return response.data.articles || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  /**
   * Fetch top headlines
   */
  async fetchTopHeadlines(
    options: {
      country?: string;
      category?: string;
      pageSize?: number;
    } = {}
  ): Promise<NewsArticle[]> {
    const { country = 'us', category, pageSize = 100 } = options;

    try {
      const params: Record<string, unknown> = {
        country,
        pageSize,
        apiKey: this.apiKey,
      };

      if (category) {
        params.category = category;
      }

      const response = await axios.get(`${this.baseUrl}/top-headlines`, { params });

      return response.data.articles || [];
    } catch (error) {
      console.error('Error fetching top headlines:', error);
      throw error;
    }
  }

  /**
   * Convert news article to KnowledgeSource
   */
  convertToKnowledgeSource(article: NewsArticle): Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  > {
    return {
      type: 'news',
      source: article.source.name,
      url: article.url,
      title: article.title,
      content: `${article.title}\n\n${article.description}\n\n${article.content}`,
      metadata: {
        date: article.publishedAt,
        category: 'news',
        verified: true,
        relevance: 0.8,
        tags: ['news', 'current-events'],
      },
    };
  }

  /**
   * Fetch and convert news articles
   */
  async fetchAndConvert(
    query: string,
    options: {
      language?: string;
      sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
      pageSize?: number;
    } = {}
  ): Promise<Omit<KnowledgeSource, 'id' | 'embedding' | 'createdAt' | 'updatedAt'>[]> {
    const articles = await this.fetchNews(query, options);
    return articles.map((article) => this.convertToKnowledgeSource(article));
  }

  /**
   * Fetch and convert top headlines
   */
  async fetchAndConvertHeadlines(
    options: {
      country?: string;
      category?: string;
      pageSize?: number;
    } = {}
  ): Promise<Omit<KnowledgeSource, 'id' | 'embedding' | 'createdAt' | 'updatedAt'>[]> {
    const articles = await this.fetchTopHeadlines(options);
    return articles.map((article) => this.convertToKnowledgeSource(article));
  }
}

export default NewsDataSource;
