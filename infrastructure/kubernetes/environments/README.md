# Azora Kubernetes Environments

Environment configurations for Azora OS deployment.

## Environments

### Staging
- **Namespace**: `azora-staging`
- **Purpose**: Pre-production testing and validation
- **Resources**: Moderate (1-2 replicas per service)
- **Database**: PostgreSQL single instance, Redis 3-node cluster

### Production
- **Namespace**: `azora-production`
- **Purpose**: Live production environment
- **Resources**: High availability (3+ replicas per service)
- **Database**: PostgreSQL with replication, Redis 6-node cluster
- **Security**: RBAC, network policies, SSL/TLS

## Quick Start

### Provision Staging
```bash
cd infrastructure/scripts
./provision-staging.sh
./create-secrets.sh azora-staging
./test-db-connectivity.sh azora-staging
```

### Provision Production
```bash
cd infrastructure/scripts
./provision-production.sh
./create-secrets.sh azora-production
./test-db-connectivity.sh azora-production
```

## Configuration Files

### Staging
- `staging/cluster-config.yaml` - Namespaces, network policies, ingress
- `staging/databases.yaml` - PostgreSQL and Redis deployments
- `staging/secrets-template.yaml` - Secrets template

### Production
- `production/cluster-config.yaml` - HA cluster with RBAC and SSL/TLS
- `production/databases.yaml` - HA databases with resource limits
- `production/secrets-template.yaml` - Production secrets template

## Security

- All secrets must be base64 encoded
- Use AWS Secrets Manager or Sealed Secrets in production
- Network policies enforce namespace isolation
- RBAC limits pod access in production

## Database Configuration

### PostgreSQL
- **Staging**: Single instance, 50Gi storage
- **Production**: Primary with replication, 100Gi storage, 2Gi memory

### Redis
- **Staging**: 3-node cluster, 10Gi storage per node
- **Production**: 6-node cluster, 20Gi storage per node, persistence enabled

## Next Steps

After provisioning:
1. Deploy core services (auth, api-gateway, education, payment)
2. Configure monitoring and logging
3. Run smoke tests
4. Set up CI/CD pipeline
