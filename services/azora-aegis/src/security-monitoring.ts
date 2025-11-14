import { EventEmitter } from 'events';

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  threats: number;
  activeUsers: number;
  timestamp: Date;
}

class SecurityMonitor extends EventEmitter {
  private metrics: SecurityMetrics = {
    totalRequests: 0,
    blockedRequests: 0,
    threats: 0,
    activeUsers: 0,
    timestamp: new Date(),
  };

  trackRequest(blocked: boolean = false) {
    this.metrics.totalRequests++;
    if (blocked) {
      this.metrics.blockedRequests++;
      this.emit('blocked', { timestamp: new Date() });
    }
  }

  trackThreat(severity: string) {
    this.metrics.threats++;
    this.emit('threat', { severity, timestamp: new Date() });
  }

  trackUser(userId: string) {
    this.metrics.activeUsers++;
  }

  getMetrics(): SecurityMetrics {
    return { ...this.metrics, timestamp: new Date() };
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      threats: 0,
      activeUsers: 0,
      timestamp: new Date(),
    };
  }
}

export const securityMonitor = new SecurityMonitor();

// Alert on high threat activity
securityMonitor.on('threat', (data) => {
  if (data.severity === 'CRITICAL') {
    console.error('[SECURITY ALERT] Critical threat detected:', data);
  }
});
