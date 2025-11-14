# Azora OS Deployment Guide

## Quick Start

### Local Development
```bash
docker-compose up -d
```

### Production Deployment
```bash
./infrastructure/scripts/deploy-service.sh api-gateway production v1.0.0
```

## Prerequisites

- Docker 24+
- Kubernetes 1.28+
- kubectl configured
- Node.js 20+

## Deployment Options

### 1. Docker Compose (Development/Staging)
```bash
cp .env.example .env
docker-compose -f docker-compose.production.yml up -d
```

### 2. Kubernetes (Production)
```bash
# Deploy service
./infrastructure/scripts/deploy-service.sh <service-name> production <version>

# Example
./infrastructure/scripts/deploy-service.sh api-gateway production v1.0.0
```

## Service Configuration

Each service requires a `deploy.env` file:

```bash
# services/api-gateway/deploy.env
PORT=4000
COMPONENT=gateway
REPLICAS=3
MEMORY_REQUEST=256Mi
CPU_REQUEST=100m
MEMORY_LIMIT=512Mi
CPU_LIMIT=500m
MIN_REPLICAS=2
MAX_REPLICAS=10
```

## Monitoring

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3100 (admin/admin)

## Rollback

```bash
kubectl rollout undo deployment/<service-name> -n azora-production
```
