/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Service Integration Layer
 * 
 * Connects education services together
 */

import { EventEmitter } from 'events';
import axios from 'axios';

export interface ServiceConfig {
  assessment: string;
  content: string;
  analytics: string;
  credentials: string;
  collaboration: string;
  payments: string;
  media: string;
}

export class EducationServiceIntegration extends EventEmitter {
  private static instance: EducationServiceIntegration;
  private config: ServiceConfig;

  private constructor() {
    super();
    this.config = {
      assessment: process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:4202',
      content: process.env.CONTENT_SERVICE_URL || 'http://localhost:4203',
      analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4204',
      credentials: process.env.CREDENTIALS_SERVICE_URL || 'http://localhost:4205',
      collaboration: process.env.COLLABORATION_SERVICE_URL || 'http://localhost:4206',
      payments: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:4207',
      media: process.env.MEDIA_SERVICE_URL || 'http://localhost:4208',
    };
  }

  public static getInstance(): EducationServiceIntegration {
    if (!EducationServiceIntegration.instance) {
      EducationServiceIntegration.instance = new EducationServiceIntegration();
    }
    return EducationServiceIntegration.instance;
  }

  /**
   * Complete course workflow: Create → Enroll → Learn → Assess → Grade → Credential
   */
  async completeCourseWorkflow(data: {
    instructorId: string;
    courseData: any;
    studentId: string;
    studentNumber: string;
  }): Promise<{
    courseId: string;
    enrollmentId: string;
    grades: any[];
    credential?: any;
  }> {
    // 1. Create course (Content Service)
    const course = await axios.post(`${this.config.content}/api/courses`, {
      ...data.courseData,
      instructorId: data.instructorId,
    });

    const courseId = course.data.id;

    // 2. Track enrollment (Analytics Service)
    await axios.post(`${this.config.analytics}/api/progress`, {
      studentId: data.studentId,
      studentNumber: data.studentNumber,
      courseId,
      progress: 0,
      completed: false,
      timeSpent: 0,
    });

    // 3. Create assessments (Assessment Service)
    if (course.data.modules) {
      for (const module of course.data.modules) {
        await axios.post(`${this.config.assessment}/api/assessments`, {
          courseId,
          moduleId: module.id,
          title: `Assessment for ${module.title}`,
          type: 'quiz',
          totalPoints: 100,
          passingScore: 70,
          questions: [],
        });
      }
    }

    this.emit('course:workflow:completed', { courseId, studentId: data.studentId });

    return {
      courseId,
      enrollmentId: courseId, // Simplified
      grades: [],
    };
  }

  /**
   * Grade → Credential workflow
   */
  async gradeToCredential(data: {
    studentId: string;
    studentNumber: string;
    courseId: string;
    finalGrade: number;
  }): Promise<any> {
    // 1. Get all grades (Assessment Service)
    const gradesResponse = await axios.get(
      `${this.config.assessment}/api/students/${data.studentId}/grades?courseId=${data.courseId}`
    );

    // 2. Generate credential (Credentials Service)
    const credential = await axios.post(`${this.config.credentials}/api/credentials/generate`, {
      credential: {
        id: `cred-${Date.now()}`,
        studentNumber: data.studentNumber,
        credentialType: 'certificate',
        program: courseId,
        grade: this.getLetterGrade(data.finalGrade),
        credits: 3,
        institution: 'Azora Education',
        issuedDate: new Date(),
        verificationUrl: '',
        status: 'issued',
        metadata: {},
      },
      options: {
        watermarkText: 'AZORA EDUCATION',
        includeWatermark: true,
      },
    });

    // 3. Update analytics (Analytics Service)
    await axios.post(`${this.config.analytics}/api/progress`, {
      studentId: data.studentId,
      studentNumber: data.studentNumber,
      courseId: data.courseId,
      progress: 100,
      completed: true,
      completionDate: new Date(),
    });

    this.emit('credential:issued', { credential: credential.data, studentId: data.studentId });

    return credential.data;
  }

  /**
   * Get student complete profile across all services
   */
  async getStudentProfile(studentId: string, studentNumber: string): Promise<any> {
    const [grades, progress, credentials, payments] = await Promise.all([
      // Grades
      axios.get(`${this.config.assessment}/api/students/${studentId}/grades`)
        .catch(() => ({ data: { grades: [] } })),
      
      // Progress
      axios.get(`${this.config.analytics}/api/progress/${studentId}`)
        .catch(() => ({ data: { progress: [] } })),
      
      // Credentials
      axios.get(`${this.config.credentials}/api/wallet/${studentNumber}`)
        .catch(() => ({ data: { credentials: [], badges: [] } })),
      
      // Payments
      axios.get(`${this.config.payments}/api/payments/student/${studentId}`)
        .catch(() => ({ data: { payments: [] } })),
    ]);

    return {
      studentId,
      studentNumber,
      grades: grades.data.grades || [],
      progress: progress.data.progress || [],
      credentials: credentials.data.credentials || [],
      badges: credentials.data.badges || [],
      payments: payments.data.payments || [],
    };
  }

  /**
   * Helper: Get letter grade
   */
  private getLetterGrade(percentage: number): string {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  }
}

export const educationServiceIntegration = EducationServiceIntegration.getInstance();
