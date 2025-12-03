# Azora Infrastructure Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                  (Ingress Controller)                    │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐            ┌────▼────┐
    │  Blue   │            │  Green  │
    │Deployment│           │Deployment│
    └────┬────┘            └────┬────┘
         │                       │
    ┌────▼───────────────────────▼────┐
    │        Service Mesh               │
    │   (API Gateway, Auth, etc.)      │
    └────┬───────────────────────┬─────┘
         │                       │
    ┌────▼────┐            ┌────▼────┐
    │PostgreSQL│           │  Redis  │
    │ Cluster  │           │ Cluster │
    └──────────┘           └─────────┘
```

## Infrastructure Components

### Kubernetes Cluster

**Staging:**
- Provider: GKE/EKS/AKS
- Nodes: 3 (n1-standard-2 or equivalent)
- Zones: Single zone
- Auto-scaling: 3-6 nodes

**Production:**
- Provider: GKE/EKS/AKS
- Nodes: 6 (n1-standard-4 or equivalent)
- Zones: Multi-zone (3 zones)
- Auto-scaling: 6-12 nodes

### Namespaces

- `azora-staging` - Staging environment
- `azora-production` - Production environment
- `monitoring` - Prometheus, Grafana
- `logging` - ELK/Loki stack

### Core Services

#### API Gateway
- **Replicas**: 3 (prod), 2 (staging)
- **Resources**: 500m CPU, 512Mi memory
- **Port**: 3000
- **Health**: `/api/health`

#### Auth Service
- **Replicas**: 3 (prod), 2 (staging)
- **Resources**: 250m CPU, 256Mi memory
- **Port**: 3001
- **Health**: `/api/auth/health`

#### Education Service
- **Replicas**: 3 (prod), 2 (staging)
- **Resources**: 500m CPU, 512Mi memory
- **Port**: 3002
- **Health**: `/api/education/health`

#### Payment Service
- **Replicas**: 3 (prod), 2 (staging)
- **Resources**: 500m CPU, 512Mi memory
- **Port**: 3003
- **Health**: `/api/pay/health`

### Databases

#### PostgreSQL
- **Version**: 15
- **Replicas**: 1 primary + 2 read replicas (prod)
- **Storage**: 100GB SSD (prod), 50GB (staging)
- **Backup**: Daily automated backups
- **Retention**: 30 days

#### Redis
- **Version**: 7
- **Mode**: Cluster (prod), Standalone (staging)
- **Nodes**: 3 (prod), 1 (staging)
- **Memory**: 4GB per node (prod), 2GB (staging)
- **Persistence**: AOF + RDB

### Monitoring Stack

#### Prometheus
- **Retention**: 15 days
- **Scrape Interval**: 15s
- **Storage**: 50GB

#### Grafana
- **Dashboards**: 10+ pre-configured
- **Alerts**: Integrated with Alertmanager
- **Users**: SSO enabled

#### Loki
- **Retention**: 30 days
- **Storage**: 100GB

## Deployment Process

### 1. Pre-Deployment

```bash
# Verify cluster access
kubectl cluster-info

# Check current deployments
kubectl get deployments -n azora-production

# Create backup
kubectl exec -n azora-production postgres-0 -- pg_dump -U azora > backup.sql
```

### 2. Deployment

```bash
# Deploy to staging
./infrastructure/helm/scripts/deploy-staging.sh

# Verify deployment
kubectl get pods -n azora-staging
kubectl rollout status deployment/azora-api-gateway -n azora-staging

# Run smoke tests
npm run test:smoke:staging
```

### 3. Blue-Green Deployment

```bash
# Deploy green version
kubectl apply -f infrastructure/kubernetes/blue-green-deployment.yaml

# Verify green is healthy
kubectl get pods -l version=green -n azora-production

# Switch traffic to green
./infrastructure/helm/scripts/blue-green-switch.sh azora-production green

# Monitor for 15 minutes
# If issues, rollback to blue
./infrastructure/helm/scripts/blue-green-switch.sh azora-production blue
```

### 4. Post-Deployment

```bash
# Verify all services
kubectl get pods -n azora-production
kubectl get svc -n azora-production

# Check logs
kubectl logs -f deployment/azora-api-gateway -n azora-production

# Run E2E tests
npm run test:e2e:production
```

## Monitoring & Alerting

### Grafana Dashboards

Access: `https://grafana.azora.world`

**Key Dashboards:**
1. **Service Health** - Uptime, error rates, latency
2. **Infrastructure** - CPU, memory, disk, network
3. **Business Metrics** - Users, revenue, enrollments
4. **Database Performance** - Queries, connections, cache

### Alert Rules

**Critical Alerts** (PagerDuty):
- Service down > 1 minute
- Error rate > 5%
- Database connection failures
- Disk usage > 90%

**Warning Alerts** (Slack):
- CPU usage > 70%
- Memory usage > 80%
- Response time > 200ms (p95)
- Cache hit rate < 80%

### Log Aggregation

Access: `https://kibana.azora.world`

**Log Levels:**
- ERROR: Immediate attention required
- WARN: Potential issues
- INFO: Normal operations
- DEBUG: Detailed debugging (staging only)

## Scaling

### Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: azora-api-gateway
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: azora-api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling

**Read Replicas:**
```bash
# Add read replica
kubectl scale statefulset postgres-replica --replicas=3 -n azora-production
```

**Connection Pooling:**
- PgBouncer: 100 connections per service
- Max connections: 500 (PostgreSQL)

## Disaster Recovery

### Backup Strategy

**Automated Backups:**
- Database: Daily at 2 AM UTC
- Configuration: On every deployment
- Secrets: Weekly encrypted backups

**Backup Locations:**
- Primary: Cloud storage (S3/GCS)
- Secondary: Off-site backup

### Recovery Procedures

**Database Recovery:**
```bash
# Restore from backup
kubectl exec -n azora-production postgres-0 -- psql -U azora < backup-YYYYMMDD.sql

# Verify data
kubectl exec -n azora-production postgres-0 -- psql -U azora -c "SELECT COUNT(*) FROM users;"
```

**Service Recovery:**
```bash
# Rollback deployment
./infrastructure/helm/scripts/rollback.sh azora-production

# Verify rollback
kubectl get pods -n azora-production
```

### RTO & RPO

- **RTO** (Recovery Time Objective): 4 hours
- **RPO** (Recovery Point Objective): 1 hour

## Security

### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-policy
spec:
  podSelector:
    matchLabels:
      app: azora-api-gateway
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: ingress-controller
    ports:
    - protocol: TCP
      port: 3000
```

### Secrets Management

**Sealed Secrets:**
```bash
# Create sealed secret
kubeseal --format yaml < secret.yaml > sealed-secret.yaml

# Apply sealed secret
kubectl apply -f sealed-secret.yaml -n azora-production
```

### TLS/SSL

- **Certificate Provider**: Let's Encrypt
- **Auto-renewal**: cert-manager
- **TLS Version**: 1.3
- **Cipher Suites**: Strong ciphers only

## Cost Optimization

### Resource Requests vs Limits

```yaml
resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Autoscaling Policies

- Scale up: CPU > 70% for 2 minutes
- Scale down: CPU < 30% for 5 minutes
- Cooldown: 3 minutes between scale events

### Cost Monitoring

- Monthly budget alerts
- Resource utilization reports
- Idle resource identification

## Troubleshooting

### Common Issues

**Pods Not Starting:**
```bash
kubectl describe pod <pod-name> -n azora-production
kubectl logs <pod-name> -n azora-production
```

**High Memory Usage:**
```bash
kubectl top pods -n azora-production
kubectl exec -it <pod-name> -n azora-production -- top
```

**Database Connection Issues:**
```bash
kubectl exec -n azora-production <pod-name> -- nc -zv postgres 5432
kubectl logs postgres-0 -n azora-production
```

## Maintenance Windows

**Scheduled Maintenance:**
- **Time**: Sundays 2-4 AM UTC
- **Frequency**: Monthly
- **Notification**: 7 days advance notice

**Emergency Maintenance:**
- Critical security patches
- Database failover
- Infrastructure issues
