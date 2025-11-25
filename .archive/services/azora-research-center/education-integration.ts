/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * RESEARCH CENTER → EDUCATION INTEGRATION
 * 
 * Creates feedback loop between research and education:
 * 
 * RESEARCH → EDUCATION:
 * - Curriculum recommendations based on emerging trends
 * - New course suggestions from research breakthroughs
 * - Updated reading materials from publications
 * - Industry-aligned skill requirements
 * - Future-focused curriculum updates
 * 
 * EDUCATION → RESEARCH:
 * - Student researchers join projects
 * - Course projects contribute to research
 * - Student feedback on emerging topics
 * - Talent pipeline for labs
 * - Real-world problem identification
 */

import { EventEmitter } from 'events';
import { azoraResearchCenter, CurriculumRecommendation, ResearchProject } from './research-center';

export interface CurriculumUpdate {
  id: string;
  recommendationId: string;
  courseId?: string;
  programId?: string;
  
  // Changes
  updateType: 'content' | 'syllabus' | 'readings' | 'projects' | 'entire_course';
  changes: {
    added?: string[];
    modified?: string[];
    removed?: string[];
  };
  
  // Implementation
  implementedBy: string;
  implementedDate: Date;
  effectiveTerm: string; // e.g., "Fall 2026"
  
  // Impact
  studentsAffected: number;
  feedbackScore?: number; // Student feedback (0-5)
  employmentImpact?: string;
}

export interface ResearchOpportunity {
  id: string;
  projectId: string;
  
  // Role
  role: 'research_assistant' | 'phd_student' | 'masters_student' | 'intern';
  positions: number;
  
  // Requirements
  requiredSkills: string[];
  preferredCourses: string[];
  minimumGPA?: number;
  commitmentHours: number; // per week
  
  // Compensation
  stipend?: number;
  credits?: number; // Academic credits
  
  // Timeline
  startDate: Date;
  duration: number; // months
  
  // Application
  applicants: string[];
  accepted: string[];
}

export class ResearchEducationIntegration extends EventEmitter {
  private curriculumUpdates: Map<string, CurriculumUpdate> = new Map();
  private opportunities: Map<string, ResearchOpportunity> = new Map();
  
  constructor() {
    super();
    this.setupIntegration();
  }

  /**
   * Setup integration between research and education
   */
  private setupIntegration(): void {
    // Listen to research center recommendations
    azoraResearchCenter.on('curriculum-recommendation', (recommendation: CurriculumRecommendation) => {
      this.handleCurriculumRecommendation(recommendation);
    });

    // Listen to new projects
    azoraResearchCenter.on('project-created', (project: ResearchProject) => {
      this.createResearchOpportunities(project);
    });

    // Listen to publications
    azoraResearchCenter.on('add-to-library', (data: any) => {
      this.addPublicationToCurriculum(data.publication, data.project);
    });

    console.log('[INTEGRATION] ✓ Research ↔ Education integration active');
  }

  /**
   * Handle curriculum recommendation from research center
   */
  private async handleCurriculumRecommendation(recommendation: CurriculumRecommendation): Promise<void> {
    console.log(`[INTEGRATION] New curriculum recommendation: ${recommendation.type} (${recommendation.priority})`);

    // Auto-approve low priority recommendations
    if (recommendation.priority === 'low') {
      recommendation.status = 'approved';
    }

    // Send to department heads for review
    this.emit('curriculum-recommendation-received', recommendation);

    // If critical, send immediate alert
    if (recommendation.priority === 'critical') {
      this.emit('urgent-curriculum-update', {
        recommendation,
        message: `URGENT: Industry trends require immediate curriculum update`,
        recipients: ['dean', 'department-heads', 'curriculum-committee']
      });
    }

    // Generate implementation plan
    const implementationPlan = this.generateImplementationPlan(recommendation);
    
    this.emit('implementation-plan-generated', {
      recommendation,
      plan: implementationPlan
    });
  }

  /**
   * Generate implementation plan for recommendation
   */
  private generateImplementationPlan(recommendation: CurriculumRecommendation): {
    steps: string[];
    timeline: string;
    resources: string[];
    stakeholders: string[];
  } {
    const steps: string[] = [];
    const resources: string[] = [];
    const stakeholders = ['Department Head', 'Course Coordinator', 'IT Support'];

    switch (recommendation.type) {
      case 'new_course':
        steps.push('1. Approve new course proposal');
        steps.push('2. Assign course coordinator');
        steps.push('3. Develop course syllabus');
        steps.push('4. Create learning materials');
        steps.push('5. Set up course in LMS');
        steps.push('6. Market course to students');
        resources.push('Course development budget', 'LMS configuration', 'Marketing materials');
        stakeholders.push('Curriculum Committee', 'Dean');
        break;

      case 'update_course':
        steps.push('1. Review current course content');
        steps.push('2. Identify sections to update');
        steps.push('3. Develop new materials');
        steps.push('4. Update syllabus');
        steps.push('5. Update LMS content');
        steps.push('6. Notify enrolled students');
        resources.push('Updated readings', 'New assignments', 'Video content');
        break;

      case 'add_module':
        steps.push('1. Design module structure');
        steps.push('2. Create module content');
        steps.push('3. Integrate into existing course');
        steps.push('4. Update assessments');
        steps.push('5. Deploy to LMS');
        resources.push('Module materials', 'Assessment rubrics');
        break;

      case 'add_topic':
        steps.push('1. Review topic relevance');
        steps.push('2. Create lecture materials');
        steps.push('3. Update course schedule');
        steps.push('4. Add readings/resources');
        steps.push('5. Update assessments');
        resources.push('Lecture slides', 'Reading materials');
        break;

      case 'update_textbook':
        steps.push('1. Evaluate new textbook/materials');
        steps.push('2. Get department approval');
        steps.push('3. Update syllabus');
        steps.push('4. Notify bookstore');
        steps.push('5. Notify students');
        resources.push('New textbook/materials', 'Budget for materials');
        break;
    }

    const timeline = this.getTimelineText(recommendation.priority);

    return {
      steps,
      timeline,
      resources,
      stakeholders
    };
  }

  /**
   * Get timeline text based on priority
   */
  private getTimelineText(priority: string): string {
    switch (priority) {
      case 'critical':
        return '1 month - Implement immediately';
      case 'high':
        return '3 months - Implement next semester';
      case 'medium':
        return '6 months - Plan for next academic year';
      default:
        return '12 months - Long-term planning';
    }
  }

  /**
   * Create research opportunities from project
   */
  private async createResearchOpportunities(project: ResearchProject): Promise<void> {
    // Check if project needs student researchers
    const needsStudents = project.fundingSecured > 0 || project.area.includes('education');

    if (!needsStudents) return;

    // Create opportunities based on project
    const opportunities: Partial<ResearchOpportunity>[] = [];

    // PhD positions
    if (project.fundingSecured >= 100000) {
      opportunities.push({
        role: 'phd_student',
        positions: 2,
        requiredSkills: this.extractSkillsFromProject(project),
        commitmentHours: 40,
        stipend: 30000, // Annual
        duration: 36 // 3 years
      });
    }

    // Masters positions
    if (project.fundingSecured >= 50000) {
      opportunities.push({
        role: 'masters_student',
        positions: 3,
        requiredSkills: this.extractSkillsFromProject(project),
        commitmentHours: 20,
        stipend: 15000,
        duration: 24
      });
    }

    // Research assistants
    opportunities.push({
      role: 'research_assistant',
      positions: 5,
      requiredSkills: this.extractSkillsFromProject(project),
      commitmentHours: 10,
      credits: 3,
      duration: 6
    });

    // Create opportunities
    for (const oppData of opportunities) {
      const opportunity: ResearchOpportunity = {
        id: crypto.randomUUID(),
        projectId: project.id,
        role: oppData.role!,
        positions: oppData.positions!,
        requiredSkills: oppData.requiredSkills!,
        preferredCourses: [],
        commitmentHours: oppData.commitmentHours!,
        stipend: oppData.stipend,
        credits: oppData.credits,
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
        duration: oppData.duration!,
        applicants: [],
        accepted: []
      };

      this.opportunities.set(opportunity.id, opportunity);

      // Notify students
      this.emit('research-opportunity-available', {
        opportunity,
        project
      });
    }

    console.log(`[INTEGRATION] ✓ Created ${opportunities.length} research opportunities for ${project.title}`);
  }

  /**
   * Extract required skills from project
   */
  private extractSkillsFromProject(project: ResearchProject): string[] {
    const skills: string[] = [];

    // Map research areas to skills
    const skillMap: Record<string, string[]> = {
      'artificial_intelligence': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning'],
      'blockchain': ['Solidity', 'Web3', 'Smart Contracts', 'Cryptography'],
      'quantum_computing': ['Quantum Mechanics', 'Linear Algebra', 'Qiskit'],
      'cybersecurity': ['Network Security', 'Cryptography', 'Penetration Testing'],
      'constitutional_ai': ['AI Ethics', 'Python', 'Constitutional Principles']
    };

    const areaSkills = skillMap[project.area as keyof typeof skillMap] || [];
    skills.push(...areaSkills);

    return skills;
  }

  /**
   * Add publication to curriculum
   */
  private async addPublicationToCurriculum(publication: any, project: ResearchProject): Promise<void> {
    // Add to library with course tagging
    this.emit('add-publication-to-library', {
      publication,
      suggestedCourses: this.findRelevantCourses(project),
      category: 'research'
    });
  }

  /**
   * Find relevant courses for project
   */
  private findRelevantCourses(project: ResearchProject): string[] {
    // AI would match project area to courses
    // TODO: Integrate with course catalog
    
    const courseMap: Record<string, string[]> = {
      'artificial_intelligence': ['CS301', 'CS401', 'AI101'],
      'blockchain': ['BC201', 'CS350'],
      'constitutional_ai': ['AI301', 'ETHICS201'],
      'sovereign_economics': ['ECON301', 'ECON401']
    };

    return courseMap[project.area as keyof typeof courseMap] || [];
  }

  /**
   * Implement curriculum recommendation
   */
  async implementRecommendation(
    recommendationId: string,
    implementedBy: string,
    courseId?: string,
    programId?: string
  ): Promise<CurriculumUpdate> {
    const recommendation = azoraResearchCenter.getCurriculumRecommendations()
      .find(r => r.id === recommendationId);

    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    const update: CurriculumUpdate = {
      id: crypto.randomUUID(),
      recommendationId,
      courseId,
      programId,
      updateType: this.mapTypeToUpdateType(recommendation.type),
      changes: {
        added: recommendation.suggestedTopics,
        modified: [],
        removed: []
      },
      implementedBy,
      implementedDate: new Date(),
      effectiveTerm: this.getNextTerm(),
      studentsAffected: recommendation.expectedStudentImpact
    };

    this.curriculumUpdates.set(update.id, update);

    // Update recommendation status
    recommendation.status = 'implemented';
    recommendation.implementedDate = new Date();

    this.emit('curriculum-updated', update);

    console.log(`[INTEGRATION] ✓ Implemented curriculum update: ${recommendationId}`);

    return update;
  }

  /**
   * Map recommendation type to update type
   */
  private mapTypeToUpdateType(type: string): CurriculumUpdate['updateType'] {
    const map: Record<string, CurriculumUpdate['updateType']> = {
      'new_course': 'entire_course',
      'update_course': 'syllabus',
      'add_module': 'content',
      'add_topic': 'content',
      'update_textbook': 'readings'
    };

    return map[type] || 'content';
  }

  /**
   * Get next academic term
   */
  private getNextTerm(): string {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    // January-June: Fall of same year
    // July-December: Spring of next year
    if (month < 6) {
      return `Fall ${year}`;
    } else {
      return `Spring ${year + 1}`;
    }
  }

  /**
   * Get research opportunities for student
   */
  getOpportunitiesForStudent(studentProfile: {
    skills: string[];
    coursesCompleted: string[];
    gpa: number;
  }): ResearchOpportunity[] {
    return Array.from(this.opportunities.values())
      .filter(opp => {
        // Check GPA requirement
        if (opp.minimumGPA && studentProfile.gpa < opp.minimumGPA) {
          return false;
        }

        // Check if student has required skills
        const hasSkills = opp.requiredSkills.some(skill => 
          studentProfile.skills.includes(skill)
        );

        return hasSkills;
      })
      .sort((a, b) => {
        // Prioritize paid opportunities
        const aValue = (a.stipend || 0) + (a.credits || 0) * 1000;
        const bValue = (b.stipend || 0) + (b.credits || 0) * 1000;
        return bValue - aValue;
      });
  }

  /**
   * Get integration statistics
   */
  getStatistics(): {
    curriculumUpdates: number;
    pendingRecommendations: number;
    implementedRecommendations: number;
    researchOpportunities: number;
    studentsInResearch: number;
  } {
    const recommendations = azoraResearchCenter.getCurriculumRecommendations();
    
    return {
      curriculumUpdates: this.curriculumUpdates.size,
      pendingRecommendations: recommendations.filter(r => r.status === 'proposed').length,
      implementedRecommendations: recommendations.filter(r => r.status === 'implemented').length,
      researchOpportunities: this.opportunities.size,
      studentsInResearch: Array.from(this.opportunities.values())
        .reduce((sum, opp) => sum + opp.accepted.length, 0)
    };
  }
}

// Create singleton
export const researchEducationIntegration = new ResearchEducationIntegration();

export default researchEducationIntegration;
