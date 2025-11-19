# Staging Deployment Workflow Guide

## Overview

The enhanced `deploy-staging.yml` workflow provides automated, reliable deployments to the staging environment with comprehensive health checks, database migrations, and automatic rollback capabilities.

## Workflow Triggers

The staging deployment workflow is triggered automatically when:
- Code is pushed to the `main` branch
- Manually triggered via `workflow_dispatch`

## Workflow Architecture

The workflow is organized into 5 sequential jobs:

### 1. Pre-Deployment Checks
- Generates a unique deployment ID for tracking
- Verifies all required status checks have passed
- Ensures code quality, tests, and security scans are successful

**Outputs:**
- `deployment-id`: Unique identifier for this deployment (format: `{timestamp}-{git-sha}`)

### 2. Database Migrations
- Runs Prisma database migrations on the staging environment
- Logs all migration operations for audit trails
- Fails fast if migrations encounter errors
- Uploads migration logs as artifacts

**Requirements:**
- `STAGING_DATABASE_URL` secret must be configured
- Database must be accessible from GitHub Actions runners

**Logs:**
- Stored as artifact: `migration-logs-{deployment-id}`
- Retention: 365 days

### 3. Build and Deploy
- Installs dependencies
- Builds the application
- Builds and pushes Docker images
- Deploys services to staging environment
- Generates comprehensive deployment logs

**Requirements:**
- `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets for Docker Hub
- `STAGING_HOST`, `STAGING_USER`, `STAGING_KEY` secrets for deployment access

**Logs:**
- `build-{deployment-id}.log`: Application build output
- `docker-build-{deployment-id}.log`: Docker build and push output
- `deployment-{deployment-id}.log`: Deployment execution log
- All stored as artifacts with 365-day retention

### 4. Health Checks
- Waits 30 seconds for services to stabilize
- Checks API Gateway health endpoint
- Checks Auth Service health endpoint
- Verifies database connectivity
- Runs smoke tests
- Aggregates results and fails if critical services are unhealthy

**Health Check Configuration:**
- Retries: 5 attempts per service
- Interval: 10 seconds between retries
- Timeout: 10 seconds per request
- Total timeout: ~5 minutes per service

**Checked Services:**
- API Gateway: `https://staging.azora.world/api/health`
- Auth Service: `https://staging.azora.world/auth/health`
- Database: Connectivity verification
- Smoke Tests: Critical endpoint validation

**Logs:**
- Stored as artifact: `health-check-logs-{deployment-id}`
- Retention: 365 days

### 5. Rollback on Failure (Conditional)
- Triggered only if health checks fail
- Initiates automatic rollback to previous stable version
- Verifies rollback success
- Notifies team via Slack
- Uploads rollback logs

**Logs:**
- Stored as artifact: `rollback-logs-{deployment-id}`
- Retention: 365 days

### 6. Deployment Summary (On Success)
- Creates deployment record with metadata
- Uploads deployment record as artifact
- Notifies team of successful deployment via Slack

**Deployment Record Contents:**
- Timestamp
- Deployment ID
- Environment
- Status
- Git SHA and ref
- Services deployed
- Health check results
- Rollback availability

## Required Secrets

Configure these secrets in your GitHub repository settings:

| Secret | Description | Example |
|--------|-------------|---------|
| `STAGING_DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `DOCKER_USERNAME` | Docker Hub username | `azoraos` |
| `DOCKER_PASSWORD` | Docker Hub password/token | `dckr_pat_...` |
| `STAGING_HOST` | Staging server hostname | `staging.azora.world` |
| `STAGING_USER` | SSH user for staging | `deploy` |
| `STAGING_KEY` | SSH private key for staging | (base64 encoded) |
| `SLACK_WEBHOOK` | Slack webhook URL (optional) | `https://hooks.slack.com/...` |

## Environment Variables

The workflow uses these environment variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `DEPLOYMENT_LOG_DIR` | `deployment-logs` | Directory for storing logs |
| `HEALTH_CHECK_TIMEOUT` | `300` | Total timeout for health checks (seconds) |
| `HEALTH_CHECK_RETRIES` | `5` | Number of retry attempts per service |
| `HEALTH_CHECK_INTERVAL` | `10` | Delay between retry attempts (seconds) |

## Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Code pushed to main branch                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Pre-Deployment Checks      │
        │ - Generate deployment ID   │
        │ - Verify status checks     │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Database Migrations        │
        │ - Run Prisma migrations    │
        │ - Log operations           │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Build and Deploy           │
        │ - Build application        │
        │ - Build Docker images      │
        │ - Deploy to staging        │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Health Checks              │
        │ - Check all services       │
        │ - Run smoke tests          │
        └────────────┬───────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ✓ PASS                   ✗ FAIL
         │                       │
         ▼                       ▼
    ┌─────────────┐      ┌──────────────┐
    │ Deployment  │      │ Rollback     │
    │ Summary     │      │ - Restore    │
    │ - Record    │      │ - Verify     │
    │ - Notify    │      │ - Notify     │
    └─────────────┘      └──────────────┘
```

## Monitoring and Logs

### Accessing Logs

All deployment logs are stored as GitHub Actions artifacts:

1. Go to the workflow run in GitHub Actions
2. Scroll to "Artifacts" section
3. Download the relevant log file:
   - `migration-logs-{deployment-id}`: Database migration details
   - `deployment-logs-{deployment-id}`: Build and deployment logs
   - `health-check-logs-{deployment-id}`: Health check results
   - `rollback-logs-{deployment-id}`: Rollback details (if applicable)
   - `deployment-record-{deployment-id}`: Deployment metadata

### Deployment Record

The deployment record is a JSON file containing:
```json
{
  "timestamp": "2024-11-19T10:30:00Z",
  "deployment_id": "1234567890-abc123def456",
  "environment": "staging",
  "status": "success",
  "git_sha": "abc123def456...",
  "git_ref": "refs/heads/main",
  "services_deployed": [
    "api-gateway",
    "auth-service",
    "education-service",
    "marketplace-service"
  ],
  "health_checks": {
    "api_gateway": "healthy",
    "auth_service": "healthy",
    "database": "healthy",
    "smoke_tests": "passed"
  },
  "rollback_available": true
}
```

## Troubleshooting

### Database Migration Failures

**Problem:** Migration step fails
**Solution:**
1. Check `migration-logs-{deployment-id}` artifact
2. Review the specific migration that failed
3. Fix the migration file in `prisma/migrations/`
4. Manually run `npx prisma migrate deploy` on staging if needed
5. Retry the deployment

### Health Check Failures

**Problem:** One or more services fail health checks
**Solution:**
1. Check `health-check-logs-{deployment-id}` artifact
2. SSH into staging environment and check service logs
3. Verify services are running: `docker ps`
4. Check service endpoints manually
5. Automatic rollback will restore previous version
6. Investigate root cause before redeploying

### Docker Build Failures

**Problem:** Docker image build fails
**Solution:**
1. Check `docker-build-{deployment-id}` artifact
2. Verify Docker credentials are correct
3. Check Dockerfile for syntax errors
4. Ensure all dependencies are available
5. Test build locally: `docker-compose -f docker-compose.prod.yml build`

### Deployment Failures

**Problem:** Deployment step fails
**Solution:**
1. Check `deployment-{deployment-id}` artifact
2. Verify SSH credentials and access
3. Check staging server disk space and resources
4. Verify deployment scripts are executable
5. Check network connectivity to staging environment

## Manual Rollback

If automatic rollback doesn't work or you need to manually rollback:

1. SSH into staging environment
2. Identify previous stable version
3. Restore previous Docker images
4. Run database rollback if needed
5. Verify health checks pass
6. Document the incident

## Best Practices

1. **Always test locally first**: Run `npm run build` and `npm run test` locally before pushing
2. **Monitor deployments**: Watch the workflow run in GitHub Actions
3. **Check logs immediately**: Review logs if deployment fails
4. **Verify health checks**: Manually test endpoints after deployment
5. **Keep secrets secure**: Never commit secrets to repository
6. **Document changes**: Include migration descriptions in commit messages
7. **Plan maintenance windows**: Schedule deployments during low-traffic periods

## Performance Optimization

- Workflow uses npm caching to speed up dependency installation
- Docker layer caching reduces build time
- Parallel health checks run concurrently
- Artifact retention policies prevent storage bloat

## Future Enhancements

- Canary deployments with gradual traffic shifting
- Automated performance regression detection
- Integration with monitoring/alerting systems
- Multi-region deployment support
- Advanced rollback strategies (blue-green deployments)
- Deployment approval gates for critical changes
