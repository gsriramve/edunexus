#!/bin/bash
# EduNexus EC2 Start Script
# Usage: ./ec2-start.sh

set -e

INSTANCE_ID="i-08ba5ac1298133995"  # Will be updated after terraform apply
REGION="ap-south-1"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting EduNexus EC2 instance...${NC}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo "Error: AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

# Get instance ID from terraform state if available
if [ -f "../terraform/terraform.tfstate" ]; then
    INSTANCE_ID=$(cd ../terraform && terraform output -raw ec2_instance_id 2>/dev/null || echo "$INSTANCE_ID")
fi

# Start the instance
aws ec2 start-instances --instance-ids "$INSTANCE_ID" --region "$REGION"

echo -e "${YELLOW}Waiting for instance to start...${NC}"
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$REGION"

# Get the public IP
PUBLIC_IP=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --region "$REGION" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

echo -e "${GREEN}Instance started successfully!${NC}"
echo -e "Public IP: ${GREEN}$PUBLIC_IP${NC}"
echo ""
echo "Application will be ready in ~2-3 minutes at:"
echo -e "  ${GREEN}http://$PUBLIC_IP${NC}"
echo ""
echo "To check status: ./ec2-status.sh"
