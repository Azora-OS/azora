# Azora Operations Runbook

## On-Call Procedures

### On-Call Schedule
- **Primary**: Rotates weekly
- **Secondary**: Backup on-call
- **Escalation**: CTO (critical issues only)

### Alert Response Times
- **Critical**: 15 minutes
- **High**: 1 hour
- **Medium**: 4 hours
- **Low**: Next business day

## Incident Response

### 1. Service Down

**Symptoms:**
- Health check failures
- 5xx errors
- No response from service

**Investigation:**
```bash
# Check pod status
kubectl get pods -n azora-production

# Check pod logs
kubectl logs -f deployment/azora-api-gateway -n azora-production --tail=100

# Check recent events
kubectl get events -n azora-production --sort-by='.lastTimestamp'
```

**Resolution:**
```bash
# Restart deployment
kubectl rollout restart deployment/azora-api-gateway -n azora-production

# If persists, rollback
./infrastructure/helm/scripts/rollback.sh azora-production

# Verify recovery
kubectl get pods -n azora-production
curl https://api.azora.world/health
```

### 2. High Error Rate

**Symptoms:**
- Error rate > 5%
- Increased 4xx/5xx responses
- User complaints

**Investigation:**
```bash
# Check error logs
kubectl logs -f deployment/azora-api-gateway -n azora-production | grep ERROR

# Check Grafana dashboard
# Open: https://grafana.azora.world/d/service-health

# Check Sentry for error patterns
# Open: https://sentry.io/azora
```

**Resolution:**
```bash
# If code issue, rollback
./infrastructure/helm/scripts/rollback.sh azora-production

# If external service issue, enable circuit breaker
kubectl set env deployment/azora-api-gateway CIRCUIT_BREAKER_ENABLED=true -n azora-production

# If database issue, check connections
kubectl exec -n azora-production postgres-0 -- psql -U azora -c "SELECT count(*) FROM pg_stat_activity;"
```

### 3. High Latency

**Symptoms:**
- Response time > 200ms (p95)
- Slow page loads
- Timeout errors

**Investigation:**
```bash
# Check resource usage
kubectl top pods -n azora-production

# Check database performance
kubectl exec -n azora-production postgres-0 -- psql -U azora -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check Redis performance
kubectl exec -n azora-production redis-0 -- redis-cli INFO stats
```

**Resolution:**
```bash
# Scale up if resource constrained
kubectl scale deployment azora-api-gateway --replicas=6 -n azora-production

# Clear cache if stale
kubectl exec -n azora-production redis-0 -- redis-cli FLUSHDB

# Restart slow service
kubectl rollout restart deployment/azora-education -n azora-production
```

### 4. Database Issues

**Symptoms:**
- Connection errors
- Slow queries
- Replication lag

**Investigation:**
```bash
# Check database status
kubectl exec -n azora-production postgres-0 -- psql -U azora -c "SELECT * FROM pg_stat_replication;"

# Check connections
kubectl exec -n azora-production postgres-0 -- psql -U azora -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
kubectl exec -n azora-production postgres-0 -- psql -U azora -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

**Resolution:**
```bash
# Kill long-running queries
kubectl exec -n azora-production postgres-0 -- psql -U azora -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';"

# Restart database (last resort)
kubectl delete pod postgres-0 -n azora-production

# Verify replication
kubectl exec -n azora-production postgres-0 -- psql -U azora -c "SELECT * FROM pg_stat_replication;"
```

### 5. Out of Memory

**Symptoms:**
- OOMKilled pods
- Frequent restarts
- Memory alerts

**Investigation:**
```bash
# Check memory usage
kubectl top pods -n azora-production

# Check pod events
kubectl describe pod <pod-name> -n azora-production

# Check memory limits
kubectl get deployment azora-api-gateway -n azora-production -o yaml | grep -A 5 resources
```

**Resolution:**
```bash
# Increase memory limits
kubectl set resources deployment azora-api-gateway --limits=memory=1Gi -n azora-production

# Restart deployment
kubectl rollout restart deployment/azora-api-gateway -n azora-production

# Monitor memory usage
kubectl top pods -n azora-production -w
```

## Common Tasks

### Deploy New Version

```bash
# 1. Verify staging deployment successful
kubectl get pods -n azora-staging

# 2. Create production backup
kubectl exec -n azora-production postgres-0 -- pg_dump -U azora > backup-$(date +%Y%m%d-%H%M%S).sql

# 3. Deploy to production
./infrastructure/helm/scripts/deploy-production.sh

# 4. Monitor deployment
kubectl rollout status deployment/azora-api-gateway -n azora-production

# 5. Run smoke tests
npm run test:smoke:production

# 6. Monitor for 15 minutes
# Watch Grafana dashboards
# Check error rates
# Verify user traffic
```

### Scale Service

```bash
# Scale up
kubectl scale deployment azora-api-gateway --replicas=6 -n azora-production

# Scale down
kubectl scale deployment azora-api-gateway --replicas=3 -n azora-production

# Verify scaling
kubectl get pods -n azora-production -w
```

### Update Configuration

```bash
# Update ConfigMap
kubectl edit configmap azora-config -n azora-production

# Restart deployment to pick up changes
kubectl rollout restart deployment/azora-api-gateway -n azora-production

# Verify configuration
kubectl exec -n azora-production <pod-name> -- env | grep CONFIG
```

### Rotate Secrets

```bash
# 1. Create new secret
kubectl create secret generic new-secret --from-literal=key=value -n azora-production

# 2. Update deployment to use new secret
kubectl set env deployment/azora-api-gateway --from=secret/new-secret -n azora-production

# 3. Verify deployment
kubectl rollout status deployment/azora-api-gateway -n azora-production

# 4. Delete old secret
kubectl delete secret old-secret -n azora-production
```

### Database Backup

```bash
# Manual backup
kubectl exec -n azora-production postgres-0 -- pg_dump -U azora > backup-$(date +%Y%m%d-%H%M%S).sql

# Upload to cloud storage
aws s3 cp backup-*.sql s3://azora-backups/database/

# Verify backup
ls -lh backup-*.sql
```

### Database Restore

```bash
# 1. Stop services
kubectl scale deployment --all --replicas=0 -n azora-production

# 2. Restore database
kubectl exec -i -n azora-production postgres-0 -- psql -U azora < backup-YYYYMMDD-HHMMSS.sql

# 3. Verify data
kubectl exec -n azora-production postgres-0 -- psql -U azora -c "SELECT COUNT(*) FROM users;"

# 4. Start services
kubectl scale deployment --all --replicas=3 -n azora-production

# 5. Verify services
kubectl get pods -n azora-production
```

### View Logs

```bash
# Real-time logs
kubectl logs -f deployment/azora-api-gateway -n azora-production

# Last 100 lines
kubectl logs deployment/azora-api-gateway -n azora-production --tail=100

# Logs from specific time
kubectl logs deployment/azora-api-gateway -n azora-production --since=1h

# Logs from all pods
kubectl logs -l app=azora-api-gateway -n azora-production --all-containers=true
```

### Debug Pod

```bash
# Execute shell in pod
kubectl exec -it <pod-name> -n azora-production -- /bin/sh

# Port forward for local debugging
kubectl port-forward svc/azora-api-gateway 8080:80 -n azora-production

# Copy files from pod
kubectl cp azora-production/<pod-name>:/app/logs/error.log ./error.log

# Run command in pod
kubectl exec -n azora-production <pod-name> -- curl localhost:3000/health
```

## Monitoring Checklist

### Daily Checks
- [ ] Check Grafana dashboards for anomalies
- [ ] Review error logs in Kibana
- [ ] Verify backup completion
- [ ] Check resource utilization
- [ ] Review Sentry error reports

### Weekly Checks
- [ ] Review performance trends
- [ ] Check for security updates
- [ ] Verify autoscaling behavior
- [ ] Review cost reports
- [ ] Update documentation

### Monthly Checks
- [ ] Review and update runbooks
- [ ] Conduct disaster recovery drill
- [ ] Review and optimize resource allocation
- [ ] Security audit
- [ ] Team training session

## Escalation Paths

### Level 1: On-Call Engineer
- Initial response
- Basic troubleshooting
- Service restarts
- Rollbacks

### Level 2: Senior Engineer
- Complex issues
- Database problems
- Performance optimization
- Architecture decisions

### Level 3: CTO
- Critical outages
- Security incidents
- Major architectural changes
- Customer-impacting issues

## Contact Information

### Team Contacts
- **On-Call**: #oncall (Slack)
- **DevOps**: #devops (Slack)
- **Engineering**: #engineering (Slack)
- **Security**: security@azora.world

### External Contacts
- **Cloud Provider Support**: [Provider portal]
- **Stripe Support**: support@stripe.com
- **OpenAI Support**: support@openai.com

## Useful Commands

```bash
# Get cluster info
kubectl cluster-info

# Get all resources
kubectl get all -n azora-production

# Describe resource
kubectl describe <resource-type> <resource-name> -n azora-production

# Get resource YAML
kubectl get <resource-type> <resource-name> -n azora-production -o yaml

# Apply configuration
kubectl apply -f config.yaml -n azora-production

# Delete resource
kubectl delete <resource-type> <resource-name> -n azora-production

# Watch resources
kubectl get pods -n azora-production -w

# Get events
kubectl get events -n azora-production --sort-by='.lastTimestamp'

# Top pods
kubectl top pods -n azora-production

# Top nodes
kubectl top nodes
```

## Post-Incident Review

After resolving an incident:

1. **Document the incident**
   - What happened?
   - When did it happen?
   - How was it detected?
   - What was the impact?

2. **Root cause analysis**
   - What caused the issue?
   - Why wasn't it caught earlier?
   - What were the contributing factors?

3. **Action items**
   - What can prevent this in the future?
   - What monitoring/alerting is needed?
   - What documentation needs updating?

4. **Share learnings**
   - Post-mortem document
   - Team meeting
   - Update runbooks
