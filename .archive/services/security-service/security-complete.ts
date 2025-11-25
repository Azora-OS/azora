/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { EventEmitter } from 'events';
import crypto from 'crypto';

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'suspicious_activity' | 'data_access' | 'api_call';
  userId?: string;
  ip: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  timestamp: Date;
}

interface ThreatDetection {
  threatId: string;
  type: 'brute_force' | 'ddos' | 'sql_injection' | 'xss' | 'unauthorized_access';
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
  timestamp: Date;
}

export class SecurityService extends EventEmitter {
  private events: SecurityEvent[] = [];
  private threats: ThreatDetection[] = [];
  private loginAttempts = new Map<string, number[]>();
  private blockedIPs = new Set<string>();

  constructor() {
    super();
    console.log('🔒 Security Service initialized');
  }

  // Log Security Event
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): SecurityEvent {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    this.events.push(securityEvent);
    this.emit('security-event', securityEvent);

    if (securityEvent.severity === 'critical') {
      this.emit('critical-event', securityEvent);
      console.log(`🚨 CRITICAL: ${securityEvent.type} from ${securityEvent.ip}`);
    }

    return securityEvent;
  }

  // Detect Brute Force Attacks
  detectBruteForce(ip: string, userId?: string): boolean {
    const key = userId || ip;
    const attempts = this.loginAttempts.get(key) || [];
    const now = Date.now();
    
    // Remove attempts older than 15 minutes
    const recentAttempts = attempts.filter(time => now - time < 900000);
    
    if (recentAttempts.length >= 5) {
      this.logThreat({
        type: 'brute_force',
        source: ip,
        severity: 'high',
        blocked: true
      });
      this.blockedIPs.add(ip);
      return true;
    }

    recentAttempts.push(now);
    this.loginAttempts.set(key, recentAttempts);
    return false;
  }

  // Log Threat Detection
  logThreat(threat: Omit<ThreatDetection, 'threatId' | 'timestamp'>): ThreatDetection {
    const detection: ThreatDetection = {
      ...threat,
      threatId: crypto.randomUUID(),
      timestamp: new Date()
    };

    this.threats.push(detection);
    this.emit('threat-detected', detection);

    if (detection.severity === 'critical') {
      console.log(`🚨 THREAT: ${detection.type} from ${detection.source}`);
    }

    return detection;
  }

  // Check if IP is blocked
  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // Unblock IP
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.emit('ip-unblocked', { ip });
  }

  // Detect Suspicious Activity
  detectSuspiciousActivity(userId: string, activity: any): boolean {
    // Check for unusual patterns
    const userEvents = this.events.filter(e => e.userId === userId);
    const recentEvents = userEvents.filter(
      e => Date.now() - e.timestamp.getTime() < 3600000
    );

    // Too many API calls
    if (recentEvents.length > 100) {
      this.logThreat({
        type: 'unauthorized_access',
        source: userId,
        severity: 'medium',
        blocked: false
      });
      return true;
    }

    // Multiple failed logins
    const failedLogins = recentEvents.filter(e => e.type === 'failed_login');
    if (failedLogins.length > 3) {
      this.logThreat({
        type: 'brute_force',
        source: userId,
        severity: 'high',
        blocked: false
      });
      return true;
    }

    return false;
  }

  // Data Encryption
  encryptData(data: string, key?: string): string {
    const encryptionKey = key || process.env.ENCRYPTION_KEY || 'default-key';
    const algorithm = 'aes-256-cbc';
    const cryptoKey = crypto.scryptSync(encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, cryptoKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  // Data Decryption
  decryptData(encrypted: string, key?: string): string {
    const encryptionKey = key || process.env.ENCRYPTION_KEY || 'default-key';
    const algorithm = 'aes-256-cbc';
    const cryptoKey = crypto.scryptSync(encryptionKey, 'salt', 32);
    
    const [ivHex, encryptedData] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, cryptoKey, iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Hash Password
  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  // Verify Password
  verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  // Generate Secure Token
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Get Security Dashboard
  getSecurityDashboard(): any {
    const now = Date.now();
    const last24h = this.events.filter(e => now - e.timestamp.getTime() < 86400000);
    const criticalEvents = last24h.filter(e => e.severity === 'critical');
    const threats24h = this.threats.filter(t => now - t.timestamp.getTime() < 86400000);

    return {
      totalEvents: this.events.length,
      events24h: last24h.length,
      criticalEvents24h: criticalEvents.length,
      totalThreats: this.threats.length,
      threats24h: threats24h.length,
      blockedIPs: this.blockedIPs.size,
      recentEvents: last24h.slice(-10),
      recentThreats: threats24h.slice(-10),
      timestamp: new Date().toISOString()
    };
  }

  // Get Events by User
  getUserEvents(userId: string, limit: number = 50): SecurityEvent[] {
    return this.events
      .filter(e => e.userId === userId)
      .slice(-limit);
  }

  // Get Threats by Severity
  getThreatsBySeverity(severity: ThreatDetection['severity']): ThreatDetection[] {
    return this.threats.filter(t => t.severity === severity);
  }

  // Clear old events (retention policy)
  clearOldEvents(daysToKeep: number = 90): number {
    const cutoff = Date.now() - (daysToKeep * 86400000);
    const before = this.events.length;
    this.events = this.events.filter(e => e.timestamp.getTime() > cutoff);
    const removed = before - this.events.length;
    
    console.log(`🗑️ Cleared ${removed} old security events`);
    return removed;
  }
}

export const securityService = new SecurityService();
export default securityService;
