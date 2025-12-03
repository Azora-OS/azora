# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name = "${var.project_name}-cluster"
  }
}

# ECS Cluster Capacity Providers
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name
  
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 1
    base              = 0
  }
}

# ECR Repositories
resource "aws_ecr_repository" "prpeng" {
  name                 = "${var.project_name}/prpeng-engine"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = {
    Name = "prpeng-engine"
  }
}

resource "aws_ecr_repository" "ai_routing" {
  name                 = "${var.project_name}/ai-routing"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = {
    Name = "ai-routing"
  }
}

resource "aws_ecr_repository" "azora_mint" {
  name                 = "${var.project_name}/azora-mint"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = {
    Name = "azora-mint"
  }
}

resource "aws_ecr_repository" "constitutional_ai" {
  name                 = "${var.project_name}/constitutional-ai"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = {
    Name = "constitutional-ai"
  }
}

# ECR Lifecycle Policies
resource "aws_ecr_lifecycle_policy" "main" {
  for_each = {
    prpeng          = aws_ecr_repository.prpeng.name
    ai_routing      = aws_ecr_repository.ai_routing.name
    azora_mint      = aws_ecr_repository.azora_mint.name
    constitutional  = aws_ecr_repository.constitutional_ai.name
  }
  
  repository = each.value
  
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-ecs-task-execution-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Role
resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-ecs-task-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "prpeng" {
  name              = "/ecs/${var.project_name}/prpeng-engine"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "ai_routing" {
  name              = "/ecs/${var.project_name}/ai-routing"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "azora_mint" {
  name              = "/ecs/${var.project_name}/azora-mint"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "constitutional_ai" {
  name              = "/ecs/${var.project_name}/constitutional-ai"
  retention_in_days = 7
}
