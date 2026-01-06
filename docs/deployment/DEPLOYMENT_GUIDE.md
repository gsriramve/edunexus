# EduNexus Deployment Guide

## Production Deployment Instructions

This guide covers the deployment process for EduNexus to AWS infrastructure.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Infrastructure Setup](#2-infrastructure-setup)
3. [Database Setup](#3-database-setup)
4. [Application Deployment](#4-application-deployment)
5. [Configuration](#5-configuration)
6. [Post-Deployment](#6-post-deployment)
7. [Monitoring](#7-monitoring)
8. [Rollback Procedures](#8-rollback-procedures)

---

## 1. Prerequisites

### Required Tools
```bash
# Install required CLI tools
brew install awscli kubectl terraform helm

# Verify installations
aws --version
kubectl version --client
terraform version
helm version
```

### AWS Setup
```bash
# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (ap-south-1), Output format (json)

# Verify access
aws sts get-caller-identity
```

### Docker Registry
```bash
# Login to AWS ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-south-1.amazonaws.com
```

---

## 2. Infrastructure Setup

### Terraform Initialization

```bash
cd infrastructure/terraform/environments/prod

# Initialize Terraform
terraform init

# Review the plan
terraform plan -out=tfplan

# Apply infrastructure
terraform apply tfplan
```

### Infrastructure Components

| Component | Service | Purpose |
|-----------|---------|---------|
| VPC | AWS VPC | Network isolation |
| EKS | Kubernetes | Container orchestration |
| RDS | PostgreSQL 15 | Primary database |
| ElastiCache | Redis | Caching & sessions |
| S3 | Object Storage | Documents & media |
| CloudFront | CDN | Static assets |
| ALB | Load Balancer | Traffic distribution |
| Secrets Manager | Secrets | Credential management |

### Output Values
After Terraform completes, note these values:
- EKS cluster endpoint
- RDS endpoint
- Redis endpoint
- S3 bucket name
- CloudFront distribution

---

## 3. Database Setup

### Connect to RDS

```bash
# Get RDS endpoint from Terraform output
export RDS_HOST=$(terraform output -raw rds_endpoint)

# Connect via bastion or VPN
psql -h $RDS_HOST -U edunexus -d edunexus
```

### Run Migrations

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://edunexus:<password>@$RDS_HOST:5432/edunexus"

# Run Prisma migrations
cd packages/database
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Seed Initial Data

```bash
# Create platform admin
npm run db:seed -- --type=platform

# Verify seed
psql -h $RDS_HOST -U edunexus -c "SELECT count(*) FROM \"User\";"
```

---

## 4. Application Deployment

### Build Docker Images

```bash
# Build API image
docker build -t edunexus-api:latest ./apps/api
docker tag edunexus-api:latest <account-id>.dkr.ecr.ap-south-1.amazonaws.com/edunexus-api:latest
docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/edunexus-api:latest

# Build Web image
docker build -t edunexus-web:latest ./apps/web
docker tag edunexus-web:latest <account-id>.dkr.ecr.ap-south-1.amazonaws.com/edunexus-web:latest
docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/edunexus-web:latest

# Build ML Service image
docker build -t edunexus-ml:latest ./apps/ml-service
docker tag edunexus-ml:latest <account-id>.dkr.ecr.ap-south-1.amazonaws.com/edunexus-ml:latest
docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/edunexus-ml:latest
```

### Kubernetes Deployment

```bash
# Configure kubectl
aws eks update-kubeconfig --name edunexus-prod --region ap-south-1

# Verify connection
kubectl get nodes

# Create namespace
kubectl create namespace edunexus

# Apply secrets
kubectl apply -f infrastructure/kubernetes/overlays/prod/secrets.yaml

# Apply config maps
kubectl apply -f infrastructure/kubernetes/overlays/prod/configmaps.yaml

# Deploy applications
kubectl apply -k infrastructure/kubernetes/overlays/prod

# Verify deployments
kubectl get pods -n edunexus
kubectl get services -n edunexus
```

### Verify Deployment

```bash
# Check pod status
kubectl get pods -n edunexus -w

# Check logs
kubectl logs -n edunexus deployment/edunexus-api -f

# Check services
kubectl get svc -n edunexus

# Test health endpoint
curl https://api.edunexus.in/api/health
```

---

## 5. Configuration

### Environment Variables

Create secrets in AWS Secrets Manager:

```json
{
  "DATABASE_URL": "postgresql://edunexus:<password>@<rds-host>:5432/edunexus",
  "REDIS_URL": "redis://<redis-host>:6379",
  "JWT_SECRET": "<generate-secure-key>",
  "CLERK_SECRET_KEY": "<from-clerk-dashboard>",
  "RAZORPAY_KEY_ID": "<from-razorpay>",
  "RAZORPAY_SECRET": "<from-razorpay>",
  "SENDGRID_API_KEY": "<from-sendgrid>",
  "MSG91_AUTH_KEY": "<from-msg91>",
  "AWS_S3_BUCKET": "<bucket-name>",
  "OPENAI_API_KEY": "<from-openai>"
}
```

### Kubernetes Secrets

```bash
# Create secret from file
kubectl create secret generic edunexus-secrets \
  --from-file=.env.production \
  -n edunexus

# Verify
kubectl get secrets -n edunexus
```

### DNS Configuration

1. Get ALB DNS name:
```bash
kubectl get ingress -n edunexus
```

2. Configure Route 53:
- A record: `api.edunexus.in` → ALB
- A record: `app.edunexus.in` → CloudFront
- CNAME: `*.edunexus.in` → ALB (for tenant subdomains)

### SSL Certificates

```bash
# Request certificate via ACM
aws acm request-certificate \
  --domain-name edunexus.in \
  --subject-alternative-names "*.edunexus.in" \
  --validation-method DNS

# Complete DNS validation in Route 53
```

---

## 6. Post-Deployment

### Create First Tenant

```bash
# Via API
curl -X POST https://api.edunexus.in/api/tenants \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Engineering College",
    "subdomain": "abc",
    "config": {
      "primaryColor": "#2563EB",
      "logo": "https://..."
    }
  }'
```

### Configure Tenant

1. Login to platform admin
2. Go to Tenants → Add Tenant
3. Fill college details
4. Configure branding
5. Set up admin user
6. Activate tenant

### Verify Tenant Access

```bash
# Test tenant subdomain
curl https://abc.edunexus.in/api/health
```

---

## 7. Monitoring

### CloudWatch Setup

```bash
# Install CloudWatch agent
kubectl apply -f https://raw.githubusercontent.com/aws-samples/amazon-cloudwatch-container-insights/latest/k8s-deployment-manifest-templates/deployment-mode/daemonset/container-insights-monitoring/quickstart/cwagent-fluentd-quickstart.yaml

# Verify logs in CloudWatch
aws logs describe-log-groups --log-group-name-prefix /aws/eks/edunexus
```

### Prometheus & Grafana

```bash
# Install via Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Access Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
```

### Alerts Configuration

Set up alerts for:
- Pod restarts > 3 in 5 minutes
- CPU usage > 80%
- Memory usage > 85%
- API latency > 500ms (p95)
- Error rate > 1%
- Database connections > 80% pool

---

## 8. Rollback Procedures

### Application Rollback

```bash
# Check rollout history
kubectl rollout history deployment/edunexus-api -n edunexus

# Rollback to previous version
kubectl rollout undo deployment/edunexus-api -n edunexus

# Rollback to specific revision
kubectl rollout undo deployment/edunexus-api -n edunexus --to-revision=2

# Verify rollback
kubectl rollout status deployment/edunexus-api -n edunexus
```

### Database Rollback

```bash
# List migrations
npx prisma migrate status

# Rollback last migration (if safe)
npx prisma migrate resolve --rolled-back "migration_name"

# For critical issues, restore from backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier edunexus-restored \
  --db-snapshot-identifier edunexus-backup-20260107
```

### Emergency Procedures

1. **Service Down**
   - Check pod status
   - Review logs
   - Scale replicas if needed
   - Rollback if deployment issue

2. **Database Issues**
   - Check RDS metrics
   - Review slow queries
   - Scale instance if needed
   - Failover to read replica if primary fails

3. **Security Incident**
   - Isolate affected components
   - Revoke compromised credentials
   - Enable maintenance mode
   - Investigate and remediate
   - Document incident

---

## Deployment Checklist

### Pre-Deployment
- [ ] Backup current database
- [ ] Notify stakeholders
- [ ] Prepare rollback plan
- [ ] Run migrations in staging
- [ ] Verify all tests pass

### During Deployment
- [ ] Deploy to one pod first (canary)
- [ ] Monitor error rates
- [ ] Check application logs
- [ ] Verify health endpoints
- [ ] Run smoke tests

### Post-Deployment
- [ ] Verify all services running
- [ ] Check monitoring dashboards
- [ ] Test critical user flows
- [ ] Update documentation
- [ ] Notify stakeholders of completion

---

## Pilot Deployment Schedule

### College 1 (Week 1-2)
1. Environment setup
2. Data migration
3. User training
4. Go-live with limited users
5. Full rollout

### College 2 (Week 3-4)
1. Replicate setup from College 1
2. Customize branding
3. User training
4. Go-live

### Feedback Collection
- Daily check-ins first week
- Weekly reviews thereafter
- Bug tracking in GitHub Issues
- Feature requests logged

---

*Last Updated: January 2026*
