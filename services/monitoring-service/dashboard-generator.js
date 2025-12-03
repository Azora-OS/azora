// Task 13: Advanced Dashboard Creation
class DashboardGenerator {
  constructor(metricsService, alertManager) {
    this.metrics = metricsService;
    this.alerts = alertManager;
  }

  // System Health Dashboard
  generateSystemHealthDashboard() {
    return {
      title: 'Azora OS - System Health',
      panels: [
        {
          title: 'Service Status',
          type: 'stat',
          targets: ['up{job="azora-services"}'],
          thresholds: [
            { color: 'red', value: 0 },
            { color: 'yellow', value: 0.8 },
            { color: 'green', value: 0.95 }
          ]
        },
        {
          title: 'CPU Usage',
          type: 'graph',
          targets: ['cpu_usage_percent'],
          yAxis: { max: 100, unit: 'percent' }
        },
        {
          title: 'Memory Usage',
          type: 'graph',
          targets: ['memory_usage_percent'],
          yAxis: { max: 100, unit: 'percent' }
        },
        {
          title: 'Active Alerts',
          type: 'table',
          targets: ['ALERTS{alertstate="firing"}']
        }
      ]
    };
  }

  // Business Metrics Dashboard
  generateBusinessDashboard() {
    return {
      title: 'Azora OS - Business Metrics',
      panels: [
        {
          title: 'User Registrations',
          type: 'stat',
          targets: ['increase(user_registrations_total[24h])'],
          unit: 'short'
        },
        {
          title: 'Course Enrollments',
          type: 'graph',
          targets: ['rate(course_enrollments_total[5m])'],
          unit: 'ops'
        },
        {
          title: 'Revenue',
          type: 'stat',
          targets: ['total_revenue'],
          unit: 'currency'
        },
        {
          title: 'Payment Success Rate',
          type: 'gauge',
          targets: [
            'rate(payment_transactions_total{status="success"}[5m]) / rate(payment_transactions_total[5m]) * 100'
          ],
          unit: 'percent'
        }
      ]
    };
  }

  // Performance Dashboard
  generatePerformanceDashboard() {
    return {
      title: 'Azora OS - Performance',
      panels: [
        {
          title: 'API Response Time',
          type: 'graph',
          targets: ['histogram_quantile(0.95, api_request_duration)'],
          unit: 'ms'
        },
        {
          title: 'Request Rate',
          type: 'graph',
          targets: ['rate(api_requests_total[5m])'],
          unit: 'ops'
        },
        {
          title: 'Error Rate',
          type: 'graph',
          targets: [
            'rate(api_requests_total{status=~"5.."}[5m]) / rate(api_requests_total[5m]) * 100'
          ],
          unit: 'percent'
        },
        {
          title: 'Database Connections',
          type: 'graph',
          targets: ['database_connections_active'],
          unit: 'short'
        }
      ]
    };
  }

  // Security Dashboard
  generateSecurityDashboard() {
    return {
      title: 'Azora OS - Security',
      panels: [
        {
          title: 'Failed Login Attempts',
          type: 'graph',
          targets: ['rate(auth_failures_total[5m])'],
          unit: 'ops'
        },
        {
          title: 'Suspicious Activity',
          type: 'table',
          targets: ['security_events{severity="high"}']
        },
        {
          title: 'Rate Limit Hits',
          type: 'graph',
          targets: ['rate(rate_limit_exceeded_total[5m])'],
          unit: 'ops'
        },
        {
          title: 'SSL Certificate Expiry',
          type: 'stat',
          targets: ['ssl_cert_expiry_days'],
          thresholds: [
            { color: 'red', value: 7 },
            { color: 'yellow', value: 30 },
            { color: 'green', value: 90 }
          ]
        }
      ]
    };
  }

  // Generate all dashboards
  generateAllDashboards() {
    return {
      system_health: this.generateSystemHealthDashboard(),
      business_metrics: this.generateBusinessDashboard(),
      performance: this.generatePerformanceDashboard(),
      security: this.generateSecurityDashboard()
    };
  }

  // Export dashboard as JSON (Grafana format)
  exportGrafanaDashboard(dashboard) {
    return {
      dashboard: {
        id: null,
        title: dashboard.title,
        tags: ['azora', 'monitoring'],
        timezone: 'browser',
        panels: dashboard.panels.map((panel, index) => ({
          id: index + 1,
          title: panel.title,
          type: panel.type,
          targets: panel.targets.map(target => ({
            expr: target,
            refId: 'A'
          })),
          fieldConfig: {
            defaults: {
              unit: panel.unit || 'short',
              thresholds: panel.thresholds || []
            }
          },
          gridPos: {
            h: 8,
            w: 12,
            x: (index % 2) * 12,
            y: Math.floor(index / 2) * 8
          }
        })),
        time: {
          from: 'now-1h',
          to: 'now'
        },
        refresh: '30s'
      },
      overwrite: true
    };
  }
}

module.exports = DashboardGenerator;