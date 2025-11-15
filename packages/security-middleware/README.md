# @azora/security-middleware

Production-ready security middleware for Azora OS services.

## Features

- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ Input validation (Zod)
- ✅ Error handling

## Installation

```bash
npm install @azora/security-middleware
```

## Quick Start

```typescript
import express from 'express';
import {
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware,
  errorHandler
} from '@azora/security-middleware';

const app = express();

// Apply security middleware
app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use('/api', rateLimitMiddleware);

// Your routes here
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);
```

## Validation Example

```typescript
import { validationMiddleware } from '@azora/security-middleware';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

app.post('/login', validationMiddleware(loginSchema), loginHandler);
```

## Configuration

Set environment variables:

```env
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=production
```

## License

Proprietary - Azora ES (Pty) Ltd
