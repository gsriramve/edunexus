# ElastiCache Redis Module for EduNexus
# Creates Redis cluster for caching and session management

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_group_name" {
  description = "ElastiCache subnet group name"
  type        = string
}

variable "allowed_security_groups" {
  description = "Security groups allowed to access Redis"
  type        = list(string)
  default     = []
}

variable "node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "num_cache_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 1
}

variable "engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0"
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Security Group for ElastiCache
resource "aws_security_group" "redis" {
  name        = "${local.name_prefix}-redis-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Redis from allowed security groups"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = var.allowed_security_groups
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis-sg"
  })
}

# Redis Parameter Group
resource "aws_elasticache_parameter_group" "main" {
  name        = "${local.name_prefix}-redis7"
  family      = "redis7"
  description = "Redis 7 parameter group for ${local.name_prefix}"

  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"
  }

  tags = local.common_tags
}

# ElastiCache Cluster (single node for dev/staging)
resource "aws_elasticache_cluster" "main" {
  count = var.environment != "production" ? 1 : 0

  cluster_id           = "${local.name_prefix}-redis"
  engine               = "redis"
  engine_version       = var.engine_version
  node_type            = var.node_type
  num_cache_nodes      = var.num_cache_nodes
  parameter_group_name = aws_elasticache_parameter_group.main.name
  subnet_group_name    = var.subnet_group_name
  security_group_ids   = [aws_security_group.redis.id]
  port                 = 6379

  snapshot_retention_limit = var.environment == "staging" ? 1 : 0

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis"
  })
}

# ElastiCache Replication Group (for production - Multi-AZ)
resource "aws_elasticache_replication_group" "main" {
  count = var.environment == "production" ? 1 : 0

  replication_group_id = "${local.name_prefix}-redis"
  description          = "Redis cluster for ${local.name_prefix}"

  engine               = "redis"
  engine_version       = var.engine_version
  node_type            = var.node_type
  parameter_group_name = aws_elasticache_parameter_group.main.name
  subnet_group_name    = var.subnet_group_name
  security_group_ids   = [aws_security_group.redis.id]
  port                 = 6379

  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled           = true

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  snapshot_retention_limit = 7
  snapshot_window          = "03:00-04:00"
  maintenance_window       = "sun:04:00-sun:05:00"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis"
  })
}

# Outputs
output "redis_endpoint" {
  description = "Redis endpoint"
  value = var.environment == "production" ? (
    aws_elasticache_replication_group.main[0].primary_endpoint_address
  ) : (
    aws_elasticache_cluster.main[0].cache_nodes[0].address
  )
}

output "redis_port" {
  description = "Redis port"
  value       = 6379
}

output "redis_security_group_id" {
  description = "Redis security group ID"
  value       = aws_security_group.redis.id
}

output "redis_connection_string" {
  description = "Redis connection string"
  value = var.environment == "production" ? (
    "redis://${aws_elasticache_replication_group.main[0].primary_endpoint_address}:6379"
  ) : (
    "redis://${aws_elasticache_cluster.main[0].cache_nodes[0].address}:6379"
  )
}
