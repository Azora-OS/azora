const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;
const prisma = new PrismaClient();

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  }
});

// Middleware to get user ID from header (simple auth for now)
const getUserId = (req) => {
  return req.headers['x-user-id'] || 'user_123456789';
};

// Ubuntu Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Ubuntu rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(ubuntuLimiter);

// Escrow storage (in production, use database)
const escrowAccounts = new Map();
const paymentTransactions = new Map();

// ========== HEALTH CHECK ==========
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      service: 'azora-marketplace',
      status: 'healthy',
      ubuntu: 'I serve because we prosper together',
      timestamp: new Date().toISOString(),
      port: PORT,
      database: 'connected',
      features: {
        jobListings: '✅ Active',
        applications: '✅ Active',
        escrow: '✅ Active',
        notifications: '✅ Active'
      }
    });
  } catch (error) {
    res.status(503).json({
      service: 'azora-marketplace',
      status: 'unhealthy',
      ubuntu: 'I serve because we prosper together',
      timestamp: new Date().toISOString(),
      port: PORT,
      database: 'disconnected',
      error: error.message
    });
  }
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: 'azora-marketplace',
    ubuntu: 'Ubuntu marketplace excellence'
  });
});

// ========== ENHANCED JOB ENDPOINTS ==========

// GET /api/jobs - List all jobs with advanced filtering
app.get('/api/jobs', async (req, res) => {
  try {
    const {
      search,
      status,
      remote,
      type,
      experience,
      salary_min,
      salary_max,
      page = 1,
      limit = 20
    } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (remote !== undefined) {
      where.remote = remote === 'true';
    }

    if (type) {
      where.type = type;
    }

    if (experience) {
      where.experience = experience;
    }

    if (salary_min || salary_max) {
      where.salary = {};
      if (salary_min) where.salary.gte = parseInt(salary_min);
      if (salary_max) where.salary.lte = parseInt(salary_max);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          skills: {
            include: {
              skill: true
            }
          },
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      ubuntu: 'Ubuntu opportunity marketplace'
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      error: 'Failed to fetch jobs',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// GET /api/job-metrics - Aggregate job and application statistics
app.get('/api/job-metrics', async (req, res) => {
  try {
    const [totalJobs, activeJobs, totalApplications, acceptedApplications, activeCompanies] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({
        where: {
          OR: [
            { status: 'ACTIVE' },
            { status: 'active' }
          ]
        }
      }),
      prisma.jobApplication.count(),
      prisma.jobApplication.count({ where: { status: 'ACCEPTED' } }),
      prisma.job.findMany({
        where: {
          OR: [
            { status: 'ACTIVE' },
            { status: 'active' }
          ]
        },
        select: { company: true },
        distinct: ['company']
      })
    ]);

    const companiesHiring = activeCompanies.length;
    const acceptanceRate = totalApplications > 0
      ? acceptedApplications / totalApplications
      : 0;

    res.json({
      jobs: {
        total: totalJobs,
        active: activeJobs,
        companiesHiring
      },
      applications: {
        total: totalApplications,
        acceptanceRate
      },
      ubuntu: 'Real Jobspaces metrics from azora-marketplace'
    });
  } catch (error) {
    console.error('Error fetching job metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch job metrics',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// POST /api/jobs - Create new job listing
app.post('/api/jobs', async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      title,
      description,
      company,
      location,
      remote,
      type,
      experience,
      salary,
      requirements,
      benefits,
      skills: skillNames
    } = req.body;

    // Validate required fields
    if (!title || !description || !company) {
      return res.status(400).json({
        error: 'Title, description, and company are required',
        ubuntu: 'Complete information enables proper job creation'
      });
    }

    // Create job with skills
    const job = await prisma.job.create({
      data: {
        title,
        description,
        company,
        location,
        remote: remote || false,
        type: type || 'full-time',
        experience: experience || 'mid',
        salary: salary ? parseInt(salary) : null,
        requirements: requirements || [],
        benefits: benefits || [],
        postedBy: userId,
        status: 'active'
      },
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    // Add skills if provided
    if (skillNames && skillNames.length > 0) {
      for (const skillName of skillNames) {
        const skill = await prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName }
        });

        await prisma.jobSkill.create({
          data: {
            jobId: job.id,
            skillId: skill.id
          }
        });
      }
    }

    // Log to blockchain
    await logMarketplaceEvent('JOB_POSTED', {
      jobId: job.id,
      title: job.title,
      company: job.company,
      postedBy: userId
    });

    console.log(`💼 Job posted: ${job.id} - ${job.title} at ${job.company}`);

    res.status(201).json({
      success: true,
      job,
      ubuntu: 'Job opportunity created with Ubuntu care'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      error: 'Failed to create job',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// GET /api/jobs/:id - Get single job with enhanced details
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true
          }
        },
        applications: {
          where: { applicantId: userId },
          select: {
            id: true,
            status: true,
            appliedAt: true
          }
        },
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        ubuntu: 'Ubuntu guidance: Check job ID and try again'
      });
    }

    res.json({
      job,
      userApplication: job.applications[0] || null,
      ubuntu: 'Job opportunity shared with Ubuntu transparency'
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      error: 'Failed to fetch job',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// PUT /api/jobs/:id - Update job listing
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const updates = req.body;

    // Check if user owns the job
    const existingJob = await prisma.job.findUnique({
      where: { id }
    });

    if (!existingJob) {
      return res.status(404).json({
        error: 'Job not found',
        ubuntu: 'Ubuntu guidance: Check job ID and try again'
      });
    }

    if (existingJob.postedBy !== userId) {
      return res.status(403).json({
        error: 'Only job poster can update this job',
        ubuntu: 'Ubuntu respect: Honor ownership and permissions'
      });
    }

    const job = await prisma.job.update({
      where: { id },
      data: updates,
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    console.log(`📝 Job updated: ${job.id} by user ${userId}`);

    res.json({
      success: true,
      job,
      ubuntu: 'Job updated with Ubuntu responsibility'
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      error: 'Failed to update job',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// ========== ENHANCED APPLICATION ENDPOINTS ==========

// POST /api/jobs/:id/apply - Apply for job with escrow
app.post('/api/jobs/:id/apply', upload.single('resume'), async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const {
      coverLetter,
      expectedSalary,
      availability,
      portfolioLinks = []
    } = req.body;

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        ubuntu: 'Ubuntu guidance: Check job ID and try again'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        error: 'Job is not currently accepting applications',
        ubuntu: 'Ubuntu patience: Wait for active opportunities'
      });
    }

    // Check if user has already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: id,
        applicantId: userId
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        error: 'You have already applied for this job',
        ubuntu: 'Ubuntu integrity: One application per opportunity'
      });
    }

    // Create escrow account for this application
    const escrowId = uuidv4();
    const escrowAccount = {
      id: escrowId,
      jobId: id,
      applicantId: userId,
      employerId: job.postedBy,
      amount: expectedSalary || job.salary || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      conditions: {
        jobAccepted: false,
        workCompleted: false,
        paymentReleased: false
      }
    };

    escrowAccounts.set(escrowId, escrowAccount);

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: id,
        applicantId: userId,
        coverLetter,
        expectedSalary: expectedSalary ? parseInt(expectedSalary) : null,
        availability,
        portfolioLinks,
        resumeUrl: req.file ? `resume_${userId}_${Date.now()}.pdf` : null,
        escrowId,
        status: 'submitted'
      }
    });

    // Log to blockchain
    await logMarketplaceEvent('APPLICATION_SUBMITTED', {
      applicationId: application.id,
      jobId: id,
      applicantId: userId,
      escrowId
    });

    // Send notification to employer
    await sendNotification(job.postedBy, 'NEW_APPLICATION', {
      jobTitle: job.title,
      applicantId: userId,
      applicationId: application.id
    });

    console.log(`📋 Application submitted: ${application.id} for job ${id} - Escrow: ${escrowId}`);

    res.status(201).json({
      success: true,
      application,
      escrow: escrowAccount,
      ubuntu: 'Application submitted with Ubuntu professionalism'
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      error: 'Failed to submit application',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// GET /api/applications - Get user's applications
app.get('/api/applications', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { status, page = 1, limit = 20 } = req.query;

    const where = { applicantId: userId };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: {
            select: {
              title: true,
              company: true,
              location: true,
              remote: true,
              type: true,
              salary: true
            }
          }
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      ubuntu: 'Your applications tracked with Ubuntu care'
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      error: 'Failed to fetch applications',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// GET /api/jobs/:id/applications - Get applications for job (employer only)
app.get('/api/jobs/:id/applications', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    // Check if user owns the job
    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        ubuntu: 'Ubuntu guidance: Check job ID and try again'
      });
    }

    if (job.postedBy !== userId) {
      return res.status(403).json({
        error: 'Only job poster can view applications',
        ubuntu: 'Ubuntu respect: Honor ownership and permissions'
      });
    }

    const where = { jobId: id };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true
            }
          }
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      ubuntu: 'Applications viewed with Ubuntu responsibility'
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      error: 'Failed to fetch applications',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// PUT /api/applications/:id/status - Update application status
app.put('/api/applications/:id/status', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { status, message } = req.body;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true
      }
    });

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        ubuntu: 'Ubuntu guidance: Check application ID and try again'
      });
    }

    // Check permissions
    if (application.job.postedBy !== userId && application.applicantId !== userId) {
      return res.status(403).json({
        error: 'You do not have permission to update this application',
        ubuntu: 'Ubuntu respect: Honor ownership and permissions'
      });
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status,
        employerMessage: message,
        updatedAt: new Date()
      },
      include: {
        job: {
          select: {
            title: true,
            company: true
          }
        }
      }
    });

    // Handle escrow updates
    if (application.escrowId) {
      const escrow = escrowAccounts.get(application.escrowId);
      if (escrow) {
        if (status === 'accepted') {
          escrow.conditions.jobAccepted = true;
          escrow.status = 'active';
        } else if (status === 'rejected') {
          escrow.status = 'cancelled';
        }
        escrowAccounts.set(application.escrowId, escrow);
      }
    }

    // Send notification
    const recipientId = application.job.postedBy === userId ? application.applicantId : application.job.postedBy;
    await sendNotification(recipientId, 'APPLICATION_STATUS_UPDATE', {
      applicationId: id,
      status,
      jobTitle: application.job.title,
      message
    });

    console.log(`🔄 Application status updated: ${id} to ${status} by user ${userId}`);

    res.json({
      success: true,
      application: updatedApplication,
      ubuntu: 'Application updated with Ubuntu care'
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      error: 'Failed to update application status',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// ========== ESCROW ENDPOINTS ==========

// GET /api/escrow/:id - Get escrow details
app.get('/api/escrow/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const escrow = escrowAccounts.get(id);

    if (!escrow) {
      return res.status(404).json({
        error: 'Escrow account not found',
        ubuntu: 'Ubuntu guidance: Check escrow ID and try again'
      });
    }

    // Check permissions
    if (escrow.applicantId !== userId && escrow.employerId !== userId) {
      return res.status(403).json({
        error: 'You do not have permission to view this escrow',
        ubuntu: 'Ubuntu respect: Honor ownership and permissions'
      });
    }

    res.json({
      escrow,
      ubuntu: 'Escrow details shared with Ubuntu transparency'
    });
  } catch (error) {
    console.error('Error fetching escrow:', error);
    res.status(500).json({
      error: 'Failed to fetch escrow',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// POST /api/escrow/:id/release - Release escrow payment
app.post('/api/escrow/:id/release', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const escrow = escrowAccounts.get(id);

    if (!escrow) {
      return res.status(404).json({
        error: 'Escrow account not found',
        ubuntu: 'Ubuntu guidance: Check escrow ID and try again'
      });
    }

    // Check permissions (only employer can release payment)
    if (escrow.employerId !== userId) {
      return res.status(403).json({
        error: 'Only employer can release escrow payment',
        ubuntu: 'Ubuntu respect: Honor ownership and permissions'
      });
    }

    // Check conditions
    if (!escrow.conditions.jobAccepted || !escrow.conditions.workCompleted) {
      return res.status(400).json({
        error: 'Escrow conditions not met for payment release',
        ubuntu: 'Ubuntu integrity: All conditions must be met'
      });
    }

    // Process payment through blockchain
    const paymentResult = await processEscrowPayment(escrow);

    if (paymentResult.success) {
      escrow.conditions.paymentReleased = true;
      escrow.status = 'completed';
      escrow.completedAt = new Date().toISOString();
      escrowAccounts.set(id, escrow);

      // Log to blockchain
      await logMarketplaceEvent('ESCROW_RELEASED', {
        escrowId: id,
        amount: escrow.amount,
        releasedBy: userId,
        transactionHash: paymentResult.transactionHash
      });

      // Send notification to applicant
      await sendNotification(escrow.applicantId, 'PAYMENT_RELEASED', {
        escrowId: id,
        amount: escrow.amount,
        transactionHash: paymentResult.transactionHash
      });

      console.log(`💰 Escrow payment released: ${id} - Amount: ${escrow.amount}`);

      res.json({
        success: true,
        escrow,
        payment: paymentResult,
        ubuntu: 'Payment released with Ubuntu integrity'
      });
    } else {
      res.status(500).json({
        error: 'Failed to process payment',
        ubuntu: 'We handle payment errors with Ubuntu grace'
      });
    }
  } catch (error) {
    console.error('Error releasing escrow:', error);
    res.status(500).json({
      error: 'Failed to release escrow payment',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// ========== UTILITY FUNCTIONS ==========

async function logMarketplaceEvent(eventType, data) {
  try {
    // Log to blockchain service for immutable audit trail
    await axios.post('http://localhost:3029/api/blockchain/transaction', {
      from: 'azora-marketplace',
      to: 'marketplace-audit',
      amount: 0,
      currency: 'AZR',
      type: 'MarketplaceEvent',
      data: { eventType, ...data, ubuntu: 'Ubuntu marketplace logging' }
    }, { timeout: 5000 });
  } catch (error) {
    console.warn('Blockchain logging failed:', error.message);
  }
}

async function sendNotification(userId, type, data) {
  try {
    // Send notification through notification service
    await axios.post('http://localhost:3015/api/notifications/send', {
      userId,
      type,
      data,
      source: 'azora-marketplace'
    }, { timeout: 5000 });
  } catch (error) {
    console.warn('Notification sending failed:', error.message);
  }
}

async function processEscrowPayment(escrow) {
  try {
    // Process payment through blockchain service
    const response = await axios.post('http://localhost:3029/api/token/transfer', {
      from: escrow.employerId,
      to: escrow.applicantId,
      amount: escrow.amount,
      currency: 'AZR',
      type: 'EscrowPayment'
    }, { timeout: 10000 });

    return {
      success: true,
      transactionHash: response.data.txHash
    };
  } catch (error) {
    console.error('Escrow payment processing failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Marketplace Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu marketplace service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Marketplace endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available marketplace endpoints',
    availableEndpoints: [
      '/api/jobs',
      '/api/jobs/:id',
      '/api/applications',
      '/api/jobs/:id/applications',
      '/api/applications/:id/status',
      '/api/escrow/:id',
      '/api/escrow/:id/release'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🏢 Azora Marketplace Service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I serve because we prosper together!"');
  console.log(`💼 Job Listings: Active`);
  console.log(`📋 Applications: Active`);
  console.log(`🔒 Escrow System: Active`);
  console.log(`📢 Notifications: Active`);
});

module.exports = app;

if (!job) {
  return res.status(404).json({
    error: 'Job not found',
    ubuntu: 'Ubuntu compassion in all responses'
  });
}

res.json(job);
  } catch (error) {
  console.error('Error fetching job:', error);
  res.status(500).json({
    error: 'Failed to fetch job',
    ubuntu: 'We handle errors with Ubuntu grace'
  });
}
});

// POST /api/jobs - Create new job
app.post('/api/jobs', async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      remote,
      salary,
      currency,
      requirements,
      skills
    } = req.body;

    // Validate required fields
    if (!title || !description || !company) {
      return res.status(400).json({
        error: 'Missing required fields: title, description, company',
        ubuntu: 'Ubuntu clarity in communication'
      });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        company,
        location,
        remote: remote || false,
        salary: salary ? parseFloat(salary) : null,
        currency: currency || 'ZAR',
        requirements,
        status: 'ACTIVE'
      },
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    res.status(201).json({
      job,
      ubuntu: 'My work strengthens our foundation'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      error: 'Failed to create job',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// PUT /api/jobs/:id - Update job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    res.json({
      job,
      ubuntu: 'Ubuntu continuous improvement'
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      error: 'Failed to update job',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// ========== APPLICATION ENDPOINTS ==========

// POST /api/applications - Create job application
app.post('/api/applications', async (req, res) => {
  try {
    const { jobId, coverLetter, resume } = req.body;
    const userId = getUserId(req);

    if (!jobId) {
      return res.status(400).json({
        error: 'Missing required field: jobId',
        ubuntu: 'Ubuntu clarity in communication'
      });
    }

    // Check if already applied
    const existing = await prisma.jobApplication.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        error: 'Already applied to this job',
        ubuntu: 'Ubuntu prevents duplication'
      });
    }

    // Ensure user exists (simple upsert)
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: `user_${userId}@example.com`,
        name: 'Azora User'
      },
      update: {}
    });

    const application = await prisma.jobApplication.create({
      data: {
        userId,
        jobId,
        coverLetter,
        resume,
        status: 'PENDING'
      },
      include: {
        job: true
      }
    });

    res.status(201).json({
      application,
      message: 'Application submitted successfully',
      ubuntu: 'My work strengthens our foundation'
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      error: 'Failed to submit application',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// GET /api/applications - Get user's applications
app.get('/api/applications', async (req, res) => {
  try {
    const userId = getUserId(req);

    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            skills: {
              include: {
                skill: true
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json({
      applications,
      ubuntu: 'Ubuntu tracks our journey together'
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      error: 'Failed to fetch applications',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// GET /api/applications/:id - Get single application
app.get('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    const application = await prisma.jobApplication.findFirst({
      where: {
        id,
        userId // Ensure user can only see their own applications
      },
      include: {
        job: true
      }
    });

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        ubuntu: 'Ubuntu compassion in all responses'
      });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      error: 'Failed to fetch application',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// ========== LEGACY ENDPOINT (for backward compatibility) ==========
app.post('/api/jobs/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    // Redirect to new application endpoint
    const application = await prisma.jobApplication.create({
      data: {
        userId,
        jobId: id,
        status: 'PENDING'
      }
    });

    res.json({
      success: true,
      jobId: id,
      applicationId: application.id,
      message: 'Application submitted successfully',
      ubuntu: 'My work strengthens our foundation'
    });
  } catch (error) {
    console.error('Error applying to job:', error);
    res.status(500).json({
      error: 'Failed to apply',
      ubuntu: 'We handle errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start Ubuntu Service
app.listen(PORT, () => {
  console.log(`🚀 azora-marketplace running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I serve because we prosper together!"');
  console.log('📊 Database: Connected to PostgreSQL');
  console.log('🔗 API Endpoints:');
  console.log('   GET  /api/jobs - List all jobs');
  console.log('   GET  /api/jobs/:id - Get job details');
  console.log('   POST /api/jobs - Create new job');
  console.log('   POST /api/applications - Apply to job');
  console.log('   GET  /api/applications - Get my applications');
});