import { KnowledgeSource } from '../knowledge-ocean';

export interface StudentSuccess {
  studentId: string;
  name: string;
  achievement: string;
  businessIdea?: string;
  earnings?: number;
  date: string;
}

export interface BusinessOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  marketSize: number;
  difficulty: 'easy' | 'medium' | 'hard';
  requiredSkills: string[];
  date: string;
}

export interface CourseData {
  courseId: string;
  title: string;
  instructor: string;
  enrollments: number;
  rating: number;
  category: string;
  date: string;
}

export class EcosystemDataSource {
  private studentSuccesses: StudentSuccess[] = [];
  private businessOpportunities: BusinessOpportunity[] = [];
  private courseData: CourseData[] = [];

  /**
   * Add student success story
   */
  addStudentSuccess(success: StudentSuccess): void {
    this.studentSuccesses.push(success);
  }

  /**
   * Add business opportunity
   */
  addBusinessOpportunity(opportunity: BusinessOpportunity): void {
    this.businessOpportunities.push(opportunity);
  }

  /**
   * Add course data
   */
  addCourseData(course: CourseData): void {
    this.courseData.push(course);
  }

  /**
   * Get all student successes
   */
  getStudentSuccesses(): StudentSuccess[] {
    return this.studentSuccesses;
  }

  /**
   * Get business opportunities by category
   */
  getBusinessOpportunitiesByCategory(category: string): BusinessOpportunity[] {
    return this.businessOpportunities.filter((opp) => opp.category === category);
  }

  /**
   * Get top courses
   */
  getTopCourses(limit: number = 10): CourseData[] {
    return this.courseData.sort((a, b) => b.rating - a.rating).slice(0, limit);
  }

  /**
   * Convert student success to KnowledgeSource
   */
  convertSuccessToKnowledgeSource(success: StudentSuccess): Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  > {
    return {
      type: 'student',
      source: 'Azora Ecosystem',
      url: `https://azora.io/student/${success.studentId}`,
      title: `Success Story: ${success.name}`,
      content: `Student: ${success.name}\nAchievement: ${success.achievement}${success.businessIdea ? `\nBusiness Idea: ${success.businessIdea}` : ''}${success.earnings ? `\nEarnings: R${success.earnings}` : ''}\nDate: ${success.date}`,
      metadata: {
        date: success.date,
        category: 'student-success',
        verified: true,
        relevance: 0.95,
        tags: ['success-story', 'student', 'azora-ecosystem'],
      },
    };
  }

  /**
   * Convert business opportunity to KnowledgeSource
   */
  convertOpportunityToKnowledgeSource(opportunity: BusinessOpportunity): Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  > {
    return {
      type: 'business',
      source: 'Azora Ecosystem',
      url: `https://azora.io/opportunity/${opportunity.id}`,
      title: `Business Opportunity: ${opportunity.title}`,
      content: `Title: ${opportunity.title}\nDescription: ${opportunity.description}\nCategory: ${opportunity.category}\nMarket Size: R${opportunity.marketSize}\nDifficulty: ${opportunity.difficulty}\nRequired Skills: ${opportunity.requiredSkills.join(', ')}\nDate: ${opportunity.date}`,
      metadata: {
        date: opportunity.date,
        category: 'business-opportunity',
        verified: true,
        relevance: 0.9,
        tags: [
          'business-opportunity',
          opportunity.category.toLowerCase(),
          opportunity.difficulty,
        ],
      },
    };
  }

  /**
   * Convert course data to KnowledgeSource
   */
  convertCourseToKnowledgeSource(course: CourseData): Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  > {
    return {
      type: 'student',
      source: 'Azora Ecosystem',
      url: `https://azora.io/course/${course.courseId}`,
      title: `Course: ${course.title}`,
      content: `Course: ${course.title}\nInstructor: ${course.instructor}\nEnrollments: ${course.enrollments}\nRating: ${course.rating}/5\nCategory: ${course.category}\nDate: ${course.date}`,
      metadata: {
        date: course.date,
        category: 'course',
        verified: true,
        relevance: 0.85,
        tags: ['course', course.category.toLowerCase(), 'azora-ecosystem'],
      },
    };
  }

  /**
   * Get all ecosystem data as KnowledgeSources
   */
  getAllAsKnowledgeSources(): Omit<
    KnowledgeSource,
    'id' | 'embedding' | 'createdAt' | 'updatedAt'
  >[] {
    const sources: Omit<KnowledgeSource, 'id' | 'embedding' | 'createdAt' | 'updatedAt'>[] = [];

    // Add student successes
    for (const success of this.studentSuccesses) {
      sources.push(this.convertSuccessToKnowledgeSource(success));
    }

    // Add business opportunities
    for (const opportunity of this.businessOpportunities) {
      sources.push(this.convertOpportunityToKnowledgeSource(opportunity));
    }

    // Add courses
    for (const course of this.courseData) {
      sources.push(this.convertCourseToKnowledgeSource(course));
    }

    return sources;
  }

  /**
   * Get ecosystem statistics
   */
  getStats() {
    return {
      totalStudentSuccesses: this.studentSuccesses.length,
      totalBusinessOpportunities: this.businessOpportunities.length,
      totalCourses: this.courseData.length,
      averageCourseRating:
        this.courseData.length > 0
          ? this.courseData.reduce((sum, c) => sum + c.rating, 0) / this.courseData.length
          : 0,
      totalEnrollments: this.courseData.reduce((sum, c) => sum + c.enrollments, 0),
    };
  }
}

export default EcosystemDataSource;
