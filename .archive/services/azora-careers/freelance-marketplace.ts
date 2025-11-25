/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Freelance Marketplace System
 * Gig economy platform - students earn while learning
 * Project-based work, escrow payments, reputation system
 */

import { EventEmitter } from 'events';

// ===== INTERFACES =====

export interface FreelanceGig {
  id: string;
  gigNumber: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  clientRating: number;
  clientVerified: boolean;
  category: GigCategory;
  subcategory: string;
  skillsRequired: Skill[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  budget: Budget;
  projectType: 'fixed' | 'hourly';
  estimatedHours?: number;
  duration: number; // days
  deadline: Date;
  deliverables: Deliverable[];
  milestones: Milestone[];
  attachments: Attachment[];
  proposals: number;
  status: 'open' | 'in-progress' | 'in-review' | 'completed' | 'cancelled' | 'disputed';
  postedDate: Date;
  tags: string[];
  featured: boolean;
  urgentGig: boolean;
  workLocation: 'remote' | 'on-site' | 'hybrid';
  timezone?: string;
}

export type GigCategory = 
  | 'web-development'
  | 'mobile-development'
  | 'design'
  | 'writing'
  | 'marketing'
  | 'data-science'
  | 'video-editing'
  | 'translation'
  | 'virtual-assistant'
  | 'tutoring'
  | 'other';

export interface Budget {
  amount: number;
  min?: number;
  max?: number;
  currency: string;
  negotiable: boolean;
  escrowHeld: boolean;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required: boolean;
}

export interface Deliverable {
  id: string;
  description: string;
  dueDate?: Date;
  status: 'pending' | 'submitted' | 'approved' | 'revision-requested';
  files?: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  percentage: number;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'paid';
  completedDate?: Date;
  paidDate?: Date;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface FreelanceProposal {
  id: string;
  proposalNumber: string;
  gigId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerRating: number;
  coverLetter: string;
  proposedRate: number;
  proposedBudget: Budget;
  estimatedDuration: number; // days
  deliveryDate: Date;
  milestones: ProposalMilestone[];
  portfolioSamples: PortfolioSample[];
  relevantExperience: string;
  whyHireMe: string;
  questions?: ProposalQuestion[];
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  submittedDate: Date;
  viewedByClient: boolean;
  clientResponse?: string;
}

export interface ProposalMilestone {
  title: string;
  description: string;
  amount: number;
  duration: number; // days
}

export interface PortfolioSample {
  title: string;
  description: string;
  url?: string;
  images?: string[];
  relevanceScore: number;
}

export interface ProposalQuestion {
  question: string;
  answer: string;
}

export interface FreelanceContract {
  id: string;
  contractNumber: string;
  gigId: string;
  proposalId: string;
  clientId: string;
  freelancerId: string;
  title: string;
  scope: string;
  budget: Budget;
  milestones: Milestone[];
  deliverables: Deliverable[];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  paymentStatus: 'pending' | 'escrowed' | 'partial' | 'completed';
  totalPaid: number;
  escrowAmount: number;
  terms: ContractTerms;
  timeline: ContractTimeline[];
  messages: ContractMessage[];
  disputes?: Dispute[];
  reviews?: Review[];
  createdAt: Date;
  completedAt?: Date;
}

export interface ContractTerms {
  revisions: number;
  revisionsUsed: number;
  cancellationPolicy: string;
  paymentTerms: string;
  intellectualProperty: string;
  confidentiality: boolean;
  exclusivity: boolean;
}

export interface ContractTimeline {
  id: string;
  type: 'milestone' | 'delivery' | 'payment' | 'revision' | 'message' | 'dispute';
  description: string;
  date: Date;
  userId: string;
  userName: string;
}

export interface ContractMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'client' | 'freelancer' | 'system';
  message: string;
  attachments?: Attachment[];
  timestamp: Date;
  read: boolean;
}

export interface Dispute {
  id: string;
  contractId: string;
  raisedBy: string;
  reason: string;
  description: string;
  evidence: Attachment[];
  status: 'open' | 'under-review' | 'resolved' | 'escalated';
  resolution?: string;
  resolvedBy?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface Review {
  id: string;
  contractId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerType: 'client' | 'freelancer';
  revieweeId: string;
  revieweeName: string;
  rating: number; // 1-5
  qualityRating: number;
  communicationRating: number;
  deadlineRating: number;
  budgetRating: number;
  comment: string;
  wouldWorkAgain: boolean;
  skills: string[];
  createdAt: Date;
  helpful: number;
  reported: boolean;
}

export interface FreelancerProfile {
  studentNumber: string;
  displayName: string;
  tagline: string;
  bio: string;
  profilePicture?: string;
  hourlyRate: number;
  currency: string;
  availability: 'available' | 'busy' | 'not-available';
  hoursPerWeek: number;
  skills: ProfileSkill[];
  categories: GigCategory[];
  portfolio: PortfolioItem[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  stats: FreelancerStats;
  reviews: Review[];
  badges: Badge[];
  verified: boolean;
  responseTime: number; // hours
  completionRate: number; // percentage
  onTimeDelivery: number; // percentage
  createdAt: Date;
  lastActive: Date;
}

export interface ProfileSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
  verified: boolean;
  endorsements: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  videoUrl?: string;
  liveUrl?: string;
  technologies: string[];
  role: string;
  completionDate: Date;
  featured: boolean;
  likes: number;
  views: number;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  verified: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verified: boolean;
}

export interface Language {
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface FreelancerStats {
  totalEarnings: number;
  projectsCompleted: number;
  projectsInProgress: number;
  averageRating: number;
  totalReviews: number;
  repeatClients: number;
  responseRate: number; // percentage
  hireRate: number; // proposals to hires
  totalProposals: number;
  activeProposals: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  type: 'achievement' | 'milestone' | 'verification' | 'special';
}

export interface EscrowPayment {
  id: string;
  contractId: string;
  amount: number;
  currency: string;
  status: 'held' | 'released' | 'refunded' | 'disputed';
  heldDate: Date;
  releasedDate?: Date;
  releasedTo?: string;
  reason?: string;
  transactionId?: string;
}

export interface PaymentRequest {
  id: string;
  contractId: string;
  milestoneId: string;
  requestedBy: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedDate: Date;
  approvedDate?: Date;
  paidDate?: Date;
}

export interface FreelanceAnalytics {
  freelancerId: string;
  period: {
    start: Date;
    end: Date;
  };
  earnings: {
    total: number;
    byCategory: Record<string, number>;
    byMonth: MonthlyEarning[];
    averagePerProject: number;
  };
  projects: {
    total: number;
    completed: number;
    inProgress: number;
    cancelled: number;
    successRate: number;
  };
  proposals: {
    submitted: number;
    accepted: number;
    rejected: number;
    pending: number;
    winRate: number;
  };
  ratings: {
    average: number;
    distribution: Record<number, number>;
    trends: RatingTrend[];
  };
  topSkills: SkillDemand[];
  repeatClients: number;
  recommendations: string[];
}

export interface MonthlyEarning {
  month: string;
  amount: number;
  projects: number;
}

export interface RatingTrend {
  period: string;
  rating: number;
  reviews: number;
}

export interface SkillDemand {
  skill: string;
  projectCount: number;
  earnings: number;
  averageRate: number;
}

// ===== FREELANCE MARKETPLACE SYSTEM =====

export class FreelanceMarketplaceSystem extends EventEmitter {
  private gigs: Map<string, FreelanceGig> = new Map();
  private proposals: Map<string, FreelanceProposal> = new Map();
  private contracts: Map<string, FreelanceContract> = new Map();
  private freelancerProfiles: Map<string, FreelancerProfile> = new Map();
  private escrowPayments: Map<string, EscrowPayment> = new Map();
  private paymentRequests: Map<string, PaymentRequest> = new Map();
  private gigCounter: number = 50000;
  private proposalCounter: number = 100000;
  private contractCounter: number = 20000;

  constructor() {
    super();
    this.initializeSystem();
  }

  private initializeSystem(): void {
    this.startBackgroundJobs();
    console.log('✅ Freelance Marketplace System initialized');
  }

  private startBackgroundJobs(): void {
    // Auto-close expired gigs
    setInterval(() => this.closeExpiredGigs(), 24 * 60 * 60 * 1000);

    // Send proposal reminders
    setInterval(() => this.sendProposalReminders(), 24 * 60 * 60 * 1000);

    // Update freelancer stats
    setInterval(() => this.updateFreelancerStats(), 60 * 60 * 1000);

    // Check milestone deadlines
    setInterval(() => this.checkMilestoneDeadlines(), 60 * 60 * 1000);
  }

  // ===== GIG MANAGEMENT =====

  async postGig(gig: Omit<FreelanceGig, 'id' | 'gigNumber' | 'proposals' | 'status' | 'postedDate'>): Promise<FreelanceGig> {
    const newGig: FreelanceGig = {
      ...gig,
      id: `gig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gigNumber: `GIG-${this.gigCounter++}`,
      proposals: 0,
      status: 'open',
      postedDate: new Date(),
    };

    this.gigs.set(newGig.id, newGig);

    this.emit('gig-posted', newGig);

    // Notify matching freelancers
    await this.notifyMatchingFreelancers(newGig);

    return newGig;
  }

  async searchGigs(criteria: {
    keywords?: string;
    categories?: GigCategory[];
    difficulty?: FreelanceGig['difficulty'];
    budgetMin?: number;
    projectType?: FreelanceGig['projectType'];
    workLocation?: FreelanceGig['workLocation'];
  }, page: number = 1, limit: number = 20): Promise<{ gigs: FreelanceGig[]; total: number }> {
    let results = Array.from(this.gigs.values()).filter((gig) => gig.status === 'open');

    if (criteria.keywords) {
      const keywords = criteria.keywords.toLowerCase();
      results = results.filter(
        (gig) =>
          gig.title.toLowerCase().includes(keywords) ||
          gig.description.toLowerCase().includes(keywords)
      );
    }

    if (criteria.categories && criteria.categories.length > 0) {
      results = results.filter((gig) => criteria.categories!.includes(gig.category));
    }

    if (criteria.difficulty) {
      results = results.filter((gig) => gig.difficulty === criteria.difficulty);
    }

    if (criteria.budgetMin) {
      results = results.filter((gig) => gig.budget.amount >= criteria.budgetMin!);
    }

    if (criteria.projectType) {
      results = results.filter((gig) => gig.projectType === criteria.projectType);
    }

    // Sort by posted date
    results.sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());

    const total = results.length;
    const start = (page - 1) * limit;
    const paginatedResults = results.slice(start, start + limit);

    return { gigs: paginatedResults, total };
  }

  // ===== PROPOSAL MANAGEMENT =====

  async submitProposal(proposal: Omit<FreelanceProposal, 'id' | 'proposalNumber' | 'status' | 'submittedDate' | 'viewedByClient'>): Promise<FreelanceProposal> {
    const gig = this.gigs.get(proposal.gigId);
    if (!gig) {
      throw new Error('Gig not found');
    }

    if (gig.status !== 'open') {
      throw new Error('Gig is no longer accepting proposals');
    }

    const newProposal: FreelanceProposal = {
      ...proposal,
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      proposalNumber: `PROP-${this.proposalCounter++}`,
      status: 'pending',
      submittedDate: new Date(),
      viewedByClient: false,
    };

    this.proposals.set(newProposal.id, newProposal);
    gig.proposals++;

    this.emit('proposal-submitted', { proposal: newProposal, gig });

    return newProposal;
  }

  async acceptProposal(proposalId: string, customTerms?: Partial<ContractTerms>): Promise<FreelanceContract> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    const gig = this.gigs.get(proposal.gigId);
    if (!gig) {
      throw new Error('Gig not found');
    }

    // Update proposal status
    proposal.status = 'accepted';

    // Reject other proposals
    Array.from(this.proposals.values())
      .filter((p) => p.gigId === gig.id && p.id !== proposalId && p.status === 'pending')
      .forEach((p) => (p.status = 'rejected'));

    // Create contract
    const contract = await this.createContract(gig, proposal, customTerms);

    // Update gig status
    gig.status = 'in-progress';

    this.emit('proposal-accepted', { proposal, contract });

    return contract;
  }

  private async createContract(
    gig: FreelanceGig,
    proposal: FreelanceProposal,
    customTerms?: Partial<ContractTerms>
  ): Promise<FreelanceContract> {
    const contract: FreelanceContract = {
      id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contractNumber: `CONTRACT-${this.contractCounter++}`,
      gigId: gig.id,
      proposalId: proposal.id,
      clientId: gig.clientId,
      freelancerId: proposal.freelancerId,
      title: gig.title,
      scope: gig.description,
      budget: proposal.proposedBudget,
      milestones: gig.milestones.map((m) => ({ ...m, status: 'pending' as const })),
      deliverables: gig.deliverables.map((d) => ({ ...d, status: 'pending' as const })),
      startDate: new Date(),
      endDate: new Date(Date.now() + proposal.estimatedDuration * 24 * 60 * 60 * 1000),
      status: 'active',
      paymentStatus: 'pending',
      totalPaid: 0,
      escrowAmount: 0,
      terms: {
        revisions: 3,
        revisionsUsed: 0,
        cancellationPolicy: '24 hours notice required',
        paymentTerms: 'Milestone-based payments',
        intellectualProperty: 'Client owns all rights upon full payment',
        confidentiality: true,
        exclusivity: false,
        ...customTerms,
      },
      timeline: [
        {
          id: `timeline_${Date.now()}`,
          type: 'message',
          description: 'Contract created and activated',
          date: new Date(),
          userId: 'system',
          userName: 'System',
        },
      ],
      messages: [],
      createdAt: new Date(),
    };

    this.contracts.set(contract.id, contract);

    // Hold funds in escrow
    if (gig.budget.escrowHeld) {
      await this.holdEscrow(contract.id, contract.budget.amount);
    }

    this.emit('contract-created', contract);

    return contract;
  }

  // ===== CONTRACT MANAGEMENT =====

  async submitDeliverable(contractId: string, deliverableId: string, files: string[]): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const deliverable = contract.deliverables.find((d) => d.id === deliverableId);
    if (!deliverable) {
      throw new Error('Deliverable not found');
    }

    deliverable.status = 'submitted';
    deliverable.files = files;

    contract.timeline.push({
      id: `timeline_${Date.now()}`,
      type: 'delivery',
      description: `Deliverable submitted: ${deliverable.description}`,
      date: new Date(),
      userId: contract.freelancerId,
      userName: 'Freelancer',
    });

    this.emit('deliverable-submitted', { contract, deliverable });
  }

  async approveMilestone(contractId: string, milestoneId: string): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const milestone = contract.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    milestone.status = 'completed';
    milestone.completedDate = new Date();

    contract.timeline.push({
      id: `timeline_${Date.now()}`,
      type: 'milestone',
      description: `Milestone approved: ${milestone.title}`,
      date: new Date(),
      userId: contract.clientId,
      userName: 'Client',
    });

    // Request payment release
    await this.requestPayment(contractId, milestoneId, milestone.amount);

    this.emit('milestone-approved', { contract, milestone });
  }

  async completeContract(contractId: string): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    contract.status = 'completed';
    contract.completedAt = new Date();

    // Release any remaining escrow
    const escrow = Array.from(this.escrowPayments.values()).find(
      (e) => e.contractId === contractId && e.status === 'held'
    );

    if (escrow) {
      await this.releaseEscrow(escrow.id, contract.freelancerId);
    }

    // Update gig status
    const gig = this.gigs.get(contract.gigId);
    if (gig) {
      gig.status = 'completed';
    }

    this.emit('contract-completed', contract);
  }

  // ===== ESCROW & PAYMENTS =====

  private async holdEscrow(contractId: string, amount: number): Promise<EscrowPayment> {
    const escrow: EscrowPayment = {
      id: `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contractId,
      amount,
      currency: 'ZAR',
      status: 'held',
      heldDate: new Date(),
    };

    this.escrowPayments.set(escrow.id, escrow);

    const contract = this.contracts.get(contractId);
    if (contract) {
      contract.escrowAmount = amount;
      contract.paymentStatus = 'escrowed';
    }

    this.emit('escrow-held', escrow);

    return escrow;
  }

  private async releaseEscrow(escrowId: string, recipientId: string): Promise<void> {
    const escrow = this.escrowPayments.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    escrow.status = 'released';
    escrow.releasedDate = new Date();
    escrow.releasedTo = recipientId;

    const contract = this.contracts.get(escrow.contractId);
    if (contract) {
      contract.totalPaid += escrow.amount;
      contract.escrowAmount = 0;
      
      if (contract.totalPaid >= contract.budget.amount) {
        contract.paymentStatus = 'completed';
      } else {
        contract.paymentStatus = 'partial';
      }
    }

    this.emit('escrow-released', { escrow, recipientId });

    // Integrate with Azora Mint for actual payment
    this.emit('payment-to-mint', {
      recipientId,
      amount: escrow.amount,
      currency: escrow.currency,
      type: 'freelance-earning',
      contractId: escrow.contractId,
    });
  }

  private async requestPayment(contractId: string, milestoneId: string, amount: number): Promise<PaymentRequest> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const paymentRequest: PaymentRequest = {
      id: `payreq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contractId,
      milestoneId,
      requestedBy: contract.freelancerId,
      amount,
      description: `Payment for milestone`,
      status: 'pending',
      requestedDate: new Date(),
    };

    this.paymentRequests.set(paymentRequest.id, paymentRequest);

    this.emit('payment-requested', paymentRequest);

    return paymentRequest;
  }

  async approvePayment(paymentRequestId: string): Promise<void> {
    const paymentRequest = this.paymentRequests.get(paymentRequestId);
    if (!paymentRequest) {
      throw new Error('Payment request not found');
    }

    paymentRequest.status = 'approved';
    paymentRequest.approvedDate = new Date();

    // Find and release corresponding escrow
    const escrow = Array.from(this.escrowPayments.values()).find(
      (e) => e.contractId === paymentRequest.contractId && e.status === 'held'
    );

    if (escrow) {
      const contract = this.contracts.get(paymentRequest.contractId)!;
      await this.releaseEscrow(escrow.id, contract.freelancerId);
    }

    paymentRequest.status = 'paid';
    paymentRequest.paidDate = new Date();

    const milestone = this.contracts
      .get(paymentRequest.contractId)!
      .milestones.find((m) => m.id === paymentRequest.milestoneId);

    if (milestone) {
      milestone.status = 'paid';
      milestone.paidDate = new Date();
    }

    this.emit('payment-approved', paymentRequest);
  }

  // ===== FREELANCER PROFILE =====

  async createFreelancerProfile(
    studentNumber: string,
    profile: Omit<FreelancerProfile, 'studentNumber' | 'stats' | 'reviews' | 'badges' | 'verified' | 'createdAt' | 'lastActive'>
  ): Promise<FreelancerProfile> {
    const newProfile: FreelancerProfile = {
      ...profile,
      studentNumber,
      stats: {
        totalEarnings: 0,
        projectsCompleted: 0,
        projectsInProgress: 0,
        averageRating: 0,
        totalReviews: 0,
        repeatClients: 0,
        responseRate: 100,
        hireRate: 0,
        totalProposals: 0,
        activeProposals: 0,
      },
      reviews: [],
      badges: [],
      verified: false,
      createdAt: new Date(),
      lastActive: new Date(),
    };

    this.freelancerProfiles.set(studentNumber, newProfile);

    this.emit('freelancer-profile-created', newProfile);

    return newProfile;
  }

  async updateFreelancerProfile(
    studentNumber: string,
    updates: Partial<FreelancerProfile>
  ): Promise<FreelancerProfile> {
    const profile = this.freelancerProfiles.get(studentNumber);
    if (!profile) {
      throw new Error('Freelancer profile not found');
    }

    Object.assign(profile, updates, { lastActive: new Date() });

    this.emit('freelancer-profile-updated', profile);

    return profile;
  }

  // ===== REVIEWS & RATINGS =====

  async submitReview(review: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'reported'>): Promise<Review> {
    const contract = this.contracts.get(review.contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status !== 'completed') {
      throw new Error('Can only review completed contracts');
    }

    const newReview: Review = {
      ...review,
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      helpful: 0,
      reported: false,
    };

    if (!contract.reviews) {
      contract.reviews = [];
    }
    contract.reviews.push(newReview);

    // Update freelancer stats
    const profile = this.freelancerProfiles.get(contract.freelancerId);
    if (profile) {
      profile.reviews.push(newReview);
      profile.stats.totalReviews++;
      profile.stats.averageRating =
        (profile.stats.averageRating * (profile.stats.totalReviews - 1) + newReview.rating) /
        profile.stats.totalReviews;
    }

    this.emit('review-submitted', newReview);

    return newReview;
  }

  // ===== ANALYTICS =====

  async getFreelancerAnalytics(
    freelancerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FreelanceAnalytics> {
    const contracts = Array.from(this.contracts.values()).filter(
      (c) => c.freelancerId === freelancerId &&
        c.createdAt >= startDate &&
        c.createdAt <= endDate
    );

    const proposals = Array.from(this.proposals.values()).filter(
      (p) => p.freelancerId === freelancerId &&
        p.submittedDate >= startDate &&
        p.submittedDate <= endDate
    );

    const totalEarnings = contracts
      .filter((c) => c.status === 'completed')
      .reduce((sum, c) => sum + c.totalPaid, 0);

    const analytics: FreelanceAnalytics = {
      freelancerId,
      period: { start: startDate, end: endDate },
      earnings: {
        total: totalEarnings,
        byCategory: {},
        byMonth: [],
        averagePerProject: contracts.length > 0 ? totalEarnings / contracts.length : 0,
      },
      projects: {
        total: contracts.length,
        completed: contracts.filter((c) => c.status === 'completed').length,
        inProgress: contracts.filter((c) => c.status === 'active').length,
        cancelled: contracts.filter((c) => c.status === 'cancelled').length,
        successRate: contracts.length > 0
          ? (contracts.filter((c) => c.status === 'completed').length / contracts.length) * 100
          : 0,
      },
      proposals: {
        submitted: proposals.length,
        accepted: proposals.filter((p) => p.status === 'accepted').length,
        rejected: proposals.filter((p) => p.status === 'rejected').length,
        pending: proposals.filter((p) => p.status === 'pending').length,
        winRate: proposals.length > 0
          ? (proposals.filter((p) => p.status === 'accepted').length / proposals.length) * 100
          : 0,
      },
      ratings: {
        average: 0,
        distribution: {},
        trends: [],
      },
      topSkills: [],
      repeatClients: 0,
      recommendations: [],
    };

    return analytics;
  }

  // ===== HELPER METHODS =====

  private async notifyMatchingFreelancers(gig: FreelanceGig): Promise<void> {
    // Find freelancers with matching skills
    for (const profile of this.freelancerProfiles.values()) {
      const hasMatchingSkills = gig.skillsRequired.some((gigSkill) =>
        profile.skills.some((profileSkill) => profileSkill.name === gigSkill.name)
      );

      if (hasMatchingSkills && profile.availability === 'available') {
        this.emit('gig-match-notification', { profile, gig });
      }
    }
  }

  private async closeExpiredGigs(): Promise<void> {
    const now = new Date();
    for (const gig of this.gigs.values()) {
      if (gig.status === 'open' && gig.deadline < now) {
        gig.status = 'cancelled';
        this.emit('gig-expired', gig);
      }
    }
  }

  private async sendProposalReminders(): Promise<void> {
    // Remind freelancers about pending proposals
    console.log('Sending proposal reminders...');
  }

  private async updateFreelancerStats(): Promise<void> {
    // Update all freelancer statistics
    for (const profile of this.freelancerProfiles.values()) {
      const contracts = Array.from(this.contracts.values()).filter(
        (c) => c.freelancerId === profile.studentNumber
      );

      profile.stats.projectsCompleted = contracts.filter((c) => c.status === 'completed').length;
      profile.stats.projectsInProgress = contracts.filter((c) => c.status === 'active').length;
      profile.stats.totalEarnings = contracts
        .filter((c) => c.status === 'completed')
        .reduce((sum, c) => sum + c.totalPaid, 0);
    }
  }

  private async checkMilestoneDeadlines(): Promise<void> {
    const now = new Date();
    for (const contract of this.contracts.values()) {
      if (contract.status === 'active') {
        for (const milestone of contract.milestones) {
          if (milestone.status === 'in-progress' && milestone.dueDate < now) {
            this.emit('milestone-overdue', { contract, milestone });
          }
        }
      }
    }
  }
}

export default FreelanceMarketplaceSystem;
