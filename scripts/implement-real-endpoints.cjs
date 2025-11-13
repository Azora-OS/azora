#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../services');

// Real endpoint implementations by service category
const ENDPOINT_IMPLEMENTATIONS = {
  education: {
    'GET /api/courses': `
  const courses = await prisma.course.findMany({
    where: { isPublished: true, deletedAt: null },
    include: { instructor: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: courses });`,
    
    'POST /api/courses/:id/enroll': `
  const { id } = req.params;
  const { studentId } = req.body;
  
  const enrollment = await prisma.enrollment.create({
    data: { courseId: id, studentId, status: 'ACTIVE', progress: 0 }
  });
  res.json({ success: true, data: enrollment });`,
    
    'GET /api/progress/:studentId': `
  const { studentId } = req.params;
  
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: { course: true }
  });
  res.json({ success: true, data: enrollments });`
  },
  
  payment: {
    'GET /api/wallet/balance': `
  const { userId } = req.user;
  
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { balance: true, currency: true }
  });
  res.json({ success: true, data: wallet || { balance: 0, currency: 'AZR' } });`,
    
    'POST /api/transactions': `
  const { amount, type, currency = 'AZR' } = req.body;
  const { userId } = req.user;
  
  const transaction = await prisma.transaction.create({
    data: { userId, amount, type, currency, status: 'PENDING' }
  });
  res.json({ success: true, data: transaction });`,
    
    'GET /api/transactions': `
  const { userId } = req.user;
  const { limit = 50, offset = 0 } = req.query;
  
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit),
    skip: parseInt(offset)
  });
  res.json({ success: true, data: transactions });`
  },
  
  marketplace: {
    'GET /api/jobs': `
  const { status = 'OPEN', limit = 20 } = req.query;
  
  const jobs = await prisma.job.findMany({
    where: { status, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit)
  });
  res.json({ success: true, data: jobs });`,
    
    'POST /api/jobs/:id/apply': `
  const { id } = req.params;
  const { userId } = req.user;
  const { coverLetter } = req.body;
  
  const application = await prisma.jobApplication.create({
    data: { jobId: id, applicantId: userId, coverLetter, status: 'PENDING' }
  });
  res.json({ success: true, data: application });`,
    
    'GET /api/skills/assessment': `
  const { userId } = req.user;
  
  const skills = await prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true }
  });
  res.json({ success: true, data: skills });`
  },
  
  auth: {
    'POST /api/auth/login': `
  const { email, password } = req.body;
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
  res.json({ success: true, data: { token, user: { id: user.id, email: user.email, role: user.role } } });`,
    
    'GET /api/auth/profile': `
  const { userId } = req.user;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, createdAt: true }
  });
  res.json({ success: true, data: user });`
  }
};

function generateServiceImplementation(serviceName, category) {
  const endpoints = ENDPOINT_IMPLEMENTATIONS[category] || {};
  
  return `// ${serviceName} - Real Implementation
// Ubuntu: "My code strengthens our foundation"

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const router = express.Router();

// Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: '${serviceName}', timestamp: new Date().toISOString() });
});

${Object.entries(endpoints).map(([route, impl]) => {
  const [method, path] = route.split(' ');
  const needsAuth = !path.includes('/health') && !path.includes('/login');
  
  return `
// ${route}
router.${method.toLowerCase()}('${path}', ${needsAuth ? 'authenticate, ' : ''}async (req, res) => {
  try {
    ${impl}
  } catch (error) {
    console.error('Error in ${route}:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});`;
}).join('\n')}

module.exports = router;
`;
}

function getServiceCategory(serviceName) {
  const name = serviceName.toLowerCase();
  
  if (name.includes('education') || name.includes('course') || name.includes('lms') || 
      name.includes('tutor') || name.includes('assessment') || name.includes('sapiens')) {
    return 'education';
  }
  
  if (name.includes('pay') || name.includes('mint') || name.includes('wallet') || 
      name.includes('transaction') || name.includes('billing') || name.includes('coin')) {
    return 'payment';
  }
  
  if (name.includes('forge') || name.includes('job') || name.includes('career') || 
      name.includes('marketplace') || name.includes('work')) {
    return 'marketplace';
  }
  
  if (name.includes('auth') || name.includes('user') || name.includes('session')) {
    return 'auth';
  }
  
  return 'generic';
}

function createRealEndpoints(servicePath, serviceName) {
  const category = getServiceCategory(serviceName);
  
  if (category === 'generic') {
    return false; // Skip generic services
  }
  
  const routesDir = path.join(servicePath, 'routes');
  if (!fs.existsSync(routesDir)) {
    fs.mkdirSync(routesDir, { recursive: true });
  }
  
  const routesFile = path.join(routesDir, 'index.js');
  const implementation = generateServiceImplementation(serviceName, category);
  
  fs.writeFileSync(routesFile, implementation);
  
  // Update main index.js to use routes
  const indexPath = path.join(servicePath, 'index.js');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    if (!indexContent.includes('./routes')) {
      const updatedContent = indexContent.replace(
        /const app = express\(\);/,
        `const app = express();\nconst routes = require('./routes');\n\napp.use('/api', routes);`
      );
      
      fs.writeFileSync(indexPath, updatedContent);
    }
  }
  
  return true;
}

function main() {
  console.log('🔧 Implementing Real API Endpoints\n');
  
  const services = fs.readdirSync(SERVICES_DIR)
    .filter(name => {
      const servicePath = path.join(SERVICES_DIR, name);
      return fs.statSync(servicePath).isDirectory();
    });
  
  let implemented = 0;
  let skipped = 0;
  
  services.forEach(serviceName => {
    const servicePath = path.join(SERVICES_DIR, serviceName);
    const wasImplemented = createRealEndpoints(servicePath, serviceName);
    
    if (wasImplemented) {
      console.log(`✓ ${serviceName}`);
      implemented++;
    } else {
      skipped++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Implemented: ${implemented}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${services.length}`);
  console.log(`\n✅ Real endpoint implementation complete!`);
  console.log(`\n⚠️  Next steps:`);
  console.log(`   1. Review generated routes in services/*/routes/`);
  console.log(`   2. Run: npm install bcryptjs jsonwebtoken`);
  console.log(`   3. Test endpoints with: npm run test:integration`);
}

main();
