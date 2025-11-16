# Operational Runbooks

## Overview

This document contains runbooks for common operational scenarios. Each runbook provides step-by-step instructions for resolving issues.

**Last Updated**: November 2025  
**Audience**: Operations team, on-call engineers  
**Escalation**: See emergency contacts in DEPLOYMENT-CHECKLIST.md

---

## Table of Contents

1. [Deployment Issues](#deployment-issues)
2. [Performance Issues](#performance-issues)
3. [Database Issues](#database-issues)
4. [Security Issues](#security-issues)
5. [Incident Response](#incident-response)

---

## Deployment Issues

### RB-001: Deployment Fails to Start

**Symptoms**:
- Helm upgrade fails
- Pods stuck in Pending state
- Error messages in pod events

**Severity**: High  
**Time to Resolve**: 15-30 minutes

**Steps**:

1. **Check Helm Chart Syntax**
   ```bash
   helm lint ./helm/azora
   ```

2. **Validate Kubernetes Manifests**
   ```bash
   helm template azora ./helm/azora \
     --namespace production \
     --values helm/values-production.yaml > manifests.yaml
   kubectl apply -f manifests.yaml --dry-run=client
   ```

3. **Check Pod Events**
   ```bash
   kubectl describe pod <pod-name> -n production
   kubectl get events -n production --sort-by='.lastTimestamp'
   ```

4. **Review Pod Logs**
   ```bash
   kubectl logs <pod-name> -n production
   kubectl logs <pod-name> -n production --previous  # If pod crashed
   ```

5. **Check Resource Availability**
   ```bash
   kubectl describe nodes
   kubectl top nodes
   kubectl top pods -n production
   ```

6. **Rollback Deployment**
   ```bash
   helm rollback azora-prod 1 -n production
   kubectl rollout status deployment/api-gateway -n production
   ```

**Resolution**:
- Fix Helm chart or values
- Ensure sufficient cluster resources
- Check image availability in registry
- Verify secrets are configured

---

### RB-002: High Error Rate After Deployment

**Symptoms**:
- Error rate > 1%
- Users reporting failures
- Alerts firing

**Severity**: Critical  
**Time to Resolve**: 5-10 minutes

**Steps**:

1. **Verify Error Rate**
   ```bash
   curl -s http://localhost:9090/api/v1/query \
     --data-urlencode 'query=(sum(rate(http_requests_total{status=~"5.."}[5m])) by (job) / sum(rate(http_requests_total[5m])) by (job)) * 100'
   ```

2. **Check Service Logs**
   ```bash
   kubectl logs -n production -l app=api-gateway --tail=100
   kubectl logs -n production -l app=api-gateway --since=5m | grep -i error
   ```

3. **Identify Affected Service**
   ```bash
   kubectl logs -n production --all-containers=true --since=5m | grep -i error
   ```

4. **Check Recent Changes**
   ```bash
   git log --oneline -10
   git diff HEAD~1
   ```

5. **Trigger Rollback**
   ```bash
   helm rollback azora-prod 1 -n production
   kubectl patch service api-gateway -n production \
     -p '{"spec":{"selector":{"slot":"blue"}}}'
   ```

6. **Verify Rollback**
   ```bash
   kubectl get pods -n production -l slot=blue
   npm run health-check -- --env=production
   ```

**Resolution**:
- Identify root cause in logs
- Fix issue in code
- Test in staging
- Redeploy with fix

---

### RB-003: Pods Crashing (CrashLoopBackOff)

**Symptoms**:
- Pods in CrashLoopBackOff state
- Rapid restart cycles
- Application not starting

**Severity**: Critical  
**Time to Resolve**: 10-20 minutes

**Steps**:

1. **Check Pod Status**
   ```bash
   kubectl get pods -n production
   kubectl describe pod <pod-name> -n production
   ```

2. **Review Crash Logs**
   ```bash
   kubectl logs <pod-name> -n production
   kubectl logs <pod-name> -n production --previous
   ```

3. **Check Environment Variables**
   ```bash
   kubectl exec -it <pod-name> -n production -- env | grep -E "DATABASE|JWT|STRIPE"
   ```

4. **Verify Secrets**
   ```bash
   kubectl get secrets -n production
   kubectl describe secret azora-secrets -n production
   ```

5. **Check Resource Limits**
   ```bash
   kubectl describe pod <pod-name> -n production | grep -A 5 "Limits"
   ```

6. **Increase Restart Delay**
   ```bash
   kubectl patch deployment api-gateway -n production \
     -p '{"spec":{"template":{"spec":{"restartPolicy":"OnFailure"}}}}'
   ```

7. **Rollback Deployment**
   ```bash
   helm rollback azora-prod 1 -n production
   ```

**Resolution**:
- Fix startup issue (missing env vars, config, etc.)
- Increase resource limits if needed
- Verify secrets are configured
- Test locally before redeploying

---

## Performance Issues

### RB-004: High API Latency

**Symptoms**:
- API response time > 100ms
- Users experiencing slow responses
- Performance alerts firing

**Severity**: Medium  
**Time to Resolve**: 20-30 minutes

**Steps**:

1. **Check Current Latency**
   ```bash
   curl -s http://localhost:9090/api/v1/query \
     --data-urlencode 'query=histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (job, le))'
   ```

2. **Identify Slow Endpoints**
   ```bash
   kubectl logs -n production -l app=api-gateway --since=10m | grep "duration"
   ```

3. **Check Database Query Time**
   ```bash
   curl -s http://localhost:9090/api/v1/query \
     --data-urlencode 'query=histogram_quantile(0.95, sum(rate(db_query_duration_ms_bucket[5m])) by (le))'
   ```

4. **Review Database Connections**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT count(*) FROM pg_stat_activity;"
   ```

5. **Check Resource Usage**
   ```bash
   kubectl top pods -n production
   kubectl top nodes
   ```

6. **Analyze Slow Queries**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
   ```

7. **Optimize or Scale**
   - Add database indexes
   - Optimize queries
   - Increase pod replicas
   - Increase resource limits

**Resolution**:
- Identify bottleneck (API, database, or resource)
- Optimize code or queries
- Scale horizontally if needed
- Monitor after changes

---

### RB-005: High Memory Usage

**Symptoms**:
- Memory usage > 80%
- Pods being OOM killed
- Memory alerts firing

**Severity**: High  
**Time to Resolve**: 15-25 minutes

**Steps**:

1. **Check Memory Usage**
   ```bash
   kubectl top pods -n production
   kubectl top pods -n production --sort-by=memory
   ```

2. **Identify Memory Leak**
   ```bash
   kubectl logs <pod-name> -n production --tail=100 | grep -i "memory\|gc"
   ```

3. **Check Memory Limits**
   ```bash
   kubectl describe pod <pod-name> -n production | grep -A 5 "Limits"
   ```

4. **Increase Memory Limit**
   ```bash
   kubectl set resources deployment api-gateway \
     --limits=memory=1Gi \
     -n production
   ```

5. **Monitor Memory Trend**
   ```bash
   kubectl top pods -n production -w
   ```

6. **Restart Pod if Necessary**
   ```bash
   kubectl rollout restart deployment/api-gateway -n production
   ```

**Resolution**:
- Increase memory limits
- Fix memory leak in code
- Implement garbage collection
- Monitor memory usage

---

### RB-006: High CPU Usage

**Symptoms**:
- CPU usage > 80%
- Slow response times
- CPU alerts firing

**Severity**: Medium  
**Time to Resolve**: 20-30 minutes

**Steps**:

1. **Check CPU Usage**
   ```bash
   kubectl top pods -n production
   kubectl top pods -n production --sort-by=cpu
   ```

2. **Identify CPU-Intensive Process**
   ```bash
   kubectl exec -it <pod-name> -n production -- top -b -n 1
   ```

3. **Check CPU Limits**
   ```bash
   kubectl describe pod <pod-name> -n production | grep -A 5 "Limits"
   ```

4. **Increase CPU Limit**
   ```bash
   kubectl set resources deployment api-gateway \
     --limits=cpu=1000m \
     -n production
   ```

5. **Scale Horizontally**
   ```bash
   kubectl scale deployment api-gateway --replicas=5 -n production
   ```

6. **Optimize Code**
   - Profile CPU usage
   - Optimize algorithms
   - Reduce unnecessary processing

**Resolution**:
- Increase CPU limits
- Scale horizontally
- Optimize code
- Monitor CPU usage

---

## Database Issues

### RB-007: Database Connection Pool Exhausted

**Symptoms**:
- Connection pool errors
- "too many connections" errors
- Database unavailable

**Severity**: Critical  
**Time to Resolve**: 10-15 minutes

**Steps**:

1. **Check Connection Pool Status**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT count(*) FROM pg_stat_activity;"
   ```

2. **List Active Connections**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT pid, usename, application_name, state FROM pg_stat_activity;"
   ```

3. **Kill Idle Connections**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < now() - interval '10 minutes';"
   ```

4. **Increase Connection Pool Size**
   ```bash
   # Update environment variable
   kubectl set env deployment/api-gateway \
     DATABASE_POOL_SIZE=50 \
     -n production
   ```

5. **Restart Pods**
   ```bash
   kubectl rollout restart deployment/api-gateway -n production
   ```

6. **Monitor Connection Pool**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT count(*) FROM pg_stat_activity;" -w
   ```

**Resolution**:
- Increase connection pool size
- Fix connection leaks in code
- Optimize query performance
- Monitor connection usage

---

### RB-008: Slow Database Queries

**Symptoms**:
- Database query time > 50ms
- Slow API responses
- Database alerts firing

**Severity**: Medium  
**Time to Resolve**: 30-45 minutes

**Steps**:

1. **Check Query Performance**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
   ```

2. **Analyze Slow Query**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';"
   ```

3. **Check Indexes**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;"
   ```

4. **Create Missing Indexes**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "CREATE INDEX idx_users_email ON users(email);"
   ```

5. **Vacuum and Analyze**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "VACUUM ANALYZE;"
   ```

6. **Monitor Query Performance**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;" -w
   ```

**Resolution**:
- Add indexes to frequently queried columns
- Optimize query logic
- Implement query caching
- Monitor query performance

---

### RB-009: Database Replication Lag

**Symptoms**:
- Replication lag > 1 second
- Read replicas out of sync
- Data consistency issues

**Severity**: High  
**Time to Resolve**: 15-25 minutes

**Steps**:

1. **Check Replication Status**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT slot_name, restart_lsn, confirmed_flush_lsn FROM pg_replication_slots;"
   ```

2. **Check Replica Lag**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;"
   ```

3. **Check Network Connectivity**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- ping -c 5 replica-db.internal
   ```

4. **Restart Replication**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT pg_wal_replay_resume();"
   ```

5. **Monitor Replication Lag**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- psql -c "SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;" -w
   ```

**Resolution**:
- Check network connectivity
- Increase replication bandwidth
- Optimize write workload
- Monitor replication lag

---

## Security Issues

### RB-010: Suspicious Activity Detected

**Symptoms**:
- Unusual traffic patterns
- Failed authentication attempts
- Security alerts firing

**Severity**: High  
**Time to Resolve**: 10-20 minutes

**Steps**:

1. **Check Security Logs**
   ```bash
   kubectl logs -n production -l app=api-gateway --since=1h | grep -i "auth\|security\|failed"
   ```

2. **Identify Attack Source**
   ```bash
   kubectl logs -n production -l app=api-gateway --since=1h | grep "failed" | awk '{print $NF}' | sort | uniq -c | sort -rn
   ```

3. **Block Suspicious IP**
   ```bash
   kubectl exec -it deployment/api-gateway -n production \
     -- iptables -A INPUT -s <suspicious-ip> -j DROP
   ```

4. **Enable Rate Limiting**
   ```bash
   kubectl set env deployment/api-gateway \
     RATE_LIMIT_ENABLED=true \
     RATE_LIMIT_REQUESTS=100 \
     RATE_LIMIT_WINDOW=60 \
     -n production
   ```

5. **Review Access Logs**
   ```bash
   kubectl logs -n production -l app=api-gateway --since=1h | tail -100
   ```

6. **Notify Security Team**
   - Document incident
   - Provide logs and evidence
   - Implement additional monitoring

**Resolution**:
- Block malicious IPs
- Enable rate limiting
- Implement WAF rules
- Monitor for similar activity

---

### RB-011: Vulnerability Detected

**Symptoms**:
- Security scan finds vulnerability
- CVE alert received
- Dependency vulnerability

**Severity**: High  
**Time to Resolve**: 1-4 hours

**Steps**:

1. **Identify Vulnerability**
   ```bash
   npm audit
   npm audit --json | jq '.vulnerabilities'
   ```

2. **Check Severity**
   ```bash
   npm audit --json | jq '.metadata.vulnerabilities'
   ```

3. **Update Vulnerable Package**
   ```bash
   npm update <package-name>
   npm audit fix
   ```

4. **Test Changes**
   ```bash
   npm test
   npm run build
   ```

5. **Deploy Fix**
   ```bash
   git commit -m "fix: patch security vulnerability"
   git push
   # Trigger deployment
   ```

6. **Verify Fix**
   ```bash
   npm audit
   ```

**Resolution**:
- Update vulnerable packages
- Test thoroughly
- Deploy fix
- Monitor for similar issues

---

## Incident Response

### RB-012: Production Outage

**Symptoms**:
- Service completely unavailable
- All users affected
- Critical business impact

**Severity**: Critical  
**Time to Resolve**: < 5 minutes

**Steps**:

1. **Declare Incident**
   - Notify incident commander
   - Open incident channel
   - Start incident timer

2. **Assess Impact**
   ```bash
   kubectl get pods -n production
   kubectl get services -n production
   npm run health-check -- --env=production
   ```

3. **Identify Root Cause**
   ```bash
   kubectl logs -n production --all-containers=true --since=5m | grep -i error
   kubectl describe nodes
   kubectl top nodes
   ```

4. **Implement Immediate Fix**
   - Rollback deployment
   - Scale up resources
   - Restart services
   - Switch to backup

5. **Communicate Status**
   - Update status page
   - Notify stakeholders
   - Provide ETA

6. **Restore Service**
   ```bash
   helm rollback azora-prod 1 -n production
   kubectl rollout status deployment/api-gateway -n production
   npm run health-check -- --env=production
   ```

7. **Post-Incident**
   - Document timeline
   - Identify root cause
   - Create action items
   - Schedule retrospective

**Resolution**:
- Restore service immediately
- Investigate root cause
- Implement preventive measures
- Update runbooks

---

### RB-013: Partial Service Degradation

**Symptoms**:
- Some services slow or unavailable
- Partial user impact
- Cascading failures

**Severity**: High  
**Time to Resolve**: 15-30 minutes

**Steps**:

1. **Identify Affected Service**
   ```bash
   kubectl get pods -n production
   kubectl logs -n production --all-containers=true --since=5m | grep -i error
   ```

2. **Check Service Dependencies**
   ```bash
   kubectl describe service <service-name> -n production
   kubectl get endpoints <service-name> -n production
   ```

3. **Isolate Issue**
   - Check logs
   - Check metrics
   - Check resource usage
   - Check external dependencies

4. **Implement Workaround**
   - Scale up affected service
   - Increase resource limits
   - Enable caching
   - Route traffic elsewhere

5. **Fix Root Cause**
   - Optimize code
   - Fix database issue
   - Update configuration
   - Deploy fix

6. **Monitor Recovery**
   ```bash
   kubectl logs -n production -l app=<service> -w
   kubectl top pods -n production -w
   ```

**Resolution**:
- Restore affected service
- Investigate root cause
- Implement fix
- Monitor for recurrence

---

## Escalation Procedures

### Level 1: On-Call Engineer
- Acknowledge alert
- Assess severity
- Implement immediate fix
- Document actions

### Level 2: Service Owner
- Investigate root cause
- Implement permanent fix
- Update runbooks
- Communicate with team

### Level 3: Engineering Manager
- Coordinate response
- Allocate resources
- Communicate with stakeholders
- Schedule retrospective

### Level 4: Executive
- Notify customers
- Manage communications
- Allocate budget for fixes
- Review incident response

---

## Related Documents

- [Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Performance Monitoring](./PERFORMANCE-MONITORING-SETUP.md)

