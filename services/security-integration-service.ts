/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { EventEmitter } from 'events';
import { securityMiddleware } from './azora-aegis/src/security-middleware';
import { kycAmlService } from './kyc-aml-service/kyc-aml-complete';
import { securityService } from './security-service/security-complete';
import { auditLoggingService } from './audit-logging-service/audit-complete';

export class SecurityIntegrationService extends EventEmitter {
  constructor() {
    super();
    this.initializeEventListeners();
    console.log('🛡️ Security Integration Service initialized');
  }

  private initializeEventListeners(): void {
    // Security events
    securityService.on('critical-event', (event) => {
      this.emit('security-alert', event);
      auditLoggingService.log({
        userId: event.userId,
        action: 'CRITICAL_SECURITY_EVENT',
        resource: 'security',
        method: 'POST',
        ip: event.ip,
        userAgent: event.userAgent,
        status: 'success',
        details: event
      });
    });

    // KYC/AML events
    kycAmlService.on('aml-flagged', (data) => {
      this.emit('compliance-alert', data);
      securityService.logEvent({
        type: 'suspicious_activity',
        userId: data.transaction.userId,
        ip: data.transaction.ip,
        userAgent: 'system',
        severity: 'high',
        details: data
      });
    });

    // Audit events
    auditLoggingService.on('audit-failure', (log) => {
      securityService.logEvent({
        type: 'suspicious_activity',
        userId: log.userId,
        ip: log.ip,
        userAgent: log.userAgent,
        severity: 'medium',
        details: log
      });
    });

    console.log('✅ Security event listeners initialized');
  }

  // Comprehensive security check
  async performSecurityCheck(userId: string, ip: string, userAgent: string): Promise<any> {
    // Check if IP is blocked
    if (securityService.isBlocked(ip)) {
      return {
        allowed: false,
        reason: 'IP blocked due to suspicious activity'
      };
    }

    // Check KYC status
    const compliance = kycAmlService.getComplianceStatus(userId);
    if (!compliance.kycVerified) {
      return {
        allowed: false,
        reason: 'KYC verification required'
      };
    }

    // Check for suspicious activity
    const suspicious = securityService.detectSuspiciousActivity(userId, {});
    if (suspicious) {
      return {
        allowed: false,
        reason: 'Suspicious activity detected'
      };
    }

    // Log successful check
    await auditLoggingService.log({
      userId,
      action: 'SECURITY_CHECK',
      resource: 'security',
      method: 'GET',
      ip,
      userAgent,
      status: 'success',
      details: { compliance, suspicious }
    });

    return {
      allowed: true,
      compliance,
      timestamp: new Date().toISOString()
    };
  }

  // Process transaction with full compliance
  async processSecureTransaction(transaction: any): Promise<any> {
    // AML check
    const amlResult = await kycAmlService.checkTransaction(transaction);
    
    if (amlResult.flagged) {
      await auditLoggingService.log({
        userId: transaction.userId,
        action: 'TRANSACTION_BLOCKED',
        resource: 'transaction',
        method: 'POST',
        ip: transaction.ip,
        userAgent: 'system',
        status: 'failure',
        details: { transaction, amlResult }
      });

      return {
        success: false,
        reason: 'Transaction flagged by AML',
        amlResult
      };
    }

    // Log successful transaction
    await auditLoggingService.log({
      userId: transaction.userId,
      action: 'TRANSACTION_PROCESSED',
      resource: 'transaction',
      method: 'POST',
      ip: transaction.ip,
      userAgent: 'system',
      status: 'success',
      details: { transaction, amlResult }
    });

    return {
      success: true,
      amlResult,
      timestamp: new Date().toISOString()
    };
  }

  // Get comprehensive security dashboard
  async getSecurityDashboard(): Promise<any> {
    const securityDash = securityService.getSecurityDashboard();
    const auditStats = auditLoggingService.getStatistics();

    return {
      security: securityDash,
      audit: auditStats,
      compliance: {
        kycVerifications: 'tracked',
        amlChecks: 'active',
        integrityVerified: auditStats.integrityVerified
      },
      timestamp: new Date().toISOString()
    };
  }

  // Generate compliance report
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    const auditReport = auditLoggingService.generateComplianceReport(startDate, endDate);
    const securityThreats = securityService.getThreatsBySeverity('high');

    return {
      audit: auditReport,
      security: {
        highSeverityThreats: securityThreats.length,
        recentThreats: securityThreats.slice(-10)
      },
      period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      generatedAt: new Date().toISOString()
    };
  }

  // Health check
  async healthCheck(): Promise<any> {
    return {
      securityMiddleware: { status: 'healthy' },
      kycAmlService: { status: 'healthy' },
      securityService: { status: 'healthy' },
      auditLogging: { status: 'healthy', integrityVerified: auditLoggingService.verifyIntegrity() },
      timestamp: new Date().toISOString()
    };
  }
}

export const securityIntegration = new SecurityIntegrationService();
export default securityIntegration;
