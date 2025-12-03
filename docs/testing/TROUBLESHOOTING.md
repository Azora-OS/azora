# Testing Troubleshooting Guide

## Overview

This guide helps you diagnose and fix common testing issues in the Azora platform.

## Test Failures

### Tests Pass Locally But Fail in CI

**Symptoms:**
- Tests pass on your machine
- Same tests fail in CI/CD pipeline

**Common Causes:**

1. **Environment Variables Missing**
```bash
# Check .env.test file exists
# Verify all required variables are set
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

2. **Database State Issues**
```typescript
// Ensure cleanup runs
afterEach(async () => {
  await cleanupTestDatabase();
});
```

3. **Timing Issues**
```typescript
// Add proper waits for async operations
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

4. **File System Differences**
```typescript
// Use path.join for cross-platform compatibility
const filePath = path.join(__dirname, 'test-file.txt');
```

### Flaky Tests

**Symptoms:**
- Tests pass sometimes, fail other times
- No code changes between runs

**Solutions:**

1. **Fix Race Conditions**
```typescript
// ❌ Bad - Race condition
it('should update user', async () => {
  updateUser(userId, data);
  const user = await getUser(userId);
  expect(user.name).toBe('New Name');
});

// ✅ Good - Await async operations
it('should update user', async () => {
  await updateUser(userId, data);
  const user = await getUser(userId);
  expect(user.name).toBe('New Name');
});
```

2. **Remove Time Dependencies**
```typescript
// ❌ Bad - Depends on current time
it('should create timestamp', () => {
  const timestamp = createTimestamp();
  expect(timestamp).toBe(Date.now());
});

// ✅ Good - Mock time
it('should create timestamp', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2024-01-01'));
  const timestamp = createTimestamp();
  expect(timestamp).toBe(new Date('2024-01-01').getTime());
  jest.useRealTimers();
});
```

3. **Ensure Test Isolation**
```typescript
// ✅ Good - Clean state between tests
describe('Tests', () => {
  beforeEach(async () => {
    await cleanupTestDatabase();
    jest.clearAllMocks();
  });

  it('test 1', async () => {
    // Independent test
  });

  it('test 2', async () => {
    // Independent test
  });
});
```

### Slow Tests

**Symptoms:**
- Tests take too long to run
- Test suite times out

**Solutions:**

1. **Reduce Database Calls**
```typescript
// ❌ Bad - Multiple database calls
it('should validate email', async () => {
  const user = await userFactory.create();
  expect(isValidEmail(user.email)).toBe(true);
});

// ✅ Good - No database needed
it('should validate email', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
});
```

2. **Use beforeAll for Expensive Setup**
```typescript
describe('Tests', () => {
  let sharedData;

  beforeAll(async () => {
    sharedData = await expensiveSetup();
  });

  afterAll(async () => {
    await cleanup(sharedData);
  });

  it('test 1', () => {
    // Use sharedData
  });
});
```

3. **Run Tests in Parallel**
```bash
# jest.config.js
module.exports = {
  maxWorkers: '50%',
  testTimeout: 10000
};
```

## Database Issues

### Connection Errors

**Error:** `Cannot connect to database`

**Solutions:**

1. **Check Database is Running**
```bash
# PostgreSQL
pg_isready

# Check connection string
echo $DATABASE_URL
```

2. **Verify Test Database Exists**
```bash
# Create test database
createdb azora_test

# Run migrations
npm run migrate:test
```

3. **Check Connection Pool**
```typescript
// Increase pool size if needed
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['error', 'warn']
});
```

### Data Not Cleaning Up

**Symptoms:**
- Tests fail due to duplicate data
- Foreign key constraint errors

**Solutions:**

1. **Ensure Cleanup Runs**
```typescript
afterEach(async () => {
  await cleanupTestDatabase();
});

// Or use transactions
beforeEach(async () => {
  await prisma.$executeRaw`BEGIN`;
});

afterEach(async () => {
  await prisma.$executeRaw`ROLLBACK`;
});
```

2. **Clean in Correct Order**
```typescript
// Delete in reverse order of dependencies
await prisma.enrollment.deleteMany();
await prisma.course.deleteMany();
await prisma.user.deleteMany();
```

### Migration Issues

**Error:** `Migration failed`

**Solutions:**

1. **Reset Test Database**
```bash
npm run migrate:reset:test
npm run migrate:test
```

2. **Check Migration Files**
```bash
# List migrations
ls prisma/migrations

# Apply specific migration
npx prisma migrate deploy
```

## Mock Issues

### Mock Not Working

**Symptoms:**
- Real API calls being made
- Unexpected costs or rate limits

**Solutions:**

1. **Verify Mock is Set Up**
```typescript
// ✅ Correct - Mock configured before use
beforeEach(() => {
  stripeMock.reset();
  stripeMock.mockPaymentSuccess();
});

it('should process payment', async () => {
  await processPayment({ amount: 1000 });
});
```

2. **Check Mock Import**
```typescript
// ❌ Wrong import
import { stripeMock } from './mocks';

// ✅ Correct import
import { stripeMock } from '../../../tests/mocks';
```

3. **Ensure Mock is Reset**
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  stripeMock.reset();
});
```

### Mock Verification Fails

**Error:** `Expected mock to be called but it wasn't`

**Solutions:**

1. **Check Method Name**
```typescript
// Verify actual method being called
console.log(stripeMock.getCalls());

// Use correct method name
expect(stripeMock.getCallCount('createPaymentIntent')).toBe(1);
```

2. **Ensure Code Path Executes**
```typescript
it('should call API', async () => {
  stripeMock.mockPaymentSuccess();
  
  // Make sure this actually calls the API
  await processPayment({ amount: 1000 });
  
  expect(stripeMock.getCallCount('createPaymentIntent')).toBe(1);
});
```

## Factory Issues

### Factory Not Found

**Error:** `Cannot find module 'factories'`

**Solutions:**

1. **Check Import Path**
```typescript
// ❌ Wrong path
import { userFactory } from './factories';

// ✅ Correct path
import { userFactory } from '../../../tests/factories';
```

2. **Verify Factory Exists**
```bash
ls tests/factories/
# Should see user.factory.ts
```

### Missing Required Fields

**Error:** `Field 'userId' is required`

**Solutions:**

```typescript
// ❌ Missing required field
const enrollment = await enrollmentFactory.create();

// ✅ Provide required fields
const user = await userFactory.create();
const course = await courseFactory.create();
const enrollment = await enrollmentFactory.create({
  userId: user.id,
  courseId: course.id
});
```

## Assertion Issues

### Unexpected Values

**Symptoms:**
- Assertions fail with unexpected values
- Values are undefined or null

**Solutions:**

1. **Add Debug Logging**
```typescript
it('should return user', async () => {
  const user = await getUser('user-123');
  console.log('User:', user); // Debug output
  expect(user).toBeDefined();
});
```

2. **Check Async Operations**
```typescript
// ❌ Missing await
it('should create user', async () => {
  const user = createUser(data); // Returns Promise!
  expect(user.id).toBeDefined(); // Fails
});

// ✅ Proper await
it('should create user', async () => {
  const user = await createUser(data);
  expect(user.id).toBeDefined();
});
```

3. **Verify Data Exists**
```typescript
it('should find user', async () => {
  // Create user first
  const created = await userFactory.create({ id: 'user-123' });
  
  // Then try to find it
  const found = await getUser('user-123');
  expect(found).toBeDefined();
});
```

### Type Errors

**Error:** `Type 'X' is not assignable to type 'Y'`

**Solutions:**

1. **Use Correct Types**
```typescript
// ❌ Wrong type
const user: User = await userFactory.create();
expect(user.id).toBe(123); // id is string, not number

// ✅ Correct type
expect(user.id).toBe('user-123');
```

2. **Add Type Assertions**
```typescript
const result = await someFunction() as ExpectedType;
expect(result.property).toBeDefined();
```

## Performance Issues

### Tests Timeout

**Error:** `Test exceeded timeout of 5000ms`

**Solutions:**

1. **Increase Timeout**
```typescript
it('should complete long operation', async () => {
  const result = await longOperation();
  expect(result).toBeDefined();
}, 30000); // 30 second timeout
```

2. **Optimize Test**
```typescript
// ❌ Slow - Creates unnecessary data
it('should validate input', async () => {
  const user = await userFactory.create();
  const course = await courseFactory.create();
  expect(validateInput('test')).toBe(true);
});

// ✅ Fast - No unnecessary setup
it('should validate input', () => {
  expect(validateInput('test')).toBe(true);
});
```

### Memory Leaks

**Symptoms:**
- Tests slow down over time
- Out of memory errors

**Solutions:**

1. **Close Connections**
```typescript
afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});
```

2. **Clear Large Objects**
```typescript
afterEach(() => {
  largeDataStructure = null;
  jest.clearAllMocks();
});
```

## Coverage Issues

### Coverage Not Updating

**Symptoms:**
- Coverage percentage doesn't change
- New tests don't affect coverage

**Solutions:**

1. **Clear Coverage Cache**
```bash
rm -rf coverage/
npm test -- --coverage
```

2. **Check Coverage Configuration**
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.test.{js,ts}'
  ]
};
```

### Low Coverage on Tested Code

**Symptoms:**
- Code is tested but coverage is low
- Branches not covered

**Solutions:**

1. **Test All Branches**
```typescript
// Test both true and false cases
it('should handle valid input', () => {
  expect(validate(validInput)).toBe(true);
});

it('should handle invalid input', () => {
  expect(validate(invalidInput)).toBe(false);
});
```

2. **Test Error Cases**
```typescript
it('should handle errors', async () => {
  await expect(functionThatThrows())
    .rejects
    .toThrow('Error message');
});
```

## CI/CD Issues

### Tests Pass Locally, Fail in CI

**Solutions:**

1. **Check Environment Variables**
```yaml
# .github/workflows/test.yml
env:
  DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
  REDIS_URL: ${{ secrets.TEST_REDIS_URL }}
```

2. **Verify Dependencies**
```yaml
- name: Install dependencies
  run: npm ci # Use ci instead of install
```

3. **Check Service Availability**
```yaml
services:
  postgres:
    image: postgres:14
    env:
      POSTGRES_PASSWORD: postgres
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
```

## Getting Help

### Debug Steps

1. **Enable Verbose Logging**
```bash
npm test -- --verbose
```

2. **Run Single Test**
```bash
npm test -- path/to/test.test.ts
```

3. **Check Test Output**
```bash
npm test -- --no-coverage 2>&1 | tee test-output.log
```

### Common Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.test.ts

# Run tests matching pattern
npm test -- -t "should create user"

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Clear cache
npm test -- --clearCache
```

### Resources

- [Testing Standards](./TESTING-STANDARDS.md)
- [Test Writing Guide](./TEST-WRITING-GUIDE.md)
- [Factory Guide](./FACTORY-GUIDE.md)
- [Mock Guide](./MOCK-GUIDE.md)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

</content>
