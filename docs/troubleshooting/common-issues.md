# Troubleshooting Guide

## Common Issues and Solutions

### Service Connection Issues

#### Problem: Service Unavailable (503)
**Symptoms:**
- API returns 503 Service Unavailable
- Health checks failing
- Timeouts on requests

**Diagnosis:**
```bash
# Check service status
kubectl get pods -n azora-services
kubectl describe pod <pod-name>
kubectl logs <pod-name> --tail=50
```

**Solutions:**
1. **Resource Limits**: Increase CPU/memory limits
2. **Health Check**: Verify health endpoint responds
3. **Dependencies**: Check database/Redis connectivity
4. **Restart**: `kubectl rollout restart deployment/<service>`

#### Problem: Database Connection Errors
**Symptoms:**
- "Connection refused" errors
- "Too many connections" errors
- Slow query responses

**Diagnosis:**
```bash
# Check database status
kubectl get pods -n azora-system -l app=postgres
kubectl logs postgres-primary-0

# Check connections
kubectl exec -it postgres-primary-0 -- psql -c "SELECT count(*) FROM pg_stat_activity;"
```

**Solutions:**
1. **Connection Pool**: Increase pool size in services
2. **Database Resources**: Scale database resources
3. **Query Optimization**: Identify and optimize slow queries
4. **Failover**: Switch to read replica if primary fails

### Authentication Issues

#### Problem: JWT Token Errors
**Symptoms:**
- "Invalid token" errors
- "Token expired" errors
- Authentication failures

**Diagnosis:**
```bash
# Check auth service logs
kubectl logs -l app=auth-service --tail=100

# Verify token structure
echo "JWT_TOKEN" | base64 -d
```

**Solutions:**
1. **Token Refresh**: Implement token refresh mechanism
2. **Clock Sync**: Ensure server time synchronization
3. **Secret Rotation**: Update JWT secrets if compromised
4. **Session Cleanup**: Clear expired sessions from Redis

#### Problem: OAuth Integration Failures
**Symptoms:**
- OAuth redirect errors
- "Invalid client" errors
- Authorization code issues

**Solutions:**
1. **Callback URLs**: Verify OAuth callback URLs
2. **Client Credentials**: Check OAuth client ID/secret
3. **Scope Permissions**: Ensure proper OAuth scopes
4. **SSL Certificate**: Verify HTTPS configuration

### Performance Issues

#### Problem: High Response Times
**Symptoms:**
- API responses > 2 seconds
- Timeout errors
- Poor user experience

**Diagnosis:**
```bash
# Check service metrics
kubectl top pods -n azora-services
curl -s http://prometheus:9090/api/v1/query?query=http_request_duration_seconds

# Check database performance
kubectl exec -it postgres-primary-0 -- psql -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

**Solutions:**
1. **Caching**: Implement Redis caching for frequent queries
2. **Database Indexing**: Add indexes for slow queries
3. **Connection Pooling**: Optimize database connections
4. **Load Balancing**: Scale horizontally with more replicas

#### Problem: Memory Leaks
**Symptoms:**
- Increasing memory usage over time
- Out of memory errors
- Pod restarts due to memory limits

**Diagnosis:**
```bash
# Monitor memory usage
kubectl top pods -n azora-services
kubectl describe pod <pod-name> | grep -A 5 "Limits\|Requests"

# Check for memory leaks in logs
kubectl logs <pod-name> | grep -i "memory\|heap\|gc"
```

**Solutions:**
1. **Memory Profiling**: Use Node.js memory profiler
2. **Garbage Collection**: Tune GC settings
3. **Resource Limits**: Set appropriate memory limits
4. **Code Review**: Check for memory leaks in code

### Network Issues

#### Problem: Service Discovery Failures
**Symptoms:**
- "Service not found" errors
- DNS resolution failures
- Intermittent connectivity

**Diagnosis:**
```bash
# Check service endpoints
kubectl get endpoints -n azora-services
kubectl get services -n azora-services

# Test DNS resolution
kubectl exec -it <pod-name> -- nslookup auth-service.azora-services.svc.cluster.local
```

**Solutions:**
1. **Service Labels**: Verify service selector labels match pods
2. **DNS Configuration**: Check CoreDNS configuration
3. **Network Policies**: Review NetworkPolicy rules
4. **Service Mesh**: Verify Istio sidecar injection

#### Problem: Load Balancer Issues
**Symptoms:**
- Uneven traffic distribution
- Health check failures
- SSL certificate errors

**Diagnosis:**
```bash
# Check load balancer status
kubectl get services -o wide
kubectl describe service nginx-lb-service

# Check SSL certificates
kubectl get secrets -n azora-system | grep tls
openssl x509 -in cert.pem -text -noout
```

**Solutions:**
1. **Health Checks**: Fix failing health check endpoints
2. **SSL Renewal**: Renew expired SSL certificates
3. **Backend Configuration**: Verify upstream server configuration
4. **Traffic Routing**: Review NGINX configuration

### Data Issues

#### Problem: Data Inconsistency
**Symptoms:**
- Conflicting data between services
- Missing records
- Duplicate entries

**Diagnosis:**
```bash
# Check database consistency
kubectl exec -it postgres-primary-0 -- psql -c "SELECT COUNT(*) FROM users;"
kubectl exec -it postgres-primary-0 -- psql -c "SELECT COUNT(*) FROM transactions WHERE status = 'pending';"

# Check Kafka lag
kubectl exec -it kafka-0 -- kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group education-service
```

**Solutions:**
1. **Event Replay**: Replay Kafka events to sync data
2. **Data Migration**: Run data consistency scripts
3. **Transaction Boundaries**: Implement proper transaction scopes
4. **Eventual Consistency**: Accept eventual consistency model

#### Problem: Backup Failures
**Symptoms:**
- Backup jobs failing
- Missing backup files
- Corruption in backups

**Diagnosis:**
```bash
# Check backup job status
kubectl get cronjobs -n azora-system
kubectl get jobs -n azora-system | grep backup

# Verify backup integrity
aws s3 ls s3://azora-backups/database/
kubectl logs -l job-name=postgres-backup
```

**Solutions:**
1. **Storage Space**: Ensure sufficient backup storage
2. **Permissions**: Verify S3 access permissions
3. **Backup Testing**: Regularly test backup restoration
4. **Monitoring**: Set up backup failure alerts

## Diagnostic Commands

### Service Health
```bash
# Check all services
kubectl get pods -A
kubectl get services -A
kubectl top nodes

# Service-specific health
curl -f http://api-gateway:4000/health
curl -f http://auth-service:4001/health
```

### Database Diagnostics
```bash
# Connection status
kubectl exec -it postgres-primary-0 -- psql -c "\conninfo"
kubectl exec -it postgres-primary-0 -- psql -c "SELECT * FROM pg_stat_activity;"

# Performance metrics
kubectl exec -it postgres-primary-0 -- psql -c "SELECT * FROM pg_stat_database;"
```

### Cache Diagnostics
```bash
# Redis cluster status
kubectl exec -it redis-cluster-0 -- redis-cli cluster nodes
kubectl exec -it redis-cluster-0 -- redis-cli info memory

# Cache hit rates
kubectl exec -it redis-cluster-0 -- redis-cli info stats | grep hit
```

## Emergency Procedures

### Service Outage Response
1. **Assess Impact**: Determine affected services and users
2. **Immediate Mitigation**: Scale up healthy replicas
3. **Root Cause Analysis**: Investigate logs and metrics
4. **Communication**: Update status page and notify users
5. **Resolution**: Apply fixes and verify recovery

### Data Recovery
1. **Stop Writes**: Prevent further data corruption
2. **Assess Damage**: Determine scope of data loss
3. **Restore from Backup**: Use latest clean backup
4. **Replay Events**: Apply Kafka events since backup
5. **Verify Integrity**: Validate restored data consistency

### Security Incident Response
1. **Isolate**: Block suspicious traffic/users
2. **Investigate**: Analyze logs for attack vectors
3. **Contain**: Limit blast radius of incident
4. **Remediate**: Apply security patches/fixes
5. **Monitor**: Enhanced monitoring post-incident