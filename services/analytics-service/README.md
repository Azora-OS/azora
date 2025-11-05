# Analytics Service

Analytics and data processing service built with Go.

## Overview

The Analytics Service provides data analytics, metrics collection, and insights generation for the Azora OS platform. It processes events, generates reports, and provides real-time analytics.

## Technology Stack

- **Language**: Go
- **Build System**: Nx
- **Containerization**: Docker

## Building

```bash
# Using Nx
nx build analytics-service

# Or directly with Go
cd services/analytics-service
go build -o main .
```

## Running

```bash
./analytics-service
```

## Docker

```bash
docker build -t analytics-service .
docker run -p 8080:8080 analytics-service
```

## Health Check

The service includes a healthcheck endpoint at `/health`.

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

