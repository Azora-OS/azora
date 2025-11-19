# On-Call Procedures

## Schedule

### Primary On-Call
- **Duration**: 1 week rotations
- **Coverage**: 24/7
- **Handoff**: Fridays 9:00 AM UTC

### Secondary On-Call
- **Role**: Backup for primary
- **Escalation**: If primary unavailable >15min

## Responsibilities

### During On-Call
- Monitor alerts and respond within SLA
- Acknowledge incidents within 5 minutes
- Escalate P0/P1 incidents appropriately
- Update incident status regularly
- Participate in incident calls

### Handoff Process
1. Review active incidents
2. Check system health
3. Review upcoming maintenance
4. Update on-call contact info
5. Brief incoming engineer

## Alert Response

### Immediate Actions (0-5 minutes)
1. Acknowledge alert
2. Check system status
3. Assess severity
4. Create incident if needed

### Investigation (5-15 minutes)
1. Gather initial data
2. Check recent deployments
3. Review metrics/logs
4. Determine impact scope

### Escalation Triggers
- Unable to resolve P0 within 30min
- Unable to resolve P1 within 2hr
- Need additional expertise
- Multiple simultaneous incidents

## Tools Access

### Required Access
- **Monitoring**: Grafana, Prometheus
- **Logs**: ELK Stack, Jaeger
- **Infrastructure**: Kubernetes, AWS Console
- **Communication**: Slack, PagerDuty
- **Documentation**: Confluence, GitHub

### Emergency Contacts
```
Primary Escalation: +1-XXX-XXX-XXXX
Secondary Escalation: +1-XXX-XXX-XXXX
Security Team: security@azora.world
Infrastructure Team: infra@azora.world
```

## Common Scenarios

### High CPU Usage
```bash
# Check pod resources
kubectl top pods -n azora-services

# Scale if needed
kubectl scale deployment <service> --replicas=<count>

# Check for memory leaks
kubectl exec -it <pod> -- top
```

### Database Connection Issues
```bash
# Check database status
kubectl get pods -n database

# Test connectivity
kubectl exec -it api-gateway -- nc -zv postgres 5432

# Check connection pool
kubectl logs deployment/api-gateway | grep "connection"
```

### Service Discovery Issues
```bash
# Check service endpoints
kubectl get endpoints

# Restart service mesh
kubectl rollout restart daemonset/istio-proxy

# Verify DNS resolution
kubectl exec -it <pod> -- nslookup <service>
```

## Runbook Locations

- **Service Runbooks**: `/docs/runbooks/services/`
- **Infrastructure**: `/docs/runbooks/infrastructure/`
- **Security**: `/docs/runbooks/security/`
- **Database**: `/docs/runbooks/database/`

## Post-Incident Actions

1. Update incident ticket with resolution
2. Schedule post-mortem if P0/P1
3. Update runbooks if needed
4. Communicate resolution to stakeholders
5. Monitor for recurrence

## On-Call Best Practices

- Keep laptop charged and accessible
- Maintain reliable internet connection
- Know escalation contacts
- Stay familiar with recent changes
- Document all actions taken
- Ask for help when needed