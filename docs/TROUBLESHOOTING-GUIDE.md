# Azora OS Troubleshooting Guide

## Common Issues and Solutions

### API Gateway Issues

#### Issue: API Gateway not responding

**Symptoms**: `curl https://api.azora.io` returns connection refused

**Diagnosis**:
```bash
# Check if pod is running
kubectl get pods -n production | grep api-gateway

# Check pod logs
kubectl logs -l app=api-gateway -n production --tail=100

# Check service
kubectl get svc api-gateway -n production
```

**Solutions**:
1. Restart the pod: `kubectl delete pod -l app=api-gateway -n production`
2. Check resource limits: `kubectl describe pod -l app=api-gateway -n production`
3. Verify environment variables: `kubectl get secrets -n production`
4. Check load balancer: `kubectl get svc nginx-lb -n production`

#### Issue: High response times (>500ms)

**Diagnosis**:
```bash
# Check CPU usage
kubectl top pod -l app=api-gateway -n production

# Check memory usage
kubectl describe pod -l app=api-gateway -n production

# Check database connections
kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production -c "SELECT count(*) FROM pg_stat_activity;"
```

**Solutions**:
1. Scale up replicas: `kubectl scale deployment api-gateway --replicas=5 -n production`
2. Increase resource limits in deployment
3. Check database query performance: `EXPLAIN ANALYZE SELECT ...`
4. Clear cache: `kubectl exec -it redis-0 -n production -- redis-cli FLUSHALL`

### Database Issues

#### Issue: Database connection refused

**Symptoms**: `psql: could not connect to server`

**Diagnosis**:
```bash
# Check if PostgreSQL is running
kubectl get statefulset postgres -n production

# Check pod logs
kubectl logs postgres-0 -n production

# Check PVC
kubectl get pvc -n production
```

**Solutions**:
1. Restart PostgreSQL: `kubectl delete pod postgres-0 -n production`
2. Check disk space: `kubectl exec -it postgres-0 -n production -- df -h`
3. Verify PVC is bound: `kubectl describe pvc postgres-pvc -n production`
4. Check PostgreSQL configuration: `kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production -c "SHOW max_connections;"`

#### Issue: Slow database queries

**Diagnosis**:
```bash
# Enable query logging
kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"

# Check slow queries
kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

**Solutions**:
1. Create indexes: `CREATE INDEX idx_users_email ON users(email);`
2. Analyze query plans: `EXPLAIN ANALYZE SELECT ...`
3. Increase work_mem: `ALTER SYSTEM SET work_mem = '256MB';`
4. Vacuum and analyze: `VACUUM ANALYZE;`

### Redis Issues

#### Issue: Redis connection refused

**Symptoms**: `redis-cli: Could not connect to Redis`

**Diagnosis**:
```bash
# Check if Redis is running
kubectl get statefulset redis -n production

# Check pod logs
kubectl logs redis-0 -n production

# Check cluster status
kubectl exec -it redis-0 -n production -- redis-cli cluster info
```

**Solutions**:
1. Restart Redis: `kubectl delete pod redis-0 -n production`
2. Check cluster nodes: `kubectl exec -it redis-0 -n production -- redis-cli cluster nodes`
3. Verify network connectivity: `kubectl exec -it redis-0 -n production -- ping redis-1`

#### Issue: High memory usage

**Diagnosis**:
```bash
# Check memory usage
kubectl exec -it redis-0 -n production -- redis-cli info memory

# Check key sizes
kubectl exec -it redis-0 -n production -- redis-cli --bigkeys
```

**Solutions**:
1. Increase maxmemory: Edit redis.conf and increase `maxmemory 2gb`
2. Change eviction policy: `CONFIG SET maxmemory-policy allkeys-lru`
3. Clear old keys: `redis-cli FLUSHDB`
4. Monitor key expiration: `redis-cli MONITOR`

### Constitutional AI Issues

#### Issue: Validation latency >200ms

**Diagnosis**:
```bash
# Check service logs
kubectl logs -l app=constitutional-ai -n production --tail=100

# Check resource usage
kubectl top pod -l app=constitutional-ai -n production

# Check validation metrics
curl https://api.azora.io/constitutional/metrics
```

**Solutions**:
1. Scale up replicas: `kubectl scale deployment constitutional-ai --replicas=5 -n production`
2. Increase resource limits
3. Cache validation rules: Implement rule caching
4. Optimize validators: Profile and optimize slow validators

#### Issue: Low compliance rate (<95%)

**Diagnosis**:
```bash
# Check compliance metrics
curl https://api.azora.io/constitutional/compliance

# Check violation logs
kubectl logs -l app=constitutional-ai -n production | grep "violation"

# Check audit logs
kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production -c "SELECT * FROM constitutional_audit_logs ORDER BY timestamp DESC LIMIT 10;"
```

**Solutions**:
1. Review validation rules: Check if rules are too strict
2. Tune bias detection: Adjust bias detection thresholds
3. Review false positives: Analyze violations that shouldn't be flagged
4. Update validators: Improve validator accuracy

### Knowledge Ocean Issues

#### Issue: Retrieval latency >100ms

**Diagnosis**:
```bash
# Check service logs
kubectl logs -l app=knowledge-ocean -n production --tail=100

# Check Pinecone connectivity
curl https://api.pinecone.io/actions/whoami -H "Api-Key: $PINECONE_API_KEY"

# Check retrieval metrics
curl https://api.azora.io/knowledge-ocean/metrics
```

**Solutions**:
1. Optimize vector index: Rebuild Pinecone index
2. Increase batch size: Retrieve more documents at once
3. Cache embeddings: Implement embedding cache
4. Scale up service: Increase replicas

#### Issue: 70/30 rule not enforced

**Diagnosis**:
```bash
# Check retrieval results
curl -X POST https://api.azora.io/knowledge-ocean/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'

# Analyze source distribution
# Check if internal/external ratio is 70/30
```

**Solutions**:
1. Review retriever logic: Check 70/30 enforcement code
2. Verify document metadata: Ensure source is correctly tagged
3. Check document count: Ensure enough internal/external docs
4. Adjust weights: Tune retrieval weights

### AI Routing Issues

#### Issue: Routing decision >50ms

**Diagnosis**:
```bash
# Check routing metrics
curl https://api.azora.io/ai-routing/metrics

# Check tier selection logic
kubectl logs -l app=ai-routing -n production | grep "tier_selected"
```

**Solutions**:
1. Cache routing decisions: Implement decision cache
2. Optimize classifier: Profile query classifier
3. Simplify rules: Reduce routing rule complexity
4. Scale up service: Increase replicas

#### Issue: Cache hit rate <40%

**Diagnosis**:
```bash
# Check cache statistics
curl https://api.azora.io/ai-routing/cache/stats

# Check cache keys
kubectl exec -it redis-0 -n production -- redis-cli KEYS "*"

# Check TTL
kubectl exec -it redis-0 -n production -- redis-cli TTL "cache-key"
```

**Solutions**:
1. Increase TTL: Extend cache expiration time
2. Improve query normalization: Normalize queries before hashing
3. Increase cache size: Allocate more Redis memory
4. Analyze query patterns: Identify cacheable queries

### Monitoring Issues

#### Issue: Prometheus not scraping metrics

**Diagnosis**:
```bash
# Check Prometheus targets
kubectl port-forward svc/prometheus 9090:9090 -n production
# Navigate to http://localhost:9090/targets

# Check Prometheus logs
kubectl logs -l app=prometheus -n production
```

**Solutions**:
1. Verify service endpoints: Check if services are exposing metrics
2. Update scrape config: Edit prometheus-config ConfigMap
3. Restart Prometheus: `kubectl delete pod -l app=prometheus -n production`

#### Issue: Grafana dashboards not updating

**Diagnosis**:
```bash
# Check Grafana logs
kubectl logs -l app=grafana -n production

# Verify data source
# In Grafana UI: Configuration > Data Sources > Prometheus
```

**Solutions**:
1. Verify Prometheus connection: Test data source
2. Check dashboard queries: Verify PromQL syntax
3. Increase refresh rate: Set dashboard refresh to 5s
4. Restart Grafana: `kubectl delete pod -l app=grafana -n production`

### Security Issues

#### Issue: SSL/TLS certificate expired

**Diagnosis**:
```bash
# Check certificate expiration
openssl x509 -in /etc/nginx/ssl/cert.pem -noout -dates

# Check certificate in browser
# HTTPS warning or error
```

**Solutions**:
1. Renew certificate: `certbot renew`
2. Update Kubernetes secret: `kubectl create secret tls nginx-ssl-certs --cert=cert.pem --key=key.pem -n production --dry-run=client -o yaml | kubectl apply -f -`
3. Restart Nginx: `kubectl delete pod -l app=nginx-lb -n production`

#### Issue: Rate limiting not working

**Diagnosis**:
```bash
# Check rate limiting middleware
kubectl logs -l app=api-gateway -n production | grep "rate_limit"

# Test rate limiting
for i in {1..100}; do curl https://api.azora.io/health; done
```

**Solutions**:
1. Verify middleware is enabled: Check API Gateway configuration
2. Check Redis connection: Verify rate limit store is accessible
3. Adjust limits: Modify rate limit thresholds
4. Restart service: `kubectl delete pod -l app=api-gateway -n production`

## Performance Tuning

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_queries_user_id ON queries(user_id);
CREATE INDEX idx_audit_logs_timestamp ON constitutional_audit_logs(timestamp);

-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Vacuum and analyze
VACUUM ANALYZE;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Redis Optimization

```bash
# Monitor commands
redis-cli MONITOR

# Check memory usage
redis-cli INFO memory

# Optimize memory
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Check key sizes
redis-cli --bigkeys

# Analyze key patterns
redis-cli --scan --pattern "*"
```

### Kubernetes Optimization

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n production

# Adjust resource requests/limits
kubectl set resources deployment api-gateway -n production --requests=cpu=500m,memory=512Mi --limits=cpu=1000m,memory=1Gi

# Enable horizontal pod autoscaling
kubectl autoscale deployment api-gateway -n production --min=3 --max=10 --cpu-percent=70
```

## Emergency Procedures

### Service Down

1. Check pod status: `kubectl get pods -n production`
2. Check logs: `kubectl logs -l app=<service> -n production --tail=100`
3. Restart pod: `kubectl delete pod -l app=<service> -n production`
4. If still down, rollback: Follow rollback procedure

### Database Down

1. Check PostgreSQL status: `kubectl get statefulset postgres -n production`
2. Check logs: `kubectl logs postgres-0 -n production`
3. Restart: `kubectl delete pod postgres-0 -n production`
4. If still down, restore from backup

### Redis Down

1. Check Redis status: `kubectl get statefulset redis -n production`
2. Check cluster: `kubectl exec -it redis-0 -n production -- redis-cli cluster info`
3. Restart: `kubectl delete pod redis-0 -n production`
4. Reinitialize cluster if needed

### Complete System Failure

1. Assess damage: Check all services and data
2. Activate disaster recovery: Restore from backups
3. Notify stakeholders: Communicate status
4. Post-incident review: Document what happened and why

## Support Resources

- **Kubernetes**: https://kubernetes.io/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Redis**: https://redis.io/documentation
- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/
- **Nginx**: https://nginx.org/en/docs/

## Escalation Path

1. **Level 1**: On-call engineer
2. **Level 2**: Infrastructure team lead
3. **Level 3**: CTO / Engineering director
4. **Level 4**: CEO (for critical incidents)
