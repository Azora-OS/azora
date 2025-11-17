const { v4: uuidv4 } = require('uuid');
const { createLogger } = require('@azora/shared-services/logging');

class ShieldService {
  constructor() {
    this.logger = createLogger('ShieldService');
    this.threats = [];
    this.securityEvents = [];
    this.blockedIPs = new Set();
    this.threatPatterns = [
      { pattern: /(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP)\b.*\b(FROM|INTO|WHERE|SET)\b)/i, type: 'SQL_INJECTION', severity: 'HIGH' },
      { pattern: /(<script\b|javascript:|on\w+\s*=)/i, type: 'XSS', severity: 'HIGH' },
      { pattern: /\b(etc\/passwd|boot\.ini|win\.ini)\b/i, type: 'PATH_TRAVERSAL', severity: 'MEDIUM' },
      { pattern: /(union\s+select|select\s+\*|insert\s+into)/i, type: 'SQL_INJECTION', severity: 'HIGH' },
      { pattern: /(eval\(|exec\(|system\(|shell_exec\()/i, type: 'COMMAND_INJECTION', severity: 'CRITICAL' }
    ];
    this.rateLimits = new Map(); // For rate limiting
  }

  /**
   * Analyze incoming request for security threats
   */
  analyzeRequest(req) {
    const analysis = {
      id: uuidv4(),
      timestamp: new Date(),
      ip: this.extractIP(req),
      userAgent: req.get('User-Agent') || 'Unknown',
      method: req.method,
      url: req.url,
      threats: [],
      riskScore: 0
    };

    // Check for threat patterns in various parts of the request
    this.checkThreatPatterns(req, analysis);

    // Check rate limiting
    this.checkRateLimiting(analysis);

    // Calculate risk score
    analysis.riskScore = this.calculateRiskScore(analysis.threats);

    // Store security event
    this.securityEvents.push(analysis);

    // If high risk, log threat
    if (analysis.riskScore > 7) {
      this.threats.push(analysis);
      this.logger.warn(`High-risk request detected from ${analysis.ip}`, {
        riskScore: analysis.riskScore,
        threats: analysis.threats
      });
    }

    return analysis;
  }

  /**
   * Extract IP address from request
   */
  extractIP(req) {
    return req.ip ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           'Unknown';
  }

  /**
   * Check request for known threat patterns
   */
  checkThreatPatterns(req, analysis) {
    // Check query parameters
    for (const [key, value] of Object.entries(req.query || {})) {
      this.checkValueForThreats(value, key, analysis);
    }

    // Check body parameters
    for (const [key, value] of Object.entries(req.body || {})) {
      this.checkValueForThreats(value, key, analysis);
    }

    // Check headers
    for (const [key, value] of Object.entries(req.headers || {})) {
      this.checkValueForThreats(value, key, analysis);
    }

    // Check URL path
    this.checkValueForThreats(req.url, 'url', analysis);
  }

  /**
   * Check a value for threat patterns
   */
  checkValueForThreats(value, fieldName, analysis) {
    if (typeof value !== 'string') {
      return;
    }

    for (const pattern of this.threatPatterns) {
      if (pattern.pattern.test(value)) {
        analysis.threats.push({
          type: pattern.type,
          severity: pattern.severity,
          field: fieldName,
          value: value.substring(0, 100), // Limit length for logging
          pattern: pattern.pattern.toString()
        });
      }
    }
  }

  /**
   * Check rate limiting for IP
   */
  checkRateLimiting(analysis) {
    const ip = analysis.ip;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 100; // Max 100 requests per minute

    if (!this.rateLimits.has(ip)) {
      this.rateLimits.set(ip, {
        requests: [{ timestamp: now }],
        blocked: false
      });
      return;
    }

    const ipData = this.rateLimits.get(ip);

    // Remove old requests outside the window
    ipData.requests = ipData.requests.filter(req => now - req.timestamp < windowMs);

    // Add current request
    ipData.requests.push({ timestamp: now });

    // Check if limit exceeded
    if (ipData.requests.length > maxRequests) {
      ipData.blocked = true;
      this.blockedIPs.add(ip);

      analysis.threats.push({
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'MEDIUM',
        field: 'ip',
        value: ip,
        count: ipData.requests.length
      });
    }
  }

  /**
   * Calculate risk score based on threats
   */
  calculateRiskScore(threats) {
    let score = 0;

    for (const threat of threats) {
      switch (threat.severity) {
        case 'LOW':
          score += 1;
          break;
        case 'MEDIUM':
          score += 3;
          break;
        case 'HIGH':
          score += 5;
          break;
        case 'CRITICAL':
          score += 10;
          break;
      }
    }

    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Block an IP address
   */
  blockIP(ip) {
    this.blockedIPs.add(ip);
    this.logger.info(`IP address blocked: ${ip}`);
  }

  /**
   * Unblock an IP address
   */
  unblockIP(ip) {
    this.blockedIPs.delete(ip);
    this.logger.info(`IP address unblocked: ${ip}`);
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  /**
   * Get security events with filtering
   */
  getSecurityEvents(filters = {}) {
    let filteredEvents = [...this.securityEvents];

    // Apply filters
    if (filters.ip) {
      filteredEvents = filteredEvents.filter(event => event.ip === filters.ip);
    }

    if (filters.minRiskScore) {
      filteredEvents = filteredEvents.filter(event => event.riskScore >= filters.minRiskScore);
    }

    if (filters.threatType) {
      filteredEvents = filteredEvents.filter(event =>
        event.threats.some(threat => threat.type === filters.threatType)
      );
    }

    if (filters.startDate) {
      filteredEvents = filteredEvents.filter(event => event.timestamp >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filteredEvents = filteredEvents.filter(event => event.timestamp <= new Date(filters.endDate));
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp - a.timestamp);

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      events: filteredEvents.slice(startIndex, endIndex),
      total: filteredEvents.length,
      page,
      limit
    };
  }

  /**
   * Get threat statistics
   */
  getThreatStats() {
    const stats = {
      totalEvents: this.securityEvents.length,
      totalThreats: this.threats.length,
      blockedIPs: this.blockedIPs.size,
      threatTypes: {},
      riskDistribution: {
        low: 0, // 1-3
        medium: 0, // 4-6
        high: 0 // 7-10
      }
    };

    // Count threat types
    for (const threat of this.threats) {
      for (const detail of threat.threats) {
        stats.threatTypes[detail.type] = (stats.threatTypes[detail.type] || 0) + 1;
      }
    }

    // Calculate risk distribution
    for (const event of this.securityEvents) {
      if (event.riskScore <= 3) {
        stats.riskDistribution.low++;
      } else if (event.riskScore <= 6) {
        stats.riskDistribution.medium++;
      } else {
        stats.riskDistribution.high++;
      }
    }

    return stats;
  }

  /**
   * Clear old security events (retention policy)
   */
  clearOldEvents(retentionDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const initialCount = this.securityEvents.length;
    this.securityEvents = this.securityEvents.filter(event => event.timestamp >= cutoffDate);
    const removedCount = initialCount - this.securityEvents.length;

    // Also clean up old rate limit data
    for (const [ip, data] of this.rateLimits.entries()) {
      data.requests = data.requests.filter(req => req.timestamp >= cutoffDate);
      if (data.requests.length === 0) {
        this.rateLimits.delete(ip);
      }
    }

    this.logger.info(`Cleared ${removedCount} old security events`, { retentionDays });

    return removedCount;
  }
}

module.exports = new ShieldService();
