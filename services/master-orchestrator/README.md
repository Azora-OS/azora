# Azora OS Master Orchestrator

The Master Orchestrator is the central nervous system of Azora OS, responsible for:

- **Service Discovery & Registration**: Automatically discover and register all microservices
- **Health Monitoring**: Continuous health checks for all services
- **Self-Healing**: Automatic restart and recovery of failed services
- **Load Balancing**: Distribute requests across healthy service instances
- **Dependency Management**: Track and manage service dependencies

## Features

### 🔍 Service Discovery
- Automatic service registration
- Dynamic service lookup by type or ID
- Dependency tree visualization

### 💚 Health Monitoring
- Configurable health check intervals
- Real-time health status tracking
- Performance metrics (response time, uptime, etc.)

### 🔄 Self-Healing
- Automatic service restart on failure
- Configurable retry policies
- Graceful degradation

### ⚖️ Load Balancing
Supports multiple strategies:
- Round-robin
- Least connections
- Weighted distribution
- IP hash

### 📊 Monitoring & Events
- Real-time event streaming
- Service lifecycle events
- Health status changes
- Failure alerts

## Quick Start

### Installation

```bash
cd services/master-orchestrator
npm install
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Health & Status

- `GET /health` - Orchestrator health check
- `GET /status` - Overall system status
- `GET /status/detailed` - Detailed service information

### Service Management

- `POST /services/register` - Register a new service
- `DELETE /services/:serviceId` - Unregister a service
- `GET /services` - List all services (optionally filter by type)
- `GET /services/:serviceId` - Get specific service details

### Load Balancing

- `GET /loadbalancer/:serviceType` - Get a healthy service instance for the given type

### Orchestrator Control

- `POST /orchestrator/start` - Start the orchestrator
- `POST /orchestrator/stop` - Stop the orchestrator

## Configuration

Services are configured in `src/service-config.ts`. Each service requires:

```typescript
{
  id: string;                    // Unique identifier
  name: string;                  // Human-readable name
  type: 'core' | 'b2b' | 'infrastructure';
  endpoint: string;              // Service URL
  healthCheckPath: string;       // Health check endpoint
  healthCheckInterval: number;   // Milliseconds between checks
  maxRestarts: number;           // Maximum restart attempts
  restartDelay: number;          // Delay before restart (ms)
  priority: number;              // 1-10, higher is more critical
  dependencies: string[];        // Array of service IDs
}
```

## Registered Services

### Core Services
- **Azora Aegis**: Security & authentication
- **Azora Nexus**: Data intelligence & analytics
- **Azora Mint**: Tokenization & mining
- **Azora Covenant**: Billing & record-keeping
- **Azora LMS**: Learning management system
- **Synapse Backend**: AI intelligence

### B2B Services (Horizon 1)
- **Retail AI Service**: Retail optimization
- **Cold Chain Service**: Temperature monitoring
- **Community Safety Service**: Emergency response

### Infrastructure
- **API Gateway**: Unified API entry point
- **Mining Engine**: Blockchain processing

## Environment Variables

```bash
ORCHESTRATOR_PORT=5000          # API server port

# Service endpoints
AEGIS_ENDPOINT=http://localhost:3001
NEXUS_ENDPOINT=http://localhost:3002
MINT_ENDPOINT=http://localhost:3003
COVENANT_ENDPOINT=http://localhost:3004
LMS_ENDPOINT=http://localhost:3005
SYNAPSE_ENDPOINT=http://localhost:3006
API_GATEWAY_ENDPOINT=http://localhost:3000
MINING_ENGINE_ENDPOINT=http://localhost:3007

# B2B Service endpoints
RETAIL_AI_ENDPOINT=http://localhost:4001
COLD_CHAIN_ENDPOINT=http://localhost:4002
COMMUNITY_SAFETY_ENDPOINT=http://localhost:4003
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Master Orchestrator API Server                │
│                 (Port 5000)                             │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐           ┌─────▼──────┐
    │ Service │           │   Health   │
    │Registry │           │   Check    │
    └────┬────┘           └─────┬──────┘
         │                      │
    ┌────▼────────────────┬─────▼──────┐
    │   Load Balancer     │ Self-      │
    │                     │ Healing    │
    └─────────────────────┴────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐           ┌─────▼──────┐
    │  Core   │           │    B2B     │
    │Services │           │  Services  │
    └─────────┘           └────────────┘
```

## Events

Subscribe to events using the event emitter:

```typescript
const orchestrator = new MasterOrchestrator();
const eventEmitter = orchestrator.getEventEmitter();

eventEmitter.on('healthCheck', (data) => {
  console.log(`Health check: ${data.serviceId} - ${data.status}`);
});

eventEmitter.on('serviceRestarted', (data) => {
  console.log(`Service restarted: ${data.serviceId}`);
});

eventEmitter.on('serviceFailed', (data) => {
  console.error(`Service failed: ${data.serviceId}`);
});
```

## License

MIT License - see LICENSE file for details
