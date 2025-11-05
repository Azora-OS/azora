/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Gradebook Service
 * 
 * Manages gradebooks for courses and students
 */

import { gradingEngine, GradebookEntry, Grade, AssessmentGrade } from './grading-engine';
import { EventEmitter } from 'events';

export interface CourseGradebook {
  courseId: string;
  courseName: string;
  entries: GradebookEntry[];
  statistics: GradebookStatistics;
}

export interface GradebookStatistics {
  totalStudents: number;
  averageGrade: number;
  medianGrade: number;
  highestGrade: number;
  lowestGrade: number;
  gradeDistribution: Record<string, number>;
  passRate: number;
}

export interface StudentTranscript {
  studentId: string;
  studentNumber: string;
  courses: CourseTranscript[];
  overallGPA: number;
  totalCredits: number;
  completedCredits: number;
  issuedDate: Date;
}

export interface CourseTranscript {
  courseId: string;
  courseName: string;
  credits: number;
  finalGrade: number;
  letterGrade: string;
  gpa: number;
  assessments: AssessmentGrade[];
  completedDate: Date;
}

export class GradebookService extends EventEmitter {
  private static instance: GradebookService;

  private constructor() {
    super();
  }

  public static getInstance(): GradebookService {
    if (!GradebookService.instance) {
      GradebookService.instance = new GradebookService();
    }
    return GradebookService.instance;
  }

  /**
   * Get complete gradebook for a course
   */
  async getCourseGradebook(courseId: string, courseName?: string): Promise<CourseGradebook> {
    const entries = await gradingEngine.getGradebook(courseId);
    const statistics = this.calculateStatistics(entries);

    return {
      courseId,
      courseName: courseName || `Course ${courseId}`,
      entries,
      statistics,
    };
  }

  /**
   * Get student transcript
   */
  async getStudentTranscript(studentId: string, studentNumber: string): Promise<StudentTranscript> {
    const entries = await gradingEngine.getStudentGradebook(studentId);
    
    const courses: CourseTranscript[] = entries.map(entry => ({
      courseId: entry.courseId,
      courseName: `Course ${entry.courseId}`, // TODO: Get from course service
      credits: 3, // TODO: Get from course service
      finalGrade: entry.currentGrade,
      letterGrade: entry.letterGrade,
      gpa: entry.gpa,
      assessments: entry.assessments,
      completedDate: entry.lastUpdated,
    }));

    const overallGPA = this.calculateOverallGPA(courses);
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const completedCredits = courses
      .filter(c => c.letterGrade !== 'F' && c.letterGrade !== 'Incomplete')
      .reduce((sum, c) => sum + c.credits, 0);

    return {
      studentId,
      studentNumber,
      courses,
      overallGPA,
      totalCredits,
      completedCredits,
      issuedDate: new Date(),
    };
  }

  /**
   * Calculate gradebook statistics
   */
  private calculateStatistics(entries: GradebookEntry[]): GradebookStatistics {
    if (entries.length === 0) {
      return {
        totalStudents: 0,
        averageGrade: 0,
        medianGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        gradeDistribution: {},
        passRate: 0,
      };
    }

    const grades = entries.map(e => e.currentGrade).sort((a, b) => a - b);
    const averageGrade = grades.reduce((sum, g) => sum + g, 0) / grades.length;
    const medianGrade = grades[Math.floor(grades.length / 2)];
    const highestGrade = Math.max(...grades);
    const lowestGrade = Math.min(...grades);

    const gradeDistribution: Record<string, number> = {};
    entries.forEach(entry => {
      gradeDistribution[entry.letterGrade] = (gradeDistribution[entry.letterGrade] || 0) + 1;
    });

    const passingGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-'];
    const passed = entries.filter(e => passingGrades.includes(e.letterGrade)).length;
    const passRate = (passed / entries.length) * 100;

    return {
      totalStudents: entries.length,
      averageGrade,
      medianGrade,
      highestGrade,
      lowestGrade,
      gradeDistribution,
      passRate,
    };
  }

  /**
   * Calculate overall GPA from courses
   */
  private calculateOverallGPA(courses: CourseTranscript[]): number {
    if (courses.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      totalPoints += course.gpa * course.credits;
      totalCredits += course.credits;
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }

  /**
   * Export gradebook to CSV
   */
  async exportToCSV(courseId: string): Promise<string> {
    const gradebook = await this.getCourseGradebook(courseId);
    const headers = ['Student Number', 'Student ID', 'Final Grade', 'Letter Grade', 'GPA'];
    
    // Add assessment columns
    gradebook.entries[0]?.assessments.forEach(assessment => {
      headers.push(assessment.assessmentName);
    });

    const rows = gradebook.entries.map(entry => {
      const row = [
        entry.studentNumber,
        entry.studentId,
        entry.currentGrade.toFixed(2),
        entry.letterGrade,
        entry.gpa.toFixed(2),
      ];

      entry.assessments.forEach(assessment => {
        row.push(assessment.percentage.toFixed(2));
      });

      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export const gradebookService = GradebookService.getInstance();
