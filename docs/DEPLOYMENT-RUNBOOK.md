# 🚀 AZORA PRODUCTION DEPLOYMENT RUNBOOK

## Ubuntu Philosophy
*"I deploy because we succeed together"*

## 📋 Pre-Deployment Checklist

### ✅ Environment Verification
```bash
# 1. Verify all environment variables
node scripts/validate-env.js

# 2. Run security audit
npm run security:audit

# 3. Execute smoke tests
node scripts/production-smoke-tests.js

# 4. Verify test coverage
npm run test:coverage
```

### ✅ Infrastructure Setup
```bash
# 1. Deploy database cluster
docker-compose -f infrastructure/database/production-db-setup.yml up -d

# 2. Deploy Redis cluster
docker-compose -f infrastructure/redis/redis-cluster.yml up -d

# 3. Start monitoring stack
docker-compose -f infrastructure/monitoring/docker-compose.yml up -d

# 4. Deploy load balancer
docker-compose -f infrastructure/nginx/docker-compose.yml up -d
```

### ✅ Service Deployment
```bash
# 1. Build all services
npm run build

# 2. Deploy core services
docker-compose -f docker-compose.prod.yml up -d

# 3. Verify service health
./scripts/health-check-all.sh

# 4. Run production smoke tests
node scripts/production-smoke-tests.js
```

## 🔄 Rollback Procedures

### Emergency Rollback
```bash
# 1. Stop current deployment
docker-compose -f docker-compose.prod.yml down

# 2. Restore previous version
docker-compose -f docker-compose.prod.backup.yml up -d

# 3. Verify rollback success
./scripts/health-check-all.sh
```

### Database Rollback
```bash
# 1. Stop services
docker-compose down

# 2. Restore database backup
pg_restore -h localhost -U azora_admin -d azora_production /backups/latest.sql

# 3. Restart services
docker-compose up -d
```

## 🚨 Troubleshooting

### Service Not Starting
1. Check logs: `docker logs <service_name>`
2. Verify environment variables
3. Check database connectivity
4. Verify port availability

### Database Connection Issues
1. Check PostgreSQL status: `docker exec postgres-primary pg_isready`
2. Verify credentials in environment
3. Check network connectivity
4. Review connection pool settings

### Load Balancer Issues
1. Check Nginx status: `docker exec nginx nginx -t`
2. Verify SSL certificates
3. Check upstream health
4. Review access logs

## 📊 Monitoring & Alerts

### Key Metrics to Monitor
- Service uptime (target: 99.9%)
- Response time (target: <200ms)
- Error rate (target: <1%)
- Database connections
- Memory usage
- CPU utilization

### Alert Thresholds
- Critical: Service down >1 minute
- Warning: Response time >500ms
- Info: High memory usage >80%