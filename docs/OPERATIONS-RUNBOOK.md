# Azora OS - Operations Runbook

**Date**: November 17, 2025  
**Purpose**: Common operational procedures  
**Audience**: Operations team

---

## 🚀 Quick Start

### Check System Health
```bash
# Validate environment
npx ts-node scripts/validate-production-env.ts

# Test external services
npx ts-node scripts/test-external-services.ts

# Run smoke tests
npm test -- tests/smoke/production-smoke-tests.ts
```

### View Logs
```bash
# API Gateway logs
kubectl logs -f deployment/api-gateway -n default

# Constitutional AI logs
kubectl logs -f deployment/constitutional-ai -n default

# Knowledge Ocean logs
kubectl logs -f deployment/knowledge-ocean -n default

# AI Routing logs
kubectl logs -f deployment/ai-routing -n default
```

### Check Metrics
```bash
# Access Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Open http://localhost:3000

# Access Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Open http://localhost:9090
```

---

## 📊 Monitoring

### Key Metrics to Watch

#### API Performance
- **http_request_duration_seconds**: Response time
- **http_requests_total**: Total requests
- **http_requests_errors_total**: Error count

#### Database Performance
- **pg_stat_statements_mean_time**: Query latency
- **pg_connections_used**: Active connections
- **pg_replication_lag_bytes**: Replication lag

#### Cache Performance
- **redis_connected_clients**: Active connections
- **redis_used_memory_bytes**: Memory usage
- **redis_evicted_keys_total**: Evicted keys

#### System Resources
- **node_cpu_seconds_total**: CPU usage
- **node_memory_MemAvailable_bytes**: Available memory
- **node_filesystem_avail_bytes**: Disk space

### Alert Thresholds

| Alert | Threshold | Action |
|-------|-----------|--------|
| High Error Rate | >5% | Check logs, investigate errors |
| High Latency | >1s | Check database, cache, external services |
| High Memory | >85% | Check for memory leaks, scale up |
| High CPU | >85% | Check for CPU-intensive operations, scale up |
| Low Disk Space | <10% | Clean up logs, scale storage |
| Database Down | N/A | Failover to replica, check connectivity |
| Redis Down | N/A | Failover to replica, check connectivity |

---

## 🔧 Common Operations

### Scaling Services

#### Scale API Gateway
```bash
kubectl scale deployment api-gateway --replicas=5 -n default
```

#### Scale Constitutional AI
```bash
kubectl scale deployment constitutional-ai --replicas=5 -n default
```

#### Scale Knowledge Ocean
```bash
kubectl scale deployment knowledge-ocean --replicas=5 -n default
```

#### Scale AI Routing
```bash
kubectl scale deployment ai-routing --replicas=5 -n default
```

### Rolling Updates

#### Update API Gateway
```bash
kubectl set image deployment/api-gateway \
  api-gateway=api-gateway:v1.1.0 \
  -n default

# Monitor rollout
kubectl rollout status deployment/api-gateway -n default
```

#### Rollback Update
```bash
kubectl rollout undo deployment/api-gateway -n default
```

### Database Operations

#### Connect to Database
```bash
kubectl exec -it postgres-0 -n default -- \
  psql -U azora_admin -d azora_production
```

#### Run Database Backup
```bash
kubectl exec postgres-0 -n default -- \
  pg_dump -U azora_admin azora_production | gzip > backup.sql.gz
```

#### Restore Database
```bash
gunzip < backup.sql.gz | \
  kubectl exec -i postgres-0 -n default -- \
  psql -U azora_admin azora_production
```

#### Check Replication Status
```bash
kubectl exec -it postgres-0 -n default -- \
  psql -U azora_admin -d azora_production \
  -c "SELECT * FROM pg_stat_replication;"
```

### Redis Operations

#### Connect to Redis
```bash
kubectl exec -it redis-cluster-0 -n default -- \
  redis-cli -a $REDIS_PASSWORD
```

#### Check Cluster Status
```bash
kubectl exec -it redis-cluster-0 -n default -- \
  redis-cli -a $REDIS_PASSWORD cluster info
```

#### Clear Cache
```bash
kubectl exec -it redis-cluster-0 -n default -- \
  redis-cli -a $REDIS_PASSWORD FLUSHALL
```

#### Monitor Redis Memory
```bash
kubectl exec -it redis-cluster-0 -n default -- \
  redis-cli -a $REDIS_PASSWORD info memory
```

---

## 🚨 Incident Response

### High Error Rate

**Symptoms**: Error rate >5%, alerts firing

**Investigation**:
```bash
# Check logs
kubectl logs -f deployment/api-gateway -n default | grep ERROR

# Check metrics
# - Error rate in Grafana
# - Error types in logs
# - Affected endpoints

# Check dependencies
# - Database connectivity
# - Redis connectivity
# - External services
```

**Resolution**:
1. Identify affected service
2. Check recent deployments
3. Review error logs
4. Check external service status
5. Rollback if necessary
6. Scale up if needed

### High Latency

**Symptoms**: Response time >1s, alerts firing

**Investigation**:
```bash
# Check database performance
kubectl exec -it postgres-0 -n default -- \
  psql -U azora_admin -d azora_production \
  -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check cache hit rate
kubectl exec -it redis-cluster-0 -n default -- \
  redis-cli -a $REDIS_PASSWORD info stats

# Check external service latency
# - Check Pinecone latency
# - Check OpenAI latency
# - Check Stripe latency
```

**Resolution**:
1. Identify slow queries
2. Optimize queries or add indexes
3. Increase cache TTL
4. Scale up services
5. Check external service status

### Database Down

**Symptoms**: Database connection errors, alerts firing

**Investigation**:
```bash
# Check pod status
kubectl get pods -n default | grep postgres

# Check pod logs
kubectl logs postgres-0 -n default

# Check replication status
kubectl exec -it postgres-0 -n default -- \
  psql -U azora_admin -d azora_production \
  -c "SELECT * FROM pg_stat_replication;"
```

**Resolution**:
1. Check pod status
2. Check disk space
3. Check memory
4. Check network connectivity
5. Failover to replica if needed
6. Restore from backup if necessary

### Redis Down

**Symptoms**: Cache connection errors, alerts firing

**Investigation**:
```bash
# Check pod status
kubectl get pods -n default | grep redis

# Check pod logs
kubectl logs redis-cluster-0 -n default

# Check cluster status
kubectl exec -it redis-cluster-0 -n default -- \
  redis-cli -a $REDIS_PASSWORD cluster info
```

**Resolution**:
1. Check pod status
2. Check disk space
3. Check memory
4. Check network connectivity
5. Failover to replica if needed
6. Restart cluster if necessary

### Memory Leak

**Symptoms**: Memory usage increasing over time, >85% threshold

**Investigation**:
```bash
# Check memory usage
kubectl top pods -n default

# Check for memory leaks
# - Review application logs
# - Check for unclosed connections
# - Check for unbounded caches

# Monitor memory over time
kubectl top pods -n default --containers
```

**Resolution**:
1. Identify memory-consuming service
2. Review recent code changes
3. Check for connection leaks
4. Check for cache issues
5. Restart service if necessary
6. Scale up if needed

---

## 🔄 Maintenance

### Daily Tasks

- [ ] Check system health
- [ ] Review error logs
- [ ] Monitor metrics
- [ ] Check backup status
- [ ] Verify replication

### Weekly Tasks

- [ ] Review performance metrics
- [ ] Check security logs
- [ ] Verify backup integrity
- [ ] Update dependencies
- [ ] Review and optimize slow queries

### Monthly Tasks

- [ ] Full system health check
- [ ] Security audit
- [ ] Capacity planning
- [ ] Performance optimization
- [ ] Disaster recovery drill

### Quarterly Tasks

- [ ] Major version updates
- [ ] Infrastructure review
- [ ] Security assessment
- [ ] Compliance audit
- [ ] Team training

---

## 📋 Checklists

### Daily Checklist
```
[ ] System health check passed
[ ] No critical alerts
[ ] Error rate <0.1%
[ ] Latency <500ms
[ ] Database replication healthy
[ ] Redis cluster healthy
[ ] Backups completed
[ ] No security incidents
```

### Weekly Checklist
```
[ ] Performance metrics reviewed
[ ] Slow queries optimized
[ ] Dependencies updated
[ ] Security logs reviewed
[ ] Capacity adequate
[ ] Team trained on changes
[ ] Documentation updated
```

### Monthly Checklist
```
[ ] Full system audit completed
[ ] Security assessment passed
[ ] Compliance verified
[ ] Disaster recovery tested
[ ] Team training completed
[ ] Performance optimized
[ ] Capacity planned
```

---

## 📞 Escalation

### Level 1: On-Call Engineer
- Responds to alerts
- Checks system health
- Reviews logs
- Attempts basic troubleshooting

### Level 2: Senior Engineer
- Investigates complex issues
- Reviews code changes
- Performs advanced troubleshooting
- Coordinates with other teams

### Level 3: Engineering Manager
- Coordinates major incidents
- Communicates with stakeholders
- Authorizes emergency changes
- Leads post-incident review

### Level 4: VP Engineering
- Handles critical incidents
- Communicates with executives
- Authorizes emergency procedures
- Leads incident review

---

## 🔗 Useful Links

### Monitoring
- Grafana: http://grafana.azora.local
- Prometheus: http://prometheus.azora.local
- AlertManager: http://alertmanager.azora.local

### Documentation
- Architecture: docs/ARCHITECTURE.md
- Deployment: docs/DEPLOYMENT-RUNBOOK.md
- Troubleshooting: docs/TROUBLESHOOTING-GUIDE.md
- Security: docs/SECURITY-POLICIES.md

### External Services
- Stripe: https://dashboard.stripe.com
- Pinecone: https://app.pinecone.io
- OpenAI: https://platform.openai.com
- SendGrid: https://app.sendgrid.com

---

## 📝 Notes

- Always check logs before making changes
- Always have a rollback plan
- Always communicate with team
- Always document changes
- Always test in staging first

---

*This runbook provides common operational procedures. For detailed information, refer to the full documentation.*

