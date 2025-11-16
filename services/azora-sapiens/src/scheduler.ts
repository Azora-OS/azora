import cron from 'node-cron';
import KnowledgeOcean from './knowledge-ocean';
import NewsDataSource from './sources/news';
import MarketDataSource from './sources/market';
import ResearchDataSource from './sources/research';
import SouthAfricaDataSource from './sources/south-africa';

export interface SchedulerConfig {
  newsApiKey: string;
  alphaVantageKey: string;
  cryptoApiKey?: string;
  enableNews?: boolean;
  enableMarket?: boolean;
  enableResearch?: boolean;
  enableSouthAfrica?: boolean;
}

export class DataIngestionScheduler {
  private knowledgeOcean: KnowledgeOcean;
  private newsSource: NewsDataSource;
  private marketSource: MarketDataSource;
  private researchSource: ResearchDataSource;
  private saSource: SouthAfricaDataSource;
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private config: SchedulerConfig;

  constructor(knowledgeOcean: KnowledgeOcean, config: SchedulerConfig) {
    this.knowledgeOcean = knowledgeOcean;
    this.config = config;
    this.newsSource = new NewsDataSource(config.newsApiKey);
    this.marketSource = new MarketDataSource(config.alphaVantageKey, config.cryptoApiKey);
    this.researchSource = new ResearchDataSource();
    this.saSource = new SouthAfricaDataSource();
  }

  /**
   * Start all scheduled jobs
   */
  async startAll(): Promise<void> {
    console.log('Starting data ingestion scheduler...');

    if (this.config.enableNews !== false) {
      this.scheduleNewsIngestion();
    }

    if (this.config.enableMarket !== false) {
      this.scheduleMarketIngestion();
    }

    if (this.config.enableResearch !== false) {
      this.scheduleResearchIngestion();
    }

    if (this.config.enableSouthAfrica !== false) {
      this.scheduleSouthAfricaIngestion();
    }

    console.log('Data ingestion scheduler started');
  }

  /**
   * Schedule news ingestion (hourly)
   */
  private scheduleNewsIngestion(): void {
    const job = cron.schedule('0 * * * *', async () => {
      try {
        console.log('Running news ingestion...');
        const topics = [
          'technology',
          'business',
          'education',
          'entrepreneurship',
          'south africa',
        ];

        for (const topic of topics) {
          const sources = await this.newsSource.fetchAndConvert(topic, {
            pageSize: 50,
          });

          await this.knowledgeOcean.ingestSourcesBatch(sources, {
            generateEmbedding: true,
            category: 'news',
            tags: [topic],
          });
        }

        console.log('News ingestion completed');
      } catch (error) {
        console.error('Error in news ingestion:', error);
      }
    });

    this.jobs.set('news', job);
  }

  /**
   * Schedule market data ingestion (every minute)
   */
  private scheduleMarketIngestion(): void {
    const job = cron.schedule('* * * * *', async () => {
      try {
        console.log('Running market data ingestion...');
        const stocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
        const cryptos = ['bitcoin', 'ethereum'];

        // Fetch stocks
        for (const stock of stocks) {
          try {
            const source = await this.marketSource.fetchAndConvertStock(stock);
            await this.knowledgeOcean.ingestSource(source, {
              generateEmbedding: true,
              category: 'market-data',
            });
          } catch (error) {
            console.error(`Error fetching stock ${stock}:`, error);
          }
        }

        // Fetch cryptos
        for (const crypto of cryptos) {
          try {
            const source = await this.marketSource.fetchAndConvertCrypto(crypto);
            await this.knowledgeOcean.ingestSource(source, {
              generateEmbedding: true,
              category: 'market-data',
            });
          } catch (error) {
            console.error(`Error fetching crypto ${crypto}:`, error);
          }
        }

        console.log('Market data ingestion completed');
      } catch (error) {
        console.error('Error in market data ingestion:', error);
      }
    });

    this.jobs.set('market', job);
  }

  /**
   * Schedule research ingestion (every 6 hours)
   */
  private scheduleResearchIngestion(): void {
    const job = cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('Running research ingestion...');
        const topics = [
          'machine learning',
          'education technology',
          'entrepreneurship',
          'business innovation',
        ];

        for (const topic of topics) {
          const sources = await this.researchSource.searchAndConvert(topic, {
            maxResults: 20,
          });

          await this.knowledgeOcean.ingestSourcesBatch(sources, {
            generateEmbedding: true,
            category: 'research',
            tags: [topic],
          });
        }

        console.log('Research ingestion completed');
      } catch (error) {
        console.error('Error in research ingestion:', error);
      }
    });

    this.jobs.set('research', job);
  }

  /**
   * Schedule South Africa data ingestion (every 6 hours)
   */
  private scheduleSouthAfricaIngestion(): void {
    const job = cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('Running South Africa data ingestion...');

        // Fetch economic indicators
        const indicators = ['unemployment', 'gdp', 'inflation'];
        for (const indicator of indicators) {
          try {
            const sources = await this.saSource.fetchAndConvertIndicators(indicator);
            await this.knowledgeOcean.ingestSourcesBatch(sources, {
              generateEmbedding: true,
              category: 'south-africa',
            });
          } catch (error) {
            console.error(`Error fetching indicator ${indicator}:`, error);
          }
        }

        // Fetch JSE stocks
        const jseStocks = ['NPN', 'AGL', 'BIL', 'MTN'];
        for (const stock of jseStocks) {
          try {
            const source = await this.saSource.fetchAndConvertJSE(stock);
            await this.knowledgeOcean.ingestSource(source, {
              generateEmbedding: true,
              category: 'south-africa',
            });
          } catch (error) {
            console.error(`Error fetching JSE stock ${stock}:`, error);
          }
        }

        console.log('South Africa data ingestion completed');
      } catch (error) {
        console.error('Error in South Africa data ingestion:', error);
      }
    });

    this.jobs.set('south-africa', job);
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll(): void {
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`Stopped ${name} ingestion job`);
    }
    this.jobs.clear();
  }

  /**
   * Stop a specific job
   */
  stopJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      console.log(`Stopped ${name} ingestion job`);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const [name, job] of this.jobs) {
      status[name] = !job.stopped;
    }
    return status;
  }
}

export default DataIngestionScheduler;
