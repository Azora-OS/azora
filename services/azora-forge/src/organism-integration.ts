/**
 * 🔨 AZORA FORGE - ORGANISM INTEGRATION
 * 
 * Connects Forge with the rest of the Azora organism:
 * - Mint (payment processing, escrow, revenue sharing)
 * - Education (skilled worker pipeline, certifications)
 * - Careers (job marketplace integration)
 * - Community (social proof, ratings)
 * - Nexus (blockchain transactions)
 * 
 * SYMBIOTIC RULES:
 * 1. When Forge makes sale → 5% goes to Mint (heart)
 * 2. When student graduates → Auto-create Forge profile
 * 3. When Forge needs sellers → Request from Education
 * 4. When buyer needs service → Match with Careers jobs
 */

import { EventEmitter } from 'events';
import axios from 'axios';
import { Listing, Transaction } from './models/Listing';

// ==================== INTERFACES ====================

export interface ForgeOrganismConfig {
  mintServiceUrl: string; // e.g., 'http://localhost:3001'
  educationServiceUrl: string; // e.g., 'http://localhost:3010'
  careersServiceUrl: string; // e.g., 'http://localhost:3040'
  communityServiceUrl: string; // e.g., 'http://localhost:3060'
  nexusServiceUrl: string; // e.g., 'http://localhost:3002'
  supremeOrganismUrl: string; // e.g., 'http://localhost:3100'
  
  // Revenue share settings
  platformFeePercentage: number; // e.g., 0.05 (5%)
  sellerEarningsPercentage: number; // e.g., 0.95 (95%)
  
  // Auto-integration flags
  autoCreateProfilesForGraduates: boolean;
  autoSendRevenueToMint: boolean;
  autoMatchWithCareers: boolean;
}

export interface SellerProfile {
  userId: string;
  name: string;
  email: string;
  
  // From Education
  educationBackground?: {
    institution: string;
    degree?: string;
    courses: string[];
    certifications: string[];
    graduationDate?: Date;
    gpa?: number;
  };
  
  // From Careers
  workExperience?: {
    title: string;
    company: string;
    duration: string;
    skills: string[];
  }[];
  
  // Forge-specific
  skills: string[];
  categories: string[];
  rating: number;
  totalSales: number;
  completionRate: number;
  responseTime: number; // hours
  
  // Verification
  identityVerified: boolean;
  educationVerified: boolean;
  skillsVerified: boolean;
  
  // Wallet
  mintWalletId?: string;
  
  createdAt: Date;
  lastActive: Date;
}

export interface ForgeTransaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number; // in AZR
  
  // Payment breakdown
  sellerEarnings: number; // 95%
  platformFee: number; // 5%
  
  // Status
  status: 'initiated' | 'escrow' | 'completed' | 'disputed' | 'refunded';
  
  // Integration tracking
  mintTransactionId?: string;
  nexusTransactionHash?: string;
  
  // Escrow
  escrowReleaseDate?: Date;
  escrowReleasedAt?: Date;
  
  timestamps: {
    initiated: Date;
    escrowStart?: Date;
    completed?: Date;
    disputed?: Date;
  };
}

// ==================== FORGE ORGANISM INTEGRATION ====================

export class ForgeOrganismIntegration extends EventEmitter {
  private sellerProfiles: Map<string, SellerProfile> = new Map();
  private transactions: Map<string, ForgeTransaction> = new Map();
  
  constructor(private config: ForgeOrganismConfig) {
    super();
    this.initializeIntegration();
  }

  private initializeIntegration(): void {
    console.log('🔨 Forge Organism Integration initialized');
    
    // Subscribe to organism events
    this.subscribeToOrganismEvents();
    
    // Start background jobs
    this.startBackgroundJobs();
  }

  // ==================== MINT INTEGRATION (Heart) ====================

  /**
   * Process payment through Mint
   * Money flows: Buyer → Escrow → (Seller 95% + Platform 5%)
   */
  async processPaymentViaMint(transaction: ForgeTransaction): Promise<void> {
    console.log(`💰 Processing payment via Mint: ${transaction.amount} AZR`);
    
    try {
      // 1. Hold funds in escrow via Mint
      const escrowResponse = await axios.post(`${this.config.mintServiceUrl}/api/v2/escrow/hold`, {
        from: transaction.buyerId,
        amount: transaction.amount,
        purpose: 'forge-marketplace-sale',
        listingId: transaction.listingId,
        releaseCondition: 'seller-delivers-or-7-days',
      });
      
      transaction.mintTransactionId = escrowResponse.data.escrowId;
      transaction.status = 'escrow';
      transaction.timestamps.escrowStart = new Date();
      
      this.emit('payment-escrowed', transaction);
      
      // 2. Record on Nexus blockchain
      const blockchainResponse = await axios.post(`${this.config.nexusServiceUrl}/api/transactions`, {
        type: 'marketplace-escrow',
        amount: transaction.amount,
        from: transaction.buyerId,
        to: 'escrow',
        metadata: {
          listingId: transaction.listingId,
          sellerId: transaction.sellerId,
        },
      });
      
      transaction.nexusTransactionHash = blockchainResponse.data.hash;
      
      console.log(`✅ Payment escrowed: ${transaction.mintTransactionId}`);
      
    } catch (error) {
      console.error('❌ Mint payment failed:', error);
      transaction.status = 'disputed';
      this.emit('payment-failed', { transaction, error });
      throw error;
    }
  }

  /**
   * Release escrow and distribute funds
   * Seller gets 95%, Mint (heart) gets 5%
   */
  async releaseEscrowAndDistribute(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {throw new Error('Transaction not found');}
    
    console.log(`💸 Releasing escrow: ${transaction.mintTransactionId}`);
    
    try {
      // Calculate distribution
      transaction.sellerEarnings = transaction.amount * this.config.sellerEarningsPercentage;
      transaction.platformFee = transaction.amount * this.config.platformFeePercentage;
      
      // 1. Release escrow via Mint
      await axios.post(`${this.config.mintServiceUrl}/api/v2/escrow/release`, {
        escrowId: transaction.mintTransactionId,
        distribution: [
          {
            recipient: transaction.sellerId,
            amount: transaction.sellerEarnings,
            reason: 'marketplace-sale',
          },
          {
            recipient: 'azora-mint', // Platform wallet
            amount: transaction.platformFee,
            reason: 'platform-fee',
          },
        ],
      });
      
      transaction.status = 'completed';
      transaction.timestamps.completed = new Date();
      transaction.escrowReleasedAt = new Date();
      
      this.emit('escrow-released', transaction);
      
      // 2. Notify Supreme Organism of value flow
      await this.notifyOrganismOfValueFlow({
        from: 'azora-forge',
        to: 'azora-mint',
        amount: transaction.platformFee,
        type: 'platform-fee',
      });
      
      // 3. Update seller profile
      await this.updateSellerStats(transaction.sellerId, {
        totalSales: transaction.amount,
        completedTransactions: 1,
      });
      
      console.log(`✅ Escrow released: Seller R${transaction.sellerEarnings}, Platform R${transaction.platformFee}`);
      
    } catch (error) {
      console.error('❌ Escrow release failed:', error);
      throw error;
    }
  }

  // ==================== EDUCATION INTEGRATION (Brain) ====================

  /**
   * Create Forge profile for graduated student
   * Brain → Muscles pipeline
   */
  async createProfileFromEducation(studentId: string): Promise<SellerProfile> {
    console.log(`🎓 Creating Forge profile for graduate: ${studentId}`);
    
    try {
      // 1. Fetch student data from Education
      const studentResponse = await axios.get(
        `${this.config.educationServiceUrl}/api/students/${studentId}`
      );
      
      const student = studentResponse.data;
      
      // 2. Fetch certifications
      const certsResponse = await axios.get(
        `${this.config.educationServiceUrl}/api/credentials/${studentId}/certificates`
      );
      
      const certifications = certsResponse.data;
      
      // 3. Create seller profile
      const profile: SellerProfile = {
        userId: studentId,
        name: student.name,
        email: student.email,
        educationBackground: {
          institution: student.institution || 'Sapiens University',
          degree: student.degree,
          courses: student.completedCourses || [],
          certifications: certifications.map((c: any) => c.title),
          graduationDate: student.graduationDate,
          gpa: student.gpa,
        },
        skills: this.extractSkillsFromCourses(student.completedCourses || []),
        categories: this.mapCoursesToCategories(student.completedCourses || []),
        rating: 0, // New seller
        totalSales: 0,
        completionRate: 0,
        responseTime: 24, // Default 24h
        identityVerified: true, // Verified by Education
        educationVerified: true,
        skillsVerified: false, // Need market validation
        createdAt: new Date(),
        lastActive: new Date(),
      };
      
      this.sellerProfiles.set(studentId, profile);
      
      // 4. Create Mint wallet for seller
      if (!profile.mintWalletId) {
        const walletResponse = await axios.post(`${this.config.mintServiceUrl}/api/v2/wallets`, {
          userId: studentId,
          userName: student.name,
          walletType: 'seller',
        });
        
        profile.mintWalletId = walletResponse.data.id;
      }
      
      // 5. Notify organism
      await this.notifyOrganismOfValueFlow({
        from: 'azora-education',
        to: 'azora-forge',
        type: 'skilled-worker',
        metadata: { studentId, skills: profile.skills },
      });
      
      this.emit('profile-created', profile);
      
      console.log(`✅ Forge profile created for ${student.name}`);
      return profile;
      
    } catch (error) {
      console.error('❌ Profile creation failed:', error);
      throw error;
    }
  }

  /**
   * Request skilled workers from Education
   * When Forge needs sellers in specific category
   */
  async requestSkilledWorkers(category: string, skillsNeeded: string[]): Promise<void> {
    console.log(`📢 Requesting skilled workers: ${category}`);
    
    try {
      // Query Education for relevant graduates
      const response = await axios.post(
        `${this.config.educationServiceUrl}/api/graduates/search`,
        {
          skills: skillsNeeded,
          graduated: true,
          employed: false, // Looking for work
        }
      );
      
      const graduates = response.data;
      
      // Auto-create profiles for them
      for (const graduate of graduates) {
        if (!this.sellerProfiles.has(graduate.studentNumber)) {
          await this.createProfileFromEducation(graduate.studentNumber);
        }
      }
      
      // Notify them of opportunity
      await axios.post(`${this.config.educationServiceUrl}/api/notifications/bulk`, {
        recipients: graduates.map((g: any) => g.studentNumber),
        title: `💼 Opportunity on Azora Forge!`,
        message: `We need ${category} professionals! Join Forge marketplace and start earning.`,
        link: `https://forge.azora.world/register`,
      });
      
      console.log(`✅ Notified ${graduates.length} graduates`);
      
    } catch (error) {
      console.error('❌ Worker request failed:', error);
    }
  }

  // ==================== CAREERS INTEGRATION ====================

  /**
   * Match Forge service listing with Careers job posting
   * Some "gigs" could become full-time jobs
   */
  async matchWithCareers(listingId: string): Promise<void> {
    console.log(`💼 Matching listing with Careers: ${listingId}`);
    
    try {
      const listing = await Listing.findById(listingId);
      if (!listing) {throw new Error('Listing not found');}
      
      // If high-value service (e.g., > R5000), check if it's a job opportunity
      if (listing.price > 5000 && listing.deliveryMethod === 'service') {
        // Notify Careers service
        await axios.post(`${this.config.careersServiceUrl}/api/opportunities/from-forge`, {
          listingId: listing._id,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          compensation: listing.price,
          sellerId: listing.sellerId,
        });
        
        console.log(`✅ Listing forwarded to Careers`);
      }
      
    } catch (error) {
      console.error('❌ Careers matching failed:', error);
    }
  }

  // ==================== COMMUNITY INTEGRATION ====================

  /**
   * Share successful sale on Community platform
   * Social proof boosts reputation
   */
  async shareSuccessOnCommunity(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || transaction.status !== 'completed') {return;}
    
    try {
      const seller = this.sellerProfiles.get(transaction.sellerId);
      if (!seller) {return;}
      
      // Create community post
      await axios.post(`${this.config.communityServiceUrl}/api/posts`, {
        userId: transaction.sellerId,
        type: 'achievement',
        content: `🎉 Just completed another successful service on Azora Forge! #ForgeSuccess #GigEconomy`,
        visibility: 'public',
        metadata: {
          platform: 'forge',
          transactionId,
          amount: transaction.amount,
        },
      });
      
      // Award reputation
      await axios.post(`${this.config.communityServiceUrl}/api/reputation/award`, {
        userId: transaction.sellerId,
        points: Math.floor(transaction.amount / 10), // 1 point per R10
        reason: 'forge-sale-completed',
      });
      
      console.log(`✅ Success shared on Community`);
      
    } catch (error) {
      console.error('❌ Community share failed:', error);
    }
  }

  // ==================== SUPREME ORGANISM COMMUNICATION ====================

  private async notifyOrganismOfValueFlow(flow: {
    from: string;
    to: string;
    amount?: number;
    type: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await axios.post(`${this.config.supremeOrganismUrl}/api/resource-flows`, {
        from: flow.from,
        to: flow.to,
        resourceType: flow.amount ? 'money' : 'users',
        amount: flow.amount || 1,
        automatic: true,
        timestamp: new Date(),
        metadata: flow.metadata,
      });
    } catch (error) {
      console.error('⚠️ Failed to notify organism:', error);
    }
  }

  private subscribeToOrganismEvents(): void {
    // In production, this would use WebSocket or EventBus
    // For now, we'll poll for events
    
    setInterval(async () => {
      try {
        const response = await axios.get(`${this.config.supremeOrganismUrl}/api/events/for-service/azora-forge`);
        const events = response.data;
        
        for (const event of events) {
          await this.handleOrganismEvent(event);
        }
      } catch (error) {
        // Silently fail, organism might not be running yet
      }
    }, 30000); // Check every 30 seconds
  }

  private async handleOrganismEvent(event: any): Promise<void> {
    switch (event.type) {
      case 'student-graduated':
        if (this.config.autoCreateProfilesForGraduates) {
          await this.createProfileFromEducation(event.payload.studentId);
        }
        break;
        
      case 'service-needs-help':
        if (event.payload.service === 'azora-forge') {
          console.log('🆘 Organism requesting help for Forge');
          // Handle healing request
        }
        break;
        
      case 'mint-balance-increased':
        console.log('💰 Mint balance increased! Organism is healthy!');
        break;
    }
  }

  // ==================== UTILITIES ====================

  private extractSkillsFromCourses(courses: string[]): string[] {
    // Map courses to skills
    const skillMap: { [key: string]: string[] } = {
      'web-development': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
      'graphic-design': ['Photoshop', 'Illustrator', 'Figma', 'Branding'],
      'data-science': ['Python', 'R', 'Machine Learning', 'SQL'],
      'plumbing': ['Pipe Installation', 'Leak Repair', 'Drain Cleaning'],
      'electrical': ['Wiring', 'Circuit Design', 'Solar Installation'],
      'welding': ['MIG Welding', 'TIG Welding', 'Arc Welding'],
    };
    
    const skills: string[] = [];
    for (const course of courses) {
      const courseLower = course.toLowerCase();
      for (const [key, courseSkills] of Object.entries(skillMap)) {
        if (courseLower.includes(key)) {
          skills.push(...courseSkills);
        }
      }
    }
    
    return [...new Set(skills)]; // Remove duplicates
  }

  private mapCoursesToCategories(courses: string[]): string[] {
    const categoryMap: { [key: string]: string } = {
      'web': 'Web Development',
      'design': 'Graphic Design',
      'data': 'Data Science',
      'plumb': 'Plumbing',
      'electric': 'Electrical Services',
      'weld': 'Welding',
      'carpent': 'Carpentry',
      'hvac': 'HVAC',
    };
    
    const categories: string[] = [];
    for (const course of courses) {
      const courseLower = course.toLowerCase();
      for (const [key, category] of Object.entries(categoryMap)) {
        if (courseLower.includes(key)) {
          categories.push(category);
        }
      }
    }
    
    return [...new Set(categories)];
  }

  private async updateSellerStats(sellerId: string, stats: {
    totalSales?: number;
    completedTransactions?: number;
  }): Promise<void> {
    const profile = this.sellerProfiles.get(sellerId);
    if (!profile) {return;}
    
    if (stats.totalSales) {
      profile.totalSales += stats.totalSales;
    }
    
    if (stats.completedTransactions) {
      // Recalculate completion rate
      const totalTransactions = this.countSellerTransactions(sellerId);
      const completedTransactions = this.countCompletedTransactions(sellerId);
      profile.completionRate = (completedTransactions / totalTransactions) * 100;
    }
    
    profile.lastActive = new Date();
  }

  private countSellerTransactions(sellerId: string): number {
    return Array.from(this.transactions.values()).filter(t => t.sellerId === sellerId).length;
  }

  private countCompletedTransactions(sellerId: string): number {
    return Array.from(this.transactions.values()).filter(
      t => t.sellerId === sellerId && t.status === 'completed'
    ).length;
  }

  private startBackgroundJobs(): void {
    // Auto-release escrow after 7 days if no disputes
    setInterval(() => this.autoReleaseExpiredEscrows(), 60 * 60 * 1000); // Hourly
    
    // Sync with Organism
    setInterval(() => this.syncWithOrganism(), 5 * 60 * 1000); // Every 5 minutes
  }

  private async autoReleaseExpiredEscrows(): Promise<void> {
    const now = new Date();
    
    for (const [txId, transaction] of this.transactions) {
      if (transaction.status === 'escrow' && transaction.escrowReleaseDate) {
        if (now >= transaction.escrowReleaseDate) {
          console.log(`⏰ Auto-releasing expired escrow: ${txId}`);
          await this.releaseEscrowAndDistribute(txId);
        }
      }
    }
  }

  private async syncWithOrganism(): Promise<void> {
    try {
      // Send health status
      await axios.post(`${this.config.supremeOrganismUrl}/api/services/azora-forge/heartbeat`, {
        health: this.calculateForgeHealth(),
        metrics: {
          activeListings: await Listing.countDocuments({ status: 'active' }),
          totalSales: this.transactions.size,
          activeSellers: this.sellerProfiles.size,
        },
      });
    } catch (error) {
      // Silent fail
    }
  }

  private calculateForgeHealth(): number {
    // Simple health calculation
    const activeListings = this.sellerProfiles.size * 2; // Assume 2 listings per seller
    const successRate = this.countCompletedTransactions('all') / Math.max(this.transactions.size, 1);
    
    return Math.min(100, (activeListings * 2) + (successRate * 50));
  }

  // ==================== PUBLIC API ====================

  async initiateTransaction(listingId: string, buyerId: string): Promise<ForgeTransaction> {
    const listing = await Listing.findById(listingId);
    if (!listing) {throw new Error('Listing not found');}
    if (listing.status !== 'active') {throw new Error('Listing not available');}
    
    const transaction: ForgeTransaction = {
      id: `tx-${Date.now()}`,
      listingId: listing._id.toString(),
      buyerId,
      sellerId: listing.sellerId,
      amount: listing.price,
      sellerEarnings: 0,
      platformFee: 0,
      status: 'initiated',
      timestamps: {
        initiated: new Date(),
      },
    };
    
    this.transactions.set(transaction.id, transaction);
    
    // Process payment via Mint
    await this.processPaymentViaMint(transaction);
    
    // Set escrow release date (7 days)
    transaction.escrowReleaseDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    return transaction;
  }

  async completeDelivery(transactionId: string): Promise<void> {
    await this.releaseEscrowAndDistribute(transactionId);
    await this.shareSuccessOnCommunity(transactionId);
  }

  getSellerProfile(userId: string): SellerProfile | undefined {
    return this.sellerProfiles.get(userId);
  }
}

// ==================== EXPORT ====================

export default ForgeOrganismIntegration;
