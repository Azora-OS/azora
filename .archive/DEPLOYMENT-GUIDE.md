# Azora Agent Architecture - Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 16+ with pgvector extension
- Redis 7+
- Docker & Docker Compose (optional)

## Environment Setup

### 1. Database Setup

```bash
# Install PostgreSQL with pgvector
docker run -d \
  --name azora-postgres \
  -e POSTGRES_USER=azora \
  -e POSTGRES_PASSWORD=azora \
  -e POSTGRES_DB=azora_agents \
  -p 5432:5432 \
  pgvector/pgvector:pg16

# Install Redis
docker run -d \
  --name azora-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### 2. Environment Variables

Create `.env` files in each service:

**services/agent-execution/.env**
```env
PORT=4002
DATABASE_URL=postgresql://azora:azora@localhost:5432/azora_agents
SANDBOX_ENABLED=true
USE_REDIS=true
REDIS_URL=redis://localhost:6379
```

**services/knowledge-ocean/.env**
```env
PORT=4003
DATABASE_URL=postgresql://azora:azora@localhost:5432/azora_knowledge
USE_PGVECTOR=true
INDEX_API_KEY=your-secure-key
```

**services/copilot-integration/.env**
```env
PORT=4004
TOKEN_EXPIRY_MS=3600000
```

**services/command-desk/.env**
```env
PORT=4005
```

**services/buildspaces-api/.env**
```env
PORT=4006
```

## Installation

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose -f docker-compose.agents.yml up -d

# View logs
docker-compose -f docker-compose.agents.yml logs -f

# Stop services
docker-compose -f docker-compose.agents.yml down
```

### Option 2: Manual Installation

```bash
# Install dependencies for all services
npm install

# Run migrations
cd services/agent-execution
npm run prisma:generate
npm run prisma:migrate:dev

cd ../knowledge-ocean
npm run prisma:generate
npm run prisma:migrate:dev

# Start services
cd services/agent-execution && npm run dev &
cd services/knowledge-ocean && npm run dev &
cd services/copilot-integration && npm run dev &
cd services/command-desk && npm run dev &
cd services/buildspaces-api && npm run dev &
```

## VS Code Extension

```bash
cd extensions/azora-agent-bridge
npm install
npm run compile

# Install in VS Code
# 1. Open VS Code
# 2. Go to Extensions
# 3. Click "..." menu
# 4. Select "Install from VSIX"
# 5. Choose the generated .vsix file
```

## Verification

### Health Checks

```bash
# Agent Execution
curl http://localhost:4002/health

# Knowledge Ocean
curl http://localhost:4003/health

# Copilot Integration
curl http://localhost:4004/health

# Command Desk
curl http://localhost:4005/health

# BuildSpaces API
curl http://localhost:4006/health
```

### Test Execution

```bash
# Execute a test task
curl -X POST http://localhost:4002/execute \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test","payload":{"action":"test","description":"Test task"}}'

# Index knowledge
curl -X POST http://localhost:4003/index \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secure-key" \
  -d '[{"id":"doc-1","path":"/test.md","type":"documentation","content":"Test"}]'

# Search knowledge
curl http://localhost:4003/search?q=test

# Get analytics
curl http://localhost:4002/analytics/report
```

## UI Access

```bash
# Start Azora Master dashboard
cd apps/azora-master
npm install
npm run dev

# Access at http://localhost:3000/agents
```

## Production Deployment

### 1. Build Services

```bash
# Build all services
for service in agent-execution knowledge-ocean copilot-integration command-desk buildspaces-api; do
  cd services/$service
  npm run build
  cd ../..
done
```

### 2. Configure Production Environment

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/azora
REDIS_URL=redis://prod-redis:6379
LOG_LEVEL=info
```

### 3. Deploy with Docker

```bash
# Build images
docker-compose -f docker-compose.agents.yml build

# Push to registry
docker-compose -f docker-compose.agents.yml push

# Deploy to production
docker-compose -f docker-compose.agents.yml up -d
```

## Monitoring

### Logs

```bash
# View service logs
docker-compose -f docker-compose.agents.yml logs -f agent-execution
docker-compose -f docker-compose.agents.yml logs -f knowledge-ocean
```

### Metrics

```bash
# Get resource metrics
curl http://localhost:4002/metrics

# Get analytics report
curl http://localhost:4002/analytics/report?timeRange=86400000
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL
docker exec -it azora-postgres psql -U azora -d azora_agents -c "SELECT 1;"

# Check pgvector extension
docker exec -it azora-postgres psql -U azora -d azora_agents -c "SELECT * FROM pg_extension WHERE extname='vector';"
```

### Redis Connection Issues

```bash
# Check Redis
docker exec -it azora-redis redis-cli ping
```

### Service Not Starting

```bash
# Check logs
docker-compose -f docker-compose.agents.yml logs service-name

# Restart service
docker-compose -f docker-compose.agents.yml restart service-name
```

## Scaling

### Horizontal Scaling

```bash
# Scale agent-execution service
docker-compose -f docker-compose.agents.yml up -d --scale agent-execution=3
```

### Load Balancing

Add nginx or traefik for load balancing:

```yaml
# docker-compose.agents.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
```

## Backup & Recovery

### Database Backup

```bash
# Backup PostgreSQL
docker exec azora-postgres pg_dump -U azora azora_agents > backup.sql

# Restore
docker exec -i azora-postgres psql -U azora azora_agents < backup.sql
```

### Redis Backup

```bash
# Backup Redis
docker exec azora-redis redis-cli SAVE
docker cp azora-redis:/data/dump.rdb ./redis-backup.rdb
```

## Security

1. **Change default passwords** in production
2. **Use environment variables** for secrets
3. **Enable SSL/TLS** for database connections
4. **Configure firewall rules** for service ports
5. **Implement rate limiting** at API gateway
6. **Regular security audits** via Constitutional AI

---

**Built with Ubuntu Philosophy** | **Azora ES (Pty) Ltd** | **2025**
