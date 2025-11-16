# Performance Optimization Guide - Azora OS

This guide provides practical strategies and implementations for optimizing Azora OS performance based on load test results.

---

## Table of Contents

1. [Overview](#overview)
2. [Caching Strategy](#caching-strategy)
3. [Query Optimization](#query-optimization)
4. [Payload Optimization](#payload-optimization)
5. [Implementation Examples](#implementation-examples)
6. [Monitoring Optimizations](#monitoring-optimizations)
7. [Best Practices](#best-practices)

---

## Overview

Performance optimization focuses on three key areas:

1. **Caching**: Reduce database queries
2. **Query Optimization**: Improve database performance
3. **Payload Optimization**: Reduce response sizes

### Expected Improvements

| Optimization | Expected Improvement | Implementation Time |
|--------------|---------------------|-------------------|
| Redis Caching | 20-30ms reduction | 2-3 hours |
| Query Optimization | 10-15ms reduction | 1-2 hours |
| Payload Compression | 5-10ms reduction | 1 hour |
| **Total** | **35-55ms reduction** | **4-6 hours** |

---

## Caching Strategy

### Overview

Redis caching reduces database queries and improves response times by storing frequently accessed data.

### Implementation

#### 1. Install Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or install locally
brew install redis  # macOS
apt-get install redis-server  # Linux
```

#### 2. Configure Cache Manager

```typescript
import { cacheManager, cacheKeys, cacheTTL } from '@shared/optimization/cache-manager';

// Get or set cache
const courses = await cacheManager.getOrSet(
  cacheKeys.courseList(1, 20),
  () => db.courses.findMany({ skip: 0, take: 20 }),
  cacheTTL.MEDIUM
);
```

#### 3. Cache Invalidation

```typescript
// Invalidate specific cache
await cacheManager.delete(cacheKeys.courseList(1, 20));

// Invalidate pattern
await cacheManager.invalidatePattern('courses:*');
```

### Caching Patterns

#### Cache-Aside Pattern

```typescript
async function getCourse(id: string) {
  return cacheManager.getOrSet(
    cacheKeys.course(id),
    () => db.courses.findUnique({ where: { id } }),
    cacheTTL.LONG
  );
}
```

#### Write-Through Pattern

```typescript
async function updateCourse(id: string, data: any) {
  const updated = await db.courses.update({ where: { id }, data });
  await cacheManager.set(cacheKeys.course(id), updated, cacheTTL.LONG);
  return updated;
}
```

#### Write-Behind Pattern

```typescript
async function createCourse(data: any) {
  const course = await db.courses.create({ data });
  // Cache asynchronously
  cacheManager.set(cacheKeys.course(course.id), course, cacheTTL.LONG).catch(err => {
    logger.error('Cache write failed', { error: err.message });
  });
  return course;
}
```

### Cache TTL Configuration

| Data Type | TTL | Reason |
|-----------|-----|--------|
| User Profile | 1 hour | Stable data |
| Course List | 5 minutes | Frequently updated |
| Course Detail | 1 hour | Stable data |
| Wallet Balance | 1 minute | Frequently changing |
| Job List | 5 minutes | Frequently updated |
| System Config | 24 hours | Rarely changes |

---

## Query Optimization

### Overview

Query optimization improves database performance through better query design and indexing.

### Implementation

#### 1. Use Query Optimizer

```typescript
import { queryOptimizer, queryStrategies } from '@shared/optimization/query-optimizer';

// Execute with performance tracking
const courses = await queryOptimizer.executeQuery(
  'SELECT',
  'courses',
  () => db.courses.findMany({
    ...queryStrategies.paginate(1, 20),
    ...queryStrategies.selectFields(['id', 'title', 'category']),
  })
);
```

#### 2. Pagination

```typescript
// Paginate large result sets
const result = await queryOptimizer.executePaginatedQuery(
  'SELECT',
  'courses',
  (skip, take) => db.courses.findMany({ skip, take }),
  1,  // page
  20  // pageSize
);

// Result: { data, page, pageSize, hasMore }
```

#### 3. Field Projection

```typescript
// Select only needed fields
const courses = await queryOptimizer.executeProjectedQuery(
  'SELECT',
  'courses',
  (fields) => db.courses.findMany({
    select: fields.reduce((acc, f) => ({ ...acc, [f]: true }), {})
  }),
  ['id', 'title', 'category']
);
```

#### 4. Batch Queries

```typescript
// Execute multiple queries efficiently
const results = await queryOptimizer.batchExecute(
  'SELECT',
  'courses',
  [
    () => db.courses.findMany({ take: 10 }),
    () => db.courses.count(),
    () => db.courses.findMany({ where: { featured: true } }),
  ]
);
```

### Database Indexing

#### Add Indexes

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Course queries
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_featured ON courses(featured);

-- Wallet queries
CREATE INDEX idx_wallet_user_id ON wallet(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Job queries
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at);
```

#### Analyze Query Plans

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM courses WHERE category = 'math';

-- Look for sequential scans (should use indexes)
-- Check estimated vs actual rows
-- Verify index usage
```

### Connection Pooling

```typescript
// Configure connection pool
const pool = new Pool({
  min: 5,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Monitor pool
const stats = pool.getPoolStats();
console.log(`Active: ${stats.activeCount}, Idle: ${stats.idleCount}`);
```

---

## Payload Optimization

### Overview

Payload optimization reduces response sizes through compression and field selection.

### Implementation

#### 1. Use Payload Optimizer

```typescript
import { payloadOptimizer, fieldSelections } from '@shared/optimization/payload-optimizer';

// Optimize response
const optimized = payloadOptimizer.optimizeResponse(courses, {
  fields: fieldSelections.courseList,
  removeNull: true,
  truncateStrings: true,
  maxStringLength: 200,
});
```

#### 2. Compression

```typescript
// Send compressed response
app.get('/api/courses', async (req, res) => {
  const courses = await db.courses.findMany();
  await payloadOptimizer.sendCompressed(res, courses, 'gzip');
});
```

#### 3. Field Selection

```typescript
// Select specific fields
const courseList = payloadOptimizer.selectFieldsFromArray(
  courses,
  ['id', 'title', 'category', 'thumbnail']
);
```

#### 4. Pagination

```typescript
// Paginate response
const paginated = payloadOptimizer.paginateArray(
  courses,
  1,    // page
  20    // pageSize
);

// Result: { data, page, pageSize, total, hasMore }
```

### Response Presets

```typescript
// Minimal response (smallest size)
const minimal = payloadOptimizer.optimizeResponse(data, {
  ...responsePresets.minimal,
  fields: fieldSelections.courseBasic,
});

// Standard response (balanced)
const standard = payloadOptimizer.optimizeResponse(data, {
  ...responsePresets.standard,
  fields: fieldSelections.courseList,
});

// Full response (complete data)
const full = payloadOptimizer.optimizeResponse(data, {
  ...responsePresets.full,
  fields: fieldSelections.courseFull,
});
```

---

## Implementation Examples

### Example 1: Optimize Course List Endpoint

**Before**:
```typescript
app.get('/api/courses', async (req, res) => {
  const courses = await db.courses.findMany();
  res.json(courses);
});
```

**After**:
```typescript
app.get('/api/courses', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 20;

  const courses = await cacheManager.getOrSet(
    cacheKeys.courseList(page, pageSize),
    () => queryOptimizer.executePaginatedQuery(
      'SELECT',
      'courses',
      (skip, take) => db.courses.findMany({
        skip,
        take,
        select: {
          id: true,
          title: true,
          category: true,
          thumbnail: true,
          instructor: true,
          rating: true,
          price: true,
        },
      }),
      page,
      pageSize
    ),
    cacheTTL.MEDIUM
  );

  const optimized = payloadOptimizer.optimizeResponse(courses, {
    removeNull: true,
    truncateStrings: true,
  });

  await payloadOptimizer.sendCompressed(res, optimized, 'gzip');
});
```

**Expected Improvement**: 20-30ms reduction

### Example 2: Optimize Wallet Balance Endpoint

**Before**:
```typescript
app.get('/api/wallet/balance', async (req, res) => {
  const wallet = await db.wallet.findUnique({
    where: { userId: req.user.id },
    include: { transactions: true },
  });
  res.json(wallet);
});
```

**After**:
```typescript
app.get('/api/wallet/balance', async (req, res) => {
  const wallet = await cacheManager.getOrSet(
    cacheKeys.walletBalance(req.user.id),
    () => queryOptimizer.executeQuery(
      'SELECT',
      'wallet',
      () => db.wallet.findUnique({
        where: { userId: req.user.id },
        select: {
          id: true,
          balance: true,
          currency: true,
          lastUpdated: true,
        },
      })
    ),
    cacheTTL.SHORT
  );

  const optimized = payloadOptimizer.optimizeResponse(wallet, {
    fields: ['id', 'balance', 'currency'],
    removeNull: true,
  });

  res.json(optimized);
});
```

**Expected Improvement**: 15-20ms reduction

### Example 3: Optimize Job Search Endpoint

**Before**:
```typescript
app.get('/api/jobs', async (req, res) => {
  const jobs = await db.jobs.findMany({
    where: { category: req.query.category },
  });
  res.json(jobs);
});
```

**After**:
```typescript
app.get('/api/jobs', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const category = req.query.category as string;

  const jobs = await cacheManager.getOrSet(
    cacheKeys.jobsByCategory(category, page),
    () => queryOptimizer.executePaginatedQuery(
      'SELECT',
      'jobs',
      (skip, take) => db.jobs.findMany({
        where: { category },
        skip,
        take,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          salary: true,
          type: true,
          postedAt: true,
        },
      }),
      page,
      20
    ),
    cacheTTL.MEDIUM
  );

  const optimized = payloadOptimizer.optimizeResponse(jobs, {
    removeNull: true,
    truncateStrings: true,
    maxStringLength: 150,
  });

  await payloadOptimizer.sendCompressed(res, optimized, 'gzip');
});
```

**Expected Improvement**: 25-35ms reduction

---

## Monitoring Optimizations

### Performance Metrics

Monitor optimization effectiveness:

```typescript
// Get cache statistics
const cacheStats = await cacheManager.getStats();
console.log(`Cache size: ${cacheStats.dbSize} keys`);

// Get query performance
const queryThreshold = queryOptimizer.getSlowQueryThreshold();
console.log(`Slow query threshold: ${queryThreshold}ms`);

// Get payload size
const payloadSize = payloadOptimizer.getPayloadSize(data);
console.log(`Payload size: ${payloadOptimizer.getPayloadSizeFormatted(data)}`);
```

### Grafana Dashboards

Monitor in Grafana:

1. **Cache Hit Rate**: `cache_hits / (cache_hits + cache_misses)`
2. **Query Performance**: `db_query_duration_ms` histogram
3. **Payload Size**: `response_size_bytes` gauge
4. **API Latency**: `http_request_duration_ms` histogram

### Alerts

Configure alerts for optimization issues:

```yaml
- alert: LowCacheHitRate
  expr: cache_hit_rate < 0.5
  for: 5m
  annotations:
    summary: "Cache hit rate below 50%"

- alert: SlowQueries
  expr: db_query_duration_ms{quantile="0.95"} > 50
  for: 5m
  annotations:
    summary: "Database queries exceeding 50ms"

- alert: LargePayloads
  expr: response_size_bytes > 1000000
  for: 5m
  annotations:
    summary: "Response payloads exceeding 1MB"
```

---

## Best Practices

### Caching

- ✅ Use appropriate TTLs for different data types
- ✅ Implement cache invalidation on data changes
- ✅ Monitor cache hit rates
- ✅ Use cache-aside pattern for read-heavy workloads
- ❌ Don't cache sensitive data without encryption
- ❌ Don't use overly long TTLs for frequently changing data

### Query Optimization

- ✅ Use pagination for large result sets
- ✅ Select only needed fields
- ✅ Add indexes on frequently queried columns
- ✅ Use batch operations for multiple queries
- ✅ Monitor slow queries
- ❌ Don't fetch all data and filter in application
- ❌ Don't use SELECT * without specific needs

### Payload Optimization

- ✅ Compress responses with gzip
- ✅ Remove null/undefined values
- ✅ Truncate large strings
- ✅ Paginate large result sets
- ✅ Use field selection
- ❌ Don't send unnecessary data
- ❌ Don't compress already compressed data

### General

- ✅ Measure before and after optimization
- ✅ Test optimizations in staging first
- ✅ Monitor production performance
- ✅ Document optimization decisions
- ✅ Review and update regularly
- ❌ Don't over-optimize prematurely
- ❌ Don't sacrifice code clarity for micro-optimizations

---

## Performance Targets After Optimization

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| P95 API Latency | 95ms | 60ms | <100ms |
| P99 API Latency | 185ms | 130ms | <200ms |
| Error Rate | 0.08% | 0.05% | <0.1% |
| Throughput | 1,200 req/s | 1,500 req/s | >1000 req/s |

---

## References

- [Cache Manager](../services/shared/optimization/cache-manager.ts)
- [Query Optimizer](../services/shared/optimization/query-optimizer.ts)
- [Payload Optimizer](../services/shared/optimization/payload-optimizer.ts)
- [Performance Benchmarks](./PERFORMANCE-BENCHMARKS.md)
- [Load Testing Guide](./LOAD-TESTING-GUIDE.md)

---

**Last Updated**: November 15, 2024  
**Version**: 1.0
