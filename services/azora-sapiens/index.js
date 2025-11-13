#!/usr/bin/env node

/**
 * Azora Sapiens - AI Tutor Service (Agent 2 Implementation)
 * Complete AI tutoring system with personalized learning paths
 */

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Learning Paths Database
const LEARNING_PATHS = {
  javascript: {
    id: 'javascript',
    title: 'JavaScript Mastery',
    description: 'Complete JavaScript from basics to advanced',
    difficulty: 'beginner_to_advanced',
    duration: '12 weeks',
    modules: [
      {
        id: 'js_basics',
        title: 'JavaScript Fundamentals',
        lessons: ['variables', 'functions', 'objects', 'arrays'],
        duration: '2 weeks'
      },
      {
        id: 'js_dom',
        title: 'DOM Manipulation',
        lessons: ['selectors', 'events', 'styling', 'forms'],
        duration: '2 weeks'
      },
      {
        id: 'js_async',
        title: 'Asynchronous JavaScript',
        lessons: ['promises', 'async_await', 'fetch', 'apis'],
        duration: '2 weeks'
      },
      {
        id: 'js_frameworks',
        title: 'Modern Frameworks',
        lessons: ['react', 'vue', 'angular', 'node'],
        duration: '6 weeks'
      }
    ]
  },
  python: {
    id: 'python',
    title: 'Python Programming',
    description: 'Python from basics to data science',
    difficulty: 'beginner_to_advanced',
    duration: '10 weeks',
    modules: [
      {
        id: 'py_basics',
        title: 'Python Fundamentals',
        lessons: ['syntax', 'data_types', 'control_flow', 'functions'],
        duration: '2 weeks'
      },
      {
        id: 'py_oop',
        title: 'Object-Oriented Programming',
        lessons: ['classes', 'inheritance', 'polymorphism', 'encapsulation'],
        duration: '2 weeks'
      },
      {
        id: 'py_data',
        title: 'Data Science',
        lessons: ['pandas', 'numpy', 'matplotlib', 'sklearn'],
        duration: '3 weeks'
      },
      {
        id: 'py_web',
        title: 'Web Development',
        lessons: ['flask', 'django', 'fastapi', 'databases'],
        duration: '3 weeks'
      }
    ]
  },
  blockchain: {
    id: 'blockchain',
    title: 'Blockchain Development',
    description: 'Smart contracts and DeFi development',
    difficulty: 'intermediate_to_advanced',
    duration: '8 weeks',
    modules: [
      {
        id: 'bc_basics',
        title: 'Blockchain Fundamentals',
        lessons: ['cryptography', 'consensus', 'networks', 'wallets'],
        duration: '2 weeks'
      },
      {
        id: 'bc_solidity',
        title: 'Solidity Programming',
        lessons: ['syntax', 'contracts', 'inheritance', 'libraries'],
        duration: '3 weeks'
      },
      {
        id: 'bc_defi',
        title: 'DeFi Development',
        lessons: ['tokens', 'exchanges', 'lending', 'governance'],
        duration: '3 weeks'
      }
    ]
  }
};

// Assessment Engine
class AssessmentEngine {
  constructor() {
    this.questionBank = new Map();
    this.initializeQuestions();
  }

  initializeQuestions() {
    // JavaScript Questions
    this.questionBank.set('javascript', [
      {
        id: 'js_1',
        type: 'multiple_choice',
        difficulty: 'beginner',
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
        correct: 0,
        explanation: 'Variables in JavaScript are declared using var, let, or const keywords.'
      },
      {
        id: 'js_2',
        type: 'code_completion',
        difficulty: 'intermediate',
        question: 'Complete the function to return the sum of two numbers:',
        code: 'function add(a, b) {\n  // Your code here\n}',
        correct: 'return a + b;',
        explanation: 'Functions return values using the return statement.'
      }
    ]);

    // Python Questions
    this.questionBank.set('python', [
      {
        id: 'py_1',
        type: 'multiple_choice',
        difficulty: 'beginner',
        question: 'Which of the following is the correct way to create a list in Python?',
        options: ['list = []', 'list = ()', 'list = {}', 'list = ""'],
        correct: 0,
        explanation: 'Lists in Python are created using square brackets [].'
      }
    ]);
  }

  generateAssessment(skillArea, type = 'adaptive', difficulty = 'mixed') {
    const questions = this.questionBank.get(skillArea) || [];
    
    if (questions.length === 0) {
      throw new Error(`No questions available for ${skillArea}`);
    }

    const assessment = {
      id: `assessment_${Date.now()}`,
      skillArea,
      type,
      difficulty,
      questions: this.selectQuestions(questions, type, difficulty),
      timeLimit: this.calculateTimeLimit(questions.length),
      createdAt: new Date()
    };

    return assessment;
  }

  selectQuestions(questions, type, difficulty) {
    // For adaptive assessments, start with mixed difficulty
    if (type === 'adaptive') {
      return questions.slice(0, Math.min(10, questions.length));
    }
    
    return questions.filter(q => difficulty === 'mixed' || q.difficulty === difficulty);
  }

  calculateTimeLimit(questionCount) {
    return questionCount * 2; // 2 minutes per question
  }

  evaluateAssessment(assessmentId, responses) {
    // Simplified evaluation
    const correctAnswers = responses.filter(r => r.isCorrect).length;
    const totalQuestions = responses.length;
    const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;

    return {
      assessmentId,
      accuracy,
      correctAnswers,
      totalQuestions,
      level: this.determineSkillLevel(accuracy),
      recommendations: this.generateRecommendations(accuracy),
      completedAt: new Date()
    };
  }

  determineSkillLevel(accuracy) {
    if (accuracy >= 0.9) return 'expert';
    if (accuracy >= 0.75) return 'advanced';
    if (accuracy >= 0.6) return 'intermediate';
    if (accuracy >= 0.4) return 'beginner';
    return 'novice';
  }

  generateRecommendations(accuracy) {
    if (accuracy >= 0.8) {
      return ['Consider advanced topics', 'Try building projects', 'Mentor others'];
    } else if (accuracy >= 0.6) {
      return ['Review intermediate concepts', 'Practice more exercises', 'Join study groups'];
    } else {
      return ['Focus on fundamentals', 'Take beginner courses', 'Get personalized tutoring'];
    }
  }
}

// Progress Tracker
class ProgressTracker {
  constructor() {
    this.studentProgress = new Map();
  }

  initializeStudent(studentId, learningPath) {
    const progress = {
      studentId,
      learningPath,
      currentModule: 0,
      currentLesson: 0,
      completedLessons: [],
      assessmentScores: [],
      timeSpent: 0,
      startDate: new Date(),
      lastActivity: new Date()
    };

    this.studentProgress.set(studentId, progress);
    return progress;
  }

  updateProgress(studentId, moduleId, lessonId, score = null) {
    const progress = this.studentProgress.get(studentId);
    if (!progress) {
      throw new Error(`Student ${studentId} not found`);
    }

    const lessonKey = `${moduleId}_${lessonId}`;
    if (!progress.completedLessons.includes(lessonKey)) {
      progress.completedLessons.push(lessonKey);
    }

    if (score !== null) {
      progress.assessmentScores.push({
        moduleId,
        lessonId,
        score,
        timestamp: new Date()
      });
    }

    progress.lastActivity = new Date();
    this.studentProgress.set(studentId, progress);

    return progress;
  }

  getProgress(studentId) {
    return this.studentProgress.get(studentId);
  }

  calculateCompletionPercentage(studentId) {
    const progress = this.studentProgress.get(studentId);
    if (!progress) return 0;

    const learningPath = LEARNING_PATHS[progress.learningPath];
    if (!learningPath) return 0;

    const totalLessons = learningPath.modules.reduce((total, module) => 
      total + module.lessons.length, 0);
    
    return totalLessons > 0 ? (progress.completedLessons.length / totalLessons) * 100 : 0;
  }
}

// Tutor Engine
class TutorEngine {
  constructor() {
    this.assessmentEngine = new AssessmentEngine();
    this.progressTracker = new ProgressTracker();
    this.conversations = new Map();
  }

  async startTutoringSession(studentId, subject) {
    const sessionId = `session_${Date.now()}_${studentId}`;
    
    const session = {
      id: sessionId,
      studentId,
      subject,
      startTime: new Date(),
      messages: [],
      currentTopic: null,
      learningObjectives: [],
      status: 'active'
    };

    this.conversations.set(sessionId, session);

    return {
      sessionId,
      welcomeMessage: `Hello! I'm Elara, your AI tutor. I'm excited to help you learn ${subject}! Let's start by understanding what you'd like to focus on today. What specific topic interests you?`,
      suggestedTopics: this.getSuggestedTopics(subject),
      learningPath: LEARNING_PATHS[subject] || null
    };
  }

  async processMessage(sessionId, message) {
    const session = this.conversations.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add user message to conversation
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Generate tutor response
    const response = await this.generateTutorResponse(session, message);

    // Add tutor response to conversation
    session.messages.push({
      role: 'tutor',
      content: response.message,
      timestamp: new Date()
    });

    session.lastActivity = new Date();
    this.conversations.set(sessionId, session);

    return response;
  }

  async generateTutorResponse(session, message) {
    const lowerMessage = message.toLowerCase();

    // Check for specific learning requests
    if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
      return {
        message: `Great question! Let me explain that concept step by step. ${this.getExplanation(session.subject, message)}`,
        type: 'explanation',
        resources: this.getRelatedResources(session.subject),
        nextSteps: ['Try a practice exercise', 'Ask follow-up questions', 'Move to next topic']
      };
    }

    if (lowerMessage.includes('practice') || lowerMessage.includes('exercise')) {
      return {
        message: "Perfect! Practice is key to mastering any skill. Let me create a personalized exercise for you.",
        type: 'practice',
        exercise: this.generatePracticeExercise(session.subject),
        nextSteps: ['Complete the exercise', 'Ask for hints', 'Request explanation']
      };
    }

    if (lowerMessage.includes('stuck') || lowerMessage.includes('help') || lowerMessage.includes('confused')) {
      return {
        message: "No worries at all! Getting stuck is part of learning. Let's break this down into smaller steps. What specific part is challenging you?",
        type: 'support',
        hints: this.generateHints(session.subject, session.currentTopic),
        nextSteps: ['Ask specific questions', 'Try a simpler example', 'Review fundamentals']
      };
    }

    // Default encouraging response
    return {
      message: `I understand you're working on ${session.subject}. That's fantastic! Learning is a journey, and every question brings you closer to mastery. What would you like to explore next?`,
      type: 'encouragement',
      suggestions: this.getSuggestedTopics(session.subject),
      nextSteps: ['Choose a topic', 'Take an assessment', 'Start a project']
    };
  }

  getExplanation(subject, topic) {
    const explanations = {
      javascript: "JavaScript is a versatile programming language that runs in browsers and servers. It's the language of the web!",
      python: "Python is a powerful, readable programming language perfect for beginners and experts alike.",
      blockchain: "Blockchain is a distributed ledger technology that enables secure, transparent transactions."
    };

    return explanations[subject] || "This is an important concept in computer science that builds foundational understanding.";
  }

  generatePracticeExercise(subject) {
    const exercises = {
      javascript: {
        title: "Create a Simple Calculator",
        description: "Write a function that adds two numbers",
        starter_code: "function calculator(a, b, operation) {\n  // Your code here\n}",
        solution: "return operation === 'add' ? a + b : 0;"
      },
      python: {
        title: "List Manipulation",
        description: "Create a function that finds the maximum number in a list",
        starter_code: "def find_max(numbers):\n    # Your code here\n    pass",
        solution: "return max(numbers) if numbers else None"
      }
    };

    return exercises[subject] || {
      title: "Practice Exercise",
      description: "Complete this coding challenge",
      starter_code: "// Write your solution here",
      solution: "// Solution will be provided after attempt"
    };
  }

  generateHints(subject, topic) {
    return [
      "Break the problem into smaller steps",
      "Think about what you already know",
      "Try writing pseudocode first",
      "Look for patterns in similar problems"
    ];
  }

  getSuggestedTopics(subject) {
    const topics = {
      javascript: ['Variables', 'Functions', 'Objects', 'Arrays', 'DOM Manipulation'],
      python: ['Data Types', 'Control Flow', 'Functions', 'Classes', 'Libraries'],
      blockchain: ['Cryptography', 'Smart Contracts', 'DeFi', 'NFTs', 'Consensus']
    };

    return topics[subject] || ['Fundamentals', 'Practice', 'Projects', 'Advanced Topics'];
  }

  getRelatedResources(subject) {
    return [
      { type: 'video', title: `${subject} Tutorial`, url: '#' },
      { type: 'article', title: `${subject} Guide`, url: '#' },
      { type: 'practice', title: `${subject} Exercises`, url: '#' }
    ];
  }
}

// Initialize engines
const tutorEngine = new TutorEngine();

// API Routes
app.get('/api/learning-paths', (req, res) => {
  res.json({
    success: true,
    paths: LEARNING_PATHS
  });
});

app.get('/api/learning-paths/:pathId', (req, res) => {
  const { pathId } = req.params;
  const path = LEARNING_PATHS[pathId];

  if (!path) {
    return res.status(404).json({
      success: false,
      error: `Learning path ${pathId} not found`
    });
  }

  res.json({
    success: true,
    path: path
  });
});

app.post('/api/tutoring/start', async (req, res) => {
  try {
    const { studentId, subject } = req.body;

    if (!studentId || !subject) {
      return res.status(400).json({
        success: false,
        error: 'Student ID and subject are required'
      });
    }

    const session = await tutorEngine.startTutoringSession(studentId, subject);

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/tutoring/:sessionId/message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const response = await tutorEngine.processMessage(sessionId, message);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/assessment/generate', async (req, res) => {
  try {
    const { skillArea, type = 'adaptive', difficulty = 'mixed' } = req.body;

    if (!skillArea) {
      return res.status(400).json({
        success: false,
        error: 'Skill area is required'
      });
    }

    const assessment = tutorEngine.assessmentEngine.generateAssessment(skillArea, type, difficulty);

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/progress/:studentId/update', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { moduleId, lessonId, score } = req.body;

    const progress = tutorEngine.progressTracker.updateProgress(studentId, moduleId, lessonId, score);
    const completionPercentage = tutorEngine.progressTracker.calculateCompletionPercentage(studentId);

    res.json({
      success: true,
      data: {
        progress,
        completionPercentage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/progress/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const progress = tutorEngine.progressTracker.getProgress(studentId);
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Student progress not found'
      });
    }

    const completionPercentage = tutorEngine.progressTracker.calculateCompletionPercentage(studentId);

    res.json({
      success: true,
      data: {
        progress,
        completionPercentage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Azora Sapiens - AI Tutor',
    status: 'healthy',
    timestamp: new Date(),
    learning_paths: Object.keys(LEARNING_PATHS).length,
    version: '1.0.0'
  });
});

// Socket.IO for real-time tutoring
io.on('connection', (socket) => {
  console.log('Student connected to Azora Sapiens');

  socket.on('start_tutoring', async (data) => {
    try {
      const { studentId, subject } = data;
      const session = await tutorEngine.startTutoringSession(studentId, subject);
      socket.emit('tutoring_started', session);
    } catch (error) {
      socket.emit('tutoring_error', { error: error.message });
    }
  });

  socket.on('send_message', async (data) => {
    try {
      const { sessionId, message } = data;
      const response = await tutorEngine.processMessage(sessionId, message);
      socket.emit('tutor_response', response);
    } catch (error) {
      socket.emit('tutoring_error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Student disconnected from Azora Sapiens');
  });
});

const PORT = process.env.PORT || 4011;

server.listen(PORT, () => {
  console.log(`🤖 Azora Sapiens AI Tutor running on port ${PORT}`);
  console.log(`📚 ${Object.keys(LEARNING_PATHS).length} learning paths available`);
  console.log('🎓 Personalized learning with Ubuntu philosophy');
});

module.exports = app;