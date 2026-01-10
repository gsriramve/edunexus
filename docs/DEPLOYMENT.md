# EduNexus Deployment Guide

This guide covers deployment options for EduNexus, from quick manual deployments to fully automated CI/CD pipelines.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Manual Deployment](#manual-deployment)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Database Migrations](#database-migrations)
5. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Quick Start

### Using the Deploy Script

```bash
# Deploy everything (recommended)
./scripts/deploy.sh all

# Deploy only web frontend
./scripts/deploy.sh web

# Deploy only API backend
./scripts/deploy.sh api

# Deploy without rebuilding (faster, uses existing images)
./scripts/deploy.sh all --skip-build
```

### Environment Variables

```bash
# Override default settings
SSH_KEY=/path/to/key.pem ./scripts/deploy.sh all
SERVER=your-server-ip ./scripts/deploy.sh all
```

---

## Manual Deployment

### Prerequisites

- SSH access to the EC2 server
- SSH key at `infrastructure/terraform/edunexus-key.pem`
- Docker and docker-compose installed on server

### Step-by-Step Deployment

1. **Sync files to server:**
   ```bash
   rsync -avz --exclude 'node_modules' --exclude '.git' \
     -e "ssh -i infrastructure/terraform/edunexus-key.pem" \
     . ec2-user@15.206.243.177:~/edunexus/
   ```

2. **SSH into server:**
   ```bash
   ssh -i infrastructure/terraform/edunexus-key.pem ec2-user@15.206.243.177
   ```

3. **Clean up Docker space:**
   ```bash
   docker system prune -af && docker builder prune -af
   ```

4. **Build and deploy:**
   ```bash
   cd ~/edunexus
   docker-compose build web api
   docker-compose up -d web api
   ```

5. **Run migrations:**
   ```bash
   docker-compose exec api npx prisma migrate deploy
   ```

---

## CI/CD Pipeline

### GitHub Actions Setup

The CI/CD pipeline is defined in `.github/workflows/ci-cd.yml`. It:

1. Builds Docker images on GitHub's servers
2. Pushes images to AWS ECR
3. Deploys to EC2 by pulling pre-built images

### Required GitHub Secrets

Add these secrets in GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_ACCOUNT_ID` | AWS account ID (12 digits) |
| `EC2_HOST` | EC2 public IP (15.206.243.177) |
| `EC2_SSH_KEY` | Contents of SSH private key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `NEXT_PUBLIC_APP_URL` | App URL (http://15.206.243.177) |
| `NEXT_PUBLIC_API_URL` | API URL (http://15.206.243.177) |

### Setting Up ECR

1. **Create ECR repositories:**
   ```bash
   cd infrastructure/terraform
   terraform apply -target=aws_ecr_repository.web
   terraform apply -target=aws_ecr_repository.api
   ```

2. **Configure EC2 to pull from ECR:**
   ```bash
   # On EC2 server
   aws configure  # Set up AWS credentials
   ```

### Triggering Deployments

- **Automatic:** Push to `main` branch
- **Manual:** Go to Actions > CI/CD Pipeline > Run workflow

---

## Database Migrations

### Development Workflow

```bash
# Create a new migration
cd packages/database
npx prisma migrate dev --name describe_your_change

# Example
npx prisma migrate dev --name add_user_preferences
```

### Production Deployment

Migrations are automatically applied during CI/CD deployment. For manual deployment:

```bash
# On EC2 server
cd ~/edunexus
docker-compose exec api npx prisma migrate deploy
```

### Emergency: Schema Push (Use with caution)

If migrations fail, use `db push` as a last resort:

```bash
docker-compose exec api npx prisma db push
```

**Warning:** This can cause data loss. Only use when:
- Setting up a new database
- Development/staging environments
- After backing up production data

### Migration Best Practices

1. **Always test migrations locally first**
2. **Create migrations for every schema change**
3. **Never edit existing migration files**
4. **Back up database before major migrations**

---

## Monitoring & Troubleshooting

### Check Container Status

```bash
ssh -i infrastructure/terraform/edunexus-key.pem ec2-user@15.206.243.177 \
  "cd ~/edunexus && docker-compose ps"
```

### View Logs

```bash
# All containers
docker-compose logs -f

# Specific container
docker-compose logs -f web
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail 100 api
```

### Common Issues

#### 1. "No space left on device"

```bash
docker system prune -af
docker builder prune -af
```

#### 2. Container unhealthy

Check logs and health endpoint:
```bash
docker-compose logs api --tail 50
curl http://localhost:3001/api/health
```

#### 3. Migration failures

```bash
# Check migration status
docker-compose exec api npx prisma migrate status

# Force reset (DANGER: data loss)
docker-compose exec api npx prisma migrate reset
```

#### 4. API not responding

```bash
# Restart API container
docker-compose restart api

# Check if port is bound
netstat -tlnp | grep 3001
```

### Performance Monitoring

```bash
# Container resource usage
docker stats

# Disk usage
df -h

# Memory usage
free -m
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Internet                          │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                   Nginx (Port 80)                    │
│   ┌─────────────────────────────────────────────┐   │
│   │  /        → localhost:3000 (Web)            │   │
│   │  /api     → localhost:3001 (API)            │   │
│   └─────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│   Web (Next.js) │             │   API (NestJS)  │
│   Port: 3000    │             │   Port: 3001    │
└─────────────────┘             └────────┬────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
          ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
          │  PostgreSQL │      │    Redis    │      │   Qdrant    │
          │  (AWS RDS)  │      │  Port: 6379 │      │  Port: 6333 │
          └─────────────┘      └─────────────┘      └─────────────┘
```

---

## Security Considerations

1. **SSH Keys:** Never commit SSH keys to git
2. **Environment Variables:** Use secrets management
3. **Database:** Only accessible within VPC
4. **API Rate Limiting:** Configured in nginx
5. **CORS:** Configured for specific origins only

---

## Cost Optimization

Current setup runs on:
- **EC2:** t3.small (~$15/month)
- **RDS:** db.t3.micro (~$15/month)
- **Total:** ~$30/month (within Free Tier limits)

To reduce build times:
1. Upgrade to t3.medium for faster builds
2. Use GitHub Actions (free for public repos)
3. Enable ECR for pre-built images

---

## Support

For issues or questions:
1. Check logs first: `docker-compose logs -f`
2. Review this documentation
3. Create an issue in the repository
