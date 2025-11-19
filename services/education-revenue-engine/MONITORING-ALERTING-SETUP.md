# Monitoring and Alerting Setup Guide

This guide covers deploying and configuring the complete monitoring and alerting stack for the Education Revenue Engine.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Services                      │
│  (Education Engine, AI Integration, Revenue Services)       │
└────────────────┬────────────────────────────────────────────┘
                 │ Metrics & Logs
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  Collection Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Prometheus   │  │ Filebeat     │  │ Metricbeat   │      │
│  │ (Scraping)   │  │ (Log Ship)   │  │ (Metrics)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│Prometheus│ │Elasticsearch│ │AlertManager│
│ Storage  │ │ Storage  │ │ Routing  │
└────┬────┘ └────┬────┘ └──────┬───┘
     │           │             │
     ▼           ▼             ▼
┌──────────────────────────────────────┐
│      Visualization & Alerting        │
│  ┌──────────┐  ┌──────────┐         │
│  │ Grafana  │  │ Kibana   │         │
│  │Dashboards│  │  Logs    │         │
│  └──────────┘  └──────────┘         │
└──────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│      Notification Channels           │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Email │ │Slack │ │PagerDuty│     │
│  └──────┘ └──────┘ └──────┘        │
└──────────────────────────────────────┘
```

## Prerequisites

- Kubernetes cluster with 3+ nodes
- kubectl configured with cluster access
- Helm 3.x installed
- 50GB+ storage for metrics and logs
- SMTP server for email alerts (optional)
- Slack workspace (optional)
- PagerDuty account (optional)

## Quick Start

### 1. Deploy ELK Stack

```bash
# Create monitoring namespace
kubectl create namespace monitoring

# Deploy Elasticsearch
kubectl apply -f infrastructure/elk-stack.yaml -n monitoring

# Verify Elasticsearch
kubectl get pods -n monitoring -l app=elasticsearch
kubectl port-forward -n monitoring svc/elasticsearch 9200:9200

# Test connection
curl http://localhost:9200/_cluster/health
```

### 2. Deploy Prometheus

```bash
# Create Prometheus configuration
kubectl apply -f infrastructure/monitoring-stack.yaml -n monitoring

# Verify Prometheus
kubectl get pods -n monitoring -l app=prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Access Prometheus UI
# http://localhost:9090
```

### 3. Deploy Grafana

```bash
# Grafana is deployed with monitoring-stack.yaml
kubectl get pods -n monitoring -l app=grafana

# Port forward to Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000

# Access Grafana
# http://localhost:3000
# Default credentials: admin/admin
```

### 4. Deploy AlertManager

```bash
# AlertManager is deployed with monitoring-stack.yaml
kubectl get pods -n monitoring -l app=alertmanager

# Port forward to AlertManager
kubectl port-forward -n monitoring svc/alertmanager 9093:9093

# Access AlertManager UI
# http://localhost:9093
```

## Configuration

### Prometheus Configuration

Key metrics to scrape:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'education-engine'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - education
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
```

### AlertManager Configuration

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  routes:
    - match:
        severity: critical
      receiver: 'critical'
      continue: true
    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'critical'
    slack_configs:
      - channel: '#critical-alerts'
        title: 'CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'

  - name: 'warning'
    slack_configs:
      - channel: '#warnings'
        title: 'Warning: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

### Alert Rules

Key alerts to configure:

```yaml
groups:
  - name: education-engine
    interval: 30s
    rules:
      # API Availability
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # Database
      - alert: DatabaseConnectionPoolExhausted
        expr: pg_stat_activity_count > 450
        for: 5m
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "{{ $value }} connections in use"

      - alert: DatabaseReplicationLag
        expr: pg_replication_lag_bytes > 1073741824
        for: 5m
        annotations:
          summary: "Database replication lag detected"
          description: "Lag is {{ $value | humanize }} bytes"

      # Cache
      - alert: RedisCacheDown
        expr: up{job="redis"} == 0
        for: 1m
        annotations:
          summary: "Redis cache is down"
          description: "Redis instance is not responding"

      - alert: LowCacheHitRate
        expr: redis_keyspace_hits_total / (redis_keyspace_hits_total + redis_keyspace_misses_total) < 0.7
        for: 10m
        annotations:
          summary: "Low Redis cache hit rate"
          description: "Cache hit rate is {{ $value | humanizePercentage }}"

      # Revenue Metrics
      - alert: LowConversionRate
        expr: conversion_rate < 0.30
        for: 1h
        annotations:
          summary: "Conversion rate below target"
          description: "Current conversion rate: {{ $value | humanizePercentage }}"

      - alert: PaymentProcessingFailure
        expr: rate(payment_failures_total[5m]) > 0.1
        for: 5m
        annotations:
          summary: "High payment processing failure rate"
          description: "Failure rate: {{ $value | humanizePercentage }}"

      # Performance
      - alert: HighAPILatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        annotations:
          summary: "High API latency detected"
          description: "P95 latency: {{ $value }}s"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        annotations:
          summary: "High memory usage"
          description: "Memory usage: {{ $value | humanizePercentage }}"

      # Availability
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
        for: 5m
        annotations:
          summary: "Pod is crash looping"
          description: "Pod {{ $labels.pod }} is restarting frequently"

      - alert: NodeNotReady
        expr: kube_node_status_condition{condition="Ready",status="true"} == 0
        for: 5m
        annotations:
          summary: "Kubernetes node not ready"
          description: "Node {{ $labels.node }} is not ready"
```

## Grafana Dashboards

### Pre-built Dashboards

1. **Education Engine Overview**
   - API request rate
   - Error rate
   - Response time (p50, p95, p99)
   - Active users
   - Conversion rate

2. **Database Performance**
   - Connection count
   - Query latency
   - Replication lag
   - Cache hit rate
   - Disk usage

3. **Revenue Metrics**
   - Daily revenue
   - Conversion funnel
   - Payment success rate
   - Customer lifetime value
   - Churn rate

4. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic
   - Pod restarts

### Creating Custom Dashboards

```bash
# Access Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000

# Login: admin/admin
# Create new dashboard
# Add panels with PromQL queries
```

## Logging

### Elasticsearch Configuration

```bash
# Create index template
curl -X PUT "localhost:9200/_index_template/education-logs" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["education-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "education-policy",
      "index.lifecycle.rollover_alias": "education-logs"
    },
    "mappings": {
      "properties": {
        "timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "service": { "type": "keyword" },
        "message": { "type": "text" },
        "trace_id": { "type": "keyword" },
        "user_id": { "type": "keyword" }
      }
    }
  }
}
'
```

### Kibana Log Analysis

```bash
# Port forward to Kibana
kubectl port-forward -n monitoring svc/kibana 5601:5601

# Access Kibana
# http://localhost:5601

# Create index pattern: education-*
# Explore logs in Discover
# Create visualizations
# Build dashboards
```

## Alerting Channels

### Slack Integration

```bash
# 1. Create Slack webhook
# Go to https://api.slack.com/apps
# Create new app
# Enable Incoming Webhooks
# Create webhook URL

# 2. Update AlertManager configuration
kubectl set env deployment/alertmanager \
  SLACK_WEBHOOK_URL='https://hooks.slack.com/services/YOUR/WEBHOOK/URL' \
  -n monitoring
```

### Email Integration

```bash
# 1. Configure SMTP in AlertManager
kubectl create secret generic alertmanager-smtp \
  --from-literal=smtp-host=smtp.gmail.com \
  --from-literal=smtp-port=587 \
  --from-literal=smtp-user=your-email@gmail.com \
  --from-literal=smtp-password=your-app-password \
  -n monitoring

# 2. Update AlertManager configuration with email receiver
```

### PagerDuty Integration

```bash
# 1. Get PagerDuty service key
# Go to https://www.pagerduty.com
# Create service
# Get integration key

# 2. Update AlertManager configuration
kubectl set env deployment/alertmanager \
  PAGERDUTY_SERVICE_KEY='YOUR_SERVICE_KEY' \
  -n monitoring
```

## Monitoring Best Practices

### Key Metrics to Monitor

**Application Metrics:**
- Request rate (requests/sec)
- Error rate (errors/sec)
- Response time (p50, p95, p99)
- Active connections
- Queue depth

**Business Metrics:**
- Conversion rate
- Revenue per user
- Customer lifetime value
- Churn rate
- Course completion rate

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network latency
- Pod restarts

**Database Metrics:**
- Connection count
- Query latency
- Replication lag
- Cache hit rate
- Disk usage

### Alert Severity Levels

**Critical (P1):**
- Service down
- Data loss
- Security breach
- Payment processing failure

**High (P2):**
- High error rate (>5%)
- High latency (>1s)
- Database replication lag
- Low conversion rate

**Medium (P3):**
- Elevated memory usage (>80%)
- Slow queries
- Cache hit rate low
- Pod restarts

**Low (P4):**
- Informational alerts
- Scheduled maintenance
- Non-critical warnings

## Troubleshooting

### Prometheus Not Scraping Metrics

```bash
# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Visit http://localhost:9090/targets

# Check service discovery
kubectl get endpoints -n monitoring

# Check RBAC permissions
kubectl get clusterrole prometheus -o yaml
```

### Elasticsearch Disk Space Issues

```bash
# Check disk usage
curl -s http://localhost:9200/_cat/indices?v

# Delete old indices
curl -X DELETE "localhost:9200/education-logs-2024.01.*"

# Configure index lifecycle management
curl -X PUT "localhost:9200/_ilm/policy/education-policy" -H 'Content-Type: application/json' -d'
{
  "policy": "education-policy",
  "phases": {
    "hot": {
      "min_age": "0d",
      "actions": {
        "rollover": {
          "max_primary_store_size": "50GB"
        }
      }
    },
    "warm": {
      "min_age": "7d",
      "actions": {
        "set_priority": {
          "priority": 50
        }
      }
    },
    "delete": {
      "min_age": "30d",
      "actions": {
        "delete": {}
      }
    }
  }
}
'
```

### Alerts Not Firing

```bash
# Check AlertManager configuration
kubectl get configmap alertmanager-config -n monitoring -o yaml

# Check AlertManager logs
kubectl logs -n monitoring deployment/alertmanager

# Test alert rule
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Visit http://localhost:9090/alerts
```

## Maintenance

### Regular Tasks

- **Daily**: Review critical alerts
- **Weekly**: Check disk usage, review error logs
- **Monthly**: Analyze trends, optimize alert thresholds
- **Quarterly**: Update alert rules, review dashboards

### Backup and Recovery

```bash
# Backup Prometheus data
kubectl exec -n monitoring prometheus-0 -- tar czf /tmp/prometheus-backup.tar.gz /prometheus

# Backup Elasticsearch data
curl -X PUT "localhost:9200/_snapshot/backup" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/mnt/backup"
  }
}
'

# Create snapshot
curl -X PUT "localhost:9200/_snapshot/backup/snapshot-1"
```

## Performance Tuning

### Prometheus Optimization

```yaml
# Increase retention
--storage.tsdb.retention.time=30d
--storage.tsdb.retention.size=50GB

# Increase scrape timeout
global:
  scrape_timeout: 30s

# Reduce cardinality
metric_relabel_configs:
  - source_labels: [__name__]
    regex: 'container_network_tcp_usage_total|container_network_udp_usage_total'
    action: drop
```

### Elasticsearch Optimization

```bash
# Increase heap size
kubectl set env statefulset/elasticsearch \
  ES_JAVA_OPTS="-Xms4g -Xmx4g" \
  -n monitoring

# Increase refresh interval
curl -X PUT "localhost:9200/education-logs/_settings" -H 'Content-Type: application/json' -d'
{
  "index": {
    "refresh_interval": "30s"
  }
}
'
```

## References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [AlertManager Documentation](https://prometheus.io/docs/alerting/latest/overview/)
- [Kubernetes Monitoring](https://kubernetes.io/docs/tasks/debug-application-cluster/resource-metrics-pipeline/)
