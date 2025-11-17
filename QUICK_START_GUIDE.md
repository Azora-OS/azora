# Quick Start Guide

This guide provides instructions for running the Azora ecosystem services.

## Prerequisites

- Node.js 20+
- Docker (for containerized deployment)
- npm or yarn package manager

## Running Services Locally

### Option 1: Run Individual Services

1. Navigate to any service directory:
   ```bash
   cd services/azr-token
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the service:
   ```bash
   npm start
   ```

4. The service will be available at `http://localhost:[PORT]` where PORT is specific to each service.

### Option 2: Run with Docker

1. Build and run a specific service:
   ```bash
   cd services/azr-token
   docker build -t azora/azr-token .
   docker run -p 3011:3011 azora/azr-token
   ```

### Option 3: Run All Services with Docker Compose

1. From the root directory:
   ```bash
   docker-compose up
   ```

2. This will start all services with proper networking and port mapping.

## Service Ports

| Service | Port |
|---------|------|
| AZR Token | 3011 |
| AI Evolution Engine | 3011 |
| Analytics Dashboard | 3033 |
| Arbiter System | 3027 |
| Azora Judiciary | 3026 |
| Azora Treasury | 3028 |
| Audit Logging | 3001 |
| Tamper-Proof Data | 3002 |
| Shield Service | 3003 |
| Quantum Tracking | 3004 |
| Azora Library | 3007 |
| Billing | 3029 |
| Constitutional Court | 3025 |
| DeFi Lending | 3031 |
| Exchange Rate | 3032 |
| Lending | 3030 |

## Health Checks

All services include health check endpoints at:
```
GET /health
```

## API Documentation

Each service includes comprehensive API documentation in their respective README.md files.

## Testing

Run tests for any service:
```bash
cd services/[service-name]
npm test
```

## Environment Variables

Each service can be configured with environment variables. See the `.env.example` file in each service directory for available options.

## Development

For development with auto-reload:
```bash
cd services/[service-name]
npm run dev
```

## Troubleshooting

1. **Port Conflicts**: Ensure no other services are running on the same ports
2. **Dependency Issues**: Run `npm install` in each service directory
3. **Docker Issues**: Ensure Docker is running and properly configured

## Support

For issues or questions, please check the documentation in each service's README.md file.