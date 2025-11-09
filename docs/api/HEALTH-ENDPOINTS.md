# Health Check Endpoints

## Overview
All Azora services implement standardized health check endpoints for monitoring and orchestration.

## Standard Health Endpoint

### GET /health

Returns the health status of the service.

**Response Format:**
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2025-01-XX",
  "version": "1.0.0",
  "uptime": 3600,
  "dependencies": {
    "database": "healthy",
    "cache": "healthy"
  }
}
```

**Status Codes:**
- `200` - Service is healthy
- `503` - Service is degraded or unhealthy

## Service-Specific Endpoints

### Chronicle Protocol
- **URL:** `http://localhost:4400/health`
- **Additional:** `/api/v1/chronicle/stats` for detailed metrics

### API Gateway
- **URL:** `http://localhost:4000/health`
- **Additional:** `/status` for service registry status

### Master Orchestrator
- **URL:** `http://localhost:5000/health`
- **Additional:** `/status` for system-wide health

## Health Aggregation

The Master System Integrator aggregates health from all services:

```typescript
const health = await masterSystem.healthCheck()
// Returns overall system health score (0-100)
```

## Monitoring Integration

Health endpoints are monitored by:
- Prometheus (metrics collection)
- Grafana (visualization)
- Self-Healing Orchestrator (auto-recovery)

## Constitutional Compliance

All health checks comply with Article XVI (No Mock Protocol):
- Real service checks only
- No simulated health data
- Production-ready implementations
