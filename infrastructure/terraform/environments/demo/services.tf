# EduNexus Demo Environment - ECS Service Definitions
# Apply this AFTER pushing Docker images to ECR

# Variables for service configuration
variable "web_image_tag" {
  description = "Docker image tag for web service"
  type        = string
  default     = "latest"
}

variable "api_image_tag" {
  description = "Docker image tag for API service"
  type        = string
  default     = "latest"
}

variable "ml_image_tag" {
  description = "Docker image tag for ML service"
  type        = string
  default     = "latest"
}

# ECS Task Definition - Web (Next.js)
resource "aws_ecs_task_definition" "web" {
  family                   = "${var.project_name}-${var.environment}-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256   # 0.25 vCPU - cost optimized for demo
  memory                   = 512   # 512 MB
  execution_role_arn       = module.ecs.task_execution_role_arn
  task_role_arn            = module.ecs.task_role_arn

  container_definitions = jsonencode([
    {
      name  = "web"
      image = "${module.ecs.ecr_repository_urls["web"]}:${var.web_image_tag}"

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "NEXT_PUBLIC_API_URL", value = "https://${var.domain_name}/api" },
        { name = "NEXT_PUBLIC_APP_URL", value = "https://${var.domain_name}" },
        { name = "NEXT_PUBLIC_CLERK_SIGN_IN_URL", value = "/sign-in" },
        { name = "NEXT_PUBLIC_CLERK_SIGN_UP_URL", value = "/sign-up" },
        { name = "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL", value = "/" },
        { name = "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL", value = "/" },
      ]

      secrets = [
        {
          name      = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
          valueFrom = "${module.secrets.secrets_arn}:CLERK_PUBLISHABLE_KEY::"
        },
        {
          name      = "CLERK_SECRET_KEY"
          valueFrom = "${module.secrets.secrets_arn}:CLERK_SECRET_KEY::"
        },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = module.ecs.log_group_names["web"]
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "web"
  }
}

# ECS Task Definition - API (NestJS)
resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project_name}-${var.environment}-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512   # 0.5 vCPU
  memory                   = 1024  # 1 GB
  execution_role_arn       = module.ecs.task_execution_role_arn
  task_role_arn            = module.ecs.task_role_arn

  container_definitions = jsonencode([
    {
      name  = "api"
      image = "${module.ecs.ecr_repository_urls["api"]}:${var.api_image_tag}"

      portMappings = [
        {
          containerPort = 3001
          hostPort      = 3001
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "3001" },
        { name = "ML_SERVICE_URL", value = "http://localhost:8000" },  # ML runs as sidecar or separate service
      ]

      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "${module.secrets.secrets_arn}:DATABASE_URL::"
        },
        {
          name      = "CLERK_SECRET_KEY"
          valueFrom = "${module.secrets.secrets_arn}:CLERK_SECRET_KEY::"
        },
        {
          name      = "SENDGRID_API_KEY"
          valueFrom = "${module.secrets.secrets_arn}:SENDGRID_API_KEY::"
        },
        {
          name      = "AWS_ACCESS_KEY_ID"
          valueFrom = "${module.secrets.secrets_arn}:AWS_ACCESS_KEY_ID::"
        },
        {
          name      = "AWS_SECRET_ACCESS_KEY"
          valueFrom = "${module.secrets.secrets_arn}:AWS_SECRET_ACCESS_KEY::"
        },
        {
          name      = "RAZORPAY_KEY_ID"
          valueFrom = "${module.secrets.secrets_arn}:RAZORPAY_KEY_ID::"
        },
        {
          name      = "RAZORPAY_KEY_SECRET"
          valueFrom = "${module.secrets.secrets_arn}:RAZORPAY_KEY_SECRET::"
        },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = module.ecs.log_group_names["api"]
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 30
      }
    }
  ])

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "api"
  }
}

# ECS Task Definition - ML Service (Python/FastAPI)
resource "aws_ecs_task_definition" "ml" {
  family                   = "${var.project_name}-${var.environment}-ml"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512   # 0.5 vCPU
  memory                   = 1024  # 1 GB (ML needs more memory)
  execution_role_arn       = module.ecs.task_execution_role_arn
  task_role_arn            = module.ecs.task_role_arn

  container_definitions = jsonencode([
    {
      name  = "ml"
      image = "${module.ecs.ecr_repository_urls["ml"]}:${var.ml_image_tag}"

      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "DEBUG", value = "false" },
        { name = "DEFAULT_LLM_PROVIDER", value = "openai" },
        { name = "NESTJS_API_URL", value = "http://api:3001" },
      ]

      secrets = [
        {
          name      = "OPENAI_API_KEY"
          valueFrom = "${module.secrets.secrets_arn}:OPENAI_API_KEY::"
        },
        {
          name      = "ANTHROPIC_API_KEY"
          valueFrom = "${module.secrets.secrets_arn}:ANTHROPIC_API_KEY::"
        },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = module.ecs.log_group_names["ml"]
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "python -c \"import httpx; httpx.get('http://localhost:8000/health')\" || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 30
      }
    }
  ])

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "ml"
  }
}

# ECS Service - Web
resource "aws_ecs_service" "web" {
  name            = "${var.project_name}-${var.environment}-web"
  cluster         = module.ecs.cluster_id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = 1  # Single instance for demo (cost optimization)
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnet_ids
    security_groups  = [module.ecs.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = module.ecs.web_target_group_arn
    container_name   = "web"
    container_port   = 3000
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "web"
  }

  lifecycle {
    ignore_changes = [desired_count]  # Allow manual scaling
  }
}

# ECS Service - API
resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-${var.environment}-api"
  cluster         = module.ecs.cluster_id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnet_ids
    security_groups  = [module.ecs.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = module.ecs.api_target_group_arn
    container_name   = "api"
    container_port   = 3001
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "api"
  }

  lifecycle {
    ignore_changes = [desired_count]
  }
}

# ECS Service - ML (Optional - can be disabled to save costs)
resource "aws_ecs_service" "ml" {
  count           = 1  # Set to 0 to disable ML service and save costs
  name            = "${var.project_name}-${var.environment}-ml"
  cluster         = module.ecs.cluster_id
  task_definition = aws_ecs_task_definition.ml.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnet_ids
    security_groups  = [module.ecs.ecs_security_group_id]
    assign_public_ip = false
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "ml"
  }

  lifecycle {
    ignore_changes = [desired_count]
  }
}

# Outputs
output "web_service_name" {
  description = "Web service name"
  value       = aws_ecs_service.web.name
}

output "api_service_name" {
  description = "API service name"
  value       = aws_ecs_service.api.name
}
