# AI Orchestrator Service

The AI Orchestrator Service is responsible for coordinating and managing AI models within the Azora ecosystem. It provides a centralized interface for registering AI models, orchestrating complex AI tasks across multiple models, and monitoring performance metrics.

## Features

- AI model registration and management
- Multi-model task orchestration
- Performance monitoring and metrics
- RESTful API with comprehensive endpoints
- Health check endpoint
- Comprehensive logging
- Containerized deployment with Docker

## API Endpoints

### Health Check
- `GET /health` - Service health status

### AI Models
- `GET /api/models` - Get all registered AI models
- `GET /api/models/:modelId` - Get specific AI model
- `POST /api/models` - Register a new AI model
- `PUT /api/models/:modelId` - Update model status

### Orchestration
- `POST /api/orchestrate` - Orchestrate AI task execution
- `GET /api/orchestrate/:orchestrationId` - Get orchestration status

### Performance
- `GET /api/performance` - Get model performance metrics

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the service:
   ```bash
   npm start
   ```

## Environment Variables

- `PORT` - Port to run the service on (default: 3014)
- `LOG_LEVEL` - Logging level (default: info)

## Docker

The service includes a Dockerfile for containerized deployment:

```bash
docker build -t ai-orchestrator .
docker run -p 3014:3014 ai-orchestrator
```

## Testing

Run tests with:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

Proprietary - Azora ES (Pty) Ltd