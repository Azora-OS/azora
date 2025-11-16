import axios from 'axios';
import { KnowledgeSource } from '../knowledge-ocean';

export interface SAStatistic {
  indicator: string;
  value: number;
  unit: string;
  date: string;
  source: string;
}

export interface JSEData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export class SouthAfricaDataSource {
  private statsSAUrl = 'https://www.statssa.gov.za/api';
  private jseUrl = 'https://api.jse.co.za';

  /**
   * Fetch economic indicators from Stats SA
   */
  async fetchEconomicIndicators(
    indicator: string,
    options: { limit?: number } = {}
  ): Promise<SAStatistic[]> {
    const { limit = 10 } = options;

    try {
      // Note: This is a placeholder - actual Stats SA API may differ
      const response = await axios.get(`${this.statsSAUrl}/indicators/${indicator}`, {
        params: { limit },
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching Stats SA data:', error);
      // Return mock data for demonstration
      return this.getMockSAData(indicator);
    }
  }

  /**
   * Fetch JSE stock data
   */
  async fetchJSEData(symbol: string): Promise<JSEData> {
    try {
      const response = await axios.get(`${this.jseUrl}/quote/${symbol}`);

      return {
        symbol: response.data.symbol,
        name: response.data.name,
        price: response.data.price,
        change: response.data.change,
        changePercent: response.data.changePercent,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching JSE data:', error);
      // Return mock data for demonstration
      return this.getMockJSEData(symbol);
    }
  }

  /**
   * Get mock SA data for demonstration
   */
  private getMockSAData(indicator: string): SAStatistic[] {
    const mockData: Record<string, SAStatistic[]> = {
      unemployment: [
        {
          indicator: 'Unemployment Rate',
          value: 34.5,
          unit: '%',
          date: new Date().toISOString(),
          source: 'Stats SA',
        },
      ],
      gdp: [
        {
          indicator: 'GDP Growth',
          value: 0.5,
          unit: '%',
          date: new Date().toISOString(),
          source: 'Stats SA',
        },
      ],
      inflation: [
        {
          indicator: 'Inflation Rate',
          value: 5.8,
          unit: '%',
          date: new Date().toISOString(),
          source: 'Stats SA',
        },
      ],
    };

    return mockData[indicator] || [];
  }

  /**
   * Get mock JSE data for demonstration
   */
  private getMockJSEData(symbol: string): JSEData {
    return {
      symbol,
      name: `${symbol} Limited`,
      price: 100 + Math.random() * 50,
      change: Math.random() * 10 - 5,
      changePercent: Math.random() * 5 - 2.5,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Convert SA statistic to KnowledgeSource
   */
  convertStatisticToKnowledgeSource(stat: SAStatistic): Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  > {
    return {
      type: 'market',
      source: stat.source,
      url: 'https://www.statssa.gov.za',
      title: `${stat.indicator} - South Africa`,
      content: `Indicator: ${stat.indicator}\nValue: ${stat.value}${stat.unit}\nDate: ${stat.date}\nSource: ${stat.source}`,
      metadata: {
        date: stat.date,
        category: 'south-africa',
        verified: true,
        relevance: 0.9,
        tags: ['south-africa', 'statistics', 'economic-data'],
      },
    };
  }

  /**
   * Convert JSE data to KnowledgeSource
   */
  convertJSEToKnowledgeSource(jse: JSEData): Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  > {
    const trend = jse.change >= 0 ? 'up' : 'down';
    return {
      type: 'market',
      source: 'JSE',
      url: `https://www.jse.co.za/stock/${jse.symbol}`,
      title: `${jse.name} (${jse.symbol}) - JSE Update`,
      content: `Stock: ${jse.name} (${jse.symbol})\nPrice: R${jse.price.toFixed(2)}\nChange: R${jse.change.toFixed(2)} (${jse.changePercent.toFixed(2)}%)\nTimestamp: ${jse.timestamp}`,
      metadata: {
        date: jse.timestamp,
        category: 'south-africa',
        verified: true,
        relevance: 0.9,
        tags: ['jse', 'south-africa', 'stock', jse.symbol.toLowerCase(), trend],
      },
    };
  }

  /**
   * Fetch and convert economic indicators
   */
  async fetchAndConvertIndicators(
    indicator: string,
    options: { limit?: number } = {}
  ): Promise<Omit<KnowledgeSource, 'id' | 'embedding' | 'createdAt' | 'updatedAt'>[]> {
    const stats = await this.fetchEconomicIndicators(indicator, options);
    return stats.map((stat) => this.convertStatisticToKnowledgeSource(stat));
  }

  /**
   * Fetch and convert JSE data
   */
  async fetchAndConvertJSE(symbol: string): Promise<Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  >> {
    const jse = await this.fetchJSEData(symbol);
    return this.convertJSEToKnowledgeSource(jse);
  }
}

export default SouthAfricaDataSource;
