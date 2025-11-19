# Production Deployment Workflow Guide

## Overview

The production deployment workflow (`deploy-production.yml`) provides a comprehensive, safe, and auditable process for deploying releases to production. It implements a gradual rollout strategy with health monitoring, database backup and recovery capabilities, and manual rollback support.

## Workflow Triggers

### Automatic Trigger
- **Event**: Push of release tags matching pattern `v*`
- **Example**: `v1.2.3`, `v2.0.0-rc1`
- **Requirement**: Tag must follow semantic versioning format

### Manual Trigger
- **Event**: Workflow dispatch from GitHub Actions UI
- **Input**: Optional version parameter (e.g., `v1.2.3`)
- **Use Case**: Emergency deployments or re-deployments

## Workflow Stages

### 1. Validate Release
**Purpose**: Verify release tag validity and generate deployment tracking ID

**Steps**:
- Extract version from git tag or manual input
- Validate version format (must match `v*.*.*)
- Verify release tag exists in repository
- Generate unique deployment ID for audit trail

**Outputs**:
- `version`: Validated release version
- `deployment-id`: Unique identifier for this deployment

**Failure Handling**: Stops immediately if version format is invalid

### 2. Pre-Deployment Validation
**Purpose**: Ensure all required checks have passed before proceeding

**Steps**:
- Verify all required status checks passed (linting, tests, security)
- Run final security audit
- Verify build integrity

**Requirements Met**:
- Requirement 7.2: IF any pre-deployment checks fail, THEN halt deployment

**Failure Handling**: Blocks deployment if any check fails

### 3. Database Backup
**Purpose**: Create restorable backup before any database changes

**Steps**:
- Create production database backup
- Store backup in S3 with deployment ID
- Verify backup integrity and restorability
- Generate backup metadata

**Backup Details**:
- Location: `s3://azora-backups/prod/backup-{deployment-id}.sql.gz`
- Retention: 1 year (per artifact retention policy)
- Verification: Backup integrity checked before proceeding

**Requirements Met**:
- Requirement 7.3: THE Pipeline SHALL create database backups before applying migrations

### 4. Database Migrations
**Purpose**: Apply pending database schema changes

**Steps**:
- Run Prisma migrations in production environment
- Log all migration details for audit trail
- Verify migration success before proceeding

**Failure Handling**: Automatic rollback available via backup

**Requirements Met**:
- Requirement 7.3: Database changes applied safely with backup available

### 5. Build and Push
**Purpose**: Build application and push Docker images

**Steps**:
- Build application in production mode
- Build Docker images for all services
- Push images to Docker registry with version tag
- Generate build logs for audit trail

**Parallelization**: Runs in parallel with database migrations

### 6. Gradual Rollout
**Purpose**: Deploy new version gradually with health monitoring at each stage

**Stages**:

#### Stage 1: Canary (5% Traffic)
- Deploy to small subset of production instances
- Monitor for 5 minutes
- Health checks every 10 seconds
- Automatic rollback if health checks fail

#### Stage 2: Progressive (50% Traffic)
- Deploy to half of production instances
- Monitor for 10 minutes
- Health checks every 10 seconds
- Automatic rollback if health checks fail

#### Stage 3: Full (100% Traffic)
- Deploy to all production instances
- Monitor for 15 minutes
- Health checks every 10 seconds
- Automatic rollback if health checks fail

**Requirements Met**:
- Requirement 7.4: THE Pipeline SHALL perform a gradual rollout with health monitoring

### 7. Smoke Tests
**Purpose**: Verify critical services are operational after deployment

**Tests**:
- API Gateway health endpoint
- Auth Service health endpoint
- Education Service health endpoint
- Marketplace Service health endpoint
- Database connectivity
- Critical endpoint functionality

**Failure Handling**: Triggers deployment failure handler if any test fails

**Requirements Met**:
- Requirement 7.5: Add smoke tests for critical services

### 8. Deployment Record
**Purpose**: Create audit trail and deployment documentation

**Record Contents**:
```json
{
  "timestamp": "ISO 8601 timestamp",
  "deployment_id": "Unique deployment identifier",
  "version": "Release version (e.g., v1.2.3)",
  "environment": "production",
  "status": "success",
  "git_sha": "Commit SHA",
  "git_ref": "Git reference",
  "triggered_by": "GitHub actor",
  "services_deployed": ["list of services"],
  "database_backup": {
    "backup_id": "Backup identifier",
    "location": "S3 path",
    "timestamp": "Backup creation time"
  },
  "migrations_applied": "Number of migrations",
  "rollout_stages": [
    {
      "stage": "canary|progressive|full",
      "traffic_percentage": 5|50|100,
      "duration_minutes": "Duration",
      "status": "healthy"
    }
  ],
  "health_checks": {
    "api_gateway": "healthy",
    "auth_service": "healthy",
    "database": "healthy",
    "smoke_tests": "passed"
  },
  "rollback_available": true,
  "rollback_window_minutes": 60,
  "rollback_deadline": "ISO 8601 timestamp"
}
```

**Artifact Storage**: 365-day retention for audit compliance

**Requirements Met**:
- Requirement 7.5: Generate deployment records for audit trails

### 9. Manual Rollback Instructions
**Purpose**: Provide clear rollback procedure if needed

**Contents**:
- Deployment ID and version
- Rollback window (60 minutes)
- When to rollback (failure scenarios)
- Step-by-step rollback procedure
- Backup information and restore commands
- Contact information for on-call team

**Rollback Window**: 60 minutes from deployment completion

**Requirements Met**:
- Requirement 7.5: Implement manual rollback capability for 1 hour post-deployment

### 10. Deployment Failure Handler
**Purpose**: Handle deployment failures gracefully

**Actions**:
- Create failure report with error details
- Preserve database backup for recovery
- Notify team via Slack
- Generate actionable failure report

**Failure Report Contents**:
- Deployment ID and version
- Failed stage information
- Backup availability
- Action required

## Environment Configuration

### Required Secrets

```
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub password
PROD_HOST               # Production server hostname
PROD_USER               # SSH user for production
PROD_KEY                # SSH private key for production
PROD_DATABASE_URL       # Production database connection string
SLACK_WEBHOOK           # Slack webhook for notifications (optional)
```

### Environment Variables

```
DEPLOYMENT_LOG_DIR              # deployment-logs
HEALTH_CHECK_TIMEOUT            # 300 seconds
HEALTH_CHECK_RETRIES            # 5 attempts
HEALTH_CHECK_INTERVAL           # 10 seconds
ROLLBACK_WINDOW_MINUTES         # 60 minutes
```

## Deployment Flow Diagram

```
validate-release
    ↓
pre-deployment-validation
    ↓
database-backup
    ↓
database-migrations ← (parallel) → build-and-push
    ↓
gradual-rollout (canary → progressive → full)
    ↓
smoke-tests
    ↓
deployment-record
    ↓
manual-rollback (instructions)
    ↓
[SUCCESS] or [FAILURE] → deployment-failure-handler
```

## Artifact Outputs

All workflow artifacts are stored with 365-day retention for audit compliance:

- `backup-logs-{deployment-id}` - Database backup logs
- `migration-logs-{deployment-id}` - Database migration logs
- `build-logs-{deployment-id}` - Application build logs
- `rollout-logs-{deployment-id}` - Gradual rollout logs
- `smoke-test-logs-{deployment-id}` - Smoke test results
- `deployment-record-{deployment-id}` - Deployment audit record (JSON)
- `rollback-instructions-{deployment-id}` - Rollback procedure
- `deployment-failure-report-{deployment-id}` - Failure details (if applicable)

## Notifications

### Slack Notifications

**On Success**:
```
✅ Production deployment successful
Version: v1.2.3
Deployment ID: 1234567890-abc123
Environment: https://azora.world
All services healthy and operational
Rollback available for 60 minutes
```

**On Failure**:
```
🚨 Production deployment FAILED
Version: v1.2.3
Deployment ID: 1234567890-abc123

⚠️ ACTION REQUIRED: Manual investigation needed
Database backup available for rollback
Check workflow logs for failure details
```

## Rollback Procedure

### When to Rollback

- Critical service failures not caught by smoke tests
- Data corruption or integrity issues
- Performance degradation beyond acceptable thresholds
- Security vulnerabilities discovered post-deployment

### Rollback Steps

1. **Verify rollback necessity** - Confirm with team lead
2. **Stop traffic** - Redirect traffic to previous version
3. **Restore database** - Use backup from deployment record
4. **Verify services** - Run health checks on previous version
5. **Document incident** - Create incident report

### Restore Database Command

```bash
aws s3 cp s3://azora-backups/prod/backup-{deployment-id}.sql.gz - | gunzip | psql
```

### Rollback Window

- **Duration**: 60 minutes from deployment completion
- **Deadline**: Recorded in deployment record
- **After deadline**: Manual intervention required

## Health Check Endpoints

All services must implement health check endpoints:

```
GET /health
Response: { "status": "healthy", "version": "1.2.3" }
```

### Monitored Services

- API Gateway: `https://azora.world/api/health`
- Auth Service: `https://azora.world/auth/health`
- Education Service: `https://azora.world/api/education/health`
- Marketplace Service: `https://azora.world/api/marketplace/health`

## Monitoring and Observability

### Metrics Tracked

- Deployment duration (by stage)
- Health check success rate
- Service availability during rollout
- Error rates during deployment
- Database migration duration

### Logs Available

- Build logs with timestamps
- Migration logs with SQL statements
- Deployment logs with service status
- Health check logs with response times
- Rollout logs with traffic percentages

## Troubleshooting

### Deployment Fails at Pre-Deployment Validation

**Cause**: Required status checks haven't passed
**Solution**: 
1. Check GitHub PR status checks
2. Fix failing tests, linting, or security issues
3. Retry deployment

### Deployment Fails at Database Backup

**Cause**: Database connection or backup storage issue
**Solution**:
1. Verify database connectivity
2. Check S3 bucket permissions
3. Verify disk space on backup storage
4. Retry deployment

### Deployment Fails at Canary Stage

**Cause**: Health checks failing on new version
**Solution**:
1. Check application logs on canary instances
2. Verify database migrations applied correctly
3. Check for configuration issues
4. Automatic rollback will occur

### Deployment Fails at Smoke Tests

**Cause**: Critical service not responding
**Solution**:
1. Check service logs
2. Verify health check endpoints
3. Check network connectivity
4. Investigate service errors

## Best Practices

1. **Always test releases in staging first** - Run full deployment in staging before production
2. **Monitor during rollout** - Watch metrics and logs during gradual rollout
3. **Have rollback plan ready** - Ensure team knows rollback procedure
4. **Document incidents** - Create incident report if rollback occurs
5. **Review deployment records** - Audit trail for compliance
6. **Keep backups verified** - Regularly test backup restoration
7. **Update health checks** - Ensure all critical endpoints have health checks
8. **Monitor post-deployment** - Watch metrics for 24 hours after deployment

## Requirements Mapping

| Requirement | Implementation |
|-------------|-----------------|
| 7.1: Trigger on release tags | `on: push: tags: ['v*']` |
| 7.2: Pre-deployment validation | `pre-deployment-validation` job |
| 7.3: Database backup before migrations | `database-backup` job |
| 7.4: Gradual rollout with health monitoring | `gradual-rollout` job with 3 stages |
| 7.5: Smoke tests for critical services | `smoke-tests` job |
| 7.5: Manual rollback for 1 hour | `manual-rollback` job with 60-minute window |
| 7.5: Deployment records for audit | `deployment-record` job with JSON artifact |

