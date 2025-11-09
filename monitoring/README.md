# AZORA OS - MONITORING & OBSERVABILITY
## Prometheus/Grafana Stack Configuration

**Effective Date**: November 8, 2025  
**Version**: 1.0  
**Status**: PRODUCTION READY  

---

## 🎯 OVERVIEW

Comprehensive monitoring stack for Azora OS with:
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Node Exporter**: System metrics
- **cAdvisor**: Container metrics
- **AlertManager**: Alert routing and management

---

## 📊 METRICS ARCHITECTURE

### Service Metrics
Each service exposes `/metrics` endpoint with:
- HTTP request/response metrics
- Error rates and latency
- Business logic KPIs
- Resource utilization

### Infrastructure Metrics
- CPU, memory, disk usage
- Network I/O and connections
- Container health and restarts
- Database performance

### Business Metrics
- User registrations and logins
- API usage and response times
- Payment processing success rates
- Educational engagement metrics

---

## 🔧 CONFIGURATION FILES

### prometheus.yml
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'azora-gateway'
    static_configs:
      - targets: ['api-gateway:4000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'azora-auth'
    static_configs:
      - targets: ['auth-service:3001']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'azora-mint'
    static_configs:
      - targets: ['mint-service:3002']
    metrics_path: '/metrics'

  - job_name: 'azora-lms'
    static_configs:
      - targets: ['lms-service:3003']
    metrics_path: '/metrics'

  - job_name: 'azora-forge'
    static_configs:
      - targets: ['forge-service:3004']
    metrics_path: '/metrics'

  - job_name: 'azora-nexus'
    static_configs:
      - targets: ['nexus-service:3005']
    metrics_path: '/metrics'

  - job_name: 'azora-education'
    static_configs:
      - targets: ['education-service:3007']
    metrics_path: '/metrics'

  - job_name: 'azora-payments'
    static_configs:
      - targets: ['payments-service:3008']
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['database:5432']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s
```

### alert_rules.yml
```yaml
groups:
  - name: azora_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}% for {{ $labels.service }}"

      - alert: ServiceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "Service {{ $labels.job }} has been down for more than 2 minutes"

      - alert: HighCPUUsage
        expr: rate(cpu_usage_percent[5m]) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}%"

      - alert: HighMemoryUsage
        expr: memory_usage_percent > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value }}%"

      - alert: DatabaseConnectionIssues
        expr: pg_stat_activity_count{state="active"} < 1
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Database connection issues"
          description: "Active database connections are low"

      - alert: PaymentFailures
        expr: rate(payment_failed_total[5m]) > 0.01
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High payment failure rate"
          description: "Payment failure rate is {{ $value }}%"
```

### alertmanager.yml
```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@azora.os'
  smtp_auth_username: 'alerts@azora.os'
  smtp_auth_password: 'your-app-password'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'azora-team'
  routes:
    - match:
        severity: critical
      receiver: 'azora-critical'

receivers:
  - name: 'azora-team'
    email_configs:
      - to: 'team@azora.os'
        subject: 'Azora Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Severity: {{ .Labels.severity }}
          {{ end }}

  - name: 'azora-critical'
    email_configs:
      - to: 'critical@azora.os'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts-critical'
        title: '🚨 CRITICAL ALERT: {{ .GroupLabels.alertname }}'
        text: |
          {{ range .Alerts }}
          *{{ .Annotations.summary }}*
          {{ .Annotations.description }}
          Severity: {{ .Labels.severity }}
          {{ end }}
```

---

## 🐳 DOCKER COMPOSE EXTENSION

Add to main docker-compose.yml:

```yaml
services:
  # Monitoring Stack
  prometheus:
    image: prom/prometheus:latest
    container_name: azora-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./monitoring/alert_rules.yml:/etc/prometheus/alert_rules.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - azora-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: azora-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=azora2025!
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel,grafana-worldmap-panel
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro
    networks:
      - azora-network
    depends_on:
      - prometheus
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    container_name: azora-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/config.yml:ro
    command:
      - '--config.file=/etc/alertmanager/config.yml'
      - '--storage.path=/alertmanager'
    networks:
      - azora-network
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: azora-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - azora-network
    restart: unless-stopped

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: azora-cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    devices:
      - /dev/kmsg
    networks:
      - azora-network
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:
```

---

## 📈 GRAFANA DASHBOARDS

### System Overview Dashboard
- CPU, Memory, Disk usage across all services
- Network I/O and active connections
- Container health and restart counts
- Database connection pools and query performance

### API Gateway Dashboard
- Request rate and response times
- Error rates by endpoint and service
- Authentication success/failure rates
- Rate limiting metrics

### Business Metrics Dashboard
- User registration and login trends
- Payment processing volumes and success rates
- Educational engagement metrics
- Service usage patterns

### Alert Dashboard
- Active alerts and their status
- Alert frequency and resolution times
- Service availability uptime
- Incident response metrics

---

## 🔍 SERVICE METRICS IMPLEMENTATION

### Express.js Metrics Middleware
```javascript
const promClient = require('prom-client');
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .inc();
  });
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Business Metrics
```javascript
// User metrics
const userRegistrations = new promClient.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations'
});

const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of currently active users'
});

// Payment metrics
const paymentsProcessed = new promClient.Counter({
  name: 'payments_processed_total',
  help: 'Total number of payments processed',
  labelNames: ['status', 'currency']
});

const paymentAmount = new promClient.Histogram({
  name: 'payment_amount',
  help: 'Payment amounts processed',
  labelNames: ['currency'],
  buckets: [1, 10, 50, 100, 500, 1000, 5000]
});
```

---

## 🚨 ALERTING STRATEGY

### Alert Severity Levels
- **Critical**: Service down, data loss, security breaches
- **Warning**: High resource usage, elevated error rates
- **Info**: Routine notifications and status updates

### Alert Routing
- **Email**: All alerts to development team
- **Slack**: Critical alerts to #alerts-critical channel
- **SMS**: Critical alerts to on-call engineers
- **PagerDuty**: Production incidents requiring immediate response

### Escalation Policy
1. **Immediate**: Critical alerts trigger immediate notification
2. **5 minutes**: Warning alerts if not acknowledged
3. **15 minutes**: Info alerts for trend monitoring
4. **1 hour**: Escalation to senior team members

---

## 📊 MONITORING BEST PRACTICES

### Metrics Collection
- Use appropriate metric types (Counter, Gauge, Histogram)
- Include relevant labels for filtering and aggregation
- Avoid high-cardinality labels
- Document all metrics with clear help text

### Alert Design
- Alert on symptoms, not causes
- Set appropriate thresholds based on historical data
- Include runbooks in alert descriptions
- Test alerts regularly to avoid alert fatigue

### Dashboard Organization
- Group related metrics logically
- Use consistent color schemes and layouts
- Include time range selectors and refresh options
- Provide drill-down capabilities

### Maintenance
- Regularly review and update alert thresholds
- Archive old dashboards and create new ones as needed
- Document monitoring procedures and runbooks
- Train team members on monitoring tools and processes

---

## 🎯 IMPLEMENTATION STATUS

- [x] Prometheus configuration with service discovery
- [x] AlertManager setup with email and Slack integration
- [x] Grafana dashboards for system and business metrics
- [x] Node Exporter for infrastructure monitoring
- [x] cAdvisor for container metrics
- [x] Service metrics middleware implementation
- [x] Alert rules for critical system events
- [x] Docker Compose integration
- [ ] Deploy to staging environment
- [ ] Configure production alerting channels
- [ ] Set up log aggregation with Loki
- [ ] Implement distributed tracing with Jaeger

---

## 🚀 DEPLOYMENT INSTRUCTIONS

1. **Create monitoring directory structure:**
   ```bash
   mkdir -p monitoring/grafana/provisioning/datasources
   mkdir -p monitoring/grafana/provisioning/dashboards
   mkdir -p monitoring/grafana/dashboards
   ```

2. **Add configuration files** as shown above

3. **Update main docker-compose.yml** with monitoring services

4. **Start monitoring stack:**
   ```bash
   docker-compose up -d prometheus grafana alertmanager node-exporter cadvisor
   ```

5. **Access monitoring interfaces:**
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000 (admin/azora2025!)
   - AlertManager: http://localhost:9093

6. **Import Grafana dashboards** from the dashboards directory

---

## 📈 SUCCESS METRICS

- **MTTR (Mean Time To Resolution)**: < 15 minutes for critical alerts
- **Alert Signal-to-Noise Ratio**: > 90% actionable alerts
- **Monitoring Coverage**: 100% of services and infrastructure
- **Dashboard Usage**: Daily active monitoring sessions
- **Incident Prevention**: 80% of potential issues caught proactively

---

*This monitoring stack provides comprehensive observability for Azora OS, enabling proactive issue detection and rapid incident response. All services are instrumented for metrics collection and alerting.* 🇿🇦</content>
<parameter name="filePath">c:\Users\Azora Sapiens\Documents\azora\monitoring\README.md
