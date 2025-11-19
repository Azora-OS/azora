const axios = require('axios');
const jwt = require('jsonwebtoken');

class SecurityTestSuite {
    constructor() {
        this.baseURL = process.env.API_BASE_URL || 'http://localhost:4000';
        this.testResults = [];
    }

    async runAuthenticationTests() {
        console.log('Running authentication security tests...');

        // Test 1: Unauthorized access
        await this.testUnauthorizedAccess();
        
        // Test 2: Invalid JWT tokens
        await this.testInvalidJWT();
        
        // Test 3: Token expiration
        await this.testTokenExpiration();
        
        // Test 4: Password strength
        await this.testPasswordStrength();
    }

    async testUnauthorizedAccess() {
        const endpoints = [
            '/api/users/profile',
            '/api/finance/transactions',
            '/api/education/courses/create',
            '/api/admin/users'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${this.baseURL}${endpoint}`);
                this.addResult('FAIL', `Unauthorized access allowed to ${endpoint}`, {
                    status: response.status
                });
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    this.addResult('PASS', `Unauthorized access properly blocked for ${endpoint}`);
                } else {
                    this.addResult('FAIL', `Unexpected error for ${endpoint}`, {
                        error: error.message
                    });
                }
            }
        }
    }

    async testInvalidJWT() {
        const invalidTokens = [
            'invalid.jwt.token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
            '',
            'Bearer malformed-token'
        ];

        for (const token of invalidTokens) {
            try {
                const response = await axios.get(`${this.baseURL}/api/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.addResult('FAIL', `Invalid JWT accepted: ${token.substring(0, 20)}...`);
            } catch (error) {
                if (error.response?.status === 401) {
                    this.addResult('PASS', `Invalid JWT properly rejected`);
                } else {
                    this.addResult('WARN', `Unexpected response for invalid JWT`, {
                        status: error.response?.status
                    });
                }
            }
        }
    }

    async testTokenExpiration() {
        // Create expired token
        const expiredToken = jwt.sign(
            { userId: 'test', exp: Math.floor(Date.now() / 1000) - 3600 },
            'test-secret'
        );

        try {
            const response = await axios.get(`${this.baseURL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${expiredToken}` }
            });
            this.addResult('FAIL', 'Expired token was accepted');
        } catch (error) {
            if (error.response?.status === 401) {
                this.addResult('PASS', 'Expired token properly rejected');
            } else {
                this.addResult('WARN', 'Unexpected response for expired token');
            }
        }
    }

    async testPasswordStrength() {
        const weakPasswords = [
            '123456',
            'password',
            'qwerty',
            'abc123',
            '12345678'
        ];

        for (const password of weakPasswords) {
            try {
                const response = await axios.post(`${this.baseURL}/api/auth/register`, {
                    email: 'test@example.com',
                    password: password,
                    name: 'Test User'
                });
                
                if (response.status === 201) {
                    this.addResult('FAIL', `Weak password accepted: ${password}`);
                }
            } catch (error) {
                if (error.response?.status === 400) {
                    this.addResult('PASS', `Weak password rejected: ${password}`);
                }
            }
        }
    }

    async runInputValidationTests() {
        console.log('Running input validation tests...');

        // SQL Injection tests
        await this.testSQLInjection();
        
        // XSS tests
        await this.testXSS();
        
        // Command injection tests
        await this.testCommandInjection();
    }

    async testSQLInjection() {
        const sqlPayloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "' UNION SELECT * FROM users --",
            "admin'--",
            "' OR 1=1#"
        ];

        for (const payload of sqlPayloads) {
            try {
                const response = await axios.post(`${this.baseURL}/api/auth/login`, {
                    email: payload,
                    password: 'test'
                });
                
                if (response.status === 200) {
                    this.addResult('FAIL', `SQL injection successful with payload: ${payload}`);
                }
            } catch (error) {
                if (error.response?.status === 400 || error.response?.status === 401) {
                    this.addResult('PASS', `SQL injection blocked for payload: ${payload.substring(0, 20)}...`);
                }
            }
        }
    }

    async testXSS() {
        const xssPayloads = [
            '<script>alert("xss")</script>',
            'javascript:alert("xss")',
            '<img src="x" onerror="alert(1)">',
            '<svg onload="alert(1)">',
            '"><script>alert("xss")</script>'
        ];

        for (const payload of xssPayloads) {
            try {
                const response = await axios.post(`${this.baseURL}/api/users/profile`, {
                    name: payload,
                    bio: payload
                }, {
                    headers: { Authorization: 'Bearer valid-token' }
                });
                
                // Check if payload is sanitized in response
                if (response.data && JSON.stringify(response.data).includes('<script>')) {
                    this.addResult('FAIL', `XSS payload not sanitized: ${payload.substring(0, 20)}...`);
                } else {
                    this.addResult('PASS', `XSS payload properly sanitized`);
                }
            } catch (error) {
                this.addResult('PASS', `XSS payload rejected`);
            }
        }
    }

    async testCommandInjection() {
        const cmdPayloads = [
            '; ls -la',
            '| cat /etc/passwd',
            '&& whoami',
            '`id`',
            '$(uname -a)'
        ];

        for (const payload of cmdPayloads) {
            try {
                const response = await axios.post(`${this.baseURL}/api/files/upload`, {
                    filename: payload,
                    content: 'test'
                });
                
                if (response.status === 200) {
                    this.addResult('WARN', `Command injection payload processed: ${payload}`);
                }
            } catch (error) {
                this.addResult('PASS', `Command injection blocked`);
            }
        }
    }

    async runDataProtectionTests() {
        console.log('Running data protection tests...');

        // Test sensitive data exposure
        await this.testSensitiveDataExposure();
        
        // Test encryption
        await this.testEncryption();
    }

    async testSensitiveDataExposure() {
        try {
            const response = await axios.get(`${this.baseURL}/api/users/list`);
            
            if (response.data) {
                const hasPasswords = JSON.stringify(response.data).includes('password');
                const hasTokens = JSON.stringify(response.data).includes('token');
                
                if (hasPasswords) {
                    this.addResult('FAIL', 'Password data exposed in API response');
                }
                if (hasTokens) {
                    this.addResult('FAIL', 'Token data exposed in API response');
                }
                if (!hasPasswords && !hasTokens) {
                    this.addResult('PASS', 'No sensitive data exposed');
                }
            }
        } catch (error) {
            this.addResult('PASS', 'User list endpoint properly protected');
        }
    }

    async testEncryption() {
        try {
            // Test HTTPS enforcement
            const httpResponse = await axios.get(this.baseURL.replace('https://', 'http://'));
            
            if (httpResponse.status === 200) {
                this.addResult('FAIL', 'HTTP connections allowed - HTTPS not enforced');
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                this.addResult('PASS', 'HTTP connections properly blocked');
            }
        }
    }

    addResult(status, message, details = {}) {
        this.testResults.push({
            status,
            message,
            details,
            timestamp: new Date().toISOString()
        });
        
        const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${emoji} ${status}: ${message}`);
    }

    generateReport() {
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const warnings = this.testResults.filter(r => r.status === 'WARN').length;
        
        const report = {
            summary: {
                total: this.testResults.length,
                passed,
                failed,
                warnings,
                successRate: ((passed / this.testResults.length) * 100).toFixed(2)
            },
            results: this.testResults,
            generatedAt: new Date().toISOString()
        };
        
        console.log('\n=== Security Test Report ===');
        console.log(`Total Tests: ${report.summary.total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Warnings: ${warnings}`);
        console.log(`Success Rate: ${report.summary.successRate}%`);
        
        return report;
    }

    async runAllTests() {
        try {
            await this.runAuthenticationTests();
            await this.runInputValidationTests();
            await this.runDataProtectionTests();
            
            return this.generateReport();
        } catch (error) {
            console.error('Security tests failed:', error);
            throw error;
        }
    }
}

module.exports = { SecurityTestSuite };

// Run tests if called directly
if (require.main === module) {
    const suite = new SecurityTestSuite();
    suite.runAllTests().catch(console.error);
}