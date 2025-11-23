# Performance Optimization Guide

## Overview

This document outlines the performance optimization strategies implemented in the Elara Incubator Platform.

## Caching Strategy

### In-Memory Cache
- **Location**: `src/utils/cache.ts`
- **TTL**: Configurable per key (default 5 minutes)
- **Use Cases**:
  - Business data (5 min TTL)
  - Revenue statistics (10 min TTL)
  - Fund balance (5 min TTL)
  - User preferences (30 min TTL)

### Cache Implementation
```typescript
import { cache } from '../utils/cache.js';

// Set cache
cache.set('business:123', businessData, 300); // 5 minutes

// Get cache
const data = cache.get('business:123');

// Check existence
if (cache.has('business:123')) {
  // Use cached data
}
```

### Cache Invalidation
- Automatic cleanup every 5 minutes
- Manual invalidation on data updates
- TTL-based expiration

## Pagination Strategy

### Implementation
- **Location**: `src/utils/pagination.ts`
- **Default Page Size**: 10 items
- **Max Page Size**: 100 items
- **Validation**: Automatic parameter validation

### Usage
```typescript
import { paginate, validatePaginationParams } from '../utils/pagination.js';

const { page, pageSize } = validatePaginationParams(
  req.query.page,
  req.query.pageSize
);

const result = paginate(items, page, pageSize);
```

### API Response Format
```json
{
  "data": [...],
  "total": 1000,
  "page": 1,
  "pageSize": 10,
  "totalPages": 100,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

## Database Query Optimization

### Indexing Strategy
```sql
-- Business queries
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_status ON businesses(status);

-- Revenue queries
CREATE INDEX idx_revenue_transactions_business_id ON revenue_transactions(business_id);
CREATE INDEX idx_revenue_transactions_created_at ON revenue_transactions(created_at);

-- Payment queries
CREATE INDEX idx_payments_business_id ON payments(business_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Fund queries
CREATE INDEX idx_citadel_fund_contributions_business_id ON citadel_fund_contributions(business_id);
```

### Query Optimization Tips
1. **Use pagination** for large result sets
2. **Select only needed columns** instead of SELECT *
3. **Use indexes** on frequently filtered columns
4. **Batch operations** when possible
5. **Avoid N+1 queries** with proper joins

## API Response Optimization

### Response Compression
- Enable gzip compression in Express middleware
- Reduce payload size by 60-80%

### Response Caching
- Cache GET requests with appropriate TTL
- Use ETag headers for conditional requests
- Implement cache-control headers

### Lazy Loading
- Load related data on demand
- Use pagination for large collections
- Implement field selection

## Performance Monitoring

### Key Metrics
- **API Response Time**: Target < 200ms
- **Database Query Time**: Target < 100ms
- **Cache Hit Rate**: Target > 80%
- **Memory Usage**: Monitor for leaks

### Monitoring Implementation
```typescript
// Track API response time
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

## Optimization Checklist

- [x] Implement in-memory caching
- [x] Add pagination support
- [x] Create database indexes
- [x] Enable response compression
- [x] Implement query optimization
- [x] Add performance monitoring
- [ ] Implement Redis caching (future)
- [ ] Add database connection pooling (future)
- [ ] Implement CDN for static assets (future)
- [ ] Add query result caching (future)

## Best Practices

### 1. Cache Invalidation
```typescript
// Invalidate cache on data updates
async function updateBusiness(id: string, data: any) {
  const result = await db.update(id, data);
  cache.delete(`business:${id}`); // Invalidate cache
  return result;
}
```

### 2. Pagination in Services
```typescript
async function getTransactions(businessId: string, page: number, pageSize: number) {
  const { page: validPage, pageSize: validPageSize } = validatePaginationParams(page, pageSize);
  const start = (validPage - 1) * validPageSize;
  const end = start + validPageSize;
  
  const items = transactions.filter(t => t.businessId === businessId);
  return paginate(items, validPage, validPageSize);
}
```

### 3. Efficient Queries
```typescript
// Bad: N+1 query problem
for (const business of businesses) {
  const revenue = await getRevenue(business.id); // Multiple queries
}

// Good: Single query with join
const businessesWithRevenue = await db.query(`
  SELECT b.*, r.total_revenue
  FROM businesses b
  LEFT JOIN revenue_transactions r ON b.id = r.business_id
  WHERE b.user_id = ?
`);
```

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | < 200ms | - |
| Database Query Time | < 100ms | - |
| Cache Hit Rate | > 80% | - |
| Page Load Time | < 2s | - |
| Memory Usage | < 500MB | - |

## Future Optimizations

1. **Redis Caching**: Distributed caching for multi-instance deployments
2. **Database Connection Pooling**: Reuse database connections
3. **Query Result Caching**: Cache expensive query results
4. **CDN Integration**: Serve static assets from CDN
5. **API Rate Limiting**: Prevent abuse and ensure fair usage
6. **Batch Processing**: Process large operations in batches
7. **Async Processing**: Move heavy operations to background jobs

## Monitoring and Alerts

### Setup Monitoring
```typescript
// Monitor cache performance
setInterval(() => {
  console.log(`Cache size: ${cache.size()}`);
  console.log(`Cache hit rate: ${calculateHitRate()}%`);
}, 60000); // Every minute
```

### Alert Thresholds
- Response time > 500ms: Warning
- Response time > 1000ms: Critical
- Cache hit rate < 50%: Warning
- Memory usage > 80%: Warning

---

**Last Updated**: 2024-11-19
**Version**: 1.0
