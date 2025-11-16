# 🧪 Testing Quick Reference Card

## ⚡ Common Commands

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test type
npm run test:unit
npm run test:integration
npm run test:e2e

# Single file
npm test -- path/to/test.ts

# Update snapshots
npm test -- -u

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📝 Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { userFactory } from '@azora/test-utils';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', async () => {
    // Arrange
    const input = userFactory.build();
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

---

## 🎯 Coverage Targets

| Type | Target |
|------|--------|
| Critical Services | 95% |
| High Priority | 90% |
| Medium Priority | 85% |
| Low Priority | 80% |

---

## 🏗️ Test Structure

```
✅ Unit Tests (70%)
   - Fast (<100ms)
   - Isolated
   - Mocked dependencies

✅ Integration Tests (20%)
   - Real database
   - Service interactions
   - Data flow

✅ E2E Tests (10%)
   - Browser automation
   - Critical paths
   - User journeys
```

---

## 🛠️ Test Utilities

```typescript
// Factories
import { userFactory, courseFactory } from '@azora/test-utils';
const user = userFactory.build();
const users = userFactory.buildMany(10);

// Mocks
import { prismaMock } from '@azora/test-utils';
prismaMock.user.findUnique.mockResolvedValue(user);

// Helpers
import { authHelper } from '@azora/test-utils';
const token = authHelper.generateToken({ userId: '123' });
const headers = authHelper.generateAuthHeader({ userId: '123' });
```

---

## ✅ Best Practices Checklist

- [ ] Use AAA pattern (Arrange, Act, Assert)
- [ ] Descriptive test names
- [ ] One assertion per test (when possible)
- [ ] Use factories for test data
- [ ] Mock external services
- [ ] Clean up after tests
- [ ] Test edge cases
- [ ] Test error handling

---

## 🐛 Debugging

```bash
# Run single test
npm test -- my-test.ts

# Verbose output
npm test -- --verbose

# Show console.log
npm test -- --silent=false

# Playwright debug
PWDEBUG=1 npm run test:e2e

# Coverage for single file
npm run test:coverage -- path/to/file.ts
```

---

## 📊 Assertions Cheat Sheet

```typescript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).not.toBe(unexpected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeNull();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3);

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');
expect(object).toMatchObject({ key: 'value' });

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();

// Functions
expect(fn).toThrow();
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg);
```

---

## 🎭 Playwright Selectors

```typescript
// By text
page.locator('text=Login');
page.click('button:has-text("Submit")');

// By role
page.getByRole('button', { name: 'Submit' });
page.getByRole('textbox', { name: 'Email' });

// By test ID
page.locator('[data-testid="submit-button"]');

// By CSS
page.locator('.class-name');
page.locator('#id-name');

// By placeholder
page.getByPlaceholder('Enter email');

// By label
page.getByLabel('Email address');
```

---

## 🚀 Performance Testing

```javascript
// K6 Load Test
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('http://localhost:4000/api/endpoint');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## 📈 CI/CD Pipeline

```
1. Lint & Typecheck (2 min)
   ↓
2. Unit Tests - Parallel (3 min)
   ↓
3. Integration Tests (5 min)
   ↓
4. E2E Tests (10 min)
   ↓
5. Performance Tests (5 min, main only)
```

**Total:** ~15 minutes

---

## 🎯 Quality Gates

- ✅ 80%+ code coverage
- ✅ 0 critical security issues
- ✅ 0 flaky tests
- ✅ <1% error rate in load tests
- ✅ All E2E tests passing
- ✅ P95 response time <500ms

---

## 📞 Need Help?

- 📖 [Full Testing Guide](../docs/TESTING-GUIDE.md)
- 🎯 [Master Plan](./.kiro/Q-TESTING-MASTER-PLAN.md)
- 💬 Ask in #testing channel
- 🐛 Report issues on GitHub

---

**Keep Testing! Quality is our priority! 🚀**
