# 🧪 Testing Guide - Azora OS
## Quality • Functionality • Speed

---

## 🚀 Quick Start

```bash
# Run all tests
npm run test

# Run specific test types
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests
npm run test:e2e              # End-to-end tests
npm run test:coverage         # With coverage report

# Watch mode (development)
npm run test:watch

# Run tests for specific service
npm run test -- services/auth-service
```

---

## 📁 Test Structure

```
azora/
├── tests/
│   ├── setup.ts                    # Global test setup
│   ├── e2e/                        # End-to-end tests
│   │   ├── complete-user-journey.spec.ts
│   │   ├── marketplace.spec.ts
│   │   └── payment.spec.ts
│   ├── integration/                # Integration tests
│   │   ├── auth-flow.test.ts
│   │   ├── course-enrollment.test.ts
│   │   └── payment-flow.test.ts
│   └── performance/                # Performance tests
│       ├── comprehensive-load-test.js
│       └── stress-test.js
├── services/
│   └── [service-name]/
│       └── tests/                  # Service-specific tests
│           ├── unit/
│           └── integration/
└── packages/
    └── test-utils/                 # Shared test utilities
        ├── factories/
        ├── mocks/
        └── helpers/
```

---

## 🎯 Test Types

### 1. Unit Tests (70% of tests)

**Purpose:** Test individual functions/methods in isolation

**Characteristics:**
- Fast execution (<100ms per test)
- No external dependencies
- Mock all external services
- High coverage (80%+)

**Example:**
```typescript
import { hashPassword, comparePassword } from './auth.utils';

describe('Auth Utils', () => {
  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'Test123!';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeTruthy();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(50);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'Test123!';
      const hashed = await hashPassword(password);
      
      const result = await comparePassword(password, hashed);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'Test123!';
      const hashed = await hashPassword(password);
      
      const result = await comparePassword('WrongPassword', hashed);
      expect(result).toBe(false);
    });
  });
});
```

### 2. Integration Tests (20% of tests)

**Purpose:** Test interactions between services/components

**Characteristics:**
- Use real database (test environment)
- Test service-to-service communication
- Verify data flow
- Clean up after each test

**Example:**
```typescript
import { authService } from '../services/auth';
import { educationService } from '../services/education';
import { mintService } from '../services/mint';

describe('User Enrollment Flow', () => {
  it('should enroll user and award AZR tokens', async () => {
    // 1. Create user
    const user = await authService.register({
      email: 'test@azora.world',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
    });

    // 2. Enroll in course
    const enrollment = await educationService.enroll({
      userId: user.id,
      courseId: 'test-course-id',
    });

    expect(enrollment.status).toBe('active');

    // 3. Verify AZR tokens awarded
    const wallet = await mintService.getWallet(user.id);
    expect(wallet.balance).toBeGreaterThan(0);
  });
});
```

### 3. End-to-End Tests (10% of tests)

**Purpose:** Test complete user journeys through the UI

**Characteristics:**
- Use Playwright for browser automation
- Test critical user paths
- Verify UI interactions
- Slower execution (seconds per test)

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('student completes first lesson', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'student@test.azora');
  await page.fill('[name="password"]', 'Test123!');
  await page.click('button[type="submit"]');

  // Navigate to course
  await page.click('text=My Courses');
  await page.click('.course-card:first-child');

  // Start lesson
  await page.click('button:has-text("Start Learning")');
  await expect(page.locator('.lesson-content')).toBeVisible();

  // Complete lesson
  await page.click('button:has-text("Mark Complete")');
  await expect(page.locator('text=Lesson completed')).toBeVisible();

  // Verify AZR earned
  const balance = await page.locator('.azr-balance').textContent();
  expect(parseFloat(balance!)).toBeGreaterThan(0);
});
```

### 4. Performance Tests

**Purpose:** Verify system performance under load

**Characteristics:**
- Use K6 for load testing
- Test API endpoints
- Measure response times
- Identify bottlenecks

**Example:**
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.get('http://localhost:4000/api/courses');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## 🛠️ Test Utilities

### Factories

Generate test data easily:

```typescript
import { userFactory, courseFactory } from '@azora/test-utils';

// Create single user
const user = userFactory.build({ email: 'custom@test.azora' });

// Create multiple users
const users = userFactory.buildMany(10);

// Create specific role
const admin = userFactory.buildAdmin();
const educator = userFactory.buildEducator();
```

### Mocks

Mock external services:

```typescript
import { prismaMock } from '@azora/test-utils';

// Mock Prisma query
prismaMock.user.findUnique.mockResolvedValue({
  id: '123',
  email: 'test@azora.world',
  // ...
});
```

### Helpers

Common test operations:

```typescript
import { authHelper } from '@azora/test-utils';

// Generate JWT token
const token = authHelper.generateToken({
  userId: '123',
  email: 'test@azora.world',
  role: 'student',
});

// Generate auth header
const headers = authHelper.generateAuthHeader({ userId: '123' });
```

---

## ✅ Best Practices

### 1. AAA Pattern (Arrange, Act, Assert)

```typescript
test('should create user', async () => {
  // Arrange
  const userData = { email: 'test@azora.world', password: 'Test123!' };
  
  // Act
  const user = await createUser(userData);
  
  // Assert
  expect(user.email).toBe(userData.email);
});
```

### 2. Descriptive Test Names

```typescript
// ❌ Bad
test('test1', () => {});

// ✅ Good
test('should return 401 when user is not authenticated', () => {});
```

### 3. One Assertion Per Test (when possible)

```typescript
// ❌ Bad
test('user creation', async () => {
  const user = await createUser(data);
  expect(user.email).toBe(data.email);
  expect(user.role).toBe('student');
  expect(user.verified).toBe(false);
});

// ✅ Good
test('should set email correctly', async () => {
  const user = await createUser(data);
  expect(user.email).toBe(data.email);
});

test('should default role to student', async () => {
  const user = await createUser(data);
  expect(user.role).toBe('student');
});
```

### 4. Use Factories for Test Data

```typescript
// ❌ Bad
const user = {
  id: '123',
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  // ... 20 more fields
};

// ✅ Good
const user = userFactory.build({ email: 'test@test.com' });
```

### 5. Clean Up After Tests

```typescript
afterEach(async () => {
  await prisma.user.deleteMany({
    where: { email: { contains: '@test.azora' } },
  });
});
```

### 6. Mock External Services

```typescript
// ❌ Bad - calls real Stripe API
await stripe.charges.create({ amount: 1000 });

// ✅ Good - mocks Stripe
jest.mock('stripe');
stripeMock.charges.create.mockResolvedValue({ id: 'ch_123' });
```

---

## 📊 Coverage Requirements

| Service | Target | Priority |
|---------|--------|----------|
| Auth | 95% | Critical |
| Education | 90% | High |
| Mint | 95% | Critical |
| Forge | 85% | Medium |
| Sapiens | 85% | Medium |
| Family | 80% | Low |

**Overall Target:** 80%+ coverage

---

## 🚀 Running Tests in CI

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests
- Manual workflow dispatch

**CI Pipeline:**
1. Lint & Typecheck (2 min)
2. Unit Tests - Parallel (3 min)
3. Integration Tests (5 min)
4. E2E Tests (10 min)
5. Performance Tests (main only, 5 min)

**Total CI Time:** ~15 minutes

---

## 🐛 Debugging Tests

### Run Single Test

```bash
npm run test -- path/to/test.ts
```

### Run with Debugger

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### View Coverage Report

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Playwright Debug Mode

```bash
PWDEBUG=1 npm run test:e2e
```

---

## 📈 Test Metrics

Track these metrics:
- **Coverage:** Lines, branches, functions
- **Execution Time:** Per test, per suite
- **Flaky Tests:** Tests that fail intermittently
- **Failure Rate:** % of failing tests

**View Metrics:**
```bash
npm run test:metrics
```

---

## 🎯 Writing Your First Test

1. **Create test file:**
```bash
touch services/my-service/tests/my-feature.test.ts
```

2. **Write test:**
```typescript
import { myFunction } from '../src/my-feature';

describe('My Feature', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

3. **Run test:**
```bash
npm run test -- services/my-service
```

4. **Check coverage:**
```bash
npm run test:coverage -- services/my-service
```

---

## 🤝 Contributing Tests

1. Write tests for all new features
2. Maintain 80%+ coverage
3. Follow AAA pattern
4. Use descriptive names
5. Clean up after tests
6. Update documentation

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [K6 Documentation](https://k6.io/docs/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Happy Testing! 🧪✨**
