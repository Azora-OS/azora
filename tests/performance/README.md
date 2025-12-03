# Performance & Staging Validation Tests

## Overview

This directory contains performance testing and staging validation scripts for Azora OS deployment readiness (Tasks 21-25).

## Quick Start

```bash
# Run all validations
npm run validate:staging

# Run individual tests
npm run validate:load          # Load tests
npm run validate:monitoring    # Monitoring validation
npm run validate:autoscaling   # Autoscaling tests
npm run validate:dr            # Disaster recovery
```

## Test Files

### load-tests-staging.ts (Task 21.1)
k6 load testing script with progressive load stages.

**Thresholds:**
- p95 latency < 200ms
- Error rate < 5%

**Stages:**
1. Ramp up to 100 users (2 min)
2. Hold at 100 users (5 min)
3. Ramp up to 1000 users (2 min)
4. Hold at 1000 users (5 min)
5. Ramp down to 0 (2 min)

### monitoring-validation.ts (Task 21.2)
Validates monitoring stack is operational.

**Checks:**
- Prometheus metrics collection
- Grafana dashboard health
- Alert delivery
- Log aggregation

### autoscaling-test.ts (Task 21.3)
Tests Kubernetes HPA behavior.

**Validates:**
- Scale up under load
- Scale down after load
- Resource limits
- Pod stability

### disaster-recovery-test.ts (Task 21.4)
Tests backup/restore and failover.

**Validates:**
- Database backup creation
- Restore procedures
- Service failover
- RTO/RPO targets (4hr/1hr)

### run-staging-validation.ts
Main runner that executes all validation tasks.

## Prerequisites

- Staging environment deployed
- kubectl configured
- k6 installed (`brew install k6` or `choco install k6`)
- Node.js 18+
- Database access

## Environment Variables

```bash
STAGING_URL=https://staging.azora.world
PROMETHEUS_URL=http://prometheus:9090
ALERTMANAGER_URL=http://alertmanager:9093
DATABASE_URL=postgresql://...
KUBECONFIG=/path/to/kubeconfig
```

## CI/CD

Automated via GitHub Actions:
- Workflow: `.github/workflows/staging-validation.yml`
- Schedule: Daily at 2 AM
- Manual trigger: `gh workflow run staging-validation.yml`

## Documentation

See [Staging Validation Guide](../../docs/deployment/STAGING-VALIDATION-GUIDE.md) for detailed instructions.

## Status

✅ All tasks 21-25 implemented and ready for execution
