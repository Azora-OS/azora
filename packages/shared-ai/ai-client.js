const axios = require('axios');

const AI_ORCHESTRATOR_URL = process.env.AI_ORCHESTRATOR_URL || 'http://localhost:4020';

class AIClient {
  // Chat with AI family member
  async chat(character, message, context = []) {
    try {
      const response = await axios.post(`${AI_ORCHESTRATOR_URL}/api/chat`, {
        character,
        message,
        context
      });
      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get AI tutoring
  async getTutoring(question, subject, studentLevel = 'beginner') {
    try {
      const response = await axios.post(`${AI_ORCHESTRATOR_URL}/api/tutor`, {
        question,
        subject,
        studentLevel
      });
      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Generate learning path
  async generateLearningPath(goal, currentLevel, timeframe) {
    try {
      const response = await axios.post(`${AI_ORCHESTRATOR_URL}/api/learning-path`, {
        goal,
        currentLevel,
        timeframe
      });
      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new AIClient();
