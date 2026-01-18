# EduNexus Operations Runbook

## Table of Contents
1. [Mobile EC2 Control Setup](#mobile-ec2-control-setup)
2. [Fix Resend Email (Contact Form)](#fix-resend-email-contact-form)
3. [EC2 Consolidation](#ec2-consolidation)
4. [Daily Cost Report Setup](#daily-cost-report-setup)

---

## Mobile EC2 Control Setup

Control your EC2 instance from your phone using the AWS Console mobile app.

### Installation

1. **Download AWS Console App**
   - iOS: [App Store](https://apps.apple.com/app/aws-console/id580990573)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=com.amazon.aws.console.mobile)

2. **Sign In**
   - Open the app and tap "Add an account"
   - Choose "IAM user credentials" (recommended) or "Root user"
   - Enter your AWS Account ID: `243333339289`
   - Enter your IAM username and password

### Quick Access Setup

1. **Navigate to EC2**
   - Tap the hamburger menu (☰)
   - Go to: Compute > EC2 > Instances

2. **Find Production Instance**
   - Look for: `edunexus-demo-server`
   - Instance ID: `i-08ba5ac1298133995`
   - IP: `15.206.243.177`

3. **Bookmark for Quick Access**
   - Tap the star icon to add to favorites
   - Instance will appear on home screen

### Common Operations

#### Stop Instance (Save Costs)
1. Open EC2 > Instances
2. Select `edunexus-demo-server`
3. Tap "Instance state" > "Stop instance"
4. Confirm stop

**Note**: Stopping saves ~$0.04/hour but site goes offline.

#### Start Instance
1. Open EC2 > Instances
2. Select `edunexus-demo-server`
3. Tap "Instance state" > "Start instance"
4. Wait 2-3 minutes for containers to start
5. Verify: https://edu-nexus.co.in

#### Reboot Instance
1. Open EC2 > Instances
2. Select `edunexus-demo-server`
3. Tap "Instance state" > "Reboot instance"
4. Site will be down for ~2 minutes

---

## Fix Resend Email (Contact Form)

The contact form uses Resend for email delivery. Currently using sandbox mode.

### Current Configuration

```env
RESEND_API_KEY=re_Psn65wdH_EFenEMT6qrNCFNUDx4ykZ9mk
RESEND_FROM_EMAIL=onboarding@resend.dev  # SANDBOX - Limited!
RESEND_FROM_NAME=EduNexus
```

### Problem

- `onboarding@resend.dev` is Resend's sandbox email
- Sandbox can **ONLY** send to the Resend account owner's email
- Lead notifications currently hardcoded to `gsriramv@gmail.com`

### Verification Steps

1. **Test Contact Form**
   ```bash
   # Submit a test lead
   curl -X POST https://edu-nexus.co.in/api/leads \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","phone":"1234567890","message":"Test lead"}'
   ```

2. **Check Database**
   ```sql
   SELECT * FROM leads ORDER BY created_at DESC LIMIT 5;
   ```

3. **Check API Logs**
   ```bash
   ssh ec2-user@15.206.243.177
   docker logs edunexus-api 2>&1 | grep -i lead
   ```

4. **Verify Email Receipt**
   - Check `gsriramv@gmail.com` inbox/spam for lead notification

### Permanent Fix: Domain Verification

#### Step 1: Add Domain in Resend

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter: `edu-nexus.co.in`
4. Click "Add"

#### Step 2: Add DNS Records

Add these records to your domain registrar (likely GoDaddy or similar):

| Type | Name | Value |
|------|------|-------|
| TXT | `resend._domainkey` | (Provided by Resend) |
| TXT | `@` | (SPF record from Resend) |

**Note**: DNS propagation takes 10-60 minutes.

#### Step 3: Verify Domain

1. Return to https://resend.com/domains
2. Click "Verify" next to `edu-nexus.co.in`
3. Wait for verification (green checkmark)

#### Step 4: Update Production Environment

SSH into the server and update `.env`:

```bash
ssh ec2-user@15.206.243.177
cd edunexus

# Edit .env file
nano .env

# Change this line:
# RESEND_FROM_EMAIL=onboarding@resend.dev
# To:
RESEND_FROM_EMAIL=noreply@edu-nexus.co.in

# Save and restart API
docker-compose restart api
```

#### Step 5: Test

```bash
# Submit test lead
curl -X POST https://edu-nexus.co.in/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Post-Fix Test","email":"anyone@example.com","phone":"9876543210","message":"Testing after domain verification"}'
```

Emails should now be delivered to any recipient.

---

## EC2 Consolidation

See `scripts/ec2-consolidation.sh` for automated script.

### Manual Steps (Alternative)

```bash
# 1. Create AMI backup
aws ec2 create-image --region ap-south-1 \
  --instance-id i-08ba5ac1298133995 \
  --name "edunexus-production-backup-$(date +%Y%m%d)" \
  --no-reboot

# 2. Wait for AMI (check status)
aws ec2 describe-images --region ap-south-1 \
  --owners self --query 'Images[*].[ImageId,State,Name]'

# 3. Terminate unused instances
aws ec2 terminate-instances --region ap-south-1 \
  --instance-ids i-0d37fd475163c4bf9 i-0192d66d749601e55

# 4. Verify production
curl -I https://edu-nexus.co.in

# 5. (Optional) Release unused Elastic IP
aws ec2 release-address --region ap-south-1 \
  --allocation-id <allocation-id-of-13.205.153.200>
```

---

## Daily Cost Report Setup

After running `terraform apply`, the Lambda function will automatically:
- Run daily at 11:30 PM IST (6 PM UTC)
- Query AWS Cost Explorer
- Send email summary to the configured alert email

### Manual Test

```bash
# Invoke Lambda manually
aws lambda invoke --region ap-south-1 \
  --function-name edunexus-demo-daily-cost-report \
  --payload '{}' \
  response.json

cat response.json
```

### Sample Email Format

```
EduNexus Daily AWS Cost Report
==============================
Date: 2026-01-17

Yesterday's Cost: $1.23
Month-to-Date: $15.67
Budget: $25.00
Remaining: $9.33 (63% left)

Top Services (Yesterday):
  - EC2: $0.85
  - RDS: $0.25
  - S3: $0.10
  - CloudWatch: $0.03

---
Generated at 2026-01-17 18:00:00 UTC
```

---

## Quick Reference

| Operation | Command/Action |
|-----------|----------------|
| Run sanity tests | `npm run test:sanity` |
| Run EC2 consolidation | `bash scripts/ec2-consolidation.sh` |
| Test cost report Lambda | AWS Console > Lambda > Test |
| Stop EC2 (mobile) | AWS Console App > EC2 > Stop |
| Trigger GitHub sanity test | GitHub > Actions > Sanity Test > Run workflow |
