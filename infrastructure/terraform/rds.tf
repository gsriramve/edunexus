# RDS PostgreSQL Database (Free Tier Eligible)

# Generate random password for database
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Store password in AWS Secrets Manager (optional but recommended)
resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${local.name_prefix}-db-password"
  description             = "RDS PostgreSQL password for EduNexus"
  recovery_window_in_days = 0 # Set to 0 for immediate deletion during testing

  tags = {
    Name = "${local.name_prefix}-db-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    host     = aws_db_instance.main.address
    port     = 5432
    database = var.db_name
  })
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier = "${local.name_prefix}-postgres"

  # Engine
  engine               = "postgres"
  engine_version       = "16.3"
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_allocated_storage
  storage_type         = "gp2"
  storage_encrypted    = true

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = true # Enable for initial setup, disable later for security

  # Backup & Maintenance
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  # Performance
  performance_insights_enabled = false # Not available on db.t3.micro

  # Options
  skip_final_snapshot     = true # Set to false for production
  deletion_protection     = false # Set to true for production
  delete_automated_backups = true

  # Free Tier optimization
  multi_az               = false
  copy_tags_to_snapshot  = true

  tags = {
    Name = "${local.name_prefix}-postgres"
  }
}
