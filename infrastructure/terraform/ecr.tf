# ===========================================
# ECR Repositories for Docker Images
# ===========================================

# Web Application Repository
resource "aws_ecr_repository" "web" {
  name                 = "edunexus-web"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "edunexus-web"
    Environment = "production"
    Project     = "EduNexus"
  }
}

# API Repository
resource "aws_ecr_repository" "api" {
  name                 = "edunexus-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "edunexus-api"
    Environment = "production"
    Project     = "EduNexus"
  }
}

# ML Service Repository (optional, for future use)
resource "aws_ecr_repository" "ml" {
  name                 = "edunexus-ml"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "edunexus-ml"
    Environment = "production"
    Project     = "EduNexus"
  }
}

# Lifecycle policy to clean up old images (keep last 10)
resource "aws_ecr_lifecycle_policy" "web_cleanup" {
  repository = aws_ecr_repository.web.name

  policy = jsonencode({
    rules = [
      {
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
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "api_cleanup" {
  repository = aws_ecr_repository.api.name

  policy = jsonencode({
    rules = [
      {
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
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "ml_cleanup" {
  repository = aws_ecr_repository.ml.name

  policy = jsonencode({
    rules = [
      {
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
      }
    ]
  })
}

# ===========================================
# Outputs
# ===========================================
output "ecr_web_repository_url" {
  description = "ECR repository URL for web app"
  value       = aws_ecr_repository.web.repository_url
}

output "ecr_api_repository_url" {
  description = "ECR repository URL for API"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_ml_repository_url" {
  description = "ECR repository URL for ML service"
  value       = aws_ecr_repository.ml.repository_url
}
