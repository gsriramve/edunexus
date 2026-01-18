#!/bin/bash
# EC2 Consolidation Script for EduNexus
# This script creates an AMI backup and terminates unused EC2 instances
#
# Production instance: i-08ba5ac1298133995 (t3.medium) - 15.206.243.177 (Elastic IP)
# Instances to terminate:
#   - i-0d37fd475163c4bf9 (t3.small) - 13.233.84.201 (dynamic IP, unhealthy)
#   - i-0192d66d749601e55 (t3.small) - 13.233.108.45 (dynamic IP, empty)
#
# SAFETY: This script requires manual confirmation at each step

set -e

REGION="ap-south-1"
PRODUCTION_INSTANCE="i-08ba5ac1298133995"
UNUSED_INSTANCES=("i-0d37fd475163c4bf9" "i-0192d66d749601e55")
PRODUCTION_URL="https://edu-nexus.co.in"
UNUSED_EIP="13.205.153.200"  # Elastic IP to release

echo "=========================================="
echo "EduNexus EC2 Consolidation Script"
echo "=========================================="
echo ""

# Step 1: Verify DNS
echo "Step 1: Verifying DNS resolution..."
DNS_IP=$(dig +short edu-nexus.co.in | head -1)
echo "  edu-nexus.co.in resolves to: $DNS_IP"
if [ "$DNS_IP" != "15.206.243.177" ]; then
    echo "  WARNING: DNS does not point to production Elastic IP (15.206.243.177)"
    echo "  Please verify before proceeding."
    exit 1
fi
echo "  ✓ DNS verified - pointing to production server"
echo ""

# Step 2: Verify production is healthy
echo "Step 2: Verifying production site..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ Production site is healthy (HTTP $HTTP_CODE)"
else
    echo "  WARNING: Production site returned HTTP $HTTP_CODE"
    echo "  Please verify before proceeding."
    exit 1
fi
echo ""

# Step 3: Create AMI backup
echo "Step 3: Creating AMI backup of production instance..."
read -p "Press Enter to create AMI backup (or Ctrl+C to cancel)..."

BACKUP_DATE=$(date +%Y%m%d-%H%M)
AMI_NAME="edunexus-production-backup-${BACKUP_DATE}"

echo "  Creating AMI: $AMI_NAME"
AMI_ID=$(aws ec2 create-image \
    --region "$REGION" \
    --instance-id "$PRODUCTION_INSTANCE" \
    --name "$AMI_NAME" \
    --description "EduNexus production backup before EC2 consolidation" \
    --no-reboot \
    --query 'ImageId' \
    --output text)

echo "  ✓ AMI creation initiated: $AMI_ID"
echo ""

# Step 4: Wait for AMI to be available
echo "Step 4: Waiting for AMI to be available..."
echo "  This may take several minutes..."

while true; do
    AMI_STATE=$(aws ec2 describe-images \
        --region "$REGION" \
        --image-ids "$AMI_ID" \
        --query 'Images[0].State' \
        --output text)

    if [ "$AMI_STATE" = "available" ]; then
        echo "  ✓ AMI is now available"
        break
    elif [ "$AMI_STATE" = "failed" ]; then
        echo "  ERROR: AMI creation failed"
        exit 1
    else
        echo "  AMI state: $AMI_STATE (waiting...)"
        sleep 30
    fi
done
echo ""

# Step 5: Terminate unused instances
echo "Step 5: Terminating unused instances..."
echo "  Instances to terminate:"
for INSTANCE in "${UNUSED_INSTANCES[@]}"; do
    echo "    - $INSTANCE"
done
echo ""
read -p "Type 'TERMINATE' to confirm termination: " CONFIRM

if [ "$CONFIRM" != "TERMINATE" ]; then
    echo "  Termination cancelled."
    exit 0
fi

aws ec2 terminate-instances \
    --region "$REGION" \
    --instance-ids "${UNUSED_INSTANCES[@]}"

echo "  ✓ Termination initiated for unused instances"
echo ""

# Step 6: Verify production still works
echo "Step 6: Verifying production after termination..."
sleep 10
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ Production site is still healthy (HTTP $HTTP_CODE)"
else
    echo "  WARNING: Production site returned HTTP $HTTP_CODE"
    echo "  Please check immediately!"
fi
echo ""

# Step 7: Release unused Elastic IP (optional)
echo "Step 7: Release unused Elastic IP ($UNUSED_EIP)?"
echo "  This will save ~\$3.60/month"
read -p "Type 'RELEASE' to release the Elastic IP (or anything else to skip): " CONFIRM_EIP

if [ "$CONFIRM_EIP" = "RELEASE" ]; then
    # Find allocation ID for the EIP
    ALLOC_ID=$(aws ec2 describe-addresses \
        --region "$REGION" \
        --filters "Name=public-ip,Values=$UNUSED_EIP" \
        --query 'Addresses[0].AllocationId' \
        --output text 2>/dev/null || echo "")

    if [ -n "$ALLOC_ID" ] && [ "$ALLOC_ID" != "None" ]; then
        aws ec2 release-address --region "$REGION" --allocation-id "$ALLOC_ID"
        echo "  ✓ Elastic IP released"
    else
        echo "  Elastic IP not found or already released"
    fi
else
    echo "  Skipping Elastic IP release"
fi
echo ""

# Summary
echo "=========================================="
echo "EC2 Consolidation Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - AMI backup created: $AMI_ID"
echo "  - Terminated instances: ${UNUSED_INSTANCES[*]}"
echo "  - Production URL: $PRODUCTION_URL"
echo ""
echo "Estimated monthly savings: ~\$18-23"
echo ""
echo "Next steps:"
echo "  1. Verify https://edu-nexus.co.in works"
echo "  2. Test all 9 persona logins"
echo "  3. Check AWS console for only 1 running EC2 instance"
echo ""
