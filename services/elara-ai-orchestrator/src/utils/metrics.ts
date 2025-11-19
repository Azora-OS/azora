export class ElaraMetrics {
  private metrics = {
    requestsTotal: 0,
    requestsSuccess: 0,
    requestsError: 0,
    averageLatency: 0,
    uptime: process.uptime()
  };

  incrementRequests() {
    this.metrics.requestsTotal++;
  }

  incrementSuccess() {
    this.metrics.requestsSuccess++;
  }

  incrementError() {
    this.metrics.requestsError++;
  }

  updateLatency(latency: number) {
    this.metrics.averageLatency = (this.metrics.averageLatency + latency) / 2;
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: process.uptime(),
      errorRate: this.metrics.requestsTotal > 0 ? 
        this.metrics.requestsError / this.metrics.requestsTotal : 0,
      successRate: this.metrics.requestsTotal > 0 ? 
        this.metrics.requestsSuccess / this.metrics.requestsTotal : 0
    };
  }
}