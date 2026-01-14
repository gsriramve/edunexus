# Auto-Remediation Lambda for Docker Resource Cleanup
# Triggered by CloudWatch Alarms to run emergency cleanup via SSM

# =============================================================================
# Lambda IAM Role
# =============================================================================

resource "aws_iam_role" "auto_remediation" {
  name = "${local.name_prefix}-auto-remediation-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${local.name_prefix}-auto-remediation-role"
  }
}

# Lambda basic execution policy
resource "aws_iam_role_policy_attachment" "auto_remediation_basic" {
  role       = aws_iam_role.auto_remediation.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# SSM and SNS permissions
resource "aws_iam_role_policy" "auto_remediation_ssm" {
  name = "${local.name_prefix}-auto-remediation-ssm"
  role = aws_iam_role.auto_remediation.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:SendCommand"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:*:document/AWS-RunShellScript",
          aws_instance.main.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetCommandInvocation"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.alerts.arn
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }
    ]
  })
}

# =============================================================================
# Lambda Function
# =============================================================================

resource "aws_lambda_function" "auto_remediation" {
  filename         = data.archive_file.auto_remediation.output_path
  source_code_hash = data.archive_file.auto_remediation.output_base64sha256
  function_name    = "${local.name_prefix}-auto-remediation"
  role             = aws_iam_role.auto_remediation.arn
  handler          = "index.handler"
  runtime          = "python3.11"
  timeout          = 300 # 5 minutes for SSM command to complete

  environment {
    variables = {
      INSTANCE_ID = aws_instance.main.id
      SNS_TOPIC   = aws_sns_topic.alerts.arn
      REGION      = var.aws_region
    }
  }

  tags = {
    Name = "${local.name_prefix}-auto-remediation"
  }
}

# Lambda source code
data "archive_file" "auto_remediation" {
  type        = "zip"
  output_path = "${path.module}/lambda/auto-remediation.zip"

  source {
    content  = <<-EOF
import boto3
import json
import os
import time

ssm = boto3.client('ssm')
sns = boto3.client('sns')

def handler(event, context):
    """
    Auto-remediation Lambda triggered by CloudWatch Alarms.
    Runs emergency-cleanup.sh on EC2 via SSM.
    """
    print(f"Event received: {json.dumps(event)}")

    instance_id = os.environ['INSTANCE_ID']
    sns_topic = os.environ['SNS_TOPIC']

    # Extract alarm info from event
    alarm_name = "Unknown"
    alarm_state = "ALARM"

    if 'alarmData' in event:
        # Direct CloudWatch alarm action
        alarm_name = event.get('alarmData', {}).get('alarmName', 'Unknown')
        alarm_state = event.get('alarmData', {}).get('state', {}).get('value', 'ALARM')
    elif 'detail' in event:
        # EventBridge event
        alarm_name = event.get('detail', {}).get('alarmName', 'Unknown')
        alarm_state = event.get('detail', {}).get('state', {}).get('value', 'ALARM')

    # Only remediate on ALARM state
    if alarm_state != 'ALARM':
        print(f"Alarm state is {alarm_state}, skipping remediation")
        return {'statusCode': 200, 'body': 'Skipped - not in ALARM state'}

    print(f"Triggering remediation for alarm: {alarm_name}")

    try:
        # Run emergency cleanup script via SSM
        response = ssm.send_command(
            InstanceIds=[instance_id],
            DocumentName='AWS-RunShellScript',
            Parameters={
                'commands': ['/usr/local/bin/emergency-cleanup.sh'],
                'executionTimeout': ['300']
            },
            Comment=f'Auto-remediation triggered by {alarm_name}'
        )

        command_id = response['Command']['CommandId']
        print(f"SSM command sent: {command_id}")

        # Wait for command to complete (with timeout)
        max_wait = 60  # Wait max 60 seconds for initial status
        wait_time = 0
        status = 'Pending'

        while wait_time < max_wait and status in ['Pending', 'InProgress']:
            time.sleep(5)
            wait_time += 5

            try:
                result = ssm.get_command_invocation(
                    CommandId=command_id,
                    InstanceId=instance_id
                )
                status = result['Status']
                print(f"Command status: {status}")
            except ssm.exceptions.InvocationDoesNotExist:
                print("Command not yet available, waiting...")
                continue

        # Send notification
        message = f"""
Auto-Remediation Triggered

Alarm: {alarm_name}
Instance: {instance_id}
Command ID: {command_id}
Status: {status}

The emergency cleanup script has been executed.
Check the EC2 instance logs for details:
/var/log/edunexus/emergency-cleanup.log
"""

        sns.publish(
            TopicArn=sns_topic,
            Subject=f'[EduNexus] Auto-Remediation Executed - {alarm_name}',
            Message=message
        )

        return {
            'statusCode': 200,
            'body': json.dumps({
                'alarm': alarm_name,
                'command_id': command_id,
                'status': status
            })
        }

    except Exception as e:
        error_msg = f"Error during remediation: {str(e)}"
        print(error_msg)

        # Send error notification
        sns.publish(
            TopicArn=sns_topic,
            Subject=f'[EduNexus] Auto-Remediation FAILED - {alarm_name}',
            Message=f"Remediation failed:\n\nAlarm: {alarm_name}\nError: {str(e)}"
        )

        raise e
EOF
    filename = "index.py"
  }
}

# =============================================================================
# Lambda Permission for CloudWatch Alarms
# =============================================================================

resource "aws_lambda_permission" "cloudwatch_build_cache" {
  statement_id  = "AllowCloudWatchBuildCache"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auto_remediation.function_name
  principal     = "lambda.alarms.cloudwatch.amazonaws.com"
  source_arn    = aws_cloudwatch_metric_alarm.docker_build_cache_high.arn
}

resource "aws_lambda_permission" "cloudwatch_disk" {
  statement_id  = "AllowCloudWatchDisk"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auto_remediation.function_name
  principal     = "lambda.alarms.cloudwatch.amazonaws.com"
  source_arn    = aws_cloudwatch_metric_alarm.docker_disk_high.arn
}

resource "aws_lambda_permission" "cloudwatch_dangling" {
  statement_id  = "AllowCloudWatchDangling"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auto_remediation.function_name
  principal     = "lambda.alarms.cloudwatch.amazonaws.com"
  source_arn    = aws_cloudwatch_metric_alarm.docker_dangling_high.arn
}

# =============================================================================
# CloudWatch Log Group for Lambda
# =============================================================================

resource "aws_cloudwatch_log_group" "auto_remediation" {
  name              = "/aws/lambda/${local.name_prefix}-auto-remediation"
  retention_in_days = 14

  tags = {
    Name = "${local.name_prefix}-auto-remediation-logs"
  }
}
