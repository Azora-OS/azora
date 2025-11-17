import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: ValidationResult[] = [];

function validateEnvVar(name: string, required: boolean = true): void {
  const value = process.env[name];
  if (!value && required) {
    results.push({
      name: `Environment Variable: ${name}`,
      passed: false,
      message: `Required environment variable ${name} not set`
    });
  } else if (value) {
    results.push({
      name: `Environment Variable: ${name}`,
      passed: true,
      message: `${name} is set`
    });
  }
}

function validateFile(filePath: string, description: string): void {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    results.push({
      name: `File: ${description}`,
      passed: true,
      message: `${filePath} exists`
    });
  } else {
    results.push({
      name: `File: ${description}`,
      passed: false,
      message: `${filePath} not found`
    });
  }
}

function validateDirectory(dirPath: string, description: string): void {
  const fullPath = path.resolve(dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    results.push({
      name: `Directory: ${description}`,
      passed: true,
      message: `${dirPath} exists`
    });
  } else {
    results.push({
      name: `Directory: ${description}`,
      passed: false,
      message: `${dirPath} not found or not a directory`
    });
  }
}

function validatePort(port: number, description: string): void {
  const net = require('net');
  const server = net.createServer();

  server.once('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      results.push({
        name: `Port: ${description}`,
        passed: false,
        message: `Port ${port} is already in use`
      });
    } else {
      results.push({
        name: `Port: ${description}`,
        passed: false,
        message: `Error checking port ${port}: ${err.message}`
      });
    }
    server.close();
  });

  server.once('listening', () => {
    results.push({
      name: `Port: ${description}`,
      passed: true,
      message: `Port ${port} is available`
    });
    server.close();
  });

  server.listen(port, '127.0.0.1');
}

async function validateProduction(): Promise<void> {
  console.log('🔍 Validating Production Environment\n');

  // Required environment variables
  console.log('Checking environment variables...');
  validateEnvVar('NODE_ENV');
  validateEnvVar('DATABASE_URL');
  validateEnvVar('REDIS_URL');
  validateEnvVar('PINECONE_API_KEY');
  validateEnvVar('OPENAI_API_KEY');
  validateEnvVar('STRIPE_API_KEY');
  validateEnvVar('JWT_SECRET');
  validateEnvVar('API_PORT');
  validateEnvVar('LOG_LEVEL');

  // Optional but recommended
  validateEnvVar('SENTRY_DSN', false);
  validateEnvVar('DATADOG_API_KEY', false);

  // Required files
  console.log('\nChecking required files...');
  validateFile('.env.production', 'Production environment file');
  validateFile('package.json', 'Package configuration');
  validateFile('tsconfig.json', 'TypeScript configuration');

  // Required directories
  console.log('\nChecking required directories...');
  validateDirectory('services', 'Services directory');
  validateDirectory('infrastructure', 'Infrastructure directory');
  validateDirectory('tests', 'Tests directory');
  validateDirectory('docs', 'Documentation directory');

  // Database validation
  console.log('\nValidating database configuration...');
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
      results.push({
        name: 'Database: Production URL',
        passed: false,
        message: 'DATABASE_URL points to localhost (should be production server)'
      });
    } else {
      results.push({
        name: 'Database: Production URL',
        passed: true,
        message: 'DATABASE_URL points to production server'
      });
    }
  }

  // Redis validation
  console.log('\nValidating Redis configuration...');
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    if (redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1')) {
      results.push({
        name: 'Redis: Production URL',
        passed: false,
        message: 'REDIS_URL points to localhost (should be production cluster)'
      });
    } else {
      results.push({
        name: 'Redis: Production URL',
        passed: true,
        message: 'REDIS_URL points to production cluster'
      });
    }
  }

  // SSL/TLS validation
  console.log('\nValidating SSL/TLS configuration...');
  validateFile('/etc/nginx/ssl/cert.pem', 'SSL Certificate');
  validateFile('/etc/nginx/ssl/key.pem', 'SSL Private Key');

  // Ports validation
  console.log('\nValidating ports...');
  validatePort(3000, 'API Gateway');
  validatePort(5432, 'PostgreSQL');
  validatePort(6379, 'Redis');
  validatePort(9090, 'Prometheus');
  validatePort(3001, 'Grafana');

  // Node version
  console.log('\nValidating Node.js version...');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  if (majorVersion >= 16) {
    results.push({
      name: 'Node.js Version',
      passed: true,
      message: `Node.js ${nodeVersion} (>= 16 required)`
    });
  } else {
    results.push({
      name: 'Node.js Version',
      passed: false,
      message: `Node.js ${nodeVersion} (>= 16 required)`
    });
  }

  // Report
  console.log('\n📊 Validation Results\n');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(r => {
    const icon = r.passed ? '✓' : '✗';
    console.log(`${icon} ${r.name}: ${r.message}`);
  });

  console.log(`\nPassed: ${passed}/${total}`);

  if (passed < total) {
    console.log('\n❌ Production environment validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ Production environment is valid!');
    process.exit(0);
  }
}

validateProduction().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});
