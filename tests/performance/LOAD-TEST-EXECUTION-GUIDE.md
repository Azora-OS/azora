# Load Test Execution Guide

## Overview

This guide provides step-by-step instructions for executing the load tests for Azora OS.

**Requirements:** 4.2 - Execute load tests with 1000 concurrent users achieving p95 response time under 500ms

## Prerequisites

1. **k6 Installed**
   - macOS: `brew install k6`
   - Windows: `choco install k6`
   - Linux: Follow https://k6.io/docs/getting-started/installation/
   - Docker: `docker pull grafana/k6:latest`

2. **API Server Running**
   - Default: http://localhost:4000
   - Verify: `curl http://localhost:4000/api/health`

3. **Frontend Running (Optional)**
   - Default: http://localhost:5175
   - Used for some test scenarios

## Load Test Scripts

### Script 1: 1000 Concurrent Users Test
**File:** `load-test-1000-concurrent.js`

**What it tests:**
- Subscription flow (user signup and tier selection)
- Course purchase flow (browsing and purchasing courses)
- Token earning flow (completing lessons and claiming tokens)
- Enterprise flow (admin dashboard access)

**Duration:** 17 minutes
- 5 minutes: Ramp up from 0 to 1000 concurrent users
- 10 minutes: Sustained load at 1000 concurrent users
- 2 minutes: Ramp down from 1000 to 0 users

**Performance Targets:**
- p50 (median): < 200ms
- p95 (95th percentile): < 500ms ✓ (Main target)
- p99 (99th percentile): < 1000ms
- Error rate: < 1%

**Metrics Tracked:**
- Subscription flow duration
- Course purchase flow duration
- Token earning flow duration
- Enterprise flow duration
- Successful/failed requests
- Error rate

### Script 2: Realistic Traffic Patterns Test
**File:** `load-test-realistic-traffic.js`

**What it tests:**
- New user registration (10% of traffic)
- Course browsing (30% of traffic)
- Learning activity (30% of traffic)
- Wallet activity (20% of traffic)
- Enterprise admin activity (10% of traffic)

**Duration:** 31 minutes
- 2 min: Warm up (100 users)
- 5 min: Morning peak (500 users)
- 2 min: Lunch spike (1000 users)
- 5 min: Sustained (1000 users)
- 3 min: Afternoon decline (300 users)
- 3 min: Maintain (300 users)
- 2 min: Evening spike (800 users)
- 3 min: Maintain (800 users)
- 2 min: Cool down (0 users)

**Performance Targets:**
- p95 response time: < 500ms
- Cache hit rate: > 30%
- Error rate: < 1%

## Running the Tests

### Option 1: Using Shell Script (Linux/macOS)

```bash
# Make script executable
chmod +x tests/performance/run-load-tests.sh

# Run 1000 concurrent users test
./tests/performance/run-load-tests.sh concurrent1000

# Run realistic traffic test
./tests/performance/run-load-tests.sh realistic

# Run with custom URLs
BASE_URL=http://your-frontend.com API_BASE_URL=http://your-api.com \
  ./tests/performance/run-load-tests.sh concurrent1000
```

### Option 2: Using PowerShell (Windows)

```powershell
# Run 1000 concurrent users test
.\tests\performance\run-load-tests.ps1 -TestType concurrent1000

# Run realistic traffic test
.\tests\performance\run-load-tests.ps1 -TestType realistic

# Run with custom URLs
.\tests\performance\run-load-tests.ps1 `
  -TestType concurrent1000 `
  -BaseUrl http://your-frontend.com `
  -ApiBaseUrl http://your-api.com
```

### Option 3: Direct k6 Command

```bash
# 1000 concurrent users test
k6 run \
  -e BASE_URL=http://localhost:5175 \
  -e API_BASE_URL=http://localhost:4000 \
  tests/performance/load-test-1000-concurrent.js

# Realistic traffic test
k6 run \
  -e BASE_URL=http://localhost:5175 \
  -e API_BASE_URL=http://localhost:4000 \
  tests/performance/load-test-realistic-traffic.js

# With JSON output
k6 run \
  -e BASE_URL=http://localhost:5175 \
  -e API_BASE_URL=http://localhost:4000 \
  --out json=results.json \
  tests/performance/load-test-1000-concurrent.js
```

### Option 4: Docker

```bash
# Run with Docker
docker run -i grafana/k6 run - \
  -e BASE_URL=http://localhost:5175 \
  -e API_BASE_URL=http://localhost:4000 \
  < tests/performance/load-test-1000-concurrent.js

# With volume mount
docker run -v $(pwd):/scripts grafana/k6 run \
  -e BASE_URL=http://localhost:5175 \
  -e API_BASE_URL=http://localhost:4000 \
  /scripts/tests/performance/load-test-1000-concurrent.js
```

## Monitoring During Test

### Real-time Metrics Display

k6 displays real-time metrics during execution:

```
     data_received..................: 2.3 MB   1.2 kB/s
     data_sent.......................: 1.8 MB   900 B/s
     http_req_duration...............: avg=245.3ms  min=50.2ms   med=180.1ms  max=892.3ms  p(90)=450.2ms  p(95)=520.1ms
     http_req_failed.................: 0.5%
     http_reqs........................: 15234    7.6/s
     iterations.......................: 3048     1.5/s
     vus............................: 1000
     vus_max..........................: 1000
```

### Key Metrics to Monitor

1. **VUs (Virtual Users):** Should reach target (1000)
2. **http_req_duration:** Response time metrics
   - avg: Average response time
   - p(95): 95th percentile (main target < 500ms)
   - p(99): 99th percentile
3. **http_req_failed:** Percentage of failed requests (should be < 1%)
4. **http_reqs:** Requests per second
5. **iterations:** Completed test iterations

## Interpreting Results

### Success Criteria

✓ **p95 response time < 500ms**
- This is the main performance target
- 95% of requests should complete within 500ms

✓ **Error rate < 1%**
- Less than 1% of requests should fail
- Check error messages for issues

✓ **Cache hit rate > 30%** (for realistic traffic test)
- At least 30% of requests should hit cache
- Indicates caching is working effectively

### Example Successful Output

```
✓ p(95)<500 - 98.5% of requests under 500ms
✓ p(99)<1000 - 99.8% of requests under 1000ms
✓ http_req_failed - 0.5% failure rate (acceptable)
✓ errors - 0.3% error rate (acceptable)
```

### Example Failed Output

```
✗ p(95)<500 - 45.2% of requests exceeded 500ms
✗ http_req_failed - 3.2% failure rate (exceeds 1%)
✗ cache_hits - 15% hit rate (below 30% target)
```

## Troubleshooting

### Issue: "k6: command not found"
**Solution:** Install k6 following the installation guide

### Issue: "Connection refused" errors
**Solution:** 
- Verify API server is running: `curl http://localhost:4000/api/health`
- Check firewall settings
- Verify correct URLs in environment variables

### Issue: High error rate (> 1%)
**Solution:**
- Check API server logs for errors
- Verify database is responsive
- Check for rate limiting issues
- Review error messages in k6 output

### Issue: p95 response time > 500ms
**Solution:**
- Check API server performance
- Monitor CPU and memory usage
- Review slow query logs
- Check for database bottlenecks
- Verify cache is working

### Issue: Low cache hit rate (< 30%)
**Solution:**
- Verify cache is configured
- Check cache TTL settings
- Review cache invalidation logic
- Monitor cache memory usage

## Performance Analysis

### Analyzing JSON Results

If you saved results to JSON:

```bash
# View raw JSON
cat results.json | jq '.'

# Extract response times
cat results.json | jq '.metrics.http_req_duration'

# Extract error rate
cat results.json | jq '.metrics.http_req_failed'

# Extract custom metrics
cat results.json | jq '.metrics.subscription_duration'
```

### Comparing Results

Compare results between test runs:

```bash
# Run test 1
k6 run --out json=results_1.json tests/performance/load-test-1000-concurrent.js

# Run test 2
k6 run --out json=results_2.json tests/performance/load-test-1000-concurrent.js

# Compare metrics
diff <(jq '.metrics.http_req_duration' results_1.json) \
     <(jq '.metrics.http_req_duration' results_2.json)
```

## Best Practices

1. **Run in Isolated Environment**
   - Use staging or dedicated test environment
   - Don't run against production during peak hours

2. **Baseline Before Optimization**
   - Run tests before making changes
   - Compare results after optimization

3. **Monitor System Resources**
   - CPU usage
   - Memory usage
   - Network bandwidth
   - Disk I/O

4. **Gradual Load Increase**
   - Start with lower VU counts
   - Gradually increase to identify breaking points

5. **Analyze Results Thoroughly**
   - Review p95 and p99 percentiles
   - Check error logs
   - Identify bottlenecks

## Next Steps

After running the load tests:

1. **Review Results**
   - Check if all thresholds passed
   - Identify any performance issues

2. **Optimize if Needed**
   - Address bottlenecks
   - Improve caching
   - Optimize database queries

3. **Re-run Tests**
   - Verify improvements
   - Ensure targets are met

4. **Document Findings**
   - Record baseline metrics
   - Document any issues found
   - Track improvements over time

## References

- [k6 Documentation](https://k6.io/docs/)
- [k6 API Reference](https://k6.io/docs/javascript-api/)
- [k6 Best Practices](https://k6.io/docs/testing-guides/load-testing/)
- [Performance Testing Guide](https://k6.io/docs/testing-guides/)
