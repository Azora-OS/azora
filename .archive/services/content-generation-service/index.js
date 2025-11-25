const express = require('express');
const { PrismaClient } = require('@prisma/client');
const Queue = require('bull');
const natural = require('natural');
const sentiment = require('sentiment');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const winston = require('winston');
const Joi = require('joi');
const axios = require('axios');
require('dotenv').config();

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'content-generation-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize sentiment analyzer
const sentimentAnalyzer = new sentiment();

// Initialize queues for async content generation
const contentQueue = new Queue('content-generation', {
  redis: { host: process.env.REDIS_HOST || 'localhost', port: 6379 }
});

const learningPathQueue = new Queue('learning-path-generation', {
  redis: { host: process.env.REDIS_HOST || 'localhost', port: 6379 }
});

// Content generation templates
const CONTENT_TEMPLATES = {
  lesson: {
    structure: [
      'learning_objectives',
      'introduction',
      'main_content',
      'examples',
      'practice_exercises',
      'summary',
      'assessment'
    ],
    prompts: {
      learning_objectives: "Create 3-5 clear, measurable learning objectives for: {topic}",
      introduction: "Write an engaging introduction that hooks the learner and provides context for: {topic}",
      main_content: "Explain the core concepts of {topic} in a clear, structured manner suitable for {level} learners",
      examples: "Provide 2-3 practical, real-world examples that illustrate {topic}",
      practice_exercises: "Create 3-5 practice exercises or activities for {topic} at {level} difficulty",
      summary: "Write a concise summary that reinforces the key points of {topic}",
      assessment: "Create a short quiz or assessment with 5 questions to test understanding of {topic}"
    }
  },
  quiz: {
    structure: ['questions', 'answers', 'explanations'],
    prompts: {
      questions: "Generate 10 multiple-choice questions on {topic} at {level} difficulty level",
      answers: "Provide the correct answers and 3 distractors for each question on {topic}",
      explanations: "Write detailed explanations for why each answer is correct or incorrect for {topic}"
    }
  },
  learning_path: {
    structure: ['overview', 'modules', 'prerequisites', 'duration', 'outcomes'],
    prompts: {
      overview: "Create a comprehensive overview of the learning path for {topic} including target audience and value proposition",
      modules: "Design a structured curriculum with 5-8 modules covering {topic} from beginner to advanced levels",
      prerequisites: "Identify the prerequisite knowledge and skills needed for the {topic} learning path",
      duration: "Estimate realistic completion time for each module and the entire learning path for {topic}",
      outcomes: "Define measurable learning outcomes and competencies that learners will achieve in {topic}"
    }
  },
  personalized_content: {
    structure: ['assessment', 'custom_content', 'adaptations', 'progress_tracking'],
    prompts: {
      assessment: "Analyze the learner's profile and create a personalized learning assessment for {topic}",
      custom_content: "Generate customized content for {learner_profile} covering {topic} at their skill level",
      adaptations: "Suggest content adaptations and teaching methods for {learning_style} learners studying {topic}",
      progress_tracking: "Design a personalized progress tracking system for {topic} based on {learner_goals}"
    }
  }
};

// Validation schemas
const contentGenerationSchema = Joi.object({
  type: Joi.string().valid('lesson', 'quiz', 'learning_path', 'personalized_content').required(),
  topic: Joi.string().min(1).max(200).required(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional().default('intermediate'),
  learnerProfile: Joi.object().optional(),
  learningStyle: Joi.string().optional(),
  goals: Joi.array().items(Joi.string()).optional(),
  userId: Joi.string().optional(),
  priority: Joi.string().valid('high', 'normal', 'low').optional().default('normal')
});

const learningPathSchema = Joi.object({
  topic: Joi.string().min(1).max(200).required(),
  learnerId: Joi.string().required(),
  currentLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  goals: Joi.array().items(Joi.string()).required(),
  timeCommitment: Joi.string().valid('light', 'moderate', 'intensive').optional().default('moderate'),
  preferences: Joi.object().optional()
});

// Content generation functions
async function generateContent(type, topic, options = {}) {
  const template = CONTENT_TEMPLATES[type];
  if (!template) {
    throw new Error(`Unknown content type: ${type}`);
  }

  const { level = 'intermediate', learnerProfile, learningStyle, goals } = options;

  // Select appropriate AI model
  const modelSelection = await selectModelForContent(type, topic, options);

  const generatedContent = {};

  for (const section of template.structure) {
    const promptTemplate = template.prompts[section];
    const prompt = promptTemplate
      .replace(/{topic}/g, topic)
      .replace(/{level}/g, level)
      .replace(/{learner_profile}/g, learnerProfile ? JSON.stringify(learnerProfile) : 'general learner')
      .replace(/{learning_style}/g, learningStyle || 'visual')
      .replace(/{learner_goals}/g, goals ? goals.join(', ') : 'general learning');

    try {
      const response = await callAIAPI(modelSelection.modelId, prompt, {
        max_tokens: getMaxTokensForSection(section),
        temperature: getTemperatureForSection(section)
      });

      generatedContent[section] = {
        content: response.content,
        model: modelSelection.modelId,
        tokens: response.usage?.total_tokens || 0,
        generatedAt: new Date()
      };

      // Store generation metrics
      await storeContentMetrics(type, topic, section, response, modelSelection);

    } catch (error) {
      logger.error(`Content generation failed for ${type}:${section}`, { topic, error: error.message });
      generatedContent[section] = {
        error: error.message,
        fallback: true,
        content: getFallbackContent(section, topic)
      };
    }
  }

  return {
    type,
    topic,
    level,
    generatedContent,
    metadata: {
      totalSections: template.structure.length,
      generatedAt: new Date(),
      version: '1.0'
    }
  };
}

async function generateLearningPath(topic, learnerId, options = {}) {
  const {
    currentLevel,
    goals,
    timeCommitment = 'moderate',
    preferences = {}
  } = options;

  // Get learner profile from database
  const learnerProfile = await getLearnerProfile(learnerId);

  // Analyze learner's current knowledge and gaps
  const knowledgeAssessment = await assessLearnerKnowledge(learnerId, topic);

  // Generate personalized learning path
  const learningPath = {
    topic,
    learnerId,
    currentLevel,
    goals,
    timeCommitment,
    preferences,
    assessment: knowledgeAssessment,
    modules: [],
    totalDuration: 0,
    createdAt: new Date()
  };

  // Generate modules based on goals and assessment
  const modules = await generatePathModules(topic, goals, currentLevel, knowledgeAssessment, preferences);

  learningPath.modules = modules;
  learningPath.totalDuration = modules.reduce((total, module) => total + module.estimatedDuration, 0);

  // Store learning path
  const savedPath = await prisma.learningPath.create({
    data: {
      topic,
      learnerId,
      currentLevel,
      goals: goals,
      timeCommitment,
      preferences: preferences,
      assessment: knowledgeAssessment,
      modules: modules,
      totalDuration: learningPath.totalDuration,
      createdAt: new Date()
    }
  });

  return {
    id: savedPath.id,
    ...learningPath
  };
}

async function selectModelForContent(contentType, topic, options) {
  try {
    // Call AI Model Service to select appropriate model
    const response = await axios.post('http://localhost:3007/select-model', {
      task: contentType,
      priority: 'constitutional',
      requiredCapabilities: ['chat'],
      userId: options.userId
    });

    return response.data.model;
  } catch (error) {
    logger.warn('Model selection failed, using default', { error: error.message });
    // Fallback to default model
    return {
      modelId: 'elara-omega-v2',
      config: { name: 'Elara Ω v2.1' }
    };
  }
}

async function callAIAPI(modelId, prompt, options = {}) {
  try {
    // Call OpenAI service
    const response = await axios.post('http://localhost:3006/chat/completions', {
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0.7
    }, {
      headers: { 'x-user-id': 'content-generation-service' }
    });

    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage,
      model: response.data.model
    };
  } catch (error) {
    logger.error('AI API call failed', { modelId, error: error.message });
    throw error;
  }
}

async function storeContentMetrics(type, topic, section, response, modelSelection) {
  try {
    await prisma.contentGenerationMetric.create({
      data: {
        contentType: type,
        topic,
        section,
        modelId: modelSelection.modelId,
        tokensUsed: response.usage?.total_tokens || 0,
        responseTime: response.usage?.total_tokens ? response.usage.total_tokens * 0.01 : 0, // Estimate
        success: true,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Failed to store content metrics', { error: error.message });
  }
}

async function getLearnerProfile(learnerId) {
  // This would fetch from user service
  return {
    id: learnerId,
    learningStyle: 'visual',
    currentLevel: 'intermediate',
    interests: ['technology', 'education'],
    completedTopics: ['programming-basics', 'web-development']
  };
}

async function assessLearnerKnowledge(learnerId, topic) {
  // This would analyze learner's existing knowledge
  return {
    currentKnowledge: 0.3,
    knowledgeGaps: ['advanced-concepts', 'practical-application'],
    recommendedStartingPoint: 'intermediate',
    estimatedTimeToCompetency: '8 weeks'
  };
}

async function generatePathModules(topic, goals, currentLevel, assessment, preferences) {
  const modules = [];
  const baseModules = [
    { title: 'Foundations', level: 'beginner', duration: 2 },
    { title: 'Core Concepts', level: 'beginner', duration: 3 },
    { title: 'Intermediate Skills', level: 'intermediate', duration: 4 },
    { title: 'Advanced Techniques', level: 'advanced', duration: 5 },
    { title: 'Practical Application', level: 'advanced', duration: 3 },
    { title: 'Mastery & Projects', level: 'advanced', duration: 4 }
  ];

  for (const baseModule of baseModules) {
    if (shouldIncludeModule(baseModule, currentLevel, assessment)) {
      const module = {
        ...baseModule,
        id: `module_${modules.length + 1}`,
        objectives: await generateModuleObjectives(topic, baseModule.title, goals),
        resources: await generateModuleResources(topic, baseModule.title, preferences),
        assessment: await generateModuleAssessment(topic, baseModule.title),
        estimatedDuration: baseModule.duration
      };
      modules.push(module);
    }
  }

  return modules;
}

async function generateModuleObjectives(topic, moduleTitle, goals) {
  // Generate learning objectives for the module
  return [
    `Understand core concepts of ${topic} in ${moduleTitle}`,
    `Apply ${topic} principles to practical problems`,
    `Demonstrate proficiency in ${moduleTitle} techniques`
  ];
}

async function generateModuleResources(topic, moduleTitle, preferences) {
  // Generate recommended resources
  return [
    { type: 'video', title: `${topic} - ${moduleTitle} Overview`, duration: '15 min' },
    { type: 'article', title: `In-depth Guide to ${moduleTitle}`, readTime: '20 min' },
    { type: 'exercise', title: `Practice Exercises for ${moduleTitle}`, difficulty: 'medium' }
  ];
}

async function generateModuleAssessment(topic, moduleTitle) {
  // Generate assessment for the module
  return {
    type: 'quiz',
    questions: 10,
    passingScore: 80,
    timeLimit: 30,
    topics: [`${topic} - ${moduleTitle}`]
  };
}

function shouldIncludeModule(module, currentLevel, assessment) {
  // Logic to determine if module should be included based on learner level
  const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };
  return levelOrder[module.level] >= levelOrder[currentLevel];
}

function getMaxTokensForSection(section) {
  const tokenLimits = {
    learning_objectives: 200,
    introduction: 300,
    main_content: 1000,
    examples: 500,
    practice_exercises: 600,
    summary: 200,
    assessment: 400,
    questions: 800,
    answers: 600,
    explanations: 800,
    overview: 400,
    modules: 800,
    prerequisites: 300,
    duration: 200,
    outcomes: 400
  };
  return tokenLimits[section] || 500;
}

function getTemperatureForSection(section) {
  const temperatures = {
    learning_objectives: 0.3, // More focused
    introduction: 0.7, // More creative
    main_content: 0.5, // Balanced
    examples: 0.6, // Somewhat creative
    practice_exercises: 0.7, // Creative
    summary: 0.3, // Focused
    assessment: 0.4, // Structured
    questions: 0.5, // Balanced
    answers: 0.3, // Focused
    explanations: 0.4, // Structured
    overview: 0.6, // Balanced creative
    modules: 0.5, // Structured
    prerequisites: 0.3, // Focused
    duration: 0.2, // Very focused
    outcomes: 0.4 // Structured
  };
  return temperatures[section] || 0.5;
}

function getFallbackContent(section, topic) {
  const fallbacks = {
    learning_objectives: `By the end of this section, learners will be able to understand the basic concepts of ${topic}.`,
    introduction: `Welcome to the study of ${topic}. This topic covers fundamental concepts that are essential for further learning.`,
    main_content: `${topic} is an important subject that involves various concepts and applications.`,
    summary: `In summary, ${topic} encompasses several key ideas and principles that are crucial to understand.`
  };
  return fallbacks[section] || `Content about ${topic} for section ${section}.`;
}

// Queue processors
contentQueue.process(async (job) => {
  const { type, topic, options } = job.data;
  logger.info('Processing content generation job', { jobId: job.id, type, topic });

  try {
    const result = await generateContent(type, topic, options);

    // Store result
    await prisma.generatedContent.create({
      data: {
        type,
        topic,
        content: result,
        userId: options.userId,
        generatedAt: new Date(),
        status: 'completed'
      }
    });

    return result;
  } catch (error) {
    logger.error('Content generation job failed', { jobId: job.id, error: error.message });
    throw error;
  }
});

learningPathQueue.process(async (job) => {
  const { topic, learnerId, options } = job.data;
  logger.info('Processing learning path generation job', { jobId: job.id, topic, learnerId });

  try {
    const result = await generateLearningPath(topic, learnerId, options);
    return result;
  } catch (error) {
    logger.error('Learning path generation job failed', { jobId: job.id, error: error.message });
    throw error;
  }
});

// Initialize Express app
const app = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'content-generation-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Generate content endpoint
app.post('/generate', async (req, res) => {
  try {
    const { error, value } = contentGenerationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }

    const { type, topic, ...options } = value;

    // Add to queue for async processing
    const job = await contentQueue.add({
      type,
      topic,
      options: { ...options, userId: req.headers['x-user-id'] }
    }, {
      priority: options.priority === 'high' ? 1 : options.priority === 'low' ? 3 : 2
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Content generation started',
      estimatedTime: '2-5 minutes'
    });

  } catch (error) {
    logger.error('Content generation request error:', error);
    res.status(500).json({
      error: 'Content generation failed',
      message: error.message
    });
  }
});

// Generate learning path endpoint
app.post('/learning-path', async (req, res) => {
  try {
    const { error, value } = learningPathSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }

    const { topic, learnerId, ...options } = value;

    // Add to queue for async processing
    const job = await learningPathQueue.add({
      topic,
      learnerId,
      options
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Learning path generation started',
      estimatedTime: '3-7 minutes'
    });

  } catch (error) {
    logger.error('Learning path generation request error:', error);
    res.status(500).json({
      error: 'Learning path generation failed',
      message: error.message
    });
  }
});

// Get job status endpoint
app.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { queue } = req.query;

    let job;
    if (queue === 'learning-path') {
      job = await learningPathQueue.getJob(jobId);
    } else {
      job = await contentQueue.getJob(jobId);
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress();

    res.json({
      jobId,
      state,
      progress,
      createdAt: job.timestamp,
      processedAt: job.processedOn,
      finishedAt: job.finishedOn,
      result: state === 'completed' ? await job.returnvalue : null,
      error: state === 'failed' ? await job.failedReason : null
    });

  } catch (error) {
    logger.error('Job status retrieval error:', error);
    res.status(500).json({ error: 'Job status retrieval failed' });
  }
});

// Get generated content endpoint
app.get('/content/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await prisma.generatedContent.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);

  } catch (error) {
    logger.error('Content retrieval error:', error);
    res.status(500).json({ error: 'Content retrieval failed' });
  }
});

// Get learning paths for learner endpoint
app.get('/learning-paths/:learnerId', async (req, res) => {
  try {
    const { learnerId } = req.params;

    const paths = await prisma.learningPath.findMany({
      where: { learnerId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ learningPaths: paths });

  } catch (error) {
    logger.error('Learning paths retrieval error:', error);
    res.status(500).json({ error: 'Learning paths retrieval failed' });
  }
});

// Content analytics endpoint
app.get('/analytics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    const analytics = await prisma.contentGenerationMetric.groupBy({
      by: ['contentType'],
      where: {
        generatedAt: {
          gte: new Date(Date.now() - parsePeriod(period))
        }
      },
      _count: { id: true },
      _sum: { tokensUsed: true }
    });

    res.json({
      period,
      analytics,
      totalGenerations: analytics.reduce((sum, item) => sum + item._count.id, 0),
      totalTokens: analytics.reduce((sum, item) => sum + (item._sum.tokensUsed || 0), 0)
    });

  } catch (error) {
    logger.error('Analytics retrieval error:', error);
    res.status(500).json({ error: 'Analytics retrieval failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('API Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Helper function to parse time periods
function parsePeriod(period) {
  const unit = period.slice(-1);
  const value = parseInt(period.slice(0, -1));

  switch (unit) {
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000; // Default to 24 hours
  }
}

const PORT = process.env.PORT || 3008;

app.listen(PORT, async () => {
  logger.info(`Content Generation Service listening on port ${PORT}`);

  // Ensure database connection
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }

  console.log(`🚀 Content Generation Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await contentQueue.close();
  await learningPathQueue.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await contentQueue.close();
  await learningPathQueue.close();
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;