/**
 * Redis Cluster Configuration for Production
 * Handles cluster setup, persistence, and replication
 */

import Redis from 'ioredis';

export interface RedisClusterConfig {
  nodes: Array<{
    host: string;
    port: number;
  }>;
  options: {
    enableReadyCheck: boolean;
    enableOfflineQueue: boolean;
    maxRedirections: number;
    retryDelayOnFailover: number;
    retryDelayOnClusterDown: number;
    slotsRefreshTimeout: number;
    dnsLookup: string;
    clusterRetryStrategy: (times: number) => number;
  };
}

export interface RedisPersistenceConfig {
  // RDB (Snapshot) Configuration
  rdb: {
    enabled: boolean;
    saveInterval: number; // seconds
    minChanges: number; // minimum changes to trigger save
  };
  // AOF (Append-Only File) Configuration
  aof: {
    enabled: boolean;
    fsync: 'always' | 'everysec' | 'no';
    rewriteMinSize: string; // e.g., "64mb"
    rewritePercentage: number;
  };
}

export interface RedisReplicationConfig {
  role: 'master' | 'slave';
  masterHost?: string;
  masterPort?: number;
  replicaReadOnly: boolean;
  replicaServeStaleData: boolean;
  replicaPriority: number;
}

/**
 * Get Redis cluster configuration for production
 */
export function getRedisClusterConfig(): RedisClusterConfig {
  const nodes = (process.env.REDIS_CLUSTER_NODES || 'localhost:6379').split(',').map(node => {
    const [host, port] = node.trim().split(':');
    return {
      host,
      port: parseInt(port, 10) || 6379
    };
  });

  return {
    nodes,
    options: {
      enableReadyCheck: true,
      enableOfflineQueue: true,
      maxRedirections: 16,
      retryDelayOnFailover: 100,
      retryDelayOnClusterDown: 300,
      slotsRefreshTimeout: 2000,
      dnsLookup: 'auto',
      clusterRetryStrategy: (times: number) => {
        const delay = Math.min(100 * Math.pow(2, times), 2000);
        return delay;
      }
    }
  };
}

/**
 * Get Redis persistence configuration
 */
export function getRedisPersistenceConfig(): RedisPersistenceConfig {
  return {
    rdb: {
      enabled: true,
      saveInterval: 900, // 15 minutes
      minChanges: 1 // save if at least 1 key changed
    },
    aof: {
      enabled: true,
      fsync: 'everysec', // fsync every second
      rewriteMinSize: '64mb',
      rewritePercentage: 100
    }
  };
}

/**
 * Get Redis replication configuration
 */
export function getRedisReplicationConfig(): RedisReplicationConfig {
  const role = (process.env.REDIS_ROLE || 'master') as 'master' | 'slave';

  return {
    role,
    masterHost: process.env.REDIS_MASTER_HOST,
    masterPort: process.env.REDIS_MASTER_PORT ? parseInt(process.env.REDIS_MASTER_PORT, 10) : undefined,
    replicaReadOnly: true,
    replicaServeStaleData: true,
    replicaPriority: parseInt(process.env.REDIS_REPLICA_PRIORITY || '100', 10)
  };
}

/**
 * Generate Redis configuration commands for cluster setup
 */
export function generateRedisConfigCommands(): string[] {
  const persistence = getRedisPersistenceConfig();
  const commands: string[] = [];

  // RDB configuration
  if (persistence.rdb.enabled) {
    commands.push(`SAVE ${persistence.rdb.saveInterval} ${persistence.rdb.minChanges}`);
  }

  // AOF configuration
  if (persistence.aof.enabled) {
    commands.push(`CONFIG SET appendonly yes`);
    commands.push(`CONFIG SET appendfsync ${persistence.aof.fsync}`);
    commands.push(`CONFIG SET auto-aof-rewrite-min-size ${persistence.aof.rewriteMinSize}`);
    commands.push(`CONFIG SET auto-aof-rewrite-percentage ${persistence.aof.rewritePercentage}`);
  }

  // Replication configuration
  const replication = getRedisReplicationConfig();
  if (replication.role === 'slave' && replication.masterHost) {
    commands.push(`SLAVEOF ${replication.masterHost} ${replication.masterPort || 6379}`);
    commands.push(`CONFIG SET slave-read-only ${replication.replicaReadOnly ? 'yes' : 'no'}`);
    commands.push(`CONFIG SET slave-serve-stale-data ${replication.replicaServeStaleData ? 'yes' : 'no'}`);
  }

  // General configuration
  commands.push(`CONFIG SET maxmemory ${process.env.REDIS_MAX_MEMORY || '2gb'}`);
  commands.push(`CONFIG SET maxmemory-policy ${process.env.REDIS_EVICTION_POLICY || 'allkeys-lru'}`);
  commands.push(`CONFIG SET timeout ${process.env.REDIS_TIMEOUT || '0'}`);
  commands.push(`CONFIG SET tcp-keepalive ${process.env.REDIS_TCP_KEEPALIVE || '300'}`);

  return commands;
}

/**
 * Create Redis cluster instance
 */
export function createRedisCluster(): Redis.Cluster {
  const config = getRedisClusterConfig();

  const cluster = new Redis.Cluster(config.nodes, {
    redisOptions: {
      password: process.env.REDIS_PASSWORD,
      db: 0
    },
    ...config.options
  });

  // Handle cluster events
  cluster.on('connect', () => {
    console.log('Redis Cluster connected');
  });

  cluster.on('ready', () => {
    console.log('Redis Cluster ready');
  });

  cluster.on('error', (err) => {
    console.error('Redis Cluster error:', err);
  });

  cluster.on('node error', (err, node) => {
    console.error(`Redis Cluster node error on ${node}:`, err);
  });

  return cluster;
}

/**
 * Create standalone Redis instance (for development)
 */
export function createRedisInstance(): Redis {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: 0,
    retryStrategy: (times: number) => {
      const delay = Math.min(100 * Math.pow(2, times), 3000);
      return delay;
    },
    enableReadyCheck: true,
    enableOfflineQueue: true,
    maxRetriesPerRequest: null
  });

  redis.on('connect', () => {
    console.log('Redis connected');
  });

  redis.on('ready', () => {
    console.log('Redis ready');
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  return redis;
}

/**
 * Apply persistence configuration to Redis instance
 */
export async function applyPersistenceConfig(redis: Redis | Redis.Cluster): Promise<void> {
  const persistence = getRedisPersistenceConfig();
  const commands = generateRedisConfigCommands();

  try {
    for (const command of commands) {
      await redis.call('CONFIG', 'SET', ...command.split(' ').slice(2));
    }
    console.log('Redis persistence configuration applied');
  } catch (error) {
    console.error('Error applying persistence configuration:', error);
  }
}

/**
 * Get Redis connection string
 */
export function getRedisConnectionString(): string {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || '6379';
  const password = process.env.REDIS_PASSWORD ? `${process.env.REDIS_PASSWORD}@` : '';
  const db = process.env.REDIS_DB || '0';

  return `redis://${password}${host}:${port}/${db}`;
}

/**
 * Validate Redis cluster health
 */
export async function validateRedisClusterHealth(redis: Redis.Cluster): Promise<boolean> {
  try {
    const info = await redis.call('CLUSTER', 'INFO');
    const slots = await redis.call('CLUSTER', 'SLOTS');

    console.log('Cluster info:', info);
    console.log('Cluster slots:', slots);

    return true;
  } catch (error) {
    console.error('Redis cluster health check failed:', error);
    return false;
  }
}

/**
 * Get Redis cluster statistics
 */
export async function getRedisClusterStats(redis: Redis.Cluster): Promise<Record<string, any>> {
  try {
    const info = await redis.info();
    const dbSize = await redis.dbsize();
    const memory = await redis.info('memory');

    return {
      info,
      dbSize,
      memory
    };
  } catch (error) {
    console.error('Error getting cluster stats:', error);
    return {};
  }
}
