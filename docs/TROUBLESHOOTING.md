# Troubleshooting Guide

## Common Issues & Solutions

### Authentication Issues

#### Problem: "Invalid JWT Token"

**Symptoms**:
- 401 Unauthorized errors
- "Token expired" messages
- Login failures

**Solutions**:

1. **Check token expiration**:
```bash
# Decode JWT token
node -e "console.log(JSON.parse(Buffer.from('TOKEN_HERE'.split('.')[1], 'base64').toString()))"

# Check exp field - should be future timestamp
```

2. **Verify JWT secret**:
```bash
# Ensure JWT_SECRET matches across services
echo $JWT_SECRET

# If mismatch, update environment variable
export JWT_SECRET="your-new-secret"
```

3. **Clear sessions**:
```bash
# Clear Redis sessions
redis-cli FLUSHDB

# Or specific user sessions
redis-cli DEL "session:user-id"
```

4. **Check token refresh**:
```bash
# Verify refresh token endpoint
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-token"}'
```

---

#### Problem: "OAuth Login Fails"

**Symptoms**:
- Google/GitHub login not working
- Redirect URI mismatch
- "Invalid client ID" errors

**Solutions**:

1. **Verify OAuth credentials**:
```bash
# Check environment variables
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
echo $GITHUB_CLIENT_ID
echo $GITHUB_CLIENT_SECRET
```

2. **Check redirect URIs**:
```
Google Console: https://console.cloud.google.com
GitHub Settings: https://github.com/settings/developers

Ensure redirect URIs match:
- Local: http://localhost:3000/auth/callback
- Staging: https://staging.azora.io/auth/callback
- Production: https://api.azora.io/auth/callback
```

3. **Test OAuth flow**:
```bash
# Test Google OAuth
curl -X GET "http://localhost:3000/api/v1/auth/google" \
  -H "Accept: application/json"
```

---

### Database Issues

#### Problem: "Connection Refused"

**Symptoms**:
- "ECONNREFUSED" errors
- Database queries failing
- Services can't connect to DB

**Solutions**:

1. **Check database status**:
```bash
# PostgreSQL
psql -h localhost -U postgres -d azora_dev -c "SELECT 1"

# MongoDB
mongo --eval "db.adminCommand('ping')"

# Redis
redis-cli ping
```

2. **Verify connection string**:
```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

3. **Check firewall/network**:
```bash
# Test connectivity
telnet localhost 5432

# Or use nc
nc -zv localhost 5432
```

4. **Restart database**:
```bash
# Docker
docker restart azora-postgres

# Kubernetes
kubectl rollout restart deployment/postgres -n production
```

---

#### Problem: "Migration Failed"

**Symptoms**:
- Deployment fails during migration
- "Column already exists" errors
- Schema mismatch

**Solutions**:

1. **Check migration status**:
```bash
# List migrations
npm run db:migration:list

# Check which migrations ran
psql $DATABASE_URL -c "SELECT * FROM migrations ORDER BY run_on DESC LIMIT 10"
```

2. **Rollback migration**:
```bash
# Rollback last migration
npm run db:rollback

# Rollback specific migration
npm run db:rollback -- --target=20231115_120000
```

3. **Fix migration**:
```bash
# Edit migration file
nano migrations/20231115_120000_add_column.sql

# Re-run migration
npm run db:migrate
```

4. **Restore from backup**:
```bash
# If migration corrupted data
pg_dump azora_production > backup_current.sql
psql azora_production < backup_before_migration.sql
```

---

### API Issues

#### Problem: "500 Internal Server Error"

**Symptoms**:
- Generic 500 errors
- No specific error message
- Inconsistent failures

**Solutions**:

1. **Check service logs**:
```bash
# View error logs
kubectl logs deployment/api-gateway -n production | grep -i error

# Follow logs in real-time
kubectl logs -f deployment/api-gateway -n production
```

2. **Check error tracking**:
```bash
# View Sentry errors
# https://sentry.io/organizations/azora/issues/

# Or check local error logs
tail -f logs/error.log
```

3. **Enable debug logging**:
```bash
# Set debug level
export LOG_LEVEL=debug

# Restart service
npm run dev
```

4. **Check dependencies**:
```bash
# Verify external services
curl -I https://api.stripe.com
curl -I https://api.openai.com

# Check service health
npm run health-check
```

---

#### Problem: "Rate Limit Exceeded"

**Symptoms**:
- 429 Too Many Requests
- "Rate limit exceeded" messages
- Requests being throttled

**Solutions**:

1. **Check rate limit configuration**:
```bash
# View rate limit settings
cat services/api-gateway/config/rate-limit.js

# Check current limits
redis-cli KEYS "rate-limit:*"
```

2. **Increase rate limits**:
```bash
# Update configuration
# services/api-gateway/config/rate-limit.js
{
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 1000,  // requests per window
  standardHeaders: true,
  legacyHeaders: false,
}

# Restart service
npm run dev
```

3. **Whitelist IP/user**:
```bash
# Add to whitelist
redis-cli SET "rate-limit:whitelist:user-id" "true"

# Or in configuration
const whitelist = ['127.0.0.1', 'admin-user-id']
```

---

### Performance Issues

#### Problem: "Slow API Response"

**Symptoms**:
- API responses taking >1 second
- Timeouts
- High latency

**Solutions**:

1. **Check database performance**:
```bash
# Analyze slow queries
psql $DATABASE_URL -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10"

# Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

2. **Check indexes**:
```bash
# List indexes
psql $DATABASE_URL -c "\d+ table_name"

# Create missing indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_course_category ON courses(category);
```

3. **Check cache**:
```bash
# View cache hit rate
redis-cli INFO stats

# Clear cache if needed
redis-cli FLUSHDB
```

4. **Check resource usage**:
```bash
# CPU usage
top -p $(pgrep -f "node")

# Memory usage
ps aux | grep node

# Disk I/O
iostat -x 1
```

5. **Enable caching**:
```bash
# Add Redis caching
const cached = await redis.get(`course:${id}`);
if (cached) return JSON.parse(cached);

const data = await db.query(...);
await redis.setex(`course:${id}`, 3600, JSON.stringify(data));
```

---

#### Problem: "High Memory Usage"

**Symptoms**:
- Memory usage >80%
- Out of memory errors
- Service crashes

**Solutions**:

1. **Check memory leaks**:
```bash
# Generate heap dump
node --inspect app.js

# Connect Chrome DevTools
# chrome://inspect

# Analyze heap
npm run analyze:heap
```

2. **Increase memory limit**:
```bash
# Node.js
node --max-old-space-size=4096 app.js

# Kubernetes
kubectl set resources deployment api-gateway \
  --limits=memory=2Gi \
  -n production
```

3. **Optimize code**:
```bash
# Use streaming for large data
fs.createReadStream('large-file.json')

# Paginate results
SELECT * FROM users LIMIT 100 OFFSET 0

# Use generators for large loops
function* largeDataGenerator() {
  for (let i = 0; i < 1000000; i++) {
    yield i;
  }
}
```

---

### Deployment Issues

#### Problem: "Deployment Stuck"

**Symptoms**:
- Deployment not progressing
- Pods in "Pending" state
- Timeout errors

**Solutions**:

1. **Check pod status**:
```bash
# Describe pod
kubectl describe pod <pod-name> -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'
```

2. **Check resource availability**:
```bash
# Check node resources
kubectl top nodes

# Check pod resource requests
kubectl describe pod <pod-name> -n production | grep -A 5 "Requests"
```

3. **Increase timeout**:
```bash
# Helm deployment timeout
helm upgrade azora-prod ./helm/azora \
  --namespace production \
  --timeout 15m \
  --wait
```

4. **Force rollback**:
```bash
# Rollback deployment
helm rollback azora-prod -n production

# Or delete stuck pod
kubectl delete pod <pod-name> -n production
```

---

#### Problem: "Image Pull Failed"

**Symptoms**:
- "ImagePullBackOff" errors
- "Failed to pull image" messages
- Registry authentication issues

**Solutions**:

1. **Check image exists**:
```bash
# List images in registry
docker images | grep azora

# Pull image manually
docker pull registry.azora.io/azora/api-gateway:1.0.0
```

2. **Check registry credentials**:
```bash
# Create image pull secret
kubectl create secret docker-registry regcred \
  --docker-server=registry.azora.io \
  --docker-username=user \
  --docker-password=pass \
  -n production

# Reference in deployment
imagePullSecrets:
  - name: regcred
```

3. **Check image tag**:
```bash
# Verify tag exists
docker images | grep "1.0.0"

# Or check registry
curl -u user:pass https://registry.azora.io/v2/azora/api-gateway/tags/list
```

---

### Payment Issues

#### Problem: "Stripe Payment Failed"

**Symptoms**:
- Payment processing errors
- "Invalid API key" messages
- Webhook failures

**Solutions**:

1. **Check Stripe credentials**:
```bash
# Verify API key
echo $STRIPE_SECRET_KEY

# Test API key
curl https://api.stripe.com/v1/charges \
  -u $STRIPE_SECRET_KEY:
```

2. **Check webhook configuration**:
```bash
# Verify webhook endpoint
# https://dashboard.stripe.com/webhooks

# Test webhook
curl -X POST http://localhost:3000/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"charge.succeeded"}'
```

3. **Check payment logs**:
```bash
# View payment logs
kubectl logs deployment/payment-service -n production | grep -i stripe

# Check Stripe dashboard for failed payments
# https://dashboard.stripe.com/payments
```

---

### AI Service Issues

#### Problem: "OpenAI API Error"

**Symptoms**:
- "Invalid API key" errors
- Rate limit exceeded
- Timeout errors

**Solutions**:

1. **Check API key**:
```bash
# Verify OpenAI API key
echo $OPENAI_API_KEY

# Test API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

2. **Check rate limits**:
```bash
# View rate limit status
# https://platform.openai.com/account/rate-limits

# Implement exponential backoff
async function callOpenAI(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await openai.createCompletion({...});
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        await sleep(Math.pow(2, i) * 1000);
      } else {
        throw error;
      }
    }
  }
}
```

3. **Check quota**:
```bash
# View usage
# https://platform.openai.com/account/usage/overview

# Set spending limits
# https://platform.openai.com/account/billing/limits
```

---

## Monitoring & Debugging

### Enable Debug Mode

```bash
# Set debug environment variable
export DEBUG=azora:*

# Or specific module
export DEBUG=azora:auth,azora:payment

# Run service
npm run dev
```

### View Metrics

```bash
# Prometheus metrics
curl http://localhost:9090/metrics

# Grafana dashboards
# https://grafana.azora.io

# Check specific metric
curl http://localhost:9090/api/v1/query?query=http_requests_total
```

### Check Logs

```bash
# View all logs
kubectl logs -n production --all-containers=true

# Follow logs
kubectl logs -f deployment/api-gateway -n production

# Search logs
kubectl logs -n production | grep "error"

# View logs from specific time
kubectl logs -n production --since=1h
```

---

## Getting Help

### Resources

- **Documentation**: https://docs.azora.io
- **GitHub Issues**: https://github.com/azora-os/azora-os/issues
- **Slack**: #azora-support
- **Email**: support@azora.io

### Reporting Issues

Include:
1. Error message (full stack trace)
2. Steps to reproduce
3. Environment (local/staging/production)
4. Logs (last 50 lines)
5. Screenshots (if applicable)



---

## Deployment Issues

### Deployment Fails to Complete

**Symptoms**:
- Helm upgrade hangs
- Pods stuck in Pending
- Deployment times out

**Solutions**:

1. **Check Helm status**:
```bash
helm status azora-prod -n production
helm history azora-prod -n production
```

2. **Validate chart**:
```bash
helm lint ./helm/azora
helm template azora ./helm/azora --namespace production --values helm/values-production.yaml
```

3. **Check pod events**:
```bash
kubectl describe pod <pod-name> -n production
kubectl get events -n production --sort-by='.lastTimestamp'
```

4. **Increase timeout**:
```bash
helm upgrade azora-prod ./helm/azora \
  --namespace production \
  --values helm/values-production.yaml \
  --timeout 15m
```

5. **Rollback if needed**:
```bash
helm rollback azora-prod 1 -n production
```

---

### High Error Rate After Deployment

**Symptoms**:
- Error rate > 1%
- 5xx errors in logs
- Users reporting failures

**Solutions**:

1. **Check error logs**:
```bash
kubectl logs -n production -l app=api-gateway --tail=100 | grep -i error
```

2. **Identify affected service**:
```bash
kubectl logs -n production --all-containers=true --since=5m | grep -i error | head -20
```

3. **Check recent changes**:
```bash
git log --oneline -5
git diff HEAD~1
```

4. **Trigger rollback**:
```bash
helm rollback azora-prod 1 -n production
kubectl patch service api-gateway -n production \
  -p '{"spec":{"selector":{"slot":"blue"}}}'
```

5. **Verify rollback**:
```bash
npm run health-check -- --env=production
```

---

### Pods Crashing (CrashLoopBackOff)

**Symptoms**:
- Pods restart repeatedly
- Application won't start
- CrashLoopBackOff status

**Solutions**:

1. **Check crash logs**:
```bash
kubectl logs <pod-name> -n production
kubectl logs <pod-name> -n production --previous
```

2. **Verify environment variables**:
```bash
kubectl exec -it <pod-name> -n production -- env | grep -E "DATABASE|JWT|STRIPE"
```

3. **Check secrets**:
```bash
kubectl get secrets -n production
kubectl describe secret azora-secrets -n production
```

4. **Verify resource limits**:
```bash
kubectl describe pod <pod-name> -n production | grep -A 5 "Limits"
```

5. **Increase restart delay**:
```bash
kubectl set env deployment/api-gateway \
  STARTUP_DELAY=30 \
  -n production
```

---

### High Memory Usage

**Symptoms**:
- Memory usage > 80%
- Pods being OOM killed
- Memory alerts firing

**Solutions**:

1. **Check memory usage**:
```bash
kubectl top pods -n production --sort-by=memory
```

2. **Identify memory leak**:
```bash
kubectl logs <pod-name> -n production --tail=100 | grep -i "memory\|gc"
```

3. **Increase memory limit**:
```bash
kubectl set resources deployment api-gateway \
  --limits=memory=1Gi \
  -n production
```

4. **Restart pod**:
```bash
kubectl rollout restart deployment/api-gateway -n production
```

5. **Monitor memory**:
```bash
kubectl top pods -n production -w
```

---

### High API Latency

**Symptoms**:
- API response time > 100ms
- Slow user experience
- Performance alerts

**Solutions**:

1. **Check latency metrics**:
```bash
curl -s http://localhost:9090/api/v1/query \
  --data-urlencode 'query=histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (job, le))'
```

2. **Identify slow endpoints**:
```bash
kubectl logs -n production -l app=api-gateway --since=10m | grep "duration" | sort -t= -k2 -rn | head -10
```

3. **Check database query time**:
```bash
kubectl exec -it deployment/api-gateway -n production \
  -- psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

4. **Scale horizontally**:
```bash
kubectl scale deployment api-gateway --replicas=5 -n production
```

5. **Optimize queries**:
```bash
# Add indexes
kubectl exec -it deployment/api-gateway -n production \
  -- psql -c "CREATE INDEX idx_users_email ON users(email);"
```

---

### Database Connection Issues

**Symptoms**:
- "too many connections" errors
- Connection pool exhausted
- Database unavailable

**Solutions**:

1. **Check connection pool**:
```bash
kubectl exec -it deployment/api-gateway -n production \
  -- psql -c "SELECT count(*) FROM pg_stat_activity;"
```

2. **List active connections**:
```bash
kubectl exec -it deployment/api-gateway -n production \
  -- psql -c "SELECT pid, usename, application_name, state FROM pg_stat_activity;"
```

3. **Kill idle connections**:
```bash
kubectl exec -it deployment/api-gateway -n production \
  -- psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < now() - interval '10 minutes';"
```

4. **Increase pool size**:
```bash
kubectl set env deployment/api-gateway \
  DATABASE_POOL_SIZE=50 \
  -n production
```

5. **Restart pods**:
```bash
kubectl rollout restart deployment/api-gateway -n production
```

---

### Service Not Responding

**Symptoms**:
- Service endpoint unavailable
- Connection refused
- Timeout errors

**Solutions**:

1. **Check service status**:
```bash
kubectl get svc -n production
kubectl get endpoints -n production
```

2. **Test connectivity**:
```bash
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  wget -O- http://api-gateway:3000/health
```

3. **Check pod status**:
```bash
kubectl get pods -n production
kubectl describe pod <pod-name> -n production
```

4. **Verify ingress**:
```bash
kubectl get ingress -n production
kubectl describe ingress api-gateway -n production
```

5. **Check network policies**:
```bash
kubectl get networkpolicies -n production
```

---

### Deployment Monitoring Not Working

**Symptoms**:
- Alerts not firing
- Metrics not collected
- Dashboards empty

**Solutions**:

1. **Check Prometheus**:
```bash
curl http://localhost:9090/api/v1/status
curl http://localhost:9090/api/v1/targets
```

2. **Verify metrics collection**:
```bash
curl http://localhost:9090/api/v1/query?query=up
```

3. **Check alert rules**:
```bash
curl http://localhost:9090/api/v1/rules | jq '.data.groups[] | select(.name=="deployment_monitoring")'
```

4. **Reload Prometheus**:
```bash
curl -X POST http://localhost:9090/-/reload
```

5. **Check Alertmanager**:
```bash
curl http://localhost:9093/api/v1/status
curl http://localhost:9093/api/v1/alerts
```

---

## Performance Issues

### Slow Database Queries

**Symptoms**:
- Query time > 50ms
- Slow API responses
- Database alerts

**Solutions**:

1. **Analyze slow queries**:
```bash
kubectl exec -it deployment/api-gateway -n production \
  -- psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

2. **Explain query plan**:
```bash
kubectl exec -it deployment/api-gateway -n production \
  -- psql -c "EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';"
```

3. **Check indexes**:
```bash
kubectl exec -it deployment/api-gateway -n production \
  -- psql -c "SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;"
```

4. **Create missing indexes**:
```bash
kubectl exec -it deployment/api-gateway -n production \
  -- psql -c "CREATE INDEX idx_users_email ON users(email);"
```

5. **Vacuum and analyze**:
```bash
kubectl exec -it deployment/api-gateway -n production \
  -- psql -c "VACUUM ANALYZE;"
```

---

### High CPU Usage

**Symptoms**:
- CPU usage > 80%
- Slow responses
- CPU alerts

**Solutions**:

1. **Check CPU usage**:
```bash
kubectl top pods -n production --sort-by=cpu
```

2. **Identify CPU-intensive process**:
```bash
kubectl exec -it <pod-name> -n production -- top -b -n 1
```

3. **Increase CPU limit**:
```bash
kubectl set resources deployment api-gateway \
  --limits=cpu=1000m \
  -n production
```

4. **Scale horizontally**:
```bash
kubectl scale deployment api-gateway --replicas=5 -n production
```

5. **Profile and optimize**:
```bash
# Use profiling tools to identify bottlenecks
npm run profile
```

---

## Security Issues

### Suspicious Activity

**Symptoms**:
- Unusual traffic patterns
- Failed auth attempts
- Security alerts

**Solutions**:

1. **Check security logs**:
```bash
kubectl logs -n production -l app=api-gateway --since=1h | grep -i "auth\|security\|failed"
```

2. **Identify attack source**:
```bash
kubectl logs -n production -l app=api-gateway --since=1h | grep "failed" | awk '{print $NF}' | sort | uniq -c | sort -rn
```

3. **Block suspicious IP**:
```bash
kubectl exec -it deployment/api-gateway -n production \
  -- iptables -A INPUT -s <suspicious-ip> -j DROP
```

4. **Enable rate limiting**:
```bash
kubectl set env deployment/api-gateway \
  RATE_LIMIT_ENABLED=true \
  RATE_LIMIT_REQUESTS=100 \
  RATE_LIMIT_WINDOW=60 \
  -n production
```

---

### Vulnerability Detected

**Symptoms**:
- Security scan finds vulnerability
- CVE alert received
- Dependency vulnerability

**Solutions**:

1. **Identify vulnerability**:
```bash
npm audit
npm audit --json | jq '.vulnerabilities'
```

2. **Update vulnerable package**:
```bash
npm update <package-name>
npm audit fix
```

3. **Test changes**:
```bash
npm test
npm run build
```

4. **Deploy fix**:
```bash
git commit -m "fix: patch security vulnerability"
git push
```

5. **Verify fix**:
```bash
npm audit
```

---

## Getting Help

### Resources

- **Documentation**: See docs/ directory
- **Runbooks**: See docs/RUNBOOKS.md
- **Deployment Guide**: See docs/DEPLOYMENT.md
- **Performance Monitoring**: See docs/PERFORMANCE-MONITORING-SETUP.md

### Escalation

1. **Level 1**: Check this guide and runbooks
2. **Level 2**: Contact on-call engineer
3. **Level 3**: Contact service owner
4. **Level 4**: Contact engineering manager

### Emergency Contacts

See DEPLOYMENT-CHECKLIST.md for emergency contact information.

