# 🌐 API Gateway

**Version**: 1.0.0  
**Port**: 4000  
**Status**: ✅ Production Ready

## Overview

Unified API Gateway providing request routing, health monitoring, rate limiting, and centralized access to all Azora OS microservices.

## Features

- ✅ Request routing to microservices
- ✅ Health check aggregation
- ✅ Global rate limiting (1000 req/15min)
- ✅ Request logging
- ✅ Auto-retry on proxy errors
- ✅ CORS configuration
- ✅ Security headers

## Routes

### Auth Service Routes
- `/api/auth/*` → Auth Service (port 4001)

### Education Service Routes
- `/api/courses/*` → Education Service (port 4002)
- `/api/enrollments/*` → Education Service (port 4002)

### Payment Service Routes
- `/api/wallet` → Payment Service (port 4003)
- `/api/transactions` → Payment Service (port 4003)
- `/api/earn` → Payment Service (port 4003)
- `/api/payments` → Payment Service (port 4003)
- `/api/refunds` → Payment Service (port 4003)

### Gateway Endpoints
- `GET /health` - Aggregated health check
- `GET /api` - API documentation

## Environment Variables

```bash
AUTH_SERVICE_URL=http://localhost:4001
EDUCATION_SERVICE_URL=http://localhost:4002
PAYMENT_SERVICE_URL=http://localhost:4003
ALLOWED_ORIGINS=*
PORT=4000
NODE_ENV=production
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Testing

```bash
npm test
```

**Test Coverage**: 78.78% (3/3 tests passing)

## Dependencies

- express - Web framework
- http-proxy-middleware - Request proxying
- helmet - Security headers
- cors - CORS handling
- express-rate-limit - Rate limiting
- winston - Logging

## Health Check

The gateway aggregates health status from all services:

```json
{
  "service": "api-gateway",
  "status": "healthy",
  "services": {
    "gateway": "healthy",
    "auth": "healthy",
    "education": "healthy",
    "payment": "healthy"
  },
  "timestamp": "2025-11-12T13:00:00.000Z"
}
```

## Rate Limiting

- Global: 1000 requests per 15 minutes per IP
- Per-service limits also apply
- Returns 429 when exceeded

## Request Flow

```
Client → API Gateway → Service
         ↓
      Logging
      Rate Limit
      CORS
      Security Headers
```

## Deployment

See `/production/DEPLOYMENT-GUIDE.md` for deployment instructions.

### Production Configuration

```bash
# Set service URLs to production endpoints
AUTH_SERVICE_URL=https://azora-auth-service.vercel.app
EDUCATION_SERVICE_URL=https://azora-education-service.vercel.app
PAYMENT_SERVICE_URL=https://azora-payment-service.vercel.app
ALLOWED_ORIGINS=https://azora.world,https://app.azora.world
```

## License

Proprietary - Azora ES (Pty) Ltd
