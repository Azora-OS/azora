import { Response } from 'express';
import zlib from 'zlib';
import winston from 'winston';

const logger = winston.createLogger({
  defaultMeta: { service: 'payload-optimizer' },
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [PAYLOAD] ${level}: ${message} ${metaStr}`;
        })
      ),
    }),
  ],
});

/**
 * Payload Optimizer for reducing response sizes
 * Implements compression and field selection strategies
 */
export class PayloadOptimizer {
  private compressionThreshold: number = 1024; // 1KB - compress if larger

  /**
   * Compress response payload
   */
  async compressPayload(data: any, encoding: string = 'gzip'): Promise<Buffer> {
    const jsonString = JSON.stringify(data);
    const buffer = Buffer.from(jsonString, 'utf-8');

    return new Promise((resolve, reject) => {
      if (encoding === 'gzip') {
        zlib.gzip(buffer, (err, compressed) => {
          if (err) reject(err);
          else resolve(compressed);
        });
      } else if (encoding === 'deflate') {
        zlib.deflate(buffer, (err, compressed) => {
          if (err) reject(err);
          else resolve(compressed);
        });
      } else {
        resolve(buffer);
      }
    });
  }

  /**
   * Send compressed response
   */
  async sendCompressed(res: Response, data: any, encoding: string = 'gzip'): Promise<void> {
    try {
      const compressed = await this.compressPayload(data, encoding);
      const originalSize = JSON.stringify(data).length;
      const compressedSize = compressed.length;
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

      res.set('Content-Encoding', encoding);
      res.set('Content-Type', 'application/json');
      res.set('X-Original-Size', originalSize.toString());
      res.set('X-Compressed-Size', compressedSize.toString());
      res.set('X-Compression-Ratio', `${ratio}%`);

      logger.debug('Payload compressed', {
        originalSize,
        compressedSize,
        ratio: `${ratio}%`,
        encoding,
      });

      res.send(compressed);
    } catch (error) {
      logger.error('Compression error', { error: (error as Error).message });
      res.json(data);
    }
  }

  /**
   * Select specific fields from object
   */
  selectFields<T extends Record<string, any>>(obj: T, fields: string[]): Partial<T> {
    const result: any = {};
    fields.forEach(field => {
      if (field in obj) {
        result[field] = obj[field];
      }
    });
    return result;
  }

  /**
   * Select fields from array of objects
   */
  selectFieldsFromArray<T extends Record<string, any>>(
    items: T[],
    fields: string[]
  ): Partial<T>[] {
    return items.map(item => this.selectFields(item, fields));
  }

  /**
   * Remove null/undefined values from object
   */
  removeNullValues<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: any = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  }

  /**
   * Truncate large strings
   */
  truncateStrings<T extends Record<string, any>>(
    obj: T,
    maxLength: number = 100
  ): Partial<T> {
    const result: any = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > maxLength) {
        result[key] = value.substring(0, maxLength) + '...';
      } else {
        result[key] = value;
      }
    });
    return result;
  }

  /**
   * Flatten nested objects
   */
  flattenObject<T extends Record<string, any>>(
    obj: T,
    prefix: string = ''
  ): Record<string, any> {
    const result: Record<string, any> = {};

    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, this.flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    });

    return result;
  }

  /**
   * Paginate array response
   */
  paginateArray<T>(
    items: T[],
    page: number = 1,
    pageSize: number = 20
  ): { data: T[]; page: number; pageSize: number; total: number; hasMore: boolean } {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = items.slice(start, end);
    const total = items.length;
    const hasMore = end < total;

    return {
      data,
      page,
      pageSize,
      total,
      hasMore,
    };
  }

  /**
   * Get payload size
   */
  getPayloadSize(data: any): number {
    return JSON.stringify(data).length;
  }

  /**
   * Get payload size in human readable format
   */
  getPayloadSizeFormatted(data: any): string {
    const bytes = this.getPayloadSize(data);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Set compression threshold
   */
  setCompressionThreshold(bytes: number): void {
    this.compressionThreshold = bytes;
    logger.info('Compression threshold updated', { threshold: bytes });
  }

  /**
   * Get compression threshold
   */
  getCompressionThreshold(): number {
    return this.compressionThreshold;
  }

  /**
   * Optimize response payload
   */
  optimizeResponse<T extends Record<string, any>>(
    data: T,
    options: {
      fields?: string[];
      removeNull?: boolean;
      truncateStrings?: boolean;
      maxStringLength?: number;
      paginate?: boolean;
      page?: number;
      pageSize?: number;
    } = {}
  ): any {
    let result: any = data;

    // Select fields
    if (options.fields) {
      if (Array.isArray(result)) {
        result = this.selectFieldsFromArray(result, options.fields);
      } else {
        result = this.selectFields(result, options.fields);
      }
    }

    // Remove null values
    if (options.removeNull) {
      if (Array.isArray(result)) {
        result = result.map(item => this.removeNullValues(item));
      } else {
        result = this.removeNullValues(result);
      }
    }

    // Truncate strings
    if (options.truncateStrings) {
      const maxLength = options.maxStringLength || 100;
      if (Array.isArray(result)) {
        result = result.map(item => this.truncateStrings(item, maxLength));
      } else {
        result = this.truncateStrings(result, maxLength);
      }
    }

    // Paginate
    if (options.paginate && Array.isArray(result)) {
      result = this.paginateArray(result, options.page, options.pageSize);
    }

    return result;
  }
}

// Export singleton instance
export const payloadOptimizer = new PayloadOptimizer();

/**
 * Common field selections for optimization
 */
export const fieldSelections = {
  // User fields
  userBasic: ['id', 'email', 'name', 'avatar'],
  userProfile: ['id', 'email', 'name', 'avatar', 'bio', 'createdAt'],
  userFull: ['id', 'email', 'name', 'avatar', 'bio', 'createdAt', 'updatedAt'],

  // Course fields
  courseBasic: ['id', 'title', 'category', 'thumbnail'],
  courseList: ['id', 'title', 'category', 'thumbnail', 'instructor', 'rating', 'price'],
  courseFull: ['id', 'title', 'description', 'category', 'thumbnail', 'instructor', 'rating', 'price', 'createdAt'],

  // Job fields
  jobBasic: ['id', 'title', 'company', 'location'],
  jobList: ['id', 'title', 'company', 'location', 'salary', 'type', 'postedAt'],
  jobFull: ['id', 'title', 'description', 'company', 'location', 'salary', 'type', 'requirements', 'postedAt'],

  // Wallet fields
  walletBasic: ['id', 'balance', 'currency'],
  walletFull: ['id', 'balance', 'currency', 'lastUpdated', 'transactions'],
};

/**
 * Response optimization presets
 */
export const responsePresets = {
  minimal: {
    removeNull: true,
    truncateStrings: true,
    maxStringLength: 50,
  },
  standard: {
    removeNull: true,
    truncateStrings: true,
    maxStringLength: 200,
  },
  full: {
    removeNull: false,
    truncateStrings: false,
  },
};
