# Azora Helm Chart

Helm chart for deploying Azora platform services to Kubernetes.

## Services Included

- **azora-api-gateway** - API Gateway (port 3000)
- **azora-auth** - Authentication service (port 3001)
- **azora-education** - Education service (port 3002)
- **azora-pay** - Payment service (port 3003)

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- PostgreSQL database
- Redis cache

## Installation

### Staging

```bash
helm install azora . \
  --namespace azora-staging \
  --create-namespace \
  --values values-staging.yaml
```

### Production

```bash
helm install azora . \
  --namespace azora-production \
  --create-namespace \
  --values values-production.yaml
```

## Configuration

### Key Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `3` |
| `image.registry` | Docker registry | `docker.io` |
| `image.repository` | Image repository | `azora` |
| `image.tag` | Image tag | `latest` |
| `autoscaling.enabled` | Enable HPA | `true` |
| `autoscaling.minReplicas` | Min replicas | `3` |
| `autoscaling.maxReplicas` | Max replicas | `10` |

### Secrets

Update secrets before deployment:

```bash
kubectl create secret generic azora-secrets \
  --from-literal=database-url="postgresql://user:pass@host:5432/db" \
  --from-literal=jwt-secret="your-jwt-secret" \
  --from-literal=stripe-key="sk_live_..." \
  --from-literal=openai-key="sk-..." \
  --namespace azora-production
```

## Upgrade

```bash
helm upgrade azora . \
  --namespace azora-production \
  --values values-production.yaml
```

## Rollback

```bash
helm rollback azora --namespace azora-production
```

## Uninstall

```bash
helm uninstall azora --namespace azora-production
```

## Monitoring

Services expose `/health` endpoint for health checks.

## Autoscaling

HPA configured to scale based on:
- CPU utilization: 70%
- Memory utilization: 80%

## Resources

### Staging
- API Gateway: 250m CPU, 256Mi memory
- Auth: 100m CPU, 128Mi memory
- Education: 250m CPU, 256Mi memory
- Pay: 250m CPU, 256Mi memory

### Production
- API Gateway: 500m CPU, 512Mi memory
- Auth: 250m CPU, 256Mi memory
- Education: 500m CPU, 512Mi memory
- Pay: 500m CPU, 512Mi memory
