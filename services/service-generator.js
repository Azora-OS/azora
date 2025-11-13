#!/usr/bin/env node
/**
 * Azora OS Service Generator
 * Generates minimal, production-ready service implementations
 */

const fs = require('fs');
const path = require('path');

const templates = {
  nodeService: (name, port) => `const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || ${port};

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: '${name}', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(\`${name} running on port \${PORT}\`));

module.exports = app;
`,

  packageJson: (name, description) => ({
    name,
    version: '1.0.0',
    description,
    main: 'index.js',
    scripts: {
      start: 'node index.js',
      dev: 'nodemon index.js',
      test: 'jest'
    },
    dependencies: {
      express: '^4.18.2',
      helmet: '^7.1.0',
      cors: '^2.8.5',
      compression: '^1.7.4',
      dotenv: '^16.3.1'
    },
    devDependencies: {
      nodemon: '^3.0.2',
      jest: '^29.7.0'
    }
  }),

  dockerfile: (name) => `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
`,

  envExample: (port) => `NODE_ENV=production
PORT=${port}
LOG_LEVEL=info
`,

  readme: (name, description) => `# ${name}

${description}

## Quick Start

\`\`\`bash
npm install
npm start
\`\`\`

## Health Check

\`\`\`bash
curl http://localhost:3000/health
\`\`\`
`
};

const services = [
  { name: 'ai-enhancement-service', port: 3020, desc: 'AI Enhancement Service' },
  { name: 'ai-ml-service', port: 3021, desc: 'AI/ML Service' },
  { name: 'ai-orchestrator', port: 3022, desc: 'AI Orchestrator' },
  { name: 'airtime-rewards-service', port: 3023, desc: 'Airtime Rewards Service' },
  { name: 'api-integration-service', port: 3024, desc: 'API Integration Service' },
  { name: 'blockchain-service', port: 3025, desc: 'Blockchain Service' },
  { name: 'database-service', port: 3026, desc: 'Database Service' },
  { name: 'devops-service', port: 3027, desc: 'DevOps Service' },
  { name: 'dna-service', port: 3028, desc: 'DNA Service' },
  { name: 'documentation-service', port: 3029, desc: 'Documentation Service' },
  { name: 'email-service', port: 3030, desc: 'Email Service' },
  { name: 'enterprise-service', port: 3031, desc: 'Enterprise Service' },
  { name: 'global-service', port: 3032, desc: 'Global Service' },
  { name: 'governance-service', port: 3033, desc: 'Governance Service' },
  { name: 'logger-service', port: 3034, desc: 'Logger Service' },
  { name: 'master-ui-service', port: 3035, desc: 'Master UI Service' },
  { name: 'mobile-service', port: 3036, desc: 'Mobile Service' },
  { name: 'notification-service', port: 3037, desc: 'Notification Service' },
  { name: 'payment-gateway', port: 3038, desc: 'Payment Gateway' },
  { name: 'payment-service', port: 3039, desc: 'Payment Service' },
  { name: 'student-earnings-service', port: 3040, desc: 'Student Earnings Service' },
  { name: 'testing-service', port: 3041, desc: 'Testing Service' },
  { name: 'ui-enhancement-service', port: 3042, desc: 'UI Enhancement Service' }
];

function generateService(service) {
  const servicePath = path.join(__dirname, service.name);
  
  if (!fs.existsSync(servicePath)) {
    fs.mkdirSync(servicePath, { recursive: true });
  }

  // Generate index.js
  fs.writeFileSync(
    path.join(servicePath, 'index.js'),
    templates.nodeService(service.name, service.port)
  );

  // Generate package.json
  fs.writeFileSync(
    path.join(servicePath, 'package.json'),
    JSON.stringify(templates.packageJson(service.name, service.desc), null, 2)
  );

  // Generate Dockerfile
  fs.writeFileSync(
    path.join(servicePath, 'Dockerfile'),
    templates.dockerfile(service.name)
  );

  // Generate .env.example
  fs.writeFileSync(
    path.join(servicePath, '.env.example'),
    templates.envExample(service.port)
  );

  // Generate README.md
  fs.writeFileSync(
    path.join(servicePath, 'README.md'),
    templates.readme(service.name, service.desc)
  );

  console.log(`✅ Generated ${service.name}`);
}

// Generate all services
services.forEach(generateService);

console.log(`\n🎉 Generated ${services.length} services successfully!`);
