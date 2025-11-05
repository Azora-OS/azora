# @azora/shared

**Shared utilities for all Azora services**

## Purpose

This package contains production-grade utilities that ALL Azora services MUST use:
- ✅ Structured logging (no more console.log!)
- ✅ Error handling (proper error classes)
- ✅ Express middleware (error handler, request logger)
- ✅ TypeScript types (no more 'any'!)

## Installation

```bash
# In your service directory
npm install file:../shared
# or
yarn add file:../shared
```

## Usage

### 1. Logger (Replace ALL console.log)

```typescript
import { Logger } from '@azora/shared/utils/logger';

const logger = new Logger('MyService');

// Instead of: console.log('User created', user)
logger.info('User created', { userId: user.id, email: user.email });

// Instead of: console.error('Error:', error)
logger.error('Failed to create user', error, { email: user.email });

// Debug (only shows if LOG_LEVEL=debug)
logger.debug('Processing data', { itemCount: items.length });

// Warning
logger.warn('Slow query detected', { duration: '2.5s', query: 'SELECT *' });
```

### 2. Error Classes (Replace generic Error)

```typescript
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError
} from '@azora/shared/utils/errors';

// Instead of: throw new Error('Invalid email')
throw new ValidationError('Invalid email format', { email: user.email });

// Instead of: throw new Error('User not found')
throw new NotFoundError('User', userId);

// Instead of: throw new Error('Unauthorized')
throw new UnauthorizedError('Invalid token');

// Custom app error
throw new AppError('Custom error', 500, 'CUSTOM_CODE', { detail: 'info' });
```

### 3. Express Middleware

```typescript
import express from 'express';
import { errorHandler, requestLogger, asyncHandler } from '@azora/shared/middleware';

const app = express();

// Request logging (use at the top)
app.use(requestLogger);

// Your routes
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  if (!user) {
    throw new NotFoundError('User', req.params.id);
  }
  res.json({ success: true, data: user });
}));

// Error handling (use at the bottom)
app.use(errorHandler);
```

### 4. TypeScript Types (Replace 'any')

```typescript
import {
  SuccessResponse,
  PaginatedResponse,
  HealthCheckResponse,
  BaseEntity,
  User
} from '@azora/shared/types/common';

// Instead of: async function getUsers(): Promise<any>
async function getUsers(): Promise<SuccessResponse<User[]>> {
  return {
    success: true,
    data: users,
    timestamp: new Date().toISOString()
  };
}

// Paginated results
async function getUsersPaginated(): Promise<PaginatedResponse<User>> {
  return {
    items: users,
    pagination: {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
      hasNext: true,
      hasPrevious: false
    }
  };
}
```

## Standards

### ✅ DO:
- Use `Logger` for all logging
- Use specific error classes (`ValidationError`, `NotFoundError`, etc.)
- Use `asyncHandler` for all async routes
- Use proper TypeScript types

### ❌ DON'T:
- Use `console.log`, `console.error`, `console.warn`
- Throw generic `Error('message')`
- Use `any` type
- Skip error handling

## Examples

### Before (❌ BAD):
```typescript
export class UserService {
  async createUser(data: any) {
    console.log('Creating user:', data);
    
    try {
      const user = await db.insert(data);
      console.log('User created');
      return user;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}
```

### After (✅ GOOD):
```typescript
import { Logger } from '@azora/shared/utils/logger';
import { ValidationError, DatabaseError } from '@azora/shared/utils/errors';

const logger = new Logger('UserService');

export interface CreateUserInput {
  email: string;
  name: string;
}

export class UserService {
  async createUser(data: CreateUserInput): Promise<User> {
    logger.info('Creating user', { email: data.email });
    
    if (!data.email || !data.name) {
      throw new ValidationError('Email and name are required');
    }
    
    try {
      const user = await db.users.insert(data);
      logger.info('User created successfully', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to create user', error, { email: data.email });
      throw new DatabaseError('Failed to create user', { originalError: error });
    }
  }
}
```

## Health Check Pattern

```typescript
import { HealthCheckResponse } from '@azora/shared/types/common';

app.get('/health', async (req, res) => {
  const health: HealthCheckResponse = {
    status: 'healthy',
    service: 'azora-mint',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: db.isConnected() ? 'connected' : 'disconnected',
      redis: redis.status === 'ready' ? 'connected' : 'disconnected'
    }
  };
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## Testing

```typescript
import { Logger } from '@azora/shared/utils/logger';
import { ValidationError } from '@azora/shared/utils/errors';

describe('UserService', () => {
  it('should throw ValidationError for invalid email', async () => {
    await expect(
      userService.createUser({ email: 'invalid', name: 'John' })
    ).rejects.toThrow(ValidationError);
  });
});
```

## Integration with Organism

All services using these utilities will have:
- ✅ Consistent logging format
- ✅ Consistent error responses
- ✅ Proper type safety
- ✅ Production-ready code

**This is the foundation of world-class services.** 🌟
