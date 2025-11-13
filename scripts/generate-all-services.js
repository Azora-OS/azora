#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SERVICES = [
  // Marketplace Services
  { name: 'azora-careers', port: 3071, category: 'marketplace' },
  { name: 'job-board-service', port: 3072, category: 'marketplace' },
  { name: 'skills-assessment-service', port: 3073, category: 'marketplace' },
  { name: 'freelance-service', port: 3074, category: 'marketplace' },
  
  // Education Services
  { name: 'course-service', port: 3054, category: 'education' },
  { name: 'enrollment-service', port: 3055, category: 'education' },
  { name: 'azora-classroom', port: 3056, category: 'education' },
  { name: 'azora-content', port: 3057, category: 'education' },
  { name: 'azora-credentials', port: 3059, category: 'education' },
  { name: 'azora-library', port: 3060, category: 'education' },
  
  // Infrastructure Services
  { name: 'message-queue-service', port: 3053, category: 'infrastructure' },
  { name: 'event-bus-service', port: 3054, category: 'infrastructure' },
  { name: 'monitoring-service', port: 3055, category: 'infrastructure' },
  { name: 'backup-service', port: 3056, category: 'infrastructure' },
  
  // AI Services
  { name: 'ai-recommendation-service', port: 3100, category: 'ai' },
  { name: 'ai-content-generation', port: 3101, category: 'ai' },
  { name: 'ai-translation-service', port: 3102, category: 'ai' },
  { name: 'ai-moderation-service', port: 3103, category: 'ai' },
  
  // Communication Services
  { name: 'sms-service', port: 3200, category: 'communication' },
  { name: 'push-notification-service', port: 3201, category: 'communication' },
  { name: 'chat-service', port: 3202, category: 'communication' },
  { name: 'video-call-service', port: 3203, category: 'communication' }
];

const SERVICE_TEMPLATE = (name, port, category) => `const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

const data = new Map();

app.get('/api/${category}', (req, res) => {
  res.json({ success: true, data: Array.from(data.values()) });
});

app.post('/api/${category}', (req, res) => {
  const item = { id: \`\${Date.now()}\`, ...req.body, createdAt: new Date() };
  data.set(item.id, item);
  res.status(201).json({ success: true, data: item });
});

app.get('/api/${category}/:id', (req, res) => {
  const item = data.get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, data: item });
});

app.delete('/api/${category}/:id', (req, res) => {
  const deleted = data.delete(req.params.id);
  res.json({ success: deleted });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: '${name}', timestamp: new Date() });
});

const PORT = process.env.PORT || ${port};
app.listen(PORT, () => console.log(\`${name} on \${PORT}\`));
module.exports = app;
`;

const PACKAGE_JSON = (name) => `{
  "name": "${name}",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}`;

const TEST_TEMPLATE = (name, category) => `const request = require('supertest');
const app = require('../index');

describe('${name}', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('should create item', async () => {
    const res = await request(app).post('/api/${category}').send({ name: 'Test' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should list items', async () => {
    const res = await request(app).get('/api/${category}');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});`;

console.log('🚀 Generating all services...\n');

SERVICES.forEach(({ name, port, category }) => {
  const serviceDir = path.join(__dirname, '..', 'services', name);
  const testDir = path.join(serviceDir, '__tests__');
  
  if (!fs.existsSync(serviceDir)) {
    fs.mkdirSync(serviceDir, { recursive: true });
    fs.mkdirSync(testDir, { recursive: true });
    
    fs.writeFileSync(path.join(serviceDir, 'index.js'), SERVICE_TEMPLATE(name, port, category));
    fs.writeFileSync(path.join(serviceDir, 'package.json'), PACKAGE_JSON(name));
    fs.writeFileSync(path.join(testDir, `${name}.test.js`), TEST_TEMPLATE(name, category));
    
    console.log(`✅ Created ${name} (Port ${port})`);
  } else {
    console.log(`⏭️  Skipped ${name} (already exists)`);
  }
});

console.log(`\n🎉 Generated ${SERVICES.length} services!`);
console.log('\nNext steps:');
console.log('1. cd services/<service-name>');
console.log('2. npm install');
console.log('3. npm start');
