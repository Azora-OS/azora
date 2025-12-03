# Azora Cloud Deployment Checklist

## Prerequisites
- [ ] AWS Account with admin access
- [ ] AWS CLI configured (`aws configure`)
- [ ] Terraform installed (`terraform --version`)
- [ ] Docker installed and running
- [ ] GitHub repository access

## Phase 1: Backup Premium Code
- [ ] Copy `services/azora-cloud/` to secure location
- [ ] Create private AWS CodeCommit repository
- [ ] Push premium code to private repo
- [ ] Verify `.gitignore` excludes `azora-cloud/`

## Phase 2: Infrastructure Setup (Terraform)
- [ ] Navigate to infrastructure directory
- [ ] Review `main.tf` configuration
- [ ] Initialize Terraform: `terraform init`
- [ ] Plan deployment: `terraform plan`
- [ ] Apply infrastructure: `terraform apply`
- [ ] Note outputs: ALB URL, Redis endpoint, etc.

## Phase 3: Container Registry (ECR)
- [ ] Build Docker images for each service:
  ```bash
  cd services/azora-cloud/prpeng-engine
  docker build -t azora/prpeng-engine .
  ```
- [ ] Tag images for ECR
- [ ] Push to ECR repositories
- [ ] Verify images in AWS Console

## Phase 4: Service Deployment (ECS)
- [ ] Create task definitions for each service
- [ ] Configure environment variables
- [ ] Link to ElastiCache Redis
- [ ] Deploy services to ECS cluster
- [ ] Verify services are running

## Phase 5: Security Configuration
- [ ] Configure ALB security groups
- [ ] Set up IAM roles for services
- [ ] Store secrets in Secrets Manager:
  - OpenAI API key
  - Database credentials
  - Redis password
- [ ] Enable VPC Flow Logs
- [ ] Configure CloudWatch alarms

## Phase 6: Monitoring & Analytics
- [ ] Create CloudWatch dashboards
- [ ] Set up cost alerts
- [ ] Configure X-Ray tracing
- [ ] Enable CloudWatch Logs
- [ ] Test metrics collection

## Phase 7: Integration Testing
- [ ] Test PrPEng API from Vercel
- [ ] Verify cache hit/miss tracking
- [ ] Test AI Router integration
- [ ] Validate security (no unauthorized access)
- [ ] Load test with 100 concurrent users

## Phase 8: Go Live
- [ ] Update Vercel environment variables
- [ ] Point production traffic to AWS
- [ ] Monitor error rates
- [ ] Track cost savings
- [ ] Celebrate! 🎉

## Rollback Plan
If issues arise:
1. Revert Vercel env vars to previous state
2. Scale down ECS services
3. Investigate logs in CloudWatch
4. Fix and redeploy
