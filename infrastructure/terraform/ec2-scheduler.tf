# EC2 Auto Stop/Start Scheduler
# Saves ~60% on EC2 costs by stopping during non-business hours

locals {
  # IST is UTC+5:30, so:
  # 10 PM IST = 4:30 PM UTC (16:30)
  # 8 AM IST = 2:30 AM UTC (02:30)
  stop_cron  = "cron(30 16 ? * MON-FRI *)"  # 10 PM IST weekdays
  start_cron = "cron(30 2 ? * MON-FRI *)"   # 8 AM IST weekdays

  # Weekend: Stop Friday 10 PM, Start Monday 8 AM (covered by above)
}

# IAM Role for Lambda
resource "aws_iam_role" "ec2_scheduler" {
  name = "${local.name_prefix}-ec2-scheduler-role"

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
    Name = "${local.name_prefix}-ec2-scheduler-role"
  }
}

# IAM Policy for Lambda to manage EC2
resource "aws_iam_role_policy" "ec2_scheduler" {
  name = "${local.name_prefix}-ec2-scheduler-policy"
  role = aws_iam_role.ec2_scheduler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:StartInstances",
          "ec2:StopInstances",
          "ec2:DescribeInstances"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "ec2:ResourceTag/Name" = "${local.name_prefix}-server"
          }
        }
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.alerts.arn
      }
    ]
  })
}

# Lambda function for EC2 Stop
resource "aws_lambda_function" "ec2_stop" {
  filename         = data.archive_file.ec2_scheduler.output_path
  function_name    = "${local.name_prefix}-ec2-stop"
  role             = aws_iam_role.ec2_scheduler.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.ec2_scheduler.output_base64sha256
  runtime          = "python3.11"
  timeout          = 60

  environment {
    variables = {
      INSTANCE_ID = aws_instance.main.id
      ACTION      = "stop"
      SNS_TOPIC   = aws_sns_topic.alerts.arn
    }
  }

  tags = {
    Name = "${local.name_prefix}-ec2-stop"
  }
}

# Lambda function for EC2 Start
resource "aws_lambda_function" "ec2_start" {
  filename         = data.archive_file.ec2_scheduler.output_path
  function_name    = "${local.name_prefix}-ec2-start"
  role             = aws_iam_role.ec2_scheduler.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.ec2_scheduler.output_base64sha256
  runtime          = "python3.11"
  timeout          = 60

  environment {
    variables = {
      INSTANCE_ID = aws_instance.main.id
      ACTION      = "start"
      SNS_TOPIC   = aws_sns_topic.alerts.arn
    }
  }

  tags = {
    Name = "${local.name_prefix}-ec2-start"
  }
}

# Lambda code
data "archive_file" "ec2_scheduler" {
  type        = "zip"
  output_path = "${path.module}/lambda/ec2-scheduler.zip"

  source {
    content  = <<-EOF
import boto3
import os

def handler(event, context):
    ec2 = boto3.client('ec2')
    sns = boto3.client('sns')

    instance_id = os.environ['INSTANCE_ID']
    action = os.environ['ACTION']
    sns_topic = os.environ.get('SNS_TOPIC')

    # Check if this is a manual override check
    if event.get('source') == 'aws.events':
        # Check for manual override tag
        response = ec2.describe_instances(InstanceIds=[instance_id])
        tags = response['Reservations'][0]['Instances'][0].get('Tags', [])
        for tag in tags:
            if tag['Key'] == 'SchedulerOverride' and tag['Value'] == 'skip':
                print(f"Skipping {action} due to SchedulerOverride tag")
                return {'statusCode': 200, 'body': f'Skipped {action} - override active'}

    try:
        if action == 'stop':
            ec2.stop_instances(InstanceIds=[instance_id])
            message = f"EduNexus EC2 instance stopped (scheduled)"
        else:
            ec2.start_instances(InstanceIds=[instance_id])
            message = f"EduNexus EC2 instance started (scheduled)"

        print(message)

        # Send notification
        if sns_topic:
            sns.publish(
                TopicArn=sns_topic,
                Subject=f"EduNexus: EC2 {action.upper()}",
                Message=message
            )

        return {'statusCode': 200, 'body': message}
    except Exception as e:
        error_msg = f"Error {action}ing instance: {str(e)}"
        print(error_msg)
        return {'statusCode': 500, 'body': error_msg}
EOF
    filename = "index.py"
  }
}

# CloudWatch Event Rule - Stop (10 PM IST weekdays)
resource "aws_cloudwatch_event_rule" "ec2_stop" {
  name                = "${local.name_prefix}-ec2-stop-schedule"
  description         = "Stop EduNexus EC2 at 10 PM IST on weekdays"
  schedule_expression = local.stop_cron

  tags = {
    Name = "${local.name_prefix}-ec2-stop-schedule"
  }
}

resource "aws_cloudwatch_event_target" "ec2_stop" {
  rule      = aws_cloudwatch_event_rule.ec2_stop.name
  target_id = "StopEC2Instance"
  arn       = aws_lambda_function.ec2_stop.arn
}

resource "aws_lambda_permission" "ec2_stop" {
  statement_id  = "AllowCloudWatchToInvokeLambda"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ec2_stop.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ec2_stop.arn
}

# CloudWatch Event Rule - Start (8 AM IST weekdays)
resource "aws_cloudwatch_event_rule" "ec2_start" {
  name                = "${local.name_prefix}-ec2-start-schedule"
  description         = "Start EduNexus EC2 at 8 AM IST on weekdays"
  schedule_expression = local.start_cron

  tags = {
    Name = "${local.name_prefix}-ec2-start-schedule"
  }
}

resource "aws_cloudwatch_event_target" "ec2_start" {
  rule      = aws_cloudwatch_event_rule.ec2_start.name
  target_id = "StartEC2Instance"
  arn       = aws_lambda_function.ec2_start.arn
}

resource "aws_lambda_permission" "ec2_start" {
  statement_id  = "AllowCloudWatchToInvokeLambda"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ec2_start.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ec2_start.arn
}

# Outputs for manual control
output "ec2_start_lambda" {
  description = "Lambda function ARN for manual EC2 start"
  value       = aws_lambda_function.ec2_start.arn
}

output "ec2_stop_lambda" {
  description = "Lambda function ARN for manual EC2 stop"
  value       = aws_lambda_function.ec2_stop.arn
}
