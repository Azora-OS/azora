const { apiClient } = require('../../packages/api-client');

describe('AI Tutor Integration', () => {
  beforeAll(async () => {
    const auth = await apiClient.auth.login('test@azora.world', 'password');
    apiClient.setToken(auth.accessToken);
  });

  test('should get AI tutor response', async () => {
    const response = await apiClient.tutor.ask(
      'What is a variable in Python?',
      {
        studentId: 'student-123',
        subject: 'Python Programming',
        level: 'Beginner',
        history: []
      }
    );
    
    expect(response.success).toBe(true);
    expect(response.answer).toBeDefined();
    expect(response.answer.length).toBeGreaterThan(0);
  });

  test('should generate learning path', async () => {
    const path = await apiClient.tutor.getLearningPath(
      'Python Programming',
      'Beginner',
      ['Build web apps', 'Data analysis']
    );
    
    expect(path.success).toBe(true);
    expect(path.path).toBeDefined();
  });
});
