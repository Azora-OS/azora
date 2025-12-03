# AI Orchestrator Service

> **Constitutional AI Coordination Hub** - Orchestrates AI model execution with ethical guardrails

[![Status](https://img.shields.io/badge/status-production-success.svg)](../../docs/STATUS-DASHBOARD.md)
[![Port](https://img.shields.io/badge/port-3014-blue.svg)](#configuration)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](#testing)

## Overview

The AI Orchestrator is the central coordination service for all AI operations in the Azora ecosystem. It manages AI model registration, task orchestration, performance monitoring, and constitutional AI compliance.

### Key Features

- **Multi-Model Orchestration**: Coordinate multiple AI models for complex tasks
- **Constitutional AI Integration**: Built-in ethical guardrails and self-critique
- **Performance Monitoring**: Real-time tracking of model performance metrics
- **Dynamic Model Registration**: Register and manage AI models at runtime
- **Task Queue Management**: Asynchronous task processing with status tracking

## Architecture

```mermaid
graph TB
    Client[Client Applications] --> Gateway[API Gateway]
    Gateway --> Orchestrator[AI Orchestrator]
    Orchestrator --> Models[AI Models]
    Orchestrator --> Constitutional[Constitutional AI]
    Orchestrator --> Performance[Performance Monitor]
    Orchestrator --> DB[(Database)]
    
    Models --> Model1[Language Model]
    Models --> Model2[Vision Model]
    Models --> Model3[Code Model]
```

## API Endpoints

### Model Management

#### `GET /api/models`
List all registered AI models.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "model-1",
      "name": "Constitutional AI Assistant",
      "type": "language",
      "version": "1.0.0",
      "status": "active",
      "capabilities": ["text_generation", "question_answering", "ethical_reasoning"]
    }
  ],
  "count": 1
}
```

#### `GET /api/models/:modelId`
Get details of a specific AI model.

**Parameters:**
- `modelId` (string): Unique model identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "model-1",
    "name": "Constitutional AI Assistant",
    "type": "language",
    "version": "1.0.0",
    "status": "active",
    "capabilities": ["text_generation", "question_answering", "ethical_reasoning"],
    "metadata": {
      "provider": "azora",
      "endpoint": "https://ai.azora.world/v1"
    }
  }
}
```

#### `POST /api/models`
Register a new AI model.

**Request Body:**
```json
{
  "name": "New AI Model",
  "type": "language",
  "version": "1.0.0",
  "capabilities": ["text_generation"],
  "metadata": {
    "provider": "azora",
    "endpoint": "https://ai.azora.world/v1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "model-xyz",
    "name": "New AI Model",
    "status": "active",
    "createdAt": "2025-11-25T18:00:00.000Z"
  }
}
```

#### `PUT /api/models/:modelId`
Update model status.

**Request Body:**
```json
{
  "status": "inactive"
}
```

### Task Orchestration

#### `POST /api/orchestrate`
Orchestrate an AI task across multiple models.

**Request Body:**
```json
{
  "taskId": "task-123",
  "models": ["model-1", "model-2"],
  "inputData": {
    "prompt": "Analyze this code for security issues",
    "code": "function example() { ... }"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "orch-abc-123",
    "status": "pending",
    "message": "Orchestration started"
  }
}
```

#### `GET /api/orchestrate/:orchestrationId`
Get orchestration status and results.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "orch-abc-123",
    "taskId": "task-123",
    "models": ["model-1", "model-2"],
    "status": "completed",
    "result": {
      "taskId": "task-123",
      "output": "Analysis complete",
      "confidence": 0.95
    },
    "createdAt": "2025-11-25T18:00:00.000Z",
    "updatedAt": "2025-11-25T18:00:05.000Z"
  }
}
```

### Constitutional AI

#### `POST /api/constitutional/critique`
Submit an AI action for constitutional critique.

**Request Body:**
```json
{
  "action": "generate_code",
  "context": {
    "prompt": "Create a user authentication system",
    "output": "Generated code..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "critique-xyz",
    "verdict": "approved",
    "score": 0.92,
    "violations": [],
    "recommendations": ["Consider adding rate limiting"],
    "timestamp": "2025-11-25T18:00:00.000Z"
  }
}
```

### Performance Monitoring

#### `GET /api/performance`
Get aggregated performance metrics for all models.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "modelId": "model-1",
      "totalRequests": 1500,
      "avgLatency": 245,
      "successRate": 0.98,
      "lastUpdated": "2025-11-25T18:00:00.000Z"
    }
  ]
}
```

### Health Check

#### `GET /health`
Service health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "ai-orchestrator",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": "2025-11-25T18:00:00.000Z"
}
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Service port | `3014` | No |
| `NODE_ENV` | Environment | `development` | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `LOG_LEVEL` | Logging level | `info` | No |
| `CONSTITUTIONAL_AI_ENDPOINT` | Constitutional AI service URL | - | Yes |

### Example `.env` File

```bash
PORT=3014
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/azora
JWT_SECRET=your-secret-key-here
LOG_LEVEL=info
CONSTITUTIONAL_AI_ENDPOINT=http://localhost:3015
```

## Database Schema

The service uses Prisma ORM with PostgreSQL. Key models:

```prisma
model AIModel {
  id           String   @id @default(uuid())
  name         String
  type         String
  version      String
  status       String
  capabilities String[]
  metadata     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Orchestration {
  id        String   @id @default(uuid())
  taskId    String
  models    String[]
  status    String
  result    Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Dependencies

### Core Services
- **azora-auth**: Authentication and authorization
- **constitutional-ai**: Ethical AI guardrails
- **azora-api-gateway**: API routing and rate limiting

### External Dependencies
- PostgreSQL 14+
- Node.js 20+
- Redis (for caching)

## Development

### Local Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Testing

### Unit Tests
- Model registration logic
- Orchestration algorithms
- Performance metric calculations

### Integration Tests
- API endpoint validation
- Database operations
- Inter-service communication

### Test Coverage
- **Lines**: 85%
- **Functions**: 90%
- **Branches**: 80%

## Deployment

### Docker

```bash
# Build image
docker build -t azora/ai-orchestrator:latest .

# Run container
docker run -p 3014:3014 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  azora/ai-orchestrator:latest
```

### Docker Compose

```yaml
services:
  ai-orchestrator:
    build: .
    ports:
      - "3014:3014"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
```

## Monitoring

### Health Checks
- Endpoint: `GET /health`
- Interval: 30 seconds
- Timeout: 5 seconds

### Metrics
- Request count and latency
- Model performance statistics
- Error rates and types
- Constitutional AI compliance scores

### Logging
Uses Winston for structured logging:
- **info**: General operational messages
- **warn**: Non-critical issues
- **error**: Critical failures requiring attention

## Troubleshooting

### Common Issues

**Service won't start**
- Check DATABASE_URL is valid
- Ensure PostgreSQL is running
- Verify all required environment variables are set

**High latency**
- Check model endpoint availability
- Review database query performance
- Monitor Redis cache hit rate

**Constitutional AI failures**
- Verify constitutional-ai service is running
- Check network connectivity
- Review critique request payload

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## License

Proprietary - Azora ES (Pty) Ltd

---

**Ubuntu Philosophy**: "My intelligence enables our collective wisdom"