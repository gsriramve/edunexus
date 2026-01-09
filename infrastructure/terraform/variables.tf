# EduNexus AWS Infrastructure Variables

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "edunexus"
}

variable "environment" {
  description = "Environment (demo, staging, production)"
  type        = string
  default     = "demo"
}

# EC2 Configuration
variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small" # 2 vCPU, 2GB RAM - ~$15/month
}

variable "ec2_volume_size" {
  description = "EC2 root volume size in GB"
  type        = number
  default     = 20
}

# RDS Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro" # Free Tier eligible
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20 # Free Tier: 20GB included
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "edunexus"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "edunexus"
}

# Domain Configuration (optional)
variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
}

# SSH Access
variable "allowed_ssh_cidr" {
  description = "CIDR block allowed for SSH access (your IP)"
  type        = string
  default     = "0.0.0.0/0" # Change to your IP for security
}

# Tags
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "EduNexus"
    Environment = "demo"
    ManagedBy   = "Terraform"
  }
}
