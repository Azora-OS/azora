# Security Middleware Setup Guide

This guide explains how to apply the standardized security middleware to any Azora service.

## Quick Start

### 1. Install Dependencies

```bash
npm install helmet cors express-rate-limit zod
```

### 2. Import Middleware

For TypeScript services:
```typescript
import { corsConfig, createRateLimiter, helmetConfig, errorHandler } from '../shared/middleware';
```

For JavaScript services:
```javascript
const { corsConfig, createRateLimiter, helmetConfig, errorHandler } = require('../shared/middleware');
```

### 3. Apply Middleware Stack

Add to your Express app in this order:

```javascript
const express = require('express');
const { corsConfig, createRateLimiter, helmetConfig, errorHandler } = require('../shared/middleware');

const app = express();

// Security headers
app.use(helmetConfig);

// CORS protection
app.use(corsConfig);

// Rate limiting (adjust max as needed)
app.use(createRateLimiter(100)); // 100 requests per 15 minutes

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your routes here
app.use('/api', routes);

// Error handling (must be last)
app.use(errorHandler);
```

## Configuration

### CORS
Set `CORS_ORIGIN` environment variable:
```
CORS_ORIGIN=http://localhost:3000,https://example.com
```

### Rate Limiting
Adjust the `max` parameter based on service needs:
- API Gateway: 1000 requests/15min
- Auth Service: 100 requests/15min
- Financial Services: 50 requests/15min

### Helmet
Customize CSP directives in `security.ts` if needed.

## Error Handling

Use the `AppError` class for consistent error responses:

```javascript
import { AppError } from '../shared/middleware';

app.get('/api/resource/:id', (req, res, next) => {
  const resource = findResource(req.params.id);
  if (!resource) {
    return next(new AppError(404, 'Resource not found'));
  }
  res.json(resource);
});
```

## Validation

Use Zod schemas for input validation:

```typescript
import { z } from 'zod';
import { validate } from '../shared/middleware';

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

app.post('/api/users', validate(createUserSchema), (req, res) => {
  // req.body is now validated
});
```

## Testing

All middleware is production-ready and tested. No additional configuration needed.

## Support

For issues or questions, refer to the security requirements in `.kiro/specs/security-hardening/`.
