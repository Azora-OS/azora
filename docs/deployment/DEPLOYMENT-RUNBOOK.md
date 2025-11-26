# Azora Deployment Runbook

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (100%)
- [ ] Coverage ≥50% overall, ≥60% critical services, ≥80% critical paths
- [ ] No critical security vulnerabilities
- [ ] Code review approved
- [ ] CI/CD pipeline green

### Infrastructure
- [ ] Kubernetes cluster healthy
- [ ] Database backups completed
- [ ] Secrets configured
- [ ] Resource limits validated
- [ ] Monitoring dashboards ready

### Communication
- [ ] Team notified of deployment
- [ ] Maintenance window scheduled (if needed)
- [ ] Rollback plan documented
- [ ] On-call engineer assigned

## Deployment Process

### Staging Deployment

```bash
# 1. Deploy to staging
./infrastructure/helm/scripts/deploy-staging.sh

# 2. Verify pods are running
kubectl get pods -n azora-staging

# 3. Run smoke tests
npm run test:smoke:staging

# 4. Run E2E tests
npm run test:e2e:staging

# 5. Manual validation
# - Test critical user flows
# - Verify integrations (Stripe, OpenAI)
# - Check monitoring dashboards
```

### Production Deployment

```bash
# 1. Create backup
kubectl exec -n azora-production postgres-0 -- pg_dump -U azora > backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Deploy to production
./infrastructure/helm/scripts/deploy-production.sh

# 3. Monitor deployment
kubectl rollout status deployment/azora-api-gateway -n azora-production

# 4. Run smoke tests
npm run test:smoke:production

# 5. Monitor for 15 minutes
# - Watch error rates in Grafana
# - Check logs in Kibana
# - Monitor response times
```

## Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous version
./infrastructure/helm/scripts/rollback.sh azora-production

# Verify rollback
kubectl get pods -n azora-production
```

### Database Rollback
```bash
# Restore from backup
kubectl exec -n azora-production postgres-0 -- psql -U azora < backup-YYYYMMDD-HHMMSS.sql
```

## Troubleshooting

### Pods Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n azora-production

# Check logs
kubectl logs <pod-name> -n azora-production

# Common fixes:
# - Image pull errors: Check registry credentials
# - CrashLoopBackOff: Check application logs
# - Pending: Check resource availability
```

### High Error Rates
```bash
# Check application logs
kubectl logs -l app=azora-api-gateway -n azora-production --tail=100

# Check metrics
# - Open Grafana dashboard
# - Check error rate panel
# - Identify failing endpoints

# Rollback if needed
./infrastructure/helm/scripts/rollback.sh azora-production
```

### Database Connection Issues
```bash
# Test database connectivity
kubectl exec -n azora-production <pod-name> -- nc -zv postgres 5432

# Check database logs
kubectl logs postgres-0 -n azora-production

# Verify secrets
kubectl get secret db-credentials -n azora-production -o yaml
```

## Post-Deployment

### Validation
- [ ] All services healthy
- [ ] Error rates normal (<1%)
- [ ] Response times acceptable (p95 <200ms)
- [ ] No alerts firing
- [ ] E2E tests passing

### Monitoring
- Monitor for 24-48 hours
- Watch for:
  - Error rate spikes
  - Performance degradation
  - Resource exhaustion
  - User complaints

### Documentation
- [ ] Update deployment log
- [ ] Document any issues encountered
- [ ] Update runbook with lessons learned
- [ ] Notify team of completion

## Emergency Contacts

- **On-Call Engineer**: [Slack: #oncall]
- **DevOps Lead**: [Slack: #devops]
- **CTO**: [Emergency contact]

## Useful Commands

```bash
# View deployment history
helm history azora -n azora-production

# Scale deployment
kubectl scale deployment azora-api-gateway --replicas=5 -n azora-production

# View logs
kubectl logs -f deployment/azora-api-gateway -n azora-production

# Execute command in pod
kubectl exec -it <pod-name> -n azora-production -- /bin/sh

# Port forward for debugging
kubectl port-forward svc/azora-api-gateway 8080:80 -n azora-production
```
