# Azora OS Configuration System

This directory contains centralized configuration and security utilities for the entire Azora OS platform.

## 📁 Files

### `env.ts` - Environment Configuration
Centralized environment variable management with type-safe validation using Zod.

**Usage:**
```typescript
import { getServerEnv, getClientEnv, getSharedEnv } from '@/config/env';

// Server-side only
const serverConfig = getServerEnv();
console.log(serverConfig.DATABASE_URL);

// Client-side safe
const clientConfig = getClientEnv();
console.log(clientConfig.NEXT_PUBLIC_APP_URL);

// Shared configuration
const sharedConfig = getSharedEnv();
console.log(sharedConfig.ENABLE_LEARN_TO_EARN);
```

**Benefits:**
- ✅ Type-safe environment variables
- ✅ Automatic validation on startup
- ✅ Clear separation between server and client vars
- ✅ Prevents accidental exposure of secrets

### `security.ts` - Security Utilities
Comprehensive security utilities including input validation, sanitization, and CORS configuration.

**Input Validation:**
```typescript
import { userEmailSchema, validateAndSanitize } from '@/config/security';

const email = validateAndSanitize(userEmailSchema, req.body.email);
```

**Sanitization:**
```typescript
import { sanitizeHtml } from '@/config/security';

const safeContent = sanitizeHtml(userInput);
```

**CORS Configuration:**
```typescript
import { getAllowedOrigins } from '@/config/security';

const origins = getAllowedOrigins(process.env.NODE_ENV);
```

**Features:**
- ✅ Pre-defined validation schemas for common inputs
- ✅ XSS prevention through HTML sanitization
- ✅ SQL injection prevention
- ✅ Rate limiting configurations
- ✅ Security headers
- ✅ Content Security Policy

### `errors.ts` - Error Handling System
Standardized error handling with consistent error codes and responses.

**Usage:**
```typescript
import { UnauthorizedError, ValidationError, asyncHandler } from '@/config/errors';

// In route handlers
app.get('/api/protected', asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new UnauthorizedError('Please log in');
  }
  
  // Your logic here
}));

// Validation errors
throw new ValidationError('Invalid email', { field: 'email' });
```

**Error Codes:**
- 1000-1099: Authentication & Authorization
- 1100-1199: Validation
- 1200-1299: Resource Management
- 1300-1399: Payment & Financial
- 1400-1499: Rate Limiting
- 1500-1599: Server Errors
- 1600-1699: Business Logic
- 1700-1799: Blockchain

## 🚀 Quick Start

### 1. Environment Setup
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

### 2. Validate Configuration
The configuration is automatically validated when you import any of the config modules:
```typescript
import { getAllEnv } from '@/config/env';

// This will throw an error if any required env vars are missing
const config = getAllEnv();
```

### 3. Use Security Utilities
Apply input validation and sanitization in all API endpoints:
```typescript
import { validateAndSanitize, userEmailSchema } from '@/config/security';

app.post('/api/register', asyncHandler(async (req, res) => {
  const email = validateAndSanitize(userEmailSchema, req.body.email);
  // Email is now validated and sanitized
}));
```

## 🔒 Security Best Practices

### Never Commit Secrets
- ✅ Use `.env.local` for local development
- ✅ Use environment variables in production
- ✅ Never commit `.env` files to Git
- ✅ Use the `getServerEnv()` function to ensure secrets stay server-side

### Input Validation
- ✅ Always validate user input using the provided schemas
- ✅ Sanitize HTML content before storing or displaying
- ✅ Use parameterized queries for database operations

### Rate Limiting
- ✅ Apply rate limiting to all public endpoints
- ✅ Use stricter limits for authentication endpoints
- ✅ Monitor and adjust limits based on usage patterns

### Error Handling
- ✅ Use the standardized error classes
- ✅ Never expose internal error details in production
- ✅ Log all errors for monitoring
- ✅ Return consistent error responses

## 📖 Integration Examples

### Express.js API
```typescript
import express from 'express';
import { errorHandlerMiddleware } from '@/config/errors';
import { getAllowedOrigins, securityHeaders } from '@/config/security';

const app = express();

// Apply security headers
app.use((req, res, next) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});

// Your routes here

// Error handler (must be last)
app.use(errorHandlerMiddleware);
```

### Next.js API Route
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { asyncHandler, ValidationError } from '@/config/errors';
import { validateAndSanitize, userEmailSchema } from '@/config/security';

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const email = validateAndSanitize(userEmailSchema, req.body.email);
  
  // Your logic here
  
  res.status(200).json({ success: true });
});
```

### GraphQL Resolver
```typescript
import { UnauthorizedError, NotFoundError } from '@/config/errors';

const resolvers = {
  Query: {
    user: async (_parent, { id }, context) => {
      if (!context.userId) {
        throw new UnauthorizedError();
      }
      
      const user = await getUserById(id);
      if (!user) {
        throw new NotFoundError('User');
      }
      
      return user;
    },
  },
};
```

## 🧪 Testing

All configuration modules include built-in validation. To test:

```typescript
// Test environment validation
import { getAllEnv } from '@/config/env';

try {
  const config = getAllEnv();
  console.log('✅ Configuration valid');
} catch (error) {
  console.error('❌ Configuration error:', error);
}

// Test input validation
import { userEmailSchema } from '@/config/security';

const testEmail = 'test@example.com';
const result = userEmailSchema.safeParse(testEmail);
console.log(result.success ? '✅ Valid' : '❌ Invalid');
```

## 📚 Further Reading

- [Zod Documentation](https://zod.dev/) - Schema validation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Security best practices
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) - CSP guide
