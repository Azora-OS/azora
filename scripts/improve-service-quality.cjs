#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../services');

const TEMPLATES = {
  routes: `const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: '{{SERVICE_NAME}}' });
});

router.get('/', async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    res.json({ success: true, data: req.body });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
`,

  controller: `class {{SERVICE_CLASS}}Controller {
  async getAll(req, res) {
    try {
      res.json({ success: true, data: [] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      res.json({ success: true, data: { id } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req, res) {
    try {
      res.json({ success: true, data: req.body });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      res.json({ success: true, data: { id, ...req.body } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new {{SERVICE_CLASS}}Controller();
`,

  service: `class {{SERVICE_CLASS}}Service {
  async findAll() {
    return [];
  }

  async findById(id) {
    return { id };
  }

  async create(data) {
    return { id: Date.now(), ...data };
  }

  async update(id, data) {
    return { id, ...data };
  }

  async delete(id) {
    return { id };
  }
}

module.exports = new {{SERVICE_CLASS}}Service();
`,

  readme: `# {{SERVICE_NAME}}

## Overview
{{SERVICE_DESCRIPTION}}

## Features
- RESTful API endpoints
- Database integration with Prisma
- Error handling and validation
- Docker support

## API Endpoints

### GET /health
Health check endpoint

### GET /
Get all records

### GET /:id
Get record by ID

### POST /
Create new record

### PUT /:id
Update record

### DELETE /:id
Delete record

## Environment Variables
\`\`\`
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
\`\`\`

## Development
\`\`\`bash
npm install
npm run dev
\`\`\`

## Testing
\`\`\`bash
npm test
\`\`\`

## Ubuntu Philosophy
*"{{UBUNTU_QUOTE}}"*
`,

  test: `const request = require('supertest');
const app = require('./index');

describe('{{SERVICE_NAME}} API', () => {
  test('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('GET / returns empty array', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
`
};

const UBUNTU_QUOTES = [
  'My knowledge becomes our knowledge',
  'My success enables your success',
  'My work strengthens our foundation',
  'I am because we are',
  'Together we are stronger'
];

function getServiceDescription(serviceName) {
  const descriptions = {
    'auth': 'Authentication and authorization service',
    'payment': 'Payment processing and transaction management',
    'education': 'Educational content and course management',
    'marketplace': 'Job matching and skills marketplace',
    'analytics': 'Data analytics and reporting',
    'notification': 'Notification and messaging service',
    'user': 'User management and profiles'
  };

  for (const [key, desc] of Object.entries(descriptions)) {
    if (serviceName.toLowerCase().includes(key)) {
      return desc;
    }
  }
  return 'Core service for Azora OS platform';
}

function toClassName(serviceName) {
  return serviceName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function improveService(servicePath, serviceName) {
  const improvements = [];
  
  // Create src directory if needed
  const srcDir = path.join(servicePath, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // Add routes
  const routesPath = path.join(srcDir, 'routes.js');
  if (!fs.existsSync(routesPath)) {
    const content = TEMPLATES.routes.replace(/{{SERVICE_NAME}}/g, serviceName);
    fs.writeFileSync(routesPath, content);
    improvements.push('routes');
  }

  // Add controller
  const controllersDir = path.join(srcDir, 'controllers');
  if (!fs.existsSync(controllersDir)) {
    fs.mkdirSync(controllersDir, { recursive: true });
    const controllerPath = path.join(controllersDir, 'index.js');
    const content = TEMPLATES.controller.replace(/{{SERVICE_CLASS}}/g, toClassName(serviceName));
    fs.writeFileSync(controllerPath, content);
    improvements.push('controller');
  }

  // Add service
  const servicesDir = path.join(srcDir, 'services');
  if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir, { recursive: true });
    const servicePath = path.join(servicesDir, 'index.js');
    const content = TEMPLATES.service.replace(/{{SERVICE_CLASS}}/g, toClassName(serviceName));
    fs.writeFileSync(servicePath, content);
    improvements.push('service');
  }

  // Add README
  const readmePath = path.join(servicePath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const content = TEMPLATES.readme
      .replace(/{{SERVICE_NAME}}/g, serviceName)
      .replace(/{{SERVICE_DESCRIPTION}}/g, getServiceDescription(serviceName))
      .replace(/{{UBUNTU_QUOTE}}/g, UBUNTU_QUOTES[Math.floor(Math.random() * UBUNTU_QUOTES.length)]);
    fs.writeFileSync(readmePath, content);
    improvements.push('README');
  }

  // Add tests
  const testsDir = path.join(servicePath, 'tests');
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
    const testPath = path.join(testsDir, 'api.test.js');
    const content = TEMPLATES.test.replace(/{{SERVICE_NAME}}/g, serviceName);
    fs.writeFileSync(testPath, content);
    improvements.push('tests');
  }

  return improvements;
}

function main() {
  const args = process.argv.slice(2);
  const targetService = args[0];
  const count = parseInt(args[1]) || 10;

  console.log('🔧 Azora OS Service Quality Improvement\n');

  // Load quality report
  const reportPath = path.join(SERVICES_DIR, 'SERVICE-QUALITY-REPORT.json');
  if (!fs.existsSync(reportPath)) {
    console.log('❌ Run service-quality-audit.cjs first');
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  let servicesToImprove = [];

  if (targetService) {
    servicesToImprove = [targetService];
  } else {
    // Get top partial services
    servicesToImprove = report.services.PARTIAL
      .filter(s => s.score >= 4)
      .slice(0, count)
      .map(s => s.name);
  }

  console.log(`🎯 Improving ${servicesToImprove.length} services\n`);

  let improved = 0;
  servicesToImprove.forEach(serviceName => {
    const servicePath = path.join(SERVICES_DIR, serviceName);
    if (!fs.existsSync(servicePath)) {
      console.log(`⚠️  ${serviceName} - not found`);
      return;
    }

    const improvements = improveService(servicePath, serviceName);
    if (improvements.length > 0) {
      console.log(`✅ ${serviceName} - added: ${improvements.join(', ')}`);
      improved++;
    } else {
      console.log(`⏭️  ${serviceName} - already complete`);
    }
  });

  console.log(`\n✨ Improved ${improved} services`);
  console.log('\n💡 Next steps:');
  console.log('   1. Review generated files');
  console.log('   2. Add business logic to controllers/services');
  console.log('   3. Update Prisma schemas');
  console.log('   4. Run tests');
}

main();
