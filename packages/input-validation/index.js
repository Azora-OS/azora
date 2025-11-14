const Joi = require('joi');

const schemas = {
  wallet: {
    create: Joi.object({ userId: Joi.string().required().min(1).max(100) }),
    transfer: Joi.object({
      fromUserId: Joi.string().required(),
      toUserId: Joi.string().required(),
      amount: Joi.number().positive().required(),
      reason: Joi.string().max(500)
    })
  },
  mining: {
    start: Joi.object({
      userId: Joi.string().required(),
      activityId: Joi.string().required(),
      activityType: Joi.string().valid('course_completion', 'job_completion', 'skill_assessment').required(),
      performance: Joi.number().min(0).max(1).default(0.8)
    })
  },
  stake: {
    create: Joi.object({
      userId: Joi.string().required(),
      amount: Joi.number().positive().required(),
      duration: Joi.number().integer().min(1).max(365).default(30)
    }),
    unstake: Joi.object({ userId: Joi.string().required(), stakeId: Joi.string().required() })
  },
  job: {
    create: Joi.object({
      title: Joi.string().required().min(3).max(200),
      company: Joi.string().required().min(2).max(200),
      requirements: Joi.array().items(Joi.string()).min(1),
      salary: Joi.number().positive(),
      location: Joi.string().max(200)
    }),
    apply: Joi.object({ userId: Joi.string().required(), coverLetter: Joi.string().max(5000) })
  },
  student: {
    register: Joi.object({
      userId: Joi.string().required(),
      firstName: Joi.string().required().min(1).max(100),
      lastName: Joi.string().required().min(1).max(100),
      email: Joi.string().email().required(),
      dateOfBirth: Joi.date().max('now'),
      grade: Joi.string().max(50),
      country: Joi.string().length(2)
    })
  },
  auth: {
    login: Joi.object({ email: Joi.string().email().required(), password: Joi.string().min(8).required() }),
    register: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
      firstName: Joi.string().required().min(1).max(100),
      lastName: Joi.string().required().min(1).max(100)
    })
  }
};

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
    });
  }
  req.body = value;
  next();
};

module.exports = { schemas, validate };
