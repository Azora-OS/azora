const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 🎓 AZORA EDUCATION - NEXT-GEN LEARNING PLATFORM
console.log('🌟 Azora Education Platform - Initializing...');

// In-memory storage (replace with database in production)
const learners = new Map();
const courses = new Map();
const achievements = new Map();
const learningPaths = new Map();
const aiTutorSessions = new Map();

// 🤖 ELARA AI TUTOR - Advanced Learning Companion
class ElaraAI {
  constructor() {
    this.personality = 'encouraging';
    this.learningStyles = ['visual', 'auditory', 'kinesthetic', 'reading'];
  }

  generatePersonalizedResponse(learner, context) {
    const responses = {
      struggling: [
        "I notice you're finding this challenging. Let's break it down into smaller steps! 💪",
        "Every expert was once a beginner. You're making progress, even if it doesn't feel like it! 🌱",
        "This is exactly where growth happens. Let me adjust the difficulty for you. ✨"
      ],
      excelling: [
        "Incredible work! You're mastering this faster than expected! 🚀",
        "Your progress is inspiring! Ready for the next challenge? 🏆",
        "You're in the flow state - this is where magic happens! ⚡"
      ],
      curious: [
        "Great question! Your curiosity is your superpower. Let's explore this together! 🔍",
        "I love how you think! This connects to something fascinating... 🧠",
        "Your mind is making beautiful connections. Let's dive deeper! 🌊"
      ]
    };
    
    return responses[context][Math.floor(Math.random() * responses[context].length)];
  }

  adaptDifficulty(learner, performance) {
    const currentLevel = learner.difficultyLevel || 1;
    if (performance > 0.8) return Math.min(currentLevel + 0.2, 5);
    if (performance < 0.6) return Math.max(currentLevel - 0.1, 0.5);
    return currentLevel;
  }

  generateLearningPath(learner, goals) {
    return {
      id: `path_${Date.now()}`,
      learner: learner.id,
      goals,
      estimatedDuration: goals.length * 2, // weeks
      difficulty: learner.difficultyLevel || 1,
      modules: goals.map((goal, index) => ({
        id: `module_${index}`,
        title: goal,
        status: 'locked',
        xpReward: 100 + (index * 50),
        azrReward: 10 + (index * 5)
      }))
    };
  }
}

const elara = new ElaraAI();

// 🎮 GAMIFICATION ENGINE
class GamificationEngine {
  calculateXP(activity, performance, difficulty) {
    const baseXP = {
      'lesson_complete': 50,
      'quiz_pass': 75,
      'project_submit': 150,
      'peer_help': 25,
      'streak_maintain': 10
    };
    
    const multiplier = performance * difficulty;
    return Math.floor(baseXP[activity] * multiplier);
  }

  checkLevelUp(currentXP, currentLevel) {
    const xpRequired = currentLevel * 1000;
    return currentXP >= xpRequired ? currentLevel + 1 : currentLevel;
  }

  generateAchievement(type, data) {
    const achievements = {
      'first_lesson': { title: '🌱 First Steps', description: 'Completed your first lesson!' },
      'week_streak': { title: '🔥 Week Warrior', description: '7-day learning streak!' },
      'quiz_master': { title: '🧠 Quiz Master', description: 'Perfect score on 5 quizzes!' },
      'peer_helper': { title: '🤝 Ubuntu Helper', description: 'Helped 10 fellow learners!' },
      'course_complete': { title: '🎓 Course Conqueror', description: 'Completed entire course!' }
    };
    
    return {
      id: `achievement_${Date.now()}`,
      ...achievements[type],
      earnedAt: new Date().toISOString(),
      xpBonus: 200,
      azrBonus: 25
    };
  }
}

const gamification = new GamificationEngine();

// 💰 LEARN-TO-EARN ENGINE
class LearnToEarnEngine {
  calculateAZRReward(activity, performance, difficulty) {
    const baseAZR = {
      'lesson_complete': 5,
      'quiz_pass': 8,
      'project_submit': 20,
      'peer_review': 3,
      'content_create': 50
    };
    
    return Math.floor(baseAZR[activity] * performance * difficulty);
  }

  processProofOfKnowledge(learner, assessment) {
    const pokScore = assessment.score * assessment.difficulty;
    const azrReward = this.calculateAZRReward('quiz_pass', assessment.score, assessment.difficulty);
    
    return {
      pokScore,
      azrReward,
      timestamp: new Date().toISOString(),
      verified: true
    };
  }
}

const learnToEarn = new LearnToEarnEngine();

// 📚 COURSE LIBRARY - Premium Content
const initializeCourses = () => {
  const premiumCourses = [
    {
      id: 'ai_fundamentals',
      title: '🤖 AI Fundamentals: From Zero to Hero',
      instructor: 'Dr. Sarah Chen - MIT AI Lab',
      difficulty: 2,
      duration: '8 weeks',
      price: 0, // Free tier
      premium: false,
      modules: [
        { title: 'What is AI?', xp: 100, azr: 10 },
        { title: 'Machine Learning Basics', xp: 150, azr: 15 },
        { title: 'Neural Networks', xp: 200, azr: 20 },
        { title: 'AI Ethics', xp: 100, azr: 10 }
      ],
      skills: ['artificial-intelligence', 'machine-learning', 'ethics'],
      rating: 4.9,
      students: 15420
    },
    {
      id: 'quantum_computing',
      title: '⚛️ Quantum Computing Masterclass',
      instructor: 'Prof. David Kumar - Quantum Research Institute',
      difficulty: 4,
      duration: '12 weeks',
      price: 299,
      premium: true,
      modules: [
        { title: 'Quantum Mechanics Primer', xp: 200, azr: 25 },
        { title: 'Qubits and Superposition', xp: 250, azr: 30 },
        { title: 'Quantum Algorithms', xp: 300, azr: 40 },
        { title: 'Building Quantum Circuits', xp: 350, azr: 50 }
      ],
      skills: ['quantum-computing', 'physics', 'algorithms'],
      rating: 4.8,
      students: 2341
    },
    {
      id: 'entrepreneurship_bootcamp',
      title: '🚀 Startup Bootcamp: Build & Scale',
      instructor: 'Maria Rodriguez - Serial Entrepreneur',
      difficulty: 3,
      duration: '10 weeks',
      price: 199,
      premium: true,
      modules: [
        { title: 'Idea Validation', xp: 150, azr: 20 },
        { title: 'MVP Development', xp: 200, azr: 25 },
        { title: 'Fundraising Strategies', xp: 250, azr: 35 },
        { title: 'Scaling Operations', xp: 300, azr: 40 }
      ],
      skills: ['entrepreneurship', 'business', 'leadership'],
      rating: 4.7,
      students: 8932
    }
  ];

  premiumCourses.forEach(course => courses.set(course.id, course));
};

// 🎯 API ROUTES

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-education',
    ubuntu: 'I learn because we grow together',
    courses: courses.size,
    learners: learners.size,
    timestamp: new Date().toISOString()
  });
});

// Input validation middleware
const validateLearner = (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  next();
};

// Learner Management
app.post('/api/learners', validateLearner, (req, res) => {
  const { name, email, learningGoals, preferredStyle } = req.body;
  
  const learner = {
    id: `learner_${Date.now()}`,
    name,
    email,
    learningGoals: learningGoals || [],
    preferredStyle: preferredStyle || 'visual',
    level: 1,
    xp: 0,
    azrBalance: 100, // Welcome bonus
    streak: 0,
    achievements: [],
    enrolledCourses: [],
    difficultyLevel: 1,
    createdAt: new Date().toISOString()
  };
  
  try {
    learners.set(learner.id, learner);
    
    res.json({
      success: true,
      learner,
      welcomeMessage: elara.generatePersonalizedResponse(learner, 'curious')
    });
  } catch (error) {
    console.error('Error creating learner:', error);
    res.status(500).json({ error: 'Failed to create learner' });
  }
});

// Course Discovery
app.get('/api/courses', (req, res) => {
  const { category, difficulty, premium } = req.query;
  let filteredCourses = Array.from(courses.values());
  
  if (category) {
    filteredCourses = filteredCourses.filter(course => 
      course.skills.some(skill => skill.includes(category.toLowerCase()))
    );
  }
  
  if (difficulty) {
    filteredCourses = filteredCourses.filter(course => 
      course.difficulty <= parseInt(difficulty)
    );
  }
  
  if (premium !== undefined) {
    filteredCourses = filteredCourses.filter(course => 
      course.premium === (premium === 'true')
    );
  }
  
  res.json({
    courses: filteredCourses,
    total: filteredCourses.length,
    featured: filteredCourses.filter(c => c.rating >= 4.8).slice(0, 3)
  });
});

// Course Enrollment
app.post('/api/courses/:courseId/enroll', (req, res) => {
  try {
  const { courseId } = req.params;
  const { learnerId } = req.body;
  
  const course = courses.get(courseId);
  const learner = learners.get(learnerId);
  
  if (!course || !learner) {
    return res.status(404).json({ error: 'Course or learner not found' });
  }
  
  // Check if already enrolled
  if (learner.enrolledCourses.includes(courseId)) {
    return res.status(400).json({ error: 'Already enrolled in this course' });
  }
  
  // Check AZR balance for premium courses
  if (course.premium && learner.azrBalance < course.price) {
    return res.status(400).json({ 
      error: 'Insufficient AZR balance',
      required: course.price,
      current: learner.azrBalance
    });
  }
  
  // Process enrollment
  if (course.premium) {
    learner.azrBalance -= course.price;
  }
  
  learner.enrolledCourses.push(courseId);
  
  // Generate personalized learning path
  const learningPath = elara.generateLearningPath(learner, [course.title]);
  learningPaths.set(`${learnerId}_${courseId}`, learningPath);
  
    learners.set(learnerId, learner);
    
    res.json({
      success: true,
      enrollment: {
        courseId,
        learnerId,
        enrolledAt: new Date().toISOString(),
        learningPath: learningPath.id
      },
      elaraMessage: elara.generatePersonalizedResponse(learner, 'excelling')
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

// AI Tutor Interaction
app.post('/api/tutor/chat', (req, res) => {
  const { learnerId, message, context } = req.body;
  
  const learner = learners.get(learnerId);
  if (!learner) {
    return res.status(404).json({ error: 'Learner not found' });
  }
  
  // Simulate AI processing
  const response = elara.generatePersonalizedResponse(learner, context || 'curious');
  
  // Store session
  const sessionId = `session_${Date.now()}`;
  aiTutorSessions.set(sessionId, {
    learnerId,
    messages: [
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'elara', content: response, timestamp: new Date().toISOString() }
    ]
  });
  
  res.json({
    sessionId,
    response,
    suggestions: [
      'Tell me more about this topic',
      'Can you give me an example?',
      'What should I learn next?'
    ]
  });
});

// Learning Progress Tracking
app.post('/api/progress/update', (req, res) => {
  const { learnerId, courseId, moduleId, score, timeSpent } = req.body;
  
  const learner = learners.get(learnerId);
  const course = courses.get(courseId);
  
  if (!learner || !course) {
    return res.status(404).json({ error: 'Learner or course not found' });
  }
  
  // Calculate rewards
  const xpGained = gamification.calculateXP('lesson_complete', score, learner.difficultyLevel);
  const azrGained = learnToEarn.calculateAZRReward('lesson_complete', score, learner.difficultyLevel);
  
  // Update learner stats
  learner.xp += xpGained;
  learner.azrBalance += azrGained;
  
  // Check for level up
  const newLevel = gamification.checkLevelUp(learner.xp, learner.level);
  const leveledUp = newLevel > learner.level;
  learner.level = newLevel;
  
  // Check for achievements
  const newAchievements = [];
  if (learner.enrolledCourses.length === 1 && !learner.achievements.includes('first_lesson')) {
    const achievement = gamification.generateAchievement('first_lesson');
    learner.achievements.push(achievement.id);
    achievements.set(achievement.id, achievement);
    newAchievements.push(achievement);
  }
  
  // Adapt difficulty based on performance
  learner.difficultyLevel = elara.adaptDifficulty(learner, score);
  
  learners.set(learnerId, learner);
  
  res.json({
    success: true,
    progress: {
      xpGained,
      azrGained,
      totalXP: learner.xp,
      totalAZR: learner.azrBalance,
      level: learner.level,
      leveledUp,
      newAchievements,
      difficultyLevel: learner.difficultyLevel
    },
    elaraMessage: elara.generatePersonalizedResponse(learner, score > 0.8 ? 'excelling' : 'struggling')
  });
});

// Leaderboards
app.get('/api/leaderboards', (req, res) => {
  const { type = 'xp', limit = 10 } = req.query;
  
  const learnerArray = Array.from(learners.values());
  
  const sortedLearners = learnerArray
    .sort((a, b) => b[type] - a[type])
    .slice(0, parseInt(limit))
    .map((learner, index) => ({
      rank: index + 1,
      name: learner.name,
      level: learner.level,
      xp: learner.xp,
      azrBalance: learner.azrBalance,
      achievements: learner.achievements.length
    }));
  
  res.json({
    leaderboard: sortedLearners,
    type,
    total: learnerArray.length
  });
});

// Achievement System
app.get('/api/achievements/:learnerId', (req, res) => {
  const { learnerId } = req.params;
  const learner = learners.get(learnerId);
  
  if (!learner) {
    return res.status(404).json({ error: 'Learner not found' });
  }
  
  const learnerAchievements = learner.achievements.map(id => achievements.get(id)).filter(Boolean);
  
  res.json({
    achievements: learnerAchievements,
    total: learnerAchievements.length,
    totalXPFromAchievements: learnerAchievements.reduce((sum, ach) => sum + (ach.xpBonus || 0), 0)
  });
});

// WebSocket for Real-time Learning
wss.on('connection', (ws, req) => {
  console.log('🔗 New learning session connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join_study_room':
          ws.studyRoom = data.roomId;
          ws.learnerId = data.learnerId;
          
          // Broadcast to room
          wss.clients.forEach(client => {
            if (client.studyRoom === data.roomId && client !== ws) {
              client.send(JSON.stringify({
                type: 'peer_joined',
                learnerId: data.learnerId,
                message: 'A fellow learner joined your study session! 🤝'
              }));
            }
          });
          break;
          
        case 'study_progress':
          // Broadcast progress to study room
          wss.clients.forEach(client => {
            if (client.studyRoom === ws.studyRoom && client !== ws) {
              client.send(JSON.stringify({
                type: 'peer_progress',
                learnerId: ws.learnerId,
                progress: data.progress
              }));
            }
          });
          break;
          
        case 'ask_elara':
          // Real-time AI tutor response
          const learner = learners.get(data.learnerId);
          if (learner) {
            const response = elara.generatePersonalizedResponse(learner, 'curious');
            ws.send(JSON.stringify({
              type: 'elara_response',
              message: response,
              timestamp: new Date().toISOString()
            }));
          }
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('📚 Learning session ended');
  });
});

// Initialize platform
initializeCourses();

const PORT = process.env.PORT || 4500;
server.listen(PORT, () => {
  console.log('🌟 Azora Education Platform running on port', PORT);
  console.log('🎓 Features: AI Tutor Elara, Gamification, Learn-to-Earn, Premium Content');
  console.log('🤖 AI Personalization: Active');
  console.log('💰 AZR Rewards: Enabled');
  console.log('🏆 Achievement System: Active');
  console.log('🌍 Ubuntu Philosophy: "I learn because we grow together"');
});