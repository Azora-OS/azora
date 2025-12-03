# AI Ethics Monitor Service

The AI Ethics Monitor Service is responsible for monitoring and ensuring ethical compliance of AI decisions within the Azora ecosystem. It provides comprehensive ethical analysis, constitutional AI compliance checking, and violation tracking capabilities.

## Features

- AI ethics monitoring and scoring
- Constitutional AI compliance verification
- Violation detection and tracking
- Comprehensive reporting and analytics
- RESTful API with comprehensive endpoints
- Health check endpoint
- Comprehensive logging with Winston
- Containerized deployment with Docker

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Ethics Monitoring
- `POST /api/monitor` - Perform AI ethics analysis
- `GET /api/reports` - Get all ethics reports
- `GET /api/reports/:reportId` - Get specific ethics report

### Constitutional Compliance
- `POST /api/compliance` - Check constitutional AI compliance
- `GET /api/compliance-reports` - Get all compliance reports
- `GET /api/compliance-reports/:reportId` - Get specific compliance report

### Violations
- `GET /api/violations` - Get all detected violations

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

- `PORT` - Port to run the service on (default: 3010)
- `LOG_LEVEL` - Logging level (default: info)

## Docker

The service includes a Dockerfile for containerized deployment:

```bash
docker build -t ai-ethics-monitor .
docker run -p 3010:3010 ai-ethics-monitor
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

PROPRIETARY - Azora ES (Pty) Ltd