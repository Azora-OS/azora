const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Azora OS API',
    version: '1.0.0',
    description: 'Production-ready microservices API for Azora OS - Education, Finance, and Safety platform',
    contact: {
      name: 'Azora Team',
      email: 'api@azora.world',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local development server (API Gateway)',
    },
    {
      url: 'http://localhost:4001',
      description: 'Auth Service (Direct)',
    },
    {
      url: 'http://localhost:4002',
      description: 'Education Service (Direct)',
    },
    {
      url: 'http://localhost:4003',
      description: 'Payment Service (Direct)',
    },
    {
      url: 'https://api.azora.world',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['STUDENT', 'EDUCATOR', 'ADMIN'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Course: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          instructor: { type: 'string' },
          duration: { type: 'number' },
          price: { type: 'number' },
          currency: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
        },
      },
      Enrollment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          courseId: { type: 'string' },
          status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'DROPPED'] },
          progress: { type: 'number', minimum: 0, maximum: 100 },
          enrolledAt: { type: 'string', format: 'date-time' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          type: { type: 'string', enum: ['ENROLLMENT', 'SUBSCRIPTION', 'DONATION', 'REFUND'] },
          status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] },
          transactionId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['STUDENT', 'EDUCATOR'], default: 'STUDENT' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Get user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile retrieved' },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['Authentication'],
        summary: 'Update user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  bio: { type: 'string' },
                  avatar: { type: 'string' },
                  location: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/courses': {
      get: {
        tags: ['Education'],
        summary: 'List all published courses',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Courses retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Course' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Education'],
        summary: 'Create new course (educators only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  duration: { type: 'number' },
                  price: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Course created' },
          403: { description: 'Not authorized' },
        },
      },
    },
    '/api/wallet': {
      get: {
        tags: ['Payment'],
        summary: 'Get wallet balance',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Wallet balance retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        balance: { type: 'number' },
                        currency: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/earn': {
      post: {
        tags: ['Payment'],
        summary: 'Earn tokens (learn-to-earn)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', minimum: 1, maximum: 1000 },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tokens earned' },
          400: { description: 'Invalid amount' },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and profile management',
    },
    {
      name: 'Education',
      description: 'Course management and enrollment',
    },
    {
      name: 'Payment',
      description: 'Wallet and transaction management',
    },
  ],
};

module.exports = swaggerDefinition;
