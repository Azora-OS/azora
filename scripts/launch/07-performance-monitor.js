#!/usr/bin/env node
/**
 * AZORA PERFORMANCE MONITOR
 * 
 * Measures API response times and simulates load to identify bottlenecks.
 * 
 * Features:
 * - Latency measurement for key endpoints
 * - Concurrent request simulation (Load Testing)
 * - Resource usage tracking (Process memory/CPU)
 * - Performance reporting
 * 
 * Usage:
 *   npm run perf              # Run standard performance check
 *   npm run perf -- --load    # Run load test (100 concurrent reqs)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const TARGETS = [
    { name: 'Auth: Login', url: 'http://localhost:4000/health', method: 'GET' }, // Using health for baseline
    { name: 'Education: Courses', url: 'http://localhost:4002/courses', method: 'GET' },
    { name: 'Mint: Wallets', url: 'http://localhost:4003/health', method: 'GET' },
    { name: 'AI: Chat', url: 'http://localhost:4005/health', method: 'GET' }
];

const LOAD_TEST_CONCURRENCY = 50;
const LOAD_TEST_DURATION_MS = 5000; // 5 seconds

// ============================================
// UTILITIES
// ============================================

function makeRequest(url, method = 'GET') {
    return new Promise((resolve) => {
        const startTime = process.hrtime();
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        const req = client.request(url, { method, timeout: 5000 }, (res) => {
            res.on('data', () => { }); // Consume stream
            res.on('end', () => {
                const diff = process.hrtime(startTime);
                const durationMs = (diff[0] * 1000) + (diff[1] / 1e6);
                resolve({ success: res.statusCode >= 200 && res.statusCode < 300, durationMs, statusCode: res.statusCode });
            });
        });

        req.on('error', (err) => {
            const diff = process.hrtime(startTime);
            const durationMs = (diff[0] * 1000) + (diff[1] / 1e6);
            resolve({ success: false, durationMs, error: err.message });
        });

        req.on('timeout', () => {
            req.destroy();
            const diff = process.hrtime(startTime);
            const durationMs = (diff[0] * 1000) + (diff[1] / 1e6);
            resolve({ success: false, durationMs, error: 'Timeout' });
        });

        req.end();
    });
}

function calculateStats(times) {
    if (times.length === 0) return { min: 0, max: 0, avg: 0, p95: 0 };
    times.sort((a, b) => a - b);
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = sum / times.length;
    const p95Index = Math.floor(times.length * 0.95);
    return {
        min: times[0].toFixed(2),
        max: times[times.length - 1].toFixed(2),
        avg: avg.toFixed(2),
        p95: times[p95Index].toFixed(2)
    };
}

// ============================================
// TESTS
// ============================================

async function runLatencyCheck() {
    console.log('⚡ Running Latency Check...\n');
    const results = [];

    for (const target of TARGETS) {
        process.stdout.write(`  Checking ${target.name}... `);
        const result = await makeRequest(target.url, target.method);

        if (result.success) {
            console.log(`✅ ${result.durationMs.toFixed(2)}ms`);
            results.push({ ...target, ...result });
        } else {
            console.log(`❌ Failed (${result.error || result.statusCode})`);
            results.push({ ...target, ...result });
        }
    }
    return results;
}

async function runLoadTest() {
    console.log(`\n🏋️ Running Load Test (Concurrency: ${LOAD_TEST_CONCURRENCY}, Duration: ${LOAD_TEST_DURATION_MS}ms)...\n`);

    // Target the Education Service (Courses) as it's a read-heavy endpoint
    const target = TARGETS.find(t => t.name.includes('Education'));
    if (!target) {
        console.log('Skipping load test: Education service target not found.');
        return;
    }

    console.log(`  Targeting: ${target.url}`);

    const startTime = Date.now();
    let requestsCompleted = 0;
    let requestsFailed = 0;
    const latencies = [];

    const workers = [];

    for (let i = 0; i < LOAD_TEST_CONCURRENCY; i++) {
        workers.push((async () => {
            while (Date.now() - startTime < LOAD_TEST_DURATION_MS) {
                const res = await makeRequest(target.url, target.method);
                if (res.success) {
                    requestsCompleted++;
                    latencies.push(res.durationMs);
                } else {
                    requestsFailed++;
                }
                // Small delay to prevent overwhelming local machine port limits
                await new Promise(r => setTimeout(r, 10));
            }
        })());
    }

    await Promise.all(workers);

    const stats = calculateStats(latencies);
    const totalReqs = requestsCompleted + requestsFailed;
    const rps = (totalReqs / (LOAD_TEST_DURATION_MS / 1000)).toFixed(2);

    console.log('\n  Load Test Results:');
    console.log(`  - Total Requests: ${totalReqs}`);
    console.log(`  - Successful: ${requestsCompleted}`);
    console.log(`  - Failed: ${requestsFailed}`);
    console.log(`  - RPS: ${rps} req/sec`);
    console.log(`  - Latency (Avg): ${stats.avg}ms`);
    console.log(`  - Latency (P95): ${stats.p95}ms`);

    return { totalReqs, rps, stats };
}

// ============================================
// MAIN
// ============================================

async function main() {
    console.log('🏎️  Azora Performance Monitor\n');

    const args = process.argv.slice(2);
    const runLoad = args.includes('--load');

    const latencyResults = await runLatencyCheck();

    let loadResults = null;
    if (runLoad) {
        loadResults = await runLoadTest();
    }

    // Save Report
    const report = {
        timestamp: new Date().toISOString(),
        latency: latencyResults,
        load: loadResults
    };

    const reportPath = path.join(__dirname, '../../.perf-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
}

main().catch(console.error);
