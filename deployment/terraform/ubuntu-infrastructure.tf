# Ubuntu AWS Infrastructure
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Ubuntu = "I provision because we scale together"
      Project = "Azora OS"
      Environment = var.environment
    }
  }
}

# Ubuntu VPC
resource "aws_vpc" "ubuntu_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "Ubuntu VPC"
    Ubuntu = "Network foundation for our collective"
  }
}

# Ubuntu EKS Cluster
resource "aws_eks_cluster" "ubuntu_cluster" {
  name     = "azora-ubuntu-cluster"
  role_arn = aws_iam_role.ubuntu_cluster_role.arn
  version  = "1.27"

  vpc_config {
    subnet_ids = aws_subnet.ubuntu_public[*].id
  }

  tags = {
    Ubuntu = "Kubernetes cluster for Ubuntu scalability"
  }
}