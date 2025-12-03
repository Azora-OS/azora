# Testing Standards Guide

## Overview

This document defines the testing standards and best practices for the Azora platform. All developers must follow these guidelines when writing tests.

## Naming Conventions

### Test Files
- Test files must be named `*.test.ts` or `*.test.js`
- Place test files in a `tests/` directory within the service
- Name test files after the module they test: `auth.ts` → `auth.test.ts`

### Test Suites and Cases
```typescript
// Use descriptive suite names
describe('Auth Service - User Registration', () => {
  // Use "should" statements for test cases
  it('should create user with valid credentials', () => {
    // Test implementation
  });

  it('should reject registration with duplicate email', () => {
    // Test implementation
  });
});
```

### Variables and Functions
- Use descriptive names: `validUser`, `invalidEmail`, `mockStripeService`
- Prefix mock functions with `mock`: `mockCreateUser`, `mockSendEmail`
- Use `expected` prefix for expected values: `expectedUserId`, `expectedStatus`

## Test Structure

### AAA Pattern (Arrange, Act, Assert)
```typescript
it('should calculate total price correctly', () => {
  // Arrange - Set up test data
  const items = [
    { price: 10, quantity: 2 },
    { price: 15, quantity: 1 }
  ];

  // Act - Execute the function
  const total = calculateTotal(items);

  // Assert - Verify the result
  expect(total).toBe(35);
});
```

### Test Organization
```typescript
describe('Service Name', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset state before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  // Group related tests
  describe('Feature Name', () => {
    it('should handle success case', () => {});
    it('should handle error case', () => {});
  });

  describe('Another Feature', () => {
    it('should validate input', () => {});
  });
});
```

## Assertion Guidelines

### Use Specific Matchers
```typescript
// Good - Specific matchers
expect(user.email).toBe('test@example.com');
expect(users).toHaveLength(3);
expect(response.status).toBe(200);
expect(price).toBeCloseTo(19.99, 2);

// Bad - Generic matchers
expect(user.email === 'test@example.com').toBe(true);
expect(users.length).toBe(3);
```

### Test One Thing Per Test
```typescript
// Good - Single responsibility
it('should validate email format', () => {
  const isValid = validateEmail('test@example.com');
  expect(isValid).toBe(true);
});

it('should reject invalid email format', () => {
  const isValid = validateEmail('invalid-email');
  expect(isValid).toBe(false);
});

// Bad - Multiple responsibilities
it('should validate email and password', () => {
  expect(validateEmail('test@example.com')).toBe(true);
  expect(validatePassword('password123')).toBe(true);
});
```

## Test Data Management

### Use Factories
```typescript
import { userFactory } from '@tests/factories';

it('should create user', async () => {
  // Use factory for test data
  const user = await userFactory.create();
  expect(user.id).toBeDefined();
});

it('should create user with custom data', async () => {
  const user = await userFactory.create({
    email: 'custom@example.com',
    role: 'ADMIN'
  });
  expect(user.role).toBe('ADMIN');
});
```

### Avoid Hard-Coded Values
```typescript
// Good - Use constants or factories
const TEST_EMAIL = 'test@example.com';
const user = await userFactory.create({ email: TEST_EMAIL });

// Bad - Hard-coded values scattered throughout
expect(user.email).toBe('test@example.com');
```

## Mock Usage

### Use Mocks for External Dependencies
```typescript
import { stripeMock } from '@tests/mocks';

it('should process payment', async () => {
  // Setup mock
  stripeMock.createPaymentIntent.mockResolvedValue({
    id: 'pi_123',
    status: 'succeeded'
  });

  // Test with mock
  const result = await processPayment(100);
  
  expect(stripeMock.createPaymentIntent).toHaveBeenCalledWith({
    amount: 100,
    currency: 'usd'
  });
  expect(result.status).toBe('succeeded');
});
```

### Reset Mocks Between Tests
```typescript
describe('Payment Service', () => {
  afterEach(() => {
    // Reset all mocks after each test
    jest.clearAllMocks();
  });

  it('should call Stripe API', () => {
    // Test implementation
  });
});
```

## Coverage Requirements

### Minimum Coverage Thresholds
- **Statements**: 70%
- **Branches**: 65%
- **Functions**: 70%
- **Lines**: 70%

### Critical Paths
Critical user flows must have **90%+ coverage**:
- Authentication and authorization
- Payment processing
- Data persistence
- Security features

### What to Test
✅ **Do Test:**
- Business logic
- Edge cases and error handling
- Integration points
- Critical user flows
- Data validation
- Security checks

❌ **Don't Test:**
- Third-party library internals
- Simple getters/setters
- Configuration files
- Type definitions

## Performance Guidelines

### Test Execution Time
- Unit tests: < 100ms per test
- Integration tests: < 1s per test
- E2E tests: < 10s per test

### Optimize Slow Tests
```typescript
// Use beforeAll for expensive setup
describe('Database Tests', () => {
  beforeAll(async () => {
    // One-time setup
    await setupDatabase();
  });

  afterAll(async () => {
    // One-time cleanup
    await teardownDatabase();
  });

  it('should query users', async () => {
    // Fast test using shared setup
  });
});
```

## Error Handling

### Test Error Cases
```typescript
it('should throw error for invalid input', () => {
  expect(() => {
    processData(null);
  }).toThrow('Invalid input');
});

it('should handle async errors', async () => {
  await expect(
    fetchUser('invalid-id')
  ).rejects.toThrow('User not found');
});
```

### Test Error Messages
```typescript
it('should provide descriptive error message', () => {
  try {
    validateEmail('invalid');
  } catch (error) {
    expect(error.message).toBe('Invalid email format');
    expect(error.code).toBe('VALIDATION_ERROR');
  }
});
```

## Async Testing

### Use async/await
```typescript
// Good - Clear async handling
it('should fetch user data', async () => {
  const user = await fetchUser('user-123');
  expect(user.id).toBe('user-123');
});

// Bad - Promise chains
it('should fetch user data', () => {
  return fetchUser('user-123').then(user => {
    expect(user.id).toBe('user-123');
  });
});
```

### Handle Timeouts
```typescript
it('should complete within timeout', async () => {
  const result = await longRunningOperation();
  expect(result).toBeDefined();
}, 10000); // 10 second timeout
```

## Documentation

### Add Comments for Complex Tests
```typescript
it('should calculate compound interest correctly', () => {
  // Test the compound interest formula: A = P(1 + r/n)^(nt)
  // P = 1000, r = 0.05, n = 12, t = 1
  const principal = 1000;
  const rate = 0.05;
  const compoundsPerYear = 12;
  const years = 1;

  const result = calculateCompoundInterest(
    principal,
    rate,
    compoundsPerYear,
    years
  );

  // Expected: 1051.16
  expect(result).toBeCloseTo(1051.16, 2);
});
```

### Document Test Assumptions
```typescript
describe('User Service', () => {
  // Assumes database is seeded with test data
  // Assumes Redis is running on localhost:6379
  // Assumes test environment variables are loaded

  it('should find user by email', async () => {
    // Test implementation
  });
});
```

## Continuous Improvement

### Review Test Quality
- Run tests regularly
- Monitor test execution time
- Track flaky tests
- Update tests when code changes
- Remove obsolete tests

### Test Metrics to Track
- Coverage percentage
- Test execution time
- Flaky test rate
- Test failure rate
- Time to fix failing tests

## Common Pitfalls to Avoid

❌ **Don't:**
- Test implementation details
- Write tests that depend on execution order
- Use production data in tests
- Skip cleanup in afterEach/afterAll
- Ignore flaky tests
- Write tests without assertions
- Test multiple things in one test

✅ **Do:**
- Test behavior and outcomes
- Make tests independent
- Use test data factories
- Clean up after tests
- Fix flaky tests immediately
- Include meaningful assertions
- Keep tests focused and simple
