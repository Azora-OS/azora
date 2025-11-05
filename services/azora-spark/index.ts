/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA SPARK - MAIN SERVICE
 * 
 * Distributed data processing framework integrated with Azora ingestion engines
 * Provides Spark-like capabilities for real-time and batch processing
 */

import express from 'express';
import { SparkContext, SparkConfig } from './core/spark-context';
import IngestionManager from './ingestion/ingestion-engine';
import { DataFrameFactory } from './dataframe/dataframe';
import { logger } from '../../genome/utils/logger';

// ============================================================================
// AZORA SPARK SERVICE
// ============================================================================

class AzoraSparkService {
  private app: express.Application;
  private sparkContext: SparkContext | null = null;
  private ingestionManager: IngestionManager;
  private port: number;

  constructor(port: number = 4301) {
    this.app = express();
    this.app.use(express.json());
    this.ingestionManager = new IngestionManager();
    this.port = port;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'azora-spark',
        version: '1.0.0',
        sparkContext: this.sparkContext ? 'running' : 'stopped',
      });
    });

    // Initialize Spark context
    this.app.post('/spark/init', async (req, res) => {
      try {
        const config: SparkConfig = {
          appName: req.body.appName || 'azora-spark-app',
          master: req.body.master || 'local[*]',
          executorMemory: req.body.executorMemory || '2g',
          executorCores: req.body.executorCores || 2,
          numExecutors: req.body.numExecutors || 4,
          defaultParallelism: req.body.defaultParallelism || 8,
          ingestionEngines: req.body.ingestionEngines || ['kafka', 'redis', 'database'],
          enableStreaming: req.body.enableStreaming !== false,
          enableML: req.body.enableML !== false,
        };

        this.sparkContext = new SparkContext(config);
        await this.sparkContext.start();

        res.json({
          success: true,
          message: 'Spark context initialized',
          config,
        });
      } catch (error: any) {
        logger.error(`[Azora Spark] Initialization error: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Stop Spark context
    this.app.post('/spark/stop', async (req, res) => {
      try {
        if (this.sparkContext) {
          await this.sparkContext.stop();
          this.sparkContext = null;
        }
        res.json({ success: true, message: 'Spark context stopped' });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Ingest data from engine
    this.app.post('/ingest', async (req, res) => {
      try {
        if (!this.sparkContext) {
          return res.status(400).json({
            success: false,
            error: 'Spark context not initialized. Call /spark/init first',
          });
        }

        const result = await this.ingestionManager.ingest(
          this.sparkContext,
          req.body
        );

        res.json({
          success: true,
          metadata: result.metadata,
          recordCount: result.metadata.records,
        });
      } catch (error: any) {
        logger.error(`[Azora Spark] Ingestion error: ${error.message}`);
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Process RDD operations
    this.app.post('/rdd/process', async (req, res) => {
      try {
        if (!this.sparkContext) {
          return res.status(400).json({
            success: false,
            error: 'Spark context not initialized',
          });
        }

        const { data, operations } = req.body;
        let rdd = this.sparkContext.parallelize(data);

        // Apply operations
        for (const op of operations || []) {
          switch (op.type) {
            case 'map':
              rdd = rdd.map(op.function);
              break;
            case 'filter':
              rdd = rdd.filter(op.function);
              break;
            case 'reduce':
              const reduced = await rdd.reduce(op.function);
              return res.json({ success: true, result: reduced });
            case 'count':
              const count = await rdd.count();
              return res.json({ success: true, result: count });
            case 'take':
              const taken = await rdd.take(op.n || 10);
              return res.json({ success: true, result: taken });
            default:
              throw new Error(`Unknown operation: ${op.type}`);
          }
        }

        const result = await rdd.collect();
        res.json({ success: true, result });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // DataFrame operations
    this.app.post('/dataframe/create', async (req, res) => {
      try {
        if (!this.sparkContext) {
          return res.status(400).json({
            success: false,
            error: 'Spark context not initialized',
          });
        }

        const { data } = req.body;
        const df = DataFrameFactory.create(this.sparkContext, data);

        res.json({
          success: true,
          message: 'DataFrame created',
          rowCount: await df.count(),
        });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Streaming operations
    this.app.post('/streaming/start', async (req, res) => {
      try {
        if (!this.sparkContext) {
          return res.status(400).json({
            success: false,
            error: 'Spark context not initialized',
          });
        }

        const { batchInterval = 1000, source } = req.body;
        const streamingContext = this.sparkContext.streamingContext(batchInterval);

        let stream;
        if (source.type === 'kafka') {
          stream = streamingContext.kafkaStream(
            source.topic,
            source.brokers || ['localhost:9092']
          );
        } else if (source.type === 'socket') {
          stream = streamingContext.socketTextStream(
            source.host || 'localhost',
            source.port || 9999
          );
        } else {
          throw new Error(`Unknown stream source: ${source.type}`);
        }

        streamingContext.start();
        streamingContext.awaitTermination();

        res.json({ success: true, message: 'Streaming started' });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get cluster status
    this.app.get('/cluster/status', (req, res) => {
      if (!this.sparkContext) {
        return res.json({
          status: 'stopped',
          executors: 0,
        });
      }

      const executors = this.sparkContext.getAllExecutors();
      res.json({
        status: 'running',
        executors: executors.length,
        executorDetails: executors.map(e => ({
          id: e.id,
          status: 'active',
        })),
      });
    });
  }

  async start(): Promise<void> {
    this.app.listen(this.port, () => {
      logger.info(`[Azora Spark] Service started on port ${this.port}`);
      logger.info(`[Azora Spark] Health check: http://localhost:${this.port}/health`);
    });
  }

  async stop(): Promise<void> {
    if (this.sparkContext) {
      await this.sparkContext.stop();
    }
    logger.info('[Azora Spark] Service stopped');
  }
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

if (require.main === module) {
  const port = parseInt(process.env.AZORA_SPARK_PORT || '4301', 10);
  const service = new AzoraSparkService(port);

  service.start().catch((error) => {
    logger.error(`[Azora Spark] Failed to start: ${error}`);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('[Azora Spark] SIGTERM received, shutting down gracefully...');
    await service.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('[Azora Spark] SIGINT received, shutting down gracefully...');
    await service.stop();
    process.exit(0);
  });
}

export default AzoraSparkService;
