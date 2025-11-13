#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const serviceTemplate = (name, port, description) => `const express = require('express');
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
      res.json({ status: 'healthy', service: '${name}', timestamp: new Date().toISOString() });
    });

    this.app.get('/api/${name.replace(/-service$/, '')}', this.getAll.bind(this));
    this.app.post('/api/${name.replace(/-service$/, '')}', this.create.bind(this));
    this.app.get('/api/${name.replace(/-service$/, '')}/:id', this.getById.bind(this));
    this.app.put('/api/${name.replace(/-service$/, '')}/:id', this.update.bind(this));
    this.app.delete('/api/${name.replace(/-service$/, '')}/:id', this.delete.bind(this));
  }

  getAll(req, res) {
    res.json({ data: Array.from(this.data.values()) });
  }

  create(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  getById(req, res) {
    const item = this.data.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  }

  update(req, res) {
    const item = this.data.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    Object.assign(item, req.body, { updatedAt: new Date() });
    res.json(item);
  }

  delete(req, res) {
    if (!this.data.has(req.params.id)) return res.status(404).json({ error: 'Not found' });
    this.data.delete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  }

  start() {
    this.app.listen(this.port, () => console.log(\`${description} running on port \${this.port}\`));
  }
}

const service = new ${toCamelCase(name)}();
if (require.main === module) service.start();
module.exports = service;
`;

const packageTemplate = (name, description) => ({
  name,
  version: '1.0.0',
  description,
  main: 'index.js',
  scripts: { start: 'node index.js', dev: 'nodemon index.js', test: 'jest' },
  dependencies: {
    express: '^4.18.2',
    helmet: '^7.1.0',
    cors: '^2.8.5',
    compression: '^1.7.4',
    dotenv: '^16.3.1'
  },
  devDependencies: { nodemon: '^3.0.2', jest: '^29.7.0' }
});

function toCamelCase(str) {
  return str.split('-').map((w, i) => 
    i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1)
  ).join('').replace(/Service$/, 'Service');
}

const services = [
  { name: 'audit-logging-service', port: 3045, desc: 'Audit Logging Service' },
  { name: 'token-exchange', port: 3046, desc: 'Token Exchange Service' },
  { name: 'swarm-coordination', port: 3047, desc: 'Swarm Coordination Service' },
  { name: 'quantum-tracking', port: 3048, desc: 'Quantum Tracking Service' },
  { name: 'tamper-proof-data-service', port: 3049, desc: 'Tamper Proof Data Service' },
  { name: 'decentralized-banking', port: 3050, desc: 'Decentralized Banking Service' },
  { name: 'ai-evolution-engine', port: 3051, desc: 'AI Evolution Engine' },
  { name: 'ai-system-monitor', port: 3052, desc: 'AI System Monitor' },
  { name: 'azora-coin-service', port: 3053, desc: 'Azora Coin Service' },
  { name: 'founder-ledger-service', port: 3054, desc: 'Founder Ledger Service' }
];

services.forEach(({ name, port, desc }) => {
  const dir = path.join(__dirname, name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  fs.writeFileSync(path.join(dir, 'index.js'), serviceTemplate(name, port, desc));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(packageTemplate(name, desc), null, 2));
  
  console.log(`✅ ${name}`);
});

console.log(`\n🎉 Generated ${services.length} services!`);
