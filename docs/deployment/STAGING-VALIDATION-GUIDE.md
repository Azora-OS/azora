# Staging Validation Guide (Tasks 21-25)

## Overview

This guide covers the staging validation process for Azora OS deployment readiness, specifically tasks 21-25 from Phase 8.

## Prerequisites

- Staging environment deployed
- kubectl configured with staging cluster access
- k6 load testing tool installed
- Node.js 18+ and npm installed

## Task 21.1: Load Tests in Staging

### Objective
Execute load test scenarios and validate performance SLOs are met.

### Execution
```bash
# Run load tests
k6 run tests/performance/load-tests-staging.ts

# With custom parameters
k6 run --vus 1000 --duration 10m tests/performance/load-tests-staging.ts
```

### Success Criteria
- ✅ p95 latency < 200ms
- ✅ Error rate < 5%
- ✅ No performance bottlenecks identified

## Task 21.2: Monitoring & Alerting Validation

### Objective
Verify metrics collection, dashboards, and alert delivery.

### Execution
```bash
# Validate monitoring
npx ts-node tests/performance/monitoring-validation.ts

# Test alert delivery
curl -X POST http://alertmanager:9093/api/v1/alerts \
  -d '[{"labels":{"alertname":"TestAlert"}}]'
```

### Success Criteria
- ✅ Prometheus collecting metrics
- ✅ Grafana dashboards displaying data
- ✅ Alerts delivered to configured channels
- ✅ Log aggregation working

## Task 21.3: Autoscaling Behavior

### Objective
Trigger autoscaling and verify pods scale up/down correctly.

### Execution
```bash
# Run autoscaling test
npx ts-node tests/performance/autoscaling-test.ts

# Manual verification
kubectl get hpa -n staging
kubectl get pods -n staging -w
```

### Success Criteria
- ✅ Pods scale up under load
- ✅ Pods scale down after load decreases
- ✅ Resource limits appropriate
- ✅ No pod crashes during scaling

## Task 21.4: Disaster Recovery

### Objective
Test backup restoration and validate RTO/RPO targets.

### Execution
```bash
# Run DR tests
npx ts-node tests/performance/disaster-recovery-test.ts

# Manual backup test
./scripts/db-backup.sh
./scripts/db-restore.sh
```

### Success Criteria
- ✅ Database backup successful
- ✅ Restore completes successfully
- ✅ RTO < 4 hours (target: 240 minutes)
- ✅ RPO < 1 hour (target: 60 minutes)
- ✅ Service failover works

## Automated Validation

### Run All Tasks
```bash
# Linux/Mac
./scripts/run-staging-validation.sh

# Windows
.\scripts\run-staging-validation.ps1

# CI/CD
gh workflow run staging-validation.yml
```

## Troubleshooting

### Load Tests Failing
- Check staging environment health
- Verify resource limits not too restrictive
- Review error logs for bottlenecks

### Monitoring Not Working
- Verify Prometheus/Grafana pods running
- Check service discovery configuration
- Validate metric endpoints accessible

### Autoscaling Not Triggering
- Check HPA configuration
- Verify metrics-server installed
- Review resource requests/limits

### DR Tests Failing
- Verify backup permissions
- Check disk space for backups
- Validate database credentials

## Next Steps

After all tasks pass:
1. Document any issues found
2. Update runbooks with learnings
3. Proceed to Phase 9: Production Deployment
4. Schedule production deployment window

## References

- [Load Testing Guide](../testing/LOAD-TESTING.md)
- [Monitoring Setup](../operations/MONITORING-SETUP.md)
- [Disaster Recovery Plan](../operations/DISASTER-RECOVERY.md)
- [Deployment Runbook](DEPLOYMENT-RUNBOOK.md)
