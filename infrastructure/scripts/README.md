# EduNexus EC2 Management Scripts

Quick scripts to manage the EC2 instance for cost optimization.

## Prerequisites

- AWS CLI configured (`aws configure`)
- Terraform state available (for auto-detecting instance ID)

## Scripts

### `./ec2-status.sh`
Check current instance status, IP, and scheduler state.

```bash
./ec2-status.sh
```

### `./ec2-start.sh`
Start the EC2 instance manually (for demos outside business hours).

```bash
./ec2-start.sh
```
- Takes ~60-90 seconds for EC2 to start
- Docker containers auto-start within 2-3 minutes
- App available at http://edu-nexus.co.in

### `./ec2-stop.sh`
Stop the EC2 instance manually (saves ~$0.04/hour).

```bash
./ec2-stop.sh
```

### `./ec2-skip-schedule.sh`
Override the automatic stop/start schedule.

```bash
# Skip tonight's auto-stop (for late night demo)
./ec2-skip-schedule.sh skip

# Resume normal schedule
./ec2-skip-schedule.sh resume

# Toggle current state
./ec2-skip-schedule.sh
```

## Automatic Schedule

By default, the EC2 instance follows this schedule (IST):

| Day | Start | Stop |
|-----|-------|------|
| Monday-Friday | 8:00 AM | 10:00 PM |
| Saturday-Sunday | OFF | OFF |

**Savings**: ~60% reduction in EC2 costs (~$18/month instead of $45)

## Cost Impact

| State | Cost |
|-------|------|
| Running | ~$0.042/hour ($30/month) |
| Stopped | ~$0.004/hour ($3/month for EBS only) |

## Troubleshooting

### App not accessible after start
Wait 2-3 minutes for Docker containers to fully initialize.

### Check container status
```bash
ssh -i ../terraform/edunexus-key.pem ec2-user@edu-nexus.co.in "docker ps"
```

### View container logs
```bash
ssh -i ../terraform/edunexus-key.pem ec2-user@edu-nexus.co.in "docker logs edunexus-web"
```
