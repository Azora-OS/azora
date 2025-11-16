# AI Routing Infrastructure Setup Guide

This guide walks through setting up the AI routing infrastructure and data models for Phase 2.

## Prerequisites

- PostgreSQL 12+ running
- Redis 6+ running
- Node.js 18+
- Prisma CLI installed (`npm install -g prisma`)

## Step 1: Database Migration

The AI routing system requires three new database tables:

### Tables Created

1. **query_classifications** - Stores query classification results
2. **routing_metrics** - Tracks performance metrics per routing tier
3. **ai_routing_cache** - Stores cached responses

### Run Migration

```bash
# Apply the migration
npx prisma migrate deploy

# Or if you want to create a new migration
npx prisma migrate dev --name add_ai_routing_tables
```

### Verify Migration

```bash
# Check the database
psql -U postgres -d azora_db -c "\dt"

# You should see:
# - query_classifications
# - routing_metrics
# - ai_routing_cache
```

## Step 2: Redis Setup

### Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or using Homebrew (macOS)
brew services start redis

# Or using apt (Linux)
sudo systemctl start redis-server
```

### Verify Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

### Configure Redis URL

Add to `.env`:
```bash
REDIS_URL=redis://localhost:6379
```

## Step 3: Install Dependencies

```bash
# Install ioredis for Redis client
npm install ioredis

# Install Prisma Client (if not already installed)
npm install @prisma/client
```

## Step 4: Initialize AI Routing Services

### Create Configuration

Create `services/ai-routing/config.ts`:

```typescript
import { AIRoutingConfig } from './types';

export const defaultConfig: AIRoutingConfig = {
  // Local LLM settings
  localLLMEnabled: true,
  localLLMModel: 'llama',
  localLLMQuantization: 'q4',
  
  // RAP system settings
  rapEnabled: true,
  knowledgeOceanUrl: process.env.KNOWLEDGE_OCEAN_URL || 'http://localhost:8000',
  internalSourceWeight: 0.7,
  externalSourceWeight: 0.3,
  
  // External LLM settings
  externalLLMEnabled: true,
  externalLLMProvider: 'openai',
  externalLLMModel: 'gpt-4',
  
  // Cache settings
  cacheEnabled: true,
  cacheTTL: parseInt(process.env.AI_ROUTING_CACHE_TTL || '3600', 10),
  cacheMaxSize: 10000,
  
  // Cost settings
  costTrackingEnabled: true,
  costThreshold: parseFloat(process.env.AI_ROUTING_COST_THRESHOLD || '0.50'),
  
  // Latency settings
  latencyThreshold: parseInt(process.env.AI_ROUTING_LATENCY_THRESHOLD || '3000', 10),
  fallbackOnLatency: true,
  
  // Redis settings
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisKeyPrefix: 'ai-routing:'
};
```

### Initialize Services

```typescript
import { PrismaClient } from '@prisma/client';
import {
  QueryClassifier,
  RedisCacheManager,
  RoutingMetricsTracker,
  HierarchicalRouter
} from '@azora/ai-routing';
import { defaultConfig } from './config';

const prisma = new PrismaClient();

// Initialize components
const classifier = new QueryClassifier();
const cache = new RedisCacheManager(
  defaultConfig.redisUrl,
  defaultConfig.redisKeyPrefix
);
const metrics = new RoutingMetricsTracker(prisma);
const router = new HierarchicalRouter(defaultConfig);

export { classifier, cache, metrics, router };
```

## Step 5: Verify Setup

### Test Database Connection

```bash
npx prisma studio
# Opens Prisma Studio at http://localhost:5555
# Verify tables are created and empty
```

### Test Redis Connection

```typescript
import { RedisCacheManager } from '@azora/ai-routing';

const cache = new RedisCacheManager();
const stats = await cache.getStats();
console.log('Cache stats:', stats);
// Should output: { hits: 0, misses: 0, size: 0 }
```

### Test Query Classification

```typescript
import { QueryClassifier } from '@azora/ai-routing';

const classifier = new QueryClassifier();
const result = await classifier.classify({
  query: "What is the capital of France?"
});
console.log('Classification:', result);
// Should output classification with SIMPLE complexity
```

### Test Metrics Tracking

```typescript
import { RoutingMetricsTracker } from '@azora/ai-routing';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const tracker = new RoutingMetricsTracker(prisma);

await tracker.recordRouting(
  'LOCAL_LLM',
  true,
  245,
  0,
  false
);

const metrics = await tracker.getMetrics('LOCAL_LLM');
console.log('Metrics:', metrics);
```

## Step 6: Environment Configuration

Add these to `.env`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/azora_db

# Redis
REDIS_URL=redis://localhost:6379

# AI Routing
AI_ROUTING_CACHE_TTL=3600
AI_ROUTING_COST_THRESHOLD=0.50
AI_ROUTING_LATENCY_THRESHOLD=3000

# Local LLM
LOCAL_LLM_MODEL=llama
LOCAL_LLM_QUANTIZATION=q4

# External LLM
EXTERNAL_LLM_PROVIDER=openai
EXTERNAL_LLM_MODEL=gpt-4
OPENAI_API_KEY=sk-...

# Knowledge Ocean
KNOWLEDGE_OCEAN_URL=http://localhost:8000
```

## Step 7: Integration with API Gateway

Update your API gateway to use the AI routing system:

```typescript
import { router } from '@azora/ai-routing';

app.post('/api/query', async (req, res) => {
  try {
    const response = await router.route({
      query: req.body.query,
      userId: req.user.id,
      context: req.body.context
    });
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Step 8: Monitoring Setup

### Prometheus Metrics

Add to your Prometheus configuration:

```yaml
scrape_configs:
  - job_name: 'ai-routing'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics/ai-routing'
```

### Grafana Dashboard

Create a dashboard to monitor:
- Query classification distribution
- Routing tier usage
- Cache hit rate
- Average response time per tier
- Cost per tier
- Success rate per tier

## Troubleshooting

### Redis Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**: Ensure Redis is running
```bash
redis-cli ping
# Should return PONG
```

### Database Migration Error

```
Error: P3005 - The database schema is not in sync with the Prisma schema
```

**Solution**: Reset and re-run migrations
```bash
npx prisma migrate reset
npx prisma migrate deploy
```

### Query Classification Not Working

**Solution**: Verify QueryClassifier initialization
```typescript
const classifier = new QueryClassifier();
const result = await classifier.classify({ query: "test" });
console.log(result);
```

### Cache Not Persisting

**Solution**: Check Redis connection and TTL settings
```bash
redis-cli
> KEYS ai-routing:*
> TTL ai-routing:cache:...
```

## Performance Tuning

### Redis Optimization

```bash
# Increase max memory
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Database Optimization

```sql
-- Add indexes for faster queries
CREATE INDEX idx_query_classifications_user_created 
ON query_classifications(userId, createdAt DESC);

CREATE INDEX idx_routing_metrics_tier_updated 
ON routing_metrics(routingTier, lastUpdated DESC);
```

### Cache Tuning

Adjust TTL based on query patterns:
```typescript
const cache = new RedisCacheManager(
  'redis://localhost:6379',
  'ai-routing:',
  7200 // 2 hours instead of 1 hour
);
```

## Next Steps

1. Implement LocalLLMService for Llama/Phi integration
2. Implement KnowledgeOceanRetriever for vector search
3. Implement ExternalLLMService for OpenAI integration
4. Add constitutional AI validation to responses
5. Implement cost optimization strategies
6. Set up monitoring and alerting

## Support

For issues or questions:
1. Check the README.md for component documentation
2. Review the types.ts for interface definitions
3. Check logs for error messages
4. Verify environment configuration
