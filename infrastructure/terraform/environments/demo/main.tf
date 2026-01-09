# EduNexus Demo Environment
# Cost-optimized infrastructure using ECS Fargate
# Estimated cost: ~$100/month (fits within $200 free credits)

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    bucket         = "edunexus-terraform-state"
    key            = "demo/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "edunexus-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      CostCenter  = "demo"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "edunexus"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "demo"
}

variable "domain_name" {
  description = "Domain name for the demo environment"
  type        = string
  default     = "demo.edunexus.io"
}

# VPC Module (Minimal config for demo)
module "vpc" {
  source = "../../modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = "10.2.0.0/16"
  availability_zones = ["ap-south-1a", "ap-south-1b"]  # 2 AZs minimum for ALB
}

# RDS Module (Cost-optimized)
module "rds" {
  source = "../../modules/rds"

  project_name            = var.project_name
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  db_subnet_group_name    = module.vpc.db_subnet_group_name
  allowed_security_groups = [module.ecs.ecs_security_group_id]

  # Cost optimization: smallest instance, single AZ
  instance_class          = "db.t3.micro"  # ~$15/month
  allocated_storage       = 20
  max_allocated_storage   = 50
  multi_az                = false           # Single AZ for demo
  backup_retention_period = 1               # Minimal backups for demo
  enable_proxy            = false           # No proxy needed for demo
}

# ECS Fargate Module (Cost-optimized alternative to EKS)
module "ecs" {
  source = "../../modules/ecs"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids

  database_url    = module.rds.database_url
  redis_url       = ""  # No Redis for demo (optional - add if needed)
  certificate_arn = ""  # Add ACM certificate ARN when domain is ready
  domain_name     = var.domain_name
}

# S3 Module
module "s3" {
  source = "../../modules/s3"

  project_name           = var.project_name
  environment            = var.environment
  enable_versioning      = false  # Cost optimization
  enable_lifecycle_rules = true   # Auto-delete old files
}

# Secrets Module
module "secrets" {
  source = "../../modules/secrets"

  project_name = var.project_name
  environment  = var.environment
  database_url = module.rds.database_url
  redis_url    = ""
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.ecs.alb_dns_name
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_instance_endpoint
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value       = module.ecs.ecr_repository_urls
}

output "demo_url" {
  description = "Demo application URL (update DNS to point to ALB)"
  value       = "https://${var.domain_name} -> ${module.ecs.alb_dns_name}"
}

output "monthly_cost_estimate" {
  description = "Estimated monthly AWS cost"
  value       = <<-EOT
    ECS Fargate (Spot):  ~$30/month
    RDS db.t3.micro:     ~$15/month
    ALB:                 ~$20/month
    S3 + CloudFront:     ~$15/month
    Other (ECR, CW):     ~$10/month
    ────────────────────────────────
    Total Estimate:      ~$90-100/month

    With $200 credits = ~2 months runway
  EOT
}
