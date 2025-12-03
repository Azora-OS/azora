# Alerts Configuration Guide

This guide explains how to configure and manage alerts in the Education Revenue Engine.

## Overview

The alerts system monitors key metrics and triggers notifications when thresholds are exceeded. It supports multiple notification channels including logging, Slack, email, and webhooks.

## Alert Rules

### Default Alert Rules

The system comes with pre-configured alert rules:

#### API Performance Alerts

**High API Error Rate**
- Rule ID: `api-error-rate-high`
- Threshold: 5% error rate
- Severity: Critical
- Duration: 5 minutes
- Actions: Log, Slack notification

**High API Latency**
- Rule ID: `api-latency-high`
- Threshold: 2000ms (p95)
- Severity: Warning
- Duration: 5 minutes
- Actions: Log

#### Database Alerts

**High Database Error Rate**
- Rule ID: `db-error-rate-high`
- Threshold: 1% error rate
- Severity: Critical
- Duration: 5 minutes
- Actions: Log, Slack notification

#### AI Engine Alerts

**High AI Engine Error Rate**
- Rule ID: `ai-error-rate-high`
- Threshold: 10% error rate
- Severity: Warning
- Duration: 5 minutes
- Actions: Log

#### Cache Alerts

**Low Cache Hit Rate**
- Rule ID: `cache-hit-rate-low`
- Threshold: 50% hit rate
- Severity: Warning
- Duration: 10 minutes
- Actions: Log

#### System Alerts

**High Memory Usage**
- Rule ID: `memory-usage-high`
- Threshold: 90% heap usage
- Severity: Critical
- Duration: 5 minutes
- Actions: Log, Slack notification

#### Business Metrics Alerts

**Low Conversion Rate**
- Rule ID: `conversion-rate-low`
- Threshold: 30% conversion rate
- Severity: Warning
- Duration: 1 hour
- Actions: Log

**High Churn Rate**
- Rule ID: `churn-rate-high`
- Threshold: 20% churn rate
- Severity: Warning
- Duration: 1 hour
- Actions: Log

## Alert Endpoints

### Get All Alert Rules

```bash
GET /alerts/rules
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "api-error-rate-high",
      "name": "High API Error Rate",
      "description": "Alert when API error rate exceeds 5%",
      "metric": "http_error_rate",
      "threshold": 5,
      "operator": "gt",
      "duration": 300000,
      "severity": "critical",
      "enabled": true,
      "actions": [
        { "type": "log" },
        { "type": "slack", "target": "https://hooks.slack.com/..." }
      ]
    }
  ],
  "count": 8,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Create Alert Rule

```bash
POST /alerts/rules
Content-Type: application/json

{
  "id": "custom-alert",
  "name": "Custom Alert",
  "description": "Custom alert rule",
  "metric": "http_error_rate",
  "threshold": 10,
  "operator": "gt",
  "duration": 300000,
  "severity": "warning",
  "enabled": true,
  "actions": [
    { "type": "log" },
    { "type": "slack", "target": "https://hooks.slack.com/..." }
  ]
}
```

### Delete Alert Rule

```bash
DELETE /alerts/rules/{ruleId}
```

### Get Active Alerts

```bash
GET /alerts/active
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "api-error-rate-high-1705318200000",
      "ruleId": "api-error-rate-high",
      "ruleName": "High API Error Rate",
      "severity": "critical",
      "message": "High API Error Rate: Alert when API error rate exceeds 5%",
      "value": 7.5,
      "threshold": 5,
      "timestamp": "2024-01-15T10:30:00.000Z",
      "resolved": false
    }
  ],
  "count": 1,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Alert History

```bash
GET /alerts/history?limit=100
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "api-error-rate-high-1705318200000",
      "ruleId": "api-error-rate-high",
      "ruleName": "High API Error Rate",
      "severity": "critical",
      "message": "High API Error Rate: Alert when API error rate exceeds 5%",
      "value": 7.5,
      "threshold": 5,
      "timestamp": "2024-01-15T10:30:00.000Z",
      "resolved": true,
      "resolvedAt": "2024-01-15T10:35:00.000Z"
    }
  ],
  "count": 1,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Resolve Alert

```bash
POST /alerts/{alertId}/resolve
```

### Get Alert Statistics

```bash
GET /alerts/statistics
```

Response:
```json
{
  "success": true,
  "data": {
    "totalActive": 2,
    "critical": 1,
    "warning": 1,
    "info": 0,
    "totalHistory": 45,
    "rules": 8
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Alert Operators

Alerts support the following comparison operators:

- `gt` - Greater than (>)
- `lt` - Less than (<)
- `eq` - Equal to (=)
- `gte` - Greater than or equal (>=)
- `lte` - Less than or equal (<=)

## Alert Severity Levels

- **info** - Informational alert
- **warning** - Warning alert (requires attention)
- **critical** - Critical alert (requires immediate action)

## Alert Actions

### Log Action

Logs the alert to the structured logging system.

```json
{
  "type": "log"
}
```

### Slack Action

Sends a notification to a Slack webhook.

```json
{
  "type": "slack",
  "target": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
}
```

### Email Action

Sends an email notification.

```json
{
  "type": "email",
  "target": "alerts@example.com"
}
```

### Webhook Action

Sends a POST request to a custom webhook.

```json
{
  "type": "webhook",
  "target": "https://your-system.com/alerts"
}
```

## Configuration

### Environment Variables

```env
# Alert checking interval (milliseconds)
ALERT_CHECK_INTERVAL=60000

# Slack webhook URL for alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email configuration
ALERT_EMAIL_FROM=alerts@example.com
ALERT_EMAIL_TO=ops@example.com
```

## Creating Custom Alerts

### Example: High Request Rate Alert

```bash
POST /alerts/rules
Content-Type: application/json

{
  "id": "request-rate-high",
  "name": "High Request Rate",
  "description": "Alert when request rate exceeds 1000 req/s",
  "metric": "http_request_rate",
  "threshold": 1000,
  "operator": "gt",
  "duration": 300000,
  "severity": "warning",
  "enabled": true,
  "actions": [
    { "type": "log" },
    { "type": "slack", "target": "https://hooks.slack.com/..." }
  ]
}
```

### Example: Low Student Engagement Alert

```bash
POST /alerts/rules
Content-Type: application/json

{
  "id": "student-engagement-low",
  "name": "Low Student Engagement",
  "description": "Alert when active students drop below 100",
  "metric": "active_students",
  "threshold": 100,
  "operator": "lt",
  "duration": 3600000,
  "severity": "warning",
  "enabled": true,
  "actions": [
    { "type": "log" },
    { "type": "email", "target": "ops@example.com" }
  ]
}
```

## Alert Lifecycle

1. **Alert Triggered** - Metric exceeds threshold for specified duration
2. **Notification Sent** - Actions are executed (log, Slack, email, webhook)
3. **Alert Active** - Alert remains active until metric returns to normal
4. **Alert Resolved** - Metric returns to normal or manually resolved
5. **Alert Archived** - Alert moved to history

## Best Practices

1. **Set Appropriate Thresholds** - Avoid alert fatigue by setting realistic thresholds
2. **Use Multiple Channels** - Combine logging with Slack for critical alerts
3. **Monitor Alert Trends** - Review alert history to identify patterns
4. **Adjust Rules** - Update rules based on system behavior and business needs
5. **Test Alerts** - Verify alert actions work correctly
6. **Document Custom Rules** - Keep track of custom alert rules and their purpose

## Troubleshooting

### Alerts Not Triggering

1. Check if alert rule is enabled: `GET /alerts/rules`
2. Verify metric is being collected
3. Check alert check interval: `ALERT_CHECK_INTERVAL`
4. Review application logs for errors

### Slack Notifications Not Sending

1. Verify `SLACK_WEBHOOK_URL` is set correctly
2. Test webhook URL manually
3. Check application logs for webhook errors
4. Verify Slack workspace permissions

### Too Many Alerts

1. Increase threshold values
2. Increase duration before triggering
3. Disable non-critical rules
4. Review alert history to identify false positives

## Integration with Monitoring Stack

Alerts integrate with the monitoring stack:

- **Prometheus** - Metrics collection
- **Grafana** - Alert visualization
- **Sentry** - Error tracking
- **ELK Stack** - Log aggregation

## Production Deployment

### Recommended Configuration

```env
# Alert checking every minute
ALERT_CHECK_INTERVAL=60000

# Slack notifications for critical alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email notifications for warnings
ALERT_EMAIL_FROM=alerts@production.example.com
ALERT_EMAIL_TO=ops@production.example.com

# Stricter thresholds for production
API_ERROR_RATE_THRESHOLD=2
API_LATENCY_THRESHOLD=1000
MEMORY_USAGE_THRESHOLD=85
```

### Alert Escalation

Configure escalation for critical alerts:

1. **Immediate** - Log + Slack notification
2. **5 minutes** - Email to ops team
3. **15 minutes** - Page on-call engineer
4. **30 minutes** - Escalate to manager

## Monitoring Alerts

Monitor the alerts system itself:

```bash
# Get alert statistics
curl http://localhost:3020/alerts/statistics

# Get active alerts
curl http://localhost:3020/alerts/active

# Get alert history
curl http://localhost:3020/alerts/history?limit=50
```

## Additional Resources

- [Monitoring Setup Guide](./MONITORING-SETUP.md)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Alerting](https://grafana.com/docs/grafana/latest/alerting/)
- [Sentry Documentation](https://docs.sentry.io/)
