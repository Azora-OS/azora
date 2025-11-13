import axios from 'axios';

export class KnowledgeConnector {
  private oceanUrl = 'http://localhost:4040';
  private kbUrl = 'http://localhost:4010';

  async queryKnowledge(question: string): Promise<string> {
    try {
      // Try AI Knowledge Base first (more advanced)
      const kbResponse = await axios.post(`${this.kbUrl}/api/kb/query`, {
        query: question,
        includeWeb: false
      }, { timeout: 5000 });

      if (kbResponse.data.success && kbResponse.data.results) {
        return kbResponse.data.results;
      }
    } catch (error) {
      console.log('KB unavailable, trying Ocean...');
    }

    // Fallback to Knowledge Ocean
    try {
      const oceanResponse = await axios.post(`${this.oceanUrl}/api/ask`, {
        question
      }, { timeout: 5000 });

      if (oceanResponse.data.success) {
        return oceanResponse.data.answer;
      }
    } catch (error) {
      console.error('Knowledge services unavailable:', error);
    }

    return 'Knowledge services are currently unavailable. Please ensure services are running.';
  }

  async searchKnowledge(query: string, category?: string): Promise<any[]> {
    try {
      const response = await axios.post(`${this.oceanUrl}/api/search`, {
        q: query,
        category,
        limit: 10
      }, { timeout: 5000 });

      return response.data.results || [];
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  async addKnowledge(content: string, metadata?: any): Promise<boolean> {
    try {
      await axios.post(`${this.kbUrl}/api/kb/add`, {
        content,
        metadata
      }, { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Failed to add knowledge:', error);
      return false;
    }
  }

  async getStats(): Promise<any> {
    try {
      const response = await axios.get(`${this.oceanUrl}/api/stats`, { timeout: 3000 });
      return response.data.stats;
    } catch (error) {
      return null;
    }
  }
}
