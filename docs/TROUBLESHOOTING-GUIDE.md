# 🔧 AZORA TROUBLESHOOTING GUIDE

## Ubuntu Approach
*"I troubleshoot because we solve together"*

## 🚨 Common Issues & Solutions

### 1. Service Health Check Failures

**Symptoms:**
- Health endpoint returns 500/503
- Service appears down in monitoring

**Resolution:**
```bash
# Check service logs
docker logs azora-<service-name>

# Restart service
docker-compose restart <service-name>

# Verify database connectivity
docker exec <service-name> node healthcheck.js
```

### 2. Database Connection Timeouts

**Symptoms:**
- "Connection timeout" errors
- Slow query responses

**Resolution:**
```bash
# Check PostgreSQL status
docker exec postgres-primary pg_isready -U azora_admin

# Monitor active connections
docker exec postgres-primary psql -U azora_admin -c "SELECT count(*) FROM pg_stat_activity;"

# Restart database if needed
docker-compose restart postgres-primary
```

### 3. Redis Cache Issues

**Symptoms:**
- Cache misses increasing
- Redis connection errors

**Resolution:**
```bash
# Check Redis status
docker exec redis-master redis-cli ping

# Monitor Redis memory
docker exec redis-master redis-cli info memory

# Clear cache if corrupted
docker exec redis-master redis-cli flushall
```

### 4. Load Balancer 502/503 Errors

**Symptoms:**
- Gateway errors
- Intermittent service unavailability

**Resolution:**
```bash
# Check Nginx configuration
docker exec nginx nginx -t

# Verify upstream health
curl -f http://azora-api-gateway:4000/health

# Reload Nginx configuration
docker exec nginx nginx -s reload
```

### 5. High Memory Usage

**Symptoms:**
- Services running slowly
- Out of memory errors

**Resolution:**
```bash
# Check memory usage per service
docker stats

# Restart memory-intensive services
docker-compose restart azora-mint azora-education

# Scale horizontally if needed
docker-compose up -d --scale azora-api-gateway=2
```

## 📊 Monitoring Queries

### Prometheus Queries
```promql
# Service uptime
up{job="azora-services"}

# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Response time 95th percentile
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Database Queries
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

-- Database size
SELECT pg_size_pretty(pg_database_size('azora_production'));
```

## 🆘 Emergency Procedures

### Complete System Failure
1. **Immediate Response:**
   - Activate backup systems
   - Notify stakeholders
   - Begin incident logging

2. **Recovery Steps:**
   ```bash
   # Stop all services
   docker-compose down
   
   # Restore from backup
   ./scripts/emergency-restore.sh
   
   # Verify system health
   ./scripts/health-check-all.sh
   ```

### Data Corruption
1. **Stop writes immediately**
2. **Assess corruption scope**
3. **Restore from latest clean backup**
4. **Verify data integrity**

## 📞 Escalation Matrix

### Level 1: Service Issues
- **Contact:** DevOps Team
- **Response Time:** 15 minutes
- **Scope:** Individual service problems

### Level 2: System-wide Issues
- **Contact:** Engineering Lead
- **Response Time:** 5 minutes
- **Scope:** Multiple service failures

### Level 3: Critical Outage
- **Contact:** CTO + Founder
- **Response Time:** Immediate
- **Scope:** Complete system down