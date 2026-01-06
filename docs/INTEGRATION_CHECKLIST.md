# EduNexus Integration Checklist

## API Keys & Credentials Required for End-to-End Testing

**Last Updated:** January 2026

---

## Quick Status Overview

| Integration | Category | Status | Priority |
|-------------|----------|--------|----------|
| PostgreSQL | Database | ✅ Ready (Docker) | Critical |
| Redis | Cache/Queue | ✅ Ready (Docker) | Critical |
| Clerk | Authentication | ⚠️ Needs Keys | Critical |
| Razorpay | Payments | ⚠️ Needs Keys | Critical |
| SendGrid | Email | ⚠️ Needs Keys | High |
| MSG91 | SMS | ⚠️ Needs Keys | High |
| Firebase FCM | Push Notifications | ⚠️ Needs Keys | Medium |
| AWS S3 | Document Storage | ⚠️ Needs Keys | High |
| OpenAI | AI/LLM | ⚠️ Needs Keys | Medium |
| Anthropic Claude | AI/LLM | ⚠️ Needs Keys | Medium |
| Google Maps | Transport Tracking | ⚠️ Needs Keys | Low |
| WhatsApp Business | Messaging | ⚠️ Needs Keys | Low |

---

## 1. Infrastructure (Local Development Ready)

### PostgreSQL Database
```bash
# Status: ✅ READY (Docker Compose)
DATABASE_URL="postgresql://edunexus:edunexus_dev_password@localhost:5432/edunexus?schema=public"
```
**Setup:** `docker-compose up -d postgres`

### Redis
```bash
# Status: ✅ READY (Docker Compose)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL="redis://localhost:6379"
```
**Setup:** `docker-compose up -d redis`

---

## 2. Authentication (CRITICAL)

### Clerk Authentication
```bash
# Status: ⚠️ NEEDS CONFIGURATION
# Get from: https://dashboard.clerk.com

# Frontend (.env.local in apps/web)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

**Setup Steps:**
1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Get Publishable Key and Secret Key
4. Configure allowed origins (localhost:3000)
5. Set up user roles in Clerk Dashboard

**Roles to Configure:**
- `platform_owner`
- `principal`
- `hod`
- `admin_staff`
- `teacher`
- `lab_assistant`
- `student`
- `parent`

---

## 3. Payments (CRITICAL)

### Razorpay
```bash
# Status: ⚠️ NEEDS CONFIGURATION
# Get from: https://dashboard.razorpay.com/app/keys

# Backend (.env in apps/api)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Frontend (.env.local in apps/web)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Setup Steps:**
1. Create account at [razorpay.com](https://razorpay.com)
2. Go to Settings > API Keys
3. Generate Test API Keys
4. Configure Webhook URL: `https://your-domain/api/payments/webhook`
5. Set Webhook Secret

**Test Cards:**
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`

---

## 4. Email Notifications (HIGH)

### SendGrid
```bash
# Status: ⚠️ NEEDS CONFIGURATION
# Get from: https://app.sendgrid.com/settings/api_keys

SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@edunexus.io
SENDGRID_FROM_NAME=EduNexus
```

**Setup Steps:**
1. Create account at [sendgrid.com](https://sendgrid.com)
2. Verify sender email/domain
3. Create API Key with Mail Send permission
4. (Optional) Set up email templates

**Email Templates Used:**
- Welcome email
- Fee payment confirmation
- Fee reminder
- Attendance alert
- Exam notification
- Password reset

---

## 5. SMS Notifications (HIGH)

### MSG91
```bash
# Status: ⚠️ NEEDS CONFIGURATION
# Get from: https://msg91.com/

MSG91_AUTH_KEY=xxxxxxxxxxxxxxxxxxxxx
MSG91_SENDER_ID=EDUNXS    # 6 chars, needs TRAI approval
MSG91_ROUTE=4              # Transactional
MSG91_DLT_TE_ID=xxxxxxxxxxxxxxxxxxxxx
```

**Setup Steps:**
1. Create account at [msg91.com](https://msg91.com)
2. Complete KYC verification
3. Register Sender ID (DLT registration required in India)
4. Create SMS templates (DLT approval needed)
5. Get Auth Key from Settings

**DLT Template IDs Needed:**
```bash
MSG91_DLT_PAYMENT_TEMPLATE_ID=xxxxx
MSG91_DLT_FEE_REMINDER_TEMPLATE_ID=xxxxx
MSG91_DLT_FEE_OVERDUE_TEMPLATE_ID=xxxxx
MSG91_DLT_ATTENDANCE_TEMPLATE_ID=xxxxx
MSG91_DLT_OTP_TEMPLATE_ID=xxxxx
MSG91_DLT_WELCOME_TEMPLATE_ID=xxxxx
```

**Note:** DLT registration is mandatory in India. Takes 2-3 business days.

---

## 6. Push Notifications (MEDIUM)

### Firebase Cloud Messaging (FCM)
```bash
# Status: ⚠️ NEEDS CONFIGURATION
# Get from: Firebase Console > Project Settings > Service Accounts

# Backend (.env in apps/api)
FIREBASE_PROJECT_ID=edunexus-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@edunexus-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxxxx\n-----END PRIVATE KEY-----\n"

# Frontend (.env.local in apps/web)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=edunexus-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=edunexus-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=edunexus-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxxxx:web:xxxxx
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKxxxxx
```

**Setup Steps:**
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Cloud Messaging
3. Create Web App, get config
4. Generate Service Account Key (JSON)
5. Generate Web Push Certificate (VAPID Key)

---

## 7. Document Storage (HIGH)

### AWS S3
```bash
# Status: ⚠️ NEEDS CONFIGURATION
# Get from: AWS IAM Console

AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxx
AWS_REGION=ap-south-1
AWS_S3_BUCKET=edunexus-documents
```

**Setup Steps:**
1. Create AWS account
2. Create S3 bucket in ap-south-1 (Mumbai)
3. Configure bucket policy for private access
4. Create IAM user with S3 permissions
5. Generate Access Keys

**Bucket Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::edunexus-documents/*"
    }
  ]
}
```

**CORS Configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://edunexus.io"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 8. AI/ML Services (MEDIUM)

### OpenAI
```bash
# Status: ⚠️ NEEDS CONFIGURATION
# Get from: https://platform.openai.com/api-keys

OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

**Setup Steps:**
1. Create account at [OpenAI](https://platform.openai.com)
2. Add billing/credits
3. Generate API Key
4. Set usage limits (recommended)

**Models Used:**
- `gpt-4-turbo-preview` - Content generation, chatbot
- `text-embedding-ada-002` - Document embeddings

### Anthropic Claude
```bash
# Status: ⚠️ NEEDS CONFIGURATION
# Get from: https://console.anthropic.com/

ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

**Setup Steps:**
1. Create account at [Anthropic Console](https://console.anthropic.com)
2. Add billing
3. Generate API Key

**Models Used:**
- `claude-3-sonnet-20240229` - Content generation, analysis

---

## 9. Optional Integrations (LOW)

### Google Maps (Transport Tracking)
```bash
# Status: ⚠️ OPTIONAL
# Get from: https://console.cloud.google.com/apis/credentials

GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxx
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxx
```

**APIs to Enable:**
- Maps JavaScript API
- Geocoding API
- Directions API

### WhatsApp Business API
```bash
# Status: ⚠️ OPTIONAL
# Get from: Meta Business Suite / 360dialog

WHATSAPP_API_URL=https://waba.360dialog.io/v1
WHATSAPP_API_KEY=xxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxxxxxxxxxx
```

**Setup:** Requires Meta Business verification, takes 2-4 weeks.

---

## Environment Files Summary

### Root `.env`
```bash
# Copy .env.example to .env
cp .env.example .env
```

### Backend `apps/api/.env`
```bash
# Database
DATABASE_URL="postgresql://edunexus:edunexus_dev_password@localhost:5432/edunexus?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# App
NODE_ENV=development
PORT=3001

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# SendGrid
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@edunexus.io
SENDGRID_FROM_NAME=EduNexus

# MSG91
MSG91_AUTH_KEY=xxx
MSG91_SENDER_ID=EDUNXS
MSG91_ROUTE=4

# Firebase
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY="xxx"

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-south-1
AWS_S3_BUCKET=edunexus-documents
```

### Frontend `apps/web/.env.local`
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_FIREBASE_VAPID_KEY=xxx
```

### ML Service `apps/ml-service/.env`
```bash
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

---

## Testing Checklist

### Phase 1: Core Functionality (Critical Keys Only)
- [ ] PostgreSQL + Redis running (Docker)
- [ ] Clerk authentication configured
- [ ] Can sign up / sign in
- [ ] Role-based access working

### Phase 2: Payments
- [ ] Razorpay test keys configured
- [ ] Can initiate payment
- [ ] Payment webhook working
- [ ] Receipt generation working

### Phase 3: Notifications
- [ ] SendGrid configured
- [ ] Can send test email
- [ ] MSG91 configured (if DLT approved)
- [ ] Can send test SMS

### Phase 4: Document Management
- [ ] AWS S3 bucket created
- [ ] Can upload documents
- [ ] Can download documents
- [ ] Presigned URLs working

### Phase 5: AI Features
- [ ] OpenAI API key configured
- [ ] Content generation working
- [ ] Chatbot responding
- [ ] Predictions running

---

## Cost Estimates (Monthly)

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| Clerk | 10K MAU free | $0-25 |
| Razorpay | No monthly fee | 2% per transaction |
| SendGrid | 100 emails/day | $0-20 |
| MSG91 | Pay per SMS | ~₹0.20/SMS |
| Firebase | Generous free tier | $0-10 |
| AWS S3 | 5GB free | $5-20 |
| OpenAI | Pay per use | $20-100 |
| Anthropic | Pay per use | $20-100 |

**Estimated Monthly Cost for Development:** $50-100
**Estimated Monthly Cost for Production (5K students):** $200-500

---

## Quick Start Command

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Fill in API keys (see above)

# 4. Run migrations
npm run db:migrate

# 5. Seed data
npm run db:seed

# 6. Start development
npm run dev
```

---

*For API key requests, contact the DevOps team or project owner.*
