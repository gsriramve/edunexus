# EduNexus Staging Environment
# Terraform configuration for staging infrastructure

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
    key            = "staging/terraform.tfstate"
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
  default     = "staging"
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = "10.1.0.0/16"
  availability_zones = ["ap-south-1a", "ap-south-1b"]
}

# RDS Module
module "rds" {
  source = "../../modules/rds"

  project_name            = var.project_name
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  db_subnet_group_name    = module.vpc.db_subnet_group_name
  allowed_security_groups = [module.eks.node_security_group_id]

  instance_class          = "db.t3.medium"
  allocated_storage       = 20
  max_allocated_storage   = 100
  multi_az                = false
  backup_retention_period = 3
  enable_proxy            = false
}

# ElastiCache Module
module "elasticache" {
  source = "../../modules/elasticache"

  project_name            = var.project_name
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  subnet_group_name       = module.vpc.elasticache_subnet_group_name
  allowed_security_groups = [module.eks.node_security_group_id]

  node_type       = "cache.t3.small"
  num_cache_nodes = 1
}

# EKS Module
module "eks" {
  source = "../../modules/eks"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids

  cluster_version     = "1.29"
  node_instance_types = ["t3.medium"]
  node_desired_size   = 2
  node_min_size       = 1
  node_max_size       = 4
}

# S3 Module
module "s3" {
  source = "../../modules/s3"

  project_name           = var.project_name
  environment            = var.environment
  enable_versioning      = true
  enable_lifecycle_rules = false
}

# Secrets Module
module "secrets" {
  source = "../../modules/secrets"

  project_name = var.project_name
  environment  = var.environment
  database_url = module.rds.database_url
  redis_url    = module.elasticache.redis_connection_string
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_instance_endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.elasticache.redis_endpoint
}

output "kubeconfig_command" {
  description = "Command to update kubeconfig"
  value       = module.eks.kubeconfig_command
}
