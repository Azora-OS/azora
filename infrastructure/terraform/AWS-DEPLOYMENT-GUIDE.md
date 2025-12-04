# Azora OS - AWS Deployment Guide

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.0 installed
3. **kubectl** for Kubernetes management
4. **Domain** configured in Route53 (azora.io)

## Deployment Steps

### 1. Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

### 2. Configure Variables

Create `terraform.tfvars` from the example:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set:
- `db_password`: Secure database password
- Other environment-specific values

### 3. Plan Deployment

```bash
terraform plan -out=tfplan
```

Review the plan carefully. This will create:
- VPC with public/private subnets
- EKS cluster for backend services
- RDS PostgreSQL database
- ElastiCache Redis cluster
- CloudFront distributions for frontend apps
- API Gateway for backend routing
- S3 buckets for static assets
- Route53 DNS records

### 4. Apply Configuration

```bash
terraform apply tfplan
```

This will take 15-20 minutes to complete.

### 5. Configure kubectl

```bash
aws eks update-kubeconfig --region us-east-1 --name azora-production
```

### 6. Deploy Backend Services to EKS

```bash
# Apply Kubernetes manifests
kubectl apply -f infrastructure/k8s/

# Verify deployments
kubectl get pods -n azora-production
```

### 7. Deploy Frontend to S3/CloudFront

```bash
# Build frontend apps
npm run build:apps

# Sync to S3
aws s3 sync apps/azora-sapiens/out s3://azora-frontend-assets-production/sapiens/
aws s3 sync apps/azora-jobspaces/out s3://azora-frontend-assets-production/jobspaces/
aws s3 sync apps/azora-pay/out s3://azora-frontend-assets-production/pay/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

### 8. Verify Deployment

```bash
# Check frontend
curl https://sapiens.azora.io
curl https://jobs.azora.io
curl https://pay.azora.io

# Check API Gateway
curl https://api.azora.io/health

# Check backend services
kubectl get svc -n azora-production
```

## Environment Variables

Set these in AWS Secrets Manager or Kubernetes Secrets:

```bash
# Database
DATABASE_URL=postgresql://azora_admin:PASSWORD@RDS_ENDPOINT:5432/azora

# Redis
REDIS_URL=redis://REDIS_ENDPOINT:6379

# Blockchain
BLOCKCHAIN_RPC_URL=<YOUR_RPC_URL>
PRIVATE_KEY=<ENCRYPTED_PRIVATE_KEY>

# AI Services
OPENAI_API_KEY=<YOUR_KEY>
ANTHROPIC_API_KEY=<YOUR_KEY>

# Constitutional
CONSTITUTION_HASH=<GENESIS_BLOCK_HASH>
```

## Monitoring

Access Grafana dashboard:
```bash
kubectl port-forward -n monitoring svc/grafana 3000:80
```

Then navigate to http://localhost:3000

## Scaling

### Manual Scaling
```bash
# Scale EKS nodes
aws eks update-nodegroup-config --cluster-name azora-production --nodegroup-name main --scaling-config minSize=5,maxSize=15,desiredSize=8

# Scale specific service
kubectl scale deployment constitutional-ai --replicas=5 -n azora-production
```

### Auto-scaling
Auto-scaling is configured via Horizontal Pod Autoscaler (HPA) based on CPU/memory metrics.

## Backup & Recovery

### Database Backups
Automated daily backups are configured with 7-day retention.

Manual backup:
```bash
aws rds create-db-snapshot --db-instance-identifier azora-db-production --db-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

### Disaster Recovery
```bash
# Restore from snapshot
terraform import aws_db_instance.main azora-db-production
terraform apply
```

## Security

### Secrets Rotation
```bash
# Rotate database password
aws secretsmanager rotate-secret --secret-id azora/db-password-production
```

### SSL Certificates
Certificates are auto-renewed via AWS Certificate Manager.

## Troubleshooting

### Check EKS Cluster
```bash
kubectl cluster-info
kubectl get nodes
kubectl get pods --all-namespaces
```

### Check Logs
```bash
# Service logs
kubectl logs -f deployment/constitutional-ai -n azora-production

# API Gateway logs
aws logs tail /aws/apigateway/azora-api-gateway-production --follow
```

### Common Issues

1. **Pod not starting**: Check image pull secrets and resource limits
2. **Database connection failed**: Verify security group rules
3. **CloudFront 403**: Check S3 bucket policy and OAI configuration

## Cost Optimization

- Use Spot Instances for non-critical workloads
- Enable S3 Intelligent-Tiering
- Use RDS Reserved Instances for production
- Configure CloudFront caching policies

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**WARNING**: This will delete all data. Ensure backups are taken first.

## Support

For deployment issues, check:
1. Terraform state: `terraform show`
2. AWS Console for resource status
3. CloudWatch logs for errors
4. EKS cluster events: `kubectl get events`
