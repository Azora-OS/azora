# Monitoring-service Service

Azora OS monitoring-service microservice.

## Quick Start

```bash
npm install
npm start
```

## API Endpoints

- `GET /health` - Health check
- `GET /info` - Service information
- `GET /monitoring-service` - Get all monitoring-service
- `GET /monitoring-service/:id` - Get monitoring-service by ID
- `POST /monitoring-service` - Create monitoring-service
- `PUT /monitoring-service/:id` - Update monitoring-service
- `DELETE /monitoring-service/:id` - Delete monitoring-service

## Testing

```bash
npm test
```

## Docker

```bash
docker build -t azora-monitoring-service .
docker run -p 4000:4000 azora-monitoring-service
```