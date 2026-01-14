#!/bin/bash
# EduNexus EC2 Stop Script
# Usage: ./ec2-stop.sh

set -e

INSTANCE_ID="i-08ba5ac1298133995"  # Will be updated after terraform apply
REGION="ap-south-1"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping EduNexus EC2 instance...${NC}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo "Error: AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

# Get instance ID from terraform state if available
if [ -f "../terraform/terraform.tfstate" ]; then
    INSTANCE_ID=$(cd ../terraform && terraform output -raw ec2_instance_id 2>/dev/null || echo "$INSTANCE_ID")
fi

# Confirm
read -p "Are you sure you want to stop the instance? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Stop the instance
aws ec2 stop-instances --instance-ids "$INSTANCE_ID" --region "$REGION"

echo -e "${YELLOW}Waiting for instance to stop...${NC}"
aws ec2 wait instance-stopped --instance-ids "$INSTANCE_ID" --region "$REGION"

echo -e "${RED}Instance stopped.${NC}"
echo ""
echo "To start again: ./ec2-start.sh"
echo "Estimated savings: ~\$0.04/hour while stopped"
