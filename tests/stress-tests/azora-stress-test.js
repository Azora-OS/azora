/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Stress Testing Framework
 * Constitutional Compliance: Article VI - Infrastructure Independence
 * Tests system resilience under extreme load conditions
 */

import axios from 'axios';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AzoraStressTest {
    constructor() {
        this.baseURL = process.env.AZORA_API_URL || 'http://localhost:3000';
        this.results = {
            timestamp: new Date().toISOString(),
            testSuite: 'Azora OS Planetary Stress Test',
            duration: 0,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            peakConcurrentUsers: 0,
            memoryUsage: {},
            errorBreakdown: {},
            survivalRate: 0
        };
    }

    /**
     * Simulate user registration and authentication
     */
    async simulateUserRegistration(userCount = 1000) {
        console.log(`🚀 Starting user registration simulation: ${userCount} users`);

        const users = [];
        const promises = [];

        for (let i = 0; i < userCount; i++) {
            const userData = {
                email: `stress-test-user-${i}@azora.os`,
                password: `TestPass123!${i}`,
                country: this.getRandomCountry(),
                educationLevel: this.getRandomEducationLevel()
            };

            promises.push(
                this.makeRequest('POST', '/api/auth/register', userData)
                    .then(response => {
                        users.push({ ...userData, token: response.data.token });
                        return response;
                    })
                    .catch(error => {
                        console.error(`Registration failed for user ${i}:`, error.message);
                        return null;
                    })
            );
        }

        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;

        console.log(`✅ User registration complete: ${successful}/${userCount} successful`);
        return users.filter(u => u.token);
    }

    /**
     * Simulate concurrent API calls from multiple users
     */
    async simulateConcurrentLoad(users, durationMinutes = 5, maxConcurrency = 500) {
        console.log(`🔥 Starting concurrent load test: ${users.length} users, ${durationMinutes} minutes, max ${maxConcurrency} concurrent`);

        const startTime = performance.now();
        const endTime = startTime + (durationMinutes * 60 * 1000);
        const requestPromises = [];
        let requestCount = 0;
        let successCount = 0;
        let errorCount = 0;
        const responseTimes = [];

        // Continuous load generation
        const loadGenerator = setInterval(async () => {
            if (performance.now() >= endTime) {
                clearInterval(loadGenerator);
                return;
            }

            // Generate batch of concurrent requests
            const batchSize = Math.min(maxConcurrency, users.length);
            const batchPromises = [];

            for (let i = 0; i < batchSize; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const requestType = this.getRandomRequestType();

                batchPromises.push(
                    this.makeAuthenticatedRequest(requestType.method, requestType.endpoint, user.token, requestType.data)
                        .then(response => {
                            requestCount++;
                            successCount++;
                            responseTimes.push(response.duration);
                            return response;
                        })
                        .catch(error => {
                            requestCount++;
                            errorCount++;
                            this.trackError(error);
                            return null;
                        })
                );
            }

            await Promise.allSettled(batchPromises);
        }, 100); // 100ms intervals for continuous load

        // Wait for test duration
        await new Promise(resolve => setTimeout(resolve, durationMinutes * 60 * 1000));

        const avgResponseTime = responseTimes.length > 0 ?
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

        console.log(`📊 Load test complete:`);
        console.log(`   - Total requests: ${requestCount}`);
        console.log(`   - Successful: ${successCount}`);
        console.log(`   - Failed: ${errorCount}`);
        console.log(`   - Average response time: ${avgResponseTime.toFixed(2)}ms`);

        return {
            totalRequests: requestCount,
            successfulRequests: successCount,
            failedRequests: errorCount,
            averageResponseTime: avgResponseTime,
            peakConcurrentUsers: maxConcurrency
        };
    }

    /**
     * Test system recovery from failures
     */
    async testSystemResilience(users) {
        console.log(`🛡️ Testing system resilience and recovery`);

        // Simulate service failures
        const failureScenarios = [
            { name: 'Database Connection Loss', duration: 30000 },
            { name: 'API Gateway Timeout', duration: 45000 },
            { name: 'Memory Pressure', duration: 20000 },
            { name: 'Network Partition', duration: 60000 }
        ];

        const resilienceResults = {};

        for (const scenario of failureScenarios) {
            console.log(`Testing: ${scenario.name}`);

            // Start failure simulation (in real implementation, this would trigger actual failures)
            await this.simulateFailure(scenario);

            // Test system response during failure
            const duringFailure = await this.quickLoadTest(users, 10000);

            // Wait for recovery
            await new Promise(resolve => setTimeout(resolve, scenario.duration));

            // Test system recovery
            const afterRecovery = await this.quickLoadTest(users, 10000);

            resilienceResults[scenario.name] = {
                duringFailure,
                afterRecovery,
                recoverySuccessful: afterRecovery.successRate > 0.8
            };
        }

        return resilienceResults;
    }

    /**
     * Run complete stress test suite
     */
    async runFullStressTest() {
        console.log(`🌍 AZORA OS PLANETARY STRESS TEST STARTED`);
        console.log(`Date: ${new Date().toISOString()}`);
        console.log(`Target: ${this.baseURL}`);
        console.log(`═`.repeat(50));

        const testStart = performance.now();

        try {
            // Phase 1: User Registration
            const users = await this.simulateUserRegistration(5000);

            // Phase 2: Concurrent Load Test
            const loadResults = await this.simulateConcurrentLoad(users, 10, 1000);

            // Phase 3: Resilience Testing
            const resilienceResults = await this.testSystemResilience(users);

            // Phase 4: Memory and Resource Testing
            const resourceUsage = await this.monitorResourceUsage();

            // Compile results
            this.results = {
                ...this.results,
                duration: (performance.now() - testStart) / 1000,
                ...loadResults,
                resilienceResults,
                resourceUsage,
                survivalRate: this.calculateSurvivalRate(loadResults, resilienceResults)
            };

            // Save results
            await this.saveResults();

            console.log(`🎯 STRESS TEST COMPLETE`);
            console.log(`Survival Rate: ${(this.results.survivalRate * 100).toFixed(2)}%`);
            console.log(`Results saved to: stress-tests/results/${this.results.timestamp}.json`);

        } catch (error) {
            console.error(`❌ Stress test failed:`, error);
            this.results.error = error.message;
            await this.saveResults();
        }
    }

    // Helper methods
    async makeRequest(method, endpoint, data = null) {
        const start = performance.now();
        try {
            const response = await axios({
                method,
                url: `${this.baseURL}${endpoint}`,
                data,
                timeout: 30000
            });
            response.duration = performance.now() - start;
            return response;
        } catch (error) {
            error.duration = performance.now() - start;
            throw error;
        }
    }

    async makeAuthenticatedRequest(method, endpoint, token, data = null) {
        const start = performance.now();
        try {
            const response = await axios({
                method,
                url: `${this.baseURL}${endpoint}`,
                data,
                headers: { Authorization: `Bearer ${token}` },
                timeout: 30000
            });
            response.duration = performance.now() - start;
            return response;
        } catch (error) {
            error.duration = performance.now() - start;
            throw error;
        }
    }

    getRandomCountry() {
        const countries = ['South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Egypt', 'Morocco', 'Ethiopia', 'Tanzania', 'Uganda'];
        return countries[Math.floor(Math.random() * countries.length)];
    }

    getRandomEducationLevel() {
        const levels = ['High School', 'Bachelor', 'Master', 'PhD', 'Professional'];
        return levels[Math.floor(Math.random() * levels.length)];
    }

    getRandomRequestType() {
        const requestTypes = [
            { method: 'GET', endpoint: '/api/user/profile', data: null },
            { method: 'GET', endpoint: '/api/economy/status', data: null },
            { method: 'POST', endpoint: '/api/education/course', data: { courseId: 'stress-test-course' } },
            { method: 'GET', endpoint: '/api/marketplace/listings', data: null },
            { method: 'POST', endpoint: '/api/transaction/create', data: { amount: 100, type: 'education' } }
        ];
        return requestTypes[Math.floor(Math.random() * requestTypes.length)];
    }

    async quickLoadTest(users, durationMs = 10000) {
        const start = performance.now();
        let requests = 0;
        let successes = 0;

        while (performance.now() - start < durationMs) {
            const user = users[Math.floor(Math.random() * users.length)];
            try {
                await this.makeAuthenticatedRequest('GET', '/api/user/profile', user.token);
                successes++;
            } catch (error) {
                // Continue
            }
            requests++;
        }

        return {
            requests,
            successes,
            successRate: successes / requests,
            duration: performance.now() - start
        };
    }

    async simulateFailure(scenario) {
        // In a real implementation, this would trigger actual system failures
        // For now, just log the simulation
        console.log(`   Simulating: ${scenario.name} for ${scenario.duration}ms`);
        await new Promise(resolve => setTimeout(resolve, scenario.duration / 10)); // Quick simulation
    }

    trackError(error) {
        const errorType = error.code || error.name || 'Unknown';
        this.results.errorBreakdown[errorType] = (this.results.errorBreakdown[errorType] || 0) + 1;
    }

    async monitorResourceUsage() {
        // Basic memory monitoring
        const memUsage = process.memoryUsage();
        return {
            rss: Math.round(memUsage.rss / 1024 / 1024), // MB
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024)
        };
    }

    calculateSurvivalRate(loadResults, resilienceResults) {
        const loadSurvival = loadResults.successfulRequests / loadResults.totalRequests;
        const resilienceSurvival = Object.values(resilienceResults)
            .filter(r => r.recoverySuccessful).length / Object.keys(resilienceResults).length;

        return (loadSurvival + resilienceSurvival) / 2;
    }

    async saveResults() {
        const filename = `${this.results.timestamp.replace(/[:.]/g, '-')}.json`;
        const filepath = path.join(__dirname, 'results', filename);

        await fs.promises.writeFile(filepath, JSON.stringify(this.results, null, 2));
        console.log(`📄 Results saved: ${filepath}`);
    }
}

// Export for use in other modules
export { AzoraStressTest };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const stressTest = new AzoraStressTest();
    stressTest.runFullStressTest().catch(console.error);
}