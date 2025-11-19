# Production Rollback Procedures

## Overview

This document provides detailed procedures for rolling back production deployments. Rollbacks are used when a deployment introduces issues that cannot be quickly fixed, requiring reversion to the previous stable version.

---

## Table of Contents

1. [Rollback Decision Matrix](#rollback-decision-matrix)
2. [Automatic Rollback](#automatic-rollback)
3. [Manual Rollback Procedures](#manual-rollback-procedures)
4. [Verification Steps](#verification-steps)
5. [Post-Rollback Actions](#post-rollback-actions)
6. [Rollback Limitations](#rollback-limitations)

---

## Rollback Decision Matrix

### When to Rollback

| Scenario | Action | Urgency |
|----------|--------|---------|
| **Critical bug affecting users** | Rollback immediately | CRITICAL |
| **Service completely down** | Rollback immediately | CRITICAL |
| **Data corruption detected** | Rollback + restore backup | CRITICAL |
| **Performance degradation > 50%** | Rollback if not fixable in 15 min | HIGH |
| **Partial service outage** | Rollback if not fixable in 30 min | HIGH |
| **Minor bug, workaround available** | Fix forward instead | LOW |
| **Staging environment issue** | Rollback or redeploy | LOW |

### Rollback vs. Fix Forward

**Rollback when:**
- Issue is critical and affects users
- Root cause unknown
- Fix would take > 30 minutes
- Previous version is known stable

**Fix forward when:**
- Issue is minor
- Fix is quick (< 15 minutes)
- Root cause identified
- Rollback would cause data loss

---

## Automatic Rollback

### How It Works

The production deployment workflow includes automatic rollback on health check failure:

```yaml
# deploy-production.yml
- name: Health checks
  run: |
    for i in {1..5}; do
      if curl -f https://azora.world/health; then
        echo "✓ Health check passed"
        exit 0
      fi
      sleep 10
    done
    echo "✗ Health check failed"
    exit 1

- name: Automatic rollback on failure
  if: failure()
  run: |
    # Rollback to previous version
    docker-compose down
    docker-compose up -d  # Starts previous version
```

### Automatic Rollback Triggers

Automatic rollback is triggered when:
1. Health checks fail after deployment
2. Services return 500 errors
3. Database migrations fail
4. Docker image fails to start

### Automatic Rollback Limitations

- **Time window:** Only available during deployment workflow
- **Data considerations:** Database migrations not automatically rolled back
- **Manual intervention:** May be needed for data rollback

### Monitoring Automatic Rollback

```bash
# Check rollback status
# GitHub Actions → deploy-production → rollback job

# Verify services recovered
curl https://azora.world/health

# Check service version
curl https://azora.world/version

# Monitor error rates
# Check monitoring dashboard
```

---

## Manual Rollback Procedures

### Prerequisites

Before performing manual rollback:

1. **Verify you have access:**
   ```bash
   ssh prod-user@prod-host
   ```

2. **Verify backup exists:**
   ```bash
   ls -lah /backups/azora_prod_*.sql.gz | head -1
   ```

3. **Document the rollback:**
   ```bash
   cat > /tmp/rollback-log.txt << EOF
   Rollback initiated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
   Reason: [describe reason]
   Initiated by: [your name]
   EOF
   ```

### Procedure 1: Simple Service Rollback (No Data Changes)

**Use when:** Code issue only, no database changes

**Steps:**

```bash
# 1. SSH to production server
ssh prod-user@prod-host

# 2. Check current version
docker-compose ps
docker images | grep azora-api

# 3. Get previous image version
docker images | grep azora-api | head -5
# Output example:
# azora-api    v1.2.3    abc123    2 hours ago
# azora-api    v1.2.2    def456    1 day ago

# 4. Stop current services
docker-compose down

# 5. Update docker-compose.yml to use previous version
# Edit the file and change:
# FROM: image: azora-api:v1.2.3
# TO:   image: azora-api:v1.2.2
nano docker-compose.yml

# 6. Start services with previous version
docker-compose up -d

# 7. Wait for services to start
sleep 30

# 8. Verify health
curl https://azora.world/health

# 9. Check service version
curl https://azora.world/version

# 10. Monitor error rates
# Check monitoring dashboard for 5 minutes
```

**Verification:**
```bash
# Confirm rollback successful
docker-compose ps  # All services running?
curl https://azora.world/health  # Returns 200?
curl https://azora.world/version  # Shows previous version?
```

### Procedure 2: Rollback with Database Migration Rollback

**Use when:** Database schema changed and needs rollback

**Steps:**

```bash
# 1. SSH to production server
ssh prod-user@prod-host

# 2. Verify backup exists
ls -lah /backups/azora_prod_*.sql.gz | head -1

# 3. Stop services
docker-compose down

# 4. Check current migration status
docker exec prod-db psql -U postgres -d azora_prod -c \
  "SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 5;"

# 5. Rollback migration (if safe)
docker-compose exec api npm run migrate:down

# 6. Verify migration rolled back
docker-compose exec api npm run migrate:status

# 7. Update docker-compose.yml to previous version
nano docker-compose.yml

# 8. Start services
docker-compose up -d

# 9. Wait for services to start
sleep 30

# 10. Verify health
curl https://azora.world/health

# 11. Monitor for 10 minutes
# Check error rates and latency
```

**Verification:**
```bash
# Confirm migration rolled back
docker exec prod-db psql -U postgres -d azora_prod -c \
  "SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 5;"

# Confirm services healthy
curl https://azora.world/health
```

### Procedure 3: Full Database Restore from Backup

**Use when:** Data corruption or critical data loss

**⚠️ CRITICAL: This procedure causes data loss**

**Steps:**

```bash
# 1. SSH to production server
ssh prod-user@prod-host

# 2. Verify backup integrity
gunzip -t /backups/azora_prod_latest.sql.gz
# Should complete without errors

# 3. Stop services
docker-compose down

# 4. Create safety backup of current database
docker exec prod-db pg_dump -U postgres azora_prod | \
  gzip > /backups/azora_prod_pre-restore_$(date +%s).sql.gz

# 5. Drop current database
docker exec prod-db psql -U postgres -c "DROP DATABASE azora_prod;"

# 6. Create new database
docker exec prod-db psql -U postgres -c "CREATE DATABASE azora_prod;"

# 7. Restore from backup
gunzip < /backups/azora_prod_latest.sql.gz | \
  docker exec -i prod-db psql -U postgres -d azora_prod

# 8. Verify restore
docker exec prod-db psql -U postgres -d azora_prod -c "SELECT COUNT(*) FROM users;"

# 9. Update docker-compose.yml to previous version
nano docker-compose.yml

# 10. Start services
docker-compose up -d

# 11. Wait for services to start
sleep 30

# 12. Verify health
curl https://azora.world/health

# 13. Monitor closely for 30 minutes
```

**Verification:**
```bash
# Confirm data restored
docker exec prod-db psql -U postgres -d azora_prod -c \
  "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM orders;"

# Confirm services healthy
curl https://azora.world/health

# Check error rates
# Monitor dashboard should show normal operation
```

### Procedure 4: Emergency Rollback (Fastest)

**Use when:** Service completely down, need immediate recovery

**Steps:**

```bash
# 1. SSH to production server
ssh prod-user@prod-host

# 2. Stop everything
docker-compose down

# 3. Remove current images (optional, to force pull)
docker rmi azora-api:latest

# 4. Start with previous version
# Edit docker-compose.yml to use known-good version
nano docker-compose.yml

# 5. Start services
docker-compose up -d

# 6. Verify immediately
curl https://azora.world/health

# 7. If still failing, restore from backup
# Follow Procedure 3
```

**Verification:**
```bash
# Quick health check
curl https://azora.world/health

# If not healthy, proceed to full restore
```

---

## Verification Steps

### Immediate Verification (First 5 minutes)

```bash
# 1. Check service status
docker-compose ps
# All services should show "Up"

# 2. Test health endpoint
curl -v https://azora.world/health
# Should return 200 OK with healthy status

# 3. Check service version
curl https://azora.world/version
# Should show previous version

# 4. Test basic functionality
curl https://azora.world/api/users
# Should return valid response

# 5. Check error logs
docker-compose logs | grep -i error
# Should show no critical errors
```

### Extended Verification (First 30 minutes)

```bash
# 1. Monitor error rates
# Check monitoring dashboard
# Error rate should be near 0%

# 2. Monitor latency
# Check monitoring dashboard
# Latency should be normal

# 3. Check database integrity
docker exec prod-db psql -U postgres -d azora_prod -c \
  "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM orders;"
# Should show expected counts

# 4. Check service logs for warnings
docker-compose logs | grep -i warning
# Should show no critical warnings

# 5. Test critical user flows
# Manually test key features
# Login, create order, etc.
```

### Comprehensive Verification (First 2 hours)

```bash
# 1. Run smoke tests
npm run test:smoke

# 2. Check all services
for service in api auth payment; do
  curl https://azora.world/$service/health
done

# 3. Monitor metrics
# Check all monitoring dashboards
# CPU, memory, disk usage normal?

# 4. Check external integrations
# Payment gateway working?
# Email service working?
# Analytics working?

# 5. Review logs for any issues
docker-compose logs --tail=1000 | grep -i error
```

---

## Post-Rollback Actions

### Immediate Actions (Within 1 hour)

**Step 1: Notify stakeholders**
```bash
# Post in #incidents Slack channel
# Message: "Rollback completed. Service restored to v1.2.2. 
#           Investigating root cause. ETA for fix: X hours"
```

**Step 2: Document incident**
```bash
cat > incident-logs/rollback-$(date +%s).md << EOF
# Rollback Report

## Summary
- Deployment version: v1.2.3
- Rollback to version: v1.2.2
- Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
- Duration: X minutes
- Impact: X users affected

## Root Cause
[Describe what went wrong]

## Resolution
[Describe rollback procedure used]

## Next Steps
- [ ] Root cause analysis
- [ ] Fix implementation
- [ ] Testing
- [ ] Re-deployment
EOF
```

**Step 3: Disable problematic code**
```bash
# If issue is in feature flag, disable it
# If issue is in new code, revert commit
git revert <commit-hash>
git push origin main
```

### Short-term Actions (Within 24 hours)

**Step 1: Root cause analysis**
- Review deployment changes
- Check error logs
- Identify what went wrong

**Step 2: Implement fix**
```bash
# Create fix branch
git checkout -b fix/issue-description

# Make changes
# Test locally
npm run test:unit
npm run test:e2e

# Commit and push
git add .
git commit -m "fix: resolve issue from v1.2.3"
git push origin fix/issue-description

# Create PR and get review
```

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
- Add integration tests
- Update deployment procedures

**Step 3: Update documentation**
- Document lessons learned
- Update troubleshooting guide
- Share knowledge with team

---

## Rollback Limitations

### Time Window

**Automatic rollback:** Available during deployment workflow only
- Typically 30-60 minutes after deployment starts
- After workflow completes, automatic rollback not available

**Manual rollback:** Available indefinitely
- Can rollback hours or days after deployment
- Limited by backup retention (typically 30 days)

### Data Considerations

**Code rollback:** Immediate and safe
- No data loss
- Services revert to previous version
- Can be done multiple times

**Database migration rollback:** Requires caution
- May cause data loss
- Requires manual intervention
- Coordinate with DBA

**Data restore:** Causes data loss
- Reverts to backup point
- All changes since backup are lost
- Last resort only

### Service Dependencies

**Rollback may fail if:**
- Previous version incompatible with current database
- External service API changed
- Configuration incompatible
- Secrets/credentials changed

**Mitigation:**
- Test rollback procedure regularly
- Maintain backward compatibility
- Document breaking changes
- Plan for data migration

### Backup Limitations

**Backup retention:** 30 days
- Older backups automatically deleted
- Cannot restore beyond 30 days
- Plan accordingly for long-term rollback

**Backup size:** May be large
- Restore takes time
- Requires disk space
- Plan for restore window

---

## Rollback Checklist

### Pre-Rollback

- [ ] Verify issue is critical enough to warrant rollback
- [ ] Notify stakeholders
- [ ] Verify backup exists and is recent
- [ ] Document reason for rollback
- [ ] Identify previous stable version
- [ ] Have rollback procedure ready
- [ ] Ensure SSH access to production

### During Rollback

- [ ] Stop services
- [ ] Update configuration
- [ ] Restore database (if needed)
- [ ] Start services
- [ ] Wait for services to start
- [ ] Test health endpoint
- [ ] Monitor error rates

### Post-Rollback

- [ ] Verify all services healthy
- [ ] Monitor for 30 minutes
- [ ] Notify stakeholders
- [ ] Document incident
- [ ] Begin root cause analysis
- [ ] Plan fix and re-deployment
- [ ] Schedule post-mortem

---

## Quick Reference

### Rollback Commands

```bash
# Check current version
docker-compose ps
docker images | grep azora-api

# Stop services
docker-compose down

# Update version in docker-compose.yml
nano docker-compose.yml

# Start services
docker-compose up -d

# Verify health
curl https://azora.world/health

# Check logs
docker-compose logs -f
```

### Important Locations

- **Backups:** `/backups/`
- **Configuration:** `docker-compose.yml`
- **Environment:** `.env`
- **Logs:** `docker-compose logs`
- **Incident logs:** `incident-logs/`

### Monitoring Dashboards

- **Error Rates:** https://monitoring.azora.world/errors
- **Latency:** https://monitoring.azora.world/latency
- **Service Health:** https://monitoring.azora.world/health
- **Database:** https://monitoring.azora.world/database

### Escalation Contacts

- **On-Call Engineer:** #on-call Slack
- **DevOps Lead:** @devops-lead
- **VP Engineering:** @vp-engineering
- **CTO:** @cto

