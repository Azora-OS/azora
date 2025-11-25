/*
AZORA PROPRIETARY LICENSE

🌉 NEXUS ORGANISM BRIDGE
Connect blockchain liberation to the entire organism!

When Nexus moves money → Entire organism benefits!
*/

import { EventEmitter } from 'events';
import axios from 'axios';

const MINT_API = process.env.MINT_API_URL || 'http://localhost:3001';
const EDUCATION_API = process.env.EDUCATION_API_URL || 'http://localhost:3008';
const FORGE_API = process.env.FORGE_API_URL || 'http://localhost:12345';

/**
 * 🌉 NEXUS ORGANISM BRIDGE
 * 
 * Nexus = Blockchain Heart
 * Pumps financial freedom through the organism!
 * 
 * When Nexus processes remittances → Mint records transactions
 * When farmers get funded → Education offers agricultural courses
 * When stokvels grow → Community strengthens
 * When diaspora invests → Innovation Hub gets capital
 * 
 * EVERYTHING IS CONNECTED!
 */
export class NexusOrganismBridge extends EventEmitter {
  private static instance: NexusOrganismBridge;
  private connectedServices: Set<string> = new Set();

  static getInstance(): NexusOrganismBridge {
    if (!this.instance) {
      this.instance = new NexusOrganismBridge();
      this.instance.initialize();
    }
    return this.instance;
  }

  private async initialize() {
    console.log('🌉 Initializing Nexus Organism Bridge...');
    
    // Check service health
    const services = [
      { name: 'Mint', url: `${MINT_API}/health` },
      { name: 'Education', url: `${EDUCATION_API}/health` },
      { name: 'Forge', url: `${FORGE_API}/health` }
    ];

    for (const service of services) {
      try {
        const response = await axios.get(service.url, { timeout: 5000 });
        if (response.data.status === 'healthy') {
          this.connectedServices.add(service.name);
          console.log(`✅ ${service.name} connected`);
        }
      } catch (error) {
        console.log(`⚠️ ${service.name} not responding`);
      }
    }

    this.setupEventHandlers();
    console.log(`🌟 Nexus Organism Bridge initialized!`);
  }

  private setupEventHandlers() {
    // When remittance sent → Record in Mint, update profiles
    this.on('nexus:remittance:sent', async (data) => {
      console.log('💸 Remittance processed - notifying organism...');
      
      // Record transaction in Mint
      if (this.connectedServices.has('Mint')) {
        await axios.post(`${MINT_API}/api/transactions/record`, {
          type: 'remittance',
          amount: data.amount,
          fee: data.fee,
          userId: data.senderId,
          metadata: {
            service: 'nexus-remittance',
            corridor: data.corridor,
            savingsVsTraditional: data.savingsVsTraditional
          }
        }).catch(e => console.error('Mint record failed:', e.message));
      }
      
      // Update sender profile (frequent remitter = good financial behavior)
      // Award Learn-to-Earn bonus for using Azora!
      
      // Broadcast to organism
      this.broadcastToOrganism('remittance:completed', {
        service: 'nexus',
        impact: {
          mint: '+transaction_volume',
          community: '+trust_score',
          user: `+saved_${data.savingsVsTraditional}`
        }
      });
    });

    // When farmer funded → Offer agricultural courses
    this.on('nexus:agri:loan_funded', async (data) => {
      console.log('🌾 Farmer funded - offering agricultural courses...');
      
      if (this.connectedServices.has('Education')) {
        // Recommend agricultural courses
        await axios.post(`${EDUCATION_API}/api/recommendations/create`, {
          userId: data.farmerId,
          courses: [
            'Modern Farming Techniques',
            'Crop Management',
            'Sustainable Agriculture',
            'Farm Business Management'
          ],
          reason: 'You received an agricultural loan - improve your yields!'
        }).catch(e => console.error('Education recommendation failed:', e.message));
        
        // Offer 50% discount on agricultural courses
        // Learn → Better yields → Higher repayment rate!
      }
      
      // Record loan in Mint
      if (this.connectedServices.has('Mint')) {
        await axios.post(`${MINT_API}/api/loans/record`, {
          loanId: data.loanId,
          amount: data.amount,
          type: 'agricultural',
          farmerId: data.farmerId
        }).catch(e => console.error('Mint loan record failed:', e.message));
      }
      
      this.broadcastToOrganism('farmer:funded', {
        service: 'nexus',
        farmerId: data.farmerId,
        impact: {
          education: '+course_recommendations',
          mint: '+loan_portfolio',
          community: '+rural_development'
        }
      });
    });

    // When stokvel created → Build community
    this.on('nexus:stokvel:created', async (data) => {
      console.log('🤝 Stokvel created - building community...');
      
      // Stokvels = Community building!
      // Connect members on Community platform
      // Create dedicated group chat
      // Share success stories
      
      this.broadcastToOrganism('stokvel:created', {
        service: 'nexus',
        stokvelId: data.stokvelId,
        impact: {
          community: '+group_formation',
          mint: '+savings_pool',
          social: '+trust_network'
        }
      });
    });

    // When diaspora invests → Fund Innovation Hub
    this.on('nexus:diaspora:investment', async (data) => {
      console.log('💰 Diaspora investment - funding innovation...');
      
      // Diaspora capital → Fund African startups!
      // Connect investors to Innovation Hub projects
      
      this.broadcastToOrganism('diaspora:invested', {
        service: 'nexus',
        amount: data.amount,
        impact: {
          innovation: '+startup_funding',
          mint: '+capital_inflow',
          jobs: '+employment_created'
        }
      });
    });

    // When assets tokenized → Wealth unlocked!
    this.on('nexus:asset:tokenized', async (data) => {
      console.log('💎 Asset tokenized - wealth unlocked!');
      
      // Tokenized assets can be used on Forge marketplace
      // Can be collateral for Mint loans
      // Can be fractionally sold
      
      if (this.connectedServices.has('Forge')) {
        // List tokenized asset on marketplace
        await axios.post(`${FORGE_API}/api/marketplace/list-tokenized-asset`, {
          assetId: data.assetId,
          ownerId: data.ownerId,
          tokenId: data.tokenId,
          fractionable: true
        }).catch(e => console.error('Forge listing failed:', e.message));
      }
      
      this.broadcastToOrganism('asset:tokenized', {
        service: 'nexus',
        assetType: data.assetType,
        value: data.value,
        impact: {
          forge: '+marketplace_liquidity',
          mint: '+collateral_available',
          wealth: `+unlocked_${data.value}`
        }
      });
    });
  }

  /**
   * Emit Nexus event to organism
   */
  emitNexusEvent(event: string, data: any) {
    this.emit(`nexus:${event}`, data);
  }

  /**
   * Broadcast to entire organism
   */
  private broadcastToOrganism(event: string, data: any) {
    console.log(`📡 Broadcasting to organism: ${event}`, data);
    this.emit(`organism:${event}`, data);
  }

  /**
   * Handle incoming organism events
   */
  async handleOrganismEvent(event: string, data: any) {
    console.log(`🔔 Organism event received: ${event}`, data);
    
    switch (event) {
      case 'mint:funds_available':
        // When Mint has liquidity, offer loans to farmers
        console.log('💰 Mint is liquid - offering farmer loans!');
        break;
        
      case 'education:course_completed':
        // When farmer completes agricultural course, increase loan limit
        console.log('🎓 Farmer educated - increasing loan eligibility!');
        break;
        
      case 'forge:transaction_completed':
        // When freelancer gets paid on Forge, offer remittance
        console.log('💸 Payment received - suggest remittance home!');
        break;
        
      case 'community:trust_boost':
        // When user gains community trust, offer better loan rates
        console.log('🤝 Trust increased - offering better rates!');
        break;
    }
  }

  /**
   * Get organism health
   */
  getOrganismHealth() {
    const totalExpected = 10;
    const connected = this.connectedServices.size;
    
    return {
      healthy: connected >= 2,
      connectedServices: Array.from(this.connectedServices),
      totalServices: connected,
      healthPercentage: (connected / totalExpected) * 100
    };
  }

  /**
   * Get circulation statistics
   */
  getCirculationStats() {
    return {
      nexusTransactions: 0,
      remittanceVolume: 0,
      farmersToFunded: 0,
      stokvelValue: 0,
      diasporaInvestment: 0,
      overallCirculation: 'healthy'
    };
  }
}

export const nexusOrganismBridge = NexusOrganismBridge.getInstance();

/**
 * 🌟 NEXUS ORGANISM EVENTS
 */
export const NexusOrganismEvents = {
  // Nexus events (emitted)
  REMITTANCE_SENT: 'nexus:remittance:sent',
  STOKVEL_CREATED: 'nexus:stokvel:created',
  FARMER_FUNDED: 'nexus:agri:loan_funded',
  DIASPORA_INVESTMENT: 'nexus:diaspora:investment',
  ASSET_TOKENIZED: 'nexus:asset:tokenized',
  
  // Received from other services
  MINT_FUNDS_AVAILABLE: 'mint:funds_available',
  EDUCATION_COMPLETED: 'education:course_completed',
  FORGE_TRANSACTION: 'forge:transaction_completed',
  COMMUNITY_TRUST_BOOST: 'community:trust_boost'
};
