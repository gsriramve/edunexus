# Resend Email Configuration Guide

## Status: Pending DNS Verification

The email service is configured and ready. DNS records need to be added to complete domain verification.

---

## Current Configuration

**API Key:** Already configured in `apps/api/.env`
```
RESEND_API_KEY=re_Psn65wdH_EFenEMT6qrNCFNUDx4ykZ9mk
RESEND_FROM_EMAIL=onboarding@resend.dev  # Change after domain verification
RESEND_FROM_NAME=EduNexus
```

**Domain to verify:** `careerfied.ai`

---

## DNS Records to Add

Add these records in **Azure Portal** → DNS zones → careerfied.ai → Recordsets

### 1. DKIM Record (TXT)
| Field | Value |
|-------|-------|
| Name | `resend._domainkey` |
| Type | TXT |
| TTL | 1 Hour |
| Value | *(Copy full value from Resend dashboard)* |

### 2. SPF Record (MX)
| Field | Value |
|-------|-------|
| Name | `send` |
| Type | MX |
| Priority | 10 |
| Mail exchange | *(Copy full value from Resend dashboard)* |

**Get the full values from:** https://resend.com/domains

---

## Azure Access Required

**DNS Zone Location:**
- Subscription: `c6be500c-48e8-4975-b2f3-7af12c9b751d`
- Resource Group: `careerfied-prod`
- Directory: `satishgsoutlook.onmicrosoft.com`

**Permission needed:** DNS Zone Contributor role for `sriram.venkat@quantumlayerplatform.com`

Or ask the subscription owner to add the records directly.

---

## After DNS Verification

1. Go to Resend dashboard and click **Verify** on the domain
2. Wait for green checkmark (can take 5 min to 48 hours)
3. Update `.env` file:
   ```
   RESEND_FROM_EMAIL=noreply@careerfied.ai
   ```
4. Restart the API server

---

## What's Already Done

- [x] Resend package installed
- [x] EmailService updated to use Resend API
- [x] Invitation emails wired up in InvitationsService
- [x] Generic invitation template created (supports all 7 roles)
- [x] API key configured in `.env`
- [ ] Domain DNS records added
- [ ] Domain verified in Resend
- [ ] FROM email updated to verified domain

---

## Email Features Ready

Once domain is verified, these emails will be sent automatically:

1. **User Invitations** - When inviting staff/users via Principal dashboard
2. **Payment Receipts** - After successful fee payment
3. **Fee Reminders** - For upcoming due dates
4. **Fee Overdue Notices** - For past-due payments
5. **Welcome Emails** - For new user registrations
6. **Attendance Alerts** - Low attendance notifications

---

## Testing (Current Limitation)

Until domain is verified, emails can only be sent to: `gsriramv@gmail.com`

Test command:
```bash
curl -X POST http://localhost:3001/api/notifications/test/email \
  -H "Content-Type: application/json" \
  -d '{"email": "gsriramv@gmail.com", "name": "Test User"}'
```
