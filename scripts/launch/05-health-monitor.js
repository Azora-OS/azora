#!/usr/bin/env node
/**
 * AZORA SERVICE HEALTH MONITOR
 * 
 * Monitors health of all Azora services and infrastructure
 * 
 * Features:
 * - Service availability checks
 * - Database connection verification
 * - API endpoint testing
 * - Response time monitoring
 * - Detailed health reports
 * 
 * Usage:
 *   npm run health              # Check all services
 *   npm run health -- --service auth  # Check specific service
 *   npm run health -- --watch   # Continuous monitoring
 */

const http = require('http');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ============================================
// SERVICE REGISTRY
// ============================================

const SERVICES = [
    {
        name: 'Auth Service',
        url: 'http://localhost:4000/health',
        critical: true,
        endpoints: [
            { path: '/auth/login', method: 'POST' },
            { path: '/auth/register', method: 'POST' }
        ]
    },
    {
        name: 'Education Service',
        url: 'http://localhost:4002/health',
        critical: true,
        endpoints: [
            { path: '/courses', method: 'GET' },
            { path: '/enrollments', method: 'GET' }
        ]
    },
    {
        name: 'Azora Mint',
        url: 'http://localhost:4003/health',
        critical: true,
        endpoints: [
            { path: '/wallets', method: 'GET' },
            { path: '/transactions', method: 'GET' }
        ]
    },
    {
        name: 'Azora Forge',
        url: 'http://localhost:4004/health',
        critical: false,
        endpoints: [
            { path: '/jobs', method: 'GET' }
        ]
    },
    {
        name: 'AI Orchestrator',
        url: 'http://localhost:4005/health',
        critical: true,
        endpoints: [
            { path: '/chat', method: 'POST' }
        ]
    },
    {
        name: 'Azora Sapiens',
        url: 'http://localhost:4006/health',
        critical: true,
        endpoints: [
            { path: '/tutoring', method: 'POST' }
        ]
    },
    {
        name: 'AI Family Service',
        url: 'http://localhost:4007/health',
        critical: false,
        endpoints: [
            { path: '/family', method: 'GET' }
        ]
    }
];

// ============================================
// HEALTH CHECK FUNCTIONS
// ============================================

/**
 * Check if a URL is reachable
 */
function checkUrl(url, timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        const req = client.get(url, { timeout }, (res) => {
            const responseTime = Date.now() - startTime;

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: 'healthy',
                    statusCode: res.statusCode,
                    responseTime,
                    data: data ? JSON.parse(data) : null
                });
            });
        });

        req.on('error', (error) => {
            resolve({
                status: 'unhealthy',
                error: error.message,
                responseTime: Date.now() - startTime
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                status: 'timeout',
                error: 'Request timeout',
                responseTime: timeout
            });
        });
    });
}

/**
 * Check database connection
 */
async function checkDatabase() {
    try {
        const startTime = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const responseTime = Date.now() - startTime;

        // Get database stats
        const userCount = await prisma.user.count();
        const courseCount = await prisma.course.count();
        const enrollmentCount = await prisma.enrollment.count();

        return {
            status: 'healthy',
            responseTime,
            stats: {
                users: userCount,
                courses: courseCount,
                enrollments: enrollmentCount
            }
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}

/**
 * Check all services
 */
async function checkAllServices() {
    console.log('🏥 Azora Health Monitor\n');
    console.log('Checking all services...\n');

    const results = {
        timestamp: new Date().toISOString(),
        services: [],
        database: null,
        summary: {
            total: SERVICES.length,
            healthy: 0,
            unhealthy: 0,
            critical: 0
        }
    };

    // Check database
    console.log('📊 Database Connection...');
    results.database = await checkDatabase();

    if (results.database.status === 'healthy') {
        console.log(`✅ Database: Healthy (${results.database.responseTime}ms)`);
        console.log(`   Users: ${results.database.stats.users}`);
        console.log(`   Courses: ${results.database.stats.courses}`);
        console.log(`   Enrollments: ${results.database.stats.enrollments}`);
    } else {
        console.log(`❌ Database: Unhealthy - ${results.database.error}`);
    }

    console.log('\n🔧 Services:\n');

    // Check each service
    for (const service of SERVICES) {
        const result = await checkUrl(service.url);

        const serviceResult = {
            name: service.name,
            critical: service.critical,
            ...result
        };

        results.services.push(serviceResult);

        // Update summary
        if (result.status === 'healthy') {
            results.summary.healthy++;
            console.log(`✅ ${service.name}: Healthy (${result.responseTime}ms)`);
        } else {
            results.summary.unhealthy++;
            if (service.critical) {
                results.summary.critical++;
            }
            console.log(`❌ ${service.name}: ${result.status} - ${result.error || 'Unknown error'}`);
        }
    }

    // Print summary
    console.log('\n📈 Summary:');
    console.log(`   Total Services: ${results.summary.total}`);
    console.log(`   Healthy: ${results.summary.healthy}`);
    console.log(`   Unhealthy: ${results.summary.unhealthy}`);
    console.log(`   Critical Issues: ${results.summary.critical}`);

    // Overall status
    const overallHealthy = results.summary.critical === 0 && results.database.status === 'healthy';
    console.log(`\n${overallHealthy ? '✅' : '❌'} Overall Status: ${overallHealthy ? 'HEALTHY' : 'DEGRADED'}`);

    // Save report
    const reportPath = path.join(__dirname, '../../.health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);

    return results;
}

/**
 * Watch mode - continuous monitoring
 */
async function watchMode() {
    console.log('👀 Starting continuous health monitoring...\n');
    console.log('Press Ctrl+C to stop\n');

    while (true) {
        await checkAllServices();
        console.log('\n⏳ Waiting 30 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 30000));
    }
}

/**
 * Check specific service
 */
async function checkService(serviceName) {
    const service = SERVICES.find(s =>
        s.name.toLowerCase().includes(serviceName.toLowerCase())
    );

    if (!service) {
        console.log(`❌ Service not found: ${serviceName}`);
        console.log('\nAvailable services:');
        SERVICES.forEach(s => console.log(`   - ${s.name}`));
        return;
    }

    console.log(`🔍 Checking ${service.name}...\n`);

    const result = await checkUrl(service.url);

    if (result.status === 'healthy') {
        console.log(`✅ ${service.name}: Healthy`);
        console.log(`   Response Time: ${result.responseTime}ms`);
        console.log(`   Status Code: ${result.statusCode}`);
        if (result.data) {
            console.log(`   Data:`, result.data);
        }
    } else {
        console.log(`❌ ${service.name}: ${result.status}`);
        console.log(`   Error: ${result.error}`);
    }
}

// ============================================
// CLI
// ============================================

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--watch')) {
        await watchMode();
    } else if (args.includes('--service')) {
        const serviceIndex = args.indexOf('--service');
        const serviceName = args[serviceIndex + 1];
        await checkService(serviceName);
    } else {
        await checkAllServices();
    }
}

// Run
main()
    .catch((e) => {
        console.error('❌ Health check failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
