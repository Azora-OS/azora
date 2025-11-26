# Health Monitor Service

Monitors health and availability of all services in the Azora ecosystem.

## Purpose
- Service health checking
- Availability monitoring
- Metrics collection
- Alert generation
- Dashboard data aggregation

## Features
- Periodic health checks
- Service status tracking
- Response time monitoring
- Failure detection
- Alert notifications
- Health dashboard API

## Setup
```bash
npm install
```

## Environment Variables
```bash
PORT=4010
CHECK_INTERVAL=30000
ALERT_THRESHOLD=3
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

## Scripts
- `npm run dev` - Development server
- `npm run build` - Build TypeScript
- `npm run start` - Production server
- `npm run test` - Run tests
- `npm run typecheck` - TypeScript validation

## API Endpoints
- `GET /health` - Monitor service health
- `GET /api/services` - List all monitored services
- `GET /api/services/:id/status` - Get service status
- `GET /api/services/:id/metrics` - Get service metrics
- `GET /api/dashboard` - Get dashboard data
- `POST /api/services/register` - Register service for monitoring

## Testing

### Test Status
- **Status**: ⭕ No Tests
- **Test Suites**: 0/0
- **Last Updated**: 2025-11-25
- **Priority**: High

### Test Coverage
- **Overall**: 0%
- **Target**: 75%

### Planned Test Categories

#### Unit Tests (Planned)
- **Location**: `tests/unit/`
- **Planned Tests**:
  - `health-checker.test.ts` - Health check logic
  - `metrics-collector.test.ts` - Metrics collection
  - `alert-generator.test.ts` - Alert generation
  - `status-tracker.test.ts` - Status tracking

#### Integration Tests (Planned)
- **Location**: `tests/integration/`
- **Planned Tests**:
  - `service-health-check.test.ts` - Service health checks
  - `metrics-collection.test.ts` - Metrics aggregation
  - `alert-generation.test.ts` - Alert workflows
  - `dashboard-data.test.ts` - Dashboard API

### Test Scenarios to Cover
- ⭕ Service health check execution
- ⭕ Healthy service detection
- ⭕ Unhealthy service detection
- ⭕ Response time tracking
- ⭕ Failure threshold detection
- ⭕ Alert generation on failures
- ⭕ Service registration
- ⭕ Metrics aggregation
- ⭕ Dashboard data generation
- ⭕ Historical data tracking

### Running Tests (When Available)

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tests/health-checker.test.ts

# Run with coverage
npm test -- --coverage
```

### Testing Guidelines (For Future Implementation)

#### Testing Health Checks
```typescript
import { HealthChecker } from './health-checker';
import { createTestService } from '@/tests/factories';

describe('Health Checker', () => {
  it('should detect healthy service', async () => {
    const service = await createTestService({
      url: 'http://localhost:4004',
      healthEndpoint: '/health'
    });
    
    const checker = new HealthChecker();
    const result = await checker.check(service);
    
    expect(result.status).toBe('healthy');
    expect(result.responseTime).toBeLessThan(1000);
  });
  
  it('should detect unhealthy service', async () => {
    const service = await createTestService({
      url: 'http://localhost:9999', // Non-existent service
      healthEndpoint: '/health'
    });
    
    const checker = new HealthChecker();
    const result = await checker.check(service);
    
    expect(result.status).toBe('unhealthy');
    expect(result.error).toBeDefined();
  });
});
```

#### Testing Metrics Collection
```typescript
it('should collect service metrics', async () => {
  const service = await createTestService();
  const collector = new MetricsCollector();
  
  // Simulate multiple health checks
  await collector.recordCheck(service.id, { status: 'healthy', responseTime: 100 });
  await collector.recordCheck(service.id, { status: 'healthy', responseTime: 150 });
  
  const metrics = await collector.getMetrics(service.id);
  
  expect(metrics.averageResponseTime).toBe(125);
  expect(metrics.uptime).toBeGreaterThan(0);
});
```

#### Testing Alert Generation
```typescript
it('should generate alert after threshold failures', async () => {
  const service = await createTestService();
  const alerter = new AlertGenerator({ threshold: 3 });
  
  // Simulate failures
  await alerter.recordFailure(service.id);
  await alerter.recordFailure(service.id);
  await alerter.recordFailure(service.id);
  
  const alerts = await alerter.getAlerts();
  
  expect(alerts).toHaveLength(1);
  expect(alerts[0].serviceId).toBe(service.id);
  expect(alerts[0].type).toBe('SERVICE_DOWN');
});
```

#### Testing Dashboard Data
```typescript
it('should generate dashboard data', async () => {
  const dashboard = new DashboardGenerator();
  const data = await dashboard.generate();
  
  expect(data.totalServices).toBeGreaterThan(0);
  expect(data.healthyServices).toBeDefined();
  expect(data.unhealthyServices).toBeDefined();
  expect(data.averageResponseTime).toBeDefined();
});
```

### Known Issues
- No test suite currently exists
- High priority for implementation

### Test Dependencies (When Implemented)
- Jest 29.x
- supertest (for API testing)
- Test factories from `@/tests/factories`
- Database utilities from `@/tests/utils/database`
- Redis utilities from `@/tests/utils/redis`

### Next Steps
1. Create test infrastructure
2. Implement unit tests for health checking
3. Add integration tests for service monitoring
4. Test metrics collection
5. Add alert generation tests
6. Test dashboard data generation
7. Add performance tests

### Contributing Tests
See [Testing Standards](../../docs/testing/TESTING-STANDARDS.md) for detailed guidelines on writing tests.

## Architecture

```
Health Monitor
    ↓
Periodic Checks → Health Checker
    ↓
Service Status → Metrics Collector
    ↓
Alert Generator → Dashboard API
```

## Monitoring
- Health check success rate
- Average response times
- Service availability
- Alert frequency
- Dashboard API performance
