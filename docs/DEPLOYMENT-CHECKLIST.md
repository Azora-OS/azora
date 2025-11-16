# Production Deployment Checklist

## Overview

This checklist ensures all requirements are met before deploying to production. Use this document to verify system readiness and prevent deployment issues.

**Last Updated**: November 2025  
**Deployment Strategy**: Blue-green with canary releases  
**Rollback Time**: < 5 minutes

---

## Pre-Deployment Checks (48 hours before)

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Test coverage ≥ 80% (`npm test -- --coverage`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Code review approved by 2+ team members
- [ ] All PR comments resolved

### Security
- [ ] Security audit passed (`npm audit`)
- [ ] No critical vulnerabilities
- [ ] No high-severity vulnerabilities unresolved
- [ ] OWASP dependency check passed
- [ ] Secrets configured in production environment
- [ ] API keys rotated (if applicable)
- [ ] SSL/TLS certificates valid

### Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md updated with release notes
- [ ] API documentation current
- [ ] Deployment guide reviewed
- [ ] Runbooks updated
- [ ] Known issues documented

### Database
- [ ] Database backup created
- [ ] Migrations tested locally
- [ ] Migrations tested in staging
- [ ] Rollback plan documented
- [ ] Data validation scripts prepared
- [ ] Database capacity verified

### Infrastructure
- [ ] Kubernetes cluster healthy
- [ ] All nodes ready
- [ ] Storage capacity sufficient
- [ ] Network connectivity verified
- [ ] Load balancers configured
- [ ] DNS records verified

### Monitoring & Alerting
- [ ] Grafana dashboards configured
- [ ] Prometheus scrape targets verified
- [ ] Alert rules configured
- [ ] Alertmanager configured
- [ ] Log aggregation working
- [ ] Distributed tracing enabled

### Team Readiness
- [ ] Deployment team briefed
- [ ] On-call engineer assigned
- [ ] Escalation contacts documented
- [ ] Communication channels open
- [ ] Rollback team ready
- [ ] Stakeholders notified

---

## Deployment Day Checks (2 hours before)

### Final Verification
- [ ] Run deployment validator: `npm run deploy:validate`
- [ ] All checks passed
- [ ] No new commits since last test run
- [ ] Staging deployment successful
- [ ] Staging smoke tests passed
- [ ] Performance benchmarks met

### System Health
- [ ] API gateway responding
- [ ] Database connections healthy
- [ ] Cache layer operational
- [ ] Message queues empty
- [ ] External services accessible
- [ ] Rate limiters configured

### Backup & Recovery
- [ ] Database backup verified
- [ ] Kubernetes configuration backed up
- [ ] Previous version tagged in registry
- [ ] Rollback procedure tested
- [ ] Recovery time objective (RTO) < 5 minutes
- [ ] Recovery point objective (RPO) < 1 hour

### Communication
- [ ] Deployment window announced
- [ ] Status page updated
- [ ] Team in communication channel
- [ ] Stakeholders on standby
- [ ] Customer support briefed
- [ ] Incident response team ready

---

## Deployment Execution

### Phase 1: Pre-Deployment (T-30 minutes)

```bash
# 1. Verify all checks
npm run deploy:validate

# 2. Create database backup
kubectl exec -it deployment/api-gateway -n production \
  -- npm run db:backup

# 3. Tag current version
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# 4. Notify team
echo "Deployment starting in 30 minutes"
```

**Checklist**:
- [ ] Validator passed
- [ ] Backup created
- [ ] Version tagged
- [ ] Team notified

### Phase 2: Build & Push (T-20 minutes)

```bash
# 1. Build Docker images
npm run docker:build

# 2. Tag images
docker tag azora/api-gateway:latest \
  registry.azora.io/azora/api-gateway:1.0.0

# 3. Push to registry
docker push registry.azora.io/azora/api-gateway:1.0.0

# 4. Verify images
docker images | grep 1.0.0
```

**Checklist**:
- [ ] All images built successfully
- [ ] Images pushed to registry
- [ ] Image signatures verified
- [ ] Registry health checked

### Phase 3: Deploy to Green (T-10 minutes)

```bash
# 1. Update Helm values
sed -i 's/image.tag:.*/image.tag: 1.0.0/' helm/values-production.yaml

# 2. Deploy green environment
helm upgrade azora-prod ./helm/azora \
  --namespace production \
  --values helm/values-production.yaml \
  --set deployment.activeSlot=green \
  --wait \
  --timeout 10m

# 3. Verify green deployment
kubectl get pods -n production -l slot=green
kubectl rollout status deployment/api-gateway-green -n production

# 4. Run smoke tests
npm run test:smoke -- --env=production-green
```

**Checklist**:
- [ ] Helm chart validated
- [ ] Green deployment started
- [ ] All pods running
- [ ] Smoke tests passed

### Phase 4: Traffic Switch (T+0 minutes)

```bash
# 1. Verify green is healthy
kubectl get pods -n production -l slot=green

# 2. Switch traffic to green
kubectl patch service api-gateway -n production \
  -p '{"spec":{"selector":{"slot":"green"}}}'

# 3. Monitor error rate
npm run monitor:errors -- --duration=5m

# 4. Verify traffic flowing
kubectl logs -n production -l slot=green --tail=50
```

**Checklist**:
- [ ] Green pods healthy
- [ ] Traffic switched
- [ ] Error rate normal
- [ ] Requests flowing

### Phase 5: Monitoring (T+5 to T+30 minutes)

```bash
# 1. Monitor metrics
# Access Grafana: https://grafana.azora.io

# 2. Check error rates
kubectl logs -n production -l app=api-gateway --since=5m | grep -i error

# 3. Verify database
kubectl exec -it deployment/api-gateway -n production \
  -- npm run db:verify

# 4. Check external services
npm run health-check -- --env=production
```

**Checklist**:
- [ ] Error rate < 0.1%
- [ ] API latency < 100ms
- [ ] Database queries < 50ms
- [ ] All services healthy

---

## Rollback Procedures

### Automatic Rollback (if error rate > 5%)

```bash
# System automatically triggers rollback
# 1. Switch traffic back to blue
kubectl patch service api-gateway -n production \
  -p '{"spec":{"selector":{"slot":"blue"}}}'

# 2. Verify blue is healthy
kubectl get pods -n production -l slot=blue

# 3. Delete green deployment
kubectl delete deployment api-gateway-green -n production

# 4. Notify team
echo "Automatic rollback completed"
```

### Manual Rollback

```bash
# 1. Switch traffic back to blue
kubectl patch service api-gateway -n production \
  -p '{"spec":{"selector":{"slot":"blue"}}}'

# 2. Verify blue is responding
curl https://api.azora.io/health

# 3. Check error rate
kubectl logs -n production -l slot=blue --tail=100 | grep -i error

# 4. Rollback database (if needed)
kubectl exec -it deployment/api-gateway -n production \
  -- npm run db:rollback

# 5. Verify system health
npm run health-check -- --env=production

# 6. Notify stakeholders
echo "Rollback completed. Investigating issue."
```

### Rollback Checklist

- [ ] Traffic switched back to blue
- [ ] Blue deployment healthy
- [ ] Error rate normalized
- [ ] Database rolled back (if applicable)
- [ ] All services responding
- [ ] Team notified
- [ ] Root cause analysis started

---

## Post-Deployment Verification

### Immediate (T+30 minutes)

```bash
# 1. Verify all services
npm run health-check -- --env=production

# 2. Check metrics
# Access Grafana dashboard

# 3. Review logs
kubectl logs -n production -l app=api-gateway --since=30m

# 4. Test critical paths
npm run test:smoke -- --env=production

# 5. Verify database
kubectl exec -it deployment/api-gateway -n production \
  -- npm run db:verify
```

**Checklist**:
- [ ] All services responding
- [ ] Metrics normal
- [ ] No error spikes
- [ ] Smoke tests passed
- [ ] Database consistent

### Short-term (T+2 hours)

```bash
# 1. Run E2E tests
npm run test:e2e -- --env=production

# 2. Check performance
# Review performance dashboard in Grafana

# 3. Verify backups
# Confirm backup completed successfully

# 4. Review logs for warnings
kubectl logs -n production --since=2h | grep -i warn

# 5. Check resource usage
kubectl top pods -n production
```

**Checklist**:
- [ ] E2E tests passed
- [ ] Performance acceptable
- [ ] Backups verified
- [ ] No warnings in logs
- [ ] Resource usage normal

### Long-term (T+24 hours)

```bash
# 1. Review error logs
kubectl logs -n production --since=24h | grep -i error

# 2. Check performance trends
# Review Grafana dashboards

# 3. Verify data integrity
npm run db:verify -- --full

# 4. Review security logs
# Check for suspicious activity

# 5. Gather metrics
# Document performance baseline
```

**Checklist**:
- [ ] No critical errors
- [ ] Performance stable
- [ ] Data integrity verified
- [ ] Security logs clean
- [ ] Metrics documented

---

## Troubleshooting

### Deployment Fails

**Symptoms**: Helm upgrade fails, pods not starting

**Resolution**:
1. Check Helm chart syntax: `helm lint ./helm/azora`
2. Check pod events: `kubectl describe pod <pod-name> -n production`
3. Check logs: `kubectl logs <pod-name> -n production`
4. Rollback: `helm rollback azora-prod 1 -n production`

### High Error Rate

**Symptoms**: Error rate > 1%, users reporting issues

**Resolution**:
1. Check logs: `kubectl logs -n production -l app=api-gateway --tail=100`
2. Check metrics: Review Grafana dashboard
3. Identify affected service
4. Trigger rollback if necessary
5. Investigate root cause

### Database Issues

**Symptoms**: Database queries slow, connection errors

**Resolution**:
1. Check database status: `kubectl exec -it deployment/api-gateway -n production -- npm run db:verify`
2. Check connections: `psql -c "SELECT count(*) FROM pg_stat_activity;"`
3. Check migrations: `npm run db:status`
4. Rollback migration if needed: `npm run db:rollback`

### Memory Leaks

**Symptoms**: Memory usage increasing, pods restarting

**Resolution**:
1. Check resource usage: `kubectl top pods -n production`
2. Check pod logs for memory warnings
3. Increase memory limits in Helm values
4. Redeploy: `helm upgrade azora-prod ./helm/azora --namespace production`

### Network Issues

**Symptoms**: Timeouts, connection refused

**Resolution**:
1. Check service endpoints: `kubectl get endpoints -n production`
2. Test connectivity: `kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://api-gateway:3000/health`
3. Check network policies: `kubectl get networkpolicies -n production`
4. Check ingress: `kubectl get ingress -n production`

---

## Success Criteria

✅ **Deployment is successful when**:
- All pods running and healthy
- Error rate < 0.1%
- API latency < 100ms
- Database queries < 50ms
- All smoke tests passing
- No critical errors in logs
- Metrics within normal range
- All services responding
- Users reporting normal experience

❌ **Deployment should be rolled back if**:
- Error rate > 5% for > 5 minutes
- API latency > 500ms
- Database unavailable
- Critical service down
- Data corruption detected
- Security issue detected
- Cascading failures occurring

---

## Post-Deployment Tasks

### Day 1
- [ ] Review deployment logs
- [ ] Gather performance metrics
- [ ] Document any issues
- [ ] Update runbooks if needed
- [ ] Team retrospective

### Week 1
- [ ] Monitor error trends
- [ ] Review user feedback
- [ ] Check performance trends
- [ ] Verify backup integrity
- [ ] Update documentation

### Month 1
- [ ] Full system audit
- [ ] Performance analysis
- [ ] Security review
- [ ] Capacity planning
- [ ] Lessons learned

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Deployment Lead | [Name] | [Phone] | [Email] |
| On-Call Engineer | [Name] | [Phone] | [Email] |
| Database Admin | [Name] | [Phone] | [Email] |
| Security Lead | [Name] | [Phone] | [Email] |
| Infrastructure Lead | [Name] | [Phone] | [Email] |

---

## Related Documents

- [Deployment Guide](./DEPLOYMENT.md)
- [Runbooks](./RUNBOOKS.md)
- [Architecture](./ARCHITECTURE.md)
- [Performance Monitoring](./PERFORMANCE-MONITORING-SETUP.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2025 | Initial checklist |

