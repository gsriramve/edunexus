# EduNexus AWS Deployment Guide

> **CURRENT STATUS (2026-03-03): ALL INFRASTRUCTURE TERMINATED**
>
> All AWS resources **permanently deleted** to bring monthly bill to **$0.00**.
> AMI backup: `ami-0adbce39165b5133c` (ap-south-1). RDS snapshot: `edunexus-final-snapshot-2026-03-03`.
> Everything needed to redeploy is in this Git repo. Estimated redeploy time: **~35-50 minutes**.
> See [Deploy From Scratch](#deploy-from-scratch) below.

## Budget Overview

| Item | Value |
|------|-------|
| **AWS Free Tier Credit ($100)** | **EXHAUSTED** (03/01/2026) |
| **Remaining Credits** | ~$42.27 (3 Explore credits, shared with Careerfied account, expire 01/09/2027) |
| **Current Monthly Cost** | **$0.00** (all resources terminated) |
| **EC2 Instance** | **TERMINATED** (was i-08ba5ac1298133995) |
| **RDS Instance** | **DELETED** (final snapshot preserved) |
| **Elastic IP** | **RELEASED** (was 15.206.243.177) |
| **EBS Volume** | **DELETED** (was 50 GB gp3) |
| **S3 Buckets** | **Retained** (edunexus-demo-uploads, edunexus-demo-backups) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS Cloud (ap-south-1)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│    Internet                                                          │
│        │                                                             │
│        ▼                                                             │
│  ┌──────────────┐                                                   │
│  │   Route 53   │  DNS: demo.edunexus.io                           │
│  └──────┬───────┘                                                   │
│         │                                                            │
│         ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              EC2 t3.small ($15/month)                        │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │                    Nginx                              │    │   │
│  │  │            (Reverse Proxy + SSL)                      │    │   │
│  │  │                   :80, :443                           │    │   │
│  │  └─────────────────────┬─────────────────────────────────┘    │   │
│  │                        │                                      │   │
│  │  ┌─────────────────────┴─────────────────────────────────┐   │   │
│  │  │              Docker Compose                            │   │   │
│  │  │                                                        │   │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │   │   │
│  │  │  │    Web      │ │    API      │ │     ML      │     │   │   │
│  │  │  │  (Next.js)  │ │  (NestJS)   │ │  (FastAPI)  │     │   │   │
│  │  │  │   :3000     │ │   :3001     │ │   :8000     │     │   │   │
│  │  │  └─────────────┘ └──────┬──────┘ └─────────────┘     │   │   │
│  │  │                         │                              │   │   │
│  │  └─────────────────────────┼──────────────────────────────┘   │   │
│  │                            │                                  │   │
│  └────────────────────────────┼──────────────────────────────────┘   │
│                               │                                      │
│                               ▼                                      │
│  ┌──────────────────────────────────────┐    ┌──────────────────┐  │
│  │      RDS PostgreSQL (db.t3.micro)    │    │       S3         │  │
│  │           FREE TIER                   │    │    (Uploads)     │  │
│  │         750 hrs/month                 │    │    ~$1/month     │  │
│  └──────────────────────────────────────┘    └──────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Cost Breakdown

### Monthly Costs (with AWS Free Tier)

| Service | Specification | Cost/Month |
|---------|---------------|------------|
| EC2 t3.small | 2 vCPU, 2GB RAM | $15.18 |
| RDS db.t3.micro | 1 vCPU, 1GB RAM | **$0.00*** |
| RDS Storage | 20GB gp2 | **$0.00*** |
| S3 Storage | ~5GB | $0.12 |
| S3 Requests | ~10K/month | $0.05 |
| Route 53 | 1 hosted zone | $0.50 |
| Data Transfer | ~10GB out | $0.90 |
| Elastic IP | (attached) | $0.00 |
| **Total** | | **~$17/month** |

*Free Tier includes 750 hours/month of db.t3.micro + 20GB storage for 12 months

### Credit Runway Calculator

| Usage Level | Monthly Cost | $100 Lasts |
|-------------|--------------|------------|
| Minimal (demo only) | $17 | **~6 months** |
| Moderate | $25 | **~4 months** |
| Heavy | $35 | **~3 months** |

---

## Prerequisites

Before starting deployment:

1. **AWS Account** with Free Tier enabled
2. **Domain Name** (optional, can use EC2 public IP)
3. **Local Development Environment** with:
   - Docker & Docker Compose
   - PostgreSQL client (`psql`, `pg_dump`)
   - Git
4. **Clerk Account** with production keys
5. **SendGrid API Key** (for emails)
6. **Razorpay Keys** (for payments)

---

## Step-by-Step Deployment

### Phase 1: Create AWS Resources (2 hours)

#### 1.1 Create RDS PostgreSQL (FREE TIER)

1. Go to **AWS Console → RDS → Create database**
2. Configure:
   ```
   Engine: PostgreSQL 16
   Template: Free tier
   DB Instance: db.t3.micro
   Storage: 20 GB (gp2)

   Settings:
   - DB identifier: edunexus-demo
   - Master username: edunexus
   - Master password: [secure password]

   Connectivity:
   - Public access: Yes (for initial setup)
   - VPC security group: Create new
   ```
3. Note the **Endpoint** after creation

#### 1.2 Create EC2 Instance ($15/month)

1. Go to **AWS Console → EC2 → Launch instance**
2. Configure:
   ```
   Name: edunexus-demo-server
   AMI: Amazon Linux 2023
   Instance type: t3.small
   Key pair: Create or select existing

   Network settings:
   - Allow SSH (22) from your IP
   - Allow HTTP (80) from anywhere
   - Allow HTTPS (443) from anywhere

   Storage: 20 GB gp3
   ```
3. **Allocate Elastic IP** and associate with instance
4. Note the **Public IP**

#### 1.3 Create S3 Bucket (~$1/month)

1. Go to **AWS Console → S3 → Create bucket**
2. Configure:
   ```
   Bucket name: edunexus-demo-uploads
   Region: ap-south-1
   Block public access: Yes (use signed URLs)
   ```

#### 1.4 Configure Security Groups

**RDS Security Group** - Allow inbound:
```
Type: PostgreSQL (5432)
Source: EC2 security group
```

**EC2 Security Group** - Allow inbound:
```
Type: SSH (22)       Source: Your IP
Type: HTTP (80)      Source: 0.0.0.0/0
Type: HTTPS (443)    Source: 0.0.0.0/0
```

---

### Phase 2: Server Setup (2 hours)

#### 2.1 Connect to EC2

```bash
ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>
```

#### 2.2 Install Docker

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Logout and login again for group changes
exit
ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>

# Verify Docker
docker --version
```

#### 2.3 Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

#### 2.4 Install Nginx

```bash
sudo yum install -y nginx
sudo systemctl enable nginx
```

#### 2.5 Install PostgreSQL Client

```bash
sudo yum install -y postgresql15
```

#### 2.6 Clone Repository

```bash
git clone https://github.com/gsriramve/edunexus.git
cd edunexus
```

---

### Phase 3: Database Migration (1 hour)

#### 3.1 Export Local Database

On your **local machine**:

```bash
# Export database
pg_dump -h localhost -U edunexus -d edunexus -F c -f edunexus_backup.dump

# Verify file size
ls -lh edunexus_backup.dump
```

#### 3.2 Upload to EC2

```bash
scp -i your-key.pem edunexus_backup.dump ec2-user@<EC2-IP>:/home/ec2-user/
```

#### 3.3 Restore to RDS

On **EC2**:

```bash
# Connect to RDS and create database
psql -h <RDS-ENDPOINT> -U edunexus -d postgres -c "CREATE DATABASE edunexus;"

# Restore backup
pg_restore -h <RDS-ENDPOINT> -U edunexus -d edunexus -F c /home/ec2-user/edunexus_backup.dump

# Verify restoration
psql -h <RDS-ENDPOINT> -U edunexus -d edunexus -c "SELECT COUNT(*) FROM tenants;"
```

---

### Phase 4: Deploy Application (2 hours)

#### 4.1 Create Environment File

```bash
cd ~/edunexus
nano .env
```

Add the following:

```env
# Database
DATABASE_URL=postgresql://edunexus:<PASSWORD>@<RDS-ENDPOINT>:5432/edunexus

# Redis (using Docker)
REDIS_URL=redis://redis:6379

# API
PORT=3001
NODE_ENV=production

# Web URLs
NEXT_PUBLIC_APP_URL=https://demo.edunexus.io
NEXT_PUBLIC_API_URL=https://demo.edunexus.io/api

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-south-1
AWS_S3_BUCKET=edunexus-demo-uploads

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@edunexus.io

# Payments (Razorpay)
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx

# AI Services
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

#### 4.2 Build Docker Images

```bash
# Build all services (this takes ~10-15 minutes)
docker-compose --profile app build

# Verify images
docker images | grep edunexus
```

#### 4.3 Start Services

```bash
# Start all services
docker-compose --profile app up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### 4.4 Configure Nginx

```bash
sudo nano /etc/nginx/conf.d/edunexus.conf
```

Add:

```nginx
server {
    listen 80;
    server_name demo.edunexus.io;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Restart Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

### Phase 5: Domain & SSL (1 hour)

#### 5.1 Configure DNS

In your domain registrar (or Route 53):
```
Type: A
Name: demo.edunexus.io
Value: <EC2-ELASTIC-IP>
TTL: 300
```

#### 5.2 Install SSL Certificate (Free with Let's Encrypt)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d demo.edunexus.io

# Auto-renewal is configured automatically
sudo systemctl status certbot-renew.timer
```

---

## Verification Checklist

After deployment, verify:

- [ ] Website loads at https://demo.edunexus.io
- [ ] Sign-in page works
- [ ] Can login as Principal (principal@nexus-ec.edu)
- [ ] Can login as Student (student@nexus-ec.edu)
- [ ] All sidebar navigation works
- [ ] API responses are fast (<2s)
- [ ] File uploads work (to S3)
- [ ] No console errors

---

## Cost Monitoring

### Set Up Billing Alerts

1. Go to **AWS Console → Billing → Budgets**
2. Create budget:
   ```
   Budget type: Cost budget
   Amount: $25 (monthly)
   Alert at: 80% ($20)
   Notification: Your email
   ```

### Free Tier Usage Dashboard

1. Go to **AWS Console → Billing → Free Tier**
2. Monitor RDS usage (stay under 750 hours)

---

## Maintenance Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific
docker-compose restart api
```

### Update Application

```bash
cd ~/edunexus
git pull origin main
docker-compose --profile app build
docker-compose --profile app up -d
```

### Database Backup

```bash
# Create backup
pg_dump -h <RDS-ENDPOINT> -U edunexus -d edunexus -F c -f backup_$(date +%Y%m%d).dump

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).dump s3://edunexus-demo-uploads/backups/
```

---

## Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose logs api

# Check container status
docker ps -a

# Restart specific service
docker-compose restart api
```

### Database connection failed

```bash
# Test connection from EC2
psql -h <RDS-ENDPOINT> -U edunexus -d edunexus

# Check security group allows EC2 → RDS
```

### SSL certificate issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Out of disk space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a
```

---

## Quick Reference

| Item | Value | Status |
|------|-------|--------|
| **EC2 Instance** | ~~i-08ba5ac1298133995~~ | **TERMINATED** |
| **Elastic IP** | ~~15.206.243.177~~ | **RELEASED** |
| **RDS** | ~~edunexus-demo-postgres~~ | **DELETED** (snapshot preserved) |
| **EBS Volume** | ~~50 GB gp3~~ | **DELETED** |
| **S3 Bucket** | `edunexus-demo-uploads` | **Retained** |
| **S3 Backups** | `edunexus-demo-backups-1a18d68f` | **Retained** |
| **Demo URL** | `https://edu-nexus.co.in` | **OFFLINE** |
| **AMI Backup** | `ami-0adbce39165b5133c` (ap-south-1) | Preserved |
| **RDS Snapshot** | `edunexus-final-snapshot-2026-03-03` | Preserved |

## Deploy From Scratch

> **All infrastructure was terminated on 2026-03-03. Use this to rebuild from zero.**
> Estimated time: **~35-50 minutes**. All code and Terraform configs are in this Git repo.

### Option A: Use Terraform (recommended, full IaC)
```bash
cd infrastructure/terraform

# Initialize and apply
terraform init
terraform plan
terraform apply

# This creates: VPC, EC2, RDS, S3, Security Groups, Lambda, EventBridge
# Note the outputs for EC2 IP and RDS endpoint
```

### Option B: Launch from AMI Backup (fastest for EC2)
```bash
# Launch EC2 from saved AMI (has all Docker images + data)
aws ec2 run-instances \
  --image-id ami-0adbce39165b5133c \
  --instance-type t3.medium \
  --key-name edunexus-demo-key \
  --region ap-south-1 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=edunexus-demo-server}]'

# Allocate EIP
aws ec2 allocate-address --region ap-south-1 --domain vpc
aws ec2 associate-address --instance-id <NEW_ID> --allocation-id <ALLOC_ID> --region ap-south-1
```

### Option C: Restore RDS from Snapshot
```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier edunexus-demo-postgres \
  --db-snapshot-identifier edunexus-final-snapshot-2026-03-03 \
  --db-instance-class db.t3.micro \
  --region ap-south-1
```

### After Deployment
1. Update DNS for `edu-nexus.co.in` → new EC2 IP
2. SSH into EC2: `ssh -i key.pem ubuntu@<NEW_IP>`
3. Start containers: `cd edunexus && docker-compose --profile app up -d`
4. Verify: `curl https://edu-nexus.co.in`
5. Update this document with new resource IDs

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Principal | principal@nexus-ec.edu | Nexus@1104 |
| HOD | hod.cse@nexus-ec.edu | Nexus@1104 |
| Admin | admin@nexus-ec.edu | Nexus@1104 |
| Teacher | teacher@nexus-ec.edu | Nexus@1104 |
| Student | student@nexus-ec.edu | Nexus@1104 |
| Parent | parent@nexus-ec.edu | Nexus@1104 |
| Alumni | alumni@nexus-ec.edu | Nexus@1104 |

---

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Review this guide
3. Check AWS Console for service health
4. Monitor billing dashboard
