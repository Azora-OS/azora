const { ChaosMesh } = require('@chaos-mesh/chaos-mesh');
const axios = require('axios');

class ChaosTestSuite {
    constructor() {
        this.baseURL = process.env.API_BASE_URL || 'http://localhost:4000';
        this.chaos = new ChaosMesh();
    }

    async runNetworkChaos() {
        console.log('Starting network chaos tests...');
        
        // Network delay test
        await this.chaos.createNetworkChaos({
            name: 'network-delay',
            selector: { app: 'api-gateway' },
            action: 'delay',
            delay: '100ms'
        });

        await this.testServiceResilience();
        await this.chaos.deleteChaos('network-delay');

        // Network partition test
        await this.chaos.createNetworkChaos({
            name: 'network-partition',
            selector: { app: 'auth-service' },
            action: 'partition',
            direction: 'to'
        });

        await this.testAuthFailover();
        await this.chaos.deleteChaos('network-partition');
    }

    async runPodChaos() {
        console.log('Starting pod chaos tests...');
        
        // Pod kill test
        await this.chaos.createPodChaos({
            name: 'pod-kill',
            selector: { app: 'api-gateway' },
            action: 'pod-kill'
        });

        await this.sleep(30000); // Wait 30 seconds
        await this.testServiceRecovery();
        await this.chaos.deleteChaos('pod-kill');
    }

    async runStressChaos() {
        console.log('Starting stress chaos tests...');
        
        // CPU stress test
        await this.chaos.createStressChaos({
            name: 'cpu-stress',
            selector: { app: 'azora-education' },
            stressors: {
                cpu: { workers: 2, load: 80 }
            },
            duration: '2m'
        });

        await this.testPerformanceUnderStress();
        await this.chaos.deleteChaos('cpu-stress');

        // Memory stress test
        await this.chaos.createStressChaos({
            name: 'memory-stress',
            selector: { app: 'azora-finance' },
            stressors: {
                memory: { workers: 1, size: '1GB' }
            },
            duration: '2m'
        });

        await this.testMemoryPressure();
        await this.chaos.deleteChaos('memory-stress');
    }

    async testServiceResilience() {
        const startTime = Date.now();
        let successCount = 0;
        let totalRequests = 0;

        for (let i = 0; i < 50; i++) {
            try {
                const response = await axios.get(`${this.baseURL}/api/health`, {
                    timeout: 5000
                });
                if (response.status === 200) successCount++;
            } catch (error) {
                console.log(`Request ${i + 1} failed:`, error.message);
            }
            totalRequests++;
            await this.sleep(1000);
        }

        const successRate = (successCount / totalRequests) * 100;
        console.log(`Service resilience: ${successRate}% success rate`);
        
        if (successRate < 80) {
            throw new Error(`Service resilience test failed: ${successRate}% < 80%`);
        }
    }

    async testAuthFailover() {
        try {
            const response = await axios.post(`${this.baseURL}/api/auth/login`, {
                email: 'test@azora.world',
                password: 'testpass'
            }, { timeout: 10000 });

            if (response.status !== 200) {
                throw new Error('Auth failover failed');
            }
            console.log('Auth failover test passed');
        } catch (error) {
            console.log('Auth failover test result:', error.message);
        }
    }

    async testServiceRecovery() {
        let recovered = false;
        const maxAttempts = 30;

        for (let i = 0; i < maxAttempts; i++) {
            try {
                const response = await axios.get(`${this.baseURL}/api/health`);
                if (response.status === 200) {
                    recovered = true;
                    console.log(`Service recovered after ${i + 1} attempts`);
                    break;
                }
            } catch (error) {
                console.log(`Recovery attempt ${i + 1} failed`);
            }
            await this.sleep(2000);
        }

        if (!recovered) {
            throw new Error('Service failed to recover within expected time');
        }
    }

    async testPerformanceUnderStress() {
        const responses = [];
        
        for (let i = 0; i < 20; i++) {
            const startTime = Date.now();
            try {
                await axios.get(`${this.baseURL}/api/courses`);
                responses.push(Date.now() - startTime);
            } catch (error) {
                responses.push(null);
            }
        }

        const validResponses = responses.filter(r => r !== null);
        const avgResponseTime = validResponses.reduce((a, b) => a + b, 0) / validResponses.length;
        
        console.log(`Average response time under stress: ${avgResponseTime}ms`);
        
        if (avgResponseTime > 5000) {
            console.warn(`High response time under stress: ${avgResponseTime}ms`);
        }
    }

    async testMemoryPressure() {
        try {
            const response = await axios.get(`${this.baseURL}/api/finance/transactions`);
            if (response.status === 200) {
                console.log('Memory pressure test passed - service remained responsive');
            }
        } catch (error) {
            console.log('Memory pressure test failed:', error.message);
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async runAllTests() {
        try {
            await this.runNetworkChaos();
            await this.runPodChaos();
            await this.runStressChaos();
            console.log('All chaos tests completed successfully');
        } catch (error) {
            console.error('Chaos tests failed:', error);
            throw error;
        }
    }
}

module.exports = { ChaosTestSuite };

// Run tests if called directly
if (require.main === module) {
    const suite = new ChaosTestSuite();
    suite.runAllTests().catch(console.error);
}