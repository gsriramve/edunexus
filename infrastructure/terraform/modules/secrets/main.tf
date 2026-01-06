# Secrets Manager Module for EduNexus
# Creates and manages application secrets

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "redis_url" {
  description = "Redis connection URL"
  type        = string
  sensitive   = true
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# API Secrets
resource "aws_secretsmanager_secret" "api" {
  name        = "${local.name_prefix}/api"
  description = "API application secrets for ${local.name_prefix}"

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "api" {
  secret_id = aws_secretsmanager_secret.api.id
  secret_string = jsonencode({
    DATABASE_URL     = var.database_url
    REDIS_URL        = var.redis_url
    NODE_ENV         = var.environment
    # Placeholders - to be updated manually or via CI/CD
    CLERK_SECRET_KEY            = "PLACEHOLDER"
    RAZORPAY_KEY_ID             = "PLACEHOLDER"
    RAZORPAY_KEY_SECRET         = "PLACEHOLDER"
    RAZORPAY_WEBHOOK_SECRET     = "PLACEHOLDER"
    SENDGRID_API_KEY            = "PLACEHOLDER"
    MSG91_AUTH_KEY              = "PLACEHOLDER"
    FIREBASE_PROJECT_ID         = "PLACEHOLDER"
    FIREBASE_CLIENT_EMAIL       = "PLACEHOLDER"
    FIREBASE_PRIVATE_KEY        = "PLACEHOLDER"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# Web Secrets
resource "aws_secretsmanager_secret" "web" {
  name        = "${local.name_prefix}/web"
  description = "Web application secrets for ${local.name_prefix}"

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "web" {
  secret_id = aws_secretsmanager_secret.web.id
  secret_string = jsonencode({
    NODE_ENV                              = var.environment
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY     = "PLACEHOLDER"
    CLERK_SECRET_KEY                      = "PLACEHOLDER"
    NEXT_PUBLIC_RAZORPAY_KEY_ID           = "PLACEHOLDER"
    NEXT_PUBLIC_API_URL                   = "PLACEHOLDER"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# IAM Policy for Secrets Access
resource "aws_iam_policy" "secrets_access" {
  name        = "${local.name_prefix}-secrets-access"
  description = "Policy for Secrets Manager access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.api.arn,
          aws_secretsmanager_secret.web.arn
        ]
      }
    ]
  })

  tags = local.common_tags
}

# Outputs
output "api_secret_arn" {
  description = "API secrets ARN"
  value       = aws_secretsmanager_secret.api.arn
}

output "api_secret_name" {
  description = "API secrets name"
  value       = aws_secretsmanager_secret.api.name
}

output "web_secret_arn" {
  description = "Web secrets ARN"
  value       = aws_secretsmanager_secret.web.arn
}

output "web_secret_name" {
  description = "Web secrets name"
  value       = aws_secretsmanager_secret.web.name
}

output "secrets_access_policy_arn" {
  description = "IAM policy ARN for secrets access"
  value       = aws_iam_policy.secrets_access.arn
}
