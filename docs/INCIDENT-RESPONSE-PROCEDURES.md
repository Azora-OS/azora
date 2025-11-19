# Incident Response Procedures

## Overview

This document outlines the procedures for responding to incidents in the Education Revenue Engine production environment.

## Incident Severity Levels

### Critical (P1)
- System is completely down or unavailable
- Data loss or corruption
- Security breach
- Revenue impact: >$10,000/hour
- Response time: Immediate (< 5 minutes)
- Escalation: VP Engineering, CTO

### High (P2)
- Major functionality is impaired
- Significant performance degradation
- Revenue impact: $1,000-$10,000/hour
- Response time: < 15 minutes
- Escalation: Engineering Manager

### Medium (P3)
- Minor functionality is affected
- Moderate performance impact
- Revenue impact: $100-$1,000/hour
- Response time: < 1 hour
- Escalation: Team Lead

### Low (P4)
- Cosmetic issues or minor bugs
- No revenue impact
- Response time: < 24 hours
- Escalation: Not required

## Incident Response Team

### Roles

**Incident Commander (IC)**
- Leads the incident response
- Makes critical decisions
- Communicates with stakeholders
- Coordinates team efforts

**Technical Lead**
- Investigates root cause
- Implements fixes
- Coordinates with other teams

**Communications Lead**
- Updates stakeholders
- Manages incident channel
- Prepares status updates

**Scribe**
- Documents timeline
- Records decisions
- Captures action items

## Incident Response Process

### 1. Detection and Alerting

**Automated Alerts**
- Prometheus alerts trigger on thresholds
- AlertManager sends notifications to Slack
- PagerDuty escalates critical alerts

**Manual Detection**
- Customer reports
- Team member observations
- Monitoring dashboard review

**Alert Channels**
- Slack: #critical-alerts, #warnings
- PagerDuty: On-call rotation
- Email: Escalation list

### 2. Initial Response (0-5 minutes)

**Immediate Actions**
1. Acknowledge alert in PagerDuty
2. Join incident Slack channel
3. Assess severity level
4. Notify incident commander
5. Begin initial investigation

**Information Gathering**
- Check monitoring dashboards
- Review recent deployments
- Check error logs
- Verify service status

### 3. Investigation (5-30 minutes)

**Investigation Steps**
1. Identify affected services
2. Check recent changes
3. Review error patterns
4. Analyze metrics
5. Check external dependencies

**Tools and Commands**

```bash
# Check pod status
kubectl get pods -n education -o wide

# View logs
kubectl logs -n education deployment/education-revenue-engine -f

# Check metrics
kubectl top pods -n education
kubectl top nodes

# Describe pod for events
kubectl describe pod -n education <pod-name>

# Check database connection
kubectl exec -it -n education deployment/education-revenue-engine -- npm run test:db

# Check Redis connection
kubectl exec -it -n education deployment/education-revenue-engine -- npm run test:redis
```

### 4. Mitigation (30-60 minutes)

**Immediate Mitigation Options**

**Option 1: Restart Service**
```bash
kubectl rollout restart deployment/education-revenue-engine -n education
```

**Option 2: Scale Down/Up**
```bash
kubectl scale deployment education-revenue-engine --replicas=0 -n education
kubectl scale deployment education-revenue-engine --replicas=3 -n education
```

**Option 3: Rollback Deployment**
```bash
kubectl rollout undo deployment/education-revenue-engine -n education
```

**Option 4: Database Failover**
```bash
# Promote read replica to primary
kubectl exec -it -n default postgres-read-replica-0 -- \
  pg_ctl promote -D /var/lib/postgresql/data/pgdata
```

**Option 5: Circuit Breaker**
- Disable problematic feature flag
- Route traffic to backup service
- Enable read-only mode

### 5. Communication

**Initial Notification (within 5 minutes)**
- Incident severity
- Affected services
- Estimated impact
- Initial actions taken

**Status Updates (every 15 minutes)**
- Current status
- Investigation findings
- Actions in progress
- Estimated resolution time

**Resolution Notification**
- Root cause
- Resolution steps taken
- Verification steps
- Post-incident actions

**Template**

```
🚨 INCIDENT: [Service Name]
Severity: [P1/P2/P3/P4]
Status: [Investigating/Mitigating/Resolved]

Affected: [Services/Features]
Impact: [User impact description]
Started: [Time]

Current Actions:
- [Action 1]
- [Action 2]

ETA: [Estimated resolution time]
```

### 6. Resolution and Verification

**Verification Steps**
1. Confirm service is responding
2. Check error rates are normal
3. Verify data integrity
4. Test critical user flows
5. Monitor for 30 minutes

**Verification Commands**

```bash
# Health check
curl https://education.azora.io/health

# Check error rate
curl https://education.azora.io/metrics | grep http_requests_total

# Test API endpoints
curl https://education.azora.io/api/courses
curl https://education.azora.io/api/enrollments

# Check database
kubectl exec -it -n education deployment/education-revenue-engine -- \
  npm run test:db
```

### 7. Post-Incident

**Immediate Actions (within 1 hour)**
- Document timeline
- Capture logs and metrics
- Identify root cause
- List action items

**Follow-up Actions (within 24 hours)**
- Schedule post-mortem
- Assign action items
- Create tickets for fixes
- Update runbooks

**Post-Mortem Meeting**
- Review timeline
- Discuss root cause
- Identify preventive measures
- Assign owners and deadlines

## Common Incident Scenarios

### Scenario 1: High Error Rate

**Symptoms**
- Error rate > 5%
- Alert: HighErrorRate

**Investigation**
```bash
# Check logs for errors
kubectl logs -n education deployment/education-revenue-engine -f | grep ERROR

# Check specific error types
kubectl logs -n education deployment/education-revenue-engine | grep "500\|502\|503"

# Check database connection pool
kubectl exec -it -n education deployment/education-revenue-engine -- \
  npm run test:db
```

**Common Causes**
- Database connection pool exhausted
- External API timeout
- Memory leak
- Unhandled exception

**Resolution**
- Increase connection pool size
- Add retry logic
- Restart service
- Rollback recent changes

### Scenario 2: High Latency

**Symptoms**
- P95 latency > 1 second
- Alert: HighLatency

**Investigation**
```bash
# Check slow queries
kubectl logs -n education deployment/education-revenue-engine | grep "slow query"

# Check database performance
kubectl exec -it -n default postgres-0 -- \
  psql -U azora_admin -d azora_production -c \
  "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check cache hit rate
kubectl exec -it -n education deployment/education-revenue-engine -- \
  npm run test:redis
```

**Common Causes**
- Missing database indexes
- N+1 queries
- Cache miss
- Slow external API

**Resolution**
- Add database indexes
- Optimize queries
- Warm up cache
- Increase timeout

### Scenario 3: Database Down

**Symptoms**
- Database connection refused
- Alert: DatabaseDown

**Investigation**
```bash
# Check pod status
kubectl get pods -n default -l app=postgres

# Check pod logs
kubectl logs -n default postgres-0

# Check disk space
kubectl exec -it -n default postgres-0 -- df -h

# Check memory
kubectl top pod -n default postgres-0
```

**Common Causes**
- Out of disk space
- Out of memory
- Connection limit reached
- Corrupted data

**Resolution**
- Increase disk/memory
- Restart pod
- Promote read replica
- Restore from backup

### Scenario 4: Memory Leak

**Symptoms**
- Memory usage increasing over time
- Alert: HighMemoryUsage

**Investigation**
```bash
# Check memory trend
kubectl top pods -n education --sort-by=memory

# Check heap dump
kubectl exec -it -n education deployment/education-revenue-engine -- \
  npm run heap-dump

# Check for open connections
kubectl exec -it -n education deployment/education-revenue-engine -- \
  npm run check:connections
```

**Common Causes**
- Unclosed database connections
- Event listener leaks
- Large object retention
- Circular references

**Resolution**
- Identify memory leak source
- Fix code
- Restart service
- Monitor memory usage

## Escalation Procedures

### Escalation Path

1. **Team Lead** (< 15 minutes)
   - Acknowledge incident
   - Assign incident commander
   - Begin investigation

2. **Engineering Manager** (< 30 minutes)
   - Review incident status
   - Approve mitigation actions
   - Coordinate resources

3. **VP Engineering** (< 1 hour)
   - Review critical incidents
   - Approve major changes
   - Communicate with executives

4. **CTO** (< 2 hours)
   - Review P1 incidents
   - Approve emergency procedures
   - Communicate with board

### Escalation Triggers

- P1 incident lasting > 15 minutes
- P2 incident lasting > 1 hour
- Multiple incidents in 24 hours
- Customer escalation
- Media/public impact

## Tools and Resources

### Monitoring and Alerting
- Prometheus: http://prometheus.azora.io
- Grafana: http://grafana.azora.io
- AlertManager: http://alertmanager.azora.io

### Logging
- Kibana: http://kibana.azora.io
- Index pattern: `education-*`

### Communication
- Slack: #critical-alerts, #incidents
- PagerDuty: On-call rotation
- Email: escalation@azora.io

### Documentation
- Runbooks: `/docs/runbooks/`
- Architecture: `/docs/ARCHITECTURE.md`
- Deployment: `/docs/DEPLOYMENT-GUIDE.md`

## Runbooks

### Runbook: Restart Service

```bash
# 1. Check current status
kubectl get deployment education-revenue-engine -n education

# 2. Restart deployment
kubectl rollout restart deployment/education-revenue-engine -n education

# 3. Monitor rollout
kubectl rollout status deployment/education-revenue-engine -n education

# 4. Verify service
curl https://education.azora.io/health
```

### Runbook: Scale Service

```bash
# 1. Check current replicas
kubectl get deployment education-revenue-engine -n education

# 2. Scale to desired replicas
kubectl scale deployment education-revenue-engine --replicas=5 -n education

# 3. Monitor scaling
kubectl get pods -n education -w

# 4. Verify service
curl https://education.azora.io/health
```

### Runbook: Rollback Deployment

```bash
# 1. Check rollout history
kubectl rollout history deployment/education-revenue-engine -n education

# 2. Rollback to previous version
kubectl rollout undo deployment/education-revenue-engine -n education

# 3. Monitor rollback
kubectl rollout status deployment/education-revenue-engine -n education

# 4. Verify service
curl https://education.azora.io/health
```

## Metrics and KPIs

### Incident Metrics
- **MTTR** (Mean Time To Resolve): Target < 30 minutes
- **MTTD** (Mean Time To Detect): Target < 5 minutes
- **MTBF** (Mean Time Between Failures): Target > 720 hours
- **Availability**: Target > 99.9%

### Tracking
- Incident log: `/incidents/`
- Metrics dashboard: Grafana
- Post-mortem reports: `/post-mortems/`

## Training and Drills

### On-Call Training
- Monthly training sessions
- Quarterly incident simulations
- Annual comprehensive drills

### Incident Simulation
- Chaos engineering tests
- Failure scenario drills
- Communication practice

## Continuous Improvement

### Review Process
- Weekly incident review
- Monthly trend analysis
- Quarterly process review

### Action Items
- Track in Jira
- Assign owners
- Set deadlines
- Monitor progress

### Lessons Learned
- Document in post-mortems
- Share with team
- Update runbooks
- Improve monitoring

