import React from 'react';

const MetricsDashboard: React.FC = () => {
  return (
    <div className="metrics-dashboard">
      <h2>System Metrics</h2>
      <div className="metrics-grid">
        <div className="metric-card">
            <h3>CPU Usage</h3>
            <p>--%</p>
        </div>
        <div className="metric-card">
            <h3>Memory</h3>
            <p>-- MB</p>
        </div>
      </div>
      <div className="monitoring-status">
        <p>Monitoring is currently disabled.</p>
      </div>
    </div>
  );
};

export default MetricsDashboard;
