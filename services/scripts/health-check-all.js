#!/usr/bin/env node

/**
 * Health Check Script for All Azora Services
 * Checks the health of all implemented agent services
 */

const http = require('http');

// Service Configuration
const SERVICES = [
  {
    name: 'AI Family Service',
    url: 'http://localhost:4010/health',
    description: '11 AI personalities with relationships',
    agent: 'Agent 1'
  },
  {
    name: 'Azora Sapiens',
    url: 'http://localhost:4011/health', 
    description: 'AI tutoring and personalized learning',
    agent: 'Agent 2'
  },
  {
    name: 'Azora Mint',
    url: 'http://localhost:4012/health',
    description: 'Proof-of-Knowledge mining and tokens',
    agent: 'Agent 3'
  },
  {
    name: 'Azora Forge',
    url: 'http://localhost:4013/health',
    description: 'AI job matching and skills marketplace',
    agent: 'Agent 4'
  },
  {
    name: 'Azora LMS',
    url: 'http://localhost:4015/health',
    description: 'Learning management system',
    agent: 'Agent 5'
  },
  {
    name: 'Azora Nexus',
    url: 'http://localhost:4016/health',
    description: 'Event bus and service orchestration',
    agent: 'Agent 6'
  },
  {
    name: 'Analytics Service',
    url: 'http://localhost:4017/health',
    description: 'Real-time analytics and monitoring',
    agent: 'Agent 7'
  },
  {
    name: 'Azora Aegis',
    url: 'http://localhost:4018/health',
    description: 'Security framework and compliance',
    agent: 'Agent 8'
  },
  {
    name: 'Master UI Service',
    url: 'http://localhost:4019/health',
    description: 'UI template deployment system',
    agent: 'Agent 9'
  },
  {
    name: 'Mobile Service',
    url: 'http://localhost:4020/health',
    description: 'Mobile app development and deployment',
    agent: 'Agent 10'
  },
  {
    name: 'API Integration',
    url: 'http://localhost:4021/health',
    description: 'Frontend-backend API integration',
    agent: 'Agent 11'
  },
  {
    name: 'Database Service',
    url: 'http://localhost:4022/health',
    description: 'Database schemas and migrations',
    agent: 'Agent 13'
  },
  {
    name: 'DevOps Service',
    url: 'http://localhost:4024/health',
    description: 'CI/CD pipelines and deployment',
    agent: 'Agent 14'
  },
  {
    name: 'Testing Service',
    url: 'http://localhost:4023/health',
    description: 'Automated testing and quality assurance',
    agent: 'Agent 15'
  },
  {
    name: 'UI Enhancement Service',
    url: 'http://localhost:4025/health',
    description: 'Advanced UI features and accessibility',
    agent: 'Agent 12'
  },
  {
    name: 'Documentation Service',
    url: 'http://localhost:4026/health',
    description: 'Technical documentation and guides',
    agent: 'Agent 16'
  },
  {
    name: 'Blockchain Service',
    url: 'http://localhost:4027/health',
    description: 'Smart contracts, NFTs, and DeFi',
    agent: 'Agent 17'
  },
  {
    name: 'AI/ML Service',
    url: 'http://localhost:4028/health',
    description: 'Machine learning and predictions',
    agent: 'Agent 18'
  },
  {
    name: 'Enterprise Service',
    url: 'http://localhost:4029/health',
    description: 'Enterprise features and compliance',
    agent: 'Agent 19'
  },
  {
    name: 'Global Service',
    url: 'http://localhost:4030/health',
    description: 'Internationalization and multi-region',
    agent: 'Agent 20'
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Health check function
async function checkServiceHealth(service) {
  return new Promise((resolve) => {
    const url = new URL(service.url);
    const startTime = Date.now();
    
    const req = http.get(service.url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        try {
          const healthData = JSON.parse(data);
          resolve({
            ...service,
            status: res.statusCode === 200 ? 'healthy' : 'unhealthy',
            statusCode: res.statusCode,
            responseTime,
            data: healthData,
            error: null
          });
        } catch (error) {
          resolve({
            ...service,
            status: 'unhealthy',
            statusCode: res.statusCode,
            responseTime,
            data: null,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      resolve({
        ...service,
        status: 'down',
        statusCode: null,
        responseTime,
        data: null,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        ...service,
        status: 'timeout',
        statusCode: null,
        responseTime: 5000,
        data: null,
        error: 'Request timeout'
      });
    });
  });
}

// Format status with colors
function formatStatus(status) {
  switch (status) {
    case 'healthy':
      return `${colors.green}✅ HEALTHY${colors.reset}`;
    case 'unhealthy':
      return `${colors.yellow}⚠️  UNHEALTHY${colors.reset}`;
    case 'down':
      return `${colors.red}❌ DOWN${colors.reset}`;
    case 'timeout':
      return `${colors.red}⏰ TIMEOUT${colors.reset}`;
    default:
      return `${colors.red}❓ UNKNOWN${colors.reset}`;
  }
}

// Main health check function
async function runHealthCheck() {
  console.log(`${colors.bright}${colors.cyan}🤖 AZORA OS - SERVICE HEALTH CHECK${colors.reset}`);
  console.log(`${colors.bright}Ubuntu Philosophy: "I am because we are"${colors.reset}\n`);
  
  const results = [];
  
  for (const service of SERVICES) {
    console.log(`Checking ${service.name} (${service.agent})...`);
    const result = await checkServiceHealth(service);
    results.push(result);
    
    console.log(`  Status: ${formatStatus(result.status)}`);
    console.log(`  Response Time: ${result.responseTime}ms`);
    
    if (result.data) {
      console.log(`  Service: ${result.data.service || 'Unknown'}`);
    }
    
    if (result.error) {
      console.log(`  Error: ${colors.red}${result.error}${colors.reset}`);
    }
    
    console.log('');
  }
  
  // Summary
  const healthyCount = results.filter(r => r.status === 'healthy').length;
  const totalCount = results.length;
  
  console.log(`${colors.bright}SUMMARY:${colors.reset}`);
  console.log(`Healthy: ${colors.green}${healthyCount}/${totalCount}${colors.reset}`);
  console.log(`Success Rate: ${Math.round((healthyCount / totalCount) * 100)}%`);
  console.log(`Agents Implemented: ${totalCount}/20 (${Math.round((totalCount/20)*100)}%)`);
  
  if (healthyCount === totalCount) {
    console.log(`${colors.green}🎉 All ${totalCount} services are healthy!${colors.reset}`);
    console.log(`${colors.green}🚀 Ready for production deployment!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}🔧 ${totalCount - healthyCount} services need attention.${colors.reset}`);
  }
  
  process.exit(healthyCount === totalCount ? 0 : 1);
}

runHealthCheck().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});