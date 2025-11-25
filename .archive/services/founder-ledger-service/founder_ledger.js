#!/usr/bin/env node
/**
 * Azora Constitutional Founder Ledger System
 * Tracks founder compensation as constitutional assets/loans
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FounderLedger {
    constructor() {
        this.ledgerPath = path.join(__dirname, '../../database/founder_ledger.json');
        this.transactions = [];
        this.founder = {
            name: "Primary Founder",
            id: "founder-001",
            constitutionalRole: "Chief Executive Founder",
            monthlyCompensation: 15000, // R15,000
            feeStructure: {
                ecosystemDevelopment: 0.05, // 5%
                treasuryReserve: 0.03,      // 3%
                communityFund: 0.02         // 2%
            }
        };
        this.initializeLedger();
    }

    async initializeLedger() {
        try {
            await fs.access(this.ledgerPath);
            const data = await fs.readFile(this.ledgerPath, 'utf8');
            this.transactions = JSON.parse(data);
        } catch (error) {
            // Create new ledger if it doesn't exist
            this.transactions = [];
            await this.saveLedger();
        }
    }

    async saveLedger() {
        const ledgerData = {
            metadata: {
                version: "1.0",
                created: new Date().toISOString(),
                constitutionalReference: "Article VII, Section 3",
                lastUpdated: new Date().toISOString()
            },
            founder: this.founder,
            transactions: this.transactions
        };

        await fs.writeFile(this.ledgerPath, JSON.stringify(ledgerData, null, 2));
    }

    calculateFees(grossAmount) {
        const fees = {
            ecosystemDevelopment: grossAmount * this.founder.feeStructure.ecosystemDevelopment,
            treasuryReserve: grossAmount * this.founder.feeStructure.treasuryReserve,
            communityFund: grossAmount * this.founder.feeStructure.communityFund
        };

        const totalFees = Object.values(fees).reduce((sum, fee) => sum + fee, 0);
        const netAmount = grossAmount - totalFees;

        return {
            grossAmount,
            fees,
            totalFees,
            netAmount
        };
    }

    async recordCompensation(month, year) {
        const transactionId = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        const calculation = this.calculateFees(this.founder.monthlyCompensation);

        const transaction = {
            transactionId,
            transactionType: "founder_compensation",
            period: { month, year },
            recipient: this.founder.id,
            constitutionalReference: "Article VII, Section 3",
            timestamp,
            calculation,
            status: "pending",
            blockchainHash: null,
            validatorSignatures: [],
            distribution: {
                scheduledDate: new Date(year, month - 1, 1).toISOString().split('T')[0], // 1st of the month
                actualDate: null,
                paymentMethod: "constitutional_asset_loan",
                reference: `AZORA-FOUNDER-${year}${month.toString().padStart(2, '0')}`
            }
        };

        this.transactions.push(transaction);
        await this.saveLedger();

        console.log(`✅ Founder compensation recorded for ${month}/${year}`);
        console.log(`   Gross: R${calculation.grossAmount.toLocaleString()}`);
        console.log(`   Fees: R${calculation.totalFees.toLocaleString()}`);
        console.log(`   Net: R${calculation.netAmount.toLocaleString()}`);

        return transaction;
    }

    async confirmDistribution(transactionId, blockchainHash) {
        const transaction = this.transactions.find(t => t.transactionId === transactionId);
        if (!transaction) {
            throw new Error(`Transaction ${transactionId} not found`);
        }

        transaction.status = "distributed";
        transaction.distribution.actualDate = new Date().toISOString();
        transaction.blockchainHash = blockchainHash;
        transaction.validatorSignatures = await this.getValidatorSignatures(transaction);

        await this.saveLedger();

        console.log(`✅ Compensation distribution confirmed: ${transactionId}`);
        return transaction;
    }

    async getValidatorSignatures(transaction) {
        // In production, this would collect signatures from constitutional validators
        // For now, return mock signatures
        return [
            {
                validator: "constitutional-council-001",
                signature: crypto.createHash('sha256').update(JSON.stringify(transaction)).digest('hex'),
                timestamp: new Date().toISOString()
            }
        ];
    }

    async getLedgerSummary() {
        const totalGross = this.transactions.reduce((sum, t) => sum + t.calculation.grossAmount, 0);
        const totalFees = this.transactions.reduce((sum, t) => sum + t.calculation.totalFees, 0);
        const totalNet = this.transactions.reduce((sum, t) => sum + t.calculation.netAmount, 0);

        const pendingTransactions = this.transactions.filter(t => t.status === 'pending');
        const distributedTransactions = this.transactions.filter(t => t.status === 'distributed');

        return {
            founder: this.founder,
            summary: {
                totalTransactions: this.transactions.length,
                totalGrossCompensation: totalGross,
                totalFeesDeducted: totalFees,
                totalNetDistributed: totalNet,
                pendingTransactions: pendingTransactions.length,
                distributedTransactions: distributedTransactions.length
            },
            recentTransactions: this.transactions.slice(-5).reverse(),
            nextScheduledPayment: this.getNextScheduledPayment()
        };
    }

    getNextScheduledPayment() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const calculation = this.calculateFees(this.founder.monthlyCompensation);

        return {
            date: nextMonth.toISOString().split('T')[0],
            grossAmount: calculation.grossAmount,
            netAmount: calculation.netAmount,
            fees: calculation.totalFees
        };
    }

    async generateConstitutionalReport() {
        const summary = await this.getLedgerSummary();

        const report = {
            title: "Azora Constitutional Founder Compensation Report",
            generated: new Date().toISOString(),
            period: "All Time",
            constitutionalReference: "Article VII, Section 3",
            summary,
            transactions: this.transactions,
            verification: {
                ledgerHash: crypto.createHash('sha256').update(JSON.stringify(this.transactions)).digest('hex'),
                validatorCount: summary.summary.distributedTransactions,
                lastAudit: new Date().toISOString()
            }
        };

        const reportPath = path.join(__dirname, '../../docs/legal/founder_ledger_report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        console.log(`📄 Constitutional report generated: ${reportPath}`);
        return report;
    }

    async auditLedger() {
        console.log("🔍 Starting constitutional ledger audit...");

        const issues = [];

        // Check transaction integrity
        for (const transaction of this.transactions) {
            if (!transaction.transactionId || !transaction.calculation) {
                issues.push(`Invalid transaction structure: ${transaction.transactionId || 'unknown'}`);
            }

            // Verify fee calculations
            const expectedFees = this.calculateFees(transaction.calculation.grossAmount);
            if (Math.abs(expectedFees.totalFees - transaction.calculation.totalFees) > 0.01) {
                issues.push(`Fee calculation mismatch for transaction: ${transaction.transactionId}`);
            }
        }

        // Check for duplicate transactions
        const transactionIds = this.transactions.map(t => t.transactionId);
        const duplicates = transactionIds.filter((id, index) => transactionIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
            issues.push(`Duplicate transaction IDs found: ${duplicates.join(', ')}`);
        }

        const auditResult = {
            timestamp: new Date().toISOString(),
            transactionsAudited: this.transactions.length,
            issuesFound: issues.length,
            issues,
            status: issues.length === 0 ? "PASSED" : "ISSUES_FOUND"
        };

        console.log(`📊 Audit completed: ${auditResult.status}`);
        if (issues.length > 0) {
            console.log("Issues found:");
            issues.forEach(issue => console.log(`  - ${issue}`));
        }

        return auditResult;
    }
}

// CLI Interface
async function main() {
    const ledger = new FounderLedger();

    const command = process.argv[2];

    switch (command) {
        case 'record':
            const month = parseInt(process.argv[3]);
            const year = parseInt(process.argv[4]);
            if (!month || !year) {
                console.error("Usage: node founder_ledger.js record <month> <year>");
                process.exit(1);
            }
            await ledger.recordCompensation(month, year);
            break;

        case 'confirm':
            const transactionId = process.argv[3];
            const blockchainHash = process.argv[4];
            if (!transactionId || !blockchainHash) {
                console.error("Usage: node founder_ledger.js confirm <transactionId> <blockchainHash>");
                process.exit(1);
            }
            await ledger.confirmDistribution(transactionId, blockchainHash);
            break;

        case 'summary':
            const summary = await ledger.getLedgerSummary();
            console.log(JSON.stringify(summary, null, 2));
            break;

        case 'report':
            await ledger.generateConstitutionalReport();
            break;

        case 'audit':
            await ledger.auditLedger();
            break;

        default:
            console.log("Azora Constitutional Founder Ledger");
            console.log("Usage:");
            console.log("  record <month> <year>          - Record monthly compensation");
            console.log("  confirm <txId> <hash>          - Confirm distribution");
            console.log("  summary                         - Show ledger summary");
            console.log("  report                          - Generate constitutional report");
            console.log("  audit                           - Audit ledger integrity");
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = FounderLedger;