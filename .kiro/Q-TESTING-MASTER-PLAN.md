# 🧪 Q-Testing Master Plan - Azora OS
## Quality • Functionality • Speed

**Agent:** Q-Testing (Senior QA Engineer)  
**Mission:** Build world-class testing infrastructure  
**Timeline:** 4 days  
**Status:** 🚀 Ready to Execute

---

## 🎯 Testing Philosophy

**Quality First:** 80%+ coverage, zero tolerance for flaky tests  
**Functionality Focus:** Test real user journeys, not just code  
**Speed Optimized:** Parallel execution, smart caching, fast feedback

---

## 📊 Current State Analysis

### ✅ What We Have
- Jest configured with 80% coverage threshold
- Playwright setup for E2E tests
- GitHub workflow for tests (basic)
- Test directories structure in place
- 263 tests passing (89% coverage reported in README)

### ❌ What's Missing
- **Test utilities package** - Shared mocks, factories, helpers
- **Comprehensive E2E tests** - Only 3 spec files exist
- **Performance testing** - K6 scripts incomplete
- **Visual regression** - No screenshot comparison
- **API contract tests** - No Pact/OpenAPI validation
- **Load testing automation** - Manual K6 scripts only
- **Test data management** - No fixture system
- **CI optimization** - Tests run sequentially

---

## 🏗️ Implementation Plan

### Day 1: Test Infrastructure Foundation

#### 1.1 Test Utilities Package (2 hours)
```
packages/test-utils/
├── src/
│   ├── factories/          # Data factories
│   │   ├── user.factory.ts
│   │   ├── course.factory.ts
│   │   ├── transaction.factory.ts
│   │   └── index.ts
│   ├── mocks/             # Service mocks
│   │   ├── prisma.mock.ts
│   │   ├── redis.mock.ts
│   │   ├── stripe.mock.ts
│   │   └── index.ts
│   ├── helpers/           # Test helpers
│   │   ├── auth.helper.ts
│   │   ├── db.helper.ts
│   │   ├── api.helper.ts
│   │   └── index.ts
│   └── fixtures/          # Test data
│       ├── users.json
│       ├── courses.json
│       └── index.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

**Key Features:**
- Factory pattern for test data generation
- Faker.js integration for realistic data
- Type-safe mocks with full IntelliSense
- Reusable test helpers across all services

#### 1.2 Enhanced Jest Configuration (1 hour)
```typescript
// jest.config.js (root)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Parallel execution
  maxWorkers: '50%',
  
  // Coverage
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.{ts,js}',
    'packages/**/*.{ts,js}',
    '!**/*.test.{ts,js}',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Performance
  testTimeout: 10000,
  bail: 1, // Stop on first failure in CI
  
  // Setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Module resolution
  moduleNameMapper: {
    '@azora/test-utils': '<rootDir>/packages/test-utils/src',
    '@azora/(.*)': '<rootDir>/packages/$1/src'
  }
};
```

#### 1.3 Test Setup & Teardown (1 hour)
```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

let prisma: PrismaClient;
let redis: Redis;

beforeAll(async () => {
  // Database setup
  prisma = new PrismaClient();
  await prisma.$connect();
  
  // Redis setup
  redis = new Redis(process.env.REDIS_URL);
  
  // Global test timeout
  jest.setTimeout(10000);
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});

afterEach(async () => {
  // Clean up test data
  const tables = ['User', 'Course', 'Transaction'];
  for (const table of tables) {
    await prisma[table.toLowerCase()].deleteMany({
      where: { email: { contains: '@test.azora' } }
    });
  }
  
  // Clear Redis test keys
  const keys = await redis.keys('test:*');
  if (keys.length > 0) await redis.del(...keys);
});
```

---

### Day 2: Service Testing (Unit + Integration)

#### 2.1 Auth Service Tests (2 hours)
```typescript
// services/auth-service/tests/auth.test.ts
describe('Auth Service', () => {
  describe('Registration', () => {
    it('creates user with hashed password', async () => {});
    it('sends verification email', async () => {});
    it('rejects duplicate email', async () => {});
    it('validates password strength', async () => {});
  });
  
  describe('Login', () => {
    it('returns JWT on valid credentials', async () => {});
    it('rejects invalid password', async () => {});
    it('enforces rate limiting', async () => {});
    it('tracks login attempts', async () => {});
  });
  
  describe('MFA', () => {
    it('generates TOTP secret', async () => {});
    it('validates TOTP code', async () => {});
    it('enforces MFA when enabled', async () => {});
  });
});
```

**Coverage Target:** 95%+ (critical security service)

#### 2.2 Education Service Tests (2 hours)
```typescript
// services/azora-education/tests/courses.test.ts
describe('Course Management', () => {
  describe('Enrollment', () => {
    it('enrolls student in course', async () => {});
    it('prevents duplicate enrollment', async () => {});
    it('checks prerequisites', async () => {});
    it('awards AZR tokens on enrollment', async () => {});
  });
  
  describe('Progress Tracking', () => {
    it('updates lesson completion', async () => {});
    it('calculates course progress', async () => {});
    it('awards completion certificate', async () => {});
  });
});
```

**Coverage Target:** 90%+

#### 2.3 Mint Service Tests (2 hours)
```typescript
// services/azora-mint/tests/mining.test.ts
describe('Mining Engine', () => {
  describe('Proof of Knowledge', () => {
    it('calculates mining rewards', async () => {});
    it('validates learning activities', async () => {});
    it('distributes AZR tokens', async () => {});
    it('enforces daily limits', async () => {});
  });
  
  describe('Wallet Operations', () => {
    it('creates wallet on signup', async () => {});
    it('processes transactions', async () => {});
    it('maintains balance integrity', async () => {});
  });
});
```

**Coverage Target:** 95%+ (financial service)

#### 2.4 Integration Tests (2 hours)
```typescript
// tests/integration/user-journey.test.ts
describe('Complete User Journey', () => {
  it('signup → enroll → learn → earn → withdraw', async () => {
    // 1. User signs up
    const user = await authService.register({...});
    
    // 2. Enrolls in course
    const enrollment = await educationService.enroll({...});
    
    // 3. Completes lessons
    await educationService.completeLesson({...});
    
    // 4. Earns AZR tokens
    const balance = await mintService.getBalance(user.id);
    expect(balance).toBeGreaterThan(0);
    
    // 5. Withdraws earnings
    await mintService.withdraw({...});
  });
});
```

---

### Day 3: E2E & Performance Testing

#### 3.1 Playwright E2E Tests (3 hours)
```typescript
// tests/e2e/student-portal.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Student Portal', () => {
  test('complete learning journey', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'student@test.azora');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Navigate to courses
    await expect(page).toHaveURL('/dashboard');
    await page.click('text=Browse Courses');
    
    // Enroll in course
    await page.click('text=Python Basics');
    await page.click('button:has-text("Enroll Now")');
    
    // Start learning
    await page.click('text=Start Learning');
    await expect(page.locator('.lesson-content')).toBeVisible();
    
    // Complete lesson
    await page.click('button:has-text("Mark Complete")');
    
    // Verify AZR earned
    const balance = await page.locator('.azr-balance').textContent();
    expect(parseFloat(balance)).toBeGreaterThan(0);
  });
  
  test('AI tutor interaction', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="ai-tutor"]');
    
    // Ask question
    await page.fill('[name="question"]', 'Explain variables in Python');
    await page.click('button:has-text("Ask Elara")');
    
    // Wait for AI response
    await expect(page.locator('.ai-response')).toBeVisible({ timeout: 5000 });
    
    // Verify response quality
    const response = await page.locator('.ai-response').textContent();
    expect(response.length).toBeGreaterThan(50);
  });
});
```

**E2E Test Coverage:**
- ✅ Authentication flows (login, signup, MFA)
- ✅ Course enrollment & learning
- ✅ AI tutor interactions
- ✅ Payment processing
- ✅ Job marketplace
- ✅ Profile management

#### 3.2 Performance Testing with K6 (2 hours)
```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Spike to 200
    { duration: '5m', target: 200 },   // Stay at 200
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // <1% errors
    errors: ['rate<0.1'],              // <10% errors
  },
};

export default function () {
  // Test API endpoints
  const endpoints = [
    '/api/health',
    '/api/courses',
    '/api/auth/profile',
  ];
  
  endpoints.forEach(endpoint => {
    const res = http.get(`http://localhost:4000${endpoint}`);
    
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  });
  
  sleep(1);
}
```

#### 3.3 Visual Regression Testing (1 hour)
```typescript
// tests/e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('student dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('dashboard.png');
  });
  
  test('course page', async ({ page }) => {
    await page.goto('/courses/python-basics');
    await expect(page).toHaveScreenshot('course-page.png');
  });
  
  test('AI family tree', async ({ page }) => {
    await page.goto('/family');
    await expect(page).toHaveScreenshot('family-tree.png');
  });
});
```

---

### Day 4: CI/CD Optimization & Documentation

#### 4.1 Optimized GitHub Workflows (2 hours)

**tests/workflows/test-optimized.yml:**
```yaml
name: Test Suite (Optimized)

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: test-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # Fast feedback - runs first
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  # Unit tests - parallel by service
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth, education, mint, forge, sapiens, family]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- services/${{ matrix.service }}
      - uses: codecov/codecov-action@v4
        with:
          flags: unit-${{ matrix.service }}

  # Integration tests - with services
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  # E2E tests - critical paths only
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  # Performance tests - on main only
  performance-tests:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/performance/load-test.js
```

**Optimization Features:**
- ✅ Parallel execution by service
- ✅ Fast feedback (lint/typecheck first)
- ✅ Smart caching (npm, node_modules)
- ✅ Conditional runs (perf tests on main only)
- ✅ Artifact retention (reports, screenshots)

#### 4.2 Test Documentation (2 hours)

**docs/TESTING-GUIDE.md:**
```markdown
# Testing Guide

## Quick Start
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e          # E2E tests
npm run test:coverage     # With coverage report

## Writing Tests

### Unit Tests
- Test single functions/methods
- Mock external dependencies
- Fast execution (<100ms per test)

### Integration Tests
- Test service interactions
- Use real database (test env)
- Clean up after each test

### E2E Tests
- Test complete user journeys
- Use Playwright for browser automation
- Focus on critical paths

## Best Practices
1. AAA Pattern (Arrange, Act, Assert)
2. One assertion per test
3. Descriptive test names
4. Use factories for test data
5. Clean up after tests
```

#### 4.3 Test Metrics Dashboard (1 hour)
```typescript
// scripts/test-metrics.ts
import fs from 'fs';
import path from 'path';

interface TestMetrics {
  totalTests: number;
  passing: number;
  failing: number;
  coverage: {
    lines: number;
    branches: number;
    functions: number;
    statements: number;
  };
  duration: number;
  services: Record<string, ServiceMetrics>;
}

async function generateMetrics() {
  const coverage = JSON.parse(
    fs.readFileSync('coverage/coverage-summary.json', 'utf-8')
  );
  
  const metrics: TestMetrics = {
    totalTests: 0,
    passing: 0,
    failing: 0,
    coverage: {
      lines: coverage.total.lines.pct,
      branches: coverage.total.branches.pct,
      functions: coverage.total.functions.pct,
      statements: coverage.total.statements.pct,
    },
    duration: 0,
    services: {},
  };
  
  // Generate markdown report
  const report = `
# Test Metrics Report

**Generated:** ${new Date().toISOString()}

## Summary
- **Total Tests:** ${metrics.totalTests}
- **Passing:** ${metrics.passing} ✅
- **Failing:** ${metrics.failing} ❌
- **Duration:** ${metrics.duration}s

## Coverage
- **Lines:** ${metrics.coverage.lines}%
- **Branches:** ${metrics.coverage.branches}%
- **Functions:** ${metrics.coverage.functions}%
- **Statements:** ${metrics.coverage.statements}%

## By Service
${Object.entries(metrics.services).map(([name, m]) => `
### ${name}
- Tests: ${m.total}
- Coverage: ${m.coverage}%
`).join('\n')}
  `;
  
  fs.writeFileSync('TEST-METRICS.md', report);
}

generateMetrics();
```

---

## 🎯 Success Criteria

### Day 1 ✅
- [ ] Test utilities package created
- [ ] 20+ factory functions
- [ ] 10+ mock services
- [ ] Enhanced Jest config
- [ ] Test setup/teardown working

### Day 2 ✅
- [ ] Auth service: 95%+ coverage
- [ ] Education service: 90%+ coverage
- [ ] Mint service: 95%+ coverage
- [ ] 5+ integration tests
- [ ] All tests passing

### Day 3 ✅
- [ ] 10+ E2E test scenarios
- [ ] K6 load tests configured
- [ ] Visual regression setup
- [ ] Performance benchmarks established

### Day 4 ✅
- [ ] Optimized CI workflows
- [ ] Test documentation complete
- [ ] Metrics dashboard working
- [ ] All tests passing in CI

---

## 📊 Expected Outcomes

### Coverage Targets
| Service | Current | Target | Priority |
|---------|---------|--------|----------|
| Auth | Unknown | 95% | Critical |
| Education | Unknown | 90% | High |
| Mint | Unknown | 95% | Critical |
| Forge | Unknown | 85% | Medium |
| Sapiens | Unknown | 85% | Medium |
| Family | Unknown | 80% | Low |

### Performance Targets
| Metric | Target | Current |
|--------|--------|---------|
| API Response (p95) | <500ms | TBD |
| Test Execution | <5min | TBD |
| E2E Suite | <10min | TBD |
| CI Pipeline | <15min | TBD |

### Quality Gates
- ✅ 80%+ code coverage
- ✅ 0 critical security issues
- ✅ 0 flaky tests
- ✅ <1% error rate in load tests
- ✅ All E2E tests passing

---

## 🚀 Execution Commands

```bash
# Day 1: Setup
npm run test:setup

# Day 2: Service Tests
npm run test:services

# Day 3: E2E & Performance
npm run test:e2e
npm run test:performance

# Day 4: CI & Docs
npm run test:ci
npm run test:metrics

# Full Suite
npm run test:all
```

---

## 🎓 Testing Best Practices

### 1. Test Pyramid
- 70% Unit Tests (fast, isolated)
- 20% Integration Tests (service interactions)
- 10% E2E Tests (critical user journeys)

### 2. Test Naming
```typescript
// ❌ Bad
test('test1', () => {});

// ✅ Good
test('should create user with hashed password', () => {});
```

### 3. AAA Pattern
```typescript
test('should enroll student in course', async () => {
  // Arrange
  const student = await createTestStudent();
  const course = await createTestCourse();
  
  // Act
  const enrollment = await enrollStudent(student.id, course.id);
  
  // Assert
  expect(enrollment.status).toBe('active');
});
```

### 4. Data Factories
```typescript
// Use factories, not hardcoded data
const user = userFactory.build({ email: 'test@azora.world' });
```

### 5. Clean Up
```typescript
afterEach(async () => {
  await cleanupTestData();
});
```

---

## 📈 Monitoring & Reporting

### Test Metrics
- Coverage trends over time
- Test execution duration
- Flaky test detection
- Failure rate by service

### CI/CD Integration
- Automatic test runs on PR
- Coverage reports in PR comments
- Performance regression detection
- Visual diff reports

---

## 🎯 Next Steps After Day 4

1. **Continuous Improvement**
   - Monitor test metrics weekly
   - Refactor flaky tests
   - Add tests for new features
   - Update documentation

2. **Advanced Testing**
   - Chaos engineering tests
   - Security penetration tests
   - Accessibility testing
   - Mobile app testing

3. **Test Automation**
   - Auto-generate tests from OpenAPI
   - AI-powered test generation
   - Mutation testing
   - Property-based testing

---

**Q-Testing Agent Ready! Let's build world-class quality! 🚀**
