#!/usr/bin/env node
/**
 * AZORA INTEGRATION TESTS
 * 
 * End-to-end integration tests for Azora ecosystem
 * 
 * Tests:
 * - User authentication flow
 * - Course enrollment flow
 * - Token mining flow
 * - AI chat flow
 * - Payment flow
 * 
 * Usage:
 *   npm run test:integration
 */

const http = require('http');

// ============================================
// TEST UTILITIES
// ============================================

let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

async function makeRequest(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : null;
                    resolve({ statusCode: res.statusCode, data: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data, headers: res.headers });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

async function runTest(name, testFn) {
    process.stdout.write(`  ${name}... `);

    try {
        await testFn();
        console.log('✅');
        testsPassed++;
    } catch (error) {
        console.log(`❌ ${error.message}`);
        testsFailed++;
        failedTests.push({ name, error: error.message });
    }
}

// ============================================
// TEST SUITES
// ============================================

/**
 * Test authentication flow
 */
async function testAuthFlow() {
    console.log('\n🔐 Authentication Tests:');

    let authToken = null;

    await runTest('Register new user', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4000,
            path: '/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: `test${Date.now()}@azora.world`,
            password: 'Test123!',
            name: 'Test User'
        });

        assert(response.statusCode === 201 || response.statusCode === 200,
            `Expected 201/200, got ${response.statusCode}`);
        assert(response.data && response.data.user, 'No user in response');
    });

    await runTest('Login with credentials', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4000,
            path: '/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            email: 'admin@azora.world',
            password: 'Azora2025!'
        });

        assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
        assert(response.data && response.data.token, 'No token in response');
        authToken = response.data.token;
    });

    await runTest('Access protected route', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4000,
            path: '/auth/me',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
        assert(response.data && response.data.email, 'No user data in response');
    });

    return authToken;
}

/**
 * Test education flow
 */
async function testEducationFlow(authToken) {
    console.log('\n📚 Education Tests:');

    let courseId = null;

    await runTest('Get all courses', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4002,
            path: '/courses',
            method: 'GET'
        });

        assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
        assert(Array.isArray(response.data), 'Response is not an array');
        assert(response.data.length > 0, 'No courses found');
        courseId = response.data[0].id;
    });

    await runTest('Get course details', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4002,
            path: `/courses/${courseId}`,
            method: 'GET'
        });

        assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
        assert(response.data && response.data.id === courseId, 'Course ID mismatch');
    });

    await runTest('Enroll in course', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4002,
            path: '/enrollments',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }, {
            courseId
        });

        assert(response.statusCode === 201 || response.statusCode === 200 || response.statusCode === 409,
            `Expected 201/200/409, got ${response.statusCode}`);
    });

    await runTest('Get my enrollments', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4002,
            path: '/enrollments/my',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
        assert(Array.isArray(response.data), 'Response is not an array');
    });
}

/**
 * Test wallet/token flow
 */
async function testWalletFlow(authToken) {
    console.log('\n💰 Wallet Tests:');

    await runTest('Get my wallet', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4003,
            path: '/wallets/my',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
        assert(response.data && typeof response.data.balance !== 'undefined', 'No balance in response');
    });

    await runTest('Get transaction history', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4003,
            path: '/transactions/my',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
        assert(Array.isArray(response.data), 'Response is not an array');
    });
}

/**
 * Test AI flow
 */
async function testAIFlow(authToken) {
    console.log('\n🤖 AI Tests:');

    await runTest('Chat with ELARA', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4005,
            path: '/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        }, {
            message: 'What is 2 + 2?',
            agent: 'ELARA'
        });

        assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
        assert(response.data && response.data.response, 'No response from AI');
    });

    await runTest('Get AI family members', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4007,
            path: '/family',
            method: 'GET'
        });

        assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
        assert(Array.isArray(response.data), 'Response is not an array');
    });
}

/**
 * Test marketplace flow
 */
async function testMarketplaceFlow(authToken) {
    console.log('\n💼 Marketplace Tests:');

    await runTest('Get all jobs', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4004,
            path: '/jobs',
            method: 'GET'
        });

        assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
        assert(Array.isArray(response.data), 'Response is not an array');
    });

    await runTest('Search jobs', async () => {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4004,
            path: '/jobs/search?q=developer',
            method: 'GET'
        });

        assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
    });
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function main() {
    console.log('🧪 Azora Integration Tests\n');
    console.log('Testing end-to-end flows...\n');

    try {
        // Run all test suites
        const authToken = await testAuthFlow();
        await testEducationFlow(authToken);
        await testWalletFlow(authToken);
        await testAIFlow(authToken);
        await testMarketplaceFlow(authToken);

        // Print summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Summary:');
        console.log(`   Total: ${testsPassed + testsFailed}`);
        console.log(`   Passed: ${testsPassed} ✅`);
        console.log(`   Failed: ${testsFailed} ❌`);

        if (testsFailed > 0) {
            console.log('\n❌ Failed Tests:');
            failedTests.forEach(({ name, error }) => {
                console.log(`   - ${name}: ${error}`);
            });
        }

        const successRate = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1);
        console.log(`\n   Success Rate: ${successRate}%`);

        if (testsFailed === 0) {
            console.log('\n✨ All tests passed! Azora is ready! 🚀');
        } else {
            console.log('\n⚠️  Some tests failed. Please review and fix.');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
        process.exit(1);
    }
}

// Run tests
main();
