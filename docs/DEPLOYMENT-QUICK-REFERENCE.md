# Azora Deployment Quick Reference

## 🚀 Quick Deploy Commands

### Staging
```bash
./infrastructure/helm/scripts/deploy-staging.sh
```

### Production
```bash
./infrastructure/helm/scripts/deploy-production.sh
```

### Rollback
```bash
./infrastructure/helm/scripts/rollback.sh azora-production
```

## 🧪 Testing Commands

### E2E Tests (Local)
```bash
npm run test:e2e
```

### E2E Tests (Staging)
```bash
npm run test:e2e:staging
```

### Smoke Tests (Production)
```bash
npm run test:smoke:production
```

## 🔄 Blue-Green Deployment

### Switch to Green
```bash
./infrastructure/helm/scripts/blue-green-switch.sh azora-production green
```

### Rollback to Blue
```bash
./infrastructure/helm/scripts/blue-green-switch.sh azora-production blue
```

## 📊 Monitoring

### Check Pod Status
```bash
kubectl get pods -n azora-production
```

### View Logs
```bash
kubectl logs -f deployment/azora-api-gateway -n azora-production
```

### Check Service Health
```bash
curl https://azora.world/api/health
```

## 🔍 Troubleshooting

### Pod Not Starting
```bash
kubectl describe pod <pod-name> -n azora-production
kubectl logs <pod-name> -n azora-production
```

### High Error Rates
1. Check Grafana dashboard
2. View application logs in Kibana
3. Consider rollback if critical

### Database Issues
```bash
kubectl exec -n azora-production <pod-name> -- nc -zv postgres 5432
```

## 📚 Documentation

- **Full Runbook**: `docs/deployment/DEPLOYMENT-RUNBOOK.md`
- **E2E Tests**: `tests/e2e/README.md`
- **Architecture**: `docs/ARCHITECTURE.md`

## 🆘 Emergency Contacts

- **On-Call**: #oncall (Slack)
- **DevOps**: #devops (Slack)
- **CTO**: Emergency contact

---

**Remember**: Always test in staging first! 🛡️
