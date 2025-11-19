# Production Deployment - Quick Reference

## Triggering a Production Deployment

### Method 1: Release Tag (Automatic)
```bash
git tag v1.2.3
git push origin v1.2.3
```

### Method 2: Manual Trigger
1. Go to GitHub Actions
2. Select "Deploy Production" workflow
3. Click "Run workflow"
4. Enter version (e.g., v1.2.3)
5. Click "Run workflow"

## Deployment Stages

| Stage | Duration | Traffic | Health Checks |
|-------|----------|---------|---------------|
| Canary | 5 min | 5% | Every 10s |
| Progressive | 10 min | 50% | Every 10s |
| Full | 15 min | 100% | Every 10s |

**Total Deployment Time**: ~30 minutes + smoke tests

## Monitoring Deployment

1. **GitHub Actions**: Watch workflow progress
2. **Slack**: Receive notifications on success/failure
3. **Artifacts**: Download logs and deployment record
4. **Health Checks**: Monitor service endpoints

## Deployment Record

Located in artifacts: `deployment-record-{deployment-id}/deployment-record.json`

Contains:
- Deployment ID and version
- Timestamp and git information
- Services deployed
- Database backup details
- Health check results
- Rollback availability and deadline

## Rollback (Within 60 Minutes)

### Quick Rollback
```bash
# 1. Stop traffic to new version
# 2. Restore database
aws s3 cp s3://azora-backups/prod/backup-{deployment-id}.sql.gz - | gunzip | psql

# 3. Redeploy previous version
git tag v1.2.2
git push origin v1.2.2

# 4. Verify services
curl https://azora.world/api/health
```

### Rollback Instructions
Available in artifacts: `rollback-instructions-{deployment-id}/ROLLBACK-INSTRUCTIONS.md`

## Health Check Endpoints

```
API Gateway:      https://azora.world/api/health
Auth Service:     https://azora.world/auth/health
Education:        https://azora.world/api/education/health
Marketplace:      https://azora.world/api/marketplace/health
```

## Troubleshooting

### Deployment Fails at Pre-Deployment Validation
- Check GitHub PR status checks
- Fix failing tests/linting/security issues
- Retry deployment

### Deployment Fails at Canary Stage
- Check application logs
- Verify database migrations
- Automatic rollback will occur

### Deployment Fails at Smoke Tests
- Check service logs
- Verify health check endpoints
- Investigate service errors

## Required Secrets

```
DOCKER_USERNAME
DOCKER_PASSWORD
PROD_HOST
PROD_USER
PROD_KEY
PROD_DATABASE_URL
SLACK_WEBHOOK (optional)
```

## Artifacts Generated

- `backup-logs-{id}` - Database backup logs
- `migration-logs-{id}` - Migration logs
- `build-logs-{id}` - Build logs
- `rollout-logs-{id}` - Rollout logs
- `smoke-test-logs-{id}` - Test results
- `deployment-record-{id}` - Audit record
- `rollback-instructions-{id}` - Rollback procedure
- `deployment-failure-report-{id}` - Failure details (if applicable)

## Key Features

✅ Gradual rollout (canary → progressive → full)
✅ Health monitoring at each stage
✅ Database backup before migrations
✅ Automatic rollback on failure
✅ Smoke tests for critical services
✅ Manual rollback for 60 minutes
✅ Complete audit trail
✅ Team notifications

## Documentation

- **PRODUCTION-DEPLOYMENT-GUIDE.md** - Full documentation
- **PRODUCTION-DEPLOYMENT-IMPLEMENTATION.md** - Implementation details
- **PRODUCTION-DEPLOYMENT-QUICK-REFERENCE.md** - This file

## Support

For issues or questions:
1. Check workflow logs in GitHub Actions
2. Review deployment record artifact
3. Check rollback instructions
4. Contact on-call DevOps team

