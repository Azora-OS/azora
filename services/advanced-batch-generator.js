#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const advancedTemplate = (name, port, category) => {
  const routes = {
    analytics: ['getMetrics', 'getDashboard', 'getReports'],
    communication: ['sendMessage', 'getMessages', 'subscribe'],
    blockchain: ['createTransaction', 'getBalance', 'getHistory'],
    ai: ['predict', 'train', 'evaluate']
  }[category] || ['create', 'getAll', 'getById'];

  return `const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class ${toCamelCase(name)} {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || ${port};
    this.data = new Map();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: '${name}', timestamp: new Date().toISOString(), items: this.data.size });
    });

    ${routes.map(r => `this.app.${r.includes('get') ? 'get' : 'post'}('/api/${name.replace(/-service$/, '')}${r.includes('getById') ? '/:id' : ''}', this.${r}.bind(this));`).join('\n    ')}
  }

  ${routes.map(r => `${r}(req, res) {
    ${r.includes('get') && r.includes('ById') ? `const item = this.data.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);` : r.includes('getAll') ? `res.json({ data: Array.from(this.data.values()), total: this.data.size });` : `const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);`}
  }`).join('\n\n  ')}

  start() {
    this.app.listen(this.port, () => console.log(\`${name} running on port \${this.port}\`));
  }
}

const service = new ${toCamelCase(name)}();
if (require.main === module) service.start();
module.exports = service;
`;
};

function toCamelCase(str) {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('').replace(/Service$/, 'Service');
}

const packageJson = (name, desc) => ({
  name, version: '1.0.0', description: desc, main: 'index.js',
  scripts: { start: 'node index.js', dev: 'nodemon index.js', test: 'jest' },
  dependencies: { express: '^4.18.2', helmet: '^7.1.0', cors: '^2.8.5', compression: '^1.7.4', dotenv: '^16.3.1' },
  devDependencies: { nodemon: '^3.0.2', jest: '^29.7.0' }
});

const services = [
  { name: 'analytics-engine', port: 3059, category: 'analytics', desc: 'Analytics Engine' },
  { name: 'reporting-service', port: 3060, category: 'analytics', desc: 'Reporting Service' },
  { name: 'messaging-service', port: 3061, category: 'communication', desc: 'Messaging Service' },
  { name: 'chat-service', port: 3062, category: 'communication', desc: 'Chat Service' },
  { name: 'blockchain-ledger', port: 3063, category: 'blockchain', desc: 'Blockchain Ledger' },
  { name: 'smart-contract-service', port: 3064, category: 'blockchain', desc: 'Smart Contract Service' },
  { name: 'ml-inference-service', port: 3065, category: 'ai', desc: 'ML Inference Service' },
  { name: 'model-training-service', port: 3066, category: 'ai', desc: 'Model Training Service' },
  { name: 'recommendation-engine', port: 3067, category: 'ai', desc: 'Recommendation Engine' },
  { name: 'search-service', port: 3068, category: 'ai', desc: 'Search Service' }
];

services.forEach(({ name, port, category, desc }) => {
  const dir = path.join(__dirname, name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.js'), advancedTemplate(name, port, category));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(packageJson(name, desc), null, 2));
  console.log(`✅ ${name}`);
});

console.log(`\n🎉 Generated ${services.length} advanced services!`);
