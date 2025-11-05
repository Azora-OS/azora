/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AI-PERSONALIZED LEARNING SYSTEM
 *
 * Implements personalized learning paths using AI techniques
 * including recommendation systems and adaptive difficulty adjustment.
 */

// Simple logger implementation for Node.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'ai-personalized-learning' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

class AIPersonalizedLearning {
  constructor() {
    this.studentProfiles = new Map();
    this.learningPaths = new Map();
    this.recommendationCache = new Map();
    this.skillDatabase = this.initializeSkillDatabase();
  }

  /**
   * Initialize comprehensive skill database
   */
  initializeSkillDatabase() {
    return {
      // Academic Skills
      mathematics: [
        'counting',
        'addition',
        'subtraction',
        'multiplication',
        'division',
        'fractions',
        'decimals',
        'percentages',
        'algebra',
        'geometry',
        'statistics',
        'calculus',
        'trigonometry',
      ],
      science: [
        'scientific_method',
        'biology',
        'chemistry',
        'physics',
        'earth_science',
        'astronomy',
        'ecology',
        'anatomy',
        'geology',
        'meteorology',
      ],
      language: [
        'phonics',
        'vocabulary',
        'grammar',
        'reading_comprehension',
        'writing',
        'spelling',
        'literature',
        'poetry',
        'creative_writing',
        'public_speaking',
      ],
      // Technical Skills
      coding: [
        'logic',
        'algorithms',
        'programming_fundamentals',
        'web_development',
        'app_development',
        'data_structures',
        'databases',
        'ai_basics',
        'cybersecurity',
        'game_development',
      ],
      // Creative Skills
      arts: [
        'drawing',
        'painting',
        'sculpture',
        'digital_art',
        'music_theory',
        'instrument_playing',
        'composition',
        'dance',
        'theater',
        'photography',
      ],
      // Life Skills
      life_skills: [
        'time_management',
        'financial_literacy',
        'communication',
        'leadership',
        'problem_solving',
        'critical_thinking',
        'emotional_intelligence',
        'decision_making',
        'conflict_resolution',
        'teamwork',
      ],
    };
  }

  /**
   * Create or update student profile
   */
  updateStudentProfile(studentId, profileData) {
    const profile = this.studentProfiles.get(studentId) || {
      id: studentId,
      learningStyle: 'mixed', // visual, auditory, kinesthetic, reading/writing
      pace: 'medium', // slow, medium, fast
      strengths: [],
      weaknesses: [],
      interests: [],
      masteredSkills: [],
      inProgressSkills: [],
      progress: {},
      preferences: {},
      funPoints: 0, // Gamification element
      streak: 0, // Daily learning streak
      achievements: [], // Learning achievements
    };

    // Update profile with new data
    Object.assign(profile, profileData);

    // Update learning style based on interactions
    if (profileData.interactions) {
      profile.learningStyle = this.determineLearningStyle(profileData.interactions);
    }

    this.studentProfiles.set(studentId, profile);

    logger.info('Student profile updated', { studentId });

    return profile;
  }

  /**
   * Determine learning style based on interactions
   */
  determineLearningStyle(interactions) {
    const styleScores = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      'reading/writing': 0,
    };

    // Analyze interactions to determine learning style
    interactions.forEach((interaction) => {
      switch (interaction.type) {
        case 'video':
        case 'diagram':
        case 'image':
          styleScores.visual += interaction.duration || 1;
          break;
        case 'audio':
        case 'discussion':
          styleScores.auditory += interaction.duration || 1;
          break;
        case 'simulation':
        case 'hands-on':
          styleScores.kinesthetic += interaction.duration || 1;
          break;
        case 'reading':
        case 'writing':
          styleScores['reading/writing'] += interaction.duration || 1;
          break;
      }
    });

    // Return the learning style with highest score
    return Object.keys(styleScores).reduce((a, b) => (styleScores[a] > styleScores[b] ? a : b));
  }

  /**
   * Generate personalized learning path
   */
  generateLearningPath(studentId, programId, modules) {
    const profile = this.studentProfiles.get(studentId);
    if (!profile) {
      throw new Error('Student profile not found');
    }

    // Create adaptive learning path
    const learningPath = {
      studentId,
      programId,
      createdAt: new Date(),
      modules: this.adaptModulesToStudent(modules, profile),
      estimatedCompletion: this.estimateCompletionTime(modules, profile),
      recommendations: this.generateRecommendations(profile),
      funElements: this.addFunElements(profile), // Make learning more enjoyable
      skillProgression: this.createSkillProgression(profile), // Skill-based progression
    };

    this.learningPaths.set(`${studentId}-${programId}`, learningPath);

    logger.info('Learning path generated', { studentId, programId });

    return learningPath;
  }

  /**
   * Adapt modules to student's learning style and pace
   */
  adaptModulesToStudent(modules, profile) {
    return modules.map((module) => {
      // Adjust content based on learning style
      const adaptedModule = { ...module };

      // Add recommended resources based on learning style
      adaptedModule.recommendedResources = this.getRecommendedResources(module.topic, profile.learningStyle);

      // Adjust estimated time based on student's pace
      adaptedModule.estimatedTime = this.adjustTimeForPace(module.estimatedTime, profile.pace);

      // Add adaptive difficulty
      adaptedModule.difficulty = this.calculateAdaptiveDifficulty(module.topic, profile);

      // Add gamification elements
      adaptedModule.gamification = this.addGamificationElements(module.topic);

      // Add micro-learning chunks for easier consumption
      adaptedModule.microLearningChunks = this.createMicroLearningChunks(module);

      return adaptedModule;
    });
  }

  /**
   * Get recommended resources based on learning style
   */
  getRecommendedResources(topic, learningStyle) {
    const resourceMap = {
      visual: ['Interactive diagrams', 'Video tutorials', 'Infographics', 'Charts and graphs', 'Colorful flashcards'],
      auditory: ['Audio lectures', 'Podcasts', 'Discussion forums', 'Verbal explanations', 'Songs and rhymes'],
      kinesthetic: [
        'Hands-on simulations',
        'Interactive labs',
        'Physical activities',
        'Role-playing exercises',
        'Building models',
      ],
      'reading/writing': [
        'Textbooks and articles',
        'Written tutorials',
        'Note-taking activities',
        'Writing assignments',
        'Story-based learning',
      ],
    };

    return resourceMap[learningStyle] || resourceMap.visual;
  }

  /**
   * Adjust time estimation based on student's pace
   */
  adjustTimeForPace(estimatedTime, pace) {
    const paceMultipliers = {
      slow: 1.5,
      medium: 1.0,
      fast: 0.7,
    };

    return Math.round(estimatedTime * (paceMultipliers[pace] || 1.0));
  }

  /**
   * Calculate adaptive difficulty based on student's progress
   */
  calculateAdaptiveDifficulty(topic, profile) {
    // Get student's performance in similar topics
    const performance = profile.progress[topic] || 0.5; // Default to medium

    // Adjust difficulty based on performance
    if (performance < 0.3) {
      return 'beginner';
    } else if (performance < 0.7) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }

  /**
   * Estimate completion time for entire program
   */
  estimateCompletionTime(modules, profile) {
    const totalTime = modules.reduce((sum, module) => {
      return sum + this.adjustTimeForPace(module.estimatedTime, profile.pace);
    }, 0);

    // Add buffer time for review and practice
    return Math.round(totalTime * 1.2);
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(profile) {
    const recommendations = [];

    // Recommend based on interests
    if (profile.interests && profile.interests.length > 0) {
      recommendations.push({
        type: 'interest-based',
        title: 'Explore your interests',
        description: `Based on your interest in ${profile.interests[0]}, we recommend these related topics.`,
        priority: 'high',
      });
    }

    // Recommend based on weaknesses
    if (profile.weaknesses && profile.weaknesses.length > 0) {
      recommendations.push({
        type: 'skill-gap',
        title: 'Strengthen your foundation',
        description: `Practice these foundational skills to improve your performance.`,
        priority: 'high',
      });
    }

    // Recommend based on learning style
    recommendations.push({
      type: 'learning-style',
      title: 'Optimize for your learning style',
      description: `We've adapted your learning path to match your ${profile.learningStyle} learning preferences.`,
      priority: 'medium',
    });

    // Recommend fun learning activities
    recommendations.push({
      type: 'fun-learning',
      title: 'Make learning fun',
      description: 'Try these gamified activities to make learning more enjoyable!',
      priority: 'high',
    });

    return recommendations;
  }

  /**
   * Add gamification elements to make learning fun
   */
  addGamificationElements(topic) {
    const gamificationElements = {
      points: Math.floor(Math.random() * 100) + 50,
      badges: ['Beginner', 'Explorer', 'Master'].slice(0, Math.floor(Math.random() * 3) + 1),
      challenges: ['Complete in 5 minutes', 'Get 100% accuracy', 'Help 3 friends learn this'],
      rewards: ['Unlock new content', 'Get special badge', 'Earn bonus points'],
    };

    // Topic-specific gamification
    const topicChallenges = {
      mathematics: ['Solve 5 problems in a row', 'Beat your previous time'],
      science: ['Conduct 3 virtual experiments', 'Discover a new fact'],
      language: ['Read a story', 'Write a paragraph'],
      coding: ['Complete a coding challenge', 'Build a mini-project'],
    };

    if (topicChallenges[topic]) {
      gamificationElements.challenges = [...gamificationElements.challenges, ...topicChallenges[topic]];
    }

    return gamificationElements;
  }

  /**
   * Create micro-learning chunks for easier consumption
   */
  createMicroLearningChunks(module) {
    // Break down module content into smaller, manageable chunks
    const chunkSize = 5; // minutes
    const totalChunks = Math.ceil(module.estimatedTime / chunkSize);

    return Array.from({ length: totalChunks }, (_, i) => ({
      id: `chunk-${i + 1}`,
      title: `${module.topic} - Part ${i + 1}`,
      duration: Math.min(chunkSize, module.estimatedTime - i * chunkSize),
      objectives: [`Understand key concept ${i + 1}`, `Practice with examples`, `Self-assess progress`],
    }));
  }

  /**
   * Add fun elements to make learning enjoyable
   */
  addFunElements(profile) {
    return {
      learningGames: ['Word Search Adventure', 'Math Race Challenge', 'Science Fact Quiz', 'Creative Story Builder'],
      rewardsSystem: {
        dailyStreakBonus: profile.streak * 10,
        achievementBadges: profile.achievements.length,
        funPoints: profile.funPoints,
      },
      socialLearning: ['Study with friends', 'Peer tutoring', 'Group challenges', 'Learning leaderboards'],
    };
  }

  /**
   * Create skill progression path
   */
  createSkillProgression(profile) {
    const progression = {};

    // For each skill category, create a progression path
    Object.keys(this.skillDatabase).forEach((category) => {
      progression[category] = {
        mastered: profile.masteredSkills.filter((skill) => this.skillDatabase[category].includes(skill)),
        inProgress: profile.inProgressSkills.filter((skill) => this.skillDatabase[category].includes(skill)),
        nextSkills: this.getNextSkills(category, profile),
        masteryLevel: this.calculateMasteryLevel(category, profile),
      };
    });

    return progression;
  }

  /**
   * Get next skills to learn based on current progress
   */
  getNextSkills(category, profile) {
    const allSkills = this.skillDatabase[category];
    const mastered = profile.masteredSkills;
    const inProgress = profile.inProgressSkills;

    // Filter out mastered and in-progress skills
    const availableSkills = allSkills.filter((skill) => !mastered.includes(skill) && !inProgress.includes(skill));

    // Return top 3 skills to learn next
    return availableSkills.slice(0, 3);
  }

  /**
   * Calculate mastery level for a skill category
   */
  calculateMasteryLevel(category, profile) {
    const allSkills = this.skillDatabase[category];
    const masteredCount = profile.masteredSkills.filter((skill) => this.skillDatabase[category].includes(skill)).length;

    return Math.round((masteredCount / allSkills.length) * 100);
  }

  /**
   * Update student progress
   */
  updateProgress(studentId, moduleId, progressData) {
    const profile = this.studentProfiles.get(studentId);
    if (!profile) {
      throw new Error('Student profile not found');
    }

    // Update progress
    profile.progress[moduleId] = progressData.completion;

    // Update strengths/weaknesses based on performance
    if (progressData.score !== undefined) {
      this.updateStrengthsAndWeaknesses(profile, moduleId, progressData.score);
    }

    // Update pace based on completion time
    if (progressData.timeSpent !== undefined) {
      this.updatePace(profile, progressData.timeSpent, progressData.estimatedTime);
    }

    // Award fun points for progress
    if (progressData.completion > 0) {
      profile.funPoints += Math.floor(progressData.completion * 10);
    }

    // Update streak if this is daily progress
    if (progressData.isDaily) {
      profile.streak = (profile.streak || 0) + 1;
    }

    // Check for achievements
    this.checkForAchievements(profile, moduleId, progressData);

    this.studentProfiles.set(studentId, profile);

    logger.info('Student progress updated', { studentId, moduleId });
  }

  /**
   * Update strengths and weaknesses based on performance
   */
  updateStrengthsAndWeaknesses(profile, moduleId, score) {
    if (score > 0.8) {
      // Add to strengths if not already there
      if (!profile.strengths.includes(moduleId)) {
        profile.strengths.push(moduleId);
      }
      // Remove from weaknesses if there
      const weaknessIndex = profile.weaknesses.indexOf(moduleId);
      if (weaknessIndex > -1) {
        profile.weaknesses.splice(weaknessIndex, 1);
      }

      // Add to mastered skills if score is excellent
      if (score > 0.9 && !profile.masteredSkills.includes(moduleId)) {
        profile.masteredSkills.push(moduleId);

        // Remove from in-progress skills
        const inProgressIndex = profile.inProgressSkills.indexOf(moduleId);
        if (inProgressIndex > -1) {
          profile.inProgressSkills.splice(inProgressIndex, 1);
        }
      }
    } else if (score < 0.4) {
      // Add to weaknesses if not already there
      if (!profile.weaknesses.includes(moduleId)) {
        profile.weaknesses.push(moduleId);
      }
      // Remove from strengths if there
      const strengthIndex = profile.strengths.indexOf(moduleId);
      if (strengthIndex > -1) {
        profile.strengths.splice(strengthIndex, 1);
      }
    } else {
      // Add to in-progress skills for moderate performance
      if (!profile.inProgressSkills.includes(moduleId) && !profile.masteredSkills.includes(moduleId)) {
        profile.inProgressSkills.push(moduleId);
      }
    }
  }

  /**
   * Update pace based on time spent vs estimated time
   */
  updatePace(profile, timeSpent, estimatedTime) {
    const ratio = timeSpent / estimatedTime;

    if (ratio > 1.5) {
      profile.pace = 'slow';
    } else if (ratio < 0.7) {
      profile.pace = 'fast';
    } else {
      profile.pace = 'medium';
    }
  }

  /**
   * Check for achievements based on progress
   */
  checkForAchievements(profile, moduleId, progressData) {
    const newAchievements = [];

    // Perfect score achievement
    if (progressData.score === 1.0) {
      newAchievements.push('Perfect Score Master');
    }

    // Quick learner achievement
    if (progressData.timeSpent < progressData.estimatedTime * 0.5) {
      newAchievements.push('Speed Learner');
    }

    // Consistent streak achievement
    if (profile.streak >= 7) {
      newAchievements.push('Week Warrior');
    }

    // Add new achievements to profile
    newAchievements.forEach((achievement) => {
      if (!profile.achievements.includes(achievement)) {
        profile.achievements.push(achievement);
        profile.funPoints += 50; // Bonus points for achievements
      }
    });
  }

  /**
   * Get personalized learning insights
   */
  getLearningInsights(studentId) {
    const profile = this.studentProfiles.get(studentId);
    if (!profile) {
      throw new Error('Student profile not found');
    }

    const insights = {
      learningStyle: profile.learningStyle,
      pace: profile.pace,
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
      interests: profile.interests,
      masteredSkills: profile.masteredSkills,
      inProgressSkills: profile.inProgressSkills,
      overallProgress: this.calculateOverallProgress(profile),
      recommendations: this.generateRecommendations(profile),
      funPoints: profile.funPoints,
      streak: profile.streak,
      achievements: profile.achievements,
      skillProgression: this.createSkillProgression(profile),
    };

    return insights;
  }

  /**
   * Calculate overall progress across all modules
   */
  calculateOverallProgress(profile) {
    const progressValues = Object.values(profile.progress);
    if (progressValues.length === 0) {
      return 0;
    }

    const sum = progressValues.reduce((acc, val) => acc + val, 0);
    return sum / progressValues.length;
  }

  /**
   * Recommend easier learning methods based on student profile
   */
  recommendEasyLearningMethods(studentId) {
    const profile = this.studentProfiles.get(studentId);
    if (!profile) {
      throw new Error('Student profile not found');
    }

    const recommendations = [];

    // Recommend micro-learning for students who need smaller chunks
    if (profile.pace === 'slow' || profile.weaknesses.length > 3) {
      recommendations.push({
        method: 'micro-learning',
        title: 'Try Micro-Learning',
        description: 'Break your learning into smaller 5-minute chunks for easier digestion',
        benefits: ['Reduces cognitive overload', 'Improves retention', 'Builds confidence'],
      });
    }

    // Recommend visual learning for visual learners
    if (profile.learningStyle === 'visual') {
      recommendations.push({
        method: 'visual-learning',
        title: 'Enhance Visual Learning',
        description: 'Use more diagrams, videos, and colorful materials',
        benefits: ['Improves understanding', 'Makes learning memorable', 'Engages visual memory'],
      });
    }

    // Recommend hands-on learning for kinesthetic learners
    if (profile.learningStyle === 'kinesthetic') {
      recommendations.push({
        method: 'hands-on-learning',
        title: 'Learn by Doing',
        description: 'Use interactive simulations and hands-on activities',
        benefits: ['Increases engagement', 'Improves retention', 'Makes learning fun'],
      });
    }

    // Recommend spaced repetition for better retention
    recommendations.push({
      method: 'spaced-repetition',
      title: 'Spaced Repetition',
      description: 'Review material at increasing intervals to improve long-term retention',
      benefits: ['Strengthens memory', 'Reduces forgetting', 'Builds lasting knowledge'],
    });

    // Recommend gamification to make learning fun
    recommendations.push({
      method: 'gamification',
      title: 'Learning Through Play',
      description: 'Use games, challenges, and rewards to make learning enjoyable',
      benefits: ['Increases motivation', 'Makes learning fun', 'Encourages persistence'],
    });

    return recommendations;
  }
}

module.exports = { AIPersonalizedLearning };
