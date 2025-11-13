import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from './logger';

export class WebSearchService {
  private searchEngines = {
    duckduckgo: 'https://html.duckduckgo.com/html/',
    serper: 'https://google.serper.dev/search'
  };

  async search(query: string, maxResults: number = 5) {
    try {
      if (process.env.SERPER_API_KEY) {
        return await this.searchWithSerper(query, maxResults);
      }
      return await this.searchWithDuckDuckGo(query, maxResults);
    } catch (error) {
      logger.error('Web search error:', error);
      return [];
    }
  }

  private async searchWithSerper(query: string, maxResults: number) {
    try {
      const response = await axios.post(
        this.searchEngines.serper,
        { q: query, num: maxResults },
        { headers: { 'X-API-KEY': process.env.SERPER_API_KEY } }
      );

      return response.data.organic?.map((result: any) => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        source: 'serper'
      })) || [];
    } catch (error) {
      logger.error('Serper search error:', error);
      return [];
    }
  }

  private async searchWithDuckDuckGo(query: string, maxResults: number) {
    try {
      const response = await axios.post(
        this.searchEngines.duckduckgo,
        `q=${encodeURIComponent(query)}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const $ = cheerio.load(response.data);
      const results: any[] = [];

      $('.result').each((i, elem) => {
        if (i >= maxResults) return false;
        const title = $(elem).find('.result__title').text().trim();
        const url = $(elem).find('.result__url').attr('href');
        const snippet = $(elem).find('.result__snippet').text().trim();
        
        if (title && url) {
          results.push({ title, url, snippet, source: 'duckduckgo' });
        }
      });

      return results;
    } catch (error) {
      logger.error('DuckDuckGo search error:', error);
      return [];
    }
  }

  async scrapeContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      const $ = cheerio.load(response.data);
      
      $('script, style, nav, footer, header').remove();
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      
      return text.substring(0, 5000);
    } catch (error) {
      logger.error('Scrape error:', error);
      return '';
    }
  }
}
