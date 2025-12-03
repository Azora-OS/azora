import axios from 'axios';
import { KnowledgeSource } from '../knowledge-ocean';

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  volume: number;
}

export interface CryptoData {
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  timestamp: string;
}

export class MarketDataSource {
  private alphaVantageKey: string;
  private cryptoApiKey: string;
  private alphaVantageUrl = 'https://www.alphavantage.co/query';
  private cryptoUrl = 'https://api.coingecko.com/api/v3';

  constructor(alphaVantageKey: string, cryptoApiKey?: string) {
    this.alphaVantageKey = alphaVantageKey;
    this.cryptoApiKey = cryptoApiKey || '';
  }

  /**
   * Fetch stock data
   */
  async fetchStockData(symbol: string): Promise<StockData> {
    try {
      const response = await axios.get(this.alphaVantageUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: this.alphaVantageKey,
        },
      });

      const quote = response.data['Global Quote'];
      if (!quote || !quote.symbol) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      return {
        symbol: quote.symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent']),
        volume: parseInt(quote['06. volume']),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw error;
    }
  }

  /**
   * Fetch cryptocurrency data
   */
  async fetchCryptoData(cryptoId: string): Promise<CryptoData> {
    try {
      const response = await axios.get(`${this.cryptoUrl}/simple/price`, {
        params: {
          ids: cryptoId,
          vs_currencies: 'usd',
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
        },
      });

      const data = response.data[cryptoId];
      if (!data) {
        throw new Error(`No data found for crypto: ${cryptoId}`);
      }

      return {
        symbol: cryptoId.toUpperCase(),
        price: data.usd,
        marketCap: data.usd_market_cap || 0,
        volume24h: data.usd_24h_vol || 0,
        change24h: data.usd_24h_change || 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      throw error;
    }
  }

  /**
   * Convert stock data to KnowledgeSource
   */
  convertStockToKnowledgeSource(stock: StockData): Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  > {
    const trend = stock.change >= 0 ? 'up' : 'down';
    return {
      type: 'market',
      source: 'Alpha Vantage',
      url: `https://www.alphavantage.co/query?symbol=${stock.symbol}`,
      title: `${stock.symbol} Stock Update`,
      content: `Stock Symbol: ${stock.symbol}\nCurrent Price: $${stock.price}\nChange: ${stock.change} (${stock.changePercent}%)\nVolume: ${stock.volume}\nTimestamp: ${stock.timestamp}`,
      metadata: {
        date: stock.timestamp,
        category: 'market-data',
        verified: true,
        relevance: 0.9,
        tags: ['stock', 'market', stock.symbol.toLowerCase(), trend],
      },
    };
  }

  /**
   * Convert crypto data to KnowledgeSource
   */
  convertCryptoToKnowledgeSource(crypto: CryptoData): Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  > {
    const trend = crypto.change24h >= 0 ? 'up' : 'down';
    return {
      type: 'market',
      source: 'CoinGecko',
      url: `https://www.coingecko.com/en/coins/${crypto.symbol.toLowerCase()}`,
      title: `${crypto.symbol} Cryptocurrency Update`,
      content: `Cryptocurrency: ${crypto.symbol}\nPrice: $${crypto.price}\n24h Change: ${crypto.change24h}%\nMarket Cap: $${crypto.marketCap}\n24h Volume: $${crypto.volume24h}\nTimestamp: ${crypto.timestamp}`,
      metadata: {
        date: crypto.timestamp,
        category: 'market-data',
        verified: true,
        relevance: 0.85,
        tags: ['crypto', 'market', crypto.symbol.toLowerCase(), trend],
      },
    };
  }

  /**
   * Fetch and convert stock data
   */
  async fetchAndConvertStock(symbol: string): Promise<Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  >> {
    const stock = await this.fetchStockData(symbol);
    return this.convertStockToKnowledgeSource(stock);
  }

  /**
   * Fetch and convert crypto data
   */
  async fetchAndConvertCrypto(cryptoId: string): Promise<Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  >> {
    const crypto = await this.fetchCryptoData(cryptoId);
    return this.convertCryptoToKnowledgeSource(crypto);
  }
}

export default MarketDataSource;
