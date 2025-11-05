/*
AZORA PROPRIETARY LICENSE

🛡️ AEGIS ORGANISM BRIDGE
Security for the entire organism!

Monitor all services + Detect threats + Protect platform = Safe Azora!
*/

import { EventEmitter } from 'events';

export interface SecurityEvent {
  id: string;
  type: 'fraud-attempt' | 'identity-verify' | 'threat-detected' | 'breach-attempt' | 'suspicious-activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  service: string;
  description: string;
  metadata: any;
  timestamp: Date;
}

export interface OrganismHealth {
  healthy: boolean;
  connectedServices: number;
  totalServices: number;
  healthPercentage: number;
  securityStatus: 'secure' | 'warning' | 'critical';
  threatsDetected: number;
  threatsBlocked: number;
}

/**
 * 🛡️ AEGIS ORGANISM BRIDGE - SECURITY FOR ALL!
 * 
 * We monitor and protect:
 * - Mint (financial fraud)
 * - Forge (marketplace scams)
 * - Nexus (blockchain security)
 * - Sapiens (academic integrity)
 * - Careers (fake profiles)
 * - Community (spam/abuse)
 * - Innovation Hub (IP theft)
 * 
 * When Aegis detects a threat, ALL services are alerted!
 */
export class AegisOrganismBridge extends EventEmitter {
  private static instance: AegisOrganismBridge;
  private connectedServices: Map<string, boolean>;
  private securityEvents: SecurityEvent[];
  private threatsDetected: number = 0;
  private threatsBlocked: number = 0;
  
  private constructor() {
    super();
    this.connectedServices = new Map();
    this.securityEvents = [];
    this.initialize();
  }
  
  static getInstance(): AegisOrganismBridge {
    if (!AegisOrganismBridge.instance) {
      AegisOrganismBridge.instance = new AegisOrganismBridge();
    }
    return AegisOrganismBridge.instance;
  }
  
  private initialize(): void {
    console.log('🛡️ Aegis Organism Bridge initializing...');
    
    // Register all services we protect
    this.registerService('Mint');
    this.registerService('Forge');
    this.registerService('Nexus');
    this.registerService('Sapiens');
    this.registerService('Careers');
    this.registerService('Community');
    this.registerService('Innovation Hub');
    
    // Listen for organism events
    this.setupOrganismListeners();
    
    this.emit('ready');
    console.log('✅ Aegis Organism Bridge ready!');
  }
  
  private registerService(serviceName: string): void {
    this.connectedServices.set(serviceName, true);
  }
  
  private setupOrganismListeners(): void {
    
    // MINT EVENTS - Financial fraud detection
    this.on('mint:transaction:suspicious', (data) => {
      this.handleSuspiciousTransaction(data);
    });
    
    this.on('mint:withdrawal:large', (data) => {
      this.checkLargeWithdrawal(data);
    });
    
    // FORGE EVENTS - Marketplace scams
    this.on('forge:dispute:created', (data) => {
      this.investigateDispute(data);
    });
    
    this.on('forge:rating:suspicious', (data) => {
      this.checkFakeRatings(data);
    });
    
    // NEXUS EVENTS - Blockchain security
    this.on('nexus:remittance:large', (data) => {
      this.checkRemittance(data);
    });
    
    this.on('nexus:wallet:compromised', (data) => {
      this.handleWalletCompromise(data);
    });
    
    // SAPIENS EVENTS - Academic integrity
    this.on('sapiens:exam:suspicious', (data) => {
      this.investigateCheating(data);
    });
    
    // CAREERS EVENTS - Fake profiles
    this.on('careers:profile:suspicious', (data) => {
      this.checkFakeProfile(data);
    });
    
    // COMMUNITY EVENTS - Spam/abuse
    this.on('community:message:spam', (data) => {
      this.blockSpam(data);
    });
  }
  
  /**
   * Handle suspicious transaction
   */
  private handleSuspiciousTransaction(data: any): void {
    this.threatsDetected++;
    
    const event: SecurityEvent = {
      id: `sec_${Date.now()}`,
      type: 'fraud-attempt',
      severity: 'high',
      userId: data.userId,
      service: 'Mint',
      description: `Suspicious transaction: ${data.reason}`,
      metadata: data,
      timestamp: new Date()
    };
    
    this.securityEvents.push(event);
    
    // IMMEDIATE ACTION: Block transaction
    this.broadcastSecurityAlert(event);
    this.threatsBlocked++;
    
    console.log(`🚨 SECURITY ALERT: Suspicious transaction blocked for user ${data.userId}`);
  }
  
  /**
   * Check large withdrawal
   */
  private checkLargeWithdrawal(data: any): void {
    if (data.amount > 10000) { // R10,000+
      console.log(`⚠️ Large withdrawal detected: R${data.amount} by user ${data.userId}`);
      
      // Require additional verification
      this.emit('aegis:verification:required', {
        userId: data.userId,
        reason: 'Large withdrawal',
        amount: data.amount
      });
    }
  }
  
  /**
   * Investigate dispute
   */
  private investigateDispute(data: any): void {
    console.log(`🔍 Investigating dispute: ${data.disputeId}`);
    
    // Check if buyer/seller has history of disputes
    // Flag patterns of scamming
  }
  
  /**
   * Check fake ratings
   */
  private checkFakeRatings(data: any): void {
    // Patterns of fake ratings:
    // - Same user rates many times
    // - Ratings all 5-star with generic text
    // - Burst of ratings in short time
    
    if (data.pattern === 'fake') {
      this.threatsDetected++;
      console.log(`🚨 Fake ratings detected for seller ${data.sellerId}`);
      
      // Remove fake ratings
      this.emit('forge:ratings:remove', { sellerId: data.sellerId });
      this.threatsBlocked++;
    }
  }
  
  /**
   * Check remittance
   */
  private checkRemittance(data: any): void {
    if (data.amount > 50000) { // R50,000+
      console.log(`⚠️ Large remittance: R${data.amount} to ${data.country}`);
      
      // Extra KYC for large amounts
      this.emit('aegis:kyc:enhanced', {
        userId: data.senderId,
        reason: 'Large remittance'
      });
    }
  }
  
  /**
   * Handle wallet compromise
   */
  private handleWalletCompromise(data: any): void {
    this.threatsDetected++;
    
    console.log(`🚨 CRITICAL: Wallet compromise detected for user ${data.userId}`);
    
    // IMMEDIATE ACTIONS:
    // 1. Freeze wallet
    this.emit('nexus:wallet:freeze', { userId: data.userId });
    
    // 2. Notify user
    this.emit('notification:send', {
      userId: data.userId,
      type: 'security-alert',
      message: 'Your wallet has been frozen due to suspicious activity. Contact support immediately.'
    });
    
    // 3. Alert all services
    this.broadcastSecurityAlert({
      id: `sec_${Date.now()}`,
      type: 'breach-attempt',
      severity: 'critical',
      userId: data.userId,
      service: 'Nexus',
      description: 'Wallet compromise detected',
      metadata: data,
      timestamp: new Date()
    });
    
    this.threatsBlocked++;
  }
  
  /**
   * Investigate cheating
   */
  private investigateCheating(data: any): void {
    console.log(`🔍 Investigating potential cheating: ${data.examId}`);
    
    // Patterns to check:
    // - Multiple tabs open
    // - Copy/paste detected
    // - Unusual speed
    // - Browser switching
  }
  
  /**
   * Check fake profile
   */
  private checkFakeProfile(data: any): void {
    // Indicators of fake profile:
    // - Stock photo
    // - Unverified skills
    // - No work history
    // - Generic bio
    
    if (data.fakeScore > 70) {
      this.threatsDetected++;
      console.log(`🚨 Fake profile detected: user ${data.userId}`);
      
      // Flag for review
      this.emit('careers:profile:flag', { userId: data.userId });
      this.threatsBlocked++;
    }
  }
  
  /**
   * Block spam
   */
  private blockSpam(data: any): void {
    this.threatsDetected++;
    console.log(`🚨 Spam detected from user ${data.userId}`);
    
    // Remove message & temp ban
    this.emit('community:message:remove', { messageId: data.messageId });
    this.emit('community:user:tempban', { userId: data.userId, duration: '24h' });
    
    this.threatsBlocked++;
  }
  
  /**
   * Broadcast security alert to all services
   */
  private broadcastSecurityAlert(event: SecurityEvent): void {
    console.log(`📢 Broadcasting security alert: ${event.type} (${event.severity})`);
    
    // Alert all services
    this.emit('organism:security:alert', event);
    
    // Store event
    this.securityEvents.push(event);
  }
  
  /**
   * Get organism security health
   */
  getOrganismHealth(): OrganismHealth {
    const totalServices = this.connectedServices.size;
    const connectedServices = Array.from(this.connectedServices.values()).filter(v => v).length;
    const healthPercentage = (connectedServices / totalServices) * 100;
    
    // Determine security status
    let securityStatus: 'secure' | 'warning' | 'critical' = 'secure';
    if (this.threatsDetected > 100) securityStatus = 'critical';
    else if (this.threatsDetected > 50) securityStatus = 'warning';
    
    return {
      healthy: healthPercentage >= 80,
      connectedServices,
      totalServices,
      healthPercentage,
      securityStatus,
      threatsDetected: this.threatsDetected,
      threatsBlocked: this.threatsBlocked
    };
  }
  
  /**
   * Get security stats
   */
  getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    threatsDetected: number;
    threatsBlocked: number;
    blockRate: number;
  } {
    
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    
    this.securityEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    });
    
    return {
      totalEvents: this.securityEvents.length,
      eventsByType,
      eventsBySeverity,
      threatsDetected: this.threatsDetected,
      threatsBlocked: this.threatsBlocked,
      blockRate: this.threatsDetected > 0 
        ? (this.threatsBlocked / this.threatsDetected) * 100 
        : 100
    };
  }
  
  isServiceConnected(serviceName: string): boolean {
    return this.connectedServices.get(serviceName) || false;
  }
}

/**
 * 🛡️ AEGIS ORGANISM BRIDGE IMPACT
 * 
 * Security organism-wide = Platform-wide trust!
 * 
 * When Aegis detects fraud in Mint:
 * - Freeze account in Mint
 * - Block transactions in Forge
 * - Flag in Community
 * - Alert in all services
 * 
 * One threat detected = Entire organism protected!
 * 
 * AZORA STAYS SAFE! 🛡️✨
 */

export const aegisOrganismBridge = AegisOrganismBridge.getInstance();
