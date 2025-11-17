# Load Testing Guide

## Installation

Install k6: https://k6.io/docs/getting-started/installation/

## Load Test Scripts

### 1. 1000 Concurrent Users Test
**File:** `load-test-1000-concurrent.js`

Tests 1000 concurrent users performing realistic workflows.

**Duration:** 17 minutes (5m ramp up, 10m sustained, 2m ramp down)

**Target:** p95 response time < 500ms

**Run:**
```bash
k6 run tests/performance/load-test-1000-concurrent.js
```

### 2. Realistic Traffic Patterns Test
**File:** `load-test-realistic-traffic.js`

Simulates realistic user behavior with peak/off-peak hours.

**Duration:** 31 minutes

**Target:** p95 response time < 500ms, cache hit rate > 30%

**Run:**
```bash
k6 run tests/performance/load-test-realistic-traffic.js
```

## Running Tests

### Basic Run
```bash
k6 run tests/performance/load-test-1000-concurrent.js
```

### With Custom URLs
```bash
k6 run \
  -e BASE_URL=http://localhost:5175 \
  -e API_BASE_URL=http://localhost:4000 \
  tests/performance/load-test-1000-concurrent.js
```

### With Output
```bash
k6 run tests/performance/load-test-1000-concurrent.js --out json=results.json
```

## Performance Targets

- **p50 (Median):** < 200ms
- **p95 (95th percentile):** < 500ms ✓
- **p99 (99th percentile):** < 1000ms
- **Error Rate:** < 1%
- **Cache Hit Rate:** > 30%

## Metrics Tracked

- Subscription flow duration
- Course purchase flow duration
- Token earning flow duration
- Enterprise flow duration
- Successful/failed requests
- Cache hit rate
- Active users

## References

- [k6 Documentation](https://k6.io/docs/)
- [k6 API Reference](https://k6.io/docs/javascript-api/)
