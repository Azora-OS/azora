# Deployment Failure Runbook

## Overview

This runbook provides step-by-step procedures for handling deployment failures in staging and production environments. It covers incident response, diagnosis, remediation, and recovery procedures.

---

## Table of Contents

1. [Incident Response](#incident-response)
2. [Staging Deployment Failures](#staging-deployment-failures)
3. [Production Deployment Failures](#production-deployment-failures)
4. [Rollback Procedures](#rollback-procedures)
5. [Post-Incident Review](#post-incident-review)

---

## Incident Response

### Initial Assessment (First 5 minutes)

**Step 1: Identify the incident**
- Check GitHub Actions for failed deployment workflow
- Note the deployment ID and timestamp
- Identify which environment is affected (staging/production)

**Step 2: Assess impact**
- Is the service completely down?
- Are users affected?
- What is the scope (single service or multiple)?

**Step 3: Notify stakeholders**
- Post in #incidents Slack channel
- Include: environment, service, timestamp, initial assessment
- Tag on-call engineer if production

**Step 4: Gather information**
```bash
# Collect deployment details
DEPLOYMENT_ID=$(date +%s)
ENVIRONMENT="staging|production"
SERVICE_NAME="service-name"

# Create incident log
mkdir -p incident-logs
cat > incident-logs/${DEPLOYMENT_ID}.log << EOF
Deployment ID: ${DEPLOYMENT_ID}
Environment: ${ENVIRONMENT}
Service: ${SERVICE_NAME}
Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Status: In Progress
EOF
```

### Severity Classification

| Severity | Criteria | Response Time |
|----------|----------|----------------|
| **Critical** | Production down, users affected | Immediate (< 5 min) |
| **High** | Production degraded, partial outage | Urgent (< 15 min) |
| **Medium** | Staging affected, non-critical service | Standard (< 1 hour) |
| **Low** | Minor issue, no user impact | Planned (< 24 hours) |

---

## Staging Deployment Failures

### Failure Type: Database Migration Failed

**Symptoms:**
- Workflow fails at "Run database migrations" step
- Error message shows SQL error or migration timeout
- Services fail to start due to schema mismatch

**Diagnosis:**

```bash
# SSH to staging server
ssh staging-user@staging-host

# Check migration status
docker exec staging-db psql -U postgres -d azora_staging -c "\dt"

# View migration logs
docker logs staging-db | tail -100

# Check disk space
df -h
```

**Remediation:**

**Option 1: Retry migration (if safe)**
```bash
# On staging server
docker-compose exec api npm run migrate:up

# Verify migration succeeded
docker-compose exec api npm run migrate:status
```

**Option 2: Rollback migration**
```bash
# On staging server
docker-compose exec api npm run migrate:down

# Verify rollback
docker-compose exec api npm run migrate:status
```

**Option 3: Manual database fix**
```bash
# Connect to database
docker exec -it staging-db psql -U postgres -d azora_staging

# Check migration table
SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 5;

# Manually fix if needed
-- Run corrective SQL
```

**Recovery:**

1. Fix the migration file if there's a syntax error
2. Commit fix to repository
3. Trigger deployment again
4. Verify migration succeeds

---

### Failure Type: Health Check Failed

**Symptoms:**
- Workflow fails at "Health checks" step
- Services return 500 error
- Timeout waiting for health endpoint

**Diagnosis:**

```bash
# SSH to staging server
ssh staging-user@staging-host

# Check service status
docker-compose ps

# Test health endpoint
curl -v http://localhost:3000/health

# Check service logs
docker-compose logs api | tail -50

# Check resource usage
docker stats
```

**Remediation:**

**Option 1: Restart services**
```bash
# On staging server
docker-compose restart

# Wait for services to start
sleep 30

# Test health endpoint
curl http://localhost:3000/health
```

**Option 2: Check dependencies**
```bash
# Verify database is running
docker-compose ps postgres

# Verify Redis is running
docker-compose ps redis

# Check database connection
docker-compose exec api npm run check:db

# Check Redis connection
docker-compose exec api npm run check:redis
```

**Option 3: Review service logs**
```bash
# Get detailed logs
docker-compose logs api --tail=200

# Look for error patterns
docker-compose logs api | grep -i error

# Check environment variables
docker-compose exec api env | grep -i database
```

**Recovery:**

1. Identify root cause from logs
2. Fix configuration or code issue
3. Rebuild Docker image if needed
4. Trigger deployment again

---

### Failure Type: Docker Build Failed

**Symptoms:**
- Workflow fails at "Build Docker image" step
- Error shows build error or dependency issue
- Image not pushed to registry

**Diagnosis:**

```bash
# Check Docker build logs in workflow
# GitHub Actions → deploy-staging → build-image job

# Try building locally
docker build -t azora-api:test .

# Check Dockerfile
cat Dockerfile

# Check Docker registry
docker login
docker images | grep azora
```

**Remediation:**

**Option 1: Fix Dockerfile**
```dockerfile
# Common issues:
# - Missing RUN npm ci
# - Wrong base image
# - Missing environment variables

# Example fix:
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

**Option 2: Fix dependencies**
```bash
# Update package-lock.json
npm ci

# Rebuild locally
docker build -t azora-api:test .

# Push to registry
docker tag azora-api:test registry/azora-api:test
docker push registry/azora-api:test
```

**Recovery:**

1. Commit Dockerfile fix
2. Trigger deployment again
3. Verify Docker image builds successfully

---

## Production Deployment Failures

### Failure Type: Pre-deployment Checks Failed

**Symptoms:**
- Workflow fails at "Pre-deployment validation" step
- Status checks not passed
- Security scan failed

**Diagnosis:**

```bash
# Check which status check failed
# GitHub Actions → deploy-production → pre-deploy job

# Review status checks
# GitHub PR/Release → Checks tab

# Check security scan results
# GitHub Actions → security workflow
```

**Remediation:**

**Option 1: Fix failing tests**
```bash
# Run tests locally
npm run test:unit

# Fix failing tests
# Commit fixes
git add .
git commit -m "fix: resolve failing tests"
git push

# Re-run deployment
```

**Option 2: Fix security issues**
```bash
# Run security scan
npm run security:audit

# Fix vulnerabilities
npm audit fix

# Commit fixes
git add .
git commit -m "fix: resolve security vulnerabilities"
git push

# Re-run deployment
```

**Option 3: Override checks (if justified)**
```bash
# Only if issue is false positive or known acceptable risk
# Contact security team for approval
# Document override reason in PR
```

**Recovery:**

1. Resolve all failing checks
2. Ensure all status checks pass
3. Trigger deployment again

---

### Failure Type: Database Migration Failed in Production

**Symptoms:**
- Workflow fails at "Run database migrations" step
- Production database locked or corrupted
- Services cannot start

**Severity:** CRITICAL

**Diagnosis:**

```bash
# SSH to production server
ssh prod-user@prod-host

# Check database status
docker exec prod-db psql -U postgres -d azora_prod -c "SELECT * FROM pg_stat_activity;"

# Check migration status
docker exec prod-db psql -U postgres -d azora_prod -c "SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 10;"

# Check disk space
df -h

# Check database size
docker exec prod-db psql -U postgres -d azora_prod -c "SELECT pg_size_pretty(pg_database_size('azora_prod'));"
```

**Remediation:**

**CRITICAL: Do NOT proceed without backup verification**

```bash
# Verify backup exists and is recent
ls -lah /backups/
ls -lah /backups/azora_prod_*.sql.gz | head -1

# Check backup integrity
gunzip -t /backups/azora_prod_latest.sql.gz
```

**Option 1: Rollback migration (if safe)**
```bash
# On production server
docker-compose exec api npm run migrate:down

# Verify rollback
docker-compose exec api npm run migrate:status

# Restart services
docker-compose restart

# Test health endpoint
curl https://azora.world/health
```

**Option 2: Restore from backup**
```bash
# ONLY if migration corrupted data

# Stop services
docker-compose down

# Restore database
gunzip < /backups/azora_prod_latest.sql.gz | \
  docker exec -i prod-db psql -U postgres -d azora_prod

# Restart services
docker-compose up -d

# Verify health
curl https://azora.world/health
```

**Option 3: Manual database fix**
```bash
# Connect to database
docker exec -it prod-db psql -U postgres -d azora_prod

# Identify issue
SELECT * FROM migrations WHERE status = 'failed';

# Fix migration record
UPDATE migrations SET status = 'completed' WHERE id = X;

# Verify fix
SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 5;
```

**Recovery:**

1. Verify database integrity
2. Run health checks
3. Monitor error rates
4. Document incident
5. Post-mortem on migration issue

---

### Failure Type: Service Deployment Failed

**Symptoms:**
- Workflow fails at "Deploy services" step
- Docker container fails to start
- Service not responding

**Severity:** CRITICAL

**Diagnosis:**

```bash
# SSH to production server
ssh prod-user@prod-host

# Check service status
docker-compose ps

# Check service logs
docker-compose logs api --tail=100

# Check resource usage
docker stats

# Test service endpoint
curl -v https://azora.world/health
```

**Remediation:**

**Option 1: Restart service**
```bash
# On production server
docker-compose restart api

# Wait for service to start
sleep 30

# Test health endpoint
curl https://azora.world/health
```

**Option 2: Check environment variables**
```bash
# Verify environment variables
docker-compose exec api env | grep -i database

# Check .env file
cat .env

# Verify secrets are set
docker-compose config | grep -i secret
```

**Option 3: Rollback to previous version**
```bash
# Get previous image version
docker images | grep azora-api

# Update docker-compose.yml to use previous version
# Edit docker-compose.yml
# Change image: azora-api:new to azora-api:old

# Restart services
docker-compose up -d

# Verify health
curl https://azora.world/health
```

**Recovery:**

1. Identify root cause from logs
2. Fix issue (code, config, or environment)
3. Rebuild and redeploy
4. Monitor error rates
5. Document incident

---

### Failure Type: Health Check Failed in Production

**Symptoms:**
- Workflow fails at "Health checks" step
- Services return 500 error
- Automatic rollback triggered

**Severity:** CRITICAL

**Diagnosis:**

```bash
# SSH to production server
ssh prod-user@prod-host

# Check service status
docker-compose ps

# Test health endpoint
curl -v https://azora.world/health

# Check service logs
docker-compose logs api | tail -100

# Check database connection
docker-compose exec api npm run check:db

# Check external service connections
docker-compose exec api npm run check:services
```

**Remediation:**

**Option 1: Restart services**
```bash
# On production server
docker-compose restart

# Wait for services to stabilize
sleep 60

# Test health endpoint
curl https://azora.world/health
```

**Option 2: Check dependencies**
```bash
# Verify database is healthy
docker-compose exec postgres pg_isready

# Verify Redis is healthy
docker-compose exec redis redis-cli ping

# Check external service connectivity
docker-compose exec api npm run check:external-services
```

**Option 3: Trigger automatic rollback**
```bash
# If services cannot be recovered
# GitHub Actions → deploy-production → rollback job

# Or manual rollback
docker-compose down
docker-compose up -d  # Starts previous version
```

**Recovery:**

1. Verify services are healthy
2. Monitor error rates and latency
3. Investigate root cause
4. Fix issue
5. Plan re-deployment

---

## Rollback Procedures

### Automatic Rollback

**When it triggers:**
- Health checks fail after deployment
- Services return 500 errors
- Deployment marked as failed

**What it does:**
1. Stops new services
2. Restarts previous version
3. Verifies health checks pass
4. Notifies team

**Verification:**

```bash
# Check rollback status
# GitHub Actions → deploy-production → rollback job

# Verify services are running
curl https://azora.world/health

# Check service version
curl https://azora.world/version

# Monitor error rates
# Check monitoring dashboard
```

### Manual Rollback

**When to use:**
- Automatic rollback didn't work
- Need to rollback after 1 hour window
- Planned rollback for investigation

**Procedure:**

```bash
# SSH to production server
ssh prod-user@prod-host

# Get previous image version
docker images | grep azora-api | head -5

# Stop current services
docker-compose down

# Update docker-compose.yml to use previous version
# Edit docker-compose.yml
# Change image tag to previous version

# Start services
docker-compose up -d

# Wait for services to start
sleep 30

# Verify health
curl https://azora.world/health

# Monitor error rates
# Check monitoring dashboard
```

**Verification:**

```bash
# Confirm rollback successful
curl https://azora.world/version

# Check error rates
# Monitor dashboard should show improvement

# Verify all services healthy
docker-compose ps

# Check logs for errors
docker-compose logs | grep -i error
```

### Rollback Limitations

**Time window:** 1 hour after deployment
- After 1 hour, previous version may be garbage collected
- Plan rollback within this window

**Data considerations:**
- Database migrations cannot be rolled back automatically
- Manual database rollback may be needed
- Coordinate with DBA for data rollback

**Communication:**
- Notify stakeholders of rollback
- Document reason for rollback
- Plan re-deployment

---

## Post-Incident Review

### Immediate Actions (Within 1 hour)

**Step 1: Stabilize the system**
- Verify services are healthy
- Monitor error rates
- Confirm users can access service

**Step 2: Document incident**
```bash
# Create incident report
cat > incident-logs/${DEPLOYMENT_ID}-report.md << EOF
# Incident Report

## Summary
- Deployment ID: ${DEPLOYMENT_ID}
- Environment: ${ENVIRONMENT}
- Service: ${SERVICE_NAME}
- Duration: X minutes
- Impact: X users affected

## Timeline
- 10:00 UTC: Deployment started
- 10:05 UTC: Health check failed
- 10:06 UTC: Automatic rollback triggered
- 10:07 UTC: Services recovered

## Root Cause
[Describe root cause]

## Resolution
[Describe how it was resolved]

## Action Items
- [ ] Fix root cause
- [ ] Add monitoring alert
- [ ] Update runbook
- [ ] Post-mortem meeting
EOF
```

**Step 3: Notify stakeholders**
- Post incident summary in Slack
- Include timeline and impact
- Provide ETA for resolution

### Short-term Actions (Within 24 hours)

**Step 1: Root cause analysis**
- Review deployment logs
- Check code changes
- Identify what went wrong

**Step 2: Implement fix**
- Create fix branch
- Test fix locally
- Get code review
- Merge to main

**Step 3: Plan re-deployment**
- Ensure all checks pass
- Schedule deployment
- Notify stakeholders

### Long-term Actions (Within 1 week)

**Step 1: Post-mortem meeting**
- Review incident timeline
- Discuss root cause
- Identify prevention measures

**Step 2: Implement preventive measures**
- Add monitoring alerts
- Improve test coverage
- Update deployment procedures
- Update runbook

**Step 3: Update documentation**
- Document lessons learned
- Update troubleshooting guide
- Share knowledge with team

---

## Escalation Procedures

### When to Escalate

| Situation | Action |
|-----------|--------|
| Cannot identify root cause | Escalate to DevOps lead |
| Production down > 15 min | Escalate to VP Engineering |
| Data loss suspected | Escalate to CTO + Legal |
| Security breach suspected | Escalate to Security team |
| Multiple services affected | Escalate to Incident Commander |

### Escalation Contacts

```
On-Call Engineer: #on-call Slack channel
DevOps Lead: @devops-lead
VP Engineering: @vp-engineering
CTO: @cto
Security Team: @security-team
Incident Commander: @incident-commander
```

---

## Quick Reference

### Critical Commands

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs -f service-name

# Restart services
docker-compose restart

# Rollback deployment
docker-compose down && docker-compose up -d

# Test health endpoint
curl https://azora.world/health

# Check database
docker exec prod-db psql -U postgres -d azora_prod -c "SELECT 1;"

# Verify backup
ls -lah /backups/ | head -5
```

### Monitoring Dashboards

- **Error Rates:** https://monitoring.azora.world/errors
- **Latency:** https://monitoring.azora.world/latency
- **Service Health:** https://monitoring.azora.world/health
- **Database:** https://monitoring.azora.world/database
- **Deployment Status:** GitHub Actions tab

### Important Files

- Deployment logs: `.github/workflows/deploy-production.yml`
- Incident logs: `incident-logs/`
- Backup location: `/backups/`
- Configuration: `docker-compose.yml`
- Environment: `.env`

