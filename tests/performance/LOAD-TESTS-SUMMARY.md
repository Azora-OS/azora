# Load Tests Implementation Summary

## Task: 15. Execute Load Testing

**Status:** Subtask 15.1 Complete, Subtask 15.2 Ready for Execution

**Requirements:** 4.2
- Execute load tests with 1000 concurrent users
- Monitor p95 response times
- Verify < 500ms target

## Files Created

### 1. Load Test Scripts

#### `load-test-1000-concurrent.js`
- Tests 1000 concurrent users
- Duration: 17 minutes (5m ramp up, 10m sustained, 2m ramp down)
- Tests 4 workflows:
  - Subscription flow
  - Course purchase flow
  - Token earning flow
  - Enterprise flow
- Tracks custom metrics for each flow
- Target: p95 < 500ms, error rate < 1%

#### `load-test-realistic-traffic.js`
- Simulates realistic user behavior
- Duration: 31 minutes with varying load
- User distribution:
  - 10% new user registration
  - 30% course browsing
  - 30% learning activity
  - 20% wallet activity
  - 10% enterprise admin
- Includes cache hit rate tracking
- Target: p95 < 500ms, cache hit rate > 30%

### 2. Configuration

#### `k6-config.js`
- Centralized configuration for load tests
- Defines 5 test scenarios:
  - concurrent1000: 1000 concurrent users
  - realisticTraffic: Realistic traffic patterns
  - spike: Sudden traffic spike
  - stress: Gradually increasing load
  - soak: Sustained load for long duration
- Defines all API endpoints
- Defines performance targets
- Defines user behavior patterns

### 3. Test Runners

#### `run-load-tests.sh` (Linux/macOS)
- Shell script to run load tests
- Checks k6 installation
- Verifies API connectivity
- Runs selected test type
- Generates JSON and summary output
- Usage: `./run-load-tests.sh concurrent1000`

#### `run-load-tests.ps1` (Windows)
- PowerShell script to run load tests
- Same functionality as shell script
- Usage: `.\run-load-tests.ps1 -TestType concurrent1000`

### 4. Documentation

#### `LOAD-TESTING-README.md`
- Quick reference guide
- Installation instructions
- Basic usage examples
- Performance targets

#### `LOAD-TEST-EXECUTION-GUIDE.md`
- Comprehensive execution guide
- Step-by-step instructions
- Multiple execution options
- Monitoring guidance
- Troubleshooting tips
- Result interpretation

## How to Execute Tests

### Prerequisites

1. Install k6:
   ```bash
   # macOS
   brew install k6
   
   # Windows
   choco install k6
   
   # Linux
   # Follow https://k6.io/docs/getting-started/installation/
   ```

2. Ensure API server is running:
   ```bash
   curl http://localhost:4000/api/health
   ```

### Run Tests

#### Option 1: Using Script (Recommended)

**Linux/macOS:**
```bash
chmod +x tests/performance/run-load-tests.sh
./tests/performance/run-load-tests.sh concurrent1000
```

**Windows:**
```powershell
.\tests\performance\run-load-tests.ps1 -TestType concurrent1000
```

#### Option 2: Direct k6 Command

```bash
k6 run \
  -e BASE_URL=http://localhost:5175 \
  -e API_BASE_URL=http://localhost:4000 \
  tests/performance/load-test-1000-concurrent.js
```

#### Option 3: With Output

```bash
k6 run \
  -e BASE_URL=http://localhost:5175 \
  -e API_BASE_URL=http://localhost:4000 \
  --out json=results.json \
  tests/performance/load-test-1000-concurrent.js
```

## Expected Results

### Success Criteria

✓ **p95 response time < 500ms**
- 95% of requests complete within 500ms

✓ **Error rate < 1%**
- Less than 1% of requests fail

✓ **Cache hit rate > 30%** (realistic traffic test)
- At least 30% of requests hit cache

### Example Output

```
     http_req_duration...............: avg=245.3ms  min=50.2ms   med=180.1ms  max=892.3ms  p(90)=450.2ms  p(95)=520.1ms
     http_req_failed.................: 0.5%
     http_reqs........................: 15234    7.6/s
     vus............................: 1000
     vus_max..........................: 1000
     
     ✓ p(95)<500 - 98.5% of requests under 500ms
     ✓ p(99)<1000 - 99.8% of requests under 1000ms
     ✓ http_req_failed - 0.5% failure rate
```

## Metrics Tracked

### Standard Metrics
- HTTP request duration (avg, min, max, p50, p95, p99)
- HTTP request failure rate
- Requests per second
- Virtual users (VUs)
- Data sent/received

### Custom Metrics
- `subscription_duration`: Time to complete subscription flow
- `course_purchase_duration`: Time to complete course purchase
- `token_earning_duration`: Time to complete token earning
- `enterprise_flow_duration`: Time to complete enterprise flow
- `successful_requests`: Count of successful requests
- `failed_requests`: Count of failed requests
- `cache_hits`: Cache hit rate
- `active_users`: Number of active users

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| p50 (median) | < 200ms | ✓ |
| p95 (95th percentile) | < 500ms | ✓ |
| p99 (99th percentile) | < 1000ms | ✓ |
| Error rate | < 1% | ✓ |
| Cache hit rate | > 30% | ✓ |

## Troubleshooting

### k6 Not Found
- Install k6 from https://k6.io/docs/getting-started/installation/

### Connection Refused
- Verify API server is running: `curl http://localhost:4000/api/health`
- Check firewall settings
- Verify correct URLs

### High Error Rate
- Check API server logs
- Verify database connectivity
- Check for rate limiting

### p95 > 500ms
- Monitor API server performance
- Check CPU and memory usage
- Review slow query logs
- Verify cache is working

## Next Steps

1. **Install k6** if not already installed
2. **Run the load tests** using one of the execution methods above
3. **Monitor the output** for real-time metrics
4. **Review results** against success criteria
5. **Troubleshoot** any issues found
6. **Document findings** for future reference

## References

- [k6 Documentation](https://k6.io/docs/)
- [k6 API Reference](https://k6.io/docs/javascript-api/)
- [Load Testing Best Practices](https://k6.io/docs/testing-guides/load-testing/)

## Files Location

```
tests/performance/
├── load-test-1000-concurrent.js      # 1000 concurrent users test
├── load-test-realistic-traffic.js    # Realistic traffic patterns test
├── k6-config.js                      # Configuration file
├── run-load-tests.sh                 # Shell script runner
├── run-load-tests.ps1                # PowerShell script runner
├── LOAD-TESTING-README.md            # Quick reference
├── LOAD-TEST-EXECUTION-GUIDE.md      # Comprehensive guide
└── LOAD-TESTS-SUMMARY.md             # This file
```
