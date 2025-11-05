/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Student Progress & Analytics System
 * 
 * Unified progress tracking and advanced analytics
 */

import { EventEmitter } from 'events';
import { gradingEngine, Grade, GradebookEntry } from '../azora-assessment/grading-engine';

export interface ProgressData {
  studentId: string;
  studentNumber: string;
  courseId: string;
  moduleId?: string;
  completed: boolean;
  completionDate?: Date;
  timeSpent: number; // minutes
  lastAccessed: Date;
  progress: number; // 0-100
  assessmentScores?: number[];
}

export interface LearningAnalytics {
  studentId: string;
  studentNumber: string;
  courses: CourseAnalytics[];
  overallProgress: number;
  averageGrade: number;
  learningVelocity: number; // courses completed per month
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  progress: number;
  timeSpent: number;
  averageScore: number;
  modulesCompleted: number;
  totalModules: number;
  assessmentsCompleted: number;
  totalAssessments: number;
  lastActivity: Date;
  predictedCompletion?: Date;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface GapAnalysis {
  studentId: string;
  gaps: LearningGap[];
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface LearningGap {
  skill: string;
  courseId: string;
  moduleId?: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  impact: 'high' | 'medium' | 'low';
}

export interface PredictiveInsight {
  type: 'completion' | 'performance' | 'at-risk' | 'excellence';
  studentId: string;
  prediction: string;
  confidence: number; // 0-100
  timeframe: string;
  factors: string[];
}

export class AnalyticsEngine extends EventEmitter {
  private static instance: AnalyticsEngine;
  private progressData: Map<string, ProgressData[]> = new Map(); // studentId -> progress[]
  private analytics: Map<string, LearningAnalytics> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }

  /**
   * Track progress
   */
  async trackProgress(data: ProgressData): Promise<void> {
    const studentProgress = this.progressData.get(data.studentId) || [];
    
    // Update or add progress
    const existingIndex = studentProgress.findIndex(
      p => p.courseId === data.courseId && p.moduleId === data.moduleId
    );

    if (existingIndex >= 0) {
      studentProgress[existingIndex] = {
        ...studentProgress[existingIndex],
        ...data,
        lastAccessed: new Date(),
      };
    } else {
      studentProgress.push({
        ...data,
        lastAccessed: new Date(),
      });
    }

    this.progressData.set(data.studentId, studentProgress);
    this.emit('progress:updated', data);

    // Update analytics
    await this.updateAnalytics(data.studentId);
  }

  /**
   * Get student progress
   */
  getProgress(studentId: string, courseId?: string): ProgressData[] {
    const progress = this.progressData.get(studentId) || [];
    return courseId ? progress.filter(p => p.courseId === courseId) : progress;
  }

  /**
   * Update analytics for student
   */
  private async updateAnalytics(studentId: string): Promise<void> {
    const progress = this.progressData.get(studentId) || [];
    const grades = gradingEngine.getStudentGrades(studentId);
    const gradebookEntries = gradingEngine.getStudentGradebook(studentId);

    const courseAnalytics: CourseAnalytics[] = [];

    // Group by course
    const courseMap = new Map<string, ProgressData[]>();
    progress.forEach(p => {
      const courseData = courseMap.get(p.courseId) || [];
      courseData.push(p);
      courseMap.set(p.courseId, courseData);
    });

    for (const [courseId, courseProgress] of courseMap.entries()) {
      const courseGrades = grades.filter(g => g.courseId === courseId);
      const completedModules = courseProgress.filter(p => p.completed).length;
      const totalModules = courseProgress.length;
      const assessmentsCompleted = courseGrades.length;
      
      const averageScore = courseGrades.length > 0
        ? courseGrades.reduce((sum, g) => sum + g.percentage, 0) / courseGrades.length
        : 0;

      const totalTimeSpent = courseProgress.reduce((sum, p) => sum + p.timeSpent, 0);
      const overallProgress = totalModules > 0
        ? (completedModules / totalModules) * 100
        : 0;

      const lastActivity = courseProgress.length > 0
        ? new Date(Math.max(...courseProgress.map(p => p.lastAccessed.getTime())))
        : new Date();

      // Calculate risk level
      let riskLevel: CourseAnalytics['riskLevel'] = 'low';
      if (overallProgress < 30 && lastActivity < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        riskLevel = 'high';
      } else if (overallProgress < 50 && lastActivity < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)) {
        riskLevel = 'medium';
      }

      // Predict completion
      const predictedCompletion = this.predictCompletion(courseProgress, overallProgress);

      courseAnalytics.push({
        courseId,
        courseName: `Course ${courseId}`, // TODO: Get from course service
        progress: overallProgress,
        timeSpent: totalTimeSpent,
        averageScore,
        modulesCompleted: completedModules,
        totalModules,
        assessmentsCompleted,
        totalAssessments: assessmentsCompleted, // TODO: Get from assessment service
        lastActivity,
        predictedCompletion,
        riskLevel,
      });
    }

    const overallProgress = courseAnalytics.length > 0
      ? courseAnalytics.reduce((sum, c) => sum + c.progress, 0) / courseAnalytics.length
      : 0;

    const averageGrade = gradebookEntries.length > 0
      ? gradebookEntries.reduce((sum, e) => sum + e.currentGrade, 0) / gradebookEntries.length
      : 0;

    const learningVelocity = this.calculateLearningVelocity(studentId, courseAnalytics);
    const { strengths, weaknesses } = this.analyzeStrengthsWeaknesses(grades);
    const recommendations = this.generateRecommendations(courseAnalytics, strengths, weaknesses);

    const analytics: LearningAnalytics = {
      studentId,
      studentNumber: progress[0]?.studentNumber || studentId,
      courses: courseAnalytics,
      overallProgress,
      averageGrade,
      learningVelocity,
      strengths,
      weaknesses,
      recommendations,
    };

    this.analytics.set(studentId, analytics);
    this.emit('analytics:updated', analytics);
  }

  /**
   * Get learning analytics
   */
  getAnalytics(studentId: string): LearningAnalytics | undefined {
    return this.analytics.get(studentId);
  }

  /**
   * Perform gap analysis
   */
  performGapAnalysis(studentId: string, requiredSkills: Array<{ skill: string; level: number }>): GapAnalysis {
    const analytics = this.analytics.get(studentId);
    const grades = gradingEngine.getStudentGrades(studentId);

    if (!analytics) {
      throw new Error('Analytics not found for student');
    }

    const gaps: LearningGap[] = [];

    // Analyze gaps (simplified - can be enhanced with AI)
    for (const required of requiredSkills) {
      // Find related courses/modules
      const relatedCourses = analytics.courses.filter(c => 
        c.courseName.toLowerCase().includes(required.skill.toLowerCase())
      );

      const currentLevel = relatedCourses.length > 0
        ? relatedCourses.reduce((sum, c) => sum + c.averageScore, 0) / relatedCourses.length
        : 0;

      const gap = required.level - currentLevel;

      if (gap > 10) {
        gaps.push({
          skill: required.skill,
          courseId: relatedCourses[0]?.courseId || 'unknown',
          currentLevel,
          requiredLevel: required.level,
          gap,
          impact: gap > 30 ? 'high' : gap > 15 ? 'medium' : 'low',
        });
      }
    }

    const recommendations = gaps.map(gap => 
      `Focus on ${gap.skill} to reach required level of ${gap.requiredLevel}%`
    );

    const priority: GapAnalysis['priority'] = 
      gaps.some(g => g.impact === 'high') ? 'high' :
      gaps.some(g => g.impact === 'medium') ? 'medium' : 'low';

    return {
      studentId,
      gaps,
      recommendations,
      priority,
    };
  }

  /**
   * Generate predictive insights
   */
  generatePredictiveInsights(studentId: string): PredictiveInsight[] {
    const analytics = this.analytics.get(studentId);
    if (!analytics) {
      return [];
    }

    const insights: PredictiveInsight[] = [];

    // Completion prediction
    const avgProgress = analytics.courses.reduce((sum, c) => sum + c.progress, 0) / analytics.courses.length;
    if (avgProgress > 70) {
      insights.push({
        type: 'completion',
        studentId,
        prediction: `Likely to complete ${analytics.courses.length} courses within next month`,
        confidence: 85,
        timeframe: '1 month',
        factors: ['High progress rate', 'Consistent activity'],
      });
    }

    // At-risk prediction
    const atRiskCourses = analytics.courses.filter(c => c.riskLevel === 'high');
    if (atRiskCourses.length > 0) {
      insights.push({
        type: 'at-risk',
        studentId,
        prediction: `${atRiskCourses.length} course(s) at risk of incomplete`,
        confidence: 75,
        timeframe: '2 weeks',
        factors: ['Low progress', 'Inactive recently'],
      });
    }

    // Performance prediction
    if (analytics.averageGrade > 85) {
      insights.push({
        type: 'excellence',
        studentId,
        prediction: 'Maintaining excellent performance',
        confidence: 90,
        timeframe: 'ongoing',
        factors: ['High average grade', 'Strong assessment scores'],
      });
    }

    return insights;
  }

  /**
   * Calculate learning velocity
   */
  private calculateLearningVelocity(studentId: string, courses: CourseAnalytics[]): number {
    const completedCourses = courses.filter(c => c.progress >= 100);
    if (completedCourses.length === 0) return 0;

    // Calculate average completion time (simplified)
    const now = new Date();
    const firstCompletion = Math.min(...completedCourses.map(c => c.lastActivity.getTime()));
    const monthsElapsed = (now.getTime() - firstCompletion) / (1000 * 60 * 60 * 24 * 30);

    return monthsElapsed > 0 ? completedCourses.length / monthsElapsed : completedCourses.length;
  }

  /**
   * Analyze strengths and weaknesses
   */
  private analyzeStrengthsWeaknesses(grades: Grade[]): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Group by course
    const courseGrades = new Map<string, Grade[]>();
    grades.forEach(g => {
      const courseGrades_list = courseGrades.get(g.courseId) || [];
      courseGrades_list.push(g);
      courseGrades.set(g.courseId, courseGrades_list);
    });

    for (const [courseId, courseGrades_list] of courseGrades.entries()) {
      const avgScore = courseGrades_list.reduce((sum, g) => sum + g.percentage, 0) / courseGrades_list.length;
      
      if (avgScore >= 85) {
        strengths.push(`Strong performance in ${courseId}`);
      } else if (avgScore < 60) {
        weaknesses.push(`Needs improvement in ${courseId}`);
      }
    }

    return { strengths, weaknesses };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    courses: CourseAnalytics[],
    strengths: string[],
    weaknesses: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Recommendations based on risk
    const atRiskCourses = courses.filter(c => c.riskLevel === 'high');
    if (atRiskCourses.length > 0) {
      recommendations.push(`Focus on completing ${atRiskCourses.length} at-risk course(s)`);
    }

    // Recommendations based on weaknesses
    if (weaknesses.length > 0) {
      recommendations.push(`Consider additional practice in areas with lower scores`);
    }

    // Recommendations based on strengths
    if (strengths.length > 0) {
      recommendations.push(`Continue building on your strengths`);
    }

    return recommendations;
  }

  /**
   * Predict completion date
   */
  private predictCompletion(progress: ProgressData[], currentProgress: number): Date | undefined {
    if (progress.length === 0 || currentProgress >= 100) return undefined;

    // Calculate average progress rate
    const recentProgress = progress
      .filter(p => p.lastAccessed > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
      .slice(0, 5);

    if (recentProgress.length === 0) return undefined;

    const avgProgressPerDay = recentProgress.reduce((sum, p) => sum + p.progress, 0) / recentProgress.length / 30;
    const remainingProgress = 100 - currentProgress;
    const daysToComplete = remainingProgress / avgProgressPerDay;

    return new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000);
  }
}

export const analyticsEngine = AnalyticsEngine.getInstance();
