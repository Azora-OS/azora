# Azora Nexus Subscription Service

Subscription and pricing management service for Azora OS.

## Overview

This service provides subscription management and pricing calculation functionality for the Azora Nexus platform. It acts as a proxy to the main subscription service with fallback capabilities.

## Features

- ✅ Pricing tier management
- ✅ Subscription calculation
- ✅ Health check endpoint
- ✅ Rate limiting
- ✅ Request logging
- ✅ Error handling
- ✅ Graceful shutdown

## Installation

```bash
npm install
```

## Configuration

Set the following environment variables:

- `PORT` - Service port (default: 4129)
- `HOST` - Service host (default: 0.0.0.0)
- `SUBSCRIPTION_SERVICE_URL` - Main subscription service URL (default: http://localhost:4129)
- `CORS_ORIGIN` - Allowed CORS origin
- `NODE_ENV` - Environment (development/production/test)

## Usage

### Start the service

```bash
npm start
```

### Development

```bash
npm run dev
```

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "subscription",
  "timestamp": "2025-01-XX...",
  "uptime": 123.456
}
```

### `GET /api/subscription/pricing`

Get pricing tiers and services.

**Response:**
```json
{
  "platformTiers": [...],
  "services": [...],
  "fallback": false
}
```

### `POST /api/subscription/calculate`

Calculate subscription pricing.

**Request Body:**
```json
{
  "tier": "starter",
  "services": ["service1", "service2"],
  "applyDiscount": true,
  "isStudent": false,
  "countryCode": "ZA"
}
```

**Response:**
```json
{
  "basePrice": 2500,
  "finalPrice": 1875,
  "currency": "USD",
  "formatted": {
    "final": "$1,875.00"
  }
}
```

## Error Handling

The service includes comprehensive error handling:

- **400 Bad Request**: Invalid request body
- **500 Internal Server Error**: Service unavailable
- **504 Gateway Timeout**: Request timeout

## Architecture

This service acts as a proxy to the main subscription service. If the main service is unavailable, it falls back to a default pricing configuration.

## Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation

## Testing

```bash
npm test
```

## Docker

```bash
docker build -t azora-nexus-subscription .
docker run -p 4129:4129 azora-nexus-subscription
```

## License

AZORA PROPRIETARY LICENSE - Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

