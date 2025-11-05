/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA SPARK DATAFRAME API
 * 
 * High-level DataFrame API for structured data processing
 * Similar to Spark SQL DataFrame operations
 */

import { SparkContext, RDD, DataFrame } from '../core/spark-context';
import { logger } from '../../../genome/utils/logger';

// ============================================================================
// DATAFRAME IMPLEMENTATION
// ============================================================================

export class SparkDataFrame implements DataFrame {
  private sparkContext: SparkContext;
  private rdd: RDD<any>;
  private schema: Schema;
  private cached: boolean = false;
  private cacheData: any[] | null = null;

  constructor(sparkContext: SparkContext, data: any[], schema?: Schema) {
    this.sparkContext = sparkContext;
    this.rdd = sparkContext.parallelize(data);
    this.schema = schema || this.inferSchema(data);
  }

  select(...columns: string[]): DataFrame {
    return new SparkDataFrame(
      this.sparkContext,
      [],
      this.schema.filter(columns)
    ).withRDD(
      this.rdd.map((row: any) => {
        const selected: any = {};
        columns.forEach(col => {
          selected[col] = row[col];
        });
        return selected;
      })
    );
  }

  filter(condition: string): DataFrame {
    // Simple condition parser (e.g., "age > 18", "name == 'John'")
    const parsed = this.parseCondition(condition);
    
    return new SparkDataFrame(
      this.sparkContext,
      [],
      this.schema
    ).withRDD(
      this.rdd.filter((row: any) => {
        return this.evaluateCondition(row, parsed);
      })
    );
  }

  groupBy(...columns: string[]): GroupedDataFrame {
    return new GroupedDataFrame(this, columns);
  }

  agg(aggregations: Record<string, string>): DataFrame {
    // This would typically be called after groupBy
    // For now, return aggregated results
    return this;
  }

  async show(n: number = 20): Promise<void> {
    const data = await this.rdd.take(n);
    console.table(data);
  }

  async collect(): Promise<any[]> {
    if (this.cached && this.cacheData) {
      return this.cacheData;
    }

    const data = await this.rdd.collect();
    
    if (this.cached) {
      this.cacheData = data;
    }

    return data;
  }

  async count(): Promise<number> {
    return this.rdd.count();
  }

  join(other: DataFrame, on: string): DataFrame {
    // Implementation for join operation
    return new SparkDataFrame(this.sparkContext, [], this.schema);
  }

  // Helper methods
  withRDD(rdd: RDD<any>): SparkDataFrame {
    const df = new SparkDataFrame(this.sparkContext, []);
    df.rdd = rdd;
    df.schema = this.schema;
    return df;
  }

  cache(): DataFrame {
    this.cached = true;
    return this;
  }

  private inferSchema(data: any[]): Schema {
    if (data.length === 0) {
      return new Schema([]);
    }

    const sample = data[0];
    const fields: Field[] = [];

    for (const key in sample) {
      const value = sample[key];
      let type: FieldType = 'string';

      if (typeof value === 'number') {
        type = Number.isInteger(value) ? 'integer' : 'double';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (value instanceof Date) {
        type = 'timestamp';
      } else if (Array.isArray(value)) {
        type = 'array';
      } else if (typeof value === 'object' && value !== null) {
        type = 'object';
      }

      fields.push({ name: key, type, nullable: value === null || value === undefined });
    }

    return new Schema(fields);
  }

  private parseCondition(condition: string): ParsedCondition {
    // Simple parser for conditions like "age > 18", "name == 'John'"
    const operators = ['>=', '<=', '==', '!=', '>', '<'];
    
    for (const op of operators) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map(s => s.trim());
        return {
          column: left,
          operator: op,
          value: this.parseValue(right),
        };
      }
    }

    throw new Error(`Invalid condition: ${condition}`);
  }

  private parseValue(value: string): any {
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }

    // Try parsing as number
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    // Try parsing as boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    return value;
  }

  private evaluateCondition(row: any, condition: ParsedCondition): boolean {
    const value = row[condition.column];
    const compareValue = condition.value;

    switch (condition.operator) {
      case '>':
        return value > compareValue;
      case '<':
        return value < compareValue;
      case '>=':
        return value >= compareValue;
      case '<=':
        return value <= compareValue;
      case '==':
        return value === compareValue;
      case '!=':
        return value !== compareValue;
      default:
        return false;
    }
  }
}

// ============================================================================
// GROUPED DATAFRAME
// ============================================================================

class GroupedDataFrame {
  private df: SparkDataFrame;
  private columns: string[];

  constructor(df: SparkDataFrame, columns: string[]) {
    this.df = df;
    this.columns = columns;
  }

  agg(aggregations: Record<string, string>): DataFrame {
    // Group and aggregate
    return new SparkDataFrame(this.df['sparkContext'], []).withRDD(
      this.df['rdd'].map(async (data: any[]) => {
        const grouped = new Map<string, any[]>();
        
        // Group data
        for (const row of data) {
          const key = this.columns.map(col => row[col]).join('|');
          if (!grouped.has(key)) {
            grouped.set(key, []);
          }
          grouped.get(key)!.push(row);
        }

        // Apply aggregations
        const result: any[] = [];
        for (const [key, group] of grouped.entries()) {
          const row: any = {};
          const keyValues = key.split('|');
          this.columns.forEach((col, i) => {
            row[col] = keyValues[i];
          });

          for (const [aggColumn, aggFunc] of Object.entries(aggregations)) {
            row[aggColumn] = this.applyAggregation(group, aggColumn, aggFunc);
          }

          result.push(row);
        }

        return result;
      } as any)
    );
  }

  private applyAggregation(group: any[], column: string, func: string): any {
    const values = group.map(row => row[column]).filter(v => v !== null && v !== undefined);

    switch (func.toLowerCase()) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
      case 'mean':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      default:
        throw new Error(`Unknown aggregation function: ${func}`);
    }
  }
}

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

interface Field {
  name: string;
  type: FieldType;
  nullable: boolean;
}

type FieldType = 'string' | 'integer' | 'double' | 'boolean' | 'timestamp' | 'array' | 'object';

class Schema {
  fields: Field[];

  constructor(fields: Field[]) {
    this.fields = fields;
  }

  filter(columnNames: string[]): Schema {
    return new Schema(
      this.fields.filter(field => columnNames.includes(field.name))
    );
  }
}

interface ParsedCondition {
  column: string;
  operator: string;
  value: any;
}

// ============================================================================
// DATAFRAME FACTORY
// ============================================================================

export class DataFrameFactory {
  static create(sparkContext: SparkContext, data: any[]): DataFrame {
    return new SparkDataFrame(sparkContext, data);
  }

  static fromRDD(sparkContext: SparkContext, rdd: RDD<any>): DataFrame {
    const df = new SparkDataFrame(sparkContext, []);
    df['rdd'] = rdd;
    return df;
  }

  static fromJSON(sparkContext: SparkContext, json: string): DataFrame {
    const data = JSON.parse(json);
    return new SparkDataFrame(sparkContext, Array.isArray(data) ? data : [data]);
  }
}

export default SparkDataFrame;
