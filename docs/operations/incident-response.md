# Incident Response Procedures

## Severity Levels

### Critical (P0) - 15min response, 1hr resolution
- Complete service outage
- Data breach/security incident
- Payment system failure
- Authentication system down

### High (P1) - 30min response, 4hr resolution
- Partial service degradation
- Performance issues >50% users
- Database connectivity issues

### Medium (P2) - 2hr response, 24hr resolution
- Minor feature issues
- Performance degradation <50% users
- Monitoring alerts

### Low (P3) - 24hr response, 1wk resolution
- Cosmetic issues
- Enhancement requests
- Documentation updates

## Response Workflow

1. **Detection** → Alert → On-Call → Assessment → Classification
2. **Response** → Acknowledge (5min) → Create ticket → Notify stakeholders
3. **Investigation** → Gather logs → Root cause → Mitigation
4. **Resolution** → Fix → Verify → Monitor → Document
5. **Post-Incident** → Post-mortem → Lessons learned → Prevention

## Escalation Matrix

| Role | P0 | P1 | P2 | P3 |
|------|----|----|----|----|
| On-Call | Immediate | Immediate | 2hr | 24hr |
| Team Lead | 15min | 30min | 4hr | Next day |
| Eng Manager | 30min | 2hr | Next day | Weekly |
| CTO | 1hr | 4hr | Weekly | Monthly |

## Communication

- **Internal**: #incidents (P0/P1), #alerts (P2/P3)
- **External**: status.azora.world
- **Updates**: P0 (15min), P1 (30min), P2 (2hr), P3 (daily)

## Runbooks

### Database Issues
```bash
kubectl get pods -n database
kubectl logs -f postgres-primary-0
psql -h primary -c "SELECT * FROM pg_stat_replication;"
```

### Service Outage
```bash
curl -f http://api-gateway:4000/health
kubectl rollout restart deployment/api-gateway
kubectl logs -f deployment/api-gateway --tail=100
```

### Performance Issues
```bash
kubectl top pods -n azora-services
kubectl scale deployment api-gateway --replicas=5
```

## Post-Mortem Template

1. **Summary**: What, when, duration, impact
2. **Timeline**: Detection → Response → Mitigation → Resolution
3. **Root Cause**: Primary cause, contributing factors
4. **Actions**: Immediate fixes, long-term improvements