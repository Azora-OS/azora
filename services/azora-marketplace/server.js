const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4004;
const prisma = new PrismaClient();

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
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Ubuntu rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(ubuntuLimiter);

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
      database: 'connected'
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
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: 'azora-marketplace',
    ubuntu: 'Ubuntu service excellence'
  });
});

// ========== JOB ENDPOINTS ==========

// GET /api/jobs - List all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { search, status, remote } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (remote !== undefined) {
      where.remote = remote === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    const jobs = await prisma.job.findMany({
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
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      jobs,
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

// GET /api/jobs/:id - Get single job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true
          }
        },
        applications: {
          select: {
            id: true,
            status: true,
            appliedAt: true
          }
        }
      }
    });

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