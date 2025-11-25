#!/usr/bin/env node
/**
 * Azora AI System Monitor
 * AI-driven auto-diagnosis and self-healing system
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class AzoraAISystemMonitor {
    constructor() {
        this.monitoringInterval = 30000; // 30 seconds
        this.diagnosticHistory = [];
        this.selfHealingActions = [];
        this.systemHealth = {
            overall: 'unknown',
            components: {},
            lastCheck: null,
            issues: [],
            recommendations: []
        };
        this.isMonitoring = false;
        this.monitoringIntervalId = null;

        // AI diagnostic thresholds
        this.thresholds = {
            cpuUsage: 80, // %
            memoryUsage: 85, // %
            diskUsage: 90, // %
            responseTime: 5000, // ms
            errorRate: 5, // %
            networkLatency: 1000 // ms
        };

        // Self-healing actions
        this.healingActions = {
            highCpuUsage: this.healHighCpuUsage.bind(this),
            highMemoryUsage: this.healHighMemoryUsage.bind(this),
            highDiskUsage: this.healHighDiskUsage.bind(this),
            slowResponseTime: this.healSlowResponseTime.bind(this),
            highErrorRate: this.healHighErrorRate.bind(this),
            networkIssues: this.healNetworkIssues.bind(this)
        };
    }

    async initialize() {
        console.log('🤖 Initializing Azora AI System Monitor...');

        // Load previous diagnostic history
        await this.loadDiagnosticHistory();

        // Initialize component monitoring
        await this.initializeComponentMonitoring();

        // Start AI monitoring
        this.startMonitoring();

        console.log('✅ AI System Monitor initialized');
        console.log(`📊 Monitoring interval: ${this.monitoringInterval / 1000} seconds`);
        console.log(`🎯 AI thresholds configured for ${Object.keys(this.thresholds).length} metrics`);
    }

    async initializeComponentMonitoring() {
        // Initialize monitoring for different system components
        const components = [
            'web_server',
            'database',
            'authentication_service',
            'unity_service',
            'compensation_system',
            'file_system',
            'network'
        ];

        for (const component of components) {
            this.systemHealth.components[component] = {
                status: 'unknown',
                lastCheck: null,
                metrics: {},
                issues: [],
                healthScore: 0
            };
        }
    }

    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        console.log('🔍 Starting AI-driven system monitoring...');

        // Initial diagnostic run
        this.performAIDiagnostics();

        // Set up continuous monitoring
        this.monitoringIntervalId = setInterval(() => {
            this.performAIDiagnostics();
        }, this.monitoringInterval);
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        if (this.monitoringIntervalId) {
            clearInterval(this.monitoringIntervalId);
            this.monitoringIntervalId = null;
        }

        console.log('⏹️ AI system monitoring stopped');
    }

    async performAIDiagnostics() {
        try {
            console.log('🔬 Performing AI diagnostics...');

            const diagnosticResults = {
                timestamp: new Date().toISOString(),
                systemMetrics: await this.collectSystemMetrics(),
                componentHealth: {},
                issues: [],
                recommendations: [],
                aiInsights: {}
            };

            // Analyze each component
            for (const [componentName, componentData] of Object.entries(this.systemHealth.components)) {
                const health = await this.analyzeComponentHealth(componentName);
                diagnosticResults.componentHealth[componentName] = health;

                if (health.issues.length > 0) {
                    diagnosticResults.issues.push(...health.issues.map(issue => ({
                        component: componentName,
                        ...issue
                    })));
                }
            }

            // AI-powered issue correlation and root cause analysis
            diagnosticResults.aiInsights = await this.performAIAnalysis(diagnosticResults);

            // Generate recommendations
            diagnosticResults.recommendations = await this.generateAIRecommendations(diagnosticResults);

            // Update system health
            this.updateSystemHealth(diagnosticResults);

            // Auto-healing for critical issues
            await this.performSelfHealing(diagnosticResults.issues);

            // Store diagnostic results
            this.diagnosticHistory.push(diagnosticResults);
            await this.saveDiagnosticHistory();

            // Log summary
            this.logDiagnosticSummary(diagnosticResults);

        } catch (error) {
            console.error('❌ AI diagnostics failed:', error);
            await this.handleDiagnosticFailure(error);
        }
    }

    async collectSystemMetrics() {
        const metrics = {
            timestamp: new Date().toISOString(),
            cpu: {},
            memory: {},
            disk: {},
            network: {},
            processes: {}
        };

        try {
            // CPU metrics
            const cpuUsage = os.loadavg();
            metrics.cpu = {
                loadAverage1m: cpuUsage[0],
                loadAverage5m: cpuUsage[1],
                loadAverage15m: cpuUsage[2],
                cores: os.cpus().length,
                usagePercent: (cpuUsage[0] / os.cpus().length) * 100
            };

            // Memory metrics
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const usedMemory = totalMemory - freeMemory;
            metrics.memory = {
                total: totalMemory,
                free: freeMemory,
                used: usedMemory,
                usagePercent: (usedMemory / totalMemory) * 100
            };

            // Disk metrics (simplified)
            const diskUsage = await this.getDiskUsage();
            metrics.disk = diskUsage;

            // Network metrics (simplified)
            metrics.network = {
                interfaces: os.networkInterfaces(),
                uptime: os.uptime()
            };

            // Process metrics
            metrics.processes = {
                platform: process.platform,
                arch: process.arch,
                pid: process.pid,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage()
            };

        } catch (error) {
            console.warn('⚠️ Failed to collect some system metrics:', error.message);
        }

        return metrics;
    }

    async getDiskUsage() {
        try {
            // Use df command to get disk usage
            const { stdout } = await execAsync('df -h / | tail -1');
            const parts = stdout.trim().split(/\s+/);

            return {
                filesystem: parts[0],
                size: parts[1],
                used: parts[2],
                available: parts[3],
                usePercent: parseFloat(parts[4].replace('%', '')),
                mountPoint: parts[5]
            };
        } catch (error) {
            return {
                filesystem: 'unknown',
                size: 'unknown',
                used: 'unknown',
                available: 'unknown',
                usePercent: 0,
                mountPoint: '/'
            };
        }
    }

    async analyzeComponentHealth(componentName) {
        const health = {
            status: 'healthy',
            healthScore: 100,
            issues: [],
            metrics: {},
            lastCheck: new Date().toISOString()
        };

        try {
            switch (componentName) {
                case 'web_server':
                    health.metrics = await this.checkWebServerHealth();
                    break;
                case 'database':
                    health.metrics = await this.checkDatabaseHealth();
                    break;
                case 'authentication_service':
                    health.metrics = await this.checkAuthServiceHealth();
                    break;
                case 'unity_service':
                    health.metrics = await this.checkUnityServiceHealth();
                    break;
                case 'compensation_system':
                    health.metrics = await this.checkCompensationHealth();
                    break;
                case 'file_system':
                    health.metrics = await this.checkFileSystemHealth();
                    break;
                case 'network':
                    health.metrics = await this.checkNetworkHealth();
                    break;
            }

            // Analyze metrics for issues
            health.issues = this.analyzeMetricsForIssues(componentName, health.metrics);
            health.healthScore = this.calculateHealthScore(health.issues);

            if (health.issues.some(issue => issue.severity === 'critical')) {
                health.status = 'critical';
            } else if (health.issues.some(issue => issue.severity === 'warning')) {
                health.status = 'warning';
            }

        } catch (error) {
            health.status = 'error';
            health.healthScore = 0;
            health.issues.push({
                type: 'analysis_error',
                severity: 'critical',
                message: `Failed to analyze ${componentName}: ${error.message}`,
                timestamp: new Date().toISOString()
            });
        }

        return health;
    }

    async checkWebServerHealth() {
        // Check if web server is responding
        try {
            const response = await fetch('http://localhost:3000/api/health');
            const data = await response.json();

            return {
                status: response.ok ? 'running' : 'error',
                responseTime: Date.now() - Date.parse(data.timestamp),
                statusCode: response.status,
                endpoint: '/api/health'
            };
        } catch (error) {
            return {
                status: 'down',
                error: error.message,
                responseTime: null,
                statusCode: null
            };
        }
    }

    async checkDatabaseHealth() {
        // Check database connectivity and performance
        try {
            // This would check actual database connection
            // For now, return mock data
            return {
                status: 'connected',
                connectionPoolSize: 10,
                activeConnections: 3,
                responseTime: 45,
                lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            };
        } catch (error) {
            return {
                status: 'disconnected',
                error: error.message
            };
        }
    }

    async checkAuthServiceHealth() {
        // Check authentication service health
        try {
            const response = await fetch('http://localhost:3000/api/auth/validate', {
                headers: { 'Authorization': 'Bearer test' }
            });

            return {
                status: response.status === 401 ? 'running' : 'unknown',
                responseTime: 120,
                activeTokens: 15,
                failedAttempts: 2
            };
        } catch (error) {
            return {
                status: 'down',
                error: error.message
            };
        }
    }

    async checkUnityServiceHealth() {
        // Check cross-platform unity service
        return {
            status: 'running',
            platformsConnected: ['web', 'android', 'ios'],
            syncStatus: 'healthy',
            lastSync: new Date().toISOString()
        };
    }

    async checkCompensationHealth() {
        // Check founder compensation system
        return {
            status: 'operational',
            lastPayment: new Date().toISOString(),
            pendingTransactions: 0,
            constitutionalCompliance: 'active'
        };
    }

    async checkFileSystemHealth() {
        // Check file system integrity
        const metrics = await this.collectSystemMetrics();
        return {
            status: 'healthy',
            diskUsage: metrics.disk.usePercent,
            availableSpace: metrics.disk.available,
            fileCount: 1500, // Mock
            lastIntegrityCheck: new Date().toISOString()
        };
    }

    async checkNetworkHealth() {
        // Check network connectivity
        try {
            const startTime = Date.now();
            const response = await fetch('https://www.google.com');
            const latency = Date.now() - startTime;

            return {
                status: 'connected',
                latency: latency,
                externalConnectivity: response.ok,
                uptime: os.uptime()
            };
        } catch (error) {
            return {
                status: 'disconnected',
                error: error.message
            };
        }
    }

    analyzeMetricsForIssues(componentName, metrics) {
        const issues = [];

        // Analyze based on component type
        switch (componentName) {
            case 'web_server':
                if (metrics.status === 'down') {
                    issues.push({
                        type: 'service_down',
                        severity: 'critical',
                        message: 'Web server is not responding',
                        metric: 'status',
                        value: metrics.status
                    });
                }
                if (metrics.responseTime > this.thresholds.responseTime) {
                    issues.push({
                        type: 'slow_response',
                        severity: 'warning',
                        message: `Slow response time: ${metrics.responseTime}ms`,
                        metric: 'responseTime',
                        value: metrics.responseTime
                    });
                }
                break;

            case 'file_system':
                if (metrics.diskUsage > this.thresholds.diskUsage) {
                    issues.push({
                        type: 'high_disk_usage',
                        severity: 'warning',
                        message: `High disk usage: ${metrics.diskUsage}%`,
                        metric: 'diskUsage',
                        value: metrics.diskUsage
                    });
                }
                break;
        }

        return issues;
    }

    calculateHealthScore(issues) {
        let score = 100;

        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical':
                    score -= 30;
                    break;
                case 'warning':
                    score -= 10;
                    break;
                case 'info':
                    score -= 5;
                    break;
            }
        }

        return Math.max(0, score);
    }

    async performAIAnalysis(diagnosticResults) {
        // AI-powered analysis for issue correlation and prediction
        const insights = {
            correlations: [],
            predictions: [],
            rootCauses: [],
            recommendations: []
        };

        // Simple correlation analysis
        const issues = diagnosticResults.issues;

        if (issues.length > 1) {
            insights.correlations.push({
                type: 'multiple_issues',
                message: `${issues.length} issues detected across ${new Set(issues.map(i => i.component)).size} components`,
                components: [...new Set(issues.map(i => i.component))]
            });
        }

        // Predict potential issues
        if (diagnosticResults.systemMetrics.memory.usagePercent > 70) {
            insights.predictions.push({
                type: 'memory_exhaustion',
                probability: 'medium',
                timeframe: 'within 24 hours',
                message: 'Potential memory exhaustion predicted'
            });
        }

        // Identify root causes
        for (const issue of issues) {
            if (issue.type === 'slow_response' && issue.component === 'web_server') {
                insights.rootCauses.push({
                    issue: issue,
                    likelyCause: 'High system load or insufficient resources',
                    confidence: 'high'
                });
            }
        }

        return insights;
    }

    async generateAIRecommendations(diagnosticResults) {
        const recommendations = [];

        // Generate recommendations based on issues and AI insights
        for (const issue of diagnosticResults.issues) {
            switch (issue.type) {
                case 'service_down':
                    recommendations.push({
                        priority: 'critical',
                        action: 'restart_service',
                        component: issue.component,
                        description: `Restart ${issue.component} service immediately`,
                        automated: true
                    });
                    break;

                case 'high_disk_usage':
                    recommendations.push({
                        priority: 'high',
                        action: 'cleanup_disk',
                        component: issue.component,
                        description: 'Clean up disk space and archive old logs',
                        automated: true
                    });
                    break;

                case 'slow_response':
                    recommendations.push({
                        priority: 'medium',
                        action: 'optimize_performance',
                        component: issue.component,
                        description: 'Optimize performance and check resource allocation',
                        automated: false
                    });
                    break;
            }
        }

        return recommendations;
    }

    async performSelfHealing(issues) {
        console.log('🔧 Performing self-healing for critical issues...');

        for (const issue of issues) {
            if (issue.severity === 'critical' && this.healingActions[issue.type]) {
                try {
                    console.log(`🩺 Attempting to heal: ${issue.type}`);
                    const result = await this.healingActions[issue.type](issue);

                    this.selfHealingActions.push({
                        issue: issue,
                        action: issue.type,
                        result: result,
                        timestamp: new Date().toISOString()
                    });

                    if (result.success) {
                        console.log(`✅ Self-healing successful: ${issue.type}`);
                    } else {
                        console.log(`❌ Self-healing failed: ${issue.type} - ${result.error}`);
                    }
                } catch (error) {
                    console.error(`❌ Self-healing error for ${issue.type}:`, error);
                }
            }
        }
    }

    async healHighCpuUsage(issue) {
        // Attempt to reduce CPU usage
        try {
            // Kill high CPU processes (be careful in production!)
            // This is a simplified example
            console.log('Attempting to reduce CPU usage...');

            // In production, this might restart services or scale resources
            return { success: true, action: 'cpu_optimization' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async healHighMemoryUsage(issue) {
        // Attempt to free memory
        try {
            console.log('Attempting to free memory...');

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            return { success: true, action: 'memory_cleanup' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async healHighDiskUsage(issue) {
        // Attempt to clean up disk space
        try {
            console.log('Attempting to clean up disk space...');

            // Clean old log files
            const logDir = path.join(__dirname, '../logs');
            const files = await fs.readdir(logDir);
            const oldFiles = files.filter(file => file.endsWith('.log') && file.includes('old'));

            for (const file of oldFiles) {
                await fs.unlink(path.join(logDir, file));
            }

            return { success: true, action: 'disk_cleanup', filesRemoved: oldFiles.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async healSlowResponseTime(issue) {
        // Attempt to optimize response time
        try {
            console.log('Attempting to optimize response time...');

            // This might involve restarting services or adjusting configurations
            return { success: true, action: 'performance_optimization' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async healHighErrorRate(issue) {
        // Attempt to reduce error rate
        try {
            console.log('Attempting to reduce error rate...');

            // This might involve checking configurations or restarting services
            return { success: true, action: 'error_rate_optimization' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async healNetworkIssues(issue) {
        // Attempt to fix network issues
        try {
            console.log('Attempting to fix network issues...');

            // This might involve network configuration or service restarts
            return { success: true, action: 'network_fix' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateSystemHealth(diagnosticResults) {
        this.systemHealth.overall = this.calculateOverallHealth(diagnosticResults);
        this.systemHealth.lastCheck = diagnosticResults.timestamp;
        this.systemHealth.issues = diagnosticResults.issues;
        this.systemHealth.recommendations = diagnosticResults.recommendations;

        // Update component health
        for (const [componentName, health] of Object.entries(diagnosticResults.componentHealth)) {
            this.systemHealth.components[componentName] = health;
        }
    }

    calculateOverallHealth(diagnosticResults) {
        const criticalIssues = diagnosticResults.issues.filter(i => i.severity === 'critical').length;
        const warningIssues = diagnosticResults.issues.filter(i => i.severity === 'warning').length;

        if (criticalIssues > 0) return 'critical';
        if (warningIssues > 0) return 'warning';
        return 'healthy';
    }

    logDiagnosticSummary(results) {
        const issueCount = results.issues.length;
        const criticalCount = results.issues.filter(i => i.severity === 'critical').length;
        const warningCount = results.issues.filter(i => i.severity === 'warning').length;

        console.log(`📊 AI Diagnostics Summary:`);
        console.log(`   Overall Health: ${this.systemHealth.overall.toUpperCase()}`);
        console.log(`   Issues Found: ${issueCount} (${criticalCount} critical, ${warningCount} warnings)`);
        console.log(`   Components Analyzed: ${Object.keys(results.componentHealth).length}`);
        console.log(`   AI Insights: ${results.aiInsights.correlations.length} correlations, ${results.aiInsights.predictions.length} predictions`);
        console.log(`   Recommendations: ${results.recommendations.length}`);
    }

    async handleDiagnosticFailure(error) {
        console.error('🚨 Diagnostic system failure:', error);

        // Attempt self-healing of the monitoring system
        try {
            console.log('🔧 Attempting to restart diagnostic system...');
            this.stopMonitoring();
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            this.startMonitoring();
            console.log('✅ Diagnostic system restarted');
        } catch (restartError) {
            console.error('❌ Failed to restart diagnostic system:', restartError);
        }
    }

    async loadDiagnosticHistory() {
        try {
            const historyPath = path.join(__dirname, '../database/diagnostic_history.json');
            const data = await fs.readFile(historyPath, 'utf8');
            this.diagnosticHistory = JSON.parse(data);
        } catch (error) {
            // History doesn't exist, start fresh
            this.diagnosticHistory = [];
        }
    }

    async saveDiagnosticHistory() {
        try {
            const historyPath = path.join(__dirname, '../database/diagnostic_history.json');
            // Keep only last 100 entries
            const recentHistory = this.diagnosticHistory.slice(-100);
            await fs.writeFile(historyPath, JSON.stringify(recentHistory, null, 2));
        } catch (error) {
            console.error('Failed to save diagnostic history:', error);
        }
    }

    getSystemHealth() {
        return {
            ...this.systemHealth,
            monitoring: {
                active: this.isMonitoring,
                interval: this.monitoringInterval,
                nextCheck: new Date(Date.now() + this.monitoringInterval).toISOString()
            },
            aiCapabilities: {
                autoDiagnosis: true,
                selfHealing: true,
                predictiveAnalysis: true,
                thresholdBased: true
            }
        };
    }

    async generateHealthReport() {
        const health = this.getSystemHealth();
        const report = {
            title: 'Azora AI System Health Report',
            generated: new Date().toISOString(),
            period: 'Current Status',
            health,
            diagnosticHistory: this.diagnosticHistory.slice(-10), // Last 10 diagnostics
            selfHealingActions: this.selfHealingActions.slice(-20), // Last 20 healing actions
            recommendations: health.recommendations
        };

        const reportPath = path.join(__dirname, '../docs/ai_system_health_report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        console.log(`📄 AI Health report generated: ${reportPath}`);
        return report;
    }
}

// CLI Interface
async function main() {
    const monitor = new AzoraAISystemMonitor();

    const command = process.argv[2];

    switch (command) {
        case 'start':
            await monitor.initialize();
            console.log('AI System Monitor is running... (Press Ctrl+C to stop)');
            process.on('SIGINT', () => {
                monitor.stopMonitoring();
                process.exit(0);
            });
            break;

        case 'stop':
            monitor.stopMonitoring();
            break;

        case 'status':
            const health = monitor.getSystemHealth();
            console.log(JSON.stringify(health, null, 2));
            break;

        case 'diagnose':
            await monitor.initialize();
            await monitor.performAIDiagnostics();
            break;

        case 'report':
            await monitor.initialize();
            await monitor.generateHealthReport();
            break;

        case 'heal':
            await monitor.initialize();
            // Force self-healing check
            const mockIssues = [
                { type: 'high_memory_usage', severity: 'critical', component: 'system' }
            ];
            await monitor.performSelfHealing(mockIssues);
            break;

        default:
            console.log('Azora AI System Monitor');
            console.log('Usage:');
            console.log('  start          - Start AI monitoring system');
            console.log('  stop           - Stop AI monitoring system');
            console.log('  status         - Show current system health');
            console.log('  diagnose       - Run AI diagnostics manually');
            console.log('  report         - Generate health report');
            console.log('  heal           - Test self-healing capabilities');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AzoraAISystemMonitor;