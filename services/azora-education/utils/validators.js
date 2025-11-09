// ✅ Input Validation Utilities

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateLearnerInput = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email address is required');
  }
  
  if (data.learningGoals && !Array.isArray(data.learningGoals)) {
    errors.push('Learning goals must be an array');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateCourseInput = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length < 5) {
    errors.push('Course title must be at least 5 characters long');
  }
  
  if (!data.instructor || data.instructor.trim().length < 3) {
    errors.push('Instructor name must be at least 3 characters long');
  }
  
  if (data.difficulty && (data.difficulty < 1 || data.difficulty > 5)) {
    errors.push('Difficulty must be between 1 and 5');
  }
  
  if (data.price && data.price < 0) {
    errors.push('Price cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateProgressInput = (data) => {
  const errors = [];
  
  if (!data.learnerId) {
    errors.push('Learner ID is required');
  }
  
  if (!data.courseId) {
    errors.push('Course ID is required');
  }
  
  if (data.score !== undefined && (data.score < 0 || data.score > 1)) {
    errors.push('Score must be between 0 and 1');
  }
  
  if (data.timeSpent && data.timeSpent < 0) {
    errors.push('Time spent cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '');
};

module.exports = {
  validateEmail,
  validateLearnerInput,
  validateCourseInput,
  validateProgressInput,
  sanitizeInput
};