# 🧪 Testing Guide - Azora OS

**Quality • Functionality • Speed**

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Test Types](#test-types)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm ci

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

---

## 🎯 Test Types

### 1. Unit Tests (70% of tests)

**Purpose:** Test individual functions/methods in isolation

**Characteristics:**
- Fast execution (<100ms per test)
- No external dependencies
- Mock all external services
- High coverage (80%+ target)

**Example:**
```typescript
import { calculateMiningReward } from './mining';

describe('calculateMiningReward', () => {
  it('should calculate correct reward for lesson completion', () => {
    const reward = calculateMiningReward('LESSON_COMPLETE', 1);
    expect(reward).toBe(10);
  });
  
  it('should apply difficulty multiplier', () => {
    const reward = calculateMiningReward('LESSON_COMPLETE', 3);
    expect(reward).toBe(30);
  });
});
```

### 2. Integration Tests (20% of tests)

**Purpose:** Test service interactions and database operations

**Characteristics:**
- Use real database (test environment)
- Test API endpoints
- Verify data persistence
- Clean up after each test

**Example:**
```typescript
import { authService } from './auth.service';
import { prisma } from '@azora/test-utils';

describe('Auth Service Integration', () => {
  afterEach(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: '@test.azora' } }
    });
  });

  it('should register user and create wallet', async () => {
    const user = await authService.register({
      email: 'test@test.azora',
      password: 'Test123!',
    });
    
    expect(user.id).toBeDefined();
    
    // Verify wallet was created
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    });
    
    expect(wallet).toBeDefined();
    expect(wallet.balance).toBe(0);
  });
});
```

### 3. E2E Tests (10% of tests)

**Purpose:** Test complete user journeys through the UI

**Characteristics:**
- Use Playwright for browser automation
- Test critical user paths
- Slower execution (seconds per test)
- Focus on happy paths and critical flows

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('complete learning journey', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'student@test.azora');
  await page.fill('[name="password"]', 'Test123!');
  await page.click('button[type="submit"]');
  
  // Enroll in course
  await page.click('text=Browse Courses');
  await page.click('text=Python Basics');
  await page.click('button:has-text("Enroll Now")');
  
  // Verify success
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## ✍️ Writing Tests

### AAA Pattern (Arrange, Act, Assert)

```typescript
test('should enroll student in course', async () => {
  // Arrange - Set up test data
  const student = userFactory.buildStudent();
  const course = courseFactory.build();
  
  // Act - Perform the action
  const enrollment = await enrollStudent(student.id, course.id);
  
  // Assert - Verify the result
  expect(enrollment.status).toBe('active');
  expect(enrollment.studentId).toBe(student.id);
  expect(enrollment.courseId).toBe(course.id);
});
```

### Using Test Utilities

```typescript
import { userFactory, courseFactory, authHelper } from '@azora/test-utils';

test('should access protected endpoint', async () => {
  // Create test user
  const user = userFactory.build();
  
  // Generate auth token
  const token = authHelper.generateToken(user.id);
  const headers = authHelper.createAuthHeader(token);
  
  // Make authenticated request
  const response = await request(app)
    .get('/api/profile')
    .set(headers);
  
  expect(response.status).toBe(200);
});
```

### Mocking External Services

```typescript
import { prismaMock, createStripeMock } from '@azora/test-utils';

test('should process payment', async () => {
  // Mock Stripe
  const stripeMock = createStripeMock();
  stripeMock.paymentIntents.create.mockResolvedValue({
    id: 'pi_test123',
    status: 'succeeded',
  });
  
  // Mock database
  prismaMock.transaction.create.mockResolvedValue({
    id: '123',
    status: 'COMPLETED',
  });
  
  // Test payment processing
  const result = await processPayment(100, 'usd');
  
  expect(result.success).toBe(true);
  expect(stripeMock.paymentIntents.create).toHaveBeenCalled();
});
```

---

## 🏃 Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should login"

# Run with coverage
npm run test:coverage

# Watch mode (re-run on file changes)
npm run test:watch

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Service-Specific Tests

```bash
# Test specific service
npm test -- services/auth-service
npm test -- services/azora-education
npm test -- services/azora-mint

# Test all services
npm run test:services
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific browser
npx playwright test --project=chromium

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

### Performance Tests

```bash
# Run load test
k6 run tests/performance/load-test-optimized.js

# Run with custom parameters
k6 run --vus 100 --duration 5m tests/performance/load-test-optimized.js

# Run with environment variables
BASE_URL=https://staging.azora.world k6 run tests/performance/load-test-optimized.js
```

---

## 🎓 Best Practices

### 1. Test Naming

```typescript
// ❌ Bad - Vague and unclear
test('test1', () => {});
test('it works', () => {});

// ✅ Good - Descriptive and specific
test('should create user with hashed password', () => {});
test('should reject login with invalid credentials', () => {});
test('should award AZR tokens on lesson completion', () => {});
```

### 2. One Assertion Per Test

```typescript
// ❌ Bad - Multiple unrelated assertions
test('user operations', () => {
  expect(user.email).toBe('test@azora.world');
  expect(wallet.balance).toBe(100);
  expect(course.title).toBe('Python');
});

// ✅ Good - Single focused assertion
test('should set user email correctly', () => {
  expect(user.email).toBe('test@azora.world');
});

test('should initialize wallet with zero balance', () => {
  expect(wallet.balance).toBe(0);
});
```

### 3. Use Factories for Test Data

```typescript
// ❌ Bad - Hardcoded test data
const user = {
  id: '123',
  email: 'test@test.com',
  password: 'password',
  firstName: 'Test',
  lastName: 'User',
};

// ✅ Good - Use factories
const user = userFactory.build();
const student = userFactory.buildStudent();
const users = userFactory.buildMany(5);
```

### 4. Clean Up After Tests

```typescript
// ✅ Always clean up test data
afterEach(async () => {
  await prisma.user.deleteMany({
    where: { email: { contains: '@test.azora' } }
  });
  
  await redis.flushall();
  
  jest.clearAllMocks();
});
```

### 5. Test Edge Cases

```typescript
describe('calculateMiningReward', () => {
  it('should handle normal case', () => {
    expect(calculateMiningReward('LESSON', 1)).toBe(10);
  });
  
  it('should handle zero difficulty', () => {
    expect(calculateMiningReward('LESSON', 0)).toBe(0);
  });
  
  it('should handle negative difficulty', () => {
    expect(() => calculateMiningReward('LESSON', -1)).toThrow();
  });
  
  it('should handle invalid activity type', () => {
    expect(() => calculateMiningReward('INVALID', 1)).toThrow();
  });
});
```

### 6. Avoid Test Interdependence

```typescript
// ❌ Bad - Tests depend on each other
let userId;

test('should create user', () => {
  userId = createUser();
});

test('should update user', () => {
  updateUser(userId); // Depends on previous test
});

// ✅ Good - Independent tests
test('should create user', () => {
  const userId = createUser();
  expect(userId).toBeDefined();
});

test('should update user', () => {
  const userId = createUser(); // Create own data
  const updated = updateUser(userId);
  expect(updated).toBe(true);
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests
- Manual workflow dispatch

**Workflow stages:**
1. Lint & TypeCheck (fast feedback)
2. Unit Tests (parallel by service)
3. Integration Tests (with DB & Redis)
4. E2E Tests (critical paths)

**View results:**
- Check Actions tab in GitHub
- Coverage reports in PR comments
- Playwright reports in artifacts

### Coverage Requirements

| Service | Target | Current |
|---------|--------|---------|
| Auth | 95% | TBD |
| Education | 90% | TBD |
| Mint | 95% | TBD |
| Forge | 85% | TBD |
| Sapiens | 85% | TBD |
| Family | 80% | TBD |

---

## 🐛 Troubleshooting

### Common Issues

#### Tests Timeout
```bash
# Increase timeout in jest.config.js
testTimeout: 15000

# Or per test
test('slow test', async () => {
  // ...
}, 30000);
```

#### Database Connection Errors
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset
```

#### Flaky E2E Tests
```typescript
// Use proper waits
await expect(page.locator('.element')).toBeVisible({ timeout: 10000 });

// Avoid hard waits
// await page.waitForTimeout(1000); // ❌ Bad

// Use network idle
await page.waitForLoadState('networkidle');
```

#### Mock Not Working
```typescript
// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Or use mockReset
beforeEach(() => {
  mockReset(prismaMock);
});
```

---

## 📊 Test Metrics

View test metrics:
```bash
# Generate metrics report
npm run test:metrics

# View coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

**Key metrics:**
- Total tests: 263+
- Coverage: 89%+
- Execution time: <5 minutes
- Success rate: 100%

---

## 🎯 Next Steps

1. **Write tests for new features** - Always include tests with new code
2. **Improve coverage** - Target 90%+ across all services
3. **Add visual regression** - Screenshot comparison for UI
4. **Performance benchmarks** - Track API response times
5. **Accessibility testing** - Ensure WCAG compliance

---

**Happy Testing! 🚀**

*Quality is not an act, it is a habit. - Aristotle*
