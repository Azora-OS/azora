# Library Utilities

This directory contains shared utility libraries used across the Azora OS platform.

## Available Libraries

### Logger (`logger.ts`)
Centralized logging utility using Winston. Replaces console.log statements.

**Usage**:
```typescript
import { log } from './lib/logger';

log.info('Service started', { port: 3001 });
log.error('Error occurred', { error: error.message });
log.warn('Warning message');
log.debug('Debug information');
```

### Environment Validation (`env-validation.ts`)
Type-safe environment variable validation using Zod.

**Usage**:
```typescript
import { getEnv, validateEnv } from './lib/env-validation';

// Validate and get environment
const env = getEnv();
const port = env.PORT;

// Or validate explicitly
validateEnv();
```

### Security Middleware (`middleware/security.ts`)
Standardized security middleware for Express applications.

**Usage**:
```typescript
import { 
  getHelmetConfig, 
  getCorsConfig, 
  createRateLimiter,
  securityHeaders,
  requestLogger 
} from './lib/middleware/security';

app.use(getHelmetConfig());
app.use(getCorsConfig());
app.use(securityHeaders);
app.use(requestLogger);
app.use('/api', createRateLimiter());
```

### Swagger/OpenAPI Config (`swagger.config.ts`)
OpenAPI specification configuration for API documentation.

**Usage**:
```typescript
import { swaggerSpec } from './lib/swagger.config';
import swaggerUi from 'swagger-ui-express';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

## Migration Guide

### Replacing console.log

**Before**:
```javascript
console.log('User logged in:', userId);
console.error('Database error:', error);
```

**After**:
```typescript
import { log } from './lib/logger';

log.info('User logged in', { userId });
log.error('Database error', { error: error.message });
```

### Adding Environment Validation

**Before**:
```javascript
const port = process.env.PORT || 3001;
```

**After**:
```typescript
import { getEnv } from './lib/env-validation';

const env = getEnv();
const port = env.PORT; // Type-safe with validation
```

