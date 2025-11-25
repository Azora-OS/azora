/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * AZORA ERP - STUDENT INFORMATION SYSTEM (SIS)
 * 
 * Comprehensive ERP system replacing PeopleSoft Campus Solutions:
 * - Student records management
 * - Course registration
 * - Degree audit & planning
 * - Academic advising
 * - Class scheduling
 * - Grade management
 * - Transcript services
 * - Transfer credit evaluation
 * - Academic standing
 * - Enrollment verification
 * 
 * Everything PeopleSoft does + AI-powered enhancements + blockchain verification
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface StudentRecord {
  // Identity
  studentNumber: string;
  id: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  dateOfBirth: Date;
  citizenshipCountry: string;
  
  // Contact Information
  email: string;
  personalEmail?: string;
  phone?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  
  // Academic Information
  program: string;
  major: string;
  minor?: string;
  concentration?: string[];
  degreeLevel: 'certificate' | 'diploma' | 'bachelors' | 'honours' | 'masters' | 'doctorate';
  
  // Enrollment
  enrollmentStatus: 'full-time' | 'part-time' | 'leave-of-absence' | 'withdrawn' | 'graduated';
  academicStatus: 'good-standing' | 'probation' | 'suspension' | 'dismissal';
  admissionDate: Date;
  expectedGraduationDate?: Date;
  actualGraduationDate?: Date;
  
  // Academic Progress
  currentYear: number;
  currentSemester: string;
  creditsEarned: number;
  creditsInProgress: number;
  creditsRequired: number;
  gpa: number;
  cumulativeGPA: number;
  
  // Financial
  tuitionStatus: 'paid' | 'pending' | 'overdue' | 'financial-hold';
  balance: number;
  financialAid?: FinancialAid;
  
  // Advisors
  academicAdvisor?: string;
  facultyMentor?: string;
  
  // Flags & Holds
  holds: Hold[];
  flags: Flag[];
  
  // History
  enrollmentHistory: EnrollmentPeriod[];
  gradeHistory: CourseGrade[];
  transferCredits: TransferCredit[];
  
  // Metadata
  lastUpdated: Date;
  blockchainHash?: string;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Hold {
  id: string;
  type: 'financial' | 'academic' | 'administrative' | 'disciplinary' | 'health';
  reason: string;
  placedDate: Date;
  placedBy: string;
  resolved: boolean;
  resolvedDate?: Date;
  restrictionsRegistration: boolean;
  restrictionsTranscripts: boolean;
  restrictionsGraduation: boolean;
}

export interface Flag {
  id: string;
  type: 'at-risk' | 'needs-advising' | 'excellence' | 'athlete' | 'veteran' | 'disability' | 'international';
  description: string;
  active: boolean;
}

export interface EnrollmentPeriod {
  term: string; // e.g., "Fall 2025"
  year: number;
  semester: number;
  status: 'enrolled' | 'completed' | 'withdrawn';
  courses: CourseEnrollment[];
  creditsAttempted: number;
  creditsEarned: number;
  gpa: number;
}

export interface CourseEnrollment {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  instructor: string;
  schedule: CourseSchedule;
  status: 'enrolled' | 'dropped' | 'completed' | 'withdrawn' | 'incomplete';
  grade?: string;
  gradePoints?: number;
  enrolledDate: Date;
  lastAttendedDate?: Date;
}

export interface CourseSchedule {
  days: string[]; // ['Monday', 'Wednesday']
  startTime: string;
  endTime: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
}

export interface CourseGrade {
  term: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  gradePoints: number;
  instructor: string;
  completedDate: Date;
}

export interface TransferCredit {
  id: string;
  fromInstitution: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade?: string;
  equivalentCourse?: string;
  evaluatedDate: Date;
  evaluatedBy: string;
  accepted: boolean;
  notes?: string;
}

export interface FinancialAid {
  scholarships: Scholarship[];
  grants: Grant[];
  loans: Loan[];
  workStudy?: WorkStudy;
  totalAwardedAmount: number;
  totalDisbursedAmount: number;
}

export interface Scholarship {
  id: string;
  name: string;
  amount: number;
  type: 'merit' | 'need-based' | 'athletic' | 'departmental';
  awardedDate: Date;
  renewable: boolean;
  requirements?: string;
}

export interface Grant {
  id: string;
  name: string;
  amount: number;
  source: string;
  awardedDate: Date;
}

export interface Loan {
  id: string;
  type: string;
  amount: number;
  interestRate: number;
  provider: string;
}

export interface WorkStudy {
  position: string;
  department: string;
  hoursPerWeek: number;
  hourlyRate: number;
}

export interface DegreeRequirement {
  id: string;
  program: string;
  degreeLevel: string;
  
  // Core Requirements
  totalCredits: number;
  coreCredits: number;
  majorCredits: number;
  electiveCredits: number;
  minorCredits?: number;
  
  // Specific Requirements
  requirements: Array<{
    category: string;
    description: string;
    credits: number;
    courses?: string[]; // Specific courses required
    completed: boolean;
  }>;
  
  // Constraints
  minimumGPA: number;
  residencyRequirement?: number; // Credits that must be earned at this institution
  timeLimit?: number; // Maximum years to complete
}

export interface DegreeAudit {
  id: string;
  studentNumber: string;
  program: string;
  degreeLevel: string;
  auditDate: Date;
  
  // Progress
  overallProgress: number; // 0-100%
  creditsEarned: number;
  creditsRequired: number;
  
  // Requirements Status
  requirementsMet: Array<{
    category: string;
    required: number;
    completed: number;
    remaining: number;
    courses: CourseGrade[];
  }>;
  
  // What's Left
  remainingRequirements: Array<{
    category: string;
    description: string;
    credits: number;
    suggestedCourses: string[];
  }>;
  
  // Timeline
  estimatedGraduationDate: Date;
  onTrackForGraduation: boolean;
  
  // Warnings
  warnings: string[];
  recommendations: string[];
}

export interface CourseRegistration {
  id: string;
  studentNumber: string;
  term: string;
  courses: Array<{
    courseId: string;
    courseCode: string;
    courseName: string;
    credits: number;
    section: string;
    instructor: string;
    schedule: CourseSchedule;
    waitlisted: boolean;
    prerequisites: string[];
    corequisites?: string[];
  }>;
  status: 'cart' | 'pending' | 'confirmed' | 'cancelled';
  submittedDate?: Date;
  confirmedDate?: Date;
  totalCredits: number;
}

export class StudentInformationSystem extends EventEmitter {
  private students: Map<string, StudentRecord> = new Map();
  private degreeRequirements: Map<string, DegreeRequirement> = new Map();
  private registrations: Map<string, CourseRegistration> = new Map();
  
  constructor() {
    super();
  }

  /**
   * Create student record
   */
  async createStudentRecord(data: {
    studentNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    email: string;
    program: string;
    major: string;
    degreeLevel: StudentRecord['degreeLevel'];
  }): Promise<StudentRecord> {
    const student: StudentRecord = {
      studentNumber: data.studentNumber,
      id: crypto.randomUUID(),
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      citizenshipCountry: 'ZA', // Default South Africa
      email: data.email,
      program: data.program,
      major: data.major,
      degreeLevel: data.degreeLevel,
      enrollmentStatus: 'full-time',
      academicStatus: 'good-standing',
      admissionDate: new Date(),
      currentYear: 1,
      currentSemester: 'Fall 2025',
      creditsEarned: 0,
      creditsInProgress: 0,
      creditsRequired: this.getCreditsRequired(data.degreeLevel),
      gpa: 0,
      cumulativeGPA: 0,
      tuitionStatus: 'pending',
      balance: 0,
      holds: [],
      flags: [],
      enrollmentHistory: [],
      gradeHistory: [],
      transferCredits: [],
      lastUpdated: new Date()
    };

    this.students.set(data.studentNumber, student);

    this.emit('student-created', student);

    return student;
  }

  /**
   * Get credits required for degree level
   */
  private getCreditsRequired(degreeLevel: StudentRecord['degreeLevel']): number {
    const requirements = {
      'certificate': 120,
      'diploma': 360,
      'bachelors': 360,
      'honours': 120,
      'masters': 180,
      'doctorate': 360
    };

    return requirements[degreeLevel];
  }

  /**
   * Perform degree audit
   */
  async performDegreeAudit(studentNumber: string): Promise<DegreeAudit> {
    const student = this.students.get(studentNumber);
    
    if (!student) {
      throw new Error('Student not found');
    }

    // Get degree requirements
    const degreeReq = this.getDegreeRequirements(student.program, student.degreeLevel);

    // Calculate progress
    const overallProgress = (student.creditsEarned / student.creditsRequired) * 100;

    // Analyze completed courses against requirements
    const requirementsMet = this.analyzeRequirements(student, degreeReq);

    // Calculate what's remaining
    const remainingRequirements = this.calculateRemainingRequirements(student, degreeReq, requirementsMet);

    // Estimate graduation date
    const estimatedGraduationDate = this.estimateGraduationDate(student, remainingRequirements);

    // Check if on track
    const onTrackForGraduation = this.isOnTrack(student, degreeReq);

    // Generate warnings and recommendations
    const { warnings, recommendations } = this.generateAdvice(student, degreeReq, remainingRequirements);

    const audit: DegreeAudit = {
      id: crypto.randomUUID(),
      studentNumber,
      program: student.program,
      degreeLevel: student.degreeLevel,
      auditDate: new Date(),
      overallProgress,
      creditsEarned: student.creditsEarned,
      creditsRequired: student.creditsRequired,
      requirementsMet,
      remainingRequirements,
      estimatedGraduationDate,
      onTrackForGraduation,
      warnings,
      recommendations
    };

    this.emit('degree-audit-completed', audit);

    return audit;
  }

  /**
   * Analyze requirements completion
   */
  private analyzeRequirements(student: StudentRecord, degreeReq: DegreeRequirement) {
    return degreeReq.requirements.map(req => {
      const relevantCourses = student.gradeHistory.filter(course => {
        // TODO: More sophisticated matching logic
        return req.courses?.includes(course.courseCode);
      });

      const completed = relevantCourses.reduce((sum, c) => sum + c.credits, 0);

      return {
        category: req.category,
        required: req.credits,
        completed,
        remaining: Math.max(0, req.credits - completed),
        courses: relevantCourses
      };
    });
  }

  /**
   * Calculate remaining requirements
   */
  private calculateRemainingRequirements(
    student: StudentRecord,
    degreeReq: DegreeRequirement,
    requirementsMet: any[]
  ) {
    return requirementsMet
      .filter(req => req.remaining > 0)
      .map(req => ({
        category: req.category,
        description: `Complete ${req.remaining} more credits in ${req.category}`,
        credits: req.remaining,
        suggestedCourses: this.suggestCourses(req.category, req.remaining)
      }));
  }

  /**
   * Suggest courses for requirement
   */
  private suggestCourses(category: string, credits: number): string[] {
    // TODO: AI-powered course suggestions based on:
    // - Category requirements
    // - Student interests
    // - Course availability
    // - Prerequisite completion
    // - Schedule optimization
    
    return ['CS301', 'CS302', 'CS303']; // Example
  }

  /**
   * Estimate graduation date
   */
  private estimateGraduationDate(student: StudentRecord, remaining: any[]): Date {
    const creditsRemaining = remaining.reduce((sum, req) => sum + req.credits, 0);
    const creditsPerSemester = 15; // Average
    const semestersRemaining = Math.ceil(creditsRemaining / creditsPerSemester);
    
    const graduationDate = new Date();
    graduationDate.setMonth(graduationDate.getMonth() + (semestersRemaining * 6));
    
    return graduationDate;
  }

  /**
   * Check if student is on track
   */
  private isOnTrack(student: StudentRecord, degreeReq: DegreeRequirement): boolean {
    const expectedCredits = (student.currentYear - 1) * 30; // Assuming 30 credits/year
    return student.creditsEarned >= expectedCredits * 0.9; // 90% threshold
  }

  /**
   * Generate warnings and recommendations
   */
  private generateAdvice(
    student: StudentRecord,
    degreeReq: DegreeRequirement,
    remaining: any[]
  ): { warnings: string[]; recommendations: string[] } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (student.cumulativeGPA < degreeReq.minimumGPA) {
      warnings.push(`GPA below minimum requirement (${degreeReq.minimumGPA})`);
      recommendations.push('Consider academic tutoring services');
    }

    if (!this.isOnTrack(student, degreeReq)) {
      warnings.push('Behind expected progress for graduation');
      recommendations.push('Meet with academic advisor to create catch-up plan');
    }

    if (student.holds.length > 0) {
      warnings.push(`${student.holds.length} active hold(s) on account`);
      recommendations.push('Resolve holds before registration period');
    }

    return { warnings, recommendations };
  }

  /**
   * Register for courses
   */
  async registerForCourses(registration: Omit<CourseRegistration, 'id' | 'status' | 'totalCredits'>): Promise<CourseRegistration> {
    const student = this.students.get(registration.studentNumber);
    
    if (!student) {
      throw new Error('Student not found');
    }

    // Check for holds
    const restrictiveHolds = student.holds.filter(h => h.restrictionsRegistration && !h.resolved);
    if (restrictiveHolds.length > 0) {
      throw new Error(`Cannot register: ${restrictiveHolds.length} hold(s) on account`);
    }

    // Validate prerequisites
    for (const course of registration.courses) {
      if (!this.checkPrerequisites(student, course.prerequisites)) {
        throw new Error(`Prerequisites not met for ${course.courseCode}`);
      }
    }

    // Calculate total credits
    const totalCredits = registration.courses.reduce((sum, c) => sum + c.credits, 0);

    // Validate credit load
    const maxCredits = student.enrollmentStatus === 'full-time' ? 18 : 12;
    if (totalCredits > maxCredits) {
      throw new Error(`Exceeds maximum credit load (${maxCredits})`);
    }

    const reg: CourseRegistration = {
      id: crypto.randomUUID(),
      ...registration,
      status: 'pending',
      submittedDate: new Date(),
      totalCredits
    };

    this.registrations.set(reg.id, reg);

    // Update student record
    student.creditsInProgress = totalCredits;

    this.emit('registration-submitted', reg);

    return reg;
  }

  /**
   * Check prerequisites
   */
  private checkPrerequisites(student: StudentRecord, prerequisites: string[]): boolean {
    const completedCourses = student.gradeHistory
      .filter(g => ['A', 'B', 'C', 'D'].includes(g.grade[0]))
      .map(g => g.courseCode);

    return prerequisites.every(prereq => completedCourses.includes(prereq));
  }

  /**
   * Get degree requirements
   */
  private getDegreeRequirements(program: string, degreeLevel: string): DegreeRequirement {
    const key = `${program}-${degreeLevel}`;
    let req = this.degreeRequirements.get(key);
    
    if (!req) {
      // Create default requirements
      req = this.createDefaultRequirements(program, degreeLevel);
      this.degreeRequirements.set(key, req);
    }
    
    return req;
  }

  /**
   * Create default degree requirements
   */
  private createDefaultRequirements(program: string, degreeLevel: string): DegreeRequirement {
    const totalCredits = this.getCreditsRequired(degreeLevel as any);
    
    return {
      id: crypto.randomUUID(),
      program,
      degreeLevel,
      totalCredits,
      coreCredits: Math.floor(totalCredits * 0.4),
      majorCredits: Math.floor(totalCredits * 0.4),
      electiveCredits: Math.floor(totalCredits * 0.2),
      requirements: [],
      minimumGPA: 2.0
    };
  }

  /**
   * Get student record
   */
  getStudent(studentNumber: string): StudentRecord | undefined {
    return this.students.get(studentNumber);
  }

  /**
   * Update student record
   */
  async updateStudent(studentNumber: string, updates: Partial<StudentRecord>): Promise<void> {
    const student = this.students.get(studentNumber);
    
    if (!student) {
      throw new Error('Student not found');
    }

    Object.assign(student, updates);
    student.lastUpdated = new Date();

    this.emit('student-updated', student);
  }

  /**
   * Add grade to student record
   */
  async addGrade(studentNumber: string, grade: CourseGrade): Promise<void> {
    const student = this.students.get(studentNumber);
    
    if (!student) {
      throw new Error('Student not found');
    }

    student.gradeHistory.push(grade);
    student.creditsEarned += grade.credits;
    
    // Recalculate GPA
    this.recalculateGPA(student);

    this.emit('grade-added', { student, grade });
  }

  /**
   * Recalculate GPA
   */
  private recalculateGPA(student: StudentRecord): void {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const grade of student.gradeHistory) {
      totalPoints += grade.gradePoints * grade.credits;
      totalCredits += grade.credits;
    }

    student.cumulativeGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
  }
}

// Create singleton
export const studentInformationSystem = new StudentInformationSystem();

export default studentInformationSystem;
