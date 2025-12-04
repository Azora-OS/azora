# Azora OS - Vercel Hybrid Deployment Configuration
# This Terraform configuration deploys frontend apps to Vercel
# while backend services remain on AWS/GCP infrastructure

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }

  # Backend configuration for state management
  backend "s3" {
    bucket = "azora-terraform-state"
    key    = "vercel/terraform.tfstate"
    region = "us-east-1"
  }
}

# Vercel Provider Configuration
provider "vercel" {
  # API token should be set via VERCEL_API_TOKEN environment variable
  # or passed through GitHub Secrets in CI/CD
}

# Variables
variable "vercel_team_id" {
  description = "Vercel Team ID"
  type        = string
  sensitive   = true
}

variable "api_gateway_url" {
  description = "API Gateway URL for backend services"
  type        = string
  default     = "https://api.azora.io"
}

variable "blockchain_rpc_url" {
  description = "Blockchain RPC URL"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

# Azora Sapiens (Education Platform)
resource "vercel_project" "azora_sapiens" {
  name      = "azora-sapiens"
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = "Sizwe780/azora-os"
  }

  root_directory = "apps/azora-sapiens"

  environment = [
    {
      key    = "NEXT_PUBLIC_API_GATEWAY_URL"
      value  = var.api_gateway_url
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_BLOCKCHAIN_RPC_URL"
      value  = var.blockchain_rpc_url
      target = ["production"]
    },
    {
      key    = "NEXT_PUBLIC_ENVIRONMENT"
      value  = var.environment
      target = ["production", "preview"]
    }
  ]

  build_command = "npm run build"
  output_directory = ".next"
}

# Azora Jobspaces (Work Platform)
resource "vercel_project" "azora_jobspaces" {
  name      = "azora-jobspaces"
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = "Sizwe780/azora-os"
  }

  root_directory = "apps/azora-jobspaces"

  environment = [
    {
      key    = "NEXT_PUBLIC_API_GATEWAY_URL"
      value  = var.api_gateway_url
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_ENVIRONMENT"
      value  = var.environment
      target = ["production", "preview"]
    }
  ]

  build_command = "npm run build"
  output_directory = ".next"
}

# Azora Pay (Finance Platform)
resource "vercel_project" "azora_pay" {
  name      = "azora-pay"
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = "Sizwe780/azora-os"
  }

  root_directory = "apps/azora-pay"

  environment = [
    {
      key    = "NEXT_PUBLIC_API_GATEWAY_URL"
      value  = var.api_gateway_url
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_FIAT_SERVICE_URL"
      value  = "${var.api_gateway_url}/fiat"
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_ENVIRONMENT"
      value  = var.environment
      target = ["production", "preview"]
    }
  ]

  build_command = "npm run build"
  output_directory = ".next"
}

# Web (Marketing Site)
resource "vercel_project" "web" {
  name      = "azora-web"
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = "Sizwe780/azora-os"
  }

  root_directory = "apps/web"

  environment = [
    {
      key    = "NEXT_PUBLIC_API_GATEWAY_URL"
      value  = var.api_gateway_url
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_ENVIRONMENT"
      value  = var.environment
      target = ["production", "preview"]
    }
  ]

  build_command = "npm run build"
  output_directory = ".next"
}

# Azora BuildSpaces (Creator Platform)
resource "vercel_project" "azora_buildspaces" {
  name      = "azora-buildspaces"
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = "Sizwe780/azora-os"
  }

  root_directory = "apps/azora-buildspaces"

  environment = [
    {
      key    = "NEXT_PUBLIC_API_GATEWAY_URL"
      value  = var.api_gateway_url
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_ENVIRONMENT"
      value  = var.environment
      target = ["production", "preview"]
    }
  ]

  build_command = "npm run build"
  output_directory = ".next"
}

# Domain Configuration
resource "vercel_project_domain" "sapiens_domain" {
  project_id = vercel_project.azora_sapiens.id
  domain     = "sapiens.azora.io"
}

resource "vercel_project_domain" "jobs_domain" {
  project_id = vercel_project.azora_jobspaces.id
  domain     = "jobs.azora.io"
}

resource "vercel_project_domain" "pay_domain" {
  project_id = vercel_project.azora_pay.id
  domain     = "pay.azora.io"
}

resource "vercel_project_domain" "build_domain" {
  project_id = vercel_project.azora_buildspaces.id
  domain     = "build.azora.io"
}

resource "vercel_project_domain" "web_domain" {
  project_id = vercel_project.web.id
  domain     = "azora.io"
}

# Outputs
output "sapiens_url" {
  value = "https://sapiens.azora.io"
}

output "jobs_url" {
  value = "https://jobs.azora.io"
}

output "pay_url" {
  value = "https://pay.azora.io"
}

output "build_url" {
  value = "https://build.azora.io"
}

output "web_url" {
  value = "https://azora.io"
}
