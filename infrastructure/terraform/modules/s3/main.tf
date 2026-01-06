# S3 Module for EduNexus
# Creates S3 buckets for document storage

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
}

variable "enable_versioning" {
  description = "Enable bucket versioning"
  type        = bool
  default     = true
}

variable "enable_lifecycle_rules" {
  description = "Enable lifecycle rules for cost optimization"
  type        = bool
  default     = true
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Document Storage Bucket
resource "aws_s3_bucket" "documents" {
  bucket = "${local.name_prefix}-documents"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-documents"
  })
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Disabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket = aws_s3_bucket.documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "documents" {
  count  = var.enable_lifecycle_rules ? 1 : 0
  bucket = aws_s3_bucket.documents.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 365
      storage_class = "GLACIER"
    }

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }

  rule {
    id     = "abort-incomplete-uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# CORS Configuration for frontend access
resource "aws_s3_bucket_cors_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = var.environment == "production" ? [
      "https://app.edunexus.io",
      "https://*.edunexus.io"
    ] : ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

# Uploads Bucket (for temporary uploads)
resource "aws_s3_bucket" "uploads" {
  bucket = "${local.name_prefix}-uploads"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-uploads"
  })
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "cleanup-temp-uploads"
    status = "Enabled"

    expiration {
      days = 1
    }
  }
}

# IAM Policy for S3 Access
resource "aws_iam_policy" "s3_access" {
  name        = "${local.name_prefix}-s3-access"
  description = "Policy for S3 bucket access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.documents.arn,
          "${aws_s3_bucket.documents.arn}/*",
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*"
        ]
      }
    ]
  })

  tags = local.common_tags
}

# Outputs
output "documents_bucket_name" {
  description = "Documents bucket name"
  value       = aws_s3_bucket.documents.id
}

output "documents_bucket_arn" {
  description = "Documents bucket ARN"
  value       = aws_s3_bucket.documents.arn
}

output "documents_bucket_domain" {
  description = "Documents bucket domain name"
  value       = aws_s3_bucket.documents.bucket_regional_domain_name
}

output "uploads_bucket_name" {
  description = "Uploads bucket name"
  value       = aws_s3_bucket.uploads.id
}

output "uploads_bucket_arn" {
  description = "Uploads bucket ARN"
  value       = aws_s3_bucket.uploads.arn
}

output "s3_access_policy_arn" {
  description = "IAM policy ARN for S3 access"
  value       = aws_iam_policy.s3_access.arn
}
