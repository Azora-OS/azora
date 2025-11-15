# Security Hardening - Design

## Architecture

### Shared Middleware Approach
- Centralized security logic
- Reusable across all services
- Consistent security posture
- Easy to update and maintain

### Security Layers
1. **Network Layer** - CORS, rate limiting
2. **Application Layer** - Input validation, authentication
3. **Data Layer** - Encryption, sanitization
4. **Error Layer** - Safe error handling

### Middleware Stack
```
Request → Helmet → CORS → Rate Limit → Auth → Validation → Routes → Error Handler → Response
```

## Components

### validation.ts
- Zod schema validation
- Body, query, params validation
- Type-safe error messages

### security.ts
- CORS configuration
- Rate limiter factory
- Helmet configuration

### errorHandler.ts
- AppError class
- Production-safe messages
- Error logging
