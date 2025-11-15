# API Gateway

Unified entry point for all Azora services with routing, rate limiting, and circuit breakers.

## Purpose
- Centralized API routing
- Request/response transformation
- Rate limiting and throttling
- Circuit breaker pattern
- Authentication middleware
- Request logging

## Setup
```bash
npm install
```

## Environment Variables
See `.env.example` for required configuration.

## Scripts
- `npm run dev` - Development server
- `npm run start` - Production server
- `npm run test` - Run tests
- `npm run typecheck` - TypeScript validation

## API Routes
- `/api/auth/*` - Authentication service
- `/api/education/*` - Education service
- `/api/mint/*` - Financial service
- `/api/forge/*` - Marketplace service
- `/api/sapiens/*` - AI tutor service
- `/api/family/*` - AI family service

## Health Check
```bash
curl http://localhost:4000/health
```
