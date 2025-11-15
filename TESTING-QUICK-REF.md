# 🧪 Testing Quick Reference

## 🚀 Common Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific type
npm run test:unit
npm run test:integration
npm run test:e2e

# Run specific file
npm test -- auth.test.ts

# Watch mode
npm run test:watch

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📝 Writing Tests

### Basic Test Structure
```typescript
import { userFactory, authHelper } from '@azora/test-utils';

describe('Feature Name', () => {
  it('should do something', async () => {
    // Arrange
    const user = userFactory.build();
    
    // Act
    const result = await doSomething(user);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

### Using Factories
```typescript
// User
const user = userFactory.build();
const student = userFactory.buildStudent();
const educator = userFactory.buildEducator();
const users = userFactory.buildMany(5);

// Course
const course = courseFactory.build();
const beginner = courseFactory.buildBeginner();
const free = courseFactory.buildFree();

// Transaction
const tx = transactionFactory.build();
const mining = transactionFactory.buildMining();
const purchase = transactionFactory.buildPurchase();
```

### Using Mocks
```typescript
import { prismaMock, createRedisMock, createStripeMock } from '@azora/test-utils';

// Prisma
prismaMock.user.create.mockResolvedValue(user);

// Redis
const redis = createRedisMock();
await redis.set('key', 'value');

// Stripe
const stripe = createStripeMock();
stripe.paymentIntents.create.mockResolvedValue({...});
```

### Using Helpers
```typescript
import { authHelper, apiHelper, dbHelper } from '@azora/test-utils';

// Auth
const token = authHelper.generateToken(userId);
const headers = authHelper.createAuthHeader(token);

// API
apiHelper.expectSuccess(response);
apiHelper.expectError(response, 400);
apiHelper.expectUnauthorized(response);

// Database
await dbHelper.cleanupTestData(prisma);
```

## 🎯 Coverage Targets

| Service | Target |
|---------|--------|
| Auth | 95% |
| Education | 90% |
| Mint | 95% |
| Forge | 85% |
| Sapiens | 85% |
| Family | 80% |

## ⚡ Performance Thresholds

- API p95: <500ms
- API p99: <1000ms
- Error rate: <1%
- Success rate: >99%

## 🐛 Common Issues

### Test Timeout
```typescript
// Increase timeout
jest.setTimeout(15000);

// Or per test
test('slow test', async () => {
  // ...
}, 30000);
```

### Database Cleanup
```typescript
afterEach(async () => {
  await prisma.user.deleteMany({
    where: { email: { contains: '@test.azora' } }
  });
});
```

### Mock Reset
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## 📊 View Results

```bash
# Coverage report
npm run test:coverage
open coverage/lcov-report/index.html

# E2E report
npx playwright show-report

# Performance results
k6 run tests/performance/load-test-optimized.js
```

## 🔗 Quick Links

- [Full Testing Guide](./docs/TESTING-GUIDE.md)
- [Master Plan](./.kiro/Q-TESTING-MASTER-PLAN.md)
- [Test Utils](./packages/test-utils/)
- [E2E Tests](./tests/e2e/)
- [Performance Tests](./tests/performance/)

---

**Keep this handy while testing! 🚀**
