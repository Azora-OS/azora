import axios from 'axios';
import { KnowledgeSource } from '../knowledge-ocean';

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  published: string;
  url: string;
  categories: string[];
}

export class ResearchDataSource {
  private arxivUrl = 'http://export.arxiv.org/api/query';

  /**
   * Search ArXiv for research papers
   */
  async searchArxiv(
    query: string,
    options: {
      maxResults?: number;
      sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
      sortOrder?: 'ascending' | 'descending';
    } = {}
  ): Promise<ResearchPaper[]> {
    const { maxResults = 50, sortBy = 'relevance', sortOrder = 'descending' } = options;

    try {
      const searchQuery = `search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

      const response = await axios.get(`${this.arxivUrl}?${searchQuery}`, {
        headers: { 'User-Agent': 'Azora-Sapiens/1.0' },
      });

      // Parse XML response
      const papers = this.parseArxivResponse(response.data);
      return papers;
    } catch (error) {
      console.error('Error searching ArXiv:', error);
      throw error;
    }
  }

  /**
   * Parse ArXiv XML response
   */
  private parseArxivResponse(xmlData: string): ResearchPaper[] {
    const papers: ResearchPaper[] = [];

    // Simple XML parsing (in production, use xml2js or similar)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xmlData)) !== null) {
      const entry = match[1];

      const idMatch = /<id>(.*?)<\/id>/.exec(entry);
      const titleMatch = /<title>(.*?)<\/title>/.exec(entry);
      const summaryMatch = /<summary>(.*?)<\/summary>/.exec(entry);
      const publishedMatch = /<published>(.*?)<\/published>/.exec(entry);
      const categoryMatches = /<category term="(.*?)"/.exec(entry);

      if (idMatch && titleMatch && summaryMatch) {
        const arxivId = idMatch[1].split('/abs/')[1];
        papers.push({
          id: arxivId,
          title: titleMatch[1].trim(),
          authors: this.extractAuthors(entry),
          summary: summaryMatch[1].trim(),
          published: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
          url: `https://arxiv.org/abs/${arxivId}`,
          categories: categoryMatches ? [categoryMatches[1]] : [],
        });
      }
    }

    return papers;
  }

  /**
   * Extract authors from entry
   */
  private extractAuthors(entry: string): string[] {
    const authors: string[] = [];
    const authorRegex = /<author><name>(.*?)<\/name><\/author>/g;
    let match;

    while ((match = authorRegex.exec(entry)) !== null) {
      authors.push(match[1]);
    }

    return authors;
  }

  /**
   * Convert research paper to KnowledgeSource
   */
  convertToKnowledgeSource(paper: ResearchPaper): Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  > {
    return {
      type: 'research',
      source: 'ArXiv',
      url: paper.url,
      title: paper.title,
      content: `Title: ${paper.title}\n\nAuthors: ${paper.authors.join(', ')}\n\nAbstract: ${paper.summary}`,
      metadata: {
        date: paper.published,
        category: 'research',
        verified: true,
        relevance: 0.85,
        tags: ['research', 'academic', ...paper.categories],
      },
    };
  }

  /**
   * Search and convert research papers
   */
  async searchAndConvert(
    query: string,
    options: {
      maxResults?: number;
      sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
      sortOrder?: 'ascending' | 'descending';
    } = {}
  ): Promise<Omit<KnowledgeSource, 'id' | 'embedding' | 'createdAt' | 'updatedAt'>[]> {
    const papers = await this.searchArxiv(query, options);
    return papers.map((paper) => this.convertToKnowledgeSource(paper));
  }
}

export default ResearchDataSource;
