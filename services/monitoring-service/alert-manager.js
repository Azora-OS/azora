// Task 10: Alert Threshold Tuning
const EventEmitter = require('events');

class AlertManager extends EventEmitter {
  constructor() {
    super();
    this.thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      disk: { warning: 85, critical: 95 },
      response_time: { warning: 1000, critical: 5000 },
      error_rate: { warning: 5, critical: 10 }
    };
    this.slos = {
      availability: 99.9,
      response_time: 500,
      error_rate: 1
    };
  }

  checkThresholds(metrics) {
    const alerts = [];
    
    Object.entries(metrics).forEach(([metric, value]) => {
      const threshold = this.thresholds[metric];
      if (!threshold) return;
      
      if (value >= threshold.critical) {
        alerts.push({
          level: 'critical',
          metric,
          value,
          threshold: threshold.critical,
          message: `${metric} critical: ${value}% >= ${threshold.critical}%`
        });
      } else if (value >= threshold.warning) {
        alerts.push({
          level: 'warning',
          metric,
          value,
          threshold: threshold.warning,
          message: `${metric} warning: ${value}% >= ${threshold.warning}%`
        });
      }
    });
    
    alerts.forEach(alert => this.emit('alert', alert));
    return alerts;
  }

  updateThreshold(metric, level, value) {
    if (this.thresholds[metric]) {
      this.thresholds[metric][level] = value;
    }
  }
}

module.exports = AlertManager;