# Performance Optimization Guide

## Task 13: Performance Optimization

### 13.1 Database Query Optimization

**Implemented**:
- Connection pooling via PgBouncer
- Query result caching in Redis
- Index optimization (add to Prisma schema)

**Best Practices**:
```javascript
// Use indexes for frequently queried fields
@@index([email])
@@index([createdAt])

// Use select to limit fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, name: true }
});

// Use pagination
const users = await prisma.user.findMany({
  take: 20,
  skip: page * 20
});
```

**Target**: p95 query time < 50ms

### 13.2 Caching Strategy

**Implementation**: Redis caching middleware

**Cache Layers**:
1. **Session Cache**: User sessions (TTL: 1 hour)
2. **Data Cache**: Frequently accessed data (TTL: 5 minutes)
3. **API Response Cache**: GET endpoints (TTL: 1 minute)

**Usage**:
```javascript
const { cacheMiddleware } = require('./middleware/cache');

// Cache GET requests for 5 minutes
app.get('/api/courses', cacheMiddleware(300), handler);
```

**Target**: 80%+ cache hit rate

### 13.3 API Response Optimization

**Implemented**:
- Gzip compression (threshold: 1KB)
- Response pagination
- Field filtering support

**Compression**:
```javascript
const compression = require('./middleware/compression');
app.use(compression);
```

**Pagination**:
```javascript
// Add to all list endpoints
?page=1&limit=20
```

**Target**: p95 API response < 200ms

## Task 14: Load Testing

### 14.1 Load Test Scenarios

**Tool**: k6

**Scenarios**:
1. **Authentication Flow**: Login → Profile access
2. **Course Enrollment**: Browse → Enroll → Access
3. **Payment Processing**: Cart → Checkout → Payment

**Run Tests**:
```bash
# 100 concurrent users
k6 run --vus 100 --duration 5m tests/performance/load-test.js

# 1000 concurrent users
k6 run --vus 1000 --duration 5m tests/performance/load-test.js

# 10000 concurrent users
k6 run --vus 10000 --duration 5m tests/performance/load-test.js
```

### 14.2 Load Test Results

**Thresholds**:
- p95 latency < 200ms
- Error rate < 5%
- Throughput > 1000 req/s

**Metrics Collected**:
- Request duration (p50, p95, p99)
- Error rate
- Throughput (requests/second)
- Resource usage (CPU, memory)

### 14.3 Performance Baselines

**SLOs**:
- Availability: 99.9% (43 minutes downtime/month)
- Latency: p95 < 200ms
- Error Rate: < 1%
- Throughput: > 1000 req/s

## Task 15: Scalability Validation

### 15.1 Horizontal Pod Autoscaling

**Configuration**: `infrastructure/kubernetes/hpa-auth.yaml`

**Metrics**:
- CPU threshold: 70%
- Memory threshold: 80%
- Min replicas: 3
- Max replicas: 10

**Scale-up**: 100% increase every 30s (max 2 pods)
**Scale-down**: 50% decrease every 60s (5-minute stabilization)

**Test**:
```bash
# Apply HPA
kubectl apply -f infrastructure/kubernetes/hpa-auth.yaml

# Generate load
k6 run --vus 5000 tests/performance/load-test.js

# Watch scaling
kubectl get hpa -n azora-production -w
```

### 15.2 Database Scaling

**Connection Pooling**: PgBouncer
- Max connections: 1000
- Pool size: 25 per database
- Pool mode: Transaction

**Read Replicas**: PostgreSQL replication
- 1 primary (write)
- 2 replicas (read)
- Automatic failover

**Configuration**: `infrastructure/database/pgbouncer.yaml`

**Connection String**:
```
postgresql://user:pass@pgbouncer:6432/azora
```

### 15.3 Disaster Recovery

**RPO**: 1 hour (Recovery Point Objective)
**RTO**: 4 hours (Recovery Time Objective)

**Backup Strategy**:
- PostgreSQL: Daily full backup + WAL archiving
- Redis: AOF + RDB snapshots every 5 minutes

**Test DR**:
```bash
./scripts/backup-restore-test.sh
```

**Procedures**:
1. Detect failure via monitoring
2. Assess impact and data loss
3. Restore from latest backup
4. Verify data integrity
5. Switch traffic to restored instance
6. Monitor for issues

## Performance Monitoring

### Metrics to Track

**Application**:
- Request rate (req/s)
- Response time (p50, p95, p99)
- Error rate (%)
- Active connections

**Infrastructure**:
- CPU usage (%)
- Memory usage (%)
- Disk I/O (IOPS)
- Network throughput (Mbps)

**Database**:
- Query time (ms)
- Connection pool usage
- Cache hit rate (%)
- Replication lag (ms)

### Dashboards

**Grafana Dashboards**:
1. Service Health (uptime, errors, latency)
2. Infrastructure (CPU, memory, disk, network)
3. Database Performance (queries, connections, cache)
4. Business Metrics (users, transactions, revenue)

### Alerts

**Critical**:
- Service down (immediate)
- Error rate > 5% (immediate)
- p95 latency > 500ms (5 minutes)

**Warning**:
- CPU > 70% (10 minutes)
- Memory > 80% (10 minutes)
- Disk > 85% (30 minutes)

## Optimization Checklist

### Application Level
- [x] Response compression enabled
- [x] Caching implemented (Redis)
- [x] Connection pooling (PgBouncer)
- [ ] Database indexes optimized
- [ ] N+1 queries eliminated
- [ ] Pagination on list endpoints

### Infrastructure Level
- [x] Horizontal pod autoscaling configured
- [x] Resource limits set appropriately
- [ ] CDN for static assets
- [ ] Load balancer configured
- [ ] Multi-zone deployment

### Database Level
- [x] Connection pooling (PgBouncer)
- [ ] Read replicas configured
- [ ] Slow query logging enabled
- [ ] Indexes on frequently queried fields
- [ ] Query result caching

## Next Steps

1. Run load tests in staging
2. Analyze bottlenecks
3. Implement optimizations
4. Re-test and validate improvements
5. Deploy to production
6. Monitor and iterate
