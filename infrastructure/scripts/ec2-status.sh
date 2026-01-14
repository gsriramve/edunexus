#!/bin/bash
# EduNexus EC2 Status Script
# Usage: ./ec2-status.sh

INSTANCE_ID="i-08ba5ac1298133995"  # Will be updated after terraform apply
REGION="ap-south-1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo "Error: AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

# Get instance ID from terraform state if available
if [ -f "../terraform/terraform.tfstate" ]; then
    INSTANCE_ID=$(cd ../terraform && terraform output -raw ec2_instance_id 2>/dev/null || echo "$INSTANCE_ID")
fi

# Get instance details
INSTANCE_INFO=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --region "$REGION" \
    --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress,InstanceType,LaunchTime]' --output text)

STATE=$(echo "$INSTANCE_INFO" | awk '{print $1}')
PUBLIC_IP=$(echo "$INSTANCE_INFO" | awk '{print $2}')
INSTANCE_TYPE=$(echo "$INSTANCE_INFO" | awk '{print $3}')
LAUNCH_TIME=$(echo "$INSTANCE_INFO" | awk '{print $4}')

echo ""
echo -e "${BLUE}========== EduNexus EC2 Status ==========${NC}"
echo ""

# State with color
if [ "$STATE" == "running" ]; then
    echo -e "State:         ${GREEN}$STATE${NC}"
    echo -e "Public IP:     ${GREEN}$PUBLIC_IP${NC}"
    echo -e "URL:           ${GREEN}http://$PUBLIC_IP${NC}"
elif [ "$STATE" == "stopped" ]; then
    echo -e "State:         ${RED}$STATE${NC}"
    echo -e "Public IP:     ${YELLOW}(assigned when running)${NC}"
else
    echo -e "State:         ${YELLOW}$STATE${NC}"
fi

echo -e "Instance Type: $INSTANCE_TYPE"
echo -e "Launch Time:   $LAUNCH_TIME"

# Check for scheduler override tag
OVERRIDE=$(aws ec2 describe-tags --region "$REGION" \
    --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=SchedulerOverride" \
    --query 'Tags[0].Value' --output text 2>/dev/null)

echo ""
if [ "$OVERRIDE" == "skip" ]; then
    echo -e "Scheduler:     ${YELLOW}DISABLED (override active)${NC}"
else
    echo -e "Scheduler:     ${GREEN}ENABLED${NC}"
    echo -e "               Stop: 10 PM IST (Mon-Fri)"
    echo -e "               Start: 8 AM IST (Mon-Fri)"
fi

echo ""
echo -e "${BLUE}==========================================${NC}"
echo ""
