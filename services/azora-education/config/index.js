/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const path = require('path');

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 4200,
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development',
    apiVersion: 'v1'
  },

  // Database Configuration
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/azora-education',
      testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/azora-education-test',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false
      }
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: process.env.REDIS_DB || 0,
      ttl: 3600 // 1 hour default TTL
    }
  },

  // Authentication Configuration
  auth: {
    jwt: {
      secret: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return secret;
      })(),
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      refreshTokenExpiresIn: '30d',
      issuer: 'azora-education',
      audience: 'azora-users'
    },
    bcrypt: {
      rounds: 12
    },
    session: {
      secret: process.env.SESSION_SECRET || 'azora-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }
  },

  // AI Configuration
  ai: {
    brain: {
      learningRate: 0.3,
      momentum: 0.1,
      binaryThresh: 0.5,
      hiddenLayers: [10, 8, 6],
      activation: 'sigmoid'
    },
    natural: {
      language: 'EN',
      stemmer: 'PorterStemmer',
      classifier: {
        algorithm: 'BayesClassifier'
      }
    },
    math: {
      precision: 6,
      timeout: 5000 // 5 seconds
    },
    personalization: {
      adaptationRate: 0.1,
      confidenceThreshold: 0.7,
      maxRecommendations: 10
    }
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'audio/mpeg'
    ],
    destination: path.join(__dirname, '../uploads'),
    tempDir: path.join(__dirname, '../temp'),
    cacheDir: path.join(__dirname, '../cache')
  },

  // Department of Education Standards
  standards: {
    commonCore: {
      version: '2023',
      subjects: ['math', 'ela', 'science', 'social_studies'],
      grades: Array.from({ length: 13 }, (_, i) => i), // 0-12 (K-12)
      domains: {
        math: ['OA', 'NBT', 'NF', 'MD', 'G', 'SP', 'EE', 'F'],
        ela: ['RL', 'RI', 'RF', 'W', 'SL', 'L']
      }
    },
    assessment: {
      passingScore: 70,
      excellentScore: 90,
      gradingScale: {
        'A': { min: 90, max: 100 },
        'B': { min: 80, max: 89 },
        'C': { min: 70, max: 79 },
        'D': { min: 60, max: 69 },
        'F': { min: 0, max: 59 }
      }
    }
  },

  // Curriculum Configuration
  curriculum: {
    subjects: [
      'Mathematics',
      'English Language Arts',
      'Science',
      'Social Studies',
      'History',
      'Geography',
      'Physical Education',
      'Health',
      'Art',
      'Music',
      'Computer Science',
      'Foreign Languages'
    ],
    gradeLevels: [
      'Kindergarten',
      'Grade 1',
      'Grade 2',
      'Grade 3',
      'Grade 4',
      'Grade 5',
      'Grade 6',
      'Grade 7',
      'Grade 8',
      'Grade 9',
      'Grade 10',
      'Grade 11',
      'Grade 12'
    ],
    lessonTypes: [
      'lecture',
      'interactive',
      'practice',
      'assessment',
      'project',
      'discussion',
      'lab'
    ],
    assessmentTypes: [
      'quiz',
      'test',
      'midterm',
      'final',
      'project',
      'presentation',
      'homework'
    ]
  },

  // Offline Configuration
  offline: {
    cache: {
      maxSize: '2GB',
      compression: 'gzip',
      strategy: 'lru', // least recently used
      ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    sync: {
      batchSize: 100,
      retryAttempts: 3,
      retryDelay: 5000, // 5 seconds
      conflictResolution: 'server_wins'
    },
    storage: {
      indexedDB: {
        name: 'AzoraEducationDB',
        version: 1,
        stores: ['curriculum', 'assessments', 'progress', 'files']
      }
    }
  },

  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    templates: {
      welcome: 'welcome.html',
      progressReport: 'progress-report.html',
      assessmentResults: 'assessment-results.html',
      complianceReport: 'compliance-report.html'
    },
    defaults: {
      from: 'Azora Education <noreply@azora.world>'
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    transports: {
      console: {
        enabled: true,
        colorize: process.env.NODE_ENV !== 'production'
      },
      file: {
        enabled: process.env.NODE_ENV === 'production',
        filename: 'logs/azora-education.log',
        maxsize: '10m',
        maxFiles: 5
      }
    }
  },

  // Security Configuration
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://azora.world'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.azora.world"]
        }
      }
    }
  },

  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      enabled: true,
      path: '/health',
      interval: 30000 // 30 seconds
    },
    metrics: {
      enabled: process.env.NODE_ENV === 'production',
      collectDefaultMetrics: true,
      prefix: 'azora_education_'
    },
    alerts: {
      email: process.env.ALERT_EMAIL,
      thresholds: {
        responseTime: 5000, // 5 seconds
        errorRate: 0.05, // 5%
        memoryUsage: 0.8 // 80%
      }
    }
  },

  // External Services
  external: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo',
      maxTokens: 2000,
      temperature: 0.7
    },
    google: {
      apiKey: process.env.GOOGLE_API_KEY,
      services: ['translate', 'vision', 'speech']
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      s3: {
        bucket: process.env.AWS_S3_BUCKET || 'azora-education-files'
      }
    }
  },

  // Feature Flags
  features: {
    aiLessonPlanning: true,
    offlineMode: true,
    realTimeCollaboration: false,
    videoConferencing: false,
    mobileApp: false,
    multiLanguage: false,
    advancedAnalytics: true,
    parentalControls: true,
    gamification: false
  },

  // Development Configuration
  development: {
    debug: process.env.DEBUG || false,
    hotReload: true,
    swagger: {
      enabled: true,
      path: '/api-docs',
      title: 'Azora Education API',
      version: '1.0.0'
    },
    seedData: true
  },

  // Production Configuration
  production: {
    trustProxy: 1,
    compression: {
      enabled: true,
      level: 6
    },
    clustering: {
      enabled: process.env.CLUSTER_MODE === 'true',
      workers: process.env.WEB_CONCURRENCY || require('os').cpus().length
    }
  },

  // Testing Configuration
  testing: {
    timeout: 10000,
    slowTestThreshold: 5000,
    coverage: {
      enabled: true,
      reporter: ['text', 'lcov', 'html'],
      exclude: ['node_modules/', 'test/', 'coverage/']
    }
  }
};