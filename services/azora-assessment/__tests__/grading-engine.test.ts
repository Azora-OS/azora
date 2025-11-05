/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { gradingEngine, Assessment, Submission, Grade } from '../grading-engine';
import { connectAzoraDatabase, azoraDatabase } from '../../shared/database/connection';

describe('GradingEngine', () => {
  let testAssessment: Assessment;
  let testSubmission: Submission;
  const testStudentId = 'test-student-123';
  const testStudentNumber = 'ASU2025001';
  const testCourseId = 'test-course-123';
  const testModuleId = 'test-module-123';

  beforeAll(async () => {
    // Connect to test database
    await connectAzoraDatabase(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/azora-education-test');
  });

  afterAll(async () => {
    await azoraDatabase.disconnect();
  });

  beforeEach(async () => {
    // Create a test assessment
    testAssessment = await gradingEngine.createAssessment({
      courseId: testCourseId,
      moduleId: testModuleId,
      title: 'Test Assessment',
      description: 'Test assessment for unit testing',
      type: 'quiz',
      totalPoints: 100,
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          text: 'What is 2 + 2?',
          points: 25,
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          feedback: 'Correct!',
        },
        {
          id: 'q2',
          type: 'true-false',
          text: 'The sky is blue.',
          points: 25,
          correctAnswer: 'true',
        },
        {
          id: 'q3',
          type: 'short-answer',
          text: 'Name a programming language.',
          points: 50,
          correctAnswer: 'python, javascript, java',
        },
      ],
      createdBy: 'test-instructor',
      constitutionalAlignment: true,
    });
  });

  describe('createAssessment', () => {
    it('should create an assessment successfully', async () => {
      const assessment = await gradingEngine.createAssessment({
        courseId: 'course-1',
        moduleId: 'module-1',
        title: 'New Assessment',
        description: 'Test',
        type: 'quiz',
        totalPoints: 50,
        passingScore: 35,
        questions: [],
        createdBy: 'instructor-1',
        constitutionalAlignment: true,
      });

      expect(assessment).toBeDefined();
      expect(assessment.id).toBeDefined();
      expect(assessment.title).toBe('New Assessment');
      expect(assessment.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error if database not connected', async () => {
      await azoraDatabase.disconnect();
      await expect(
        gradingEngine.createAssessment({
          courseId: 'course-1',
          moduleId: 'module-1',
          title: 'Test',
          description: 'Test',
          type: 'quiz',
          totalPoints: 50,
          passingScore: 35,
          questions: [],
          createdBy: 'instructor-1',
          constitutionalAlignment: true,
        })
      ).rejects.toThrow('Database not connected');
      await connectAzoraDatabase();
    });
  });

  describe('submitAssessment', () => {
    it('should submit an assessment successfully', async () => {
      const submission = await gradingEngine.submitAssessment({
        assessmentId: testAssessment.id,
        studentId: testStudentId,
        studentNumber: testStudentNumber,
        answers: [
          { questionId: 'q1', answer: '4', type: 'multiple-choice', timestamp: new Date() },
          { questionId: 'q2', answer: 'true', type: 'true-false', timestamp: new Date() },
        ],
      });

      expect(submission).toBeDefined();
      expect(submission.id).toBeDefined();
      expect(submission.status).toBe('submitted');
      expect(submission.submittedAt).toBeInstanceOf(Date);
      testSubmission = submission;
    });

    it('should auto-grade if enabled and assessment allows', async () => {
      const submission = await gradingEngine.submitAssessment({
        assessmentId: testAssessment.id,
        studentId: testStudentId + '-2',
        studentNumber: testStudentNumber + '-2',
        answers: [
          { questionId: 'q1', answer: '4', type: 'multiple-choice', timestamp: new Date() },
          { questionId: 'q2', answer: 'true', type: 'true-false', timestamp: new Date() },
        ],
      });

      // Wait a bit for auto-grading
      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedSubmission = await gradingEngine.getSubmission(submission.id);
      expect(updatedSubmission?.status).toBe('graded');
    });

    it('should throw error if assessment not found', async () => {
      await expect(
        gradingEngine.submitAssessment({
          assessmentId: 'non-existent',
          studentId: testStudentId,
          studentNumber: testStudentNumber,
          answers: [],
        })
      ).rejects.toThrow('Assessment not found');
    });
  });

  describe('autoGrade', () => {
    it('should auto-grade a submission correctly', async () => {
      const submission = await gradingEngine.submitAssessment({
        assessmentId: testAssessment.id,
        studentId: testStudentId + '-auto',
        studentNumber: testStudentNumber + '-auto',
        answers: [
          { questionId: 'q1', answer: '4', type: 'multiple-choice', timestamp: new Date() },
          { questionId: 'q2', answer: 'true', type: 'true-false', timestamp: new Date() },
          { questionId: 'q3', answer: 'python', type: 'short-answer', timestamp: new Date() },
        ],
      });

      const grade = await gradingEngine.autoGrade(submission.id);

      expect(grade).toBeDefined();
      expect(grade.earnedPoints).toBeGreaterThan(0);
      expect(grade.percentage).toBeGreaterThan(0);
      expect(grade.letterGrade).toBeDefined();
      expect(grade.gradedBy).toBe('auto');
      expect(grade.uid).toBeDefined();
      expect(grade.questionGrades.length).toBe(3);
    });

    it('should handle incorrect answers', async () => {
      const submission = await gradingEngine.submitAssessment({
        assessmentId: testAssessment.id,
        studentId: testStudentId + '-wrong',
        studentNumber: testStudentNumber + '-wrong',
        answers: [
          { questionId: 'q1', answer: '3', type: 'multiple-choice', timestamp: new Date() },
          { questionId: 'q2', answer: 'false', type: 'true-false', timestamp: new Date() },
        ],
      });

      const grade = await gradingEngine.autoGrade(submission.id);

      expect(grade.earnedPoints).toBeLessThan(grade.totalPoints);
      expect(grade.questionGrades[0].points).toBe(0);
    });

    it('should throw error if submission not found', async () => {
      await expect(gradingEngine.autoGrade('non-existent')).rejects.toThrow('Submission not found');
    });
  });

  describe('manualGrade', () => {
    it('should manually grade a submission', async () => {
      const submission = await gradingEngine.submitAssessment({
        assessmentId: testAssessment.id,
        studentId: testStudentId + '-manual',
        studentNumber: testStudentNumber + '-manual',
        answers: [
          { questionId: 'q1', answer: '4', type: 'multiple-choice', timestamp: new Date() },
        ],
      });

      const grade = await gradingEngine.manualGrade(
        submission.id,
        'instructor-1',
        [
          { questionId: 'q1', points: 20, feedback: 'Good work' },
          { questionId: 'q2', points: 25, feedback: 'Correct' },
          { questionId: 'q3', points: 40, feedback: 'Well done' },
        ],
        { 'creativity': 5, 'clarity': 5 },
        'Excellent work overall'
      );

      expect(grade).toBeDefined();
      expect(grade.gradedBy).toBe('instructor-1');
      expect(grade.earnedPoints).toBe(85);
      expect(grade.feedback).toBe('Excellent work overall');
      expect(grade.rubricScores).toBeDefined();
    });
  });

  describe('getGradebook', () => {
    it('should get gradebook for a course', async () => {
      // Create additional submissions and grades
      const submission1 = await gradingEngine.submitAssessment({
        assessmentId: testAssessment.id,
        studentId: 'student-1',
        studentNumber: 'ASU2025002',
        answers: [
          { questionId: 'q1', answer: '4', type: 'multiple-choice', timestamp: new Date() },
        ],
      });
      await gradingEngine.autoGrade(submission1.id);

      const gradebook = await gradingEngine.getGradebook(testCourseId);

      expect(gradebook).toBeDefined();
      expect(Array.isArray(gradebook)).toBe(true);
      expect(gradebook.length).toBeGreaterThan(0);
      
      const entry = gradebook.find(e => e.studentId === 'student-1');
      expect(entry).toBeDefined();
      expect(entry?.assessments.length).toBeGreaterThan(0);
      expect(entry?.currentGrade).toBeGreaterThanOrEqual(0);
      expect(entry?.letterGrade).toBeDefined();
    });
  });

  describe('getStudentGradebook', () => {
    it('should get student gradebook', async () => {
      const submission = await gradingEngine.submitAssessment({
        assessmentId: testAssessment.id,
        studentId: 'student-gradebook',
        studentNumber: 'ASU2025003',
        answers: [
          { questionId: 'q1', answer: '4', type: 'multiple-choice', timestamp: new Date() },
        ],
      });
      await gradingEngine.autoGrade(submission.id);

      const gradebook = await gradingEngine.getStudentGradebook('student-gradebook');

      expect(gradebook).toBeDefined();
      expect(Array.isArray(gradebook)).toBe(true);
      expect(gradebook.length).toBeGreaterThan(0);
      expect(gradebook[0].studentId).toBe('student-gradebook');
    });
  });

  describe('edge cases', () => {
    it('should handle empty answers', async () => {
      const submission = await gradingEngine.submitAssessment({
        assessmentId: testAssessment.id,
        studentId: 'student-empty',
        studentNumber: 'ASU2025004',
        answers: [],
      });

      const grade = await gradingEngine.autoGrade(submission.id);

      expect(grade.earnedPoints).toBe(0);
      expect(grade.questionGrades.every(qg => qg.points === 0)).toBe(true);
    });

    it('should handle missing questions', async () => {
      const submission = await gradingEngine.submitAssessment({
        assessmentId: testAssessment.id,
        studentId: 'student-missing',
        studentNumber: 'ASU2025005',
        answers: [
          { questionId: 'non-existent', answer: 'test', type: 'multiple-choice', timestamp: new Date() },
        ],
      });

      const grade = await gradingEngine.autoGrade(submission.id);

      expect(grade).toBeDefined();
      // Should still grade the valid questions
    });

    it('should calculate letter grades correctly', async () => {
      const submission = await gradingEngine.submitAssessment({
        assessmentId: testAssessment.id,
        studentId: 'student-grade',
        studentNumber: 'ASU2025006',
        answers: [
          { questionId: 'q1', answer: '4', type: 'multiple-choice', timestamp: new Date() },
          { questionId: 'q2', answer: 'true', type: 'true-false', timestamp: new Date() },
          { questionId: 'q3', answer: 'python', type: 'short-answer', timestamp: new Date() },
        ],
      });

      const grade = await gradingEngine.autoGrade(submission.id);

      expect(grade.percentage).toBeGreaterThanOrEqual(0);
      expect(grade.percentage).toBeLessThanOrEqual(100);
      expect(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']).toContain(grade.letterGrade);
    });
  });
});
