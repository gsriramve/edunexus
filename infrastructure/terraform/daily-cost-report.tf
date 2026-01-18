# Daily Cost Report Lambda
# Sends daily AWS cost summary emails at 11:30 PM IST (6 PM UTC)

# =============================================================================
# Lambda IAM Role
# =============================================================================

resource "aws_iam_role" "daily_cost_report" {
  name = "${local.name_prefix}-daily-cost-report-role"

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
    Name = "${local.name_prefix}-daily-cost-report-role"
  }
}

# Lambda basic execution policy
resource "aws_iam_role_policy_attachment" "daily_cost_report_basic" {
  role       = aws_iam_role.daily_cost_report.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Cost Explorer and SNS permissions
resource "aws_iam_role_policy" "daily_cost_report_ce" {
  name = "${local.name_prefix}-daily-cost-report-ce"
  role = aws_iam_role.daily_cost_report.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ce:GetCostAndUsage"
        ]
        Resource = "*"
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

# =============================================================================
# Lambda Function
# =============================================================================

resource "aws_lambda_function" "daily_cost_report" {
  filename         = data.archive_file.daily_cost_report.output_path
  source_code_hash = data.archive_file.daily_cost_report.output_base64sha256
  function_name    = "${local.name_prefix}-daily-cost-report"
  role             = aws_iam_role.daily_cost_report.arn
  handler          = "index.handler"
  runtime          = "python3.11"
  timeout          = 30

  environment {
    variables = {
      SNS_TOPIC      = aws_sns_topic.alerts.arn
      MONTHLY_BUDGET = tostring(var.monthly_budget)
    }
  }

  tags = {
    Name = "${local.name_prefix}-daily-cost-report"
  }
}

# Lambda source code
data "archive_file" "daily_cost_report" {
  type        = "zip"
  output_path = "${path.module}/lambda/daily-cost-report.zip"

  source {
    content  = <<-EOF
import boto3
import json
import os
from datetime import datetime, timedelta

ce = boto3.client('ce', region_name='us-east-1')  # Cost Explorer is only in us-east-1
sns = boto3.client('sns')

def handler(event, context):
    """
    Daily cost report Lambda.
    Queries AWS Cost Explorer and sends email summary via SNS.
    """
    print(f"Event received: {json.dumps(event)}")

    sns_topic = os.environ['SNS_TOPIC']
    monthly_budget = float(os.environ.get('MONTHLY_BUDGET', '25'))

    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    first_of_month = today.replace(day=1)

    # Get yesterday's cost
    yesterday_response = ce.get_cost_and_usage(
        TimePeriod={
            'Start': yesterday.strftime('%Y-%m-%d'),
            'End': today.strftime('%Y-%m-%d')
        },
        Granularity='DAILY',
        Metrics=['UnblendedCost'],
        GroupBy=[
            {'Type': 'DIMENSION', 'Key': 'SERVICE'}
        ]
    )

    # Get month-to-date cost
    mtd_response = ce.get_cost_and_usage(
        TimePeriod={
            'Start': first_of_month.strftime('%Y-%m-%d'),
            'End': today.strftime('%Y-%m-%d')
        },
        Granularity='MONTHLY',
        Metrics=['UnblendedCost']
    )

    # Parse yesterday's cost by service
    yesterday_total = 0.0
    services = []

    for result in yesterday_response.get('ResultsByTime', []):
        for group in result.get('Groups', []):
            service_name = group['Keys'][0]
            amount = float(group['Metrics']['UnblendedCost']['Amount'])
            if amount > 0.01:  # Only show services with > 1 cent
                services.append((service_name, amount))
                yesterday_total += amount

    # Sort services by cost descending
    services.sort(key=lambda x: x[1], reverse=True)

    # Parse MTD cost
    mtd_total = 0.0
    for result in mtd_response.get('ResultsByTime', []):
        mtd_total = float(result['Total']['UnblendedCost']['Amount'])

    remaining = monthly_budget - mtd_total
    budget_pct = (mtd_total / monthly_budget) * 100 if monthly_budget > 0 else 0

    # Format email
    message = f"""EduNexus Daily AWS Cost Report
==============================
Date: {yesterday.strftime('%Y-%m-%d')}

Yesterday's Cost: $${yesterday_total:.2f}
Month-to-Date: $${mtd_total:.2f}
Budget: $${monthly_budget:.2f}
Remaining: $${remaining:.2f} ({100-budget_pct:.0f}% left)

"""

    if services:
        message += "Top Services (Yesterday):\n"
        for service, amount in services[:7]:  # Top 7 services
            # Shorten service names
            short_name = service.replace('Amazon ', '').replace('AWS ', '')
            message += f"  - {short_name}: $${amount:.2f}\n"
    else:
        message += "No charges recorded yesterday.\n"

    # Add warning if over 80% of budget
    if budget_pct > 80:
        message += f"\n WARNING: You've used {budget_pct:.0f}% of your monthly budget!\n"

    message += f"""
---
Generated at {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
"""

    # Send email via SNS
    subject = f"[EduNexus] Daily Cost: $${yesterday_total:.2f} | MTD: $${mtd_total:.2f}"

    sns.publish(
        TopicArn=sns_topic,
        Subject=subject,
        Message=message
    )

    print(f"Cost report sent: Yesterday=$${yesterday_total:.2f}, MTD=$${mtd_total:.2f}")

    return {
        'statusCode': 200,
        'body': json.dumps({
            'yesterday_cost': yesterday_total,
            'mtd_cost': mtd_total,
            'budget': monthly_budget,
            'remaining': remaining
        })
    }
EOF
    filename = "index.py"
  }
}

# =============================================================================
# CloudWatch Event Rule - Daily at 6 PM UTC (11:30 PM IST)
# =============================================================================

resource "aws_cloudwatch_event_rule" "daily_cost_report" {
  name                = "${local.name_prefix}-daily-cost-report"
  description         = "Trigger daily cost report Lambda at 11:30 PM IST"
  schedule_expression = "cron(0 18 * * ? *)"  # 6 PM UTC = 11:30 PM IST

  tags = {
    Name = "${local.name_prefix}-daily-cost-report-rule"
  }
}

resource "aws_cloudwatch_event_target" "daily_cost_report" {
  rule      = aws_cloudwatch_event_rule.daily_cost_report.name
  target_id = "DailyCostReportLambda"
  arn       = aws_lambda_function.daily_cost_report.arn
}

resource "aws_lambda_permission" "daily_cost_report_eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.daily_cost_report.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_cost_report.arn
}

# =============================================================================
# CloudWatch Log Group for Lambda
# =============================================================================

resource "aws_cloudwatch_log_group" "daily_cost_report" {
  name              = "/aws/lambda/${local.name_prefix}-daily-cost-report"
  retention_in_days = 14

  tags = {
    Name = "${local.name_prefix}-daily-cost-report-logs"
  }
}
