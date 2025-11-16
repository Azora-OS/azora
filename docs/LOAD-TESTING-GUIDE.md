# Load Testing Guide - Azora OS

This guide provides comprehensive instructions for running, analyzing, and interpreting load tests for Azora OS.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Running Load Tests](#running-load-tests)
4. [Test Scenarios](#test-scenarios)
5. [Analyzing Results](#analyzing-results)
6. [Interpreting Metrics](#interpreting-metrics)
7. [Troubleshooting](#troubleshooting)
8. [Optimization Tips](#optimization-tips)

---

## Overview

Load testing validates that Azora OS can handle expected production traffic and identifies performance bottlenecks. The test suite includes:

- **Load Testing**: Gradual increase in concurrent users
- **Stress Testing**: Push system beyond normal capacity
- **Spike Testing**: Sudden traffic spikes
- **Soak Testing**: Extended load over time

### Test Tools

- **K6**: Primary load testing tool (JavaScript-based)
- **Artillery**: Alternative load testing tool
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization

### Performance Targets

| Metric | Target |
|--------|--------|
| P95 API Latency | <100ms |
| P99 API Latency | <200ms |
| Error Rate | <0.1% |
| Throughput | >1000 req/s |
| Availability | >99.9% |

---

## Prerequisites

### Installation

#### K6 Installation

**Windows (using Chocolatey)**:
```powershell
choco install k6
```

**Windows (using Scoop)**:
```powershell
scoop install k6
```

**macOS (using Homebrew)**:
```bash
brew install k6
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get install k6
```

**Docker**:
```bash
docker run -i grafana/k6 run - < tests/performance/comprehensive-load-test.js
```

#### Verify Installation

```bash
k6 version
# Output: k6 v0.x.x
```

### Environment Setup

1. **Start Services**
   ```bash
   npm run dev
   # or
   docker-compose up -d
   ```

2. **Verify Services Running**
   ```bash
   curl http://localhost:4000/api/health
   # Should return 200 OK
   ```

3. **Set Environment Variables**
   ```bash
   export BASE_URL=http://localhost:4000
   export K6_VUS=50
   export K6_DURATION=5m
   ```

---

## Running Load Tests

### Basic Load Test

Run the comprehensive load test with default settings:

```bash
k6 run tests/performance/comprehensive-load-test.js
```

**Expected Output**:
```
     data_received..................: 2.5 MB   347 kB/s
     data_sent.......................: 1.2 MB   167 kB/s
     http_req_blocked................: avg=2.3ms   min=0s     med=0s     max=45ms    p(90)=0s     p(95)=0s     p(99)=15ms
     http_req_connecting.............: avg=0s      min=0s     med=0s     max=0s      p(90)=0s     p(95)=0s     p(99)=0s
     http_req_duration...............: avg=68ms    min=8ms    med=62ms   max=450ms   p(90)=95ms   p(95)=95ms   p(99)=185ms
     http_req_failed.................: 0.08%
     http_req_receiving..............: avg=2.1ms   min=0s     med=2ms    max=25ms    p(90)=3ms    p(95)=4ms    p(99)=8ms
     http_req_sending................: avg=1.2ms   min=0s     med=1ms    max=15ms    p(90)=2ms    p(95)=2ms    p(99)=4ms
     http_req_tls_handshaking........: avg=0s      min=0s     med=0s     max=0s      p(90)=0s     p(95)=0s     p(99)=0s
     http_req_waiting................: avg=64ms    min=5ms    med=58ms   max=440ms   p(90)=90ms   p(95)=92ms   p(99)=180ms
     http_reqs........................: 8640      1200/s
     iteration_duration..............: avg=10.1s   min=9.2s   med=10s    max=11.5s   p(90)=10.3s  p(95)=10.4s  p(99)=10.6s
     iterations.......................: 720       100/s
     vus..............................: 50        min=0      max=200
     vus_max...........................: 200       min=200    max=200
```

### Custom Load Test

Run with custom parameters:

```bash
# Custom VUs and duration
k6 run tests/performance/comprehensive-load-test.js \
  --vus 100 \
  --duration 10m \
  --rps 500

# Custom base URL
k6 run tests/performance/comprehensive-load-test.js \
  --env BASE_URL=https://staging.azora.world

# With output file
k6 run tests/performance/comprehensive-load-test.js \
  --out json=results.json
```

### Stress Test

Push system beyond normal capacity:

```bash
k6 run tests/performance/comprehensive-load-test.js \
  --stage "5m:500" \
  --stage "5m:1000" \
  --stage "5m:2000" \
  --stage "5m:0"
```

### Spike Test

Simulate sudden traffic spike:

```bash
k6 run tests/performance/comprehensive-load-test.js \
  --stage "1m:50" \
  --stage "30s:500" \
  --stage "1m:50" \
  --stage "30s:0"
```

### Soak Test

Extended load over time (24 hours):

```bash
k6 run tests/performance/comprehensive-load-test.js \
  --vus 100 \
  --duration 24h
```

---

## Test Scenarios

### Scenario 1: Normal Load

**Purpose**: Validate performance under normal conditions

**Configuration**:
```javascript
stages: [
  { duration: '1m', target: 50 },
  { duration: '3m', target: 50 },
  { duration: '1m', target: 0 },
]
```

**Expected Results**:
- P95 Latency: <100ms
- Error Rate: <0.1%
- Throughput: >500 req/s

### Scenario 2: Peak Load

**Purpose**: Validate performance under peak conditions

**Configuration**:
```javascript
stages: [
  { duration: '1m', target: 100 },
  { duration: '5m', target: 100 },
  { duration: '1m', target: 200 },
  { duration: '3m', target: 200 },
  { duration: '1m', target: 0 },
]
```

**Expected Results**:
- P95 Latency: <150ms
- Error Rate: <0.5%
- Throughput: >1000 req/s

### Scenario 3: Stress Test

**Purpose**: Find system breaking point

**Configuration**:
```javascript
stages: [
  { duration: '2m', target: 500 },
  { duration: '5m', target: 500 },
  { duration: '2m', target: 1000 },
  { duration: '5m', target: 1000 },
  { duration: '2m', target: 0 },
]
```

**Expected Results**:
- System remains stable up to 500 concurrent users
- Graceful degradation beyond capacity
- No data loss or corruption

### Scenario 4: Spike Test

**Purpose**: Validate handling of sudden traffic spikes

**Configuration**:
```javascript
stages: [
  { duration: '1m', target: 50 },
  { duration: '30s', target: 500 },
  { duration: '1m', target: 50 },
  { duration: '30s', target: 0 },
]
```

**Expected Results**:
- System handles spike without crashing
- Recovery time: <30 seconds
- No data loss

---

## Analyzing Results

### Real-Time Monitoring

Monitor performance in real-time during test:

```bash
# In separate terminal, open Grafana dashboard
open http://localhost:3000/d/azora-performance

# Or use K6 web UI
k6 run tests/performance/comprehensive-load-test.js --out web
```

### Post-Test Analysis

#### Generate JSON Report

```bash
k6 run tests/performance/comprehensive-load-test.js \
  --out json=results.json
```

#### Parse Results

```bash
# Extract key metrics
cat results.json | jq '.metrics | keys'

# Get specific metric
cat results.json | jq '.metrics.http_req_duration'
```

#### Compare Results

```bash
# Compare two test runs
diff <(jq '.metrics.http_req_duration' results1.json) \
     <(jq '.metrics.http_req_duration' results2.json)
```

### Grafana Dashboard

Access performance metrics in Grafana:

1. Open http://localhost:3000
2. Navigate to "Azora Performance" dashboard
3. View real-time metrics:
   - API Latency (P50, P95, P99)
   - Error Rate
   - Throughput
   - Resource Utilization

---

## Interpreting Metrics

### HTTP Request Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `http_req_duration` | Total request time | <100ms (P95) |
| `http_req_blocked` | Time blocked before request | <10ms |
| `http_req_connecting` | Time to establish connection | <5ms |
| `http_req_tls_handshaking` | TLS handshake time | <20ms |
| `http_req_sending` | Time to send request | <5ms |
| `http_req_waiting` | Time waiting for response | <80ms |
| `http_req_receiving` | Time to receive response | <10ms |

### Error Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `http_req_failed` | Failed requests | <0.1% |
| `http_req_duration{status:5xx}` | 5xx error latency | <500ms |
| `http_req_duration{status:4xx}` | 4xx error latency | <200ms |

### Throughput Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `http_reqs` | Total requests | >1000/s |
| `iterations` | Test iterations | >100/s |
| `data_received` | Data received | >300 KB/s |
| `data_sent` | Data sent | >100 KB/s |

### Virtual User Metrics

| Metric | Description |
|--------|-------------|
| `vus` | Current virtual users |
| `vus_max` | Maximum virtual users |

### Custom Metrics

| Metric | Description |
|--------|-------------|
| `api_duration` | API call duration |
| `errors` | Custom error rate |
| `successful_requests` | Successful requests |
| `failed_requests` | Failed requests |

---

## Troubleshooting

### Common Issues

#### Issue: Connection Refused

**Symptom**: `Error: dial tcp: lookup localhost: no such host`

**Solution**:
1. Verify services are running: `curl http://localhost:4000/api/health`
2. Check BASE_URL environment variable
3. Verify firewall settings

#### Issue: High Error Rate

**Symptom**: Error rate >1%

**Solution**:
1. Check service logs: `docker logs <service-name>`
2. Verify database connectivity
3. Check authentication tokens
4. Review rate limiting settings

#### Issue: Timeout Errors

**Symptom**: `Error: request timeout`

**Solution**:
1. Increase timeout: `--timeout 60s`
2. Reduce VUs: `--vus 50`
3. Check service performance
4. Verify network connectivity

#### Issue: Out of Memory

**Symptom**: `Error: out of memory`

**Solution**:
1. Reduce VUs: `--vus 50`
2. Reduce test duration: `--duration 5m`
3. Increase system memory
4. Use Docker with memory limits

#### Issue: Inconsistent Results

**Symptom**: Results vary significantly between runs

**Solution**:
1. Run multiple iterations
2. Warm up system before test
3. Ensure consistent test data
4. Check for background processes

### Debug Mode

Run with verbose logging:

```bash
k6 run tests/performance/comprehensive-load-test.js \
  --log-output=stdout \
  --verbose
```

### Performance Profiling

Profile specific endpoints:

```bash
k6 run tests/performance/comprehensive-load-test.js \
  --out json=profile.json \
  --summary-export=summary.json
```

---

## Optimization Tips

### API Optimization

1. **Implement Caching**
   ```javascript
   // Cache frequently accessed data
   const cache = new Map();
   if (cache.has(key)) {
     return cache.get(key);
   }
   ```

2. **Reduce Payload Size**
   ```javascript
   // Use field selection
   GET /api/courses?fields=id,name,description
   ```

3. **Implement Pagination**
   ```javascript
   // Paginate large result sets
   GET /api/courses?page=1&limit=20
   ```

4. **Use Compression**
   ```javascript
   // Enable gzip compression
   headers: { 'Accept-Encoding': 'gzip' }
   ```

### Database Optimization

1. **Add Indexes**
   ```sql
   CREATE INDEX idx_user_email ON users(email);
   CREATE INDEX idx_course_category ON courses(category);
   ```

2. **Optimize Queries**
   ```sql
   -- Use EXPLAIN to analyze queries
   EXPLAIN ANALYZE SELECT * FROM courses WHERE category = 'math';
   ```

3. **Connection Pooling**
   ```javascript
   // Configure connection pool
   pool: {
     min: 5,
     max: 20,
     idleTimeoutMillis: 30000,
   }
   ```

### Infrastructure Optimization

1. **Horizontal Scaling**
   - Add more service instances
   - Use load balancing
   - Implement auto-scaling

2. **Vertical Scaling**
   - Increase CPU cores
   - Increase memory
   - Use faster storage

3. **Caching Layer**
   - Implement Redis caching
   - Use CDN for static assets
   - Browser caching

### Code Optimization

1. **Async Operations**
   ```javascript
   // Use async/await
   const result = await database.query(sql);
   ```

2. **Batch Operations**
   ```javascript
   // Batch multiple operations
   await database.batchInsert(records);
   ```

3. **Connection Reuse**
   ```javascript
   // Reuse connections
   const connection = pool.acquire();
   ```

---

## Best Practices

### Before Running Tests

- [ ] Verify all services are running
- [ ] Check database connectivity
- [ ] Verify test data is loaded
- [ ] Clear caches if needed
- [ ] Monitor system resources

### During Tests

- [ ] Monitor real-time metrics
- [ ] Watch for errors or anomalies
- [ ] Check resource utilization
- [ ] Note any performance degradation

### After Tests

- [ ] Analyze results
- [ ] Compare to baselines
- [ ] Identify bottlenecks
- [ ] Document findings
- [ ] Plan optimizations

### Regular Testing

- **Weekly**: Run load tests on staging
- **Monthly**: Run stress tests
- **Quarterly**: Run soak tests
- **Before Release**: Run full test suite

---

## References

- [K6 Documentation](https://k6.io/docs/)
- [Performance Benchmarks](./PERFORMANCE-BENCHMARKS.md)
- [Performance Budget](./PERFORMANCE-BUDGET.md)
- [Monitoring Setup](./OBSERVABILITY-SETUP.md)
- [SLO](./SLO.md)

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review K6 documentation
3. Check service logs
4. Contact DevOps team

---

**Last Updated**: November 15, 2024  
**Version**: 1.0
