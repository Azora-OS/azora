# Azora Cloud CI/CD Pipeline

This directory contains GitHub Actions workflows for automated testing and deployment.

## Workflows

### 1. `ci.yml` - Continuous Integration
**Triggers**: Pull requests and pushes to `main`

**Jobs**:
- Run tests and linting
- Test Docker builds for all services
- Verify build integrity

### 2. `deploy-aws.yml` - AWS Deployment
**Triggers**: 
- Push to `main` (when `services/azora-cloud/**` changes)
- Manual workflow dispatch
- Commits with `[terraform]` in message

**Jobs**:
1. **Terraform**: Provision/update AWS infrastructure
2. **Build & Deploy**: Build Docker images, push to ECR, deploy to ECS
3. **Notify**: Report deployment status

## Required Secrets

Configure these in GitHub Settings → Secrets and variables → Actions:

```
AWS_ACCESS_KEY_ID       # AWS IAM access key
AWS_SECRET_ACCESS_KEY   # AWS IAM secret key
AWS_ACCOUNT_ID          # Your AWS account ID
```

## IAM Permissions Required

The AWS credentials need:
- `AmazonEC2ContainerRegistryPowerUser`
- `AmazonECS_FullAccess`
- `AmazonVPCFullAccess` (for Terraform)
- `AmazonElastiCacheFullAccess` (for Terraform)
- `IAMFullAccess` (for Terraform)

## Manual Deployment

To manually trigger deployment:
1. Go to Actions tab in GitHub
2. Select "Deploy Azora Cloud to AWS"
3. Click "Run workflow"
4. Select branch and run

## Monitoring Deployments

View deployment status:
```bash
# Check ECS service status
aws ecs describe-services --cluster azora-cloud-cluster --services azora-cloud-prpeng-engine

# View task logs
aws logs tail /ecs/azora-cloud/prpeng-engine --follow
```

## Rollback

To rollback a deployment:
```bash
# Update service to previous task definition
aws ecs update-service \
  --cluster azora-cloud-cluster \
  --service azora-cloud-prpeng-engine \
  --task-definition azora-cloud-prpeng-engine:PREVIOUS_REVISION
```
