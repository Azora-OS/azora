# Deployment Monitoring Setup

## Overview

This guide explains how to set up comprehensive monitoring for deployment operations. Includes error rate monitoring, latency monitoring, resource monitoring, and automated alerting.

**Monitoring Stack**:
- Prometheus: Metrics collection and alerting
- Grafana: Visualization and dashboards
- Alertmanager: Alert routing and notifications
- Loki: Log aggregation

---

## Prerequisites

### Required Components
- Prometheus 2.40+
- Grafana 9.0+
- Alertmanager 0.24+
- Kubernetes 1.24+

### Required Metrics
- `http_requests_total`: Total HTTP requests
- `http_request_duration_ms_bucket`: HTTP request latency
- `http_requests_total{status=~"5.."}`: HTTP 5xx errors
- `db_query_duration_ms_bucket`: Database query latency
- `db_connection_pool_used`: Database connections in use
- `container_memory_usage_bytes`: Container memory usage
- `container_cpu_usage_seconds_total`: Container CPU usage

---

## Configuration

### 1. Update Prometheus Configuration

Add deployment monitoring rules to `observability/prometheus.yml`:

```yaml
rule_files:
  - 'alert-rules.yml'
  - 'deployment-monitoring.yml'  # Add this line

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093
```

### 2. Load Deployment Monitoring Rules

```bash
# Copy deployment monitoring rules
cp observability/deployment-monitoring.yml /etc/prometheus/

# Reload Prometheus
curl -X POST http://localhost:9090/-/reload

# Verify rules loaded
curl http://localhost:9090/api/v1/rules | jq '.data.groups[] | select(.name=="deployment_monitoring")'
```

### 3. Configure Alertmanager

Update `observability/alertmanager.yml`:

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'

route:
  receiver: 'deployment-alerts'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  routes:
    - match:
        component: deployment
        severity: critical
      receiver: 'deployment-critical'
      continue: true
    - match:
        component: deployment
        severity: warning
      receiver: 'deployment-warnings'

receivers:
  - name: 'deployment-alerts'
    slack_configs:
      - channel: '#deployments'
        title: 'Deployment Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ end }}'

  - name: 'deployment-critical'
    slack_configs:
      - channel: '#deployments-critical'
        title: '🚨 CRITICAL DEPLOYMENT ALERT'
        text: '{{ range .Alerts }}{{ .Annotations.description }}\n{{ end }}'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'

  - name: 'deployment-warnings'
    slack_configs:
      - channel: '#deployments'
        title: '⚠️ Deployment Warning'
        text: '{{ range .Alerts }}{{ .Annotations.description }}\n{{ end }}'
```

### 4. Deploy Monitoring Stack

```bash
# Using Docker Compose
docker-compose -f docker-compose.observability.yml up -d

# Or using Kubernetes
kubectl apply -f observability/prometheus-deployment.yaml
kubectl apply -f observability/alertmanager-deployment.yaml
kubectl apply -f observability/grafana-deployment.yaml
```

---

## Monitoring Metrics

### Error Rate Monitoring

**Metric**: `http_requests_total{status=~"5.."}`

**Thresholds**:
- Warning: > 0.1% (1 error per 1000 requests)
- Critical: > 5% (50 errors per 1000 requests)

**Query**:
```promql
(sum(rate(http_requests_total{status=~"5.."}[5m])) by (job) / 
 sum(rate(http_requests_total[5m])) by (job)) * 100
```

**Action**:
- Warning: Review logs and investigate
- Critical: Trigger automatic rollback

### Latency Monitoring

**Metric**: `http_request_duration_ms_bucket`

**Thresholds**:
- Warning: P95 > 100ms
- Critical: P95 > 500ms

**Query**:
```promql
histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (job, le))
```

**Action**:
- Warning: Review performance metrics
- Critical: Trigger automatic rollback

### Database Monitoring

**Metric**: `db_query_duration_ms_bucket`

**Thresholds**:
- Warning: P95 > 50ms
- Critical: P95 > 200ms

**Query**:
```promql
histogram_quantile(0.95, sum(rate(db_query_duration_ms_bucket[5m])) by (le))
```

**Action**:
- Warning: Review query performance
- Critical: Trigger automatic rollback

### Resource Monitoring

**Memory**:
```promql
(container_memory_usage_bytes / container_spec_memory_limit_bytes) * 100
```

**Thresholds**:
- Warning: > 80%
- Critical: > 95%

**CPU**:
```promql
(rate(container_cpu_usage_seconds_total[5m]) / container_spec_cpu_quota) * 100
```

**Thresholds**:
- Warning: > 80%
- Critical: > 95%

---

## Grafana Dashboards

### 1. Deployment Overview Dashboard

Create a new dashboard with the following panels:

**Panel 1: Error Rate**
```promql
(sum(rate(http_requests_total{status=~"5.."}[5m])) by (job) / 
 sum(rate(http_requests_total[5m])) by (job)) * 100
```

**Panel 2: API Latency (P95)**
```promql
histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (job, le))
```

**Panel 3: Database Query Time (P95)**
```promql
histogram_quantile(0.95, sum(rate(db_query_duration_ms_bucket[5m])) by (le))
```

**Panel 4: Request Rate**
```promql
sum(rate(http_requests_total[5m])) by (job)
```

**Panel 5: Memory Usage**
```promql
(container_memory_usage_bytes / container_spec_memory_limit_bytes) * 100
```

**Panel 6: CPU Usage**
```promql
(rate(container_cpu_usage_seconds_total[5m]) / container_spec_cpu_quota) * 100
```

### 2. Deployment Health Dashboard

**Panel 1: Pod Status**
```promql
kube_pod_status_phase{namespace="production"}
```

**Panel 2: Pod Restarts**
```promql
rate(kube_pod_container_status_restarts_total[15m])
```

**Panel 3: Deployment Replicas**
```promql
kube_deployment_status_replicas_available / kube_deployment_spec_replicas
```

**Panel 4: Service Endpoints**
```promql
count(up{job=~".*-service|.*-gateway"})
```

### 3. Deployment Alerts Dashboard

**Panel 1: Active Alerts**
```promql
count(ALERTS{component="deployment"})
```

**Panel 2: Critical Alerts**
```promql
count(ALERTS{component="deployment",severity="critical"})
```

**Panel 3: Alert History**
```promql
increase(ALERTS_FOR_STATE{component="deployment"}[1h])
```

---

## Alert Configuration

### Critical Alerts (Automatic Rollback)

These alerts trigger automatic rollback:

1. **Error Rate > 5%**
   - Duration: 2 minutes
   - Action: Automatic rollback
   - Notification: PagerDuty + Slack

2. **API Latency P95 > 500ms**
   - Duration: 2 minutes
   - Action: Automatic rollback
   - Notification: PagerDuty + Slack

3. **Database Query Time P95 > 200ms**
   - Duration: 2 minutes
   - Action: Automatic rollback
   - Notification: PagerDuty + Slack

4. **Pod CrashLoopBackOff**
   - Duration: 2 minutes
   - Action: Automatic rollback
   - Notification: PagerDuty + Slack

### Warning Alerts (Manual Investigation)

These alerts require manual investigation:

1. **Error Rate > 0.1%**
   - Duration: 5 minutes
   - Action: Investigate
   - Notification: Slack

2. **API Latency P95 > 100ms**
   - Duration: 5 minutes
   - Action: Investigate
   - Notification: Slack

3. **Database Query Time P95 > 50ms**
   - Duration: 5 minutes
   - Action: Investigate
   - Notification: Slack

4. **Memory Usage > 80%**
   - Duration: 5 minutes
   - Action: Monitor
   - Notification: Slack

---

## Automated Rollback

### Rollback Trigger

When critical alerts fire, automatic rollback is triggered:

```bash
#!/bin/bash
# deployment/auto-rollback.sh

ALERT_NAME=$1
SEVERITY=$2

if [ "$SEVERITY" = "critical" ] && [ "$ALERT_NAME" = "DeploymentCriticalErrorRate" ]; then
  echo "Triggering automatic rollback due to high error rate..."
  helm rollback azora-prod 1 -n production
  kubectl patch service api-gateway -n production \
    -p '{"spec":{"selector":{"slot":"blue"}}}'
  echo "Rollback completed"
fi
```

### Rollback Verification

```bash
#!/bin/bash
# deployment/verify-rollback.sh

# Check error rate
ERROR_RATE=$(curl -s http://localhost:9090/api/v1/query \
  --data-urlencode 'query=(sum(rate(http_requests_total{status=~"5.."}[5m])) by (job) / sum(rate(http_requests_total[5m])) by (job)) * 100' \
  | jq '.data.result[0].value[1]')

if (( $(echo "$ERROR_RATE < 1" | bc -l) )); then
  echo "✓ Rollback successful. Error rate: $ERROR_RATE%"
  exit 0
else
  echo "✗ Rollback failed. Error rate still high: $ERROR_RATE%"
  exit 1
fi
```

---

## Monitoring Dashboards

### Access Dashboards

```
Grafana: http://localhost:3000
Prometheus: http://localhost:9090
Alertmanager: http://localhost:9093
```

### Default Credentials

- Grafana: admin / admin
- Prometheus: No authentication
- Alertmanager: No authentication

---

## Testing Alerts

### Test Error Rate Alert

```bash
# Simulate high error rate
for i in {1..100}; do
  curl -s http://localhost:3000/api/invalid 2>/dev/null &
done
wait

# Check alert in Prometheus
curl http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.labels.alertname=="DeploymentHighErrorRate")'
```

### Test Latency Alert

```bash
# Simulate slow endpoint
curl -s http://localhost:3000/api/slow?delay=200

# Check alert in Prometheus
curl http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.labels.alertname=="DeploymentHighLatency")'
```

### Test Memory Alert

```bash
# Simulate high memory usage
# This would require a memory leak in the application

# Check alert in Prometheus
curl http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.labels.alertname=="DeploymentHighMemoryUsage")'
```

---

## Troubleshooting

### Alerts Not Firing

**Problem**: Alerts configured but not firing

**Solution**:
1. Check Prometheus rule files: `curl http://localhost:9090/api/v1/rules`
2. Verify metrics are being collected: `curl http://localhost:9090/api/v1/query?query=up`
3. Check alert evaluation: `curl http://localhost:9090/api/v1/alerts`
4. Reload Prometheus: `curl -X POST http://localhost:9090/-/reload`

### Alerts Not Routing

**Problem**: Alerts firing but not reaching Slack/PagerDuty

**Solution**:
1. Check Alertmanager configuration: `curl http://localhost:9093/api/v1/status`
2. Verify webhook URLs are correct
3. Check Alertmanager logs: `docker logs alertmanager`
4. Test webhook: `curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK`

### High False Positive Rate

**Problem**: Too many alerts firing

**Solution**:
1. Increase alert duration thresholds
2. Adjust alert thresholds based on baseline metrics
3. Add alert suppression rules for known issues
4. Review alert rules for accuracy

---

## Best Practices

1. **Set Realistic Thresholds**: Based on baseline metrics, not arbitrary values
2. **Use Alert Grouping**: Group related alerts to reduce noise
3. **Implement Alert Routing**: Route critical alerts to on-call engineer
4. **Test Alerts Regularly**: Verify alerts fire and route correctly
5. **Document Alert Runbooks**: Include remediation steps for each alert
6. **Review Alert Trends**: Identify patterns and adjust thresholds
7. **Automate Remediation**: Trigger automatic rollback for critical issues
8. **Monitor Alert Quality**: Track false positive and false negative rates

---

## Related Documents

- [Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Performance Monitoring](./PERFORMANCE-MONITORING-SETUP.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

