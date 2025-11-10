# 🏗️ AZORA OS - INFRASTRUCTURE SETUP GUIDE

**Layer:** 0 - Infrastructure Foundation  
**Status:** Setup Documentation

---

## 📋 POSTGRESQL SETUP

### Development Setup

```bash
# Using Docker (Recommended)
docker run -d \
  --name azora-postgres-dev \
  -e POSTGRES_USER=azora_user \
  -e POSTGRES_PASSWORD=azora_password \
  -e POSTGRES_DB=azora_dev \
  -p 5432:5432 \
  postgres:15

# Verify connection
psql -h localhost -U azora_user -d azora_dev
```

### Environment Variables

```bash
DATABASE_URL=postgresql://azora_user:azora_password@localhost:5432/azora_dev
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### Connection Testing

```bash
# Test from Node.js
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(r => console.log(r.rows)).catch(e => console.error(e)).finally(() => pool.end());"
```

---

## 📋 REDIS SETUP

### Development Setup

```bash
# Using Docker (Recommended)
docker run -d \
  --name azora-redis-dev \
  -p 6379:6379 \
  redis:7-alpine

# Verify connection
redis-cli ping
# Should return: PONG
```

### Environment Variables

```bash
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=  # Optional for dev
```

### Connection Testing

```bash
# Test from Node.js
node -e "const redis = require('redis'); const client = redis.createClient({ url: process.env.REDIS_URL }); client.connect().then(() => client.ping()).then(r => console.log(r)).catch(e => console.error(e)).finally(() => client.quit());"
```

---

## 📋 DOCKER COMPOSE (All-in-One)

### docker-compose.dev.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: azora_user
      POSTGRES_PASSWORD: azora_password
      POSTGRES_DB: azora_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U azora_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Usage

```bash
# Start infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop infrastructure
docker-compose -f docker-compose.dev.yml down
```

---

## 📋 HEALTH CHECKS

### Database Health Check

```bash
# Test PostgreSQL
psql -h localhost -U azora_user -d azora_dev -c "SELECT 1"

# Expected: Returns 1
```

### Redis Health Check

```bash
# Test Redis
redis-cli ping

# Expected: PONG
```

### Automated Health Check Script

```bash
#!/bin/bash
# scripts/health-check-infra.sh

echo "🔍 Checking Infrastructure Health..."

# PostgreSQL
if psql -h localhost -U azora_user -d azora_dev -c "SELECT 1" > /dev/null 2>&1; then
  echo "✅ PostgreSQL: Healthy"
else
  echo "❌ PostgreSQL: Unhealthy"
  exit 1
fi

# Redis
if redis-cli ping > /dev/null 2>&1; then
  echo "✅ Redis: Healthy"
else
  echo "❌ Redis: Unhealthy"
  exit 1
fi

echo "✅ All infrastructure services healthy!"
```

---

## 📋 CONNECTION POOLING

### Prisma Configuration

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10
}
```

### Node.js Pool Configuration

```typescript
// Example: services/api-gateway/src/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 📋 TROUBLESHOOTING

### PostgreSQL Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs azora-postgres-dev

# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps | grep redis

# Check logs
docker logs azora-redis-dev

# Test connection
redis-cli -h localhost ping
```

---

## ✅ INFRASTRUCTURE VALIDATION

### Checklist

- [ ] PostgreSQL running and accessible
- [ ] Redis running and accessible
- [ ] Connection pooling configured
- [ ] Health checks passing
- [ ] Environment variables set
- [ ] Docker containers healthy

---

**"Infrastructure foundation ready. Error-free. Tested."**

---

*Part of Layer 0 - Infrastructure Foundation*
