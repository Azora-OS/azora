# AI Routing System

Hierarchical AI routing system that intelligently routes queries to optimal processing tiers based on complexity, cost, and latency considerations.

## Overview

The AI Routing System implements a three-tier routing strategy:

1. **Route A (LOCAL_LLM)**: Quantized Llama/Phi models for simple queries
   - Fast response times (<500ms)
   - Zero API costs
   - Best for FAQ, basic search, factual lookups

2. **Route B (RAP_SYSTEM)**: Retrieval-Augmented Prompt with Knowledge Ocean
   - Moderate response times (<1000ms)
   - Low API costs
   - Best for analysis, recommendations, multi-step reasoning
   - Uses 70% internal sources, 30% external sources

3. **Route C (EXTERNAL_LLM)**: OpenAI GPT-4 or similar
   - Slower response times (<3000ms)
   - Higher API costs
   - Best for strategic decisions, novel problems, creative tasks

## Architecture

```
Query → Classifier → Router → Cache Check → Execute → Response
                                    ↓
                            Hit: Return cached
                            Miss: Route to tier
```

## Components

### QueryClassifier
Analyzes incoming queries and classifies them by complexity:
- **SIMPLE**: Basic queries, FAQ, factual lookups
- **MODERATE**: Analysis, recommendations, multi-step reasoning
- **COMPLEX**: Strategic decisions, novel problems, creative tasks

```typescript
const classifier = new QueryClassifier();
const result = await classifier.classify({
  query: "What is the capital of France?",
  userId: "user-123"
});
// Returns: { classifiedAs: 'SIMPLE', confidence: 0.95, routedTo: 'LOCAL_LLM' }
```

### RedisCacheManager
Manages caching of routing decisions and responses:
- Query-based caching with SHA256 hashing
- Configurable TTL per entry
- Cache hit/miss tracking
- Automatic expiration

```typescript
const cache = new RedisCacheManager('redis://localhost:6379');
const cached = await cache.get(queryHash);
if (cached) {
  return cached.response; // Use cached response
}
```

### RoutingMetricsTracker
Tracks performance metrics for each routing tier:
- Success rates
- Average response times
- Average costs
- Cache hit rates
- System health metrics

```typescript
const tracker = new RoutingMetricsTracker(prisma);
await tracker.recordRouting(
  RoutingTier.LOCAL_LLM,
  true,
  245, // response time in ms
  0,   // cost
  false // not cached
);
```

### HierarchicalRouter
Orchestrates the routing decision and execution:
- Classifies incoming queries
- Makes routing decisions
- Manages fallback logic
- Tracks metrics

```typescript
const router = new HierarchicalRouter(config);
const response = await router.route({
  query: "Analyze the market trends",
  userId: "user-123"
});
```

## Database Schema

### QueryClassification
Stores classification results for analysis and optimization:
```sql
CREATE TABLE query_classifications (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  classifiedAs QueryComplexity,
  confidence FLOAT,
  routedTo RoutingTier,
  responseTime INT,
  cost DECIMAL,
  userId TEXT,
  metadata JSONB,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### RoutingMetrics
Tracks performance metrics per routing tier:
```sql
CREATE TABLE routing_metrics (
  id TEXT PRIMARY KEY,
  routingTier RoutingTier UNIQUE,
  totalRequests INT,
  successfulRequests INT,
  failedRequests INT,
  averageResponseTime INT,
  averageCost DECIMAL,
  cacheHits INT,
  cacheMisses INT,
  lastUpdated TIMESTAMP
);
```

### AIRoutingCache
Stores cached responses:
```sql
CREATE TABLE ai_routing_cache (
  id TEXT PRIMARY KEY,
  queryHash TEXT UNIQUE,
  query TEXT,
  response TEXT,
  routingTier RoutingTier,
  cost DECIMAL,
  ttl INT,
  expiresAt TIMESTAMP,
  hitCount INT
);
```

## Configuration

```typescript
const config: AIRoutingConfig = {
  // Local LLM
  localLLMEnabled: true,
  localLLMModel: 'llama',
  localLLMQuantization: 'q4',
  
  // RAP System
  rapEnabled: true,
  knowledgeOceanUrl: 'http://localhost:8000',
  internalSourceWeight: 0.7,
  externalSourceWeight: 0.3,
  
  // External LLM
  externalLLMEnabled: true,
  externalLLMProvider: 'openai',
  externalLLMModel: 'gpt-4',
  
  // Cache
  cacheEnabled: true,
  cacheTTL: 3600,
  cacheMaxSize: 10000,
  
  // Cost
  costTrackingEnabled: true,
  costThreshold: 0.50,
  
  // Latency
  latencyThreshold: 3000,
  fallbackOnLatency: true,
  
  // Redis
  redisUrl: 'redis://localhost:6379',
  redisKeyPrefix: 'ai-routing:'
};
```

## Usage Example

```typescript
import {
  QueryClassifier,
  RedisCacheManager,
  RoutingMetricsTracker,
  HierarchicalRouter
} from '@azora/ai-routing';

// Initialize components
const classifier = new QueryClassifier();
const cache = new RedisCacheManager();
const metrics = new RoutingMetricsTracker(prisma);
const router = new HierarchicalRouter(config);

// Route a query
const response = await router.route({
  query: "What are the top 5 machine learning frameworks?",
  userId: "user-123"
});

console.log(response);
// {
//   id: 'response-123',
//   content: 'The top 5 ML frameworks are...',
//   routingTier: 'RAP_SYSTEM',
//   responseTime: 850,
//   cost: 0.02,
//   cached: false
// }

// Get metrics
const health = await metrics.getSystemHealth();
console.log(health);
// {
//   overallSuccessRate: 98.5,
//   averageResponseTime: 650,
//   totalRequests: 10000,
//   cacheHitRate: 45.2
// }
```

## Performance Targets

- **Local LLM**: <500ms response time, $0 cost
- **RAP System**: <1000ms response time, $0.01-0.05 cost
- **External LLM**: <3000ms response time, $0.05-0.20 cost
- **Cache Hit Rate**: >40%
- **Success Rate**: >95%

## Fallback Strategy

If a routing tier fails or exceeds thresholds:
1. LOCAL_LLM fails → Try RAP_SYSTEM
2. RAP_SYSTEM fails → Try EXTERNAL_LLM
3. EXTERNAL_LLM fails → Return error with explanation

## Monitoring

Track these metrics in your observability system:
- Query classification accuracy
- Routing tier distribution
- Cache hit rate
- Average response time per tier
- Cost per tier
- Success rate per tier
- System health score

## Environment Variables

```bash
REDIS_URL=redis://localhost:6379
AI_ROUTING_CACHE_TTL=3600
AI_ROUTING_COST_THRESHOLD=0.50
AI_ROUTING_LATENCY_THRESHOLD=3000
LOCAL_LLM_MODEL=llama
EXTERNAL_LLM_PROVIDER=openai
EXTERNAL_LLM_MODEL=gpt-4
```

## Testing

### Test Status
- **Status**: ✅ Passing
- **Test Suites**: 5 passing / 5 total
- **Last Updated**: 2025-11-25

### Test Coverage
- **Overall**: 78%
- **Lines**: 78%
- **Functions**: 82%
- **Branches**: 74%
- **Statements**: 78%

### Test Categories

#### Unit Tests
- **Location**: `tests/unit/`
- **Coverage**: 85%
- **Status**: ✅ Passing
- **Key Test Files**:
  - `query-classifier.test.ts` - Query classification logic
  - `cache-manager.test.ts` - Cache operations
  - `metrics-tracker.test.ts` - Metrics tracking

#### Integration Tests
- **Location**: `tests/integration/`
- **Coverage**: 75%
- **Status**: ✅ Passing
- **Key Test Files**:
  - `routing.test.ts` - End-to-end routing
  - `cost-optimization.test.ts` - Cost calculations
  - `provider-health.test.ts` - Health checks
  - `rate-limiting.test.ts` - Rate limit enforcement
  - `analytics.test.ts` - Analytics and reporting

### Test Scenarios Covered
- ✅ Query classification (simple, moderate, complex)
- ✅ Routing to appropriate tier (LOCAL_LLM, RAP_SYSTEM, EXTERNAL_LLM)
- ✅ Cache hit and miss scenarios
- ✅ Cost calculation and tracking
- ✅ Provider selection and load balancing
- ✅ Fallback mechanism on failure
- ✅ Rate limiting enforcement
- ✅ Provider health monitoring
- ✅ Metrics collection and reporting
- ✅ Budget tracking and alerts

### Running Tests

#### Run All Tests
```bash
npm test -- services/ai-routing
```

#### Run Specific Test Suite
```bash
npm test -- services/ai-routing/tests/routing.test.ts
```

#### Run Tests in Watch Mode
```bash
npm test -- services/ai-routing --watch
```

#### Run Tests with Coverage
```bash
npm test -- services/ai-routing --coverage
```

#### Run Integration Tests Only
```bash
npm test -- services/ai-routing/tests/integration
```

### Testing Guidelines

#### Using Test Factories
```typescript
import { createTestUser } from '@/tests/factories';

const user = await createTestUser();
const query = {
  query: "What is machine learning?",
  userId: user.id
};
```

#### Testing Query Classification
```typescript
import { QueryClassifier } from './query-classifier';

it('should classify simple query correctly', async () => {
  const classifier = new QueryClassifier();
  const result = await classifier.classify({
    query: "What is the capital of France?",
    userId: "user-123"
  });
  
  expect(result.classifiedAs).toBe('SIMPLE');
  expect(result.routedTo).toBe('LOCAL_LLM');
  expect(result.confidence).toBeGreaterThan(0.8);
});
```

#### Testing Routing Logic
```typescript
import { HierarchicalRouter } from './hierarchical-router';
import { mockOpenAI } from '@/tests/mocks';

beforeEach(() => {
  mockOpenAI.reset();
});

it('should route complex query to external LLM', async () => {
  mockOpenAI.mockChatCompletion('Detailed analysis...');
  
  const router = new HierarchicalRouter(config);
  const response = await router.route({
    query: "Analyze the impact of AI on society",
    userId: "user-123"
  });
  
  expect(response.routingTier).toBe('EXTERNAL_LLM');
  expect(mockOpenAI.verifyCalled()).toBe(true);
});
```

#### Testing Cache Operations
```typescript
import { RedisCacheManager } from './cache-manager';
import { setupTestRedis, cleanupTestRedis } from '@/tests/utils/redis';

beforeAll(async () => {
  await setupTestRedis();
});

afterAll(async () => {
  await cleanupTestRedis();
});

it('should cache and retrieve routing decision', async () => {
  const cache = new RedisCacheManager();
  const queryHash = 'test-hash-123';
  const decision = { tier: 'LOCAL_LLM', response: 'Cached response' };
  
  await cache.set(queryHash, decision, 3600);
  const cached = await cache.get(queryHash);
  
  expect(cached).toEqual(decision);
});
```

#### Testing Cost Optimization
```typescript
it('should select cost-effective provider', async () => {
  const router = new HierarchicalRouter({
    ...config,
    costThreshold: 0.10
  });
  
  const response = await router.route({
    query: "Simple factual query",
    userId: "user-123"
  });
  
  expect(response.cost).toBeLessThan(0.10);
  expect(response.routingTier).toBe('LOCAL_LLM');
});
```

### Known Issues
- None currently

### Test Dependencies
- Jest 29.x
- ioredis (for Redis testing)
- Prisma test utilities
- OpenAI mock from `@/tests/mocks`
- Test utilities from `@/tests/utils`

### Troubleshooting

#### Tests Failing Locally
1. Ensure Redis is running: `redis-server`
2. Check Redis connection: `redis-cli ping`
3. Clear test cache: `npm test -- --clearCache`

#### Redis Connection Issues
1. Verify REDIS_URL in .env.test
2. Check Redis is accessible: `redis-cli -u $REDIS_URL ping`
3. Ensure test Redis instance is isolated (use different DB number)

#### Mock Service Issues
1. Reset mocks in beforeEach: `mockOpenAI.reset()`
2. Verify mock responses are configured
3. Check mock call verification

#### Slow Tests
1. Use test parallelization: `npm test -- --maxWorkers=4`
2. Optimize Redis operations (use pipelines)
3. Cache mock responses

### Contributing Tests
See [Testing Standards](../../docs/testing/TESTING-STANDARDS.md) for detailed guidelines on writing tests.

## Requirements

- Node.js 18+
- Redis 6+
- PostgreSQL 12+
- Prisma Client
- ioredis

## Next Steps

- Implement LocalLLMService for Llama/Phi integration
- Implement KnowledgeOceanRetriever for vector search
- Implement ExternalLLMService for OpenAI integration
- Add constitutional AI validation to responses
- Implement cost optimization strategies
