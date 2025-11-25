# 🛡️ Aegis Premium - Deployment Guide

## Quick Deploy

```bash
# 1. Clone and navigate
cd services/azora-aegis

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Deploy with Docker
docker-compose -f docker-compose.premium.yml up -d

# 4. Verify deployment
curl http://localhost:4010/health
```

## Manual Deployment

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build TypeScript
npm run build

# Start production server
npm start
```

## Environment Setup

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PORT` - Server port (default: 4010)
- `JWT_SECRET` - JWT signing secret
- `ENCRYPTION_KEY` - Data encryption key

## Health Checks

```bash
# Basic health
curl http://localhost:4010/health

# Security metrics
curl http://localhost:4010/api/metrics

# Active incidents
curl http://localhost:4010/api/incidents/active
```

## Monitoring

Access monitoring dashboards:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3100 (admin/aegis_admin)

## Security Hardening

1. Change default passwords in docker-compose.premium.yml
2. Enable SSL/TLS certificates
3. Configure firewall rules
4. Set up log rotation
5. Enable automated backups

## Scaling

```bash
# Scale Aegis instances
docker-compose -f docker-compose.premium.yml up -d --scale aegis-premium=3
```

## Troubleshooting

```bash
# View logs
docker-compose -f docker-compose.premium.yml logs -f aegis-premium

# Restart service
docker-compose -f docker-compose.premium.yml restart aegis-premium

# Database migrations
docker-compose -f docker-compose.premium.yml exec aegis-premium npx prisma migrate deploy
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring dashboards accessible
- [ ] Backup strategy implemented
- [ ] Alert notifications configured
- [ ] Rate limiting enabled
- [ ] Firewall rules applied
- [ ] Health checks passing
- [ ] Load balancer configured (if applicable)
