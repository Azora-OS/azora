const { autoGradeAssessment } = require('../index');

describe('Auto Grade Function', () => {
  it('should correctly grade multiple choice questions', () => {
    const questions = [
      {
        type: 'multiple-choice',
        correctAnswer: 1,
        points: 1
      },
      {
        type: 'multiple-choice',
        correctAnswer: 0,
        points: 1
      }
    ];
    
    const answers = [1, 0];
    
    const result = autoGradeAssessment(questions, answers);
    
    expect(result.score).toBe(2);
    expect(result.maxScore).toBe(2);
  });

  it('should correctly grade true/false questions', () => {
    const questions = [
      {
        type: 'true-false',
        correctAnswer: true,
        points: 1
      },
      {
        type: 'true-false',
        correctAnswer: false,
        points: 1
      }
    ];
    
    const answers = [true, false];
    
    const result = autoGradeAssessment(questions, answers);
    
    expect(result.score).toBe(2);
    expect(result.maxScore).toBe(2);
  });

  it('should handle incorrect answers', () => {
    const questions = [
      {
        type: 'multiple-choice',
        correctAnswer: 1,
        points: 1
      },
      {
        type: 'true-false',
        correctAnswer: true,
        points: 1
      }
    ];
    
    const answers = [0, false]; // Both incorrect
    
    const result = autoGradeAssessment(questions, answers);
    
    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(2);
  });
});