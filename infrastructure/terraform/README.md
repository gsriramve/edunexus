# EduNexus AWS Infrastructure with Terraform

This Terraform configuration creates all AWS resources needed to deploy EduNexus.

## Cost Estimate

| Resource | Specification | Monthly Cost |
|----------|---------------|--------------|
| EC2 t3.small | 2 vCPU, 2GB RAM | ~$15 |
| RDS db.t3.micro | PostgreSQL 16 | **$0** (Free Tier) |
| RDS Storage | 20GB gp2 | **$0** (Free Tier) |
| S3 | ~5GB storage | ~$0.15 |
| Elastic IP | Attached to EC2 | $0 |
| Data Transfer | ~10GB/month | ~$1 |
| **Total** | | **~$17/month** |

## Prerequisites

1. **AWS CLI** installed and configured:
   ```bash
   # Install AWS CLI
   brew install awscli  # macOS

   # Configure with your credentials
   aws configure
   ```

2. **Terraform** installed:
   ```bash
   brew install terraform  # macOS
   ```

3. **AWS Credentials** with permissions for:
   - EC2, VPC, RDS, S3, IAM, Secrets Manager

## Quick Start

### 1. Configure Variables

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
aws_region       = "ap-south-1"
allowed_ssh_cidr = "YOUR_IP/32"  # Get your IP: curl ifconfig.me
```

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Preview Changes

```bash
terraform plan
```

### 4. Create Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This takes ~10-15 minutes.

### 5. Note the Outputs

After completion, you'll see:
- EC2 Public IP
- RDS Endpoint
- S3 Bucket Names
- SSH Command

## Post-Deployment Steps

### 1. SSH into EC2

```bash
# Key is automatically created in this directory
ssh -i edunexus-key.pem ec2-user@<EC2_PUBLIC_IP>
```

### 2. Clone Repository

```bash
cd ~/edunexus
git clone https://github.com/gsriramve/edunexus.git .
```

### 3. Update Environment Variables

```bash
nano ~/edunexus/.env
```

Add your API keys:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `SENDGRID_API_KEY`
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

### 4. Export & Restore Database

On your **local machine**:
```bash
# Export database
pg_dump -h localhost -U edunexus -d edunexus -F c -f edunexus_backup.dump

# Upload to EC2
scp -i infrastructure/terraform/edunexus-key.pem edunexus_backup.dump ec2-user@<EC2_IP>:~/
```

On **EC2**:
```bash
./restore-db.sh ~/edunexus_backup.dump
```

### 5. Deploy Application

```bash
./deploy.sh
```

### 6. Access Application

Open in browser: `http://<EC2_PUBLIC_IP>`

### 7. Set Up SSL (Optional)

After pointing your domain to the EC2 IP:
```bash
./setup-ssl.sh demo.edunexus.io
```

## Useful Commands

### Check Service Status
```bash
docker-compose ps
docker-compose logs -f
```

### Restart Services
```bash
docker-compose restart
```

### Update Application
```bash
./deploy.sh
```

### View Terraform State
```bash
terraform show
```

## Cleanup

To destroy all resources:
```bash
terraform destroy
```

**Warning:** This will delete:
- EC2 instance
- RDS database (data will be lost!)
- S3 buckets
- All networking resources

## File Structure

```
infrastructure/terraform/
├── provider.tf          # AWS provider config
├── versions.tf          # Terraform version constraints
├── variables.tf         # Input variables
├── vpc.tf               # VPC, subnets, routing
├── security-groups.tf   # Security groups
├── rds.tf               # PostgreSQL database
├── ec2.tf               # EC2 instance
├── s3.tf                # S3 buckets
├── outputs.tf           # Output values
├── terraform.tfvars     # Your configuration (git-ignored)
├── scripts/
│   └── user-data.sh     # EC2 bootstrap script
└── README.md            # This file
```

## Troubleshooting

### Can't SSH into EC2
- Check security group allows your IP
- Verify key file permissions: `chmod 400 edunexus-key.pem`

### RDS Connection Failed
- Ensure EC2 security group is allowed in RDS security group
- Check RDS is publicly accessible (for initial setup)

### Docker Build Fails
- Check EC2 has enough disk space: `df -h`
- Clear Docker cache: `docker system prune -a`

### Application Not Loading
- Check all containers are running: `docker-compose ps`
- View logs: `docker-compose logs -f`
- Verify Nginx is running: `sudo systemctl status nginx`

## Security Notes

1. **SSH Access**: Restrict `allowed_ssh_cidr` to your IP only
2. **RDS**: After initial setup, set `publicly_accessible = false`
3. **Secrets**: API keys are stored in `.env` with restricted permissions
4. **SSL**: Always use HTTPS in production with Let's Encrypt

## Support

For issues, check:
1. EC2 logs: `/var/log/user-data.log`
2. Docker logs: `docker-compose logs`
3. Nginx logs: `/var/log/nginx/error.log`
