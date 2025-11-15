# Health Monitor

System monitoring with Prometheus metrics and health checks.

## Purpose
- Service health monitoring
- Prometheus metrics collection
- Uptime tracking
- Performance monitoring
- Alert management
- System diagnostics

## Setup
```bash
npm install
```

## Environment Variables
See `.env.example` for required configuration.

## Scripts
- `npm run dev` - Development server
- `npm run start` - Production server

## API Endpoints
- `GET /health` - Overall system health
- `GET /health/:service` - Service-specific health
- `GET /metrics` - Prometheus metrics
- `GET /status` - System status

## Metrics
- API response times
- Database query performance
- Error rates
- Request throughput
- System uptime
