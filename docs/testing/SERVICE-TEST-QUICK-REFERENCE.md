# Service Test Quick Reference

Quick commands and patterns for testing Azora services.

## Quick Commands

### Run Tests for Specific Service
```bash
# Run all tests for a service
npm test -- services/azora-auth

# Run with coverage
npm test -- services/azora-auth --coverage

# Run in watch mode
npm test -- services/azora-auth --watch

# Run specific test file
npm test -- services/azora-auth/tests/auth.test.ts
```

### Run Tests by Category
```bash
# Run all unit tests
npm test -- --testPathPattern="tests/unit"

# Run all integration tests
npm test -- --testPathPattern="tests/integration"

# Run all E2E tests
npm test -- --testPathPattern="tests/e2e"
```

### Coverage Commands
```bash
# Generate coverage report
npm test -- --coverage

# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html

# Check coverage thresholds
npm run test:coverage:check
```

### Debug Commands
```bash
# Run tests with debugging
node --inspect-brk node_modules/.bin/jest services/azora-auth

# Clear Jest cache
npm test -- --clearCache

# Run tests with verbose output
npm test -- --verbose
```

## Common Test Patterns

### Basic Test Structure
```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestDatabase, cleanupTestDatabase } from '@/tests/utils/database';

describe('ServiceName', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should perform operation', async () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = await service.operation(input);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

### Using Test Factories
```typescript
import { createTestUser, createTestCourse } from '@/tests/factories';

// Create user with defaults
const user = await createTestUser();

// Create user with overrides
const instructor = await createTestUser({ 
  role: 'instructor',
  email: 'instructor@test.com' 
});

// Create related entities
const course = await createTestCourse({ 
  instructorId: instructor.id 
});
```

### Using Mock Services
```typescript
import { mockStripe, mockOpenAI, mockEmail } from '@/tests/mocks';

beforeEach(() => {
  // Reset mocks before each test
  mockStripe.reset();
  mockOpenAI.reset();
  mockEmail.reset();
});

it('should process payment', async () => {
  // Configure mock response
  mockStripe.mockPaymentIntent({
    id: 'pi_123',
    status: 'succeeded'
  });
  
  // Run test
  const result = await paymentService.process(100);
  
  // Verify mock was called
  expect(mockStripe.verifyCalled()).toBe(true);
  expect(result.status).toBe('succeeded');
});
```

### Testing API Endpoints
```typescript
import request from 'supertest';
import { app } from '../src/app';

it('should return 200 for valid request', async () => {
  const response = await request(app)
    .post('/api/endpoint')
    .send({ data: 'test' })
    .set('Authorization', `Bearer ${token}`);
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('result');
});
```

### Testing Database Operations
```typescript
import { prisma } from '@/lib/prisma';
import { setupTestDatabase } from '@/tests/utils/database';

beforeAll(async () => {
  await setupTestDatabase();
});

it('should create record in database', async () => {
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User'
    }
  });
  
  expect(user.id).toBeDefined();
  
  // Verify in database
  const found = await prisma.user.findUnique({
    where: { id: user.id }
  });
  
  expect(found).toBeDefined();
  expect(found?.email).toBe('test@example.com');
});
```

### Testing Async Operations
```typescript
it('should handle async operation', async () => {
  const promise = service.asyncOperation();
  
  await expect(promise).resolves.toBeDefined();
});

it('should handle async errors', async () => {
  const promise = service.failingOperation();
  
  await expect(promise).rejects.toThrow('Expected error');
});
```

### Testing with Timeouts
```typescript
it('should complete within timeout', async () => {
  const start = Date.now();
  
  await service.operation();
  
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(1000); // 1 second
}, 5000); // Test timeout: 5 seconds
```

## Service-Specific Patterns

### Authentication Service
```typescript
import { createTestUser } from '@/tests/factories';
import { generateToken, validateToken } from '@/services/auth';

it('should authenticate user', async () => {
  const user = await createTestUser();
  const token = await generateToken(user.id);
  const decoded = await validateToken(token);
  
  expect(decoded.userId).toBe(user.id);
});
```

### Payment Service
```typescript
import { mockStripe } from '@/tests/mocks';
import { createTestWallet } from '@/tests/factories';

it('should process payment', async () => {
  mockStripe.mockPaymentIntent({ status: 'succeeded' });
  
  const wallet = await createTestWallet();
  const result = await paymentService.charge(wallet.id, 100);
  
  expect(result.status).toBe('succeeded');
});
```

### Education Service
```typescript
import { createTestUser, createTestCourse, createTestEnrollment } from '@/tests/factories';

it('should enroll student in course', async () => {
  const student = await createTestUser({ role: 'student' });
  const course = await createTestCourse();
  
  const enrollment = await enrollmentService.enroll(student.id, course.id);
  
  expect(enrollment.status).toBe('ACTIVE');
});
```

### AI Routing Service
```typescript
import { mockOpenAI } from '@/tests/mocks';

it('should route query to appropriate tier', async () => {
  mockOpenAI.mockChatCompletion('Response text');
  
  const result = await aiRouter.route({
    query: 'Complex question',
    userId: 'user-123'
  });
  
  expect(result.routingTier).toBe('EXTERNAL_LLM');
});
```

### Marketplace Service
```typescript
import { createTestUser, createTestJob, createTestApplication } from '@/tests/factories';

it('should submit job application', async () => {
  const user = await createTestUser();
  const job = await createTestJob();
  
  const application = await marketplaceService.apply(user.id, job.id);
  
  expect(application.status).toBe('PENDING');
});
```

## Troubleshooting

### Tests Failing Locally

**Problem**: Tests pass in CI but fail locally
```bash
# Solution 1: Clear cache
npm test -- --clearCache

# Solution 2: Reset test database
npm run db:test:reset

# Solution 3: Check environment variables
cat .env.test
```

**Problem**: Database connection errors
```bash
# Solution 1: Verify database is running
psql -U postgres -c "SELECT 1"

# Solution 2: Check DATABASE_URL
echo $DATABASE_URL

# Solution 3: Create test database
createdb azora_test
```

**Problem**: Redis connection errors
```bash
# Solution 1: Verify Redis is running
redis-cli ping

# Solution 2: Check REDIS_URL
echo $REDIS_URL

# Solution 3: Start Redis
redis-server
```

### Slow Tests

**Problem**: Tests taking too long
```bash
# Solution 1: Run tests in parallel
npm test -- --maxWorkers=4

# Solution 2: Run only changed tests
npm test -- --onlyChanged

# Solution 3: Use test optimization
npm run test:optimized
```

### Flaky Tests

**Problem**: Tests pass/fail intermittently
```typescript
// Solution 1: Add proper cleanup
afterEach(async () => {
  await cleanupTestDatabase();
  mockService.reset();
});

// Solution 2: Add explicit waits
await waitFor(() => expect(element).toBeInTheDocument());

// Solution 3: Increase timeout
it('flaky test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Mock Issues

**Problem**: Mocks not working
```typescript
// Solution 1: Reset mocks
beforeEach(() => {
  jest.clearAllMocks();
  mockService.reset();
});

// Solution 2: Verify mock setup
expect(mockService.verifyCalled()).toBe(true);

// Solution 3: Check mock configuration
mockService.mockResponse({ data: 'test' });
```

## Best Practices

### ✅ Do
- Use test factories for data creation
- Reset mocks between tests
- Clean up test data after tests
- Use descriptive test names
- Test one thing per test
- Use proper assertions
- Handle async operations correctly
- Mock external services

### ❌ Don't
- Use production data in tests
- Share state between tests
- Use hardcoded IDs
- Skip cleanup
- Test multiple things in one test
- Use vague test names
- Ignore test warnings
- Make real API calls

## Performance Tips

1. **Use Test Parallelization**
   ```bash
   npm test -- --maxWorkers=4
   ```

2. **Run Selective Tests**
   ```bash
   npm test -- --onlyChanged
   ```

3. **Use Database Transactions**
   ```typescript
   beforeEach(async () => {
     await prisma.$executeRaw`BEGIN`;
   });
   
   afterEach(async () => {
     await prisma.$executeRaw`ROLLBACK`;
   });
   ```

4. **Cache Mock Responses**
   ```typescript
   const cachedResponse = { data: 'test' };
   mockService.mockResponse(cachedResponse);
   ```

5. **Use Test Utilities**
   ```typescript
   import { setupTestEnvironment } from '@/tests/utils';
   
   beforeAll(async () => {
     await setupTestEnvironment();
   });
   ```

## Resources

- [Testing Standards](./TESTING-STANDARDS.md) - Comprehensive testing guidelines
- [Test Writing Guide](./TEST-WRITING-GUIDE.md) - How to write effective tests
- [Factory Guide](./FACTORY-GUIDE.md) - Using test data factories
- [Mock Guide](./MOCK-GUIDE.md) - Working with mock services
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
- [Service Test Status](./SERVICE-TEST-STATUS.md) - Current test coverage

## Getting Help

1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review [Service Test Status](./SERVICE-TEST-STATUS.md)
3. Ask in #testing Slack channel
4. Create issue with `testing` label

---

**Quick Tip**: Bookmark this page for fast access to common testing commands and patterns!
