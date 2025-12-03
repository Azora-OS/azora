# Azora Cloud AWS Deployment Guide

## Prerequisites

### 1. AWS Account Setup
- [ ] AWS account with admin access
- [ ] AWS CLI installed and configured
- [ ] Create S3 bucket for Terraform state: `azora-terraform-state`
- [ ] Request ACM certificate for your domain

### 2. Local Tools
- [ ] Terraform >= 1.0 installed
- [ ] Docker installed and running
- [ ] Git configured

### 3. GitHub Setup
- [ ] Repository access to `Sizwe780/azora-os`
- [ ] GitHub Actions enabled

## Step 1: Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Verify access
aws sts get-caller-identity
```

## Step 2: Set Up Terraform

```bash
cd infrastructure/terraform

# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
nano terraform.tfvars
```

**Required values**:
- `acm_certificate_arn`: Your ACM certificate ARN
- `redis_auth_token`: Strong password (min 16 chars)
- `aws_region`: Your preferred region

## Step 3: Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Review plan
terraform plan

# Apply (creates VPC, ECS, ElastiCache, ALB)
terraform apply

# Save outputs
terraform output > ../outputs.txt
```

**Expected resources created**:
- VPC with public/private subnets
- NAT Gateways (2)
- Application Load Balancer
- ECS Cluster
- ElastiCache Redis cluster
- ECR repositories (4)
- Security groups
- IAM roles

## Step 4: Configure GitHub Secrets

Go to GitHub → Settings → Secrets and variables → Actions

Add these secrets:
```
AWS_ACCESS_KEY_ID       = <your-access-key>
AWS_SECRET_ACCESS_KEY   = <your-secret-key>
AWS_ACCOUNT_ID          = <your-account-id>
```

## Step 5: Copy Dockerfiles to Premium Services

```bash
# From repository root
cd services/azora-cloud

# Copy Dockerfile to each service
for service in prpeng-engine ai-routing azora-mint constitutional-ai; do
  cp ../../infrastructure/dockerfiles/Dockerfile.nodejs $service/Dockerfile
done
```

## Step 6: Create ECS Task Definitions

For each service, create a task definition:

```bash
# Example for prpeng-engine
aws ecs register-task-definition --cli-input-json file://task-definitions/prpeng-engine.json
```

**Task definition template** (`task-definitions/prpeng-engine.json`):
```json
{
  "family": "azora-cloud-prpeng-engine",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "<ECS_TASK_EXECUTION_ROLE_ARN>",
  "taskRoleArn": "<ECS_TASK_ROLE_ARN>",
  "containerDefinitions": [
    {
      "name": "prpeng-engine",
      "image": "<ECR_REPOSITORY_URL>:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        },
        {
          "name": "REDIS_URL",
          "value": "<REDIS_ENDPOINT_FROM_TERRAFORM>"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/azora-cloud/prpeng-engine",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## Step 7: Create ECS Services

```bash
# Example for prpeng-engine
aws ecs create-service \
  --cluster azora-cloud-cluster \
  --service-name azora-cloud-prpeng-engine \
  --task-definition azora-cloud-prpeng-engine \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<PRIVATE_SUBNET_IDS>],securityGroups=[<ECS_SECURITY_GROUP>]}" \
  --load-balancers "targetGroupArn=<TARGET_GROUP_ARN>,containerName=prpeng-engine,containerPort=3000"
```

## Step 8: Trigger GitHub Actions Deployment

```bash
# Commit and push changes
git add .
git commit -m "feat: Add AWS infrastructure and CI/CD [terraform]"
git push origin main
```

This will trigger the GitHub Actions workflow to:
1. Run Terraform (if `[terraform]` in commit message)
2. Build Docker images
3. Push to ECR
4. Deploy to ECS

## Step 9: Verify Deployment

```bash
# Check ECS services
aws ecs list-services --cluster azora-cloud-cluster

# Check service status
aws ecs describe-services \
  --cluster azora-cloud-cluster \
  --services azora-cloud-prpeng-engine

# View logs
aws logs tail /ecs/azora-cloud/prpeng-engine --follow

# Test ALB endpoint
curl https://<ALB_DNS_NAME>/api/prpeng/health
```

## Step 10: Configure DNS

Point your domain to the ALB:

```bash
# Get ALB DNS name
terraform output alb_dns_name

# Create CNAME record
# api.azora.cloud -> <ALB_DNS_NAME>
```

## Monitoring

### CloudWatch Dashboards
```bash
# View metrics
aws cloudwatch get-dashboard --dashboard-name azora-cloud
```

### Cost Monitoring
```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-30 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

## Troubleshooting

### Service won't start
```bash
# Check task logs
aws ecs describe-tasks \
  --cluster azora-cloud-cluster \
  --tasks <TASK_ARN>

# View stopped tasks
aws ecs list-tasks \
  --cluster azora-cloud-cluster \
  --desired-status STOPPED
```

### Health check failing
```bash
# Test container locally
docker run -p 3000:3000 <ECR_IMAGE>
curl http://localhost:3000/health
```

### High costs
- Switch Redis to `cache.t3.micro` for dev
- Use FARGATE_SPOT for non-critical services
- Enable auto-scaling with min 0 for dev

## Rollback

```bash
# Revert to previous task definition
aws ecs update-service \
  --cluster azora-cloud-cluster \
  --service azora-cloud-prpeng-engine \
  --task-definition azora-cloud-prpeng-engine:PREVIOUS_REVISION

# Destroy infrastructure (CAUTION)
cd infrastructure/terraform
terraform destroy
```

## Next Steps

1. Set up CloudWatch alarms
2. Configure auto-scaling
3. Add DynamoDB for persistent storage
4. Set up backup policies
5. Configure WAF for ALB
6. Enable X-Ray tracing
