# Deployment Monitoring - Complete Setup

## Overview

This document describes the complete deployment monitoring setup for Azora OS, including error rate monitoring, latency monitoring, resource monitoring, and automated alerting.

**Status**: ✅ Complete and Ready for Production

---

## Components Implemented

### 1. Prometheus Alert Rules
**File**: `observability/deployment-monitoring.yml`

Comprehensive alert rules covering:
- **Error Rate Monitoring**: Warning (>0.1%) and Critical (>5%) thresholds
- **Latency Monitoring**: Warning (>100ms) and Critical (>500ms) P95 latency
- **Database Monitoring**: Query time and connection pool alerts
- **Resource Monitoring**: Memory and CPU usage alerts
- **Deployment Health**: Pod restart, crash loop, and replica mismatch alerts
- **Traffic Monitoring**: Sudden traffic drop/spike detection
- **Deployment Process**: Rollout stuck and generation mismatch alerts

**Total Rules**: 20+ comprehensive monitoring rules

### 2. Grafana Dashboard
**File**: `observability/grafana/provisioning/dashboards/deployment-monitoring-dashboard.json`

Dashboard panels:
- Error Rate by Service (gauge)
- API Latency P95/P99 (time series)
- Request Rate by Service (time series)
- Database Query Time P95/P99 (time series)
- Memory Usage by Pod (time series)
- CPU Usage by Pod (time series)
- Active Critical Alerts (gauge)
- Active Warning Alerts (gauge)
- Pod Restart Rate (bar chart)
- Deployment Replicas Status (time series)
- Database Connection Pool Usage (time series)

### 3. Alertmanager Configuration
**File**: `observability/alertmanager.yml`

Features:
- Alert routing by severity (critical, warning, info)
- Slack integration for notifications
- Alert grouping and deduplication
- Inhibition rules to reduce noise
- Configurable repeat intervals

### 4. Setup and Validation Scripts
**Files**:
- `deployment/setup-deployment-monitoring.sh`: Automated setup script
- `deployment/deployment-monitoring-validator.ts`: Validation tool
- `tests/deployment-monitoring.test.ts`: Comprehensive test suite

---

## Quick Start

### 1. Start the Monitoring Stack

```bash
# Using Docker Compose
docker-compose -f docker-compose.observability.yml up -d

# Or using Kubernetes
kubectl apply -f observability/prometheus-deployment.yaml
kubectl apply -f observability/alertmanager-deployment.yaml
kubectl apply -f observability/grafana-deployment.yaml
```

### 2. Run Setup Script

```bash
bash deployment/setup-deployment-monitoring.sh
```

This script will:
- Verify all components are running
- Load Prometheus rules
- Verify Alertmanager configuration
- Check Grafana datasources
- Test alert rules

### 3. Access Monitoring Tools

```
Prometheus:   http://localhost:9090
Alertmanager: http://localhost:9093
Grafana:      http://localhost:3000
```

### 4. View Deployment Monitoring Dashboard

1. Open Grafana at http://localhost:3000
2. Navigate to Dashboards > Deployment Monitoring
3. Monitor error rates, latency, and resource usage in real-time

---

## Monitoring Metrics

### Error Rate Monitoring

**Metric**: `http_requests_total{status=~"5.."}`

**Thresholds**:
- ⚠️ Warning: > 0.1% (1 error per 1000 requests)
- 🚨 Critical: > 5% (50 errors per 1000 requests)

**Query**:
```promql
(sum(rate(http_requests_total{status=~"5.."}[5m])) by (job) / 
 sum(rate(http_requests_total[5m])) by (job)) * 100
```

**Action**:
- Warning: Review logs and investigate
- Critical: Automatic rollback triggered

### Latency Monitoring

**Metric**: `http_request_duration_ms_bucket`

**Thresholds**:
- ⚠️ Warning: P95 > 100ms
- 🚨 Critical: P95 > 500ms

**Query**:
```promql
histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (job, le))
```

**Action**:
- Warning: Review performance metrics
- Critical: Automatic rollback triggered

### Database Monitoring

**Metric**: `db_query_duration_ms_bucket`

**Thresholds**:
- ⚠️ Warning: P95 > 50ms
- 🚨 Critical: P95 > 200ms

**Query**:
```promql
histogram_quantile(0.95, sum(rate(db_query_duration_ms_bucket[5m])) by (le))
```

**Action**:
- Warning: Review query performance
- Critical: Automatic rollback triggered

### Resource Monitoring

**Memory Usage**:
```promql
(container_memory_usage_bytes / container_spec_memory_limit_bytes) * 100
```

**Thresholds**:
- ⚠️ Warning: > 80%
- 🚨 Critical: > 95%

**CPU Usage**:
```promql
(rate(container_cpu_usage_seconds_total[5m]) / container_spec_cpu_quota) * 100
```

**Thresholds**:
- ⚠️ Warning: > 80%
- 🚨 Critical: > 95%

---

## Alert Rules

### Critical Alerts (Automatic Rollback)

These alerts trigger automatic rollback:

1. **DeploymentCriticalErrorRate**
   - Condition: Error rate > 5% for 2 minutes
   - Action: Automatic rollback
   - Notification: PagerDuty + Slack

2. **DeploymentCriticalLatency**
   - Condition: P95 latency > 500ms for 2 minutes
   - Action: Automatic rollback
   - Notification: PagerDuty + Slack

3. **DeploymentCriticalQueries**
   - Condition: P95 query time > 200ms for 2 minutes
   - Action: Automatic rollback
   - Notification: PagerDuty + Slack

4. **DeploymentPodCrashLoop**
   - Condition: Pod in CrashLoopBackOff for 2 minutes
   - Action: Automatic rollback
   - Notification: PagerDuty + Slack

### Warning Alerts (Manual Investigation)

These alerts require manual investigation:

1. **DeploymentHighErrorRate**
   - Condition: Error rate > 0.1% for 5 minutes
   - Action: Investigate
   - Notification: Slack

2. **DeploymentHighLatency**
   - Condition: P95 latency > 100ms for 5 minutes
   - Action: Investigate
   - Notification: Slack

3. **DeploymentSlowQueries**
   - Condition: P95 query time > 50ms for 5 minutes
   - Action: Investigate
   - Notification: Slack

4. **DeploymentHighMemoryUsage**
   - Condition: Memory > 80% for 5 minutes
   - Action: Monitor
   - Notification: Slack

---

## Configuration

### Prometheus Configuration

Update `observability/prometheus.yml`:

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

### Alertmanager Configuration

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
```

### Environment Variables

```bash
# Prometheus
PROMETHEUS_URL=http://localhost:9090

# Alertmanager
ALERTMANAGER_URL=http://localhost:9093

# Grafana
GRAFANA_URL=http://localhost:3000

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
```

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
# Simulate high memory usage (requires memory leak in application)

# Check alert in Prometheus
curl http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.labels.alertname=="DeploymentHighMemoryUsage")'
```

### Run Test Suite

```bash
# Run all deployment monitoring tests
npm test -- tests/deployment-monitoring.test.ts

# Run specific test
npm test -- tests/deployment-monitoring.test.ts -t "Error Rate Monitoring"
```

---

## Validation

### Run Validation Script

```bash
# Validate deployment monitoring setup
npx ts-node deployment/deployment-monitoring-validator.ts
```

**Checks**:
- ✓ Prometheus accessibility
- ✓ Deployment monitoring rules loaded
- ✓ Error rate metrics available
- ✓ Latency metrics available
- ✓ Database metrics available
- ✓ Resource metrics available
- ✓ Alertmanager accessibility
- ✓ Alertmanager receivers configured
- ✓ Grafana accessibility
- ✓ Grafana dashboards available

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

### Metrics Not Available

**Problem**: Metrics not showing in Prometheus

**Solution**:
1. Verify services are exporting metrics
2. Check Prometheus scrape configuration
3. Verify metrics endpoint is accessible
4. Check service logs for errors

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

## Metrics Reference

### HTTP Metrics

- `http_requests_total`: Total HTTP requests
- `http_request_duration_ms_bucket`: HTTP request latency histogram
- `http_requests_total{status=~"5.."}`: HTTP 5xx errors

### Database Metrics

- `db_query_duration_ms_bucket`: Database query latency histogram
- `db_connection_pool_used`: Database connections in use
- `db_connection_pool_max`: Maximum database connections

### Resource Metrics

- `container_memory_usage_bytes`: Container memory usage
- `container_spec_memory_limit_bytes`: Container memory limit
- `container_cpu_usage_seconds_total`: Container CPU usage
- `container_spec_cpu_quota`: Container CPU quota

### Kubernetes Metrics

- `kube_pod_status_phase`: Pod status
- `kube_pod_container_status_restarts_total`: Pod restart count
- `kube_deployment_status_replicas_available`: Available replicas
- `kube_deployment_spec_replicas`: Desired replicas

---

## Related Documents

- [Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Performance Monitoring](./PERFORMANCE-MONITORING-SETUP.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Alert Rules](../observability/deployment-monitoring.yml)
- [Grafana Dashboard](../observability/grafana/provisioning/dashboards/deployment-monitoring-dashboard.json)

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Related Documents](#related-documents)
3. Run [Validation Script](#validation)
4. Check service logs: `docker logs <service-name>`
5. Contact DevOps team

---

**Last Updated**: November 2025  
**Status**: Production Ready ✅
