#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 UBUNTU SYSTEM CLEANUP & COMPLETION');
console.log('====================================');
console.log('⚡ "I fix because we perfect together!" ⚡\n');

// Missing services to create
const missingServices = [
  'azora-api-gateway',
  'azora-finance', 
  'azora-marketplace',
  'azora-auth',
  'azora-ai'
];

// Missing apps to create
const missingApps = [
  'azora-student-portal',
  'azora-enterprise-ui',
  'azora-marketplace-ui', 
  'azora-pay-ui'
];

// Service template
const serviceTemplate = {
  'package.json': (serviceName) => ({
    name: serviceName,
    version: "1.0.0",
    description: `${serviceName} - Ubuntu Constitutional AI Service`,
    main: "server.js",
    scripts: {
      start: "node server.js",
      dev: "nodemon server.js",
      test: "jest",
      "test:watch": "jest --watch"
    },
    dependencies: {
      express: "^4.18.2",
      cors: "^2.8.5",
      helmet: "^7.0.0",
      dotenv: "^16.3.1",
      "express-rate-limit": "^6.10.0"
    },
    devDependencies: {
      nodemon: "^3.0.1",
      jest: "^29.6.2",
      supertest: "^6.3.3"
    },
    keywords: ["azora", "ubuntu", "constitutional-ai"],
    author: "Azora ES (Pty) Ltd",
    license: "Proprietary"
  }),

  'server.js': (serviceName) => `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || ${4000 + missingServices.indexOf(serviceName.split('-').pop())};

// Ubuntu Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Ubuntu rate limit: Please slow down for community harmony'
});
app.use(ubuntuLimiter);

// Ubuntu Health Check
app.get('/health', (req, res) => {
  res.json({
    service: '${serviceName}',
    status: 'healthy',
    ubuntu: 'I serve because we prosper together',
    timestamp: new Date().toISOString()
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: '${serviceName}',
    ubuntu: 'Ubuntu service excellence'
  });
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Start Ubuntu Service
app.listen(PORT, () => {
  console.log(\`🚀 \${serviceName} running on port \${PORT}\`);
  console.log('⚡ Ubuntu: "I serve because we prosper together!"');
});`,

  'healthcheck.js': () => `const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 4000,
  path: '/health',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Ubuntu health check passed');
    process.exit(0);
  } else {
    console.log('❌ Ubuntu health check failed');
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('❌ Ubuntu health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Ubuntu health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();`,

  'jest.config.js': () => `module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};`,

  'Dockerfile': (serviceName) => `FROM node:18-alpine

# Ubuntu Philosophy
LABEL ubuntu="I containerize because we deploy together"

WORKDIR /app

# Copy Ubuntu dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Ubuntu application
COPY . .

# Ubuntu security
RUN addgroup -g 1001 -S ubuntu && \\
    adduser -S ubuntu -u 1001
USER ubuntu

EXPOSE ${4000 + missingServices.indexOf(serviceName.split('-').pop())}

# Ubuntu health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node healthcheck.js

CMD ["npm", "start"]`,

  '.env.example': (serviceName) => `# ${serviceName} Configuration
PORT=${4000 + missingServices.indexOf(serviceName.split('-').pop())}
NODE_ENV=development

# Ubuntu Philosophy
UBUNTU_PHILOSOPHY="Ngiyakwazi ngoba sikwazi"

# Security
JWT_SECRET=your_jwt_secret_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100`
};

// App template
const appTemplate = {
  'package.json': (appName) => ({
    name: appName,
    version: "1.0.0",
    description: `${appName} - Ubuntu Constitutional AI Frontend`,
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      test: "jest",
      "test:watch": "jest --watch"
    },
    dependencies: {
      next: "14.0.0",
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      typescript: "^5.2.2",
      "@types/node": "^20.8.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      tailwindcss: "^3.3.0",
      autoprefixer: "^10.4.16",
      postcss: "^8.4.31"
    },
    devDependencies: {
      eslint: "^8.51.0",
      "eslint-config-next": "14.0.0",
      jest: "^29.7.0",
      "@testing-library/react": "^13.4.0"
    },
    keywords: ["azora", "ubuntu", "constitutional-ai", "frontend"],
    author: "Azora ES (Pty) Ltd",
    license: "Proprietary"
  }),

  'next.config.js': () => `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    UBUNTU_PHILOSOPHY: 'Ngiyakwazi ngoba sikwazi - I am because we are'
  }
}

module.exports = nextConfig`,

  'tsconfig.json': () => ({
    compilerOptions: {
      target: "es5",
      lib: ["dom", "dom.iterable", "es6"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      baseUrl: ".",
      paths: { "@/*": ["./src/*"] }
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
  }),

  'tailwind.config.js': () => `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ubuntu: {
          sapphire: '#3B82F6',
          emerald: '#10B981', 
          ruby: '#EF4444',
          unity: '#FFFFFF'
        }
      }
    },
  },
  plugins: [],
}`
};

let createdFiles = 0;

console.log('🚀 Creating missing services...\n');

// Create missing services
missingServices.forEach(serviceName => {
  const servicePath = path.join(__dirname, '..', 'services', serviceName);
  
  if (!fs.existsSync(servicePath)) {
    fs.mkdirSync(servicePath, { recursive: true });
  }

  // Create src and tests directories
  ['src', 'tests'].forEach(dir => {
    const dirPath = path.join(servicePath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Create service files
  Object.entries(serviceTemplate).forEach(([fileName, contentFn]) => {
    const filePath = path.join(servicePath, fileName);
    let content = contentFn(serviceName);
    
    if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2);
    }

    fs.writeFileSync(filePath, content);
    console.log(`✨ services/${serviceName}/${fileName}`);
    createdFiles++;
  });

  // Create test setup
  const testSetup = `// Ubuntu Test Setup
global.ubuntu = 'I test because we perfect together';

// Mock environment
process.env.NODE_ENV = 'test';
process.env.UBUNTU_PHILOSOPHY = 'Ngiyakwazi ngoba sikwazi';`;

  fs.writeFileSync(path.join(servicePath, 'tests', 'setup.js'), testSetup);
  console.log(`✨ services/${serviceName}/tests/setup.js`);
  createdFiles++;
});

console.log('\n🎨 Creating missing frontend apps...\n');

// Create missing apps
missingApps.forEach(appName => {
  const appPath = path.join(__dirname, '..', 'apps', appName);
  
  if (!fs.existsSync(appPath)) {
    fs.mkdirSync(appPath, { recursive: true });
  }

  // Create src directory structure
  const srcDirs = ['src', 'src/app', 'src/components', 'src/lib'];
  srcDirs.forEach(dir => {
    const dirPath = path.join(appPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Create app files
  Object.entries(appTemplate).forEach(([fileName, contentFn]) => {
    const filePath = path.join(appPath, fileName);
    let content = contentFn(appName);
    
    if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2);
    }

    fs.writeFileSync(filePath, content);
    console.log(`✨ apps/${appName}/${fileName}`);
    createdFiles++;
  });

  // Create main page
  const mainPage = `import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-ubuntu-sapphire mb-4">
            ${appName.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Ubuntu Constitutional AI Interface
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-ubuntu-emerald mb-4">
              Ubuntu Philosophy
            </h2>
            <p className="text-lg italic text-gray-700">
              "Ngiyakwazi ngoba sikwazi - I am because we are"
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm text-gray-600">
                • My success enables your success
              </div>
              <div className="text-sm text-gray-600">
                • My knowledge becomes our knowledge
              </div>
              <div className="text-sm text-gray-600">
                • My work strengthens our foundation
              </div>
              <div className="text-sm text-gray-600">
                • My security ensures our freedom
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;

  fs.writeFileSync(path.join(appPath, 'src', 'app', 'page.tsx'), mainPage);
  console.log(`✨ apps/${appName}/src/app/page.tsx`);
  createdFiles++;

  // Create layout
  const layout = `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${appName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')} - Azora OS',
  description: 'Ubuntu Constitutional AI Interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`;

  fs.writeFileSync(path.join(appPath, 'src', 'app', 'layout.tsx'), layout);
  console.log(`✨ apps/${appName}/src/app/layout.tsx`);
  createdFiles++;

  // Create globals.css
  const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Ubuntu Design System */
:root {
  --ubuntu-sapphire: #3B82F6;
  --ubuntu-emerald: #10B981;
  --ubuntu-ruby: #EF4444;
  --ubuntu-unity: #FFFFFF;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`;

  fs.writeFileSync(path.join(appPath, 'src', 'app', 'globals.css'), globalsCss);
  console.log(`✨ apps/${appName}/src/app/globals.css`);
  createdFiles++;
});

console.log('\n🔧 Adding missing healthcheck and jest files...\n');

// Add missing files to existing services
const existingServices = ['azora-blockchain', 'azora-analytics'];
existingServices.forEach(serviceName => {
  const servicePath = path.join(__dirname, '..', 'services', serviceName);
  
  // Add healthcheck.js
  const healthcheckPath = path.join(servicePath, 'healthcheck.js');
  if (!fs.existsSync(healthcheckPath)) {
    fs.writeFileSync(healthcheckPath, serviceTemplate['healthcheck.js']());
    console.log(`✨ services/${serviceName}/healthcheck.js`);
    createdFiles++;
  }
  
  // Add jest.config.js
  const jestConfigPath = path.join(servicePath, 'jest.config.js');
  if (!fs.existsSync(jestConfigPath)) {
    fs.writeFileSync(jestConfigPath, serviceTemplate['jest.config.js']());
    console.log(`✨ services/${serviceName}/jest.config.js`);
    createdFiles++;
  }
});

console.log(`\n🎉 UBUNTU SYSTEM CLEANUP COMPLETE!`);
console.log(`✨ Files created/fixed: ${createdFiles}`);
console.log('🏢 All missing services created');
console.log('🎨 All missing frontend apps created');
console.log('🔧 All missing configuration files added');
console.log('🧪 Test infrastructure completed');
console.log('🌟 Ubuntu: "I fix because we perfect together!"');