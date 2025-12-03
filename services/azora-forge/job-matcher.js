#!/usr/bin/env node

/**
 * Azora Forge - Job Matching Service (Agent 4 Implementation)
 * AI-powered job matching and skills marketplace
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

// Job Database
class JobDatabase {
  constructor() {
    this.jobs = new Map();
    this.applications = new Map();
    this.companies = new Map();
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Sample jobs
    const sampleJobs = [
      {
        id: 'job_001',
        title: 'Senior React Developer',
        company: 'TechCorp',
        location: 'Remote',
        type: 'full-time',
        salaryRange: { min: 80000, max: 120000, currency: 'USD' },
        requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
        preferredSkills: ['GraphQL', 'AWS', 'Docker'],
        experienceLevel: 'senior',
        description: 'Join our team building next-generation web applications',
        requirements: ['5+ years React experience', 'Strong TypeScript skills'],
        benefits: ['Health insurance', 'Remote work', '401k matching'],
        postedAt: new Date(),
        status: 'active'
      },
      {
        id: 'job_002',
        title: 'Python Data Scientist',
        company: 'DataFlow Inc',
        location: 'San Francisco, CA',
        type: 'full-time',
        salaryRange: { min: 90000, max: 140000, currency: 'USD' },
        requiredSkills: ['Python', 'Machine Learning', 'Pandas', 'NumPy'],
        preferredSkills: ['TensorFlow', 'PyTorch', 'SQL', 'R'],
        experienceLevel: 'mid',
        description: 'Analyze large datasets to drive business insights',
        requirements: ['3+ years Python experience', 'ML/AI background'],
        benefits: ['Equity', 'Learning budget', 'Flexible hours'],
        postedAt: new Date(),
        status: 'active'
      },
      {
        id: 'job_003',
        title: 'Blockchain Developer',
        company: 'CryptoStart',
        location: 'Remote',
        type: 'contract',
        salaryRange: { min: 100, max: 200, currency: 'USD', period: 'hourly' },
        requiredSkills: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts'],
        preferredSkills: ['DeFi', 'NFTs', 'Layer 2', 'Rust'],
        experienceLevel: 'senior',
        description: 'Build the future of decentralized finance',
        requirements: ['Smart contract development', 'DeFi protocols'],
        benefits: ['Token allocation', 'Remote work', 'Cutting-edge tech'],
        postedAt: new Date(),
        status: 'active'
      }
    ];

    sampleJobs.forEach(job => this.jobs.set(job.id, job));

    // Sample companies
    const sampleCompanies = [
      {
        id: 'company_001',
        name: 'TechCorp',
        industry: 'Technology',
        size: '1000-5000',
        location: 'San Francisco, CA',
        description: 'Leading technology company',
        website: 'https://techcorp.com',
        benefits: ['Health insurance', 'Stock options', 'Remote work']
      },
      {
        id: 'company_002',
        name: 'DataFlow Inc',
        industry: 'Data Analytics',
        size: '100-500',
        location: 'New York, NY',
        description: 'Data-driven insights company',
        website: 'https://dataflow.com',
        benefits: ['Learning budget', 'Flexible hours', 'Health insurance']
      }
    ];

    sampleCompanies.forEach(company => this.companies.set(company.id, company));
  }

  addJob(job) {
    const jobId = `job_${Date.now()}`;
    const jobData = {
      id: jobId,
      ...job,
      postedAt: new Date(),
      status: 'active',
      applications: []
    };
    
    this.jobs.set(jobId, jobData);
    return jobData;
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  getAllJobs(filters = {}) {
    let jobs = Array.from(this.jobs.values());

    // Apply filters
    if (filters.location) {
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        job.location.toLowerCase() === 'remote'
      );
    }

    if (filters.type) {
      jobs = jobs.filter(job => job.type === filters.type);
    }

    if (filters.experienceLevel) {
      jobs = jobs.filter(job => job.experienceLevel === filters.experienceLevel);
    }

    if (filters.skills && filters.skills.length > 0) {
      jobs = jobs.filter(job => {
        const jobSkills = [...job.requiredSkills, ...job.preferredSkills];
        return filters.skills.some(skill => 
          jobSkills.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
      });
    }

    if (filters.salaryMin) {
      jobs = jobs.filter(job => job.salaryRange.max >= filters.salaryMin);
    }

    return jobs.filter(job => job.status === 'active');
  }

  searchJobs(query) {
    const jobs = Array.from(this.jobs.values());
    const searchTerm = query.toLowerCase();

    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm) ||
      job.company.toLowerCase().includes(searchTerm) ||
      job.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
      job.preferredSkills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
  }
}

// Skills Assessment Engine
class SkillsAssessmentEngine {
  constructor() {
    this.skillsDatabase = new Map();
    this.assessments = new Map();
    this.initializeSkills();
  }

  initializeSkills() {
    const skills = [
      {
        id: 'javascript',
        name: 'JavaScript',
        category: 'Programming',
        difficulty: 'beginner_to_advanced',
        relatedSkills: ['TypeScript', 'React', 'Node.js', 'Vue.js'],
        marketDemand: 'high',
        averageSalary: 75000
      },
      {
        id: 'react',
        name: 'React',
        category: 'Frontend Framework',
        difficulty: 'intermediate',
        relatedSkills: ['JavaScript', 'TypeScript', 'Redux', 'Next.js'],
        marketDemand: 'very_high',
        averageSalary: 85000
      },
      {
        id: 'python',
        name: 'Python',
        category: 'Programming',
        difficulty: 'beginner_to_advanced',
        relatedSkills: ['Django', 'Flask', 'Pandas', 'NumPy'],
        marketDemand: 'very_high',
        averageSalary: 80000
      },
      {
        id: 'solidity',
        name: 'Solidity',
        category: 'Blockchain',
        difficulty: 'advanced',
        relatedSkills: ['Ethereum', 'Web3.js', 'Smart Contracts'],
        marketDemand: 'high',
        averageSalary: 120000
      }
    ];

    skills.forEach(skill => this.skillsDatabase.set(skill.id, skill));
  }

  generateAssessment(skillId, difficulty = 'adaptive') {
    const skill = this.skillsDatabase.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }

    const assessmentId = `assessment_${Date.now()}`;
    const questions = this.generateQuestions(skillId, difficulty);

    const assessment = {
      id: assessmentId,
      skillId,
      skill: skill.name,
      difficulty,
      questions,
      timeLimit: questions.length * 3, // 3 minutes per question
      createdAt: new Date(),
      status: 'active'
    };

    this.assessments.set(assessmentId, assessment);
    return assessment;
  }

  generateQuestions(skillId, difficulty) {
    // Simplified question generation
    const questionTemplates = {
      javascript: [
        {
          type: 'multiple_choice',
          question: 'What is the correct way to declare a variable in JavaScript?',
          options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
          correct: 0,
          difficulty: 'beginner'
        },
        {
          type: 'code_completion',
          question: 'Complete the function to return the sum of an array:',
          code: 'function sum(arr) {\n  // Your code here\n}',
          correct: 'return arr.reduce((a, b) => a + b, 0);',
          difficulty: 'intermediate'
        }
      ],
      react: [
        {
          type: 'multiple_choice',
          question: 'What is JSX?',
          options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
          correct: 0,
          difficulty: 'beginner'
        }
      ],
      python: [
        {
          type: 'multiple_choice',
          question: 'Which of the following is used to create a list in Python?',
          options: ['[]', '()', '{}', '""'],
          correct: 0,
          difficulty: 'beginner'
        }
      ]
    };

    return questionTemplates[skillId] || [];
  }

  evaluateAssessment(assessmentId, answers) {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    let correctAnswers = 0;
    const results = [];

    assessment.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correct;
      
      if (isCorrect) correctAnswers++;
      
      results.push({
        questionIndex: index,
        correct: isCorrect,
        userAnswer,
        correctAnswer: question.correct
      });
    });

    const score = (correctAnswers / assessment.questions.length) * 100;
    const level = this.determineSkillLevel(score);

    const result = {
      assessmentId,
      score,
      level,
      correctAnswers,
      totalQuestions: assessment.questions.length,
      results,
      completedAt: new Date()
    };

    return result;
  }

  determineSkillLevel(score) {
    if (score >= 90) return 'expert';
    if (score >= 75) return 'advanced';
    if (score >= 60) return 'intermediate';
    if (score >= 40) return 'beginner';
    return 'novice';
  }

  getSkillInsights(skillId) {
    const skill = this.skillsDatabase.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }

    return {
      skill,
      marketTrends: {
        demand: skill.marketDemand,
        averageSalary: skill.averageSalary,
        growth: 'increasing', // Simplified
        hotness: 'trending'
      },
      learningPath: {
        prerequisites: this.getPrerequisites(skillId),
        nextSteps: this.getNextSteps(skillId),
        relatedSkills: skill.relatedSkills
      },
      jobOpportunities: this.getJobOpportunities(skillId)
    };
  }

  getPrerequisites(skillId) {
    const prerequisites = {
      react: ['JavaScript', 'HTML', 'CSS'],
      nodejs: ['JavaScript'],
      solidity: ['Programming fundamentals', 'Blockchain basics']
    };

    return prerequisites[skillId] || [];
  }

  getNextSteps(skillId) {
    const nextSteps = {
      javascript: ['React', 'Node.js', 'TypeScript'],
      react: ['Next.js', 'Redux', 'React Native'],
      python: ['Django', 'Flask', 'Data Science']
    };

    return nextSteps[skillId] || [];
  }

  getJobOpportunities(skillId) {
    // Simplified job opportunity data
    return {
      totalJobs: Math.floor(Math.random() * 1000) + 100,
      averageSalary: this.skillsDatabase.get(skillId)?.averageSalary || 70000,
      topCompanies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'],
      locations: ['San Francisco', 'New York', 'Seattle', 'Remote']
    };
  }
}

// Job Matching Algorithm
class JobMatchingEngine {
  constructor(jobDatabase, skillsEngine) {
    this.jobDatabase = jobDatabase;
    this.skillsEngine = skillsEngine;
  }

  async findMatches(candidateProfile, preferences = {}) {
    const jobs = this.jobDatabase.getAllJobs(preferences);
    const matches = [];

    for (const job of jobs) {
      const matchScore = this.calculateMatchScore(candidateProfile, job);
      
      if (matchScore.overall >= 0.3) { // Minimum 30% match
        matches.push({
          job,
          matchScore,
          reasons: this.generateMatchReasons(candidateProfile, job, matchScore),
          recommendations: this.generateRecommendations(candidateProfile, job)
        });
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore.overall - a.matchScore.overall);

    return matches;
  }

  calculateMatchScore(candidate, job) {
    const skillScore = this.calculateSkillMatch(candidate.skills || [], job.requiredSkills, job.preferredSkills);
    const experienceScore = this.calculateExperienceMatch(candidate.experience || 0, job.experienceLevel);
    const locationScore = this.calculateLocationMatch(candidate.location, job.location);
    const salaryScore = this.calculateSalaryMatch(candidate.expectedSalary, job.salaryRange);

    const weights = {
      skills: 0.4,
      experience: 0.3,
      location: 0.2,
      salary: 0.1
    };

    const overall = (
      skillScore * weights.skills +
      experienceScore * weights.experience +
      locationScore * weights.location +
      salaryScore * weights.salary
    );

    return {
      overall: Math.round(overall * 100) / 100,
      skills: skillScore,
      experience: experienceScore,
      location: locationScore,
      salary: salaryScore
    };
  }

  calculateSkillMatch(candidateSkills, requiredSkills, preferredSkills = []) {
    const allJobSkills = [...requiredSkills, ...preferredSkills];
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
    
    let matchedRequired = 0;
    let matchedPreferred = 0;

    requiredSkills.forEach(skill => {
      if (candidateSkillsLower.includes(skill.toLowerCase())) {
        matchedRequired++;
      }
    });

    preferredSkills.forEach(skill => {
      if (candidateSkillsLower.includes(skill.toLowerCase())) {
        matchedPreferred++;
      }
    });

    const requiredScore = requiredSkills.length > 0 ? matchedRequired / requiredSkills.length : 1;
    const preferredScore = preferredSkills.length > 0 ? matchedPreferred / preferredSkills.length : 0;

    return (requiredScore * 0.8) + (preferredScore * 0.2);
  }

  calculateExperienceMatch(candidateExp, jobLevel) {
    const experienceMap = {
      'entry': 0,
      'junior': 1,
      'mid': 3,
      'senior': 5,
      'lead': 8,
      'principal': 10
    };

    const requiredExp = experienceMap[jobLevel] || 0;
    
    if (candidateExp >= requiredExp) {
      return 1.0;
    } else if (candidateExp >= requiredExp * 0.7) {
      return 0.8;
    } else if (candidateExp >= requiredExp * 0.5) {
      return 0.6;
    } else {
      return 0.3;
    }
  }

  calculateLocationMatch(candidateLocation, jobLocation) {
    if (!candidateLocation || !jobLocation) return 0.5;
    
    if (jobLocation.toLowerCase() === 'remote') return 1.0;
    if (candidateLocation.toLowerCase().includes(jobLocation.toLowerCase())) return 1.0;
    if (jobLocation.toLowerCase().includes(candidateLocation.toLowerCase())) return 1.0;
    
    return 0.3; // Different locations
  }

  calculateSalaryMatch(expectedSalary, salaryRange) {
    if (!expectedSalary || !salaryRange) return 0.5;
    
    if (expectedSalary >= salaryRange.min && expectedSalary <= salaryRange.max) {
      return 1.0;
    } else if (expectedSalary <= salaryRange.max * 1.1) {
      return 0.8;
    } else if (expectedSalary <= salaryRange.max * 1.2) {
      return 0.6;
    } else {
      return 0.3;
    }
  }

  generateMatchReasons(candidate, job, matchScore) {
    const reasons = [];

    if (matchScore.skills >= 0.8) {
      reasons.push('Strong skill alignment with job requirements');
    } else if (matchScore.skills >= 0.6) {
      reasons.push('Good skill match with some gaps');
    }

    if (matchScore.experience >= 0.8) {
      reasons.push('Experience level matches job requirements');
    }

    if (matchScore.location >= 0.8) {
      reasons.push('Location preference aligned');
    }

    if (matchScore.salary >= 0.8) {
      reasons.push('Salary expectations within range');
    }

    return reasons;
  }

  generateRecommendations(candidate, job) {
    const recommendations = [];

    // Skill recommendations
    const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase());
    const missingRequired = job.requiredSkills.filter(skill => 
      !candidateSkills.includes(skill.toLowerCase())
    );

    if (missingRequired.length > 0) {
      recommendations.push({
        type: 'skill_development',
        message: `Consider learning: ${missingRequired.join(', ')}`,
        priority: 'high'
      });
    }

    // Experience recommendations
    if (candidate.experience < 3 && job.experienceLevel === 'senior') {
      recommendations.push({
        type: 'experience',
        message: 'Gain more experience through projects or internships',
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

// Initialize systems
const jobDatabase = new JobDatabase();
const skillsEngine = new SkillsAssessmentEngine();
const matchingEngine = new JobMatchingEngine(jobDatabase, skillsEngine);

// API Routes
app.get('/api/jobs', (req, res) => {
  try {
    const filters = req.query;
    const jobs = jobDatabase.getAllJobs(filters);

    res.json({
      success: true,
      data: {
        jobs,
        total: jobs.length,
        filters: filters
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/jobs/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const jobs = jobDatabase.searchJobs(q);

    res.json({
      success: true,
      data: {
        jobs,
        total: jobs.length,
        query: q
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/jobs/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = jobDatabase.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/jobs/:jobId/apply', (req, res) => {
  try {
    const { jobId } = req.params;
    const { candidateId, coverLetter, resume } = req.body;

    const job = jobDatabase.getJob(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const applicationId = `app_${Date.now()}`;
    const application = {
      id: applicationId,
      jobId,
      candidateId,
      coverLetter,
      resume,
      status: 'submitted',
      appliedAt: new Date()
    };

    jobDatabase.applications.set(applicationId, application);

    res.json({
      success: true,
      data: {
        applicationId,
        message: 'Application submitted successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/match-jobs', async (req, res) => {
  try {
    const { candidateProfile, preferences = {} } = req.body;

    if (!candidateProfile) {
      return res.status(400).json({
        success: false,
        error: 'Candidate profile is required'
      });
    }

    const matches = await matchingEngine.findMatches(candidateProfile, preferences);

    res.json({
      success: true,
      data: {
        matches,
        total: matches.length,
        candidateProfile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/skills/assess', (req, res) => {
  try {
    const { skillId, difficulty = 'adaptive' } = req.body;

    if (!skillId) {
      return res.status(400).json({
        success: false,
        error: 'Skill ID is required'
      });
    }

    const assessment = skillsEngine.generateAssessment(skillId, difficulty);

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

app.post('/api/skills/evaluate', (req, res) => {
  try {
    const { assessmentId, answers } = req.body;

    if (!assessmentId || !answers) {
      return res.status(400).json({
        success: false,
        error: 'Assessment ID and answers are required'
      });
    }

    const result = skillsEngine.evaluateAssessment(assessmentId, answers);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/skills/:skillId/insights', (req, res) => {
  try {
    const { skillId } = req.params;
    const insights = skillsEngine.getSkillInsights(skillId);

    res.json({
      success: true,
      data: insights
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
    service: 'Azora Forge - Job Matching',
    status: 'healthy',
    timestamp: new Date(),
    stats: {
      totalJobs: jobDatabase.jobs.size,
      totalCompanies: jobDatabase.companies.size,
      totalSkills: skillsEngine.skillsDatabase.size
    },
    version: '1.0.0'
  });
});

// Socket.IO for real-time job alerts
io.on('connection', (socket) => {
  console.log('User connected to Azora Forge');

  socket.on('subscribe_job_alerts', (preferences) => {
    socket.join('job_alerts');
    socket.emit('subscribed', {
      message: 'Subscribed to job alerts',
      preferences
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from Azora Forge');
  });
});

const PORT = process.env.PORT || 4013;

server.listen(PORT, () => {
  console.log(`🔨 Azora Forge Job Matching running on port ${PORT}`);
  console.log(`💼 ${jobDatabase.jobs.size} jobs available`);
  console.log(`🎯 AI-powered matching with Ubuntu principles`);
});

module.exports = { app, jobDatabase, skillsEngine, matchingEngine };