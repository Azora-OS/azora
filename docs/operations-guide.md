# Azora OS Operations Guide

## Production Operations & Maintenance

This guide covers operational procedures for running Azora OS in production environments.

---

## Table of Contents

1. [Deployment Procedures](#deployment-procedures)
2. [Monitoring & Alerting](#monitoring--alerting)
3. [Incident Response](#incident-response)
4. [Maintenance Tasks](#maintenance-tasks)
5. [Backup & Recovery](#backup--recovery)
6. [Performance Optimization](#performance-optimization)
7. [Security Operations](#security-operations)

---

## Deployment Procedures

### Blue-Green Deployment

Azora OS uses blue-green deployments for zero-downtime releases.

#### Prerequisites

- Access to Kubernetes cluster
- kubectl configured with production context
- Docker registry access
- CI/CD pipeline access

#### Deployment Steps

1. **Prepare Release**
   ```bash
   # Tag the release
   git tag v1.2.3
   git push origin v1.2.3

   # CI/CD will build and push images automatically
   ```

2. **Verify Build**
   ```bash
   # Check that images are built and pushed
   docker pull azora/api-gateway:v1.2.3
   docker pull azora/auth-service:v1.2.3
   ```

3. **Deploy to Staging**
   ```bash
   # Deploy to staging first
   ./deployment/blue-green-deploy.sh staging v1.2.3
   ```

4. **Run Tests**
   ```bash
   # Run integration tests against staging
   npm run test:integration:staging

   # Run smoke tests
   npm run test:smoke:staging
   ```

5. **Deploy to Production**
   ```bash
   # Deploy to production
   ./deployment/blue-green-deploy.sh production v1.2.3
   ```

6. **Monitor Deployment**
   ```bash
   # Watch deployment progress
   kubectl get pods -n azora-production -w

   # Check service health
   curl -f https://api.azora.os/health
   ```

#### Rollback Procedure

If issues are detected:

```bash
# Immediate rollback
./deployment/rollback.sh production "High error rates detected"

# Or manual rollback via kubectl
kubectl rollout undo deployment/api-gateway -n azora-production
```

### Infrastructure as Code

#### Terraform Deployment

```bash
cd deployment/infrastructure

# Plan changes
terraform plan -var="environment=production"

# Apply changes
terraform apply -var="environment=production"

# Destroy (emergency only)
terraform destroy -var="environment=production"
```

#### Kubernetes Manifests

All services are deployed via Kubernetes manifests with:

- **Horizontal Pod Autoscaling**: CPU/memory based scaling
- **Pod Disruption Budgets**: Ensure availability during updates
- **Resource Limits**: Prevent resource exhaustion
- **Health Checks**: Readiness and liveness probes

---

## Monitoring & Alerting

### Monitoring Stack

Azora OS uses a comprehensive monitoring stack:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Alertmanager**: Alert routing and management
- **Node Exporter**: System metrics
- **cAdvisor**: Container metrics

### Key Metrics to Monitor

#### Application Metrics

```prometheus
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Response time (95th percentile)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Active users
active_users_total

# Database connections
database_connections_active
```

#### System Metrics

```prometheus
# CPU usage
100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Disk usage
(node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100

# Network I/O
rate(node_network_receive_bytes_total[5m])
rate(node_network_transmit_bytes_total[5m])
```

### Alerting Rules

#### Critical Alerts

```yaml
# Service down
- alert: ServiceDown
  expr: up == 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Service {{ $labels.service }} is down"

# High error rate
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High error rate on {{ $labels.service }}"

# Database connection issues
- alert: DatabaseConnectionsHigh
  expr: database_connections_active > 80
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High database connections"
```

#### Warning Alerts

```yaml
# High response time
- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
  for: 10m
  labels:
    severity: warning

# Low disk space
- alert: LowDiskSpace
  expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
  for: 5m
  labels:
    severity: warning
```

### Alert Response Procedures

#### Service Down (Critical)

1. **Immediate Assessment**
   ```bash
   # Check pod status
   kubectl get pods -n azora-production

   # Check logs
   kubectl logs -f deployment/api-gateway -n azora-production
   ```

2. **Restart Service**
   ```bash
   kubectl rollout restart deployment/api-gateway -n azora-production
   ```

3. **Scale Up if Needed**
   ```bash
   kubectl scale deployment api-gateway --replicas=5 -n azora-production
   ```

4. **Rollback if Necessary**
   ```bash
   ./deployment/rollback.sh production "Service instability"
   ```

#### High Error Rate (Critical)

1. **Identify Affected Service**
   ```bash
   # Check error metrics
   curl http://prometheus.azora.os/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])
   ```

2. **Check Logs**
   ```bash
   kubectl logs -f deployment/auth-service -n azora-production --tail=100
   ```

3. **Database Issues**
   ```bash
   # Check database connections
   kubectl exec -it deployment/database-check -- pg_isready -h database
   ```

4. **Circuit Breaker Check**
   ```bash
   # Check if services are in circuit breaker state
   curl http://api-gateway.azora.os/debug/circuit-breakers
   ```

---

## Incident Response

### Incident Classification

#### Severity Levels

- **SEV-1 (Critical)**: Complete system outage, data loss, security breach
- **SEV-2 (High)**: Major service degradation, significant user impact
- **SEV-3 (Medium)**: Minor service issues, limited user impact
- **SEV-4 (Low)**: Cosmetic issues, no functional impact

### Incident Response Process

#### 1. Detection & Assessment

```bash
# Check system status
curl https://api.azora.os/health

# Check monitoring dashboards
open https://grafana.azora.os

# Alert team via Slack
# Incident declared in #incidents channel
```

#### 2. Containment

**For SEV-1/SEV-2 Incidents:**

1. **Stop the Bleeding**
   ```bash
   # Scale down problematic service
   kubectl scale deployment/api-gateway --replicas=0 -n azora-production

   # Switch to maintenance mode
   kubectl apply -f maintenance-mode.yaml
   ```

2. **Data Protection**
   ```bash
   # Take database backup
   ./backup/database-backup.sh emergency

   # Isolate affected systems
   kubectl cordon affected-nodes
   ```

#### 3. Investigation

```bash
# Collect logs
./scripts/collect-incident-logs.sh incident-2025-001

# Analyze metrics
# Query Prometheus for time range around incident

# Code review if deployment-related
git log --oneline -10
```

#### 4. Resolution

```bash
# Apply fix
kubectl apply -f hotfix-deployment.yaml

# Test fix in staging
./deployment/blue-green-deploy.sh staging hotfix-v1.2.4

# Deploy to production
./deployment/canary-deploy.sh production hotfix-v1.2.4
```

#### 5. Post-Mortem

**Post-mortem document should include:**

- Timeline of events
- Root cause analysis
- Impact assessment
- Lessons learned
- Action items

### Communication Templates

#### Internal Communication

```
🚨 INCIDENT DECLARED 🚨

Severity: SEV-2
Service: API Gateway
Status: Investigating
Impact: 40% of users affected
ETA: 30 minutes

#incident-2025-001
```

#### External Communication

```
🔄 Service Update

We're experiencing some issues with our API Gateway service.
Our team is working to resolve this quickly.

Status: 🔴 Degraded
Estimated Resolution: 15 minutes

We apologize for the inconvenience.
```

---

## Maintenance Tasks

### Daily Tasks

#### Morning Check (9 AM UTC)

```bash
# System health check
./scripts/health-check.sh

# Monitor key metrics
curl http://prometheus.azora.os/api/v1/query?query=up

# Check disk usage
df -h

# Review overnight alerts
# Check Alertmanager UI
```

#### Log Rotation

```bash
# Rotate application logs
./scripts/logrotate.sh

# Archive old logs to S3
aws s3 sync /var/log/azora s3://azora-logs/archive/
```

### Weekly Tasks

#### Security Updates

```bash
# Update Docker images
./scripts/update-images.sh

# Security scanning
trivy image --exit-code 1 azora/api-gateway:latest

# Dependency updates
npm audit fix
```

#### Performance Review

```bash
# Analyze slow queries
./scripts/analyze-queries.sh

# Review resource usage
kubectl top pods -n azora-production

# Database optimization
./scripts/db-optimize.sh
```

### Monthly Tasks

#### Capacity Planning

```bash
# Review growth metrics
./scripts/capacity-review.sh

# Update resource limits
kubectl apply -f updated-limits.yaml

# Plan infrastructure scaling
terraform plan -var="environment=production"
```

#### Compliance Audit

```bash
# Security audit
./scripts/security-audit.sh

# GDPR compliance check
./scripts/gdpr-audit.sh

# Generate compliance reports
./scripts/compliance-report.sh
```

---

## Backup & Recovery

### Backup Strategy

#### Database Backups

```bash
# Daily full backups
0 2 * * * ./backup/database-backup.sh full

# Hourly incremental backups
0 * * * * ./backup/database-backup.sh incremental

# Point-in-time recovery enabled
```

#### Application Backups

```bash
# Configuration backups
0 3 * * * ./backup/config-backup.sh

# User-generated content
0 4 * * * ./backup/content-backup.sh
```

### Recovery Procedures

#### Database Recovery

```bash
# Stop application
kubectl scale deployment --all --replicas=0 -n azora-production

# Restore from backup
./backup/database-restore.sh /path/to/backup.sql

# Verify data integrity
./scripts/db-integrity-check.sh

# Restart application
kubectl apply -f production-deployments.yaml
```

#### Full System Recovery

```bash
# Bootstrap new environment
terraform apply -var="environment=production"

# Restore database
./backup/database-restore.sh latest

# Restore configurations
./backup/config-restore.sh

# Deploy application
./deployment/blue-green-deploy.sh production latest
```

### Backup Validation

```bash
# Monthly backup testing
@monthly ./scripts/test-backup-recovery.sh

# Verify backup integrity
./scripts/backup-integrity-check.sh
```

---

## Performance Optimization

### Application Performance

#### Database Optimization

```sql
-- Query optimization
EXPLAIN ANALYZE SELECT * FROM users WHERE email = $1;

-- Index creation
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Query monitoring
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

#### Caching Strategy

```javascript
// Redis caching for frequently accessed data
const cache = require('redis').createClient();

app.get('/api/user/:id', async (req, res) => {
  const cacheKey = `user:${req.params.id}`;

  // Check cache first
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  // Fetch from database
  const user = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

  // Cache result
  await cache.setex(cacheKey, 3600, JSON.stringify(user));

  res.json(user);
});
```

### Infrastructure Optimization

#### Auto-scaling Configuration

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Resource Limits

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

---

## Security Operations

### Security Monitoring

#### Log Analysis

```bash
# Failed login attempts
grep "LOGIN_FAILED" /var/log/auth.log | tail -20

# Suspicious IP addresses
grep "SUSPICIOUS_ACTIVITY" /var/log/security.log

# Rate limit violations
grep "RATE_LIMIT_EXCEEDED" /var/log/api.log
```

#### Intrusion Detection

```bash
# Check for anomalies
./scripts/anomaly-detection.sh

# Review firewall logs
sudo iptables -L -n

# Monitor for unauthorized access
./scripts/access-monitor.sh
```

### Security Incident Response

#### Compromised Credentials

1. **Immediate Actions**
   ```bash
   # Disable compromised account
   ./scripts/disable-account.sh user@example.com

   # Force password reset for affected users
   ./scripts/bulk-password-reset.sh
   ```

2. **Investigation**
   ```bash
   # Analyze access logs
   ./scripts/forensic-analysis.sh incident-2025-001

   # Check for data exfiltration
   ./scripts/data-leak-detection.sh
   ```

3. **Recovery**
   ```bash
   # Rotate all secrets
   ./scripts/rotate-secrets.sh

   # Update security policies
   ./scripts/update-security-policies.sh
   ```

### Compliance Monitoring

#### GDPR Compliance

```bash
# Data subject access requests
./scripts/gdpr-data-export.sh user@example.com

# Right to be forgotten
./scripts/gdpr-data-deletion.sh user@example.com

# Data processing inventory
./scripts/gdpr-audit.sh
```

#### Regular Security Assessments

```bash
# Vulnerability scanning
trivy image azora/api-gateway:latest

# Penetration testing
./scripts/penetration-test.sh

# Security audit
./scripts/security-audit.sh
```

---

## Emergency Contacts

### On-Call Rotation

- **Primary**: ops@azora.os
- **Secondary**: devops@azora.os
- **Management**: cto@azora.os

### External Resources

- **Cloud Provider**: AWS Support (1-888-280-4331)
- **Domain Registrar**: Namecheap Support
- **SSL Certificate**: Let's Encrypt Community

### Escalation Matrix

- **Level 1**: On-call engineer
- **Level 2**: DevOps team lead
- **Level 3**: CTO/Engineering Director
- **Level 4**: CEO/Executive Team

---

*This operations guide ensures Azora OS runs reliably and securely in production. Regular review and updates are essential for maintaining operational excellence.*