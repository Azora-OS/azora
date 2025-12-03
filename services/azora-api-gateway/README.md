# Azora API Gateway

Central API gateway for routing requests, rate limiting, and authentication middleware.

## Purpose
- Request routing to microservices
- Rate limiting and throttling
- Authentication middleware
- Service discovery
- Request/response transformation
- Error handling

## Features
- Dynamic service routing
- JWT authentication validation
- Rate limiting per endpoint
- CORS configuration
- Request logging
- Health check aggregation

## Setup
```bash
npm install
```

## Environment Variables
```bash
PORT=4000
JWT_SECRET=your-secret-key
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000
```

## Scripts
- `npm run dev` - Development server
- `npm run build` - Build TypeScript
- `npm run start` - Production server
- `npm run test` - Run tests
- `npm run typecheck` - TypeScript validation

## API Endpoints

### Gateway Routes
- `GET /health` - Gateway health check
- `GET /services` - List registered services
- `POST /api/*` - Proxy to services

### Service Registration
Services register themselves with the gateway on startup.

## Testing

### Test Status
- **Status**: ⭕ No Tests
- **Test Suites**: 0/0
- **Last Updated**: 2025-11-25
- **Priority**: High

### Test Coverage
- **Overall**: 0%
- **Target**: 70%

### Planned Test Categories

#### Unit Tests (Planned)
- **Location**: `tests/unit/`
- **Planned Tests**:
  - `router.test.ts` - Request routing logic
  - `rate-limiter.test.ts` - Rate limiting
  - `auth-middleware.test.ts` - Authentication middleware
  - `service-registry.test.ts` - Service discovery

#### Integration Tests (Planned)
- **Location**: `tests/integration/`
- **Planned Tests**:
  - `request-routing.test.ts` - End-to-end routing
  - `rate-limiting.test.ts` - Rate limit enforcement
  - `authentication.test.ts` - Auth middleware integration
  - `service-discovery.test.ts` - Service registration
  - `error-handling.test.ts` - Error scenarios

### Test Scenarios to Cover
- ⭕ Request routing to correct service
- ⭕ Rate limiting enforcement
- ⭕ JWT token validation
- ⭕ Invalid token rejection
- ⭕ Service discovery and registration
- ⭕ CORS header handling
- ⭕ Error response formatting
- ⭕ Health check aggregation
- ⭕ Request timeout handling
- ⭕ Load balancing

### Running Tests (When Available)

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tests/router.test.ts

# Run with coverage
npm test -- --coverage
```

### Testing Guidelines (For Future Implementation)

#### Testing Request Routing
```typescript
import { setupTestDatabase } from '@/tests/utils/database';
import request from 'supertest';

describe('API Gateway Routing', () => {
  it('should route request to correct service', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    // Verify request was routed to auth service
  });
});
```

#### Testing Rate Limiting
```typescript
it('should enforce rate limits', async () => {
  const requests = Array(1001).fill(null).map(() =>
    request(app).get('/api/test')
  );
  
  const responses = await Promise.all(requests);
  const rateLimited = responses.filter(r => r.status === 429);
  
  expect(rateLimited.length).toBeGreaterThan(0);
});
```

#### Testing Authentication Middleware
```typescript
it('should validate JWT tokens', async () => {
  const response = await request(app)
    .get('/api/protected')
    .set('Authorization', 'Bearer invalid-token');
  
  expect(response.status).toBe(401);
  expect(response.body.error).toBe('Invalid token');
});
```

### Known Issues
- No test suite currently exists
- High priority for implementation

### Test Dependencies (When Implemented)
- Jest 29.x
- supertest (for API testing)
- Test utilities from `@/tests/utils`
- Mock services for downstream dependencies

### Next Steps
1. Create test infrastructure
2. Implement unit tests for core routing logic
3. Add integration tests for request flows
4. Test rate limiting scenarios
5. Add authentication middleware tests
6. Test service discovery
7. Add error handling tests

### Contributing Tests
See [Testing Standards](../../docs/testing/TESTING-STANDARDS.md) for detailed guidelines on writing tests.

## Architecture

```
Client Request
    ↓
API Gateway
    ↓
Rate Limiter → Auth Middleware → Router
    ↓              ↓              ↓
Service Discovery → Target Service
```

## Monitoring
- Request rates per endpoint
- Rate limit hits
- Authentication failures
- Service response times
- Error rates
