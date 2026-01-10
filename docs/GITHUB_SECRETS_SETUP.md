# GitHub Secrets Setup Guide

This guide walks you through setting up the required GitHub secrets for the CI/CD pipeline.

## Required Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### AWS Credentials

| Secret Name | How to Get |
|-------------|------------|
| `AWS_ACCESS_KEY_ID` | IAM Console → Users → Your User → Security credentials → Create access key |
| `AWS_SECRET_ACCESS_KEY` | Same as above (shown only once when created) |
| `AWS_ACCOUNT_ID` | Click your username in AWS Console top-right (12-digit number) |

### EC2 Server

| Secret Name | Value |
|-------------|-------|
| `EC2_HOST` | `15.206.243.177` |
| `EC2_SSH_KEY` | Contents of `infrastructure/terraform/edunexus-key.pem` |

To get the SSH key contents:
```bash
cat infrastructure/terraform/edunexus-key.pem
```
Copy the entire output including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`.

### Application Secrets

| Secret Name | Value |
|-------------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |
| `NEXT_PUBLIC_APP_URL` | `http://15.206.243.177` |
| `NEXT_PUBLIC_API_URL` | `http://15.206.243.177` |

## Creating IAM User for CI/CD

For security, create a dedicated IAM user for CI/CD:

1. Go to **IAM Console** → **Users** → **Create user**
2. Name: `edunexus-cicd`
3. Attach policies:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonEC2ReadOnlyAccess`

4. Create access key for "Application running outside AWS"
5. Save the Access Key ID and Secret Access Key

## Environment Setup

For the deploy workflow, create an environment called `production`:

1. Go to **Settings** → **Environments** → **New environment**
2. Name: `production`
3. Add protection rules (optional):
   - Required reviewers
   - Wait timer

## Verification

After setting up all secrets, trigger a manual workflow run:

1. Go to **Actions** → **CI/CD Pipeline**
2. Click **Run workflow**
3. Select `main` branch
4. Click **Run workflow**

Check the workflow logs for any errors related to missing secrets.

## Troubleshooting

### "Error: Unable to locate credentials"
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set correctly
- Ensure the IAM user has the required permissions

### "Permission denied (publickey)"
- Verify `EC2_SSH_KEY` contains the complete private key
- Ensure the key matches what's on the EC2 server

### "Cannot find module..."
- Verify `NEXT_PUBLIC_*` secrets are set
- These are required at build time for the Next.js app
