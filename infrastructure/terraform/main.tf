# Terraform configuration to set up the required AWS provider.
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS provider.
provider "aws" {
  region = "us-east-1"
}

# --- 1. The Virtual Private Cloud (VPC) ---
resource "aws_vpc" "azora_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "Azora-VPC" }
}

# --- 2. Subnets ---
resource "aws_subnet" "azora_public_subnet" {
  vpc_id            = aws_vpc.azora_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags = { Name = "Azora-Public-Subnet" }
}

resource "aws_subnet" "azora_private_subnet" {
  vpc_id            = aws_vpc.azora_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1a"
  tags = { Name = "Azora-Private-Subnet" }
}

# --- 3. Internet Gateway & Routing ---
resource "aws_internet_gateway" "azora_igw" {
  vpc_id = aws_vpc.azora_vpc.id
  tags = { Name = "Azora-IGW" }
}

resource "aws_route_table" "azora_public_rt" {
  vpc_id = aws_vpc.azora_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.azora_igw.id
  }
  tags = { Name = "Azora-Public-Route-Table" }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.azora_public_subnet.id
  route_table_id = aws_route_table.azora_public_rt.id
}

# --- 4. IAM Roles for EKS ---
resource "aws_iam_role" "azora_eks_cluster_role" {
  name = "azora-eks-cluster-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "eks.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "azora_eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.azora_eks_cluster_role.name
}

resource "aws_iam_role" "azora_eks_node_role" {
  name = "azora-eks-node-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "ec2.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "azora_eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.azora_eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "azora_eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.azora_eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "azora_ecr_read_only_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.azora_eks_node_role.name
}

# --- 5. The EKS Cluster ---
resource "aws_eks_cluster" "azora_cluster" {
  name     = "azora-cluster"
  role_arn = aws_iam_role.azora_eks_cluster_role.arn
  vpc_config {
    subnet_ids = [aws_subnet.azora_public_subnet.id, aws_subnet.azora_private_subnet.id]
  }
  depends_on = [aws_iam_role_policy_attachment.azora_eks_cluster_policy]
}

# --- 6. The EKS Node Group ---
resource "aws_eks_node_group" "azora_node_group" {
  cluster_name    = aws_eks_cluster.azora_cluster.name
  node_group_name = "azora-main-nodegroup"
  node_role_arn   = aws_iam_role.azora_eks_node_role.arn
  subnet_ids      = [aws_subnet.azora_private_subnet.id]
  instance_types  = ["t3.medium"]
  scaling_config {
    desired_size = 2
    max_size     = 5
    min_size     = 1
  }
  depends_on = [
    aws_iam_role_policy_attachment.azora_eks_worker_node_policy,
    aws_iam_role_policy_attachment.azora_eks_cni_policy,
    aws_iam_role_policy_attachment.azora_ecr_read_only_policy,
  ]
}

# --- 7. Elastic Container Registry (ECR) ---
locals {
  services = toset([
    "auth-service", "user-service", "constitutional-ai", "ai-tutor-service",
    "azora-pay", "azora-blockchain", "citadel-fund", "proof-of-value", "reputation-service"
  ])
}

resource "aws_ecr_repository" "azora_service_repos" {
  for_each             = local.services
  name                 = "azora/${each.key}"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  tags = {
    Name    = "Azora-${each.key}"
    Service = each.key
  }
}

# Outputs
output "eks_cluster_endpoint" {
  value = aws_eks_cluster.azora_cluster.endpoint
}

output "eks_cluster_name" {
  value = aws_eks_cluster.azora_cluster.name
}

output "ecr_repositories" {
  value = { for k, v in aws_ecr_repository.azora_service_repos : k => v.repository_url }
}