# EC2 Instance for EduNexus Application

# Generate SSH key pair
resource "tls_private_key" "ec2" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "ec2" {
  key_name   = "${local.name_prefix}-key"
  public_key = tls_private_key.ec2.public_key_openssh

  tags = {
    Name = "${local.name_prefix}-key"
  }
}

# Store private key in Secrets Manager
resource "aws_secretsmanager_secret" "ssh_key" {
  name                    = "${local.name_prefix}-ssh-key"
  description             = "SSH private key for EC2 instance"
  recovery_window_in_days = 0

  tags = {
    Name = "${local.name_prefix}-ssh-key"
  }
}

resource "aws_secretsmanager_secret_version" "ssh_key" {
  secret_id     = aws_secretsmanager_secret.ssh_key.id
  secret_string = tls_private_key.ec2.private_key_pem
}

# Save private key locally for convenience
resource "local_file" "ssh_key" {
  content         = tls_private_key.ec2.private_key_pem
  filename        = "${path.module}/edunexus-key.pem"
  file_permission = "0400"
}

# IAM Role for EC2 (for S3 access and SSM)
resource "aws_iam_role" "ec2" {
  name = "${local.name_prefix}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${local.name_prefix}-ec2-role"
  }
}

# Attach policies to EC2 role
resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "ec2_s3" {
  name = "${local.name_prefix}-ec2-s3-policy"
  role = aws_iam_role.ec2.id

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
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*"
        ]
      }
    ]
  })
}

# ECR Read permissions for pulling Docker images
resource "aws_iam_role_policy" "ec2_ecr" {
  name = "${local.name_prefix}-ec2-ecr-policy"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = [
          aws_ecr_repository.api.arn,
          aws_ecr_repository.web.arn,
          aws_ecr_repository.ml.arn
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${local.name_prefix}-ec2-profile"
  role = aws_iam_role.ec2.name
}

# Elastic IP for EC2
resource "aws_eip" "ec2" {
  domain = "vpc"

  tags = {
    Name = "${local.name_prefix}-eip"
  }
}

resource "aws_eip_association" "ec2" {
  instance_id   = aws_instance.main.id
  allocation_id = aws_eip.ec2.id
}

# EC2 Instance
resource "aws_instance" "main" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.ec2_instance_type
  key_name               = aws_key_pair.ec2.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  root_block_device {
    volume_size           = var.ec2_volume_size
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  user_data = base64encode(templatefile("${path.module}/scripts/user-data.sh", {
    db_host     = aws_db_instance.main.address
    db_name     = var.db_name
    db_username = var.db_username
    db_password = random_password.db_password.result
    s3_bucket   = aws_s3_bucket.uploads.id
    aws_region  = var.aws_region
  }))

  tags = {
    Name = "${local.name_prefix}-server"
  }

  # Wait for RDS to be ready
  depends_on = [aws_db_instance.main]
}
