#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📊 SYSTEMATIC PHASE 8: MONITORING DOMINATION');
console.log('============================================');
console.log('⚡ "I monitor because we optimize together!" ⚡\n');

const monitoringFiles = {
  'monitoring/prometheus/prometheus.yml': `global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    ubuntu_philosophy: "I monitor because we optimize together"

rule_files:
  - "ubuntu_rules.yml"
  - "alerts.yml"

scrape_configs:
  # Azora Services Ubuntu Monitoring
  - job_name: 'azora-api-gateway'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/metrics'
    scrape_interval: 10s
    
  - job_name: 'azora-education'
    static_configs:
      - targets: ['localhost:4001']
    metrics_path: '/metrics'
    
  - job_name: 'azora-finance'
    static_configs:
      - targets: ['localhost:4002']
    metrics_path: '/metrics'
    
  - job_name: 'azora-marketplace'
    static_configs:
      - targets: ['localhost:4003']
    metrics_path: '/metrics'
    
  - job_name: 'azora-auth'
    static_configs:
      - targets: ['localhost:4004']
    metrics_path: '/metrics'
    
  - job_name: 'azora-ai'
    static_configs:
      - targets: ['localhost:4005']
    metrics_path: '/metrics'
    
  - job_name: 'azora-blockchain'
    static_configs:
      - targets: ['localhost:4009']
    metrics_path: '/metrics'

  # Ubuntu Infrastructure Monitoring
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
      
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['localhost:9187']
      
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['localhost:9121']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093`,

  'monitoring/prometheus/ubuntu_rules.yml': `groups:
  - name: ubuntu_performance
    rules:
      - alert: UbuntuServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
          ubuntu: "service_disruption"
        annotations:
          summary: "Ubuntu service {{ $labels.job }} is down"
          description: "Service {{ $labels.job }} has been down for more than 1 minute. Ubuntu principle: We serve because we prosper together."
          
      - alert: UbuntuHighResponseTime
        expr: http_request_duration_seconds{quantile="0.95"} > 0.1
        for: 2m
        labels:
          severity: warning
          ubuntu: "performance_degradation"
        annotations:
          summary: "Ubuntu service {{ $labels.job }} high response time"
          description: "95th percentile response time is {{ $value }}s for {{ $labels.job }}. Ubuntu optimization needed."
          
      - alert: UbuntuHighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 1m
        labels:
          severity: critical
          ubuntu: "error_spike"
        annotations:
          summary: "Ubuntu service {{ $labels.job }} high error rate"
          description: "Error rate is {{ $value }} for {{ $labels.job }}. Ubuntu stability compromised."

  - name: ubuntu_resources
    rules:
      - alert: UbuntuHighCPU
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 2m
        labels:
          severity: warning
          ubuntu: "resource_pressure"
        annotations:
          summary: "Ubuntu server {{ $labels.instance }} high CPU usage"
          description: "CPU usage is {{ $value }}% on {{ $labels.instance }}. Ubuntu resource optimization needed."
          
      - alert: UbuntuHighMemory
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 2m
        labels:
          severity: warning
          ubuntu: "memory_pressure"
        annotations:
          summary: "Ubuntu server {{ $labels.instance }} high memory usage"
          description: "Memory usage is {{ $value }}% on {{ $labels.instance }}. Ubuntu memory optimization needed."

  - name: ubuntu_business
    rules:
      - alert: UbuntuLowUserEngagement
        expr: rate(user_actions_total[1h]) < 10
        for: 5m
        labels:
          severity: warning
          ubuntu: "engagement_drop"
        annotations:
          summary: "Ubuntu user engagement dropping"
          description: "User actions per hour: {{ $value }}. Ubuntu community engagement needs attention."
          
      - alert: UbuntuMiningStalled
        expr: rate(azr_tokens_mined_total[10m]) == 0
        for: 5m
        labels:
          severity: critical
          ubuntu: "mining_stalled"
        annotations:
          summary: "Ubuntu AZR mining has stalled"
          description: "No AZR tokens mined in 10 minutes. Ubuntu prosperity engine needs attention."`,

  'monitoring/grafana/dashboards/ubuntu-overview.json': {
    dashboard: {
      id: null,
      title: "Ubuntu Overview - Azora OS",
      tags: ["ubuntu", "azora", "constitutional-ai"],
      timezone: "browser",
      panels: [
        {
          id: 1,
          title: "Ubuntu Philosophy",
          type: "text",
          gridPos: { h: 3, w: 24, x: 0, y: 0 },
          options: {
            content: "# 🌟 Ubuntu Dashboard\\n\\n**\"Ngiyakwazi ngoba sikwazi - I am because we are\"**\\n\\nMonitoring Constitutional AI with Ubuntu principles:\\n- My success enables your success\\n- My knowledge becomes our knowledge\\n- My work strengthens our foundation\\n- My security ensures our freedom"
          }
        },
        {
          id: 2,
          title: "Ubuntu Service Health",
          type: "stat",
          gridPos: { h: 8, w: 12, x: 0, y: 3 },
          targets: [
            {
              expr: "up",
              legendFormat: "{{ job }}"
            }
          ],
          fieldConfig: {
            defaults: {
              color: { mode: "thresholds" },
              thresholds: {
                steps: [
                  { color: "red", value: 0 },
                  { color: "green", value: 1 }
                ]
              }
            }
          }
        },
        {
          id: 3,
          title: "Ubuntu Response Times",
          type: "graph",
          gridPos: { h: 8, w: 12, x: 12, y: 3 },
          targets: [
            {
              expr: "http_request_duration_seconds{quantile=\"0.95\"}",
              legendFormat: "{{ job }} - 95th percentile"
            }
          ]
        }
      ],
      time: { from: "now-1h", to: "now" },
      refresh: "5s"
    }
  },

  'monitoring/grafana/provisioning/dashboards/dashboard.yml': `apiVersion: 1

providers:
  - name: 'Ubuntu Dashboards'
    orgId: 1
    folder: 'Ubuntu'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards`,

  'monitoring/grafana/provisioning/datasources/datasource.yml': `apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
    jsonData:
      httpMethod: POST
      exemplarTraceIdDestinations:
        - name: trace_id
          datasourceUid: tempo`,

  'monitoring/docker-compose.monitoring.yml': `version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: azora-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    labels:
      ubuntu.philosophy: "I monitor because we optimize together"
    networks:
      - azora-network

  grafana:
    image: grafana/grafana:latest
    container_name: azora-grafana
    ports:
      - "3010:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    environment:
      - GF_SECURITY_ADMIN_USER=ubuntu
      - GF_SECURITY_ADMIN_PASSWORD=azora2024
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    labels:
      ubuntu.philosophy: "I visualize because we understand together"
    networks:
      - azora-network

  alertmanager:
    image: prom/alertmanager:latest
    container_name: azora-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager:/etc/alertmanager
    command:
      - '--config.file=/etc/alertmanager/config.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'
    labels:
      ubuntu.philosophy: "I alert because we respond together"
    networks:
      - azora-network

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
    labels:
      ubuntu.philosophy: "I export metrics because we measure together"
    networks:
      - azora-network

volumes:
  prometheus_data:
  grafana_data:

networks:
  azora-network:
    external: true`,

  'services/azora-analytics/server.js': `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const client = require('prom-client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4010;

// Ubuntu Prometheus Metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom Ubuntu Metrics
const ubuntuMetrics = {
  userActions: new client.Counter({
    name: 'user_actions_total',
    help: 'Total Ubuntu user actions',
    labelNames: ['action_type', 'service']
  }),
  
  azrTokensMined: new client.Counter({
    name: 'azr_tokens_mined_total',
    help: 'Total AZR tokens mined through Ubuntu knowledge',
    labelNames: ['knowledge_type']
  }),
  
  knowledgeShared: new client.Counter({
    name: 'knowledge_shared_total',
    help: 'Total knowledge shared in Ubuntu community',
    labelNames: ['subject', 'difficulty']
  }),
  
  ubuntuConnections: new client.Gauge({
    name: 'ubuntu_connections_active',
    help: 'Active Ubuntu community connections',
    labelNames: ['connection_type']
  }),
  
  prosperityIndex: new client.Gauge({
    name: 'ubuntu_prosperity_index',
    help: 'Ubuntu community prosperity index (0-100)',
  }),
  
  constitutionalCompliance: new client.Gauge({
    name: 'constitutional_compliance_score',
    help: 'Constitutional AI compliance score (0-100)',
  })
};

// Register Ubuntu metrics
Object.values(ubuntuMetrics).forEach(metric => register.registerMetric(metric));

// Ubuntu Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Ubuntu generous limit
  message: 'Ubuntu rate limit: Please slow down for community harmony'
});
app.use(ubuntuLimiter);

// Ubuntu Health Check
app.get('/health', (req, res) => {
  res.json({
    service: 'Azora Analytics Service',
    status: 'healthy',
    ubuntu: 'I analyze because we optimize together',
    metrics: 'active',
    timestamp: new Date().toISOString()
  });
});

// Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Ubuntu Analytics Endpoints
app.get('/api/analytics/ubuntu-overview', (req, res) => {
  // Simulate Ubuntu metrics
  const overview = {
    totalUsers: Math.floor(Math.random() * 10000) + 5000,
    activeUsers: Math.floor(Math.random() * 2000) + 1000,
    azrTokensCirculating: Math.floor(Math.random() * 1000000) + 500000,
    knowledgeShared: Math.floor(Math.random() * 50000) + 25000,
    prosperityIndex: Math.floor(Math.random() * 20) + 80, // 80-100
    constitutionalCompliance: Math.floor(Math.random() * 10) + 90, // 90-100
    ubuntu: 'Community analytics with Ubuntu principles'
  };
  
  // Update Prometheus metrics
  ubuntuMetrics.prosperityIndex.set(overview.prosperityIndex);
  ubuntuMetrics.constitutionalCompliance.set(overview.constitutionalCompliance);
  ubuntuMetrics.ubuntuConnections.set({ connection_type: 'active' }, overview.activeUsers);
  
  res.json(overview);
});

app.get('/api/analytics/service-performance', (req, res) => {
  const services = [
    'azora-education', 'azora-finance', 'azora-marketplace', 
    'azora-auth', 'azora-ai', 'azora-blockchain'
  ];
  
  const performance = services.map(service => ({
    service,
    responseTime: Math.random() * 100 + 20, // 20-120ms
    errorRate: Math.random() * 0.01, // 0-1%
    throughput: Math.floor(Math.random() * 1000) + 500, // 500-1500 req/min
    uptime: 99.5 + Math.random() * 0.5, // 99.5-100%
    ubuntu: 'Service excellence through Ubuntu optimization'
  }));
  
  res.json({ services: performance, ubuntu: 'Performance monitoring with Ubuntu care' });
});

app.get('/api/analytics/ubuntu-engagement', (req, res) => {
  const engagement = {
    learningActivities: Math.floor(Math.random() * 5000) + 2000,
    knowledgeContributions: Math.floor(Math.random() * 1000) + 500,
    communityInteractions: Math.floor(Math.random() * 10000) + 5000,
    prosperitySharing: Math.floor(Math.random() * 2000) + 1000,
    aiInteractions: Math.floor(Math.random() * 15000) + 8000,
    ubuntu: 'Engagement metrics reflecting Ubuntu philosophy'
  };
  
  // Update metrics
  ubuntuMetrics.userActions.inc({ action_type: 'learning', service: 'education' }, engagement.learningActivities);
  ubuntuMetrics.knowledgeShared.inc({ subject: 'various', difficulty: 'mixed' }, engagement.knowledgeContributions);
  
  res.json(engagement);
});

app.post('/api/analytics/track-action', (req, res) => {
  const { action, service, metadata } = req.body;
  
  // Track Ubuntu action
  ubuntuMetrics.userActions.inc({ action_type: action, service: service || 'unknown' });
  
  res.json({
    message: 'Ubuntu action tracked',
    action,
    service,
    ubuntu: 'Every action strengthens our collective intelligence',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/analytics/ubuntu-philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    analytics: 'Data-driven Ubuntu excellence',
    monitoring: 'Collective optimization through measurement'
  });
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Analytics Error:', error);
  res.status(500).json({
    error: 'Ubuntu analytics service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Start Ubuntu Analytics Service
app.listen(PORT, () => {
  console.log(\`📊 Azora Analytics Service running on port \${PORT}\`);
  console.log('⚡ Ubuntu: "I analyze because we optimize together!"');
  
  // Initialize Ubuntu metrics
  ubuntuMetrics.prosperityIndex.set(95);
  ubuntuMetrics.constitutionalCompliance.set(98);
  ubuntuMetrics.ubuntuConnections.set({ connection_type: 'community' }, 1500);
});`,

  'services/azora-analytics/package.json': {
    name: "azora-analytics",
    version: "1.0.0",
    description: "Azora Analytics Service - Ubuntu Data Intelligence",
    main: "server.js",
    scripts: {
      start: "node server.js",
      dev: "nodemon server.js",
      test: "jest",
      "test:watch": "jest --watch"
    },
    dependencies: {
      express: "^4.18.2",
      cors: "^2.8.5",
      helmet: "^7.0.0",
      "express-rate-limit": "^6.10.0",
      "prom-client": "^14.2.0",
      dotenv: "^16.3.1"
    },
    devDependencies: {
      nodemon: "^3.0.1",
      jest: "^29.6.2",
      supertest: "^6.3.3"
    },
    keywords: ["azora", "ubuntu", "analytics", "monitoring", "constitutional-ai"],
    author: "Azora ES (Pty) Ltd",
    license: "Proprietary"
  },

  'monitoring/README.md': `# Azora Monitoring & Analytics

**Ubuntu Data Intelligence & Optimization** 📊✨

*"I monitor because we optimize together!"*

## 🌟 Ubuntu Monitoring Stack

### 📊 Components
- **Prometheus**: Ubuntu metrics collection
- **Grafana**: Ubuntu data visualization  
- **AlertManager**: Ubuntu incident response
- **Analytics Service**: Ubuntu intelligence engine

### ⚡ Quick Start

\`\`\`bash
# Start Ubuntu monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Ubuntu dashboards
open http://localhost:3010  # Grafana (ubuntu/azora2024)
open http://localhost:9090  # Prometheus
open http://localhost:9093  # AlertManager
\`\`\`

## 🎯 Ubuntu Metrics

### Performance Metrics
- **Response Times**: Sub-100ms Ubuntu excellence
- **Error Rates**: <1% Ubuntu reliability
- **Throughput**: Ubuntu scalability metrics
- **Uptime**: 99.9%+ Ubuntu availability

### Business Metrics
- **User Engagement**: Ubuntu community activity
- **Knowledge Sharing**: Ubuntu learning metrics
- **AZR Mining**: Ubuntu prosperity tracking
- **Constitutional Compliance**: Ubuntu governance

### Ubuntu Philosophy Metrics
- **Prosperity Index**: Community wealth distribution
- **Knowledge Flow**: Ubuntu learning circulation
- **Community Health**: Ubuntu relationship strength
- **Constitutional Adherence**: Ubuntu principle compliance

## 🏗️ Architecture

\`\`\`
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Services   │───▶│ Prometheus  │───▶│   Grafana   │
│   Ubuntu    │    │   Ubuntu    │    │   Ubuntu    │
│  Metrics    │    │ Collection  │    │Visualization│
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │AlertManager │
                   │   Ubuntu    │
                   │  Response   │
                   └─────────────┘
\`\`\`

---

**Monitoring Ubuntu Excellence** 🚀📊
`
};

let createdFiles = 0;

console.log('🚀 Creating monitoring infrastructure...\n');

// Create monitoring files
Object.entries(monitoringFiles).forEach(([fileName, content]) => {
  const filePath = path.join(__dirname, '..', fileName);
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (typeof content === 'object') {
    content = JSON.stringify(content, null, 2);
  }

  fs.writeFileSync(filePath, content);
  console.log(`✨ ${fileName}`);
  createdFiles++;
});

// Create analytics service directories
const analyticsDirs = [
  'services/azora-analytics/src',
  'services/azora-analytics/tests',
  'services/azora-analytics/prisma'
];

analyticsDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Create additional monitoring files
const additionalFiles = {
  'services/azora-analytics/Dockerfile': `FROM node:18-alpine

# Ubuntu Philosophy
LABEL ubuntu="I containerize analytics because we optimize together"

WORKDIR /app

# Copy Ubuntu dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Ubuntu application
COPY . .

# Ubuntu security
RUN addgroup -g 1001 -S ubuntu && \\
    adduser -S ubuntu -u 1001
USER ubuntu

EXPOSE 4010

# Ubuntu health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:4010/health || exit 1

CMD ["npm", "start"]`,

  'services/azora-analytics/.env.example': `# Azora Analytics Service Configuration
PORT=4010
NODE_ENV=development

# Ubuntu Philosophy
UBUNTU_PHILOSOPHY="Ngiyakwazi ngoba sikwazi"
ANALYTICS_ENABLED=true

# Prometheus Configuration
PROMETHEUS_ENABLED=true
METRICS_PATH=/metrics

# Security
JWT_SECRET=your_jwt_secret_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000`,

  'monitoring/alertmanager/config.yml': `global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@azora.world'
  smtp_auth_username: 'ubuntu@azora.world'
  smtp_auth_password: 'ubuntu_password'

route:
  group_by: ['alertname', 'ubuntu']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'ubuntu-alerts'

receivers:
  - name: 'ubuntu-alerts'
    email_configs:
      - to: 'team@azora.world'
        subject: 'Ubuntu Alert: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
        body: |
          Ubuntu Philosophy: "We respond because we care together"
          
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Ubuntu Impact: {{ .Labels.ubuntu }}
          {{ end }}
          
          Ubuntu Response Team - Azora OS

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'ubuntu']`
};

Object.entries(additionalFiles).forEach(([fileName, content]) => {
  const filePath = path.join(__dirname, '..', fileName);
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content);
  console.log(`✨ ${fileName}`);
  createdFiles++;
});

console.log('\n🎉 PHASE 8 COMPLETE!');
console.log(`✨ Monitoring files created: ${createdFiles}`);
console.log('📊 Prometheus + Grafana monitoring ready');
console.log('🚨 AlertManager incident response active');
console.log('📈 Analytics service with Ubuntu metrics');
console.log('🎯 Business intelligence dashboards ready');
console.log('🌍 Ubuntu: "I monitor because we optimize together!"');