# CloudWatch Alarms for Docker Resource Monitoring
# Monitors build cache, disk usage, and dangling images
# Triggers auto-remediation Lambda when thresholds exceeded

# =============================================================================
# Docker Build Cache Alarm (>5GB)
# =============================================================================

resource "aws_cloudwatch_metric_alarm" "docker_build_cache_high" {
  alarm_name          = "${local.name_prefix}-docker-build-cache-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "BuildCacheSize"
  namespace           = "EduNexus/Docker"
  period              = 300
  statistic           = "Maximum"
  threshold           = 5 # 5GB
  alarm_description   = "Docker build cache exceeds 5GB - triggering auto-remediation"
  alarm_actions       = [aws_sns_topic.alerts.arn, aws_lambda_function.auto_remediation.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.main.id
  }

  tags = {
    Name = "${local.name_prefix}-docker-build-cache-high"
  }
}

# =============================================================================
# Docker Disk Usage Alarm (>75%)
# =============================================================================

resource "aws_cloudwatch_metric_alarm" "docker_disk_high" {
  alarm_name          = "${local.name_prefix}-docker-disk-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "DiskUsagePercent"
  namespace           = "EduNexus/Docker"
  period              = 300
  statistic           = "Maximum"
  threshold           = 75
  alarm_description   = "Disk usage exceeds 75% - triggering auto-remediation"
  alarm_actions       = [aws_sns_topic.alerts.arn, aws_lambda_function.auto_remediation.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.main.id
  }

  tags = {
    Name = "${local.name_prefix}-docker-disk-high"
  }
}

# =============================================================================
# Docker Dangling Images Alarm (>2GB)
# =============================================================================

resource "aws_cloudwatch_metric_alarm" "docker_dangling_high" {
  alarm_name          = "${local.name_prefix}-docker-dangling-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "DanglingImageSize"
  namespace           = "EduNexus/Docker"
  period              = 300
  statistic           = "Maximum"
  threshold           = 2 # 2GB
  alarm_description   = "Dangling Docker images exceed 2GB - triggering auto-remediation"
  alarm_actions       = [aws_sns_topic.alerts.arn, aws_lambda_function.auto_remediation.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.main.id
  }

  tags = {
    Name = "${local.name_prefix}-docker-dangling-high"
  }
}

# =============================================================================
# Update Dashboard with Docker Metrics
# =============================================================================

resource "aws_cloudwatch_dashboard" "docker" {
  dashboard_name = "${local.name_prefix}-docker-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# EduNexus Docker Resource Monitoring"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 8
        height = 6
        properties = {
          title  = "Docker Build Cache (GB)"
          region = var.aws_region
          metrics = [
            ["EduNexus/Docker", "BuildCacheSize", "InstanceId", aws_instance.main.id]
          ]
          period = 60
          stat   = "Maximum"
          view   = "timeSeries"
          annotations = {
            horizontal = [
              {
                label = "Alarm Threshold"
                value = 5
                color = "#ff0000"
              }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 1
        width  = 8
        height = 6
        properties = {
          title  = "Disk Usage (%)"
          region = var.aws_region
          metrics = [
            ["EduNexus/Docker", "DiskUsagePercent", "InstanceId", aws_instance.main.id]
          ]
          period = 60
          stat   = "Maximum"
          view   = "timeSeries"
          annotations = {
            horizontal = [
              {
                label = "Alarm Threshold"
                value = 75
                color = "#ff0000"
              }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 1
        width  = 8
        height = 6
        properties = {
          title  = "Dangling Images (GB)"
          region = var.aws_region
          metrics = [
            ["EduNexus/Docker", "DanglingImageSize", "InstanceId", aws_instance.main.id]
          ]
          period = 60
          stat   = "Maximum"
          view   = "timeSeries"
          annotations = {
            horizontal = [
              {
                label = "Alarm Threshold"
                value = 2
                color = "#ff0000"
              }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 7
        width  = 12
        height = 6
        properties = {
          title  = "Docker Image Count"
          region = var.aws_region
          metrics = [
            ["EduNexus/Docker", "ImageCount", "InstanceId", aws_instance.main.id]
          ]
          period = 60
          stat   = "Maximum"
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 7
        width  = 12
        height = 6
        properties = {
          title  = "Docker Container Count"
          region = var.aws_region
          metrics = [
            ["EduNexus/Docker", "ContainerCount", "InstanceId", aws_instance.main.id]
          ]
          period = 60
          stat   = "Maximum"
          view   = "timeSeries"
        }
      },
      {
        type   = "alarm"
        x      = 0
        y      = 13
        width  = 24
        height = 3
        properties = {
          title = "Docker Alarm Status"
          alarms = [
            aws_cloudwatch_metric_alarm.docker_build_cache_high.arn,
            aws_cloudwatch_metric_alarm.docker_disk_high.arn,
            aws_cloudwatch_metric_alarm.docker_dangling_high.arn
          ]
        }
      }
    ]
  })
}
