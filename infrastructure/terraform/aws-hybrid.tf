# Azora OS - AWS Hybrid Deployment Configuration
# Frontend apps on AWS Amplify/CloudFront
# Backend services on AWS EKS

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "azora-terraform-state"
    key    = "aws/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "azora.io"
}

# Data sources
data "aws_route53_zone" "main" {
  name = var.domain_name
}

# S3 Buckets for Frontend Static Assets
resource "aws_s3_bucket" "frontend_assets" {
  bucket = "azora-frontend-assets-${var.environment}"
  
  tags = {
    Name        = "Azora Frontend Assets"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_assets" {
  bucket = aws_s3_bucket.frontend_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "frontend_assets" {
  bucket = aws_s3_bucket.frontend_assets.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

# CloudFront Distribution for Frontend Apps
resource "aws_cloudfront_distribution" "azora_sapiens" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = ["sapiens.${var.domain_name}"]

  origin {
    domain_name = aws_s3_bucket.frontend_assets.bucket_regional_domain_name
    origin_id   = "S3-azora-sapiens"
    origin_path = "/sapiens"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-azora-sapiens"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.main.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name        = "Azora Sapiens CDN"
    Environment = var.environment
  }
}

resource "aws_cloudfront_origin_access_identity" "main" {
  comment = "Azora Frontend Access Identity"
}

# ACM Certificate for HTTPS
resource "aws_acm_certificate" "main" {
  domain_name               = "*.${var.domain_name}"
  subject_alternative_names = [var.domain_name]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "Azora Wildcard Certificate"
    Environment = var.environment
  }
}

# Route53 DNS Records
resource "aws_route53_record" "sapiens" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "sapiens.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.azora_sapiens.domain_name
    zone_id                = aws_cloudfront_distribution.azora_sapiens.hosted_zone_id
    evaluate_target_health = false
  }
}

# API Gateway (AWS API Gateway for backend routing)
resource "aws_api_gateway_rest_api" "main" {
  name        = "azora-api-gateway-${var.environment}"
  description = "Azora OS API Gateway"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "Azora API Gateway"
    Environment = var.environment
  }
}

# VPC Link for EKS backend services
resource "aws_api_gateway_vpc_link" "main" {
  name        = "azora-vpc-link-${var.environment}"
  target_arns = [aws_lb.backend.arn]

  tags = {
    Name        = "Azora VPC Link"
    Environment = var.environment
  }
}

# Load Balancer for Backend Services
resource "aws_lb" "backend" {
  name               = "azora-backend-lb-${var.environment}"
  internal           = true
  load_balancer_type = "network"
  subnets            = module.vpc.private_subnets

  tags = {
    Name        = "Azora Backend Load Balancer"
    Environment = var.environment
  }
}

# VPC Module
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "azora-vpc-${var.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "Azora VPC"
    Environment = var.environment
  }
}

# EKS Cluster (using existing module)
module "eks" {
  source = "./modules/aws-eks"

  cluster_name    = "azora-${var.environment}"
  cluster_version = "1.28"
  
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets

  tags = {
    Environment = var.environment
  }
}

# RDS for PostgreSQL
resource "aws_db_instance" "main" {
  identifier           = "azora-db-${var.environment}"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.medium"
  allocated_storage    = 100
  storage_encrypted    = true
  
  db_name  = "azora"
  username = "azora_admin"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  skip_final_snapshot = false
  final_snapshot_identifier = "azora-db-final-${var.environment}"

  tags = {
    Name        = "Azora Database"
    Environment = var.environment
  }
}

resource "aws_db_subnet_group" "main" {
  name       = "azora-db-subnet-${var.environment}"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name        = "Azora DB Subnet Group"
    Environment = var.environment
  }
}

# ElastiCache for Redis
resource "aws_elasticache_cluster" "main" {
  cluster_id           = "azora-redis-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t3.medium"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  tags = {
    Name        = "Azora Redis"
    Environment = var.environment
  }
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "azora-redis-subnet-${var.environment}"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name        = "Azora Redis Subnet Group"
    Environment = var.environment
  }
}

# Security Groups
resource "aws_security_group" "rds" {
  name        = "azora-rds-sg-${var.environment}"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "Azora RDS Security Group"
    Environment = var.environment
  }
}

resource "aws_security_group" "redis" {
  name        = "azora-redis-sg-${var.environment}"
  description = "Security group for ElastiCache Redis"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "Azora Redis Security Group"
    Environment = var.environment
  }
}

# Secrets Manager for sensitive data
resource "aws_secretsmanager_secret" "db_password" {
  name = "azora/db-password-${var.environment}"
  
  tags = {
    Name        = "Azora DB Password"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

# Outputs
output "cloudfront_domain" {
  value = aws_cloudfront_distribution.azora_sapiens.domain_name
}

output "api_gateway_url" {
  value = aws_api_gateway_rest_api.main.execution_arn
}

output "rds_endpoint" {
  value     = aws_db_instance.main.endpoint
  sensitive = true
}

output "redis_endpoint" {
  value     = aws_elasticache_cluster.main.cache_nodes[0].address
  sensitive = true
}

output "eks_cluster_endpoint" {
  value     = module.eks.cluster_endpoint
  sensitive = true
}

# Variables for sensitive data
variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
