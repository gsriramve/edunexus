# Terraform Outputs

# EC2 Outputs
output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.ec2.public_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.main.id
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = "ssh -i edunexus-key.pem ec2-user@${aws_eip.ec2.public_ip}"
}

output "ssh_key_file" {
  description = "Path to SSH private key"
  value       = local_file.ssh_key.filename
}

# RDS Outputs
output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS PostgreSQL port"
  value       = aws_db_instance.main.port
}

output "database_url" {
  description = "Full database connection URL"
  value       = "postgresql://${var.db_username}:<password>@${aws_db_instance.main.address}:5432/${var.db_name}"
  sensitive   = true
}

# S3 Outputs
output "s3_uploads_bucket" {
  description = "S3 bucket name for uploads"
  value       = aws_s3_bucket.uploads.id
}

output "s3_backups_bucket" {
  description = "S3 bucket name for backups"
  value       = aws_s3_bucket.backups.id
}

# Secrets Manager
output "db_password_secret_arn" {
  description = "ARN of the database password secret"
  value       = aws_secretsmanager_secret.db_password.arn
}

output "ssh_key_secret_arn" {
  description = "ARN of the SSH key secret"
  value       = aws_secretsmanager_secret.ssh_key.arn
}

# Application URLs
output "app_url_http" {
  description = "Application URL (HTTP)"
  value       = "http://${aws_eip.ec2.public_ip}"
}

output "api_url" {
  description = "API URL"
  value       = "http://${aws_eip.ec2.public_ip}/api"
}

# VPC Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

# CloudWatch Outputs
output "cloudwatch_dashboard_url" {
  description = "CloudWatch dashboard URL"
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${local.name_prefix}-dashboard"
}

output "sns_alerts_topic_arn" {
  description = "SNS topic ARN for alerts"
  value       = aws_sns_topic.alerts.arn
}

# Helpful next steps
output "next_steps" {
  description = "Next steps after terraform apply"
  value       = <<-EOT

    ============================================
    EduNexus AWS Infrastructure Created!
    ============================================

    1. SSH into your server:
       ${local_file.ssh_key.filename}
       ssh -i edunexus-key.pem ec2-user@${aws_eip.ec2.public_ip}

    2. Clone the repository:
       cd ~/edunexus
       git clone https://github.com/gsriramve/edunexus.git .

    3. Update .env with your API keys:
       nano ~/.env
       (Add JWT_SECRET, SendGrid, Razorpay keys)

    4. Restore your database (optional):
       scp -i edunexus-key.pem backup.dump ec2-user@${aws_eip.ec2.public_ip}:~/
       ./restore-db.sh backup.dump

    5. Deploy the application:
       ./deploy.sh

    6. Access your app:
       http://${aws_eip.ec2.public_ip}

    7. Set up SSL (after DNS):
       ./setup-ssl.sh your-domain.com

    ============================================
  EOT
}
