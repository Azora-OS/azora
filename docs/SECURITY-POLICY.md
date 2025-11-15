# Security Policy

## Overview

Azora OS implements comprehensive security measures across all services following OWASP Top 10 guidelines and industry best practices.

## Security Measures

### 1. CORS (Cross-Origin Resource Sharing)
- Configured origin whitelist
- Credentials support enabled
- Specific methods allowed
- Custom headers controlled

### 2. Security Headers (Helmet.js)
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### 3. Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable via environment variables
- Standard headers included
- Prevents brute force attacks

### 4. CSRF Protection
- Token-based protection
- Cookie-based implementation
- Required for state-changing operations

### 5. Input Validation
- Zod schema validation
- Type-safe validation
- Detailed error messages
- Sanitization included

### 6. Error Handling
- No stack traces in production
- Consistent error format
- Proper status codes
- Logging integration

## Implementation

### Install Security Middleware
```bash
npm install @azora/security-middleware
```

### Basic Usage
```typescript
import {
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware,
  errorHandler
} from '@azora/security-middleware';

app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use('/api', rateLimitMiddleware);
app.use(errorHandler);
```

### With Validation
```typescript
import { validationMiddleware } from '@azora/security-middleware';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

app.post('/users', validationMiddleware(userSchema), createUser);
```

## Environment Variables

```env
# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Environment
NODE_ENV=production
```

## Reporting Vulnerabilities

Email: security@azora.world  
Response Time: 24 hours  
PGP Key: Available on request

## Compliance

- OWASP Top 10
- GDPR Ready
- SOC 2 Type II (in progress)
