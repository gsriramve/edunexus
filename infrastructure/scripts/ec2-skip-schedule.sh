#!/bin/bash
# EduNexus EC2 Schedule Override Script
# Skip or resume automatic stop/start schedule
# Usage: ./ec2-skip-schedule.sh [skip|resume]

set -e

INSTANCE_ID="i-08ba5ac1298133995"  # Will be updated after terraform apply
REGION="ap-south-1"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

ACTION=${1:-"toggle"}

# Get current override status
CURRENT=$(aws ec2 describe-tags --region "$REGION" \
    --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=SchedulerOverride" \
    --query 'Tags[0].Value' --output text 2>/dev/null)

if [ "$ACTION" == "skip" ] || ([ "$ACTION" == "toggle" ] && [ "$CURRENT" != "skip" ]); then
    # Set override to skip scheduled actions
    aws ec2 create-tags --resources "$INSTANCE_ID" --region "$REGION" \
        --tags Key=SchedulerOverride,Value=skip
    echo -e "${YELLOW}Scheduler DISABLED${NC}"
    echo "The instance will NOT be automatically stopped tonight."
    echo "Run './ec2-skip-schedule.sh resume' to re-enable."

elif [ "$ACTION" == "resume" ] || ([ "$ACTION" == "toggle" ] && [ "$CURRENT" == "skip" ]); then
    # Remove override tag
    aws ec2 delete-tags --resources "$INSTANCE_ID" --region "$REGION" \
        --tags Key=SchedulerOverride
    echo -e "${GREEN}Scheduler ENABLED${NC}"
    echo "Normal schedule resumed:"
    echo "  - Auto-stop: 10 PM IST (Mon-Fri)"
    echo "  - Auto-start: 8 AM IST (Mon-Fri)"
else
    echo "Usage: $0 [skip|resume|toggle]"
    echo ""
    echo "  skip   - Disable automatic stop/start"
    echo "  resume - Re-enable automatic stop/start"
    echo "  toggle - Toggle current state (default)"
    exit 1
fi
