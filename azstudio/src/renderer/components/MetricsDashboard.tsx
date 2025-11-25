import React, { useState, useEffect } from 'react';
import './MetricsDashboard.css';

interface ServiceMetrics {
  serviceName: string;
  responseTime: { p50: number; p95: number; p99: number; avg: number };
  throughput: { requestsPerSecond: number; requestsPerMinute: number };
  errorRate: { percentage: number; count: number; total: number };
  health: 'healthy' | 'degraded' | 'down';
  uptime: number;
  lastUpdated: Date;
}

interface CustomMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels?: Record<string, string>;
  description?: string;
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  service: string;
  timestamp: Date;
  resolved: boolean;
}

interface DashboardData {
  services: ServiceMetrics[];
  customMetrics: CustomMetric[];
  alerts: Alert[];
  timeRange: { start: Date; end: Date };
}

export const MetricsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (isMonitoring) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, refreshInterval]);

  const loadDashboardData = async () => {
    try {
      const data = await window.electron.invoke('metrics:getDashboard');
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const startMonitoring = async () => {
    try {
      const services = dashboardData?.services.map(s => s.serviceName) || [];
      await window.electron.invoke('metrics:startMonitoring', services, refreshInterval);
      setIsMonitoring(true);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const stopMonitoring = async () => {
    try {
      await window.electron.invoke('metrics:stopMonitoring');
      setIsMonitoring(false);
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await window.electron.invoke('metrics:resolveAlert', alertId);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getHealthColor = (health: string): string => {
    switch (health) {
      case 'healthy': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'info': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (!dashboardData) {
    return (
      <div className="metrics-dashboard">
        <div className="dashboard-header">
          <h2>Metrics Dashboard</h2>
          <button onClick={loadDashboardData} className="btn-primary">
            Load Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="metrics-dashboard">
      <div className="dashboard-header">
        <h2>Metrics Dashboard</h2>
        <div className="dashboard-controls">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="refresh-select"
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
          {isMonitoring ? (
            <button onClick={stopMonitoring} className="btn-danger">
              Stop Monitoring
            </button>
          ) : (
            <button onClick={startMonitoring} className="btn-primary">
              Start Monitoring
            </button>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {dashboardData.alerts.length > 0 && (
        <div className="alerts-section">
          <h3>Active Alerts</h3>
          <div className="alerts-list">
            {dashboardData.alerts.map(alert => (
              <div
                key={alert.id}
                className="alert-item"
                style={{ borderLeftColor: getSeverityColor(alert.severity) }}
              >
                <div className="alert-header">
                  <span className="alert-severity" style={{ color: getSeverityColor(alert.severity) }}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="alert-service">{alert.service}</span>
                  <span className="alert-time">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="alert-message">{alert.message}</div>
                <button onClick={() => resolveAlert(alert.id)} className="btn-small">
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Overview */}
      <div className="services-section">
        <h3>Services</h3>
        <div className="services-grid">
          {dashboardData.services.map(service => (
            <div
              key={service.serviceName}
              className={`service-card ${selectedService === service.serviceName ? 'selected' : ''}`}
              onClick={() => setSelectedService(service.serviceName)}
            >
              <div className="service-header">
                <h4>{service.serviceName}</h4>
                <div
                  className="health-indicator"
                  style={{ backgroundColor: getHealthColor(service.health) }}
                  title={service.health}
                />
              </div>

              <div className="service-metrics">
                <div className="metric">
                  <span className="metric-label">Response Time (P95)</span>
                  <span className="metric-value">{service.responseTime.p95.toFixed(0)}ms</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Throughput</span>
                  <span className="metric-value">
                    {service.throughput.requestsPerSecond.toFixed(1)} req/s
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Error Rate</span>
                  <span className="metric-value" style={{ color: service.errorRate.percentage > 5 ? '#ef4444' : 'inherit' }}>
                    {service.errorRate.percentage.toFixed(2)}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Uptime</span>
                  <span className="metric-value">{formatUptime(service.uptime)}</span>
                </div>
              </div>

              <div className="service-footer">
                <span className="last-updated">
                  Updated: {new Date(service.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Service View */}
      {selectedService && (
        <div className="service-details">
          <h3>{selectedService} - Detailed Metrics</h3>
          {(() => {
            const service = dashboardData.services.find(s => s.serviceName === selectedService);
            if (!service) return null;

            return (
              <div className="details-grid">
                <div className="detail-card">
                  <h4>Response Time Distribution</h4>
                  <div className="percentiles">
                    <div className="percentile">
                      <span>P50</span>
                      <span>{service.responseTime.p50.toFixed(0)}ms</span>
                    </div>
                    <div className="percentile">
                      <span>P95</span>
                      <span>{service.responseTime.p95.toFixed(0)}ms</span>
                    </div>
                    <div className="percentile">
                      <span>P99</span>
                      <span>{service.responseTime.p99.toFixed(0)}ms</span>
                    </div>
                    <div className="percentile">
                      <span>Avg</span>
                      <span>{service.responseTime.avg.toFixed(0)}ms</span>
                    </div>
                  </div>
                </div>

                <div className="detail-card">
                  <h4>Error Statistics</h4>
                  <div className="error-stats">
                    <div className="stat">
                      <span>Total Requests</span>
                      <span>{service.errorRate.total}</span>
                    </div>
                    <div className="stat">
                      <span>Errors</span>
                      <span>{service.errorRate.count}</span>
                    </div>
                    <div className="stat">
                      <span>Error Rate</span>
                      <span>{service.errorRate.percentage.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Custom Metrics */}
      {dashboardData.customMetrics.length > 0 && (
        <div className="custom-metrics-section">
          <h3>Custom Metrics</h3>
          <div className="custom-metrics-grid">
            {dashboardData.customMetrics.map((metric, index) => (
              <div key={index} className="custom-metric-card">
                <h4>{metric.name}</h4>
                <div className="metric-value-large">{metric.value.toFixed(2)}</div>
                <div className="metric-type">{metric.type}</div>
                {metric.labels && (
                  <div className="metric-labels">
                    {Object.entries(metric.labels).map(([key, value]) => (
                      <span key={key} className="label">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
