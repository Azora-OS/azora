#!/usr/bin/env node
/**
 * Azora Constitutional Compensation System
 * Manages founder compensation as assets/loans per Article VII, Section 3
 */

const FounderLedger = require('../services/founder-ledger-service/founder_ledger.js');
const schedule = require('node-schedule');
const fs = require('fs').promises;
const path = require('path');

class ConstitutionalCompensationSystem {
    constructor() {
        this.ledger = new FounderLedger();
        this.compensationSchedule = {
            monthlyAmount: 15000, // R15,000
            paymentDay: 1, // 1st of each month
            timezone: 'Africa/Johannesburg'
        };
        this.feeStructure = {
            ecosystemDevelopment: 0.05, // 5%
            treasuryReserve: 0.03,      // 3%
            communityFund: 0.02         // 2%
        };
        this.isRunning = false;
        this.jobs = [];
    }

    async initialize() {
        console.log('🏛️  Initializing Constitutional Compensation System...');

        // Load founder data
        await this.ledger.initializeLedger();

        // Setup automated compensation schedule
        this.setupCompensationSchedule();

        // Setup monitoring and reporting
        this.setupMonitoring();

        console.log('✅ Constitutional Compensation System initialized');
        console.log(`   Monthly Amount: R${this.compensationSchedule.monthlyAmount.toLocaleString()}`);
        console.log(`   Payment Day: ${this.compensationSchedule.paymentDay}st of each month`);
        console.log(`   Fee Structure: ${Object.values(this.feeStructure).reduce((a, b) => a + b) * 100}% total deductions`);
    }

    setupCompensationSchedule() {
        // Schedule monthly compensation on the 1st at 9:00 AM
        const rule = new schedule.RecurrenceRule();
        rule.date = this.compensationSchedule.paymentDay;
        rule.hour = 9;
        rule.minute = 0;
        rule.tz = this.compensationSchedule.timezone;

        const compensationJob = schedule.scheduleJob(rule, async () => {
            try {
                await this.processMonthlyCompensation();
            } catch (error) {
                console.error('❌ Monthly compensation processing failed:', error);
                await this.handleCompensationError(error);
            }
        });

        this.jobs.push({
            name: 'monthly_compensation',
            job: compensationJob,
            rule: rule
        });

        console.log('📅 Monthly compensation schedule activated');
    }

    setupMonitoring() {
        // Daily health check at 6:00 AM
        const healthCheckRule = new schedule.RecurrenceRule();
        healthCheckRule.hour = 6;
        healthCheckRule.minute = 0;
        healthCheckRule.tz = this.compensationSchedule.timezone;

        const healthCheckJob = schedule.scheduleJob(healthCheckRule, async () => {
            await this.performHealthCheck();
        });

        // Weekly report every Monday at 8:00 AM
        const weeklyReportRule = new schedule.RecurrenceRule();
        weeklyReportRule.dayOfWeek = 1; // Monday
        weeklyReportRule.hour = 8;
        weeklyReportRule.minute = 0;
        weeklyReportRule.tz = this.compensationSchedule.timezone;

        const weeklyReportJob = schedule.scheduleJob(weeklyReportRule, async () => {
            await this.generateWeeklyReport();
        });

        this.jobs.push(
            { name: 'daily_health_check', job: healthCheckJob, rule: healthCheckRule },
            { name: 'weekly_report', job: weeklyReportJob, rule: weeklyReportRule }
        );

        console.log('📊 Monitoring and reporting schedules activated');
    }

    async processMonthlyCompensation() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
        const currentYear = now.getFullYear();

        console.log(`💰 Processing monthly compensation for ${currentMonth}/${currentYear}`);

        // Record compensation in ledger
        const transaction = await this.ledger.recordCompensation(currentMonth, currentYear);

        // Calculate distribution details
        const distribution = await this.calculateDistribution(transaction);

        // Process payment through constitutional treasury
        const paymentResult = await this.processPayment(distribution);

        // Confirm distribution in ledger
        if (paymentResult.success) {
            await this.ledger.confirmDistribution(transaction.transactionId, paymentResult.blockchainHash);
            console.log(`✅ Compensation distributed: R${distribution.netAmount.toLocaleString()}`);
        } else {
            console.error('❌ Payment processing failed:', paymentResult.error);
            await this.handlePaymentFailure(transaction, paymentResult.error);
        }

        // Update founder notification
        await this.notifyFounder(distribution);

        // Log constitutional compliance
        await this.logConstitutionalCompliance(transaction, distribution);
    }

    async calculateDistribution(transaction) {
        const grossAmount = transaction.calculation.grossAmount;

        // Calculate fees
        const ecosystemFee = grossAmount * this.feeStructure.ecosystemDevelopment;
        const treasuryFee = grossAmount * this.feeStructure.treasuryReserve;
        const communityFee = grossAmount * this.feeStructure.communityFund;

        const totalFees = ecosystemFee + treasuryFee + communityFee;
        const netAmount = grossAmount - totalFees;

        return {
            transactionId: transaction.transactionId,
            grossAmount,
            fees: {
                ecosystemDevelopment: ecosystemFee,
                treasuryReserve: treasuryFee,
                communityFund: communityFee,
                total: totalFees
            },
            netAmount,
            distribution: {
                founderShare: netAmount,
                ecosystemDevelopment: ecosystemFee,
                treasuryReserve: treasuryFee,
                communityFund: communityFee
            }
        };
    }

    async processPayment(distribution) {
        // Simulate blockchain transaction
        // In production, this would interact with Azora Treasury smart contracts

        try {
            // Create treasury transaction
            const treasuryTransaction = {
                type: 'founder_compensation_distribution',
                distribution: distribution,
                timestamp: new Date().toISOString(),
                constitutionalReference: 'Article VII, Section 3'
            };

            // Simulate blockchain submission
            const blockchainHash = '0x' + require('crypto').randomBytes(32).toString('hex');

            // Simulate confirmation delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            return {
                success: true,
                blockchainHash: blockchainHash,
                transaction: treasuryTransaction,
                confirmedAt: new Date().toISOString()
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async notifyFounder(distribution) {
        const notification = {
            type: 'compensation_distributed',
            amount: distribution.netAmount,
            transactionId: distribution.transactionId,
            distributedAt: new Date().toISOString(),
            nextPayment: this.getNextPaymentDate()
        };

        // In production, this would send email/SMS/push notification
        console.log('📧 Founder notification sent:', JSON.stringify(notification, null, 2));

        // Save notification record
        await this.saveNotificationRecord(notification);
    }

    async performHealthCheck() {
        console.log('🏥 Performing constitutional compensation health check');

        try {
            const summary = await this.ledger.getLedgerSummary();
            const auditResult = await this.ledger.auditLedger();

            const healthStatus = {
                timestamp: new Date().toISOString(),
                ledgerIntegrity: auditResult.status === 'PASSED',
                totalTransactions: summary.summary.totalTransactions,
                pendingTransactions: summary.summary.pendingTransactions,
                nextPayment: summary.nextScheduledPayment,
                systemStatus: 'healthy'
            };

            // Check for issues
            if (auditResult.issuesFound > 0) {
                healthStatus.systemStatus = 'warning';
                healthStatus.issues = auditResult.issues;
            }

            if (summary.summary.pendingTransactions > 2) {
                healthStatus.systemStatus = 'critical';
                healthStatus.alert = 'Multiple pending transactions detected';
            }

            await this.saveHealthRecord(healthStatus);

            console.log(`📊 Health check completed: ${healthStatus.systemStatus.toUpperCase()}`);

            if (healthStatus.systemStatus !== 'healthy') {
                await this.handleHealthAlert(healthStatus);
            }

        } catch (error) {
            console.error('❌ Health check failed:', error);
            await this.handleHealthFailure(error);
        }
    }

    async generateWeeklyReport() {
        console.log('📈 Generating weekly constitutional compensation report');

        const summary = await this.ledger.getLedgerSummary();
        const auditResult = await this.ledger.auditLedger();

        const report = {
            reportType: 'weekly_constitutional_compensation',
            generated: new Date().toISOString(),
            period: 'weekly',
            summary: summary,
            auditResult: auditResult,
            complianceStatus: auditResult.status === 'PASSED' ? 'compliant' : 'non_compliant',
            recommendations: this.generateRecommendations(summary, auditResult)
        };

        const reportPath = path.join(__dirname, `../docs/legal/weekly_compensation_report_${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        console.log(`📄 Weekly report generated: ${reportPath}`);

        // Send report to constitutional council
        await this.distributeReport(report);
    }

    generateRecommendations(summary, auditResult) {
        const recommendations = [];

        if (auditResult.issuesFound > 0) {
            recommendations.push('Address ledger integrity issues immediately');
        }

        if (summary.summary.pendingTransactions > 0) {
            recommendations.push('Process pending compensation transactions');
        }

        if (summary.summary.totalTransactions === 0) {
            recommendations.push('Verify compensation system initialization');
        }

        return recommendations;
    }

    async handleCompensationError(error) {
        console.error('🚨 Compensation processing error:', error);

        // Log error for constitutional review
        const errorRecord = {
            type: 'compensation_error',
            error: error.message,
            timestamp: new Date().toISOString(),
            requiresConstitutionalReview: true
        };

        await this.saveErrorRecord(errorRecord);

        // Notify constitutional council
        await this.notifyConstitutionalCouncil(errorRecord);
    }

    async handlePaymentFailure(transaction, error) {
        console.error('🚨 Payment failure:', error);

        const failureRecord = {
            type: 'payment_failure',
            transactionId: transaction.transactionId,
            error: error,
            timestamp: new Date().toISOString(),
            retryRequired: true
        };

        await this.saveErrorRecord(failureRecord);
    }

    async handleHealthAlert(healthStatus) {
        console.warn('🚨 Health alert triggered:', healthStatus);

        const alert = {
            type: 'health_alert',
            status: healthStatus,
            timestamp: new Date().toISOString(),
            requiresAttention: true
        };

        await this.saveAlertRecord(alert);
        await this.notifyConstitutionalCouncil(alert);
    }

    async handleHealthFailure(error) {
        console.error('🚨 Health check failure:', error);

        const failure = {
            type: 'health_check_failure',
            error: error.message,
            timestamp: new Date().toISOString(),
            requiresImmediateAttention: true
        };

        await this.saveErrorRecord(failure);
        await this.notifyConstitutionalCouncil(failure);
    }

    // Utility methods
    getNextPaymentDate() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth.toISOString().split('T')[0];
    }

    async saveNotificationRecord(notification) {
        const recordsPath = path.join(__dirname, '../database/compensation_notifications.json');
        let records = [];
        try {
            const data = await fs.readFile(recordsPath, 'utf8');
            records = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }
        records.push(notification);
        await fs.writeFile(recordsPath, JSON.stringify(records, null, 2));
    }

    async saveHealthRecord(healthStatus) {
        const recordsPath = path.join(__dirname, '../database/compensation_health.json');
        let records = [];
        try {
            const data = await fs.readFile(recordsPath, 'utf8');
            records = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }
        records.push(healthStatus);
        await fs.writeFile(recordsPath, JSON.stringify(records, null, 2));
    }

    async saveErrorRecord(errorRecord) {
        const recordsPath = path.join(__dirname, '../database/compensation_errors.json');
        let records = [];
        try {
            const data = await fs.readFile(recordsPath, 'utf8');
            records = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }
        records.push(errorRecord);
        await fs.writeFile(recordsPath, JSON.stringify(records, null, 2));
    }

    async saveAlertRecord(alert) {
        const recordsPath = path.join(__dirname, '../database/compensation_alerts.json');
        let records = [];
        try {
            const data = await fs.readFile(recordsPath, 'utf8');
            records = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }
        records.push(alert);
        await fs.writeFile(recordsPath, JSON.stringify(records, null, 2));
    }

    async notifyConstitutionalCouncil(notification) {
        // In production, this would send notifications to constitutional council members
        console.log('📧 Constitutional Council notified:', notification.type);
    }

    async distributeReport(report) {
        // In production, this would distribute report to relevant stakeholders
        console.log('📤 Report distributed to stakeholders');
    }

    async logConstitutionalCompliance(transaction, distribution) {
        const complianceRecord = {
            transactionId: transaction.transactionId,
            constitutionalReference: 'Article VII, Section 3',
            complianceVerified: true,
            distribution: distribution,
            timestamp: new Date().toISOString()
        };

        const recordsPath = path.join(__dirname, '../database/constitutional_compliance.json');
        let records = [];
        try {
            const data = await fs.readFile(recordsPath, 'utf8');
            records = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }
        records.push(complianceRecord);
        await fs.writeFile(recordsPath, JSON.stringify(records, null, 2));
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('▶️  Constitutional Compensation System started');
    }

    stop() {
        if (!this.isRunning) return;

        this.jobs.forEach(jobInfo => {
            jobInfo.job.cancel();
        });
        this.jobs = [];
        this.isRunning = false;
        console.log('⏹️  Constitutional Compensation System stopped');
    }
}

// CLI Interface
async function main() {
    const system = new ConstitutionalCompensationSystem();

    const command = process.argv[2];

    switch (command) {
        case 'start':
            await system.initialize();
            system.start();
            console.log('System is running... (Press Ctrl+C to stop)');
            process.on('SIGINT', () => {
                system.stop();
                process.exit(0);
            });
            break;

        case 'stop':
            system.stop();
            break;

        case 'status':
            const summary = await system.ledger.getLedgerSummary();
            console.log(JSON.stringify(summary, null, 2));
            break;

        case 'process':
            await system.initialize();
            await system.processMonthlyCompensation();
            break;

        case 'health':
            await system.initialize();
            await system.performHealthCheck();
            break;

        case 'report':
            await system.initialize();
            await system.generateWeeklyReport();
            break;

        default:
            console.log('Azora Constitutional Compensation System');
            console.log('Usage:');
            console.log('  start          - Start the compensation system');
            console.log('  stop           - Stop the compensation system');
            console.log('  status         - Show system status');
            console.log('  process        - Process monthly compensation manually');
            console.log('  health         - Run health check');
            console.log('  report         - Generate weekly report');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ConstitutionalCompensationSystem;