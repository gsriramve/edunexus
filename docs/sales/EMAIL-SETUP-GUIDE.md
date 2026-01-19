# EduNexus Sales Email Setup Guide

## Overview

This guide documents how to set up `sales@edu-nexus.co.in` for sending marketing and sales emails using **Resend** (https://resend.com).

---

## Step 1: Add Domain to Resend

1. Log in to Resend Dashboard: https://resend.com/dashboard
2. Go to **Domains** → **Add Domain**
3. Enter: `edu-nexus.co.in`
4. Click **Add**

---

## Step 2: Configure DNS Records

Resend will provide DNS records to add at your domain registrar (GoDaddy, Cloudflare, Route53, etc.).

### Required Records

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| **TXT** | `@` or `edu-nexus.co.in` | `v=spf1 include:resend.com ~all` | SPF - Authorizes Resend to send |
| **CNAME** | `resend._domainkey` | `(provided by Resend)` | DKIM - Email authentication |
| **CNAME** | `resend._domainkey` | `(provided by Resend)` | DKIM key |

### Optional (for receiving replies)

| Type | Name | Value | Priority |
|------|------|-------|----------|
| **MX** | `@` | `feedback-smtp.us-east-1.amazonses.com` | 10 |

> **Note**: If only sending (not receiving), MX record is optional.

---

## Step 3: Verify Domain

1. After adding DNS records, return to Resend dashboard
2. Click **Verify** on the domain
3. Wait for DNS propagation (5 minutes to 48 hours)
4. Status will change from "Pending" to "Verified"

### Check DNS Propagation

```bash
# Check SPF
dig TXT edu-nexus.co.in

# Check DKIM
dig CNAME resend._domainkey.edu-nexus.co.in
```

---

## Step 4: Create Sending Identity

Once domain is verified:

1. Go to **Domains** → `edu-nexus.co.in`
2. The verified domain automatically allows sending from any `*@edu-nexus.co.in` address
3. Use `sales@edu-nexus.co.in` as the "from" address

---

## Step 5: Get API Key

1. Go to **API Keys** → **Create API Key**
2. Name: `edunexus-sales-emails`
3. Permissions: **Sending access** only
4. Copy the key securely (shown only once)

### Store API Key

Add to your environment:

```bash
# .env (local development)
RESEND_API_KEY=re_xxxxxxxxxx

# AWS Secrets Manager (production)
aws secretsmanager create-secret --name edunexus/resend-api-key --secret-string "re_xxxxxxxxxx"
```

---

## Step 6: Send Test Email

### Using cURL

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_xxxxxxxxxx' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "EduNexus Sales <sales@edu-nexus.co.in>",
    "to": ["your-test-email@example.com"],
    "subject": "Test Email from EduNexus",
    "html": "<h1>Hello!</h1><p>This is a test email from EduNexus.</p>"
  }'
```

### Using Node.js

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'EduNexus Sales <sales@edu-nexus.co.in>',
  to: ['prospect@college.edu'],
  subject: 'Transform Your College with AI-Powered Management',
  html: `
    <h1>edu-nexus</h1>
    <p>AI-Powered College Management Platform</p>
    <p>Schedule a demo: <a href="https://edu-nexus.co.in">edu-nexus.co.in</a></p>
  `,
  attachments: [
    {
      filename: 'EduNexus-Sales-Brochure.pdf',
      content: fs.readFileSync('./docs/sales/EduNexus-Sales-Brochure.pdf').toString('base64'),
    },
  ],
});
```

---

## Email Templates

### Sales Outreach Template

**Subject**: Transform [College Name] with AI-Powered College Management

**Body**:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #2563EB, #4F46E5); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">edu-nexus</h1>
    <p style="color: #DBEAFE; margin: 5px 0 0 0;">AI-Powered College Management</p>
  </div>

  <div style="padding: 30px;">
    <p>Dear [Principal/Administrator Name],</p>

    <p>Managing 5,000+ students with spreadsheets? There's a better way.</p>

    <p><strong>EduNexus</strong> is the AI-first college management platform built for Indian engineering colleges. Our platform helps institutions like yours:</p>

    <ul>
      <li>✅ <strong>+20% fee collection</strong> with online payments & auto-reminders</li>
      <li>✅ <strong>40+ hours saved/month</strong> per admin staff</li>
      <li>✅ <strong>AI identifies at-risk students</strong> in week 2, not semester end</li>
      <li>✅ <strong>+25% placement rate</strong> with AI career guidance</li>
    </ul>

    <p style="background: #DBEAFE; padding: 15px; border-radius: 8px; text-align: center;">
      <strong>Simple Pricing: Rs. 500/student/year</strong><br>
      All 20+ modules included | No hidden costs
    </p>

    <p>I'd love to show you a 15-minute demo tailored to [College Name]'s needs.</p>

    <p style="text-align: center;">
      <a href="https://edu-nexus.co.in" style="background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Schedule Demo</a>
    </p>

    <p>Best regards,<br>
    EduNexus Sales Team<br>
    sales@edu-nexus.co.in</p>
  </div>

  <div style="background: #F1F5F9; padding: 15px; text-align: center; font-size: 12px; color: #64748B;">
    <p>Powered by Quantumlayer Platform | Made in India for Indian Colleges</p>
    <p><a href="https://edu-nexus.co.in">edu-nexus.co.in</a></p>
  </div>
</div>
```

### Follow-up Template

**Subject**: Following up: EduNexus demo for [College Name]

**Body**:
```
Hi [Name],

I wanted to follow up on my previous email about EduNexus.

Did you know that colleges using EduNexus see:
• 1,677% ROI in the first year
• Payback in less than 1 month
• 30-day free pilot available

Would you be open to a quick 15-minute call this week?

Best,
EduNexus Team
```

---

## Attachments

When sending sales emails, attach:

1. **Sales Brochure**: `/docs/sales/EduNexus-Sales-Brochure.pdf` (1.4 MB)
2. **Demo Video Link**: Include link to video hosted on cloud storage

---

## Best Practices

### Email Deliverability

1. **Warm up the domain** - Start with low volume (10-20/day), gradually increase
2. **Authenticate emails** - Ensure SPF, DKIM are properly configured
3. **Monitor bounce rates** - Keep below 2%
4. **Use double opt-in** - For newsletter subscribers
5. **Include unsubscribe link** - Required by law

### Avoid Spam Filters

- Avoid ALL CAPS in subject lines
- Don't use excessive exclamation marks!!!
- Include plain text version
- Keep image-to-text ratio balanced
- Use consistent "from" address

---

## Monitoring

### Resend Dashboard

Track these metrics in Resend dashboard:
- **Sent**: Total emails sent
- **Delivered**: Successfully delivered
- **Opened**: Recipients who opened (if tracking enabled)
- **Clicked**: Recipients who clicked links
- **Bounced**: Failed deliveries
- **Spam complaints**: Marked as spam

### Set Up Webhooks

```javascript
// Webhook endpoint to track email events
app.post('/api/email-webhooks', (req, res) => {
  const { type, data } = req.body;

  switch (type) {
    case 'email.delivered':
      console.log('Email delivered to:', data.to);
      break;
    case 'email.bounced':
      console.log('Email bounced:', data.to, data.bounce_type);
      break;
    case 'email.complained':
      console.log('Spam complaint from:', data.to);
      // Remove from mailing list
      break;
  }

  res.status(200).send('OK');
});
```

---

## Checklist

- [ ] Domain `edu-nexus.co.in` added to Resend
- [ ] SPF record configured
- [ ] DKIM record configured
- [ ] Domain verified in Resend
- [ ] API key generated and stored securely
- [ ] Test email sent successfully
- [ ] Email templates created
- [ ] Brochure PDF ready for attachment

---

## Contact Details for Marketing Materials

| Channel | Address |
|---------|---------|
| Sales Email | sales@edu-nexus.co.in |
| Website | https://edu-nexus.co.in |
| Branding | "Powered by Quantumlayer Platform" |

---

## Support

If you encounter issues:
- Resend Documentation: https://resend.com/docs
- DNS Propagation Check: https://dnschecker.org
- Email Testing: https://mail-tester.com

---

*Last Updated: January 2026*
