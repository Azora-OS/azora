# @azora/test-utils

Shared testing utilities for Azora OS - making testing fast, easy, and enjoyable! 🧪✨

## Installation

```bash
npm install @azora/test-utils --save-dev
```

## Features

- 🏭 **Factories** - Generate realistic test data with Faker.js
- 🎭 **Mocks** - Type-safe mocks for Prisma, Redis, and more
- 🔧 **Helpers** - Common test operations (auth, DB, API)
- 📦 **Fixtures** - Pre-defined test data sets
- 🚀 **Fast** - Optimized for speed and developer experience

## Quick Start

```typescript
import { userFactory, authHelper, prismaMock } from '@azora/test-utils';

describe('User Service', () => {
  it('should create user', async () => {
    // Generate test data
    const userData = userFactory.build();
    
    // Mock database
    prismaMock.user.create.mockResolvedValue(userData);
    
    // Test your code
    const user = await userService.create(userData);
    
    expect(user.email).toBe(userData.email);
  });
});
```

## Factories

### User Factory

```typescript
import { userFactory } from '@azora/test-utils';

// Create single user
const user = userFactory.build();

// Create with overrides
const admin = userFactory.build({ role: 'admin' });

// Create multiple users
const users = userFactory.buildMany(10);

// Create specific roles
const student = userFactory.buildStudent();
const educator = userFactory.buildEducator();
const admin = userFactory.buildAdmin();
```

### Course Factory

```typescript
import { courseFactory } from '@azora/test-utils';

// Create single course
const course = courseFactory.build();

// Create with overrides
const pythonCourse = courseFactory.build({
  title: 'Python Basics',
  level: 'beginner',
});

// Create multiple courses
const courses = courseFactory.buildMany(5);

// Create specific levels
const beginnerCourse = courseFactory.buildBeginner();
const intermediateCourse = courseFactory.buildIntermediate();
const advancedCourse = courseFactory.buildAdvanced();
```

## Mocks

### Prisma Mock

```typescript
import { prismaMock } from '@azora/test-utils';

// Mock queries
prismaMock.user.findUnique.mockResolvedValue(user);
prismaMock.user.create.mockResolvedValue(user);
prismaMock.user.update.mockResolvedValue(user);
prismaMock.user.delete.mockResolvedValue(user);

// Mock with multiple results
prismaMock.user.findMany.mockResolvedValue([user1, user2]);

// Verify calls
expect(prismaMock.user.create).toHaveBeenCalledWith({
  data: expect.objectContaining({ email: 'test@azora.world' }),
});
```

## Helpers

### Auth Helper

```typescript
import { authHelper } from '@azora/test-utils';

// Generate JWT token
const token = authHelper.generateToken({
  userId: '123',
  email: 'test@azora.world',
  role: 'student',
});

// Generate auth header
const headers = authHelper.generateAuthHeader({
  userId: '123',
  email: 'test@azora.world',
  role: 'student',
});

// Use in API tests
const response = await request(app)
  .get('/api/profile')
  .set(headers);

// Decode token
const payload = authHelper.decodeToken(token);
```

## Best Practices

### 1. Use Factories for Test Data

```typescript
// ❌ Bad - hardcoded data
const user = {
  id: '123',
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  // ... 20 more fields
};

// ✅ Good - use factory
const user = userFactory.build({ email: 'test@test.com' });
```

### 2. Mock External Dependencies

```typescript
// ❌ Bad - calls real database
const user = await prisma.user.create({ data: userData });

// ✅ Good - mocks database
prismaMock.user.create.mockResolvedValue(userData);
const user = await userService.create(userData);
```

### 3. Generate Realistic Data

```typescript
// ❌ Bad - fake-looking data
const user = { email: 'test@test.com', firstName: 'Test' };

// ✅ Good - realistic data
const user = userFactory.build(); // Uses Faker.js
// email: 'john.doe@test.azora', firstName: 'John'
```

## Examples

### Unit Test Example

```typescript
import { userFactory, prismaMock } from '@azora/test-utils';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(prismaMock);
  });

  it('should create user with hashed password', async () => {
    const userData = userFactory.build();
    prismaMock.user.create.mockResolvedValue(userData);

    const user = await userService.create(userData);

    expect(user.password).not.toBe(userData.password);
    expect(prismaMock.user.create).toHaveBeenCalled();
  });
});
```

### Integration Test Example

```typescript
import { userFactory, authHelper } from '@azora/test-utils';
import request from 'supertest';
import { app } from './app';

describe('Auth Flow', () => {
  it('should register and login user', async () => {
    const userData = userFactory.build();

    // Register
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(registerRes.status).toBe(201);

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });
});
```

### API Test Example

```typescript
import { userFactory, authHelper } from '@azora/test-utils';
import request from 'supertest';
import { app } from './app';

describe('Protected Routes', () => {
  it('should access profile with valid token', async () => {
    const user = userFactory.build();
    const headers = authHelper.generateAuthHeader({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = await request(app)
      .get('/api/profile')
      .set(headers);

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
  });
});
```

## API Reference

### Factories

#### `userFactory`
- `build(overrides?)` - Create single user
- `buildMany(count, overrides?)` - Create multiple users
- `buildStudent(overrides?)` - Create student user
- `buildEducator(overrides?)` - Create educator user
- `buildAdmin(overrides?)` - Create admin user

#### `courseFactory`
- `build(overrides?)` - Create single course
- `buildMany(count, overrides?)` - Create multiple courses
- `buildBeginner(overrides?)` - Create beginner course
- `buildIntermediate(overrides?)` - Create intermediate course
- `buildAdvanced(overrides?)` - Create advanced course

### Mocks

#### `prismaMock`
- Type-safe Prisma client mock
- Supports all Prisma operations
- Automatic reset between tests

### Helpers

#### `authHelper`
- `generateToken(payload, expiresIn?)` - Generate JWT token
- `generateAuthHeader(payload)` - Generate Authorization header
- `decodeToken(token)` - Decode JWT token
- `createTestUser(overrides?)` - Create test user payload

## Contributing

1. Add new factories to `src/factories/`
2. Add new mocks to `src/mocks/`
3. Add new helpers to `src/helpers/`
4. Export from `src/index.ts`
5. Update this README

## License

Proprietary - Azora ES (Pty) Ltd

---

**Built with ❤️ by Q-Testing Agent**
