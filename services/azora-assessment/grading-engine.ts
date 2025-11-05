/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Assessment & Grading System
 * 
 * Complete grading engine with:
 * - Automatic grading for quizzes and assignments
 * - Manual grading with rubrics
 * - Gradebook management
 * - GPA calculation
 * - Grade history and audit trail
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { Assessment, Submission, Grade } from '../shared/database/models';
import { azoraDatabase } from '../shared/database/connection';

export interface Assessment {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'exam' | 'project' | 'peer-review' | 'self-assessment';
  totalPoints: number;
  passingScore: number;
  dueDate?: Date;
  timeLimit?: number; // minutes
  questions: Question[];
  rubric?: Rubric;
  createdAt: Date;
  createdBy: string;
  constitutionalAlignment: boolean;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'code' | 'practical';
  text: string;
  points: number;
  options?: string[]; // For multiple choice
  correctAnswer?: string | string[]; // Answer key
  rubric?: QuestionRubric; // For subjective questions
  feedback?: string; // Feedback shown after grading
}

export interface QuestionRubric {
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface RubricCriterion {
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  level: string; // e.g., "Excellent", "Good", "Satisfactory", "Needs Improvement"
  points: number;
  description: string;
}

export interface Rubric {
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface Submission {
  id: string;
  assessmentId: string;
  studentId: string;
  studentNumber: string;
  answers: SubmissionAnswer[];
  submittedAt: Date;
  status: 'submitted' | 'graded' | 'grading' | 'returned';
  timeSpent?: number; // minutes
  ipAddress?: string;
  deviceInfo?: string;
}

export interface SubmissionAnswer {
  questionId: string;
  answer: string | string[] | File;
  type: string;
  timestamp: Date;
}

export interface Grade {
  id: string;
  submissionId: string;
  assessmentId: string;
  studentId: string;
  studentNumber: string;
  courseId: string;
  moduleId: string;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  letterGrade: string;
  gradedAt: Date;
  gradedBy: string; // 'auto' | 'instructor-id' | 'peer-review'
  questionGrades: QuestionGrade[];
  feedback?: string;
  rubricScores?: Record<string, number>; // criterion -> score
  constitutionalAlignment: number; // 0-100
  uid: string; // Unique identifier for tracing
}

export interface QuestionGrade {
  questionId: string;
  points: number;
  maxPoints: number;
  feedback?: string;
  autoGraded: boolean;
}

export interface GradebookEntry {
  studentId: string;
  studentNumber: string;
  courseId: string;
  assessments: AssessmentGrade[];
  currentGrade: number; // percentage
  letterGrade: string;
  gpa: number; // For course
  totalPoints: number;
  earnedPoints: number;
  lastUpdated: Date;
}

export interface AssessmentGrade {
  assessmentId: string;
  assessmentName: string;
  points: number;
  maxPoints: number;
  percentage: number;
  letterGrade: string;
  gradedAt: Date;
  weight?: number; // For weighted grading
}

export interface GradingConfig {
  letterGrades: LetterGradeScale;
  gradeWeights?: Record<string, number>; // assessment type -> weight
  lateSubmissionPenalty?: number; // percentage per day
  allowLateSubmission?: boolean;
  allowResubmission?: boolean;
  autoGradeEnabled?: boolean;
}

export interface LetterGradeScale {
  'A+': { min: number; max: number };
  'A': { min: number; max: number };
  'A-': { min: number; max: number };
  'B+': { min: number; max: number };
  'B': { min: number; max: number };
  'B-': { min: number; max: number };
  'C+': { min: number; max: number };
  'C': { min: number; max: number };
  'C-': { min: number; max: number };
  'D+': { min: number; max: number };
  'D': { min: number; max: number };
  'D-': { min: number; max: number };
  'F': { min: number; max: number };
}

export class GradingEngine extends EventEmitter {
  private static instance: GradingEngine;
  private defaultGradingConfig: GradingConfig = {
    letterGrades: {
      'A+': { min: 97, max: 100 },
      'A': { min: 93, max: 96.99 },
      'A-': { min: 90, max: 92.99 },
      'B+': { min: 87, max: 89.99 },
      'B': { min: 83, max: 86.99 },
      'B-': { min: 80, max: 82.99 },
      'C+': { min: 77, max: 79.99 },
      'C': { min: 73, max: 76.99 },
      'C-': { min: 70, max: 72.99 },
      'D+': { min: 67, max: 69.99 },
      'D': { min: 63, max: 66.99 },
      'D-': { min: 60, max: 62.99 },
      'F': { min: 0, max: 59.99 },
    },
    autoGradeEnabled: true,
    allowLateSubmission: true,
    lateSubmissionPenalty: 5, // 5% per day
  };

  private constructor() {
    super();
  }

  public static getInstance(): GradingEngine {
    if (!GradingEngine.instance) {
      GradingEngine.instance = new GradingEngine();
    }
    return GradingEngine.instance;
  }

  /**
   * Create a new assessment (MongoDB)
   */
  async createAssessment(assessment: Omit<Assessment, 'id' | 'createdAt'>): Promise<Assessment> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const newAssessment = new Assessment({
      ...assessment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });

    await newAssessment.save();
    this.emit('assessment:created', newAssessment);
    return newAssessment.toObject();
  }

  /**
   * Submit an assessment (MongoDB)
   */
  async submitAssessment(submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>): Promise<Submission> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    // Check if assessment exists
    const assessment = await Assessment.findOne({ id: submission.assessmentId });
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Check due date
    const isLate = assessment.dueDate && new Date() > assessment.dueDate;

    const newSubmission = new Submission({
      ...submission,
      id: crypto.randomUUID(),
      submittedAt: new Date(),
      status: 'submitted',
    });

    await newSubmission.save();

    // Auto-grade if enabled and assessment type allows
    if (this.defaultGradingConfig.autoGradeEnabled && this.canAutoGrade(assessment)) {
      await this.autoGrade(newSubmission.id);
    }

    this.emit('submission:created', newSubmission.toObject());
    return newSubmission.toObject();
  }

  /**
   * Auto-grade a submission (MongoDB)
   */
  async autoGrade(submissionId: string): Promise<Grade> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const submission = await Submission.findOne({ id: submissionId });
    if (!submission) {
      throw new Error('Submission not found');
    }

    const assessment = await Assessment.findOne({ id: submission.assessmentId });
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    if (!this.canAutoGrade(assessment)) {
      throw new Error('Assessment cannot be auto-graded');
    }

    const questionGrades: QuestionGrade[] = [];
    let totalEarned = 0;
    let totalPoints = 0;

    // Grade each question
    for (const question of assessment.questions) {
      totalPoints += question.points;
      const answer = submission.answers.find(a => a.questionId === question.id);
      
      if (!answer) {
        questionGrades.push({
          questionId: question.id,
          points: 0,
          maxPoints: question.points,
          autoGraded: true,
          feedback: 'No answer provided',
        });
        continue;
      }

      const grade = this.gradeQuestion(question, answer.answer);
      questionGrades.push({
        questionId: question.id,
        points: grade.points,
        maxPoints: question.points,
        autoGraded: true,
        feedback: grade.feedback,
      });
      totalEarned += grade.points;
    }

    const percentage = (totalEarned / totalPoints) * 100;
    const letterGrade = this.calculateLetterGrade(percentage);

    // Generate UID for tracing
    const uid = this.generateUID(submission.studentNumber, assessment.id, 'grade');

    const grade = new Grade({
      id: crypto.randomUUID(),
      submissionId: submission.id,
      assessmentId: assessment.id,
      studentId: submission.studentId,
      studentNumber: submission.studentNumber,
      courseId: assessment.courseId,
      moduleId: assessment.moduleId,
      totalPoints,
      earnedPoints: totalEarned,
      percentage,
      letterGrade,
      gradedAt: new Date(),
      gradedBy: 'auto',
      questionGrades,
      constitutionalAlignment: assessment.constitutionalAlignment ? 95 : 0,
      uid,
    });

    await grade.save();

    // Update submission status
    submission.status = 'graded';
    await submission.save();

    // Update gradebook
    await this.updateGradebook(grade.toObject());

    this.emit('grade:created', grade.toObject());
    return grade.toObject();
  }

  /**
   * Grade a question
   */
  private gradeQuestion(question: Question, answer: string | string[] | File): { points: number; feedback?: string } {
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      if (typeof answer === 'string') {
        const isCorrect = answer.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
        return {
          points: isCorrect ? question.points : 0,
          feedback: isCorrect ? question.feedback || 'Correct!' : `Incorrect. Correct answer: ${question.correctAnswer}`,
        };
      }
    }

    if (question.type === 'short-answer') {
      if (typeof answer === 'string') {
        // Simple keyword matching (can be enhanced with AI)
        const answerLower = answer.toLowerCase();
        const correctLower = question.correctAnswer?.toLowerCase() || '';
        const matches = correctLower.split(',').some(keyword => 
          answerLower.includes(keyword.trim())
        );
        
        return {
          points: matches ? question.points : question.points * 0.5,
          feedback: matches ? 'Correct!' : 'Partially correct. Check spelling and key terms.',
        };
      }
    }

    // For essay, code, practical - requires manual grading
    return {
      points: 0,
      feedback: 'Requires manual grading',
    };
  }

  /**
   * Manual grading with rubric (MongoDB)
   */
  async manualGrade(
    submissionId: string,
    graderId: string,
    questionGrades: Array<{ questionId: string; points: number; feedback?: string }>,
    rubricScores?: Record<string, number>,
    overallFeedback?: string
  ): Promise<Grade> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const submission = await Submission.findOne({ id: submissionId });
    if (!submission) {
      throw new Error('Submission not found');
    }

    const assessment = await Assessment.findOne({ id: submission.assessmentId });
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    const totalPoints = assessment.totalPoints;
    const earnedPoints = questionGrades.reduce((sum, qg) => sum + qg.points, 0);
    const percentage = (earnedPoints / totalPoints) * 100;
    const letterGrade = this.calculateLetterGrade(percentage);

    // Generate UID
    const uid = this.generateUID(submission.studentNumber, assessment.id, 'grade');

    const grade = new Grade({
      id: crypto.randomUUID(),
      submissionId: submission.id,
      assessmentId: assessment.id,
      studentId: submission.studentId,
      studentNumber: submission.studentNumber,
      courseId: assessment.courseId,
      moduleId: assessment.moduleId,
      totalPoints,
      earnedPoints,
      percentage,
      letterGrade,
      gradedAt: new Date(),
      gradedBy: graderId,
      questionGrades: questionGrades.map(qg => ({
        ...qg,
        maxPoints: assessment.questions.find(q => q.id === qg.questionId)?.points || 0,
        autoGraded: false,
      })),
      feedback: overallFeedback,
      rubricScores,
      constitutionalAlignment: assessment.constitutionalAlignment ? 95 : 0,
      uid,
    });

    await grade.save();

    // Update submission status
    submission.status = 'graded';
    await submission.save();

    // Update gradebook
    await this.updateGradebook(grade.toObject());

    this.emit('grade:created', grade.toObject());
    return grade.toObject();
  }

  /**
   * Calculate letter grade from percentage
   */
  private calculateLetterGrade(percentage: number): string {
    const scale = this.defaultGradingConfig.letterGrades;
    
    if (percentage >= scale['A+'].min) return 'A+';
    if (percentage >= scale['A'].min) return 'A';
    if (percentage >= scale['A-'].min) return 'A-';
    if (percentage >= scale['B+'].min) return 'B+';
    if (percentage >= scale['B'].min) return 'B';
    if (percentage >= scale['B-'].min) return 'B-';
    if (percentage >= scale['C+'].min) return 'C+';
    if (percentage >= scale['C'].min) return 'C';
    if (percentage >= scale['C-'].min) return 'C-';
    if (percentage >= scale['D+'].min) return 'D+';
    if (percentage >= scale['D'].min) return 'D';
    if (percentage >= scale['D-'].min) return 'D-';
    return 'F';
  }

  /**
   * Update gradebook entry (MongoDB)
   */
  private async updateGradebook(grade: Grade): Promise<void> {
    if (!azoraDatabase.isDatabaseConnected()) {
      return;
    }

    // Gradebook is calculated on-the-fly from grades collection
    // No need for separate gradebook collection
    this.emit('gradebook:updated', { studentId: grade.studentId, courseId: grade.courseId });
  }

  /**
   * Check if assessment can be auto-graded
   */
  private canAutoGrade(assessment: Assessment): boolean {
    return assessment.questions.every(q => 
      q.type === 'multiple-choice' || 
      q.type === 'true-false' || 
      q.type === 'short-answer'
    );
  }

  /**
   * Generate UID for document tracing
   */
  private generateUID(studentNumber: string, assessmentId: string, type: string): string {
    const timestamp = Date.now();
    const hash = crypto.createHash('sha256')
      .update(`${studentNumber}:${assessmentId}:${type}:${timestamp}`)
      .digest('hex')
      .substring(0, 12)
      .toUpperCase();
    return `AZR-${timestamp.toString(36).toUpperCase()}-${hash}`;
  }

  /**
   * Get gradebook for a course (MongoDB)
   */
  async getGradebook(courseId: string): Promise<GradebookEntry[]> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const grades = await Grade.find({ courseId });
    const gradeMap = new Map<string, GradebookEntry>();

    for (const grade of grades) {
      const key = `${grade.courseId}:${grade.studentId}`;
      let entry = gradeMap.get(key);

      if (!entry) {
        entry = {
          studentId: grade.studentId,
          studentNumber: grade.studentNumber,
          courseId: grade.courseId,
          assessments: [],
          currentGrade: 0,
          letterGrade: 'F',
          gpa: 0,
          totalPoints: 0,
          earnedPoints: 0,
          lastUpdated: new Date(),
        };
      }

      const assessment = await Assessment.findOne({ id: grade.assessmentId });
      entry.assessments.push({
        assessmentId: grade.assessmentId,
        assessmentName: assessment?.title || 'Unknown',
        points: grade.earnedPoints,
        maxPoints: grade.totalPoints,
        percentage: grade.percentage,
        letterGrade: grade.letterGrade,
        gradedAt: grade.gradedAt,
      });

      entry.totalPoints = entry.assessments.reduce((sum, a) => sum + a.maxPoints, 0);
      entry.earnedPoints = entry.assessments.reduce((sum, a) => sum + a.points, 0);
      entry.currentGrade = entry.totalPoints > 0 ? (entry.earnedPoints / entry.totalPoints) * 100 : 0;
      entry.letterGrade = this.calculateLetterGrade(entry.currentGrade);
      entry.gpa = this.calculateGPA(entry.letterGrade);
      entry.lastUpdated = new Date();

      gradeMap.set(key, entry);
    }

    return Array.from(gradeMap.values()).sort((a, b) => 
      a.studentNumber.localeCompare(b.studentNumber)
    );
  }

  /**
   * Get student gradebook (MongoDB)
   */
  async getStudentGradebook(studentId: string, courseId?: string): Promise<GradebookEntry[]> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const query: any = { studentId };
    if (courseId) {
      query.courseId = courseId;
    }

    const grades = await Grade.find(query);
    const gradeMap = new Map<string, GradebookEntry>();

    for (const grade of grades) {
      const key = `${grade.courseId}:${grade.studentId}`;
      let entry = gradeMap.get(key);

      if (!entry) {
        entry = {
          studentId: grade.studentId,
          studentNumber: grade.studentNumber,
          courseId: grade.courseId,
          assessments: [],
          currentGrade: 0,
          letterGrade: 'F',
          gpa: 0,
          totalPoints: 0,
          earnedPoints: 0,
          lastUpdated: new Date(),
        };
      }

      const assessment = await Assessment.findOne({ id: grade.assessmentId });
      entry.assessments.push({
        assessmentId: grade.assessmentId,
        assessmentName: assessment?.title || 'Unknown',
        points: grade.earnedPoints,
        maxPoints: grade.totalPoints,
        percentage: grade.percentage,
        letterGrade: grade.letterGrade,
        gradedAt: grade.gradedAt,
      });

      entry.totalPoints = entry.assessments.reduce((sum, a) => sum + a.maxPoints, 0);
      entry.earnedPoints = entry.assessments.reduce((sum, a) => sum + a.points, 0);
      entry.currentGrade = entry.totalPoints > 0 ? (entry.earnedPoints / entry.totalPoints) * 100 : 0;
      entry.letterGrade = this.calculateLetterGrade(entry.currentGrade);
      entry.gpa = this.calculateGPA(entry.letterGrade);
      entry.lastUpdated = new Date();

      gradeMap.set(key, entry);
    }

    return Array.from(gradeMap.values());
  }

  /**
   * Get grade by ID (MongoDB)
   */
  async getGrade(gradeId: string): Promise<Grade | null> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }
    const grade = await Grade.findOne({ id: gradeId });
    return grade ? grade.toObject() : null;
  }

  /**
   * Get all grades for a student (MongoDB)
   */
  async getStudentGrades(studentId: string, courseId?: string): Promise<Grade[]> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }

    const query: any = { studentId };
    if (courseId) {
      query.courseId = courseId;
    }

    const grades = await Grade.find(query).sort({ gradedAt: -1 });
    return grades.map(g => g.toObject());
  }

  /**
   * Get submission by ID (MongoDB)
   */
  async getSubmission(submissionId: string): Promise<Submission | null> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }
    const submission = await Submission.findOne({ id: submissionId });
    return submission ? submission.toObject() : null;
  }

  /**
   * Get assessment by ID (MongoDB)
   */
  async getAssessment(assessmentId: string): Promise<Assessment | null> {
    if (!azoraDatabase.isDatabaseConnected()) {
      throw new Error('Database not connected');
    }
    const assessment = await Assessment.findOne({ id: assessmentId });
    return assessment ? assessment.toObject() : null;
  }
}

export const gradingEngine = GradingEngine.getInstance();
