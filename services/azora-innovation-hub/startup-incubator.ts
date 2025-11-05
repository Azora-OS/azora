/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Innovation Hub - Startup Incubator System
 * Turn student projects into real startups
 * Venture funding, mentorship, IP management
 */

import { EventEmitter } from 'events';

// ===== INTERFACES =====

export interface Startup {
  id: string;
  startupNumber: string;
  name: string;
  tagline: string;
  description: string;
  founders: Founder[];
  originProject?: StudentProject;
  stage: 'idea' | 'prototype' | 'mvp' | 'launch' | 'growth' | 'scale';
  industry: Industry;
  category: string[];
  founded: Date;
  website?: string;
  pitch: PitchDeck;
  businessModel: BusinessModel;
  market: MarketAnalysis;
  traction: Traction;
  team: TeamMember[];
  advisors: Advisor[];
  funding: FundingRound[];
  totalRaised: number;
  valuation?: number;
  intellectualProperty: IP[];
  milestones: Milestone[];
  metrics: StartupMetrics;
  status: 'incubating' | 'active' | 'graduated' | 'pivoted' | 'closed';
  incubationStartDate: Date;
  graduationDate?: Date;
}

export type Industry = 
  | 'fintech' | 'edtech' | 'healthtech' | 'agritech' | 'cleantech'
  | 'e-commerce' | 'saas' | 'marketplace' | 'ai-ml' | 'blockchain'
  | 'iot' | 'mobility' | 'social' | 'gaming' | 'other';

export interface Founder {
  studentNumber: string;
  name: string;
  role: 'CEO' | 'CTO' | 'COO' | 'CFO' | 'CMO' | 'CPO' | 'Co-Founder';
  equity: number; // percentage
  bio: string;
  linkedIn?: string;
  github?: string;
  skills: string[];
}

export interface StudentProject {
  projectId: string;
  courseId: string;
  courseName: string;
  grade: number;
  completedDate: Date;
  description: string;
  technologies: string[];
  repositoryUrl?: string;
}

export interface PitchDeck {
  id: string;
  version: number;
  problem: string;
  solution: string;
  uniqueValue: string;
  targetMarket: string;
  businessModel: string;
  competition: string;
  traction: string;
  team: string;
  financials: string;
  ask: string;
  slides?: string[];
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessModel {
  revenue: RevenueStream[];
  costs: CostStructure;
  pricingStrategy: string;
  customerAcquisition: string;
  unitEconomics: UnitEconomics;
}

export interface RevenueStream {
  name: string;
  type: 'subscription' | 'transaction' | 'licensing' | 'advertising' | 'marketplace' | 'other';
  amount: number;
  recurring: boolean;
}

export interface CostStructure {
  fixed: number;
  variable: number;
  development: number;
  marketing: number;
  operations: number;
  salaries: number;
}

export interface UnitEconomics {
  cac: number; // Customer Acquisition Cost
  ltv: number; // Lifetime Value
  ltvCacRatio: number;
  paybackPeriod: number; // months
  churnRate: number; // percentage
}

export interface MarketAnalysis {
  tam: number; // Total Addressable Market
  sam: number; // Serviceable Addressable Market
  som: number; // Serviceable Obtainable Market
  marketSize: 'small' | 'medium' | 'large' | 'massive';
  growthRate: number; // percentage
  competitors: Competitor[];
  marketTrends: string[];
}

export interface Competitor {
  name: string;
  description: string;
  strength: string;
  weakness: string;
  marketShare?: number;
}

export interface Traction {
  users: number;
  revenue: number;
  mrr?: number; // Monthly Recurring Revenue
  arr?: number; // Annual Recurring Revenue
  growthRate: number; // percentage month-over-month
  keyMetrics: Record<string, number>;
  milestones: string[];
  pressFeatures: PressFeature[];
}

export interface PressFeature {
  outlet: string;
  title: string;
  url: string;
  date: Date;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  linkedIn?: string;
  isFounder: boolean;
  joinDate: Date;
}

export interface Advisor {
  name: string;
  title: string;
  company: string;
  expertise: string[];
  bio: string;
  linkedIn?: string;
  equity?: number;
  cash?: boolean;
}

export interface FundingRound {
  id: string;
  type: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'bridge' | 'grant';
  amount: number;
  currency: string;
  valuation: number;
  investors: Investor[];
  leadInvestor?: string;
  closedDate: Date;
  terms: FundingTerms;
}

export interface Investor {
  id: string;
  name: string;
  type: 'angel' | 'vc' | 'corporate' | 'government' | 'accelerator' | 'crowdfunding';
  amount: number;
  equity?: number;
  boardSeat: boolean;
  status: 'committed' | 'invested' | 'exited';
}

export interface FundingTerms {
  liquidationPreference: string;
  votingRights: string;
  antiDilution: string;
  boardSeats: number;
  proRataRights: boolean;
}

export interface IP {
  id: string;
  type: 'patent' | 'trademark' | 'copyright' | 'trade-secret' | 'domain';
  name: string;
  description: string;
  applicationNumber?: string;
  registrationNumber?: string;
  status: 'pending' | 'registered' | 'expired' | 'abandoned';
  filingDate: Date;
  grantDate?: Date;
  expiryDate?: Date;
  jurisdiction: string[];
  owners: string[];
  inventors?: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'product' | 'business' | 'funding' | 'team' | 'customer' | 'other';
  targetDate: Date;
  completedDate?: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'missed';
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface StartupMetrics {
  users: number;
  activeUsers: number;
  revenue: number;
  mrr: number;
  burnRate: number; // monthly
  runway: number; // months
  cashOnHand: number;
  growthRate: number;
  churnRate: number;
  nps: number; // Net Promoter Score
  updatedAt: Date;
}

export interface IncubationProgram {
  id: string;
  name: string;
  cohort: number;
  duration: number; // months
  startDate: Date;
  endDate: Date;
  focus: Industry[];
  benefits: ProgramBenefit[];
  requirements: string[];
  participants: string[]; // startup IDs
  status: 'applications-open' | 'in-progress' | 'completed';
  applicationDeadline: Date;
}

export interface ProgramBenefit {
  type: 'funding' | 'mentorship' | 'workspace' | 'legal' | 'credits' | 'network' | 'training';
  description: string;
  value?: number;
}

export interface MentorshipSession {
  id: string;
  startupId: string;
  mentorId: string;
  mentorName: string;
  mentorExpertise: string[];
  topic: string;
  type: 'one-on-one' | 'group' | 'workshop' | 'office-hours';
  scheduledDate: Date;
  duration: number; // minutes
  location: string;
  isVirtual: boolean;
  meetingUrl?: string;
  notes?: string;
  actionItems: ActionItem[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: SessionFeedback;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface SessionFeedback {
  rating: number;
  comment: string;
  helpful: boolean;
  followUpNeeded: boolean;
}

export interface VentureOpportunity {
  id: string;
  type: 'funding' | 'partnership' | 'acquisition' | 'grant' | 'competition';
  title: string;
  description: string;
  organization: string;
  amount?: number;
  deadline: Date;
  requirements: string[];
  eligibility: string[];
  applicationUrl?: string;
  status: 'open' | 'closed';
  postedDate: Date;
}

export interface StartupApplication {
  id: string;
  applicationNumber: string;
  startupId: string;
  programId: string;
  appliedBy: string;
  pitch: string;
  whyJoin: string;
  currentStage: string;
  traction: string;
  attachments: string[];
  status: 'submitted' | 'under-review' | 'shortlisted' | 'accepted' | 'rejected';
  submittedDate: Date;
  reviewedDate?: Date;
  reviewNotes?: string;
}

// ===== STARTUP INCUBATOR SYSTEM =====

export class StartupIncubatorSystem extends EventEmitter {
  private startups: Map<string, Startup> = new Map();
  private programs: Map<string, IncubationProgram> = new Map();
  private mentorshipSessions: Map<string, MentorshipSession> = new Map();
  private ventures: Map<string, VentureOpportunity> = new Map();
  private applications: Map<string, StartupApplication> = new Map();
  private startupCounter: number = 1000;
  private applicationCounter: number = 5000;

  constructor() {
    super();
    this.initializeSystem();
  }

  private initializeSystem(): void {
    this.loadIncubationPrograms();
    this.loadVentureOpportunities();
    this.startBackgroundJobs();
    console.log('✅ Startup Incubator System initialized');
  }

  private loadIncubationPrograms(): void {
    const program: IncubationProgram = {
      id: 'prog_001',
      name: 'Azora Accelerator - Cohort 1',
      cohort: 1,
      duration: 6,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-07-31'),
      focus: ['fintech', 'edtech', 'healthtech'],
      benefits: [
        { type: 'funding', description: 'Up to R500k seed funding', value: 500000 },
        { type: 'mentorship', description: '1-on-1 with industry experts' },
        { type: 'workspace', description: 'Free co-working space' },
        { type: 'credits', description: 'R100k in cloud credits', value: 100000 },
        { type: 'network', description: 'Access to investor network' },
      ],
      requirements: [
        'At least one founder must be Sapiens student/alumni',
        'Working prototype or MVP',
        'Unique value proposition',
        'Scalable business model',
      ],
      participants: [],
      status: 'applications-open',
      applicationDeadline: new Date('2025-01-15'),
    };

    this.programs.set(program.id, program);
  }

  private loadVentureOpportunities(): void {
    // Load funding opportunities, grants, competitions
    console.log('Loading venture opportunities...');
  }

  private startBackgroundJobs(): void {
    // Track startup metrics daily
    setInterval(() => this.updateStartupMetrics(), 24 * 60 * 60 * 1000);

    // Send milestone reminders
    setInterval(() => this.checkMilestones(), 24 * 60 * 60 * 1000);

    // Match startups with opportunities
    setInterval(() => this.matchOpportunities(), 7 * 24 * 60 * 60 * 1000);
  }

  // ===== STARTUP MANAGEMENT =====

  async registerStartup(startup: Omit<Startup, 'id' | 'startupNumber' | 'totalRaised' | 'funding' | 'status' | 'incubationStartDate' | 'metrics'>): Promise<Startup> {
    const newStartup: Startup = {
      ...startup,
      id: `startup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startupNumber: `STARTUP-${this.startupCounter++}`,
      totalRaised: 0,
      funding: [],
      status: 'incubating',
      incubationStartDate: new Date(),
      metrics: {
        users: 0,
        activeUsers: 0,
        revenue: 0,
        mrr: 0,
        burnRate: 0,
        runway: 0,
        cashOnHand: 0,
        growthRate: 0,
        churnRate: 0,
        nps: 0,
        updatedAt: new Date(),
      },
    };

    this.startups.set(newStartup.id, newStartup);

    this.emit('startup-registered', newStartup);

    return newStartup;
  }

  async convertProjectToStartup(project: StudentProject, founders: Founder[]): Promise<Startup> {
    const startup = await this.registerStartup({
      name: `${project.courseName} Venture`,
      tagline: 'Student project turned startup',
      description: project.description,
      founders,
      originProject: project,
      stage: 'idea',
      industry: 'other',
      category: project.technologies,
      founded: new Date(),
      pitch: {
        id: 'pitch_1',
        version: 1,
        problem: 'To be defined',
        solution: project.description,
        uniqueValue: 'Built from academic excellence',
        targetMarket: 'To be researched',
        businessModel: 'To be defined',
        competition: 'To be analyzed',
        traction: `Academic grade: ${project.grade}%`,
        team: founders.map(f => f.name).join(', '),
        financials: 'Early stage',
        ask: 'Seeking mentorship and seed funding',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      businessModel: {
        revenue: [],
        costs: {
          fixed: 0,
          variable: 0,
          development: 0,
          marketing: 0,
          operations: 0,
          salaries: 0,
        },
        pricingStrategy: 'To be determined',
        customerAcquisition: 'To be determined',
        unitEconomics: {
          cac: 0,
          ltv: 0,
          ltvCacRatio: 0,
          paybackPeriod: 0,
          churnRate: 0,
        },
      },
      market: {
        tam: 0,
        sam: 0,
        som: 0,
        marketSize: 'small',
        growthRate: 0,
        competitors: [],
        marketTrends: [],
      },
      traction: {
        users: 0,
        revenue: 0,
        growthRate: 0,
        keyMetrics: {},
        milestones: ['Converted from student project'],
        pressFeatures: [],
      },
      team: founders.map(f => ({
        name: f.name,
        role: f.role,
        bio: f.bio,
        linkedIn: f.linkedIn,
        isFounder: true,
        joinDate: new Date(),
      })),
      advisors: [],
      intellectualProperty: [],
      milestones: [
        {
          id: 'milestone_1',
          title: 'Complete MVP',
          description: 'Build minimum viable product',
          category: 'product',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          status: 'planned',
          impact: 'critical',
        },
      ],
    });

    this.emit('project-converted', { project, startup });

    return startup;
  }

  async updateStartup(startupId: string, updates: Partial<Startup>): Promise<Startup> {
    const startup = this.startups.get(startupId);
    if (!startup) {
      throw new Error('Startup not found');
    }

    Object.assign(startup, updates);

    this.emit('startup-updated', startup);

    return startup;
  }

  // ===== FUNDING =====

  async raiseFunding(startupId: string, round: Omit<FundingRound, 'id'>): Promise<FundingRound> {
    const startup = this.startups.get(startupId);
    if (!startup) {
      throw new Error('Startup not found');
    }

    const newRound: FundingRound = {
      ...round,
      id: `round_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    startup.funding.push(newRound);
    startup.totalRaised += round.amount;
    startup.valuation = round.valuation;
    startup.metrics.cashOnHand += round.amount;
    startup.metrics.runway = startup.metrics.burnRate > 0 
      ? startup.metrics.cashOnHand / startup.metrics.burnRate 
      : 999;

    this.emit('funding-raised', { startup, round: newRound });

    return newRound;
  }

  async registerIP(startupId: string, ip: Omit<IP, 'id'>): Promise<IP> {
    const startup = this.startups.get(startupId);
    if (!startup) {
      throw new Error('Startup not found');
    }

    const newIP: IP = {
      ...ip,
      id: `ip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    startup.intellectualProperty.push(newIP);

    this.emit('ip-registered', { startup, ip: newIP });

    return newIP;
  }

  // ===== MENTORSHIP =====

  async scheduleMentorship(session: Omit<MentorshipSession, 'id' | 'status' | 'actionItems'>): Promise<MentorshipSession> {
    const newSession: MentorshipSession = {
      ...session,
      id: `mentor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'scheduled',
      actionItems: [],
    };

    this.mentorshipSessions.set(newSession.id, newSession);

    this.emit('mentorship-scheduled', newSession);

    return newSession;
  }

  async completeMentorship(sessionId: string, notes: string, actionItems: Omit<ActionItem, 'id' | 'status'>[], feedback: SessionFeedback): Promise<void> {
    const session = this.mentorshipSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'completed';
    session.notes = notes;
    session.actionItems = actionItems.map(item => ({
      ...item,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
    }));
    session.feedback = feedback;

    this.emit('mentorship-completed', session);
  }

  // ===== PROGRAMS =====

  async applyToProgram(application: Omit<StartupApplication, 'id' | 'applicationNumber' | 'status' | 'submittedDate'>): Promise<StartupApplication> {
    const program = this.programs.get(application.programId);
    if (!program) {
      throw new Error('Program not found');
    }

    if (program.status !== 'applications-open') {
      throw new Error('Applications are not open for this program');
    }

    const newApplication: StartupApplication = {
      ...application,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      applicationNumber: `APP-${this.applicationCounter++}`,
      status: 'submitted',
      submittedDate: new Date(),
    };

    this.applications.set(newApplication.id, newApplication);

    this.emit('program-application-submitted', { application: newApplication, program });

    return newApplication;
  }

  async acceptToProgram(applicationId: string): Promise<void> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const program = this.programs.get(application.programId);
    if (!program) {
      throw new Error('Program not found');
    }

    application.status = 'accepted';
    application.reviewedDate = new Date();

    program.participants.push(application.startupId);

    const startup = this.startups.get(application.startupId);
    if (startup) {
      startup.status = 'incubating';
    }

    this.emit('program-accepted', { application, program, startup });
  }

  async graduateStartup(startupId: string): Promise<void> {
    const startup = this.startups.get(startupId);
    if (!startup) {
      throw new Error('Startup not found');
    }

    startup.status = 'graduated';
    startup.graduationDate = new Date();

    this.emit('startup-graduated', startup);
  }

  // ===== MILESTONES =====

  async addMilestone(startupId: string, milestone: Omit<Milestone, 'id' | 'status'>): Promise<Milestone> {
    const startup = this.startups.get(startupId);
    if (!startup) {
      throw new Error('Startup not found');
    }

    const newMilestone: Milestone = {
      ...milestone,
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'planned',
    };

    startup.milestones.push(newMilestone);

    this.emit('milestone-added', { startup, milestone: newMilestone });

    return newMilestone;
  }

  async completeMilestone(startupId: string, milestoneId: string): Promise<void> {
    const startup = this.startups.get(startupId);
    if (!startup) {
      throw new Error('Startup not found');
    }

    const milestone = startup.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    milestone.status = 'completed';
    milestone.completedDate = new Date();

    this.emit('milestone-completed', { startup, milestone });
  }

  // ===== ANALYTICS =====

  async getStartupAnalytics(startupId: string): Promise<any> {
    const startup = this.startups.get(startupId);
    if (!startup) {
      throw new Error('Startup not found');
    }

    return {
      startup,
      performance: {
        stage: startup.stage,
        daysInIncubation: Math.floor((Date.now() - startup.incubationStartDate.getTime()) / (1000 * 60 * 60 * 24)),
        totalRaised: startup.totalRaised,
        currentValuation: startup.valuation,
        fundingRounds: startup.funding.length,
        teamSize: startup.team.length,
        advisors: startup.advisors.length,
      },
      traction: startup.traction,
      metrics: startup.metrics,
      milestones: {
        total: startup.milestones.length,
        completed: startup.milestones.filter(m => m.status === 'completed').length,
        inProgress: startup.milestones.filter(m => m.status === 'in-progress').length,
        missed: startup.milestones.filter(m => m.status === 'missed').length,
      },
    };
  }

  // ===== HELPER METHODS =====

  private async updateStartupMetrics(): Promise<void> {
    console.log('Updating startup metrics...');
    // Would fetch real metrics from startups
  }

  private async checkMilestones(): Promise<void> {
    const now = new Date();
    for (const startup of this.startups.values()) {
      for (const milestone of startup.milestones) {
        if (milestone.status === 'planned' && milestone.targetDate < now) {
          milestone.status = 'missed';
          this.emit('milestone-missed', { startup, milestone });
        }
      }
    }
  }

  private async matchOpportunities(): Promise<void> {
    console.log('Matching startups with opportunities...');
    // Match startups with relevant funding/partnership opportunities
  }
}

export default StartupIncubatorSystem;
