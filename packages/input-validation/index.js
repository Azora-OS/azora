const { z } = require('zod');

// Common schemas
const schemas = {
  user: {
    create: z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2).max(100)
    }),
    login: z.object({
      email: z.string().email(),
      password: z.string()
    })
  },
  
  course: {
    create: z.object({
      title: z.string().min(3).max(200),
      description: z.string().max(2000),
      category: z.string().optional(),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional()
    })
  },
  
  job: {
    create: z.object({
      title: z.string().min(3).max(200),
      company: z.string().min(2).max(200),
      requirements: z.array(z.string()).optional(),
      salary: z.number().positive().optional(),
      location: z.string().optional()
    }),
    apply: z.object({
      userId: z.string().uuid(),
      coverLetter: z.string().max(5000).optional()
    })
  },
  
  wallet: {
    create: z.object({
      userId: z.string().uuid()
    }),
    transfer: z.object({
      from: z.string(),
      to: z.string(),
      amount: z.number().positive()
    })
  }
};

// Validation middleware
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: 'Validation failed', 
      details: err.errors 
    });
  }
};

module.exports = { schemas, validate };
