// Task 12: Custom Metrics Implementation
class CustomMetrics {
  constructor() {
    this.metrics = new Map();
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
  }

  // Business metrics
  recordUserRegistration(userId, source = 'web') {
    this.incrementCounter('user_registrations_total', { source });
    this.setGauge('active_users_count', this.getActiveUsersCount());
  }

  recordCourseEnrollment(courseId, userId, price = 0) {
    this.incrementCounter('course_enrollments_total', { course_id: courseId });
    this.recordHistogram('enrollment_price', price);
    this.setGauge('total_revenue', this.getTotalRevenue() + price);
  }

  recordPaymentTransaction(amount, currency, status) {
    this.incrementCounter('payment_transactions_total', { currency, status });
    if (status === 'success') {
      this.recordHistogram('payment_amount', amount);
    }
  }

  recordAPICall(endpoint, method, duration, status) {
    this.incrementCounter('api_requests_total', { endpoint, method, status });
    this.recordHistogram('api_request_duration', duration, { endpoint, method });
  }

  // Core metric operations
  incrementCounter(name, labels = {}) {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);
    
    this.updateMetric(name, 'counter', current + 1, labels);
  }

  setGauge(name, value, labels = {}) {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, value);
    
    this.updateMetric(name, 'gauge', value, labels);
  }

  recordHistogram(name, value, labels = {}) {
    const key = this.getMetricKey(name, labels);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }
    
    this.histograms.get(key).push({
      value,
      timestamp: Date.now()
    });
    
    this.updateMetric(name, 'histogram', value, labels);
  }

  getMetricKey(name, labels) {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  updateMetric(name, type, value, labels) {
    const metric = {
      name,
      type,
      value,
      labels,
      timestamp: Date.now()
    };
    
    this.metrics.set(`${name}_${Date.now()}`, metric);
  }

  getMetrics() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(this.histograms)
    };
  }

  // Business logic helpers
  getActiveUsersCount() {
    // Placeholder - would query actual user data
    return this.counters.get('user_registrations_total{}') || 0;
  }

  getTotalRevenue() {
    // Placeholder - would calculate from payment data
    let total = 0;
    for (const [key, values] of this.histograms) {
      if (key.includes('payment_amount')) {
        total += values.reduce((sum, entry) => sum + entry.value, 0);
      }
    }
    return total;
  }

  // Prometheus format export
  exportPrometheus() {
    let output = '';
    
    // Export counters
    for (const [key, value] of this.counters) {
      output += `${key} ${value}\n`;
    }
    
    // Export gauges
    for (const [key, value] of this.gauges) {
      output += `${key} ${value}\n`;
    }
    
    return output;
  }
}

module.exports = CustomMetrics;