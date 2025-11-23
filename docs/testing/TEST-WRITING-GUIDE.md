# Test Writing Guide

## Overview

This guide provides practical instructions for writing effective tests in the Azora platform.

## Test Structure

### Basic Test Template

```typescript
import { userFactory } from '../../../tests/factories';
import { getTestPrismaClient, cleanupTestDatabase } from '../../../tests/utils/database';

const prisma = getTestPrismaClient();

describe('Feature Name', () => {
  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Specific Functionality', () => {
    it('should perform expected behavior', async () => {
      // Arrange
      const user = await userFactory.create();
      
      // Act
      const result = await someFunction(user.id);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });
  });
});
```

## Naming Conventions

### Test File Names
- Use `.test.ts` or `.test.js` extension
- Match the file being tested: `auth.ts` → `auth.test.ts`
- Use descriptive names: `password-reset.test.ts`, `user-registration.test.ts`

### Test Descriptions
- Use `describe()` for grouping related tests
- Use `it()` or `test()` for individual test cases
- Write clear, action-oriented descriptions:
  - ✅ "should create user with valid data"
  - ✅ "should reject invalid email format"
  - ❌ "user creation"
  - ❌ "test email"

## Assertion Guidelines

### Use Specific Assertions

```typescript
// ✅ Good - Specific
expect(user.email).toBe('test@example.com');
expect(users.length).toBe(3);
expect(result).toBeNull();

// ❌ Bad - Too generic
expect(user).toBeTruthy();
expect(users).toBeDefined();
```

### Test One Thing Per Test

```typescript
// ✅ Good - Single responsibility
it('should validate email format', () => {
  const isValid = validateEmail('test@example.com');
  expect(isValid).toBe(true);
});

it('should reject invalid email', () => {
  const isValid = validateEmail('invalid-email');
  expect(isValid).toBe(false);
});

// ❌ Bad - Testing multiple things
it('should validate email', () => {
  expect(validateEmail('test@example.com')).toBe(true);
  expect(validateEmail('invalid')).toBe(false);
  expect(validateEmail('')).toBe(false);
  expect(validateEmail(null)).toBe(false);
});
```

## Using Factories

### Creating Test Data

```typescript
// Create with defaults
const user = await userFactory.create();

// Create with overrides
const admin = await userFactory.create({
  role: 'ADMIN',
  email: 'admin@example.com'
});

// Create multiple
const users = await userFactory.createMany(5);
```

### Factory Best Practices

- Use factories for all test data creation
- Override only necessary fields
- Clean up created data in `afterEach`

## Using Mocks

### Mock External Services

```typescript
import { stripeMock } from '../../../tests/mocks';

describe('Payment Processing', () => {
  beforeEach(() => {
    stripeMock.reset();
  });

  it('should process payment', async () => {
    stripeMock.mockPaymentSuccess();
    
    const result = await processPayment({ amount: 1000 });
    
    expect(result.status).toBe('success');
    expect(stripeMock.getCallCount('createPaymentIntent')).toBe(1);
  });
});
```

## Async Testing

### Handling Promises

```typescript
// ✅ Good - Using async/await
it('should fetch user data', async () => {
  const user = await fetchUser('user-123');
  expect(user).toBeDefined();
});

// ✅ Good - Using return
it('should fetch user data', () => {
  return fetchUser('user-123').then(user => {
    expect(user).toBeDefined();
  });
});

// ❌ Bad - Missing await
it('should fetch user data', () => {
  const user = fetchUser('user-123'); // Returns Promise!
  expect(user).toBeDefined(); // Will fail
});
```

## Error Testing

### Testing Error Cases

```typescript
it('should throw error for invalid input', async () => {
  await expect(createUser({ email: 'invalid' }))
    .rejects
    .toThrow('Invalid email format');
});

it('should return error for missing data', () => {
  expect(() => validateUser(null))
    .toThrow('User data required');
});
```

## Test Organization

### Group Related Tests

```typescript
describe('User Authentication', () => {
  describe('Login', () => {
    it('should login with valid credentials', () => {});
    it('should reject invalid password', () => {});
    it('should reject non-existent user', () => {});
  });

  describe('Logout', () => {
    it('should clear session on logout', () => {});
    it('should revoke refresh token', () => {});
  });
});
```

## Common Patterns

### Testing CRUD Operations

```typescript
describe('Course CRUD', () => {
  it('should create course', async () => {
    const course = await createCourse({ title: 'Test Course' });
    expect(course.id).toBeDefined();
  });

  it('should read course', async () => {
    const course = await courseFactory.create();
    const found = await getCourse(course.id);
    expect(found.id).toBe(course.id);
  });

  it('should update course', async () => {
    const course = await courseFactory.create();
    const updated = await updateCourse(course.id, { title: 'New Title' });
    expect(updated.title).toBe('New Title');
  });

  it('should delete course', async () => {
    const course = await courseFactory.create();
    await deleteCourse(course.id);
    const found = await getCourse(course.id);
    expect(found).toBeNull();
  });
});
```

### Testing Validation

```typescript
describe('Input Validation', () => {
  it('should accept valid input', () => {
    const result = validate({ email: 'test@example.com', age: 25 });
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = validate({ email: 'invalid', age: 25 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid email');
  });

  it('should reject negative age', () => {
    const result = validate({ email: 'test@example.com', age: -5 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Age must be positive');
  });
});
```

## Performance Considerations

### Keep Tests Fast

```typescript
// ✅ Good - Minimal setup
it('should validate email format', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
});

// ❌ Bad - Unnecessary database calls
it('should validate email format', async () => {
  const user = await userFactory.create();
  const email = user.email;
  expect(isValidEmail(email)).toBe(true);
});
```

### Use beforeEach Wisely

```typescript
// ✅ Good - Shared setup
describe('User Tests', () => {
  let user;

  beforeEach(async () => {
    user = await userFactory.create();
  });

  it('should have email', () => {
    expect(user.email).toBeDefined();
  });

  it('should have name', () => {
    expect(user.name).toBeDefined();
  });
});
```

## Debugging Tests

### Adding Debug Output

```typescript
it('should process data', () => {
  const data = processData(input);
  console.log('Processed data:', data); // Temporary debug
  expect(data).toBeDefined();
});
```

### Running Single Test

```bash
# Run specific test file
npm test -- path/to/test.test.ts

# Run specific test by name
npm test -- -t "should create user"
```

## Code Review Checklist

- [ ] Test names clearly describe what is being tested
- [ ] Tests are independent and can run in any order
- [ ] Proper cleanup in afterEach/afterAll
- [ ] No hardcoded values that should be dynamic
- [ ] Assertions are specific and meaningful
- [ ] Error cases are tested
- [ ] Async operations use async/await
- [ ] Mocks are reset between tests
- [ ] Tests run quickly (< 1 second each)
- [ ] No console.log statements (unless debugging)

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](./TESTING-STANDARDS.md)
- [Factory Usage Guide](./FACTORY-GUIDE.md)
- [Mock Service Guide](./MOCK-GUIDE.md)
