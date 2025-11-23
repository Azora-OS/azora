/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA SAPIENS - EDUCATION PLATFORM
 *
 * Universal education platform with home-first approach.
 * Features CKQ (Core Knowledge Qualification) programs and Aegis Mobile Sentry.
 */

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');
const axios = require('axios');
const { AIPersonalizedLearning } = require('./ai-personalized-learning');
const { InteractiveSimulations } = require('./interactive-simulations');

class AzoraSapiens {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.clients = new Map();
    this.activeExams = new Map();
    this.enrollments = new Map();
    this.ckqPrograms = this.initializeCKQPrograms();
    this.academicKnowledgeGraph = new Map();
    this.mintServiceUrl = process.env.MINT_SERVICE_URL || 'http://localhost:4300';
    this.aiPersonalizedLearning = new AIPersonalizedLearning();
    this.interactiveSimulations = new InteractiveSimulations();
  }

  initializeCKQPrograms() {
    return {
      'planetary-economic-intelligence': {
        id: 'planetary-economic-intelligence',
        title: 'Planetary Economic Intelligence',
        description: 'Master the fundamentals of planetary-scale economic systems',
        duration: '8 weeks',
        level: 'CKQ-3',
        modules: [
          'Economic Systems Fundamentals',
          'Planetary Resource Allocation',
          'Market Dynamics & Prediction',
          'Sovereign Currency Design',
          'Innovation Capstone: Planetary Economic Modeling',
        ],
        assessment: {
          type: 'comprehensive_exam',
          duration: 180,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        instructor: 'Dr. Azora Prime',
      },
      'aegis-integrity-systems': {
        id: 'aegis-integrity-systems',
        title: 'Aegis Integrity Systems',
        description: 'Learn to build and maintain incorruptible systems',
        duration: '6 weeks',
        level: 'CKQ-2',
        modules: [
          'Integrity Fundamentals',
          'Blockchain Security Principles',
          'Cryptographic Sovereignty',
          'Mobile Sentry Architecture',
          'Innovation Capstone: Aegis Citadel Design',
        ],
        assessment: {
          type: 'practical_exam',
          duration: 150,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        instructor: 'Guardian Protocol',
      },
      'constitutional-economics': {
        id: 'constitutional-economics',
        title: 'Constitutional Economics',
        description: 'Building economies on mathematical and ethical foundations',
        duration: '7 weeks',
        level: 'CKQ-3',
        modules: [
          'Economic Constitution Design',
          'Mathematical Incentive Structures',
          'Ethical Economic Frameworks',
          'Constitutional AI Constraints',
          'Innovation Capstone: Sovereign Economy Constitution',
        ],
        assessment: {
          type: 'design_exam',
          duration: 210,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        instructor: 'Economic Architect',
      },
      'ai-economic-agents': {
        id: 'ai-economic-agents',
        title: 'AI Economic Agents',
        description: 'Programming autonomous economic intelligence',
        duration: '9 weeks',
        level: 'CKQ-4',
        modules: [
          'AI Agent Fundamentals',
          'Economic Decision Algorithms',
          'Autonomous Trading Systems',
          'Multi-Agent Coordination',
          'Innovation Capstone: Planetary Economic AI Network',
        ],
        assessment: {
          type: 'code_audit_exam',
          duration: 240,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        instructor: 'AI Architect',
      },

      // Business & Advanced Programs
      'executive-mba': {
        id: 'executive-mba',
        title: 'Executive MBA (Advanced)',
        description: 'Elite business leadership program for senior executives and entrepreneurs',
        duration: '18 months',
        modules: [
          'Strategic Leadership & Vision',
          'Financial Strategy & Capital Markets',
          'Digital Transformation & Innovation',
          'Global Economics & Geopolitics',
          'Organizational Design & Change Management',
          'Entrepreneurial Finance & Venture Capital',
          'Executive Communication & Negotiation',
          'Ethics, Governance & Corporate Social Responsibility',
          'Capstone: Strategic Business Transformation',
        ],
        assessment: {
          type: 'executive_thesis',
          duration: 480,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        tier: 'advanced',
      },
      'quantitative-finance': {
        id: 'quantitative-finance',
        title: 'Quantitative Finance & Risk Management (Advanced)',
        description: 'Advanced mathematical finance for financial engineers and risk professionals',
        duration: '12 months',
        modules: [
          'Stochastic Calculus & Financial Mathematics',
          'Derivative Pricing Models',
          'Risk Management & VaR Models',
          'Algorithmic Trading Strategies',
          'Machine Learning in Finance',
          'Portfolio Optimization Theory',
          'Credit Risk Modeling',
          'Regulatory Compliance & Stress Testing',
          'Capstone: Quantitative Trading System Development',
        ],
        assessment: {
          type: 'quantitative_thesis',
          duration: 360,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        tier: 'advanced',
      },
      'executive-leadership': {
        id: 'executive-leadership',
        title: 'Executive Leadership & Governance (Advanced)',
        description: 'Advanced leadership development for C-suite executives and board members',
        duration: '15 months',
        modules: [
          'Strategic Thinking & Decision Making',
          'Board Governance & Stakeholder Management',
          'Crisis Leadership & Resilience',
          'Executive Presence & Communication',
          'Talent Strategy & Organizational Culture',
          'Mergers & Acquisitions Strategy',
          'International Business Leadership',
          'Ethical Leadership in Complex Environments',
          'Capstone: Executive Leadership Simulation',
        ],
        assessment: {
          type: 'leadership_case_study',
          duration: 420,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        tier: 'advanced',
      },
      'blockchain-economics': {
        id: 'blockchain-economics',
        title: 'Blockchain Economics & DeFi (Advanced)',
        description: 'Advanced study of decentralized finance and blockchain economic systems',
        duration: '10 months',
        modules: [
          'Cryptoeconomic Theory & Token Design',
          'Decentralized Finance Protocols',
          'Blockchain Governance Models',
          'Stablecoin Economics & Monetary Policy',
          'Yield Farming & Liquidity Mining',
          'Decentralized Autonomous Organizations',
          'Regulatory Frameworks for DeFi',
          'Blockchain Scalability & Interoperability',
          'Capstone: DeFi Protocol Design & Implementation',
        ],
        assessment: {
          type: 'defi_protocol_audit',
          duration: 300,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        tier: 'advanced',
      },
      'ai-business-strategy': {
        id: 'ai-business-strategy',
        title: 'AI Business Strategy & Implementation (Advanced)',
        description: 'Strategic implementation of AI technologies in business operations',
        duration: '14 months',
        modules: [
          'AI Strategy & Business Model Innovation',
          'Machine Learning for Business Analytics',
          'AI Ethics & Responsible Implementation',
          'Data Strategy & Governance',
          'AI Product Development & Scaling',
          'Automation & Process Optimization',
          'AI-Driven Customer Experience',
          'Change Management for AI Adoption',
          'Capstone: AI Transformation Roadmap',
        ],
        assessment: {
          type: 'ai_strategy_thesis',
          duration: 390,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        tier: 'advanced',
      },
      'venture-capital-investing': {
        id: 'venture-capital-investing',
        title: 'Venture Capital & Private Equity (Advanced)',
        description: 'Advanced investment strategies for venture capital and private equity professionals',
        duration: '16 months',
        modules: [
          'Venture Capital Fundamentals & Deal Flow',
          'Due Diligence & Investment Analysis',
          'Term Sheet Negotiation & Deal Structure',
          'Portfolio Management & Exit Strategies',
          'Venture Capital Economics & IRR Analysis',
          'Sector-Specific Investment Strategies',
          'Impact Investing & ESG Considerations',
          'Fundraising & Limited Partner Relations',
          'Capstone: Venture Fund Launch & Management',
        ],
        assessment: {
          type: 'investment_thesis',
          duration: 450,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        tier: 'advanced',
      },
      'digital-marketing-leadership': {
        id: 'digital-marketing-leadership',
        title: 'Digital Marketing Leadership (Advanced)',
        description: 'Advanced digital marketing strategy and leadership for CMOs and marketing executives',
        duration: '12 months',
        modules: [
          'Digital Transformation Strategy',
          'Customer Journey Mapping & Analytics',
          'Content Strategy & Brand Storytelling',
          'Performance Marketing & Attribution',
          'Social Media Strategy & Influencer Marketing',
          'SEO & Technical Marketing',
          'Marketing Technology Stack & MarTech',
          'Data-Driven Marketing Decisions',
          'Capstone: Integrated Digital Marketing Campaign',
        ],
        assessment: {
          type: 'marketing_strategy_case',
          duration: 330,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        tier: 'advanced',
      },
      'cybersecurity-leadership': {
        id: 'cybersecurity-leadership',
        title: 'Cybersecurity Leadership & Strategy (Advanced)',
        description: 'Executive-level cybersecurity strategy and risk management',
        duration: '13 months',
        modules: [
          'Cybersecurity Strategy & Risk Management',
          'Incident Response & Crisis Management',
          'Regulatory Compliance & Standards',
          'Zero Trust Architecture & Implementation',
          'Cyber Insurance & Risk Transfer',
          'Board-Level Cybersecurity Reporting',
          'Supply Chain Security & Third-Party Risk',
          'Cyber Workforce Development',
          'Capstone: Enterprise Cybersecurity Program Design',
        ],
        assessment: {
          type: 'cybersecurity_audit',
          duration: 360,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        tier: 'advanced',
      },
      'sustainable-business-leadership': {
        id: 'sustainable-business-leadership',
        title: 'Sustainable Business Leadership (Advanced)',
        description: 'Leadership in sustainable business practices and ESG implementation',
        duration: '15 months',
        modules: [
          'ESG Strategy & Stakeholder Capitalism',
          'Climate Change Risk & Opportunity',
          'Sustainable Finance & Green Investing',
          'Circular Economy Business Models',
          'Diversity, Equity & Inclusion Leadership',
          'Supply Chain Sustainability',
          'Sustainable Innovation & Product Design',
          'Reporting & Transparency Standards',
          'Capstone: Sustainability Transformation Strategy',
        ],
        assessment: {
          type: 'sustainability_thesis',
          duration: 420,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        tier: 'advanced',
      },
      'healthcare-administration': {
        id: 'healthcare-administration',
        title: 'Healthcare Administration & Innovation (Advanced)',
        description: 'Advanced healthcare management and digital health innovation',
        duration: '16 months',
        modules: [
          'Healthcare Economics & Policy',
          'Digital Health Technology Implementation',
          'Healthcare Quality & Patient Safety',
          'Healthcare Data Analytics & AI',
          'Regulatory Compliance & HIPAA',
          'Healthcare Finance & Reimbursement',
          'Telemedicine & Virtual Care Models',
          'Healthcare Innovation & Entrepreneurship',
          'Capstone: Healthcare System Transformation',
        ],
        assessment: {
          type: 'healthcare_strategy_case',
          duration: 450,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        tier: 'advanced',
      },
      'international-business-law': {
        id: 'international-business-law',
        title: 'International Business Law & Compliance (Advanced)',
        description: 'Advanced international business law and cross-border compliance',
        duration: '14 months',
        modules: [
          'International Trade Law & WTO',
          'Cross-Border Transactions & M&A',
          'International Tax Planning & BEPS',
          'Intellectual Property in Global Markets',
          'International Arbitration & Dispute Resolution',
          'Anti-Corruption & FCPA Compliance',
          'Data Privacy & GDPR Implementation',
          'International Contract Law',
          'Capstone: Global Business Compliance Framework',
        ],
        assessment: {
          type: 'legal_case_analysis',
          duration: 390,
          requiresAegis: true,
        },
        enrollmentFee: 0,
        status: 'live',
        tier: 'advanced',
      },

      // New K-12 Interactive Learning Programs
      'k12-math-foundations': {
        id: 'k12-math-foundations',
        title: 'K-12 Mathematics Foundations',
        description: 'Interactive mathematics learning from kindergarten through high school',
        duration: 'Flexible',
        level: 'K-12',
        modules: [
          'Numbers & Counting (K-2)',
          'Addition & Subtraction (K-2)',
          'Multiplication & Division (3-5)',
          'Fractions & Decimals (3-5)',
          'Pre-Algebra (6-8)',
          'Algebra I & II (6-12)',
          'Geometry (6-12)',
          'Trigonometry (9-12)',
          'Calculus (9-12)',
        ],
        assessment: {
          type: 'adaptive_challenges',
          duration: 'Ongoing',
          requiresAegis: false,
        },
        enrollmentFee: 0,
        status: 'live',
        instructor: 'AI Math Tutor',
        interactiveTools: {
          virtualManipulatives: 'Drag and count colorful blocks, number lines, shape builders',
          gamification: 'Math races, shape hunts, pattern puzzles',
          visualization: 'Animated counting, 3D shapes, story problems',
          adaptiveDifficulty: 'Automatically adjusts to student performance',
        },
      },

      'k12-science-explorer': {
        id: 'k12-science-explorer',
        title: 'K-12 Science Explorer',
        description: 'Interactive science learning with virtual labs and simulations',
        duration: 'Flexible',
        level: 'K-12',
        modules: [
          'Life Science (K-2)',
          'Physical Science (K-2)',
          'Earth Science (K-2)',
          'Matter & Energy (3-5)',
          'Ecosystems (3-5)',
          'Human Body (3-5)',
          'Chemistry Basics (6-8)',
          'Physics Fundamentals (6-8)',
          'Advanced Biology (9-12)',
          'Advanced Chemistry (9-12)',
          'Advanced Physics (9-12)',
        ],
        assessment: {
          type: 'virtual_labs',
          duration: 'Ongoing',
          requiresAegis: false,
        },
        enrollmentFee: 0,
        status: 'live',
        instructor: 'AI Science Tutor',
        interactiveTools: {
          virtualLabs: 'Weather stations, plant growth simulators, animal habitats',
          experiments: 'Color mixing, sound creation, magnet simulation',
          exploration: 'Virtual field trips, seasonal changes, day/night cycle',
          chemistrySimulator: 'Periodic table, bonding visualizer, reaction simulator',
          physicsSandbox: 'Force visualizer, motion simulator, energy converter',
        },
      },

      'k12-code-master': {
        id: 'k12-code-master',
        title: 'K-12 Computer Science Master',
        description: 'Interactive coding education from sequencing to advanced programming',
        duration: 'Flexible',
        level: 'K-12',
        modules: [
          'Sequencing & Patterns (K-2)',
          'Basic Algorithms (K-2)',
          'Loops & Conditionals (3-5)',
          'Variables & Data (3-5)',
          'Text-based Coding (6-8)',
          'Data Structures (6-8)',
          'Web Development (6-8)',
          'Advanced Programming (9-12)',
          'Algorithms & Complexity (9-12)',
          'App Development (9-12)',
        ],
        assessment: {
          type: 'coding_projects',
          duration: 'Ongoing',
          requiresAegis: false,
        },
        enrollmentFee: 0,
        status: 'live',
        instructor: 'AI Coding Tutor',
        interactiveTools: {
          blockCoding: 'Visual programming for pre-readers',
          robotNavigation: 'Move character with arrow commands',
          patternGames: 'Complete coding patterns',
          pythonIDE: 'Live code execution, visual debugger, variable inspector',
          webSandbox: 'HTML/CSS visual editor, JavaScript playground',
          fullIDE: 'Complete development environment with AI assistance',
        },
      },
    };
  }

  initialize() {
    // Set up API routes
    this.setupRoutes();

    // Initialize interactive simulations
    this.interactiveSimulations.initializeMathSimulations();
    this.interactiveSimulations.initializeScienceSimulations();
    this.interactiveSimulations.initializeCodingSimulations();

    console.log('📚 Azora Sapiens initialized with interactive simulations');
  }

  setupRoutes() {
    this.app.use(express.json());

    // Add security headers with proper CSP for development
    this.app.use((req, res, next) => {
      // Allow DevTools connections in development
      if (process.env.NODE_ENV !== 'production') {
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self' http://localhost:*; connect-src 'self' http://localhost:* ws://localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        );
      } else {
        // Production CSP (more restrictive)
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; connect-src 'self' ws: wss:; script-src 'self'; style-src 'self' 'unsafe-inline';",
        );
      }
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      next();
    });

    // WebSocket connection handling for Aegis Mobile Sentry
    this.wss.on('connection', (ws, req) => {
      const clientId = this.extractClientId(req.url);
      if (clientId) {
        this.clients.set(clientId, ws);
        console.log(`📚 Sapiens: Aegis client ${clientId} connected`);

        ws.on('close', () => {
          this.clients.delete(clientId);
          console.log(`📚 Sapiens: Aegis client ${clientId} disconnected`);
        });

        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message.toString());
            this.handleAegisMessage(clientId, data);
          } catch (error) {
            console.error('Invalid Aegis message format:', error);
          }
        });
      }
    });

    // REST API Routes
    this.app.get('/api/programs', (req, res) => {
      res.json({
        programs: Object.values(this.ckqPrograms),
        total: Object.keys(this.ckqPrograms).length,
        status: 'live',
      });
    });

    // New endpoint for K-12 interactive learning programs
    this.app.get('/api/programs/k12', (req, res) => {
      const k12Programs = Object.values(this.ckqPrograms).filter((program) => program.level === 'K-12');
      res.json({
        programs: k12Programs,
        total: k12Programs.length,
        status: 'live',
      });
    });

    // New endpoint for interactive learning tools
    this.app.get('/api/programs/:programId/tools', (req, res) => {
      const program = this.ckqPrograms[req.params.programId];
      if (!program) {
        return res.status(404).json({ error: 'Program not found' });
      }

      res.json({
        programId: program.id,
        title: program.title,
        interactiveTools: program.interactiveTools || {},
        assessment: program.assessment,
      });
    });

    // New endpoint for UI course catalog
    this.app.get('/api/courses', (req, res) => {
      const courses = Object.values(this.ckqPrograms).map((program) => ({
        id: program.id,
        title: program.title,
        description: program.description,
        level: program.level,
        duration: program.duration,
        enrolled: Math.floor(Math.random() * 1000) + 100, // Mock enrollment numbers
        rating: (Math.random() * 0.5 + 4.5).toFixed(1), // 4.5-5.0 rating
        instructor: program.instructor,
        modules: program.modules,
        assessment: program.assessment,
      }));

      res.json({
        courses,
        total: courses.length,
        status: 'live',
      });
    });

    // New endpoint for K-12 course catalog
    this.app.get('/api/courses/k12', (req, res) => {
      const k12Programs = Object.values(this.ckqPrograms).filter((program) => program.level === 'K-12');

      const courses = k12Programs.map((program) => ({
        id: program.id,
        title: program.title,
        description: program.description,
        level: program.level,
        duration: program.duration,
        enrolled: Math.floor(Math.random() * 500) + 50, // Mock enrollment numbers
        rating: (Math.random() * 0.5 + 4.7).toFixed(1), // 4.7-5.2 rating
        instructor: program.instructor,
        modules: program.modules,
        assessment: program.assessment,
        interactiveTools: program.interactiveTools || {},
      }));

      res.json({
        courses,
        total: courses.length,
        status: 'live',
      });
    });

    this.app.get('/api/programs/advanced', (req, res) => {
      const advancedPrograms = Object.values(this.ckqPrograms).filter((program) => program.tier === 'advanced');
      res.json({
        programs: advancedPrograms,
        total: advancedPrograms.length,
        status: 'live',
      });
    });

    this.app.get('/api/programs/business', (req, res) => {
      const businessPrograms = Object.values(this.ckqPrograms).filter(
        (program) =>
          program.tier === 'advanced' &&
          (program.id.includes('mba') ||
            program.id.includes('leadership') ||
            program.id.includes('finance') ||
            program.id.includes('business')),
      );
      res.json({
        programs: businessPrograms,
        total: businessPrograms.length,
        status: 'live',
      });
    });

    this.app.post('/api/enroll', (req, res) => {
      const { userId, programId } = req.body;

      res.json({
        courses,
        total: courses.length,
        status: 'live',
      });
    });

    // Get specific course details
    this.app.get('/api/courses/:courseId', (req, res) => {
      const courseId = req.params.courseId;
      const program = this.ckqPrograms[courseId];

      if (!program) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json({
        course: {
          id: program.id,
          title: program.title,
          description: program.description,
          level: program.level,
          duration: program.duration,
          enrolled: Math.floor(Math.random() * 1000) + 100,
          rating: (Math.random() * 0.5 + 4.5).toFixed(1),
          instructor: program.instructor,
          modules: program.modules,
          assessment: program.assessment,
          status: program.status,
        },
      });
    });

    this.app.post('/api/enroll', (req, res) => {
      const { userId, programId, courseId } = req.body;
      const programIdentifier = programId || courseId;

      if (!userId || !programIdentifier) {
        return res.status(400).json({ error: 'Missing userId or programId/courseId' });
      }

      if (!this.ckqPrograms[programIdentifier]) {
        return res.status(404).json({ error: 'Program not found' });
      }

      const enrollment = {
        id: crypto.randomUUID(),
        userId,
        programId: programIdentifier,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progress: {
          completedModules: [],
          currentModule: this.ckqPrograms[programIdentifier].modules[0],
          overallProgress: 0,
        },
      };

      if (!this.enrollments.has(userId)) {
        this.enrollments.set(userId, []);
      }
      this.enrollments.get(userId).push(enrollment);

      res.json({
        enrollment,
        message: 'Successfully enrolled in CKQ program',
        nextSteps: [
          'Begin theoretical modules',
          'Complete practice assessments',
          'Schedule final Aegis-protected exam',
        ],
      });
    });

    this.app.get('/api/enrollments/:userId', (req, res) => {
      const userId = req.params.userId;
      const userEnrollments = this.enrollments.get(userId) || [];

      // Transform enrollments to match UI expectations
      const transformedEnrollments = userEnrollments.map((enrollment) => ({
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.programId,
        courseTitle: this.ckqPrograms[enrollment.programId]?.title,
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        progress: enrollment.progress,
      }));

      res.json({ enrollments: transformedEnrollments });
    });

    // Get user learning stats
    this.app.get('/api/users/:userId/stats', (req, res) => {
      const userId = req.params.userId;
      const userEnrollments = this.enrollments.get(userId) || [];

      // Calculate stats
      const coursesEnrolled = userEnrollments.length;
      const coursesInProgress = userEnrollments.filter((e) => e.status === 'active').length;
      const coursesCompleted = userEnrollments.filter((e) => e.status === 'completed').length;

      // Mock knowledge points (would be calculated from actual rewards)
      const knowledgePoints = Math.floor(Math.random() * 1000) + 500;

      // Mock streak
      const currentStreak = Math.floor(Math.random() * 15) + 1;

      res.json({
        userId,
        stats: {
          coursesEnrolled,
          coursesInProgress,
          coursesCompleted,
          knowledgePoints,
          currentStreak,
          assessmentsPassed: Math.floor(coursesCompleted * 2.5), // Mock
          successRate: 95, // Mock
        },
      });
    });

    // Get user rewards history
    this.app.get('/api/users/:userId/rewards', (req, res) => {
      const userId = req.params.userId;

      // Mock rewards history
      const rewards = [
        { activity: "Completed 'Economic Theory' assessment", points: 150, date: '2 days ago', type: 'assessment' },
        { activity: '7-day learning streak bonus', points: 100, date: '3 days ago', type: 'streak' },
        { activity: "Enrolled in 'Blockchain Sovereignty'", points: 50, date: '5 days ago', type: 'enrollment' },
        { activity: 'Perfect score bonus', points: 250, date: '1 week ago', type: 'bonus' },
        { activity: 'Weekly progress milestone', points: 75, date: '1 week ago', type: 'milestone' },
      ];

      res.json({ rewards });
    });

    // Get user progress details
    this.app.get('/api/users/:userId/progress', (req, res) => {
      const userId = req.params.userId;

      // Mock progress data
      const progress = [
        { subject: 'Economic Theory', progress: 85, assessments: 12, passed: 11 },
        { subject: 'Blockchain Technology', progress: 72, assessments: 8, passed: 7 },
        { subject: 'AI Ethics', progress: 91, assessments: 15, passed: 15 },
        { subject: 'System Architecture', progress: 68, assessments: 10, passed: 8 },
      ];

      res.json({ progress });
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        service: 'Azora Sapiens',
        status: 'operational',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        features: [
          'Universal education platform',
          'CKQ programs',
          'Aegis Mobile Sentry',
          'Proof-of-Knowledge rewards',
          'AI-powered learning',
        ],
      });
    });

    // Enroll in a course
    this.app.post('/api/enroll', (req, res) => {
      const { userId, courseId } = req.body;

      if (!userId || !courseId) {
        return res.status(400).json({ error: 'userId and courseId are required' });
      }

      if (!this.ckqPrograms[courseId]) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Check if already enrolled
      const userEnrollments = this.enrollments.get(userId) || [];
      const existingEnrollment = userEnrollments.find((e) => e.programId === courseId);

      if (existingEnrollment) {
        return res.status(409).json({ error: 'Already enrolled in this course' });
      }

      // Create enrollment
      const enrollment = {
        id: `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        programId: courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        completedModules: [],
        currentModule: 0,
      };

      userEnrollments.push(enrollment);
      this.enrollments.set(userId, userEnrollments);

      res.json({
        success: true,
        enrollment,
        message: 'Successfully enrolled in course',
      });
    });

    // Aegis Mobile Sentry endpoints
    this.app.post('/api/aegis/start-exam', (req, res) => {
      const { userId, courseId, assessmentId } = req.body;

      if (!userId || !courseId || !assessmentId) {
        return res.status(400).json({ error: 'userId, courseId, and assessmentId are required' });
      }

      // Start Aegis monitoring session
      const sessionId = `aegis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session = {
        id: sessionId,
        userId,
        courseId,
        assessmentId,
        startTime: new Date().toISOString(),
        status: 'active',
        integrityScore: 100,
        alerts: [],
      };

      this.activeExams.set(sessionId, session);

      res.json({
        success: true,
        sessionId,
        message: 'Aegis Mobile Sentry activated for exam integrity monitoring',
      });
    });

    this.app.post('/api/aegis/heartbeat', (req, res) => {
      const { sessionId, deviceData } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      const session = this.activeExams.get(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Exam session not found' });
      }

      // Process device data for integrity monitoring
      // In a real implementation, this would analyze device data for suspicious activity
      const integrityScore = Math.max(0, session.integrityScore - Math.random() * 5);

      session.integrityScore = integrityScore;
      session.lastHeartbeat = new Date().toISOString();

      // Generate alerts if integrity score drops too low
      if (integrityScore < 70 && !session.alerts.some((a) => a.type === 'integrity_warning')) {
        session.alerts.push({
          type: 'integrity_warning',
          message: 'Potential integrity compromise detected',
          timestamp: new Date().toISOString(),
          severity: 'medium',
        });
      }

      res.json({
        success: true,
        integrityScore: Math.round(integrityScore),
        status: session.status,
        alerts: session.alerts,
      });
    });

    this.app.post('/api/aegis/end-exam', (req, res) => {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      const session = this.activeExams.get(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Exam session not found' });
      }

      session.status = 'completed';
      session.endTime = new Date().toISOString();

      // Final integrity assessment
      const finalScore = session.integrityScore;
      const passed = finalScore >= 80; // 80% integrity threshold

      this.activeExams.delete(sessionId);

      res.json({
        success: true,
        finalIntegrityScore: Math.round(finalScore),
        passed,
        alerts: session.alerts,
        message: passed ? 'Exam completed with integrity verified' : 'Exam flagged for integrity review',
      });
    });

    // Get certifications
    this.app.get('/api/users/:userId/certifications', (req, res) => {
      const userId = req.params.userId;

      // Mock certifications based on completed courses
      const certifications = [
        {
          id: 'cert_001',
          title: 'Planetary Economic Intelligence',
          issuedAt: '2024-01-15T10:00:00Z',
          issuer: 'Azora Sapiens University',
          credentialId: 'AZORA-CERT-2024-001',
          blockchainVerified: true,
          proofOfKnowledge: {
            points: 1500,
            level: 'Advanced',
            specializations: ['Economic Theory', 'Planetary Systems'],
          },
        },
        {
          id: 'cert_002',
          title: 'Aegis Integrity Systems',
          issuedAt: '2024-01-20T14:30:00Z',
          issuer: 'Azora Sapiens University',
          credentialId: 'AZORA-CERT-2024-002',
          blockchainVerified: true,
          proofOfKnowledge: {
            points: 1200,
            level: 'Intermediate',
            specializations: ['Security Systems', 'Integrity Monitoring'],
          },
        },
      ];

      res.json({ certifications });
    });

    // Mint Proof-of-Knowledge reward
    this.app.post('/api/rewards/mint', (req, res) => {
      const { userId, achievementType, achievementData } = req.body;

      if (!userId || !achievementType) {
        return res.status(400).json({ error: 'userId and achievementType are required' });
      }

      // Calculate reward points based on achievement type
      let points = 0;
      let description = '';

      switch (achievementType) {
        case 'course_completion':
          points = 500;
          description = `Completed course: ${achievementData.courseTitle}`;
          break;
        case 'assessment_passed':
          points = 150;
          description = `Passed assessment: ${achievementData.assessmentTitle}`;
          break;
        case 'perfect_score':
          points = 250;
          description = `Perfect score on: ${achievementData.assessmentTitle}`;
          break;
        case 'learning_streak':
          points = achievementData.days * 10;
          description = `${achievementData.days}-day learning streak`;
          break;
        default:
          points = 50;
          description = 'General achievement';
      }

      // In a real implementation, this would interact with Azora Mint service
      // For now, we'll simulate the reward minting
      const reward = {
        id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'proof_of_knowledge',
        points,
        description,
        mintedAt: new Date().toISOString(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock hash
        blockchainVerified: true,
      };

      res.json({
        success: true,
        reward,
        message: `Successfully minted ${points} Proof-of-Knowledge points`,
      });
    });

    // Get reward balance
    this.app.get('/api/users/:userId/rewards/balance', (req, res) => {
      const userId = req.params.userId;

      // Mock balance - in real implementation, this would query Azora Mint
      const balance = {
        totalPoints: 2450,
        availablePoints: 2200,
        lockedPoints: 250,
        level: 'Advanced Scholar',
        nextLevelThreshold: 3000,
        recentTransactions: [
          { type: 'earned', points: 500, description: 'Course completion', date: '2 days ago' },
          { type: 'spent', points: 100, description: 'Premium content access', date: '1 week ago' },
          { type: 'earned', points: 150, description: 'Assessment passed', date: '1 week ago' },
        ],
      };

      res.json({ balance });
    });

    // Get Ascension Protocol status
    this.app.get('/api/users/:userId/ascension', (req, res) => {
      const userId = req.params.userId;

      const ascensionStatus = {
        currentLevel: 'Scholar',
        progressToNext: 68, // 68% towards next level
        totalKnowledgePoints: 2450,
        nextLevelThreshold: 3000,
        specializations: [
          { name: 'Economic Theory', level: 'Advanced', progress: 85 },
          { name: 'AI Ethics', level: 'Intermediate', progress: 72 },
          { name: 'Blockchain Sovereignty', level: 'Beginner', progress: 45 },
        ],
        achievements: [
          'First Course Completed',
          'Perfect Assessment Score',
          '7-Day Learning Streak',
          'Economic Theory Mastery',
        ],
        nextMilestone: 'Advanced Scholar (3000 points)',
      };

      res.json({ ascensionStatus });
    });

    this.app.post('/api/exam/start', (req, res) => {
      const { userId, programId } = req.body;

      if (!userId || !programId) {
        return res.status(400).json({ error: 'Missing userId or programId' });
      }

      // Generate unique exam session
      const examSession = {
        id: crypto.randomUUID(),
        userId,
        programId,
        startTime: new Date().toISOString(),
        status: 'initializing',
        qrCode: this.generateExamQR(userId, programId),
        aegisStatus: 'pending',
      };

      this.activeExams.set(examSession.id, examSession);

      res.json({
        examSession,
        instructions: [
          'Ensure you have the Aegis Sentry app installed on your smartphone',
          'Place your phone on a stable surface facing you and your workspace',
          'Scan the QR code with the Aegis app to begin monitoring',
          'Do not leave your seat or use unauthorized materials',
        ],
      });
    });

    this.app.post('/api/exam/aegis-auth', (req, res) => {
      const { examId, deviceFingerprint } = req.body;

      const exam = this.activeExams.get(examId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam session not found' });
      }

      // Simulate Aegis authentication
      exam.aegisStatus = 'authenticated';
      exam.deviceFingerprint = deviceFingerprint;
      exam.authTime = new Date().toISOString();

      // Notify connected Aegis client
      const aegisClient = this.clients.get(exam.userId);
      if (aegisClient) {
        aegisClient.send(
          JSON.stringify({
            type: 'exam_start',
            examId,
            action: 'lock_device',
            requirements: {
              camera: true,
              microphone: true,
              lockdown: true,
            },
          }),
        );
      }

      res.json({
        status: 'authenticated',
        examId,
        message: 'Aegis Mobile Sentry activated. Exam monitoring begins now.',
      });
    });

    this.app.post('/api/module/complete', (req, res) => {
      const { userId, programId, moduleName, assessmentScore } = req.body;

      if (!userId || !programId || !moduleName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Trigger Proof-of-Knowledge reward
      this.rewardModuleCompletion(userId, programId, moduleName, assessmentScore)
        .then((rewardResult) => {
          res.json({
            success: true,
            module: moduleName,
            reward: rewardResult?.mainReward,
            milestoneRewards: rewardResult?.milestoneRewards,
            progress: rewardResult?.progress,
            message: 'Module completed successfully!',
          });
        })
        .catch((error) => {
          console.error('Error processing module completion:', error);
          res.status(500).json({ error: 'Failed to process module completion' });
        });
    });

    this.app.post('/api/exam/submit', (req, res) => {
      const { examId, answers } = req.body;

      const exam = this.activeExams.get(examId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam session not found' });
      }

      // Simulate grading (in production, this would be more sophisticated)
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      const passed = score >= 70;

      exam.status = 'completed';
      exam.submissionTime = new Date().toISOString();
      exam.score = score;
      exam.passed = passed;

      // Trigger Proof-of-Knowledge reward for assessment pass
      if (passed) {
        this.rewardAssessmentPass(exam.userId, exam.programId, this.ckqPrograms[exam.programId].assessment.type, score);
        // Also trigger certificate achievement reward
        this.rewardCertificateAchievement(exam.userId, exam.programId, 'ckq_basic');
      }

      // Release Aegis lockdown
      const aegisClient = this.clients.get(exam.userId);
      if (aegisClient) {
        aegisClient.send(
          JSON.stringify({
            type: 'exam_complete',
            examId,
            result: passed ? 'passed' : 'failed',
            score,
            action: 'unlock_device',
          }),
        );
      }

      res.json({
        examId,
        score,
        passed,
        certificate: passed ? this.generateCertificate(exam) : null,
        message: passed
          ? 'Congratulations! You have earned your CKQ certification.'
          : 'Exam not passed. You may retake the assessment after additional study.',
      });
    });

    // Academic Knowledge Graph endpoints (for Ascension Protocol)
    this.app.get('/api/knowledge-graph/status', (req, res) => {
      res.json({
        ingestionProgress: {
          universities: ['MIT', 'Stanford', 'Oxford', 'Harvard', 'Cambridge'],
          faculties: ['Engineering', 'Medicine', 'Law', 'Economics', 'Computer Science'],
          completion: 23, // percentage
          documentsProcessed: 15420,
          knowledgeNodes: 89234,
        },
        deconstructionProgress: {
          economics: 7,
          engineering: 12,
          medicine: 5,
          law: 3,
        },
        synthesisProgress: {
          ckqAdvancedLaw: 45,
          ckqAdvancedEngineering: 23,
          ckqAdvancedMedicine: 18,
        },
      });
    });

    this.app.get('/api/knowledge-graph/search', (req, res) => {
      const { query, faculty } = req.query;
      // Simulate knowledge graph search
      res.json({
        query,
        faculty,
        results: [
          {
            id: 'kg_001',
            title: 'First Principles Analysis of Economic Theory',
            source: 'MIT Economics Department',
            relevance: 0.95,
            insights: [
              'Phillips Curve model contains logical inconsistencies',
              'Modern monetary theory requires revision',
              'Austrian economics provides superior framework',
            ],
          },
        ],
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      const allPrograms = Object.values(this.ckqPrograms);
      const advancedPrograms = allPrograms.filter((p) => p.tier === 'advanced');
      const vocationalPrograms = allPrograms.filter((p) => !p.tier || p.tier !== 'advanced');

      res.json({
        service: 'Azora Sapiens',
        status: 'operational',
        features: {
          totalPrograms: allPrograms.length,
          advancedPrograms: advancedPrograms.length,
          vocationalPrograms: vocationalPrograms.length,
          activeExams: this.activeExams.size,
          enrolledStudents: this.enrollments.size,
          aegisClients: this.clients.size,
        },
        proofOfKnowledge: {
          protocol: 'active',
          mintService: this.mintServiceUrl,
          rewardsEnabled: true,
        },
        ascensionProtocol: {
          knowledgeIngestion: 'active',
          firstPrinciplesDeconstruction: 'active',
          curriculumSynthesis: 'active',
        },
        programCategories: {
          businessLeadership: advancedPrograms.filter((p) => p.id.includes('mba') || p.id.includes('leadership'))
            .length,
          financeEconomics: advancedPrograms.filter((p) => p.id.includes('finance') || p.id.includes('economics'))
            .length,
          technologyInnovation: advancedPrograms.filter(
            (p) => p.id.includes('ai') || p.id.includes('blockchain') || p.id.includes('cyber'),
          ).length,
          specializedProfessional: advancedPrograms.filter(
            (p) =>
              p.id.includes('venture') ||
              p.id.includes('marketing') ||
              p.id.includes('healthcare') ||
              p.id.includes('law'),
          ).length,
        },
      });
    });

    // New endpoint for personalized learning paths
    this.app.post('/api/students/:studentId/profile', (req, res) => {
      try {
        const profile = this.aiPersonalizedLearning.updateStudentProfile(req.params.studentId, req.body);
        res.json({ profile, status: 'updated' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/students/:studentId/profile', (req, res) => {
      try {
        const profile = this.aiPersonalizedLearning.studentProfiles.get(req.params.studentId);
        if (!profile) {
          return res.status(404).json({ error: 'Student profile not found' });
        }
        res.json({ profile });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/students/:studentId/programs/:programId/path', (req, res) => {
      try {
        const program = this.ckqPrograms[req.params.programId];
        if (!program) {
          return res.status(404).json({ error: 'Program not found' });
        }

        const learningPath = this.aiPersonalizedLearning.generateLearningPath(
          req.params.studentId,
          req.params.programId,
          program.modules.map((module, index) => ({
            id: `module-${index}`,
            topic: module,
            estimatedTime: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
          })),
        );

        res.json({ learningPath });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/students/:studentId/progress', (req, res) => {
      try {
        this.aiPersonalizedLearning.updateProgress(req.params.studentId, req.body.moduleId, req.body.progress);
        res.json({ status: 'updated' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/students/:studentId/insights', (req, res) => {
      try {
        const insights = this.aiPersonalizedLearning.getLearningInsights(req.params.studentId);
        res.json({ insights });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // New endpoint for interactive math simulations
    this.app.get('/api/simulations/math/:topic', (req, res) => {
      const topics = {
        counting: {
          title: 'Virtual Counting Garden',
          description: 'Count colorful objects in an interactive garden',
          tools: ['virtualManipulatives', 'gamification', 'visualization'],
          difficulty: 'K-2',
        },
        fractions: {
          title: 'Fraction Visualizer',
          description: 'Cut pizzas and cakes into fractions',
          tools: ['virtualManipulatives', 'visualization'],
          difficulty: '3-5',
        },
        algebra: {
          title: 'Algebra Visual Solver',
          description: 'Solve equations with visual representations',
          tools: ['virtualManipulatives', 'visualization'],
          difficulty: '6-12',
        },
        calculus: {
          title: 'Calculus Visualizer',
          description: 'See derivatives and integrals animated',
          tools: ['visualization'],
          difficulty: '9-12',
        },
      };

      const topic = topics[req.params.topic];
      if (!topic) {
        return res.status(404).json({ error: 'Simulation not found' });
      }

      res.json({
        topic: req.params.topic,
        ...topic,
        simulationId: `math-${req.params.topic}-${Date.now()}`,
        status: 'ready',
      });
    });

    // New endpoint for interactive science simulations
    this.app.get('/api/simulations/science/:topic', (req, res) => {
      const topics = {
        weather: {
          title: 'Weather Station Simulator',
          description: 'Observe daily weather patterns',
          tools: ['virtualLabs', 'exploration'],
          difficulty: 'K-2',
        },
        ecosystem: {
          title: 'Ecosystem Builder',
          description: 'Create balanced ecosystems',
          tools: ['virtualLabs', 'experiments'],
          difficulty: '3-5',
        },
        chemistry: {
          title: 'Chemistry Lab Simulator',
          description: 'Mix chemicals safely in a virtual lab',
          tools: ['virtualLabs', 'chemistrySimulator'],
          difficulty: '6-12',
        },
        physics: {
          title: 'Physics Sandbox',
          description: 'Explore forces and motion',
          tools: ['physicsSandbox', 'experiments'],
          difficulty: '6-12',
        },
      };

      const topic = topics[req.params.topic];
      if (!topic) {
        return res.status(404).json({ error: 'Simulation not found' });
      }

      res.json({
        topic: req.params.topic,
        ...topic,
        simulationId: `science-${req.params.topic}-${Date.now()}`,
        status: 'ready',
      });
    });

    // New endpoint for interactive coding environments
    this.app.get('/api/simulations/coding/:language', (req, res) => {
      const languages = {
        blockly: {
          title: 'Visual Block Coding',
          description: 'Drag and drop coding blocks for pre-readers',
          tools: ['blockCoding', 'robotNavigation'],
          difficulty: 'K-5',
        },
        python: {
          title: 'Python Learning Environment',
          description: 'Live code execution with visual debugging',
          tools: ['pythonIDE', 'variableInspector'],
          difficulty: '6-12',
        },
        web: {
          title: 'Web Development Sandbox',
          description: 'HTML/CSS/JS playground with real-time preview',
          tools: ['webSandbox', 'fullIDE'],
          difficulty: '6-12',
        },
      };

      const language = languages[req.params.language];
      if (!language) {
        return res.status(404).json({ error: 'Coding environment not found' });
      }

      res.json({
        language: req.params.language,
        ...language,
        environmentId: `coding-${req.params.language}-${Date.now()}`,
        status: 'ready',
      });
    });

    // Add new endpoints for interactive simulations
    this.app.get('/api/simulations', (req, res) => {
      try {
        const simulations = this.interactiveSimulations.getAllSimulations();
        res.json({ simulations });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/simulations/type/:type', (req, res) => {
      try {
        const simulations = this.interactiveSimulations.getSimulationsByType(req.params.type);
        res.json({ simulations });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/simulations/:simulationId/session', (req, res) => {
      try {
        const session = this.interactiveSimulations.startSimulationSession(req.params.simulationId, req.body.userId);
        res.json({ session });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/simulations/session/:sessionId/action', (req, res) => {
      try {
        const session = this.interactiveSimulations.executeAction(
          req.params.sessionId,
          req.body.action,
          req.body.payload,
        );
        res.json({ session });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/simulations/session/:sessionId', (req, res) => {
      try {
        const session = this.interactiveSimulations.getSessionState(req.params.sessionId);
        res.json({ session });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.delete('/api/simulations/session/:sessionId', (req, res) => {
      try {
        const session = this.interactiveSimulations.endSimulationSession(req.params.sessionId);
        res.json({ session, status: 'ended' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  extractClientId(url) {
    const urlObj = new URL(url, 'http://localhost');
    return urlObj.searchParams.get('userId');
  }

  initialize() {
    // Set up API routes
    this.setupRoutes();

    // Initialize interactive simulations
    this.interactiveSimulations.initializeMathSimulations();
    this.interactiveSimulations.initializeScienceSimulations();
    this.interactiveSimulations.initializeCodingSimulations();
    this.interactiveSimulations.initializeLanguageSimulations();
    this.interactiveSimulations.initializeLifeSkillsSimulations();
    this.interactiveSimulations.initializeArtSimulations();

    console.log('📚 Azora Sapiens initialized with interactive simulations');
  }

  setupRoutes() {
    // Existing routes...

    // New endpoint for personalized learning paths with fun elements
    this.app.post('/api/students/:studentId/programs/:programId/path', (req, res) => {
      try {
        const program = this.ckqPrograms[req.params.programId];
        if (!program) {
          return res.status(404).json({ error: 'Program not found' });
        }

        const learningPath = this.aiPersonalizedLearning.generateLearningPath(
          req.params.studentId,
          req.params.programId,
          program.modules.map((module, index) => ({
            id: `module-${index}`,
            topic: module,
            estimatedTime: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
          })),
        );

        res.json({ learningPath });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // New endpoint for recommending easier learning methods
    this.app.get('/api/students/:studentId/easy-methods', (req, res) => {
      try {
        const recommendations = this.aiPersonalizedLearning.recommendEasyLearningMethods(req.params.studentId);
        res.json({ recommendations });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // New endpoint for skill progression tracking
    this.app.get('/api/students/:studentId/skills', (req, res) => {
      try {
        const profile = this.aiPersonalizedLearning.studentProfiles.get(req.params.studentId);
        if (!profile) {
          return res.status(404).json({ error: 'Student profile not found' });
        }

        const skillProgression = this.aiPersonalizedLearning.createSkillProgression(profile);
        res.json({ skillProgression });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // New endpoint for gamification elements
    this.app.get('/api/students/:studentId/gamification', (req, res) => {
      try {
        const profile = this.aiPersonalizedLearning.studentProfiles.get(req.params.studentId);
        if (!profile) {
          return res.status(404).json({ error: 'Student profile not found' });
        }

        const gamification = {
          funPoints: profile.funPoints,
          streak: profile.streak,
          achievements: profile.achievements,
          rewards: this.calculateRewards(profile),
        };

        res.json({ gamification });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // New endpoint for micro-learning chunks
    this.app.get('/api/modules/:moduleId/micro-chunks', (req, res) => {
      try {
        // This would typically fetch the module and break it into chunks
        // For now, we'll generate sample chunks
        const chunks = Array.from({ length: 5 }, (_, i) => ({
          id: `chunk-${i + 1}`,
          title: `Learning Chunk ${i + 1}`,
          duration: 5, // minutes
          objectives: [`Understand key concept ${i + 1}`, `Practice with examples`, `Self-assess progress`],
        }));

        res.json({ chunks });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // New endpoint for language simulations
    this.app.get('/api/simulations/language/:topic', (req, res) => {
      const topics = {
        story: {
          title: 'Interactive Story Builder',
          description: 'Create stories with visual elements and characters',
          tools: ['storyElements', 'characterCreator', 'narrativeBuilder'],
          difficulty: 'K-5',
        },
        vocabulary: {
          title: 'Word Adventure Game',
          description: 'Learn vocabulary through exciting adventures',
          tools: ['wordBank', 'adventureMap', 'challengeSystem'],
          difficulty: '2-8',
        },
      };

      const topic = topics[req.params.topic];
      if (!topic) {
        return res.status(404).json({ error: 'Simulation not found' });
      }

      res.json({
        topic: req.params.topic,
        ...topic,
        simulationId: `language-${req.params.topic}-${Date.now()}`,
        status: 'ready',
      });
    });

    // New endpoint for life skills simulations
    this.app.get('/api/simulations/life-skills/:topic', (req, res) => {
      const topics = {
        budgeting: {
          title: 'Budget Buddy Simulator',
          description: 'Learn financial literacy through interactive budgeting',
          tools: ['budgetCalculator', 'expenseTracker', 'goalSetter'],
          difficulty: '5-12',
        },
        time: {
          title: 'Time Management Master',
          description: 'Master time management skills through interactive planning',
          tools: ['scheduler', 'priorityMatrix', 'progressTracker'],
          difficulty: '3-12',
        },
      };

      const topic = topics[req.params.topic];
      if (!topic) {
        return res.status(404).json({ error: 'Simulation not found' });
      }

      res.json({
        topic: req.params.topic,
        ...topic,
        simulationId: `life-skills-${req.params.topic}-${Date.now()}`,
        status: 'ready',
      });
    });

    // New endpoint for art simulations
    this.app.get('/api/simulations/art/:topic', (req, res) => {
      const topics = {
        drawing: {
          title: 'Digital Art Canvas',
          description: 'Create digital art with various tools and effects',
          tools: ['brushTools', 'colorPalette', 'layerSystem'],
          difficulty: 'K-12',
        },
        music: {
          title: 'Music Creation Studio',
          description: 'Create music with virtual instruments and effects',
          tools: ['instruments', 'effects', 'sequencer'],
          difficulty: '3-12',
        },
      };

      const topic = topics[req.params.topic];
      if (!topic) {
        return res.status(404).json({ error: 'Simulation not found' });
      }

      res.json({
        topic: req.params.topic,
        ...topic,
        simulationId: `art-${req.params.topic}-${Date.now()}`,
        status: 'ready',
      });
    });

    // Add new endpoints for additional interactive simulations
    this.app.get('/api/simulations/type/language', (req, res) => {
      try {
        const simulations = this.interactiveSimulations.getSimulationsByType('language');
        res.json({ simulations });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/simulations/type/life-skills', (req, res) => {
      try {
        const simulations = this.interactiveSimulations.getSimulationsByType('life-skills');
        res.json({ simulations });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/simulations/type/art', (req, res) => {
      try {
        const simulations = this.interactiveSimulations.getSimulationsByType('art');
        res.json({ simulations });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  calculateRewards(profile) {
    const rewards = [];

    // Streak rewards
    if (profile.streak >= 7) {
      rewards.push({
        id: 'week-streak',
        title: 'Week Warrior',
        description: '7-day learning streak achieved!',
        points: 100,
      });
    }

    if (profile.streak >= 30) {
      rewards.push({
        id: 'month-streak',
        title: 'Month Master',
        description: '30-day learning streak achieved!',
        points: 500,
      });
    }

    // Achievement rewards
    if (profile.achievements.length >= 5) {
      rewards.push({
        id: 'achievement-hunter',
        title: 'Achievement Hunter',
        description: 'Earned 5 achievements',
        points: 200,
      });
    }

    // Skill mastery rewards
    if (profile.masteredSkills.length >= 10) {
      rewards.push({
        id: 'skill-master',
        title: 'Skill Master',
        description: 'Mastered 10 skills',
        points: 300,
      });
    }

    return rewards;
  }

  handleAegisMessage(clientId, data) {
    console.log(`📱 Aegis: Message from ${clientId}:`, data.type);

    switch (data.type) {
      case 'device_locked':
        // Device successfully locked for exam
        const exam = Array.from(this.activeExams.values()).find(
          (e) => e.userId === clientId && e.aegisStatus === 'authenticated',
        );
        if (exam) {
          exam.status = 'active';
          console.log(`📚 Exam ${exam.id} now active with Aegis protection`);
        }
        break;

      case 'anomaly_detected':
        // Handle security violations
        this.handleSecurityViolation(clientId, data.anomaly);
        break;

      case 'exam_complete':
        // Exam finished on mobile side
        console.log(`📱 Aegis: Exam completed for ${clientId}`);
        break;
    }
  }

  handleSecurityViolation(clientId, anomaly) {
    console.warn(`🚨 Security violation detected for ${clientId}:`, anomaly);

    // Find active exam and terminate it
    const exam = Array.from(this.activeExams.values()).find((e) => e.userId === clientId && e.status === 'active');

    if (exam) {
      exam.status = 'terminated';
      exam.violation = anomaly;

      // Notify computer client
      // In production, this would send WebSocket message to exam interface
      console.log(`❌ Exam ${exam.id} terminated due to security violation`);
    }
  }

  generateExamQR(userId, programId) {
    const payload = {
      userId,
      programId,
      timestamp: Date.now(),
      sessionId: crypto.randomUUID(),
    };

    // In production, this would be encrypted
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  generateCertificate(exam) {
    return {
      id: crypto.randomUUID(),
      type: 'CKQ',
      program: this.ckqPrograms[exam.programId].title,
      recipient: exam.userId,
      issueDate: new Date().toISOString(),
      expiryDate: null, // CKQ never expires
      verificationUrl: `https://azora.es/verify/${crypto.randomUUID()}`,
      blockchainHash: crypto.createHash('sha256').update(JSON.stringify(exam)).digest('hex'),
    };
  }

  // Proof-of-Knowledge Protocol: Reward Methods
  async triggerKnowledgeReward(userId, rewardType, rewardCategory, achievement, programId = null, moduleName = null) {
    try {
      console.log(`🎓 Proof-of-Knowledge: Triggering reward for ${userId} - ${achievement}`);

      const rewardResponse = await axios.post(`${this.mintServiceUrl}/api/knowledge-reward`, {
        userId,
        rewardType,
        rewardCategory,
        achievement,
        programId,
        moduleName,
      });

      if (rewardResponse.data.success) {
        console.log(`💰 Reward paid: ${rewardResponse.data.reward.amount} aZAR to ${userId}`);

        // Notify the user via WebSocket if connected
        const userClient = this.clients.get(userId);
        if (userClient) {
          userClient.send(
            JSON.stringify({
              type: 'knowledge_reward',
              reward: rewardResponse.data.reward,
              message: rewardResponse.data.message,
              nextMilestones: rewardResponse.data.nextMilestones,
            }),
          );
        }

        return rewardResponse.data;
      } else {
        console.error(`❌ Reward failed for ${userId}:`, rewardResponse.data.error);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error triggering knowledge reward for ${userId}:`, error.message);
      return null;
    }
  }

  async rewardModuleCompletion(userId, programId, moduleName, assessmentScore = null) {
    const enrollment = this.getUserEnrollment(userId, programId);
    if (!enrollment) {return null;}

    // Determine reward category based on module difficulty/assessment
    let rewardCategory = 'basic';
    if (assessmentScore && assessmentScore >= 80) {
      rewardCategory = 'advanced';
    } else if (assessmentScore && assessmentScore >= 70) {
      rewardCategory = 'intermediate';
    }

    const achievement = `Completed module: ${moduleName}${assessmentScore ? ` (${assessmentScore}%)` : ''}`;

    // Update enrollment progress
    enrollment.progress.completedModules.push(moduleName);
    enrollment.progress.overallProgress =
      (enrollment.progress.completedModules.length / this.ckqPrograms[programId].modules.length) * 100;

    // Check for milestone bonuses
    const milestoneRewards = [];

    if (enrollment.progress.completedModules.length === 1) {
      // First module bonus
      milestoneRewards.push(
        this.triggerKnowledgeReward(
          userId,
          'milestone_bonus',
          'first_module',
          'First module completed!',
          programId,
          moduleName,
        ),
      );
    }

    if (enrollment.progress.overallProgress >= 50 && !enrollment.progress.halfwayBonusClaimed) {
      // Halfway point bonus
      milestoneRewards.push(
        this.triggerKnowledgeReward(
          userId,
          'milestone_bonus',
          'halfway_point',
          'Halfway through CKQ program!',
          programId,
        ),
      );
      enrollment.progress.halfwayBonusClaimed = true;
    }

    // Main module completion reward
    const mainReward = await this.triggerKnowledgeReward(
      userId,
      'module_completion',
      rewardCategory,
      achievement,
      programId,
      moduleName,
    );

    // Wait for milestone rewards
    await Promise.all(milestoneRewards);

    return {
      mainReward,
      milestoneRewards: await Promise.all(milestoneRewards),
      progress: enrollment.progress,
    };
  }

  async rewardAssessmentPass(userId, programId, assessmentType, score) {
    const achievement = `Passed ${assessmentType} assessment with ${score}%`;

    let rewardCategory;
    switch (assessmentType) {
      case 'practical_exam':
        rewardCategory = 'practical_exam';
        break;
      case 'code_audit_exam':
        rewardCategory = 'code_audit';
        break;
      case 'capstone_project':
        rewardCategory = 'capstone_project';
        break;
      default:
        rewardCategory = 'practical_exam';
    }

    return await this.triggerKnowledgeReward(userId, 'assessment_pass', rewardCategory, achievement, programId);
  }

  async rewardCertificateAchievement(userId, programId, certificateType = 'ckq_basic') {
    const program = this.ckqPrograms[programId];
    const achievement = `Earned ${program.title} certification`;

    return await this.triggerKnowledgeReward(
      userId,
      'certificate_achievement',
      certificateType,
      achievement,
      programId,
    );
  }

  getUserEnrollment(userId, programId) {
    const userEnrollments = this.enrollments.get(userId) || [];
    return userEnrollments.find((e) => e.programId === programId);
  }

  start(port = 4200) {
    this.server.listen(port, () => {
      console.log(`📚 Azora Sapiens Education Platform running on port ${port}`);
      console.log(`   🌐 WebSocket: ws://localhost:${port}`);
      console.log(`   📖 Programs: http://localhost:${port}/api/programs`);
      console.log(`   🎓 Enrollment: http://localhost:${port}/api/enroll`);
      console.log(`   🛡️  Aegis: Mobile sentry protocol active`);
      console.log(`   📊 Health: http://localhost:${port}/health`);
    });
  }

  stop() {
    this.wss.close();
    this.server.close();
  }
}

// Create and export singleton instance
const azoraSapiens = new AzoraSapiens();

// Initialize the service
azoraSapiens.initialize();

// Start the service
azoraSapiens.start();

module.exports = azoraSapiens;
