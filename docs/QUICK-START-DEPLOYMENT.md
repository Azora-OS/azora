# Azora OS - Quick Start Deployment Guide

**TL;DR**: Get Azora OS to production in 4 hours.

---

## Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Docker registry access
- Environment variables set (see `.env.example`)
- 30 minutes to read this guide
- 4 hours for deployment

---

## 5-Minute Setup

### 1. Validate Environment
```bash
npx ts-node scripts/validate-production-env.ts
# Expected: ✅ Production environment is valid!
```

### 2. Test External Services
```bash
npx ts-node scripts/test-external-services.ts
# Expected: ✅ All external services are reachable!
```

### 3. Create Namespace
```bash
kubectl create namespace production
```

### 4. Create Secrets
```bash
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL=$DATABASE_URL \
  --from-literal=REDIS_URL=$REDIS_URL \
  --from-literal=OPENAI_API_KEY=$OPENAI_API_KEY \
  --from-literal=PINECONE_API_KEY=$PINECONE_API_KEY \
  --from-literal=STRIPE_API_KEY=$STRIPE_API_KEY \
  --from-literal=JWT_SECRET=$JWT_SECRET \
  -n production
```

---

## 30-Minute Infrastructure Setup

### 1. Deploy Database (5 min)
```bash
kubectl apply -f infrastructure/production-database.yaml -n production
kubectl wait --for=condition=ready pod -l app=postgres -n production --timeout=300s
```

### 2. Deploy Redis (5 min)
```bash
kubectl apply -f infrastructure/redis-cluster-prod.yaml -n production
kubectl wait --for=condition=ready pod -l app=redis -n production --timeout=300s
```

### 3. Deploy Load Balancer (5 min)
```bash
kubectl apply -f infrastructure/load-balancer.yaml -n production
kubectl wait --for=condition=ready pod -l app=nginx-lb -n production --timeout=300s
```

### 4. Deploy Monitoring (5 min)
```bash
kubectl apply -f infrastructure/monitoring-stack.yaml -n production
kubectl wait --for=condition=ready pod -l app=prometheus -n production --timeout=300s
```

### 5. Verify Infrastructure (5 min)
```bash
kubectl get all -n production
# All pods should be Running
```

---

## 30-Minute Application Deployment

### 1. Deploy API Gateway (5 min)
```bash
kubectl apply -f services/api-gateway/k8s/deployment.yaml -n production
kubectl wait --for=condition=ready pod -l app=api-gateway -n production --timeout=300s
```

### 2. Deploy Constitutional AI (5 min)
```bash
kubectl apply -f services/constitutional-ai/k8s/deployment.yaml -n production
kubectl wait --for=condition=ready pod -l app=constitutional-ai -n production --timeout=300s
```

### 3. Deploy Knowledge Ocean (5 min)
```bash
kubectl apply -f services/ai-routing/k8s/knowledge-ocean-deployment.yaml -n production
kubectl wait --for=condition=ready pod -l app=knowledge-ocean -n production --timeout=300s
```

### 4. Deploy AI Routing (5 min)
```bash
kubectl apply -f services/ai-routing/k8s/deployment.yaml -n production
kubectl wait --for=condition=ready pod -l app=ai-routing -n production --timeout=300s
```

### 5. Verify Applications (5 min)
```bash
kubectl get deployments -n production
# All deployments should have desired replicas ready
```

---

## 30-Minute Validation

### 1. Run Smoke Tests (10 min)
```bash
npx ts-node tests/smoke/production-smoke-tests.ts
# Expected: ✅ All smoke tests passed!
```

### 2. Check Monitoring (10 min)
```bash
# Access Grafana
kubectl port-forward svc/grafana 3000:3000 -n production
# Navigate to http://localhost:3000
# Login: admin/admin
# Verify dashboards are populated
```

### 3. Verify Services (10 min)
```bash
# Get load balancer IP
LB_IP=$(kubectl get svc nginx-lb -n production -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test API
curl -k https://$LB_IP/health

# Test Constitutional AI
curl -k https://$LB_IP/constitutional-ai/health

# Test Knowledge Ocean
curl -k https://$LB_IP/knowledge-ocean/health

# Test AI Routing
curl -k https://$LB_IP/ai-routing/health
```

---

## 30-Minute Post-Deployment

### 1. Update DNS (5 min)
```bash
# Point api.azora.io to load balancer IP
# Update DNS records with your provider
```

### 2. Configure Alerts (10 min)
```bash
# Access AlertManager
kubectl port-forward svc/alertmanager 9093:9093 -n production

# Configure notification channels (email, Slack, etc.)
```

### 3. Brief Team (10 min)
```bash
# Review deployment with team
# Confirm all systems operational
# Establish on-call rotation
```

### 4. Notify Stakeholders (5 min)
```bash
# Send launch notification
# Update status page
# Confirm with product team
```

---

## Troubleshooting

### Pod Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n production

# Check logs
kubectl logs <pod-name> -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'
```

### Service Not Responding
```bash
# Check service
kubectl get svc <service-name> -n production

# Check endpoints
kubectl get endpoints <service-name> -n production

# Test connectivity
kubectl exec -it <pod-name> -n production -- curl http://localhost:3000/health
```

### Database Connection Failed
```bash
# Check PostgreSQL
kubectl logs postgres-0 -n production

# Test connection
kubectl exec -it postgres-0 -n production -- psql -U azora_admin -d azora_production -c "SELECT 1;"
```

### Redis Connection Failed
```bash
# Check Redis
kubectl logs redis-0 -n production

# Test connection
kubectl exec -it redis-0 -n production -- redis-cli ping
```

---

## Rollback (If Needed)

### Quick Rollback
```bash
# Scale down new deployment
kubectl scale deployment api-gateway --replicas=0 -n production

# Scale up previous version
kubectl set image deployment/api-gateway api-gateway=azora/api-gateway:previous -n production
kubectl scale deployment api-gateway --replicas=3 -n production
```

### Full Rollback
```bash
# Delete namespace
kubectl delete namespace production

# Restore from backup
# (Follow backup restore procedures)
```

---

## Monitoring

### Key Dashboards
- **System Health**: http://localhost:3000/d/system-health
- **Constitutional AI**: http://localhost:3000/d/constitutional-ai
- **Knowledge Ocean**: http://localhost:3000/d/knowledge-ocean
- **AI Routing**: http://localhost:3000/d/ai-routing

### Key Metrics to Watch
- API Response Time (target: <500ms)
- Error Rate (target: <0.1%)
- Constitutional Compliance (target: >95%)
- Cache Hit Rate (target: >40%)
- Database Connections (target: <80% of max)

### Alerts to Monitor
- Constitutional compliance <90%
- API response time >1000ms
- Error rate >1%
- Database connections >400
- Redis memory >80%

---

## Success Criteria

✅ All pods running  
✅ All services responding  
✅ Smoke tests passing  
✅ Monitoring dashboards populated  
✅ Alerts configured  
✅ DNS updated  
✅ Team notified  
✅ Stakeholders confirmed  

---

## Support

- **Deployment Issues**: See `docs/DEPLOYMENT-RUNBOOK.md`
- **Troubleshooting**: See `docs/TROUBLESHOOTING-GUIDE.md`
- **Launch Checklist**: See `docs/PRODUCTION-LAUNCH-CHECKLIST.md`
- **On-Call**: [Contact info]

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Validation | 5 min | ✅ |
| Infrastructure | 30 min | ✅ |
| Applications | 30 min | ✅ |
| Validation | 30 min | ✅ |
| Post-Deployment | 30 min | ✅ |
| **Total** | **~2.5 hours** | ✅ |

---

## Next Steps

1. ✅ Run validation scripts
2. ✅ Deploy infrastructure
3. ✅ Deploy applications
4. ✅ Run smoke tests
5. ✅ Update DNS
6. ✅ Configure alerts
7. ✅ Brief team
8. ✅ Notify stakeholders
9. ✅ Monitor for 24 hours
10. ✅ Hand off to operations

---

**You're ready to deploy!** 🚀

For detailed procedures, see the full deployment runbook: `docs/DEPLOYMENT-RUNBOOK.md`
