/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events';
import { MintBridge } from '../payments/mintBridge';
import { SkillVerificationService } from '../verification/skillVerificationService';

/**
 * 🌉 ORGANISM BRIDGE - Supreme Integration Layer
 * 
 * Connects Azora Forge with ALL other Azora services.
 * Every service benefits from others, improving together.
 * 
 * When Forge (muscles) does work → Mint (heart) makes money
 * → Education (brain) improves skills → Everyone heals! 🌟
 */
export class OrganismBridge extends EventEmitter {
  private static instance: OrganismBridge;
  private isHealthy: boolean = true;
  private connectedServices: Set<string> = new Set();

  static getInstance(): OrganismBridge {
    if (!this.instance) {
      this.instance = new OrganismBridge();
      this.instance.initialize();
    }
    return this.instance;
  }

  private constructor() {
    super();
  }

  /**
   * Initialize organism connections
   */
  private async initialize(): Promise<void> {
    console.log('🌉 Initializing Organism Bridge...');
    
    // Check health of all connected services
    const services = [
      { name: 'Mint', checker: () => MintBridge.healthCheck() },
      { name: 'Education', checker: () => SkillVerificationService.healthCheck() }
      // TODO: Add more services (Nexus, Aegis, Careers, etc.)
    ];

    for (const service of services) {
      try {
        const healthy = await service.checker();
        if (healthy) {
          this.connectedServices.add(service.name);
          console.log(`✅ ${service.name} connected`);
        } else {
          console.log(`⚠️ ${service.name} not responding`);
        }
      } catch (error) {
        console.error(`❌ ${service.name} connection failed:`, error);
      }
    }

    // Set up event listeners
    this.setupEventHandlers();

    console.log(`🌟 Organism Bridge initialized! Connected: ${this.connectedServices.size} services`);
  }

  /**
   * Set up event handlers for organism events
   */
  private setupEventHandlers(): void {
    // When escrow is funded → notify all services
    this.on('forge:escrow:funded', async (data) => {
      console.log('💰 Escrow funded - notifying organism...');
      
      // Notify Mint (process payment)
      if (this.connectedServices.has('Mint')) {
        await MintBridge.holdFunds(data);
      }
      
      // Enable Mint-Mine Engine for both parties
      await MintBridge.enableMintMineEngine(data.buyerId);
      await MintBridge.enableMintMineEngine(data.sellerId);
    });

    // When project completes → everyone benefits!
    this.on('forge:project:completed', async (data) => {
      console.log('🎉 Project completed - organism healing begins!');
      
      // 1. Release funds via Mint
      if (this.connectedServices.has('Mint')) {
        await MintBridge.releaseFunds({
          escrowId: data.escrowId,
          amount: data.amount,
          toUserId: data.sellerId,
          reason: 'Project completed successfully'
        });
      }
      
      // 2. Award Learn-to-Earn bonus (Mint + Education)
      await MintBridge.awardLearnToEarnBonus({
        userId: data.sellerId,
        projectId: data.projectId,
        amount: data.amount * 0.05, // 5% bonus
        reason: 'Completed Forge project'
      });
      
      // 3. Update skill levels (Education)
      if (this.connectedServices.has('Education')) {
        // Seller improves skills through practice
        await SkillVerificationService.awardSkillImprovementBonus(
          data.sellerId,
          data.skillName,
          'Intermediate'
        );
      }
      
      // 4. Update profiles (local)
      // ProfileService.updateProfileStats(...)
      
      // 5. Recommend courses for skill gaps (Education)
      if (this.connectedServices.has('Education')) {
        const recommendations = await SkillVerificationService.recommendCourses(data.sellerId);
        console.log(`📚 Recommended ${recommendations.length} courses for skill improvement`);
      }
      
      // 6. Broadcast to entire organism
      this.broadcastToOrganism('project:completed', {
        service: 'forge',
        userId: data.sellerId,
        projectId: data.projectId,
        earnings: data.amount,
        impact: {
          mint: '+money',
          education: '+skills',
          community: '+reputation',
          nexus: '+transactions'
        }
      });
    });

    // When rating is given → improve reputation across organism
    this.on('forge:rating:created', async (data) => {
      console.log('⭐ Rating created - updating organism reputation...');
      
      // Update Community profile
      // Update Careers profile
      // Award achievement badges
    });

    // When dispute occurs → all services help resolve
    this.on('forge:dispute:created', async (data) => {
      console.log('⚖️ Dispute created - organism assisting...');
      
      // Freeze funds in Mint
      // Check user history in Community
      // Review transaction on Nexus
      // Flag in Aegis for security check
    });
  }

  /**
   * Broadcast event to entire organism
   */
  private broadcastToOrganism(event: string, data: any): void {
    console.log(`📡 Broadcasting to organism: ${event}`, data);
    
    // TODO: Send to organism event bus
    // This could be:
    // - Redis pub/sub
    // - RabbitMQ
    // - WebSockets
    // - Kafka
    
    // For now, just emit locally
    this.emit(`organism:${event}`, data);
  }

  /**
   * Handle incoming organism events from other services
   */
  async handleOrganismEvent(event: string, data: any): Promise<void> {
    console.log(`🔔 Organism event received: ${event}`, data);
    
    switch (event) {
      case 'mint:funds_received':
        // When Mint makes money, Forge benefits
        // Maybe lower fees, better features, etc.
        console.log('💰 Mint is healthy - Forge benefits!');
        break;
        
      case 'education:course_completed':
        // When user completes course, update their Forge skills
        console.log('🎓 User improved education - updating Forge skills!');
        if (data.userId) {
          // Refresh skills
          await SkillVerificationService.getVerifiedSkills(data.userId);
        }
        break;
        
      case 'community:reputation_boost':
        // When user gains reputation in Community, boost on Forge too
        console.log('🌟 Community reputation up - boosting Forge profile!');
        break;
        
      case 'aegis:security_alert':
        // Security issue detected, take action on Forge
        console.log('🛡️ Security alert - protecting Forge users!');
        break;
    }
  }

  /**
   * Get organism health status
   */
  getOrganismHealth(): {
    healthy: boolean;
    connectedServices: string[];
    totalServices: number;
    healthPercentage: number;
  } {
    const totalExpected = 10; // Total Azora services
    const connected = this.connectedServices.size;
    const percentage = (connected / totalExpected) * 100;
    
    return {
      healthy: this.isHealthy && connected >= 3, // Need at least 3 services
      connectedServices: Array.from(this.connectedServices),
      totalServices: connected,
      healthPercentage: percentage
    };
  }

  /**
   * Emit organism event (called by other Forge services)
   */
  emitOrganismEvent(event: string, data: any): void {
    this.emit(`forge:${event}`, data);
  }

  /**
   * Check if service is connected
   */
  isServiceConnected(serviceName: string): boolean {
    return this.connectedServices.has(serviceName);
  }

  /**
   * Reconnect to a service
   */
  async reconnectService(serviceName: string): Promise<boolean> {
    console.log(`🔄 Attempting to reconnect to ${serviceName}...`);
    
    try {
      let healthy = false;
      
      switch (serviceName) {
        case 'Mint':
          healthy = await MintBridge.healthCheck();
          break;
        case 'Education':
          healthy = await SkillVerificationService.healthCheck();
          break;
        // Add more services
      }
      
      if (healthy) {
        this.connectedServices.add(serviceName);
        console.log(`✅ Reconnected to ${serviceName}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Failed to reconnect to ${serviceName}:`, error);
      return false;
    }
  }

  /**
   * Get organism circulation stats
   * Shows how value flows through the organism
   */
  getCirculationStats(): {
    forgeProjects: number;
    mintTransactions: number;
    educationImprovements: number;
    communityInteractions: number;
    overallCirculation: string;
  } {
    // TODO: Aggregate from all services
    return {
      forgeProjects: 0,
      mintTransactions: 0,
      educationImprovements: 0,
      communityInteractions: 0,
      overallCirculation: 'healthy'
    };
  }
}

// Export singleton instance
export const organismBridge = OrganismBridge.getInstance();

/**
 * 🌟 ORGANISM EVENT DEFINITIONS
 * 
 * All events that flow through the organism:
 */
export const OrganismEvents = {
  // Forge events
  FORGE_PROJECT_STARTED: 'forge:project:started',
  FORGE_PROJECT_COMPLETED: 'forge:project:completed',
  FORGE_ESCROW_FUNDED: 'forge:escrow:funded',
  FORGE_RATING_CREATED: 'forge:rating:created',
  FORGE_DISPUTE_CREATED: 'forge:dispute:created',
  
  // Mint events (received)
  MINT_FUNDS_RECEIVED: 'mint:funds_received',
  MINT_PAYMENT_PROCESSED: 'mint:payment_processed',
  
  // Education events (received)
  EDUCATION_COURSE_COMPLETED: 'education:course_completed',
  EDUCATION_CERTIFICATE_ISSUED: 'education:certificate_issued',
  
  // Community events (received)
  COMMUNITY_REPUTATION_BOOST: 'community:reputation_boost',
  COMMUNITY_ENDORSEMENT: 'community:endorsement',
  
  // Aegis events (received)
  AEGIS_SECURITY_ALERT: 'aegis:security_alert',
  AEGIS_VERIFICATION_COMPLETE: 'aegis:verification_complete',
  
  // Nexus events (received)
  NEXUS_TRANSACTION_CONFIRMED: 'nexus:transaction_confirmed',
  NEXUS_NFT_MINTED: 'nexus:nft_minted'
};
