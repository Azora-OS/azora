# Service Integration Guide

## Overview
Guide for integrating new services into the Azora OS ecosystem.

## Integration Checklist

### 1. Service Registration
Register your service with the Master System Integrator:

```typescript
// In master-system-integrator.ts
this.services.set('your-service', yourService)
```

### 2. Health Check Implementation
Implement the standard health check interface:

```typescript
export const yourService = {
  async healthCheck() {
    return {
      status: 'healthy' | 'degraded' | 'unhealthy'
    }
  }
}
```

### 3. Event Bus Integration
Connect to the nervous system for event-driven communication:

```typescript
import { nervousSystem } from '../core/synapse/event-bus'

nervousSystem.emitTyped('your.event', { data })
nervousSystem.onTyped('system.ready', handler)
```

### 4. Constitutional Compliance
Ensure compliance with Article XVI (No Mock Protocol):
- No mock implementations
- No placeholder code
- Production-ready only

### 5. API Gateway Registration
Add your service to the API Gateway service registry:

```javascript
// In services/api-gateway/index.js
'your-service': { 
  urls: [process.env.YOUR_SERVICE_URL || 'http://localhost:PORT'], 
  weight: 1 
}
```

## Service Template

```typescript
/**
 * YOUR SERVICE NAME
 * Brief description
 */

export interface YourServiceConfig {
  port: number
  // ... config
}

export class YourService {
  async initialize() {
    // Setup logic
  }

  async healthCheck() {
    return { status: 'healthy' }
  }

  async shutdown() {
    // Cleanup logic
  }
}

export const yourService = new YourService()
```

## Testing Integration

```bash
# Test health endpoint
curl http://localhost:PORT/health

# Test via API Gateway
curl http://localhost:4000/api/your-service/endpoint

# Check Master System status
curl http://localhost:5000/status
```

## Documentation Requirements

1. Service README with:
   - Purpose and functionality
   - API endpoints
   - Configuration options
   - Dependencies

2. API documentation in `/docs/api/`

3. Integration examples

## Support

For integration support, see:
- [Master Context](/MASTER-CONTEXT.md)
- [Architecture Guide](/docs/ARCHITECTURE.md)
- [API Documentation](/docs/api/)
