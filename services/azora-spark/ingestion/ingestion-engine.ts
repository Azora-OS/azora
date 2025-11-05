/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA SPARK INGESTION ENGINES
 * 
 * Unified interface for all Azora ingestion engines
 * Integrates with Kafka, Redis, Database, File systems, and more
 */

import { SparkContext, RDD } from '../core/spark-context';
import { logger } from '../../../genome/utils/logger';

// ============================================================================
// INGESTION ENGINE INTERFACE
// ============================================================================

export interface IngestionConfig {
  type: 'kafka' | 'redis' | 'database' | 'file' | 'websocket' | 'api' | 's3' | 'mongodb';
  config: any;
  batchSize?: number;
  parallelism?: number;
  enableStreaming?: boolean;
}

export interface IngestionResult {
  rdd: RDD<any>;
  metadata: {
    source: string;
    records: number;
    timestamp: number;
    partitions: number;
  };
}

// ============================================================================
// KAFKA INGESTION ENGINE
// ============================================================================

export class KafkaIngestionEngine {
  async ingest(sparkContext: SparkContext, config: any): Promise<IngestionResult> {
    const { topic, brokers, groupId, batchSize = 1000 } = config;
    
    logger.info(`[Azora Spark] Ingesting from Kafka topic: ${topic}`);

    try {
      const { Kafka } = require('kafkajs');
      const kafka = new Kafka({
        brokers: brokers || ['localhost:9092'],
        clientId: 'azora-spark-ingestion',
      });

      const consumer = kafka.consumer({ groupId: groupId || 'azora-spark-group' });
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: false });

      const messages: any[] = [];
      let messageCount = 0;

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const value = message.value?.toString();
            if (value) {
              messages.push({
                topic,
                partition,
                offset: message.offset,
                timestamp: message.timestamp,
                key: message.key?.toString(),
                value: JSON.parse(value),
              });
              messageCount++;
            }
          } catch (error) {
            logger.error(`[Azora Spark] Error parsing Kafka message: ${error}`);
          }

          if (messageCount >= batchSize) {
            await consumer.pause([{ topic, partitions: [partition] }]);
          }
        },
      });

      // Wait for batch
      await new Promise(resolve => setTimeout(resolve, 5000));
      await consumer.disconnect();

      const rdd = sparkContext.parallelize(messages, config.parallelism || 8);

      return {
        rdd,
        metadata: {
          source: `kafka://${brokers[0]}/${topic}`,
          records: messages.length,
          timestamp: Date.now(),
          partitions: config.parallelism || 8,
        },
      };
    } catch (error) {
      logger.error(`[Azora Spark] Kafka ingestion error: ${error}`);
      throw error;
    }
  }
}

// ============================================================================
// REDIS INGESTION ENGINE
// ============================================================================

export class RedisIngestionEngine {
  async ingest(sparkContext: SparkContext, config: any): Promise<IngestionResult> {
    const { pattern, keys, redisUrl } = config;
    
    logger.info(`[Azora Spark] Ingesting from Redis pattern: ${pattern || keys}`);

    try {
      const redis = require('redis');
      const client = redis.createClient({ url: redisUrl || process.env.REDIS_URL || 'redis://localhost:6379' });
      await client.connect();

      let keysToFetch: string[] = [];
      
      if (pattern) {
        keysToFetch = await client.keys(pattern);
      } else if (keys) {
        keysToFetch = Array.isArray(keys) ? keys : [keys];
      } else {
        keysToFetch = await client.keys('*');
      }

      const data = await Promise.all(
        keysToFetch.map(async (key) => {
          const value = await client.get(key);
          return {
            key,
            value: value ? JSON.parse(value) : null,
            timestamp: Date.now(),
          };
        })
      );

      await client.disconnect();

      const rdd = sparkContext.parallelize(data, config.parallelism || 8);

      return {
        rdd,
        metadata: {
          source: `redis://${redisUrl || 'localhost:6379'}`,
          records: data.length,
          timestamp: Date.now(),
          partitions: config.parallelism || 8,
        },
      };
    } catch (error) {
      logger.error(`[Azora Spark] Redis ingestion error: ${error}`);
      throw error;
    }
  }
}

// ============================================================================
// DATABASE INGESTION ENGINE
// ============================================================================

export class DatabaseIngestionEngine {
  async ingest(sparkContext: SparkContext, config: any): Promise<IngestionResult> {
    const { query, connection, databaseType = 'postgresql' } = config;
    
    logger.info(`[Azora Spark] Ingesting from ${databaseType} database`);

    try {
      let data: any[] = [];

      switch (databaseType) {
        case 'postgresql':
        case 'postgres':
          const { Pool } = require('pg');
          const pool = new Pool(connection);
          const result = await pool.query(query);
          data = result.rows;
          await pool.end();
          break;

        case 'mysql':
          const mysql = require('mysql2/promise');
          const mysqlConn = await mysql.createConnection(connection);
          const [rows] = await mysqlConn.execute(query);
          data = rows as any[];
          await mysqlConn.end();
          break;

        case 'mongodb':
          const { MongoClient } = require('mongodb');
          const client = new MongoClient(connection.url);
          await client.connect();
          const db = client.db(connection.database);
          const collection = db.collection(connection.collection);
          data = await collection.find(connection.query || {}).toArray();
          await client.close();
          break;

        default:
          throw new Error(`Unsupported database type: ${databaseType}`);
      }

      const rdd = sparkContext.parallelize(data, config.parallelism || 8);

      return {
        rdd,
        metadata: {
          source: `${databaseType}://${connection.host || 'localhost'}/${connection.database || 'default'}`,
          records: data.length,
          timestamp: Date.now(),
          partitions: config.parallelism || 8,
        },
      };
    } catch (error) {
      logger.error(`[Azora Spark] Database ingestion error: ${error}`);
      throw error;
    }
  }
}

// ============================================================================
// FILE INGESTION ENGINE
// ============================================================================

export class FileIngestionEngine {
  async ingest(sparkContext: SparkContext, config: any): Promise<IngestionResult> {
    const { path, format = 'json', delimiter = '\n' } = config;
    
    logger.info(`[Azora Spark] Ingesting from file: ${path}`);

    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(path, 'utf-8');

      let data: any[] = [];

      switch (format) {
        case 'json':
          if (content.trim().startsWith('[')) {
            data = JSON.parse(content);
          } else {
            data = content.split(delimiter)
              .filter(line => line.trim())
              .map(line => {
                try {
                  return JSON.parse(line);
                } catch {
                  return { raw: line };
                }
              });
          }
          break;

        case 'csv':
          const lines = content.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',');
          data = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((header, i) => {
              obj[header.trim()] = values[i]?.trim() || null;
            });
            return obj;
          });
          break;

        case 'text':
          data = content.split(delimiter)
            .filter(line => line.trim())
            .map(line => ({ text: line }));
          break;

        default:
          throw new Error(`Unsupported file format: ${format}`);
      }

      const rdd = sparkContext.parallelize(data, config.parallelism || 8);

      return {
        rdd,
        metadata: {
          source: `file://${path}`,
          records: data.length,
          timestamp: Date.now(),
          partitions: config.parallelism || 8,
        },
      };
    } catch (error) {
      logger.error(`[Azora Spark] File ingestion error: ${error}`);
      throw error;
    }
  }
}

// ============================================================================
// S3 INGESTION ENGINE
// ============================================================================

export class S3IngestionEngine {
  async ingest(sparkContext: SparkContext, config: any): Promise<IngestionResult> {
    const { bucket, key, region = 'us-east-1' } = config;
    
    logger.info(`[Azora Spark] Ingesting from S3: s3://${bucket}/${key}`);

    try {
      const AWS = require('aws-sdk');
      const s3 = new AWS.S3({ region });

      const object = await s3.getObject({ Bucket: bucket, Key: key }).promise();
      const content = object.Body.toString('utf-8');

      // Parse based on file extension
      const format = key.endsWith('.json') ? 'json' : 
                     key.endsWith('.csv') ? 'csv' : 'text';
      
      const fileEngine = new FileIngestionEngine();
      return fileEngine.ingest(sparkContext, { path: key, format, content });
    } catch (error) {
      logger.error(`[Azora Spark] S3 ingestion error: ${error}`);
      throw error;
    }
  }
}

// ============================================================================
// API INGESTION ENGINE
// ============================================================================

export class APIIngestionEngine {
  async ingest(sparkContext: SparkContext, config: any): Promise<IngestionResult> {
    const { url, method = 'GET', headers = {}, body, pagination } = config;
    
    logger.info(`[Azora Spark] Ingesting from API: ${url}`);

    try {
      const axios = require('axios');
      let allData: any[] = [];
      let currentUrl = url;
      let page = 1;

      do {
        const response = await axios({
          method,
          url: currentUrl,
          headers,
          data: body,
        });

        const data = Array.isArray(response.data) 
          ? response.data 
          : response.data.data || [response.data];

        allData.push(...data);

        // Handle pagination
        if (pagination) {
          if (pagination.type === 'offset') {
            currentUrl = pagination.nextUrl?.(page, response.data);
            page++;
            if (!currentUrl || page > (pagination.maxPages || 100)) break;
          } else if (pagination.type === 'cursor') {
            const cursor = pagination.getCursor(response.data);
            if (!cursor) break;
            currentUrl = pagination.nextUrl(cursor);
          }
        } else {
          break;
        }
      } while (pagination);

      const rdd = sparkContext.parallelize(allData, config.parallelism || 8);

      return {
        rdd,
        metadata: {
          source: `api://${url}`,
          records: allData.length,
          timestamp: Date.now(),
          partitions: config.parallelism || 8,
        },
      };
    } catch (error) {
      logger.error(`[Azora Spark] API ingestion error: ${error}`);
      throw error;
    }
  }
}

// ============================================================================
// UNIFIED INGESTION MANAGER
// ============================================================================

export class IngestionManager {
  private engines: Map<string, any> = new Map();

  constructor() {
    this.registerEngine('kafka', new KafkaIngestionEngine());
    this.registerEngine('redis', new RedisIngestionEngine());
    this.registerEngine('database', new DatabaseIngestionEngine());
    this.registerEngine('file', new FileIngestionEngine());
    this.registerEngine('s3', new S3IngestionEngine());
    this.registerEngine('api', new APIIngestionEngine());
  }

  registerEngine(name: string, engine: any): void {
    this.engines.set(name, engine);
  }

  async ingest(sparkContext: SparkContext, config: IngestionConfig): Promise<IngestionResult> {
    const engine = this.engines.get(config.type);
    if (!engine) {
      throw new Error(`Unknown ingestion engine: ${config.type}`);
    }

    return engine.ingest(sparkContext, config.config);
  }

  async ingestMultiple(
    sparkContext: SparkContext,
    configs: IngestionConfig[]
  ): Promise<IngestionResult[]> {
    return Promise.all(
      configs.map(config => this.ingest(sparkContext, config))
    );
  }
}

export default IngestionManager;
