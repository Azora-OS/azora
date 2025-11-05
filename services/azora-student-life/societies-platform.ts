/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * STUDENT SOCIETIES & CLUBS PLATFORM
 * 
 * Comprehensive platform for student organizations (societies.azora.world):
 * - Create and manage societies/clubs
 * - Join societies
 * - Event management
 * - Member management
 * - Society funding & budgets
 * - Elections & governance
 * - Communication tools
 * - Activity tracking
 * - Recognition & awards
 * 
 * Better than traditional university systems with AI matching,
 * blockchain verification, and global virtual participation
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export enum SocietyCategory {
  ACADEMIC = 'academic',
  CULTURAL = 'cultural',
  SPORTS = 'sports',
  ARTS = 'arts',
  TECHNOLOGY = 'technology',
  ENTREPRENEURSHIP = 'entrepreneurship',
  COMMUNITY_SERVICE = 'community_service',
  ENVIRONMENTAL = 'environmental',
  POLITICAL = 'political',
  RELIGIOUS = 'religious',
  PROFESSIONAL = 'professional',
  GAMING = 'gaming',
  MEDIA = 'media',
  SOCIAL = 'social',
  SPECIAL_INTEREST = 'special_interest',
}

export enum MemberRole {
  MEMBER = 'member',
  OFFICER = 'officer',
  TREASURER = 'treasurer',
  SECRETARY = 'secretary',
  VICE_PRESIDENT = 'vice_president',
  PRESIDENT = 'president',
  ADVISOR = 'advisor',
  FOUNDER = 'founder',
}

export enum SocietyStatus {
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DISSOLVED = 'dissolved',
}

export interface Society {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: SocietyCategory;
  subcategories: string[];
  
  // Leadership
  president: string; // Student number
  vicePresident?: string;
  treasurer?: string;
  secretary?: string;
  advisor?: string; // Faculty advisor
  
  // Members
  members: SocietyMember[];
  memberCount: number;
  maxMembers?: number;
  
  // Status
  status: SocietyStatus;
  foundedDate: Date;
  recognizedDate?: Date;
  
  // Identity
  logo?: string;
  banner?: string;
  colors?: string[];
  motto?: string;
  
  // Contact
  email: string; // society@societies.azora.world
  website?: string;
  socialMedia?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    discord?: string;
  };
  
  // Meetings
  meetingSchedule?: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'irregular';
    dayOfWeek?: string;
    time?: string;
    location?: string; // Virtual link or physical location
  };
  
  // Financial
  budget: {
    allocated: number;
    spent: number;
    fundraised: number;
  };
  bankAccount?: string;
  
  // Requirements
  requirements?: {
    minimumGPA?: number;
    major?: string[];
    year?: number[];
    interviewRequired?: boolean;
    applicationRequired?: boolean;
  };
  
  // Activities
  eventsHosted: number;
  activitiesThisYear: number;
  
  // Recognition
  awards: Award[];
  achievements: string[];
  
  // Settings
  isPublic: boolean;
  allowJoinRequests: boolean;
  requiresApproval: boolean;
  
  metadata: {
    constitution?: string; // Link to constitution document
    bylaws?: string;
    votingHistory?: VotingRecord[];
    totalBudgetHistory?: number;
  };
}

export interface SocietyMember {
  studentNumber: string;
  studentName: string;
  email: string;
  role: MemberRole;
  joinedDate: Date;
  status: 'active' | 'inactive' | 'alumni';
  contributions: number; // Participation score
  attendance: {
    meetingsAttended: number;
    eventsAttended: number;
  };
}

export interface SocietyEvent {
  id: string;
  societyId: string;
  societyName: string;
  
  // Event Info
  title: string;
  description: string;
  category: 'meeting' | 'workshop' | 'social' | 'fundraiser' | 'competition' | 'conference' | 'other';
  
  // Schedule
  startTime: Date;
  endTime: Date;
  timezone: string;
  
  // Location
  isVirtual: boolean;
  location?: string;
  virtualLink?: string;
  
  // Registration
  requiresRegistration: boolean;
  maxAttendees?: number;
  registeredAttendees: string[]; // Student numbers
  attendees: string[]; // Actually attended
  
  // Cost
  isFree: boolean;
  cost?: number;
  
  // Media
  poster?: string;
  photos?: string[];
  recording?: string;
  
  // Status
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  
  // Feedback
  feedback?: {
    rating: number;
    comments: string[];
  };
}

export interface JoinRequest {
  id: string;
  societyId: string;
  studentNumber: string;
  studentName: string;
  email: string;
  message: string;
  submittedDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedDate?: Date;
  reviewNotes?: string;
}

export interface FundingRequest {
  id: string;
  societyId: string;
  amount: number;
  purpose: string;
  justification: string;
  budget: {
    itemized: Array<{ item: string; cost: number }>;
    total: number;
  };
  submittedDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'partially_approved';
  approvedAmount?: number;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface Election {
  id: string;
  societyId: string;
  position: MemberRole;
  candidates: Array<{
    studentNumber: string;
    name: string;
    statement: string;
    votes: number;
  }>;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  eligibleVoters: string[];
  votedMembers: string[];
  winner?: string;
}

export interface VotingRecord {
  id: string;
  date: Date;
  type: 'election' | 'amendment' | 'motion';
  description: string;
  result: 'passed' | 'failed';
  votes: { for: number; against: number; abstain: number };
}

export interface Award {
  id: string;
  name: string;
  description: string;
  awardedDate: Date;
  awardedBy: string;
}

export class SocietiesPlatformService extends EventEmitter {
  private societies: Map<string, Society> = new Map();
  private events: Map<string, SocietyEvent> = new Map();
  private joinRequests: Map<string, JoinRequest> = new Map();
  private fundingRequests: Map<string, FundingRequest> = new Map();
  private elections: Map<string, Election> = new Map();
  
  // Configuration
  private readonly MIN_FOUNDING_MEMBERS = 5;
  private readonly ANNUAL_BUDGET_PER_MEMBER = 100; // Base budget
  
  constructor() {
    super();
  }

  /**
   * Create new society
   */
  async createSociety(request: {
    name: string;
    description: string;
    category: SocietyCategory;
    foundingMembers: string[]; // Student numbers
    president: string;
    advisor?: string;
  }): Promise<Society> {
    // Validate founding members
    if (request.foundingMembers.length < this.MIN_FOUNDING_MEMBERS) {
      throw new Error(`Minimum ${this.MIN_FOUNDING_MEMBERS} founding members required`);
    }

    // Check if president is in founding members
    if (!request.foundingMembers.includes(request.president)) {
      throw new Error('President must be one of the founding members');
    }

    const societyId = crypto.randomUUID();
    const shortName = this.generateShortName(request.name);
    const email = `${shortName.toLowerCase()}@societies.azora.world`;

    // Create founding members
    const members: SocietyMember[] = request.foundingMembers.map(studentNumber => ({
      studentNumber,
      studentName: `Student ${studentNumber}`, // TODO: Fetch from user service
      email: `${studentNumber}@ac.azora.world`,
      role: studentNumber === request.president ? MemberRole.PRESIDENT : 
            studentNumber === request.advisor ? MemberRole.ADVISOR : MemberRole.FOUNDER,
      joinedDate: new Date(),
      status: 'active',
      contributions: 0,
      attendance: {
        meetingsAttended: 0,
        eventsAttended: 0
      }
    }));

    const society: Society = {
      id: societyId,
      name: request.name,
      shortName,
      description: request.description,
      category: request.category,
      subcategories: [],
      president: request.president,
      advisor: request.advisor,
      members,
      memberCount: members.length,
      status: SocietyStatus.PENDING_APPROVAL,
      foundedDate: new Date(),
      email,
      budget: {
        allocated: 0,
        spent: 0,
        fundraised: 0
      },
      eventsHosted: 0,
      activitiesThisYear: 0,
      awards: [],
      achievements: [],
      isPublic: true,
      allowJoinRequests: true,
      requiresApproval: true,
      metadata: {}
    };

    this.societies.set(societyId, society);

    // Emit event
    this.emit('society-created', society);

    // Provision society email
    this.emit('provision-email', {
      email,
      societyId,
      societyName: request.name
    });

    console.log(`[SOCIETIES] Created society: ${request.name} (${societyId})`);

    return society;
  }

  /**
   * Generate short name for society
   */
  private generateShortName(name: string): string {
    // Take first letters of each word
    const words = name.split(' ').filter(w => w.length > 2);
    if (words.length <= 3) {
      return words.map(w => w[0]).join('').toUpperCase();
    }
    
    // For longer names, use abbreviation logic
    return name
      .split(' ')
      .filter(w => w.length > 3 || ['and', 'the', 'of'].includes(w.toLowerCase()))
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .substring(0, 5);
  }

  /**
   * Request to join society
   */
  async requestToJoin(request: {
    societyId: string;
    studentNumber: string;
    message: string;
  }): Promise<JoinRequest> {
    const society = this.societies.get(request.societyId);
    
    if (!society) {
      throw new Error('Society not found');
    }

    if (!society.allowJoinRequests) {
      throw new Error('This society is not accepting join requests');
    }

    // Check if already a member
    if (society.members.some(m => m.studentNumber === request.studentNumber)) {
      throw new Error('Already a member of this society');
    }

    const requestId = crypto.randomUUID();

    const joinRequest: JoinRequest = {
      id: requestId,
      societyId: request.societyId,
      studentNumber: request.studentNumber,
      studentName: `Student ${request.studentNumber}`, // TODO: Fetch from user service
      email: `${request.studentNumber}@ac.azora.world`,
      message: request.message,
      submittedDate: new Date(),
      status: 'pending'
    };

    this.joinRequests.set(requestId, joinRequest);

    // Notify society leadership
    this.emit('join-request-submitted', {
      society,
      request: joinRequest
    });

    return joinRequest;
  }

  /**
   * Approve/reject join request
   */
  async reviewJoinRequest(
    requestId: string,
    reviewedBy: string,
    decision: 'approved' | 'rejected',
    notes?: string
  ): Promise<void> {
    const joinRequest = this.joinRequests.get(requestId);
    
    if (!joinRequest) {
      throw new Error('Join request not found');
    }

    const society = this.societies.get(joinRequest.societyId);
    
    if (!society) {
      throw new Error('Society not found');
    }

    // Verify reviewer is authorized (president, vice president, or advisor)
    const reviewer = society.members.find(m => m.studentNumber === reviewedBy);
    if (!reviewer || ![MemberRole.PRESIDENT, MemberRole.VICE_PRESIDENT, MemberRole.ADVISOR].includes(reviewer.role)) {
      throw new Error('Unauthorized to review requests');
    }

    joinRequest.status = decision;
    joinRequest.reviewedBy = reviewedBy;
    joinRequest.reviewedDate = new Date();
    joinRequest.reviewNotes = notes;

    if (decision === 'approved') {
      // Add member to society
      const newMember: SocietyMember = {
        studentNumber: joinRequest.studentNumber,
        studentName: joinRequest.studentName,
        email: joinRequest.email,
        role: MemberRole.MEMBER,
        joinedDate: new Date(),
        status: 'active',
        contributions: 0,
        attendance: {
          meetingsAttended: 0,
          eventsAttended: 0
        }
      };

      society.members.push(newMember);
      society.memberCount++;

      this.emit('member-joined', {
        society,
        member: newMember
      });
    }

    // Notify student
    this.emit('join-request-reviewed', {
      request: joinRequest,
      decision
    });
  }

  /**
   * Create society event
   */
  async createEvent(request: {
    societyId: string;
    title: string;
    description: string;
    category: SocietyEvent['category'];
    startTime: Date;
    endTime: Date;
    isVirtual: boolean;
    location?: string;
    virtualLink?: string;
    maxAttendees?: number;
    cost?: number;
  }): Promise<SocietyEvent> {
    const society = this.societies.get(request.societyId);
    
    if (!society) {
      throw new Error('Society not found');
    }

    const eventId = crypto.randomUUID();

    const event: SocietyEvent = {
      id: eventId,
      societyId: request.societyId,
      societyName: society.name,
      title: request.title,
      description: request.description,
      category: request.category,
      startTime: request.startTime,
      endTime: request.endTime,
      timezone: 'UTC',
      isVirtual: request.isVirtual,
      location: request.location,
      virtualLink: request.virtualLink,
      requiresRegistration: !!request.maxAttendees,
      maxAttendees: request.maxAttendees,
      registeredAttendees: [],
      attendees: [],
      isFree: !request.cost || request.cost === 0,
      cost: request.cost,
      status: 'scheduled'
    };

    this.events.set(eventId, event);

    // Update society statistics
    society.eventsHosted++;
    society.activitiesThisYear++;

    // Emit event
    this.emit('event-created', {
      society,
      event
    });

    return event;
  }

  /**
   * Register for event
   */
  async registerForEvent(eventId: string, studentNumber: string): Promise<void> {
    const event = this.events.get(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'scheduled') {
      throw new Error('Event registration is closed');
    }

    if (event.maxAttendees && event.registeredAttendees.length >= event.maxAttendees) {
      throw new Error('Event is full');
    }

    if (event.registeredAttendees.includes(studentNumber)) {
      throw new Error('Already registered for this event');
    }

    event.registeredAttendees.push(studentNumber);

    this.emit('event-registration', {
      event,
      studentNumber
    });
  }

  /**
   * Request funding from university
   */
  async requestFunding(request: {
    societyId: string;
    amount: number;
    purpose: string;
    justification: string;
    budget: FundingRequest['budget'];
  }): Promise<FundingRequest> {
    const society = this.societies.get(request.societyId);
    
    if (!society) {
      throw new Error('Society not found');
    }

    const requestId = crypto.randomUUID();

    const fundingRequest: FundingRequest = {
      id: requestId,
      societyId: request.societyId,
      amount: request.amount,
      purpose: request.purpose,
      justification: request.justification,
      budget: request.budget,
      submittedDate: new Date(),
      status: 'pending'
    };

    this.fundingRequests.set(requestId, fundingRequest);

    this.emit('funding-requested', {
      society,
      request: fundingRequest
    });

    return fundingRequest;
  }

  /**
   * Start election for position
   */
  async startElection(request: {
    societyId: string;
    position: MemberRole;
    candidates: Array<{ studentNumber: string; statement: string }>;
    duration: number; // days
  }): Promise<Election> {
    const society = this.societies.get(request.societyId);
    
    if (!society) {
      throw new Error('Society not found');
    }

    const electionId = crypto.randomUUID();
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + request.duration * 24 * 60 * 60 * 1000);

    const election: Election = {
      id: electionId,
      societyId: request.societyId,
      position: request.position,
      candidates: request.candidates.map(c => ({
        studentNumber: c.studentNumber,
        name: `Student ${c.studentNumber}`,
        statement: c.statement,
        votes: 0
      })),
      startDate,
      endDate,
      status: 'active',
      eligibleVoters: society.members
        .filter(m => m.status === 'active' && m.role !== MemberRole.ADVISOR)
        .map(m => m.studentNumber),
      votedMembers: []
    };

    this.elections.set(electionId, election);

    this.emit('election-started', {
      society,
      election
    });

    return election;
  }

  /**
   * Vote in election
   */
  async vote(electionId: string, voterNumber: string, candidateNumber: string): Promise<void> {
    const election = this.elections.get(electionId);
    
    if (!election) {
      throw new Error('Election not found');
    }

    if (election.status !== 'active') {
      throw new Error('Election is not active');
    }

    if (!election.eligibleVoters.includes(voterNumber)) {
      throw new Error('Not eligible to vote in this election');
    }

    if (election.votedMembers.includes(voterNumber)) {
      throw new Error('Already voted in this election');
    }

    const candidate = election.candidates.find(c => c.studentNumber === candidateNumber);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    candidate.votes++;
    election.votedMembers.push(voterNumber);

    // Check if election should end
    if (new Date() >= election.endDate || election.votedMembers.length === election.eligibleVoters.length) {
      await this.concludeElection(electionId);
    }
  }

  /**
   * Conclude election
   */
  private async concludeElection(electionId: string): Promise<void> {
    const election = this.elections.get(electionId);
    
    if (!election) return;

    election.status = 'completed';

    // Determine winner
    const winner = election.candidates.reduce((prev, current) => 
      current.votes > prev.votes ? current : prev
    );

    election.winner = winner.studentNumber;

    // Update society leadership
    const society = this.societies.get(election.societyId);
    if (society) {
      // Update role in society
      const member = society.members.find(m => m.studentNumber === winner.studentNumber);
      if (member) {
        member.role = election.position;
      }

      // Update society leadership positions
      if (election.position === MemberRole.PRESIDENT) {
        society.president = winner.studentNumber;
      } else if (election.position === MemberRole.VICE_PRESIDENT) {
        society.vicePresident = winner.studentNumber;
      } else if (election.position === MemberRole.TREASURER) {
        society.treasurer = winner.studentNumber;
      } else if (election.position === MemberRole.SECRETARY) {
        society.secretary = winner.studentNumber;
      }

      // Record in voting history
      society.metadata.votingHistory = society.metadata.votingHistory || [];
      society.metadata.votingHistory.push({
        id: election.id,
        date: new Date(),
        type: 'election',
        description: `Election for ${election.position}`,
        result: 'passed',
        votes: {
          for: winner.votes,
          against: 0,
          abstain: election.eligibleVoters.length - election.votedMembers.length
        }
      });
    }

    this.emit('election-completed', {
      society,
      election,
      winner
    });
  }

  /**
   * Get all societies
   */
  getAllSocieties(filters?: {
    category?: SocietyCategory;
    status?: SocietyStatus;
    searchQuery?: string;
  }): Society[] {
    let societies = Array.from(this.societies.values());

    if (filters?.category) {
      societies = societies.filter(s => s.category === filters.category);
    }

    if (filters?.status) {
      societies = societies.filter(s => s.status === filters.status);
    }

    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      societies = societies.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    return societies;
  }

  /**
   * Get societies by student
   */
  getSocietiesByStudent(studentNumber: string): Society[] {
    return Array.from(this.societies.values())
      .filter(s => s.members.some(m => m.studentNumber === studentNumber));
  }

  /**
   * Get recommended societies (AI-powered)
   */
  getRecommendedSocieties(studentNumber: string, studentProfile: {
    major?: string;
    interests?: string[];
    year?: number;
  }): Society[] {
    // TODO: Implement AI-based recommendations
    // Based on: major, interests, current societies, friends' societies, etc.
    
    return this.getAllSocieties({ status: SocietyStatus.ACTIVE }).slice(0, 10);
  }

  /**
   * Get society by ID
   */
  getSociety(societyId: string): Society | undefined {
    return this.societies.get(societyId);
  }

  /**
   * Get upcoming events
   */
  getUpcomingEvents(limit?: number): SocietyEvent[] {
    const now = new Date();
    const events = Array.from(this.events.values())
      .filter(e => e.status === 'scheduled' && e.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return limit ? events.slice(0, limit) : events;
  }
}

// Create singleton
export const societiesPlatformService = new SocietiesPlatformService();

export default societiesPlatformService;
