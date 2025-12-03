const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'lending-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// In-memory storage for loans and credit evaluations (in production, use a database)
const loans = new Map();
const creditEvaluations = new Map();
const applicants = new Map();

// Initialize with sample data
loans.set('loan_1', {
  id: 'loan_1',
  applicantId: 'user_1',
  applicantName: 'John Doe',
  amount: 10000,
  term: 24,
  interestRate: 5.5,
  status: 'approved',
  appliedAt: new Date().toISOString(),
  approvedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

loans.set('loan_2', {
  id: 'loan_2',
  applicantId: 'user_2',
  applicantName: 'Jane Smith',
  amount: 25000,
  term: 36,
  interestRate: 6.2,
  status: 'pending',
  appliedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'lending-service', 
    timestamp: new Date().toISOString() 
  });
});

// Get all loan applications
app.get('/api/loans', (req, res) => {
  try {
    const loanList = Array.from(loans.values());
    
    res.json({
      success: true,
      data: loanList,
      count: loanList.length
    });
  } catch (error) {
    logger.error('Error fetching loans:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific loan application
app.get('/api/loans/:loanId', (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = loans.get(loanId);
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    logger.error('Error fetching loan:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit a new loan application
app.post('/api/loans', (req, res) => {
  try {
    const { applicantId, applicantName, amount, term, purpose } = req.body;
    
    // Validate input
    if (!applicantId || !applicantName || !amount || !term) {
      return res.status(400).json({ error: 'Applicant ID, name, amount, and term are required' });
    }
    
    const loanId = uuidv4();
    const loan = {
      id: loanId,
      applicantId,
      applicantName,
      amount: parseFloat(amount),
      term: parseInt(term),
      purpose: purpose || '',
      status: 'pending',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    loans.set(loanId, loan);
    
    logger.info(`Loan application ${loanId} submitted for applicant ${applicantId}`);
    
    res.status(201).json({
      success: true,
      data: loan
    });
  } catch (error) {
    logger.error('Error submitting loan application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update loan application status
app.put('/api/loans/:loanId', (req, res) => {
  try {
    const { loanId } = req.params;
    const { status, interestRate, notes } = req.body;
    
    const loan = loans.get(loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    // Update loan
    loan.status = status || loan.status;
    loan.interestRate = interestRate !== undefined ? parseFloat(interestRate) : loan.interestRate;
    loan.notes = notes || loan.notes;
    loan.updatedAt = new Date().toISOString();
    
    // If approved, set approval date
    if (status === 'approved' && !loan.approvedAt) {
      loan.approvedAt = new Date().toISOString();
    }
    
    loans.set(loanId, loan);
    
    logger.info(`Loan application ${loanId} status updated to ${status}`);
    
    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    logger.error('Error updating loan application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Credit evaluation endpoint
app.post('/api/credit-evaluation', (req, res) => {
  try {
    const { applicantId, applicantName, amount, income, employment } = req.body;
    
    // Validate input
    if (!applicantId || !applicantName || !amount) {
      return res.status(400).json({ error: 'Applicant ID, name, and amount are required' });
    }
    
    // Simulate credit evaluation
    const creditScore = Math.floor(Math.random() * 300) + 500; // 500-800
    const riskLevel = creditScore >= 700 ? 'low' : creditScore >= 600 ? 'medium' : 'high';
    const approved = creditScore >= 600; // Approve if score is 600 or higher
    const interestRate = calculateInterestRate(creditScore, amount);
    
    const evaluation = {
      id: uuidv4(),
      applicantId,
      applicantName,
      amount: parseFloat(amount),
      income: income || 0,
      employment: employment || '',
      creditScore,
      riskLevel,
      approved,
      interestRate,
      evaluatedAt: new Date().toISOString()
    };
    
    creditEvaluations.set(evaluation.id, evaluation);
    
    // Store applicant info
    applicants.set(applicantId, {
      id: applicantId,
      name: applicantName,
      income: income || 0,
      employment: employment || '',
      lastEvaluated: new Date().toISOString()
    });
    
    logger.info(`Credit evaluation ${evaluation.id} completed for applicant ${applicantId}`);
    
    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    logger.error('Error evaluating credit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get credit history for applicant
app.get('/api/credit-evaluation/:applicantId', (req, res) => {
  try {
    const { applicantId } = req.params;
    
    // Find all evaluations for this applicant
    const applicantEvaluations = Array.from(creditEvaluations.values()).filter(
      creditEval => creditEval.applicantId === applicantId
    );
    
    if (applicantEvaluations.length === 0) {
      return res.status(404).json({ error: 'No credit evaluations found for this applicant' });
    }
    
    res.json({
      success: true,
      data: applicantEvaluations,
      count: applicantEvaluations.length
    });
  } catch (error) {
    logger.error('Error fetching credit evaluations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get applicant info
app.get('/api/applicants/:applicantId', (req, res) => {
  try {
    const { applicantId } = req.params;
    const applicant = applicants.get(applicantId);
    
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }
    
    res.json({
      success: true,
      data: applicant
    });
  } catch (error) {
    logger.error('Error fetching applicant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search loans by status
app.get('/api/loans/search', (req, res) => {
  try {
    const { status } = req.query;
    
    if (!status) {
      return res.status(400).json({ error: 'Status parameter is required' });
    }
    
    const filteredLoans = Array.from(loans.values()).filter(loan => loan.status === status);
    
    res.json({
      success: true,
      data: filteredLoans,
      count: filteredLoans.length
    });
  } catch (error) {
    logger.error('Error searching loans:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate interest rate based on credit score and loan amount
function calculateInterestRate(creditScore, amount) {
  // Base rate starts at 3%
  let baseRate = 3.0;
  
  // Adjust based on credit score
  if (creditScore < 600) {
    baseRate += 5.0; // High risk
  } else if (creditScore < 700) {
    baseRate += 2.0; // Medium risk
  }
  // For scores 700+, base rate remains at 3%
  
  // Adjust based on loan amount
  if (amount > 50000) {
    baseRate += 1.0; // Large loan
  } else if (amount > 25000) {
    baseRate += 0.5; // Medium loan
  }
  // For smaller loans, no additional adjustment
  
  return parseFloat(baseRate.toFixed(2));
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`Lending Service running on port ${PORT}`);
});

module.exports = app;