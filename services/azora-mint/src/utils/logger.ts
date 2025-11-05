// azora-mint/src/utils/logger.ts

import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { AuditLogEntry } from "../interfaces/Reward.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.resolve(__dirname, "../../logs");

export class TransactionLogger {
    static auditLog(entry: AuditLogEntry) {
        const filename = `audit-${entry.auditReportId}.json`;
        const filepath = path.join(LOG_DIR, filename);

        // Ensure log directory exists
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }

        // Write log to file
        fs.writeFileSync(filepath, JSON.stringify(entry, null, 2));
        // Optionally, send to external audit service or SIEM here
    }

    static logAudit(transactionId: string, action: string, details: any) {
        const entry: AuditLogEntry = {
            auditReportId: transactionId,
            status: action === 'TRANSACTION_SUCCESS' ? 'SUCCESS' : 'FAILURE',
            genesisTimestamp: new Date().toISOString(),
            serviceInitiator: 'azora-mint',
            destinationService: 'azora-covenant',
            rewardDetails: details.rewardDetails || {},
            complianceCheck: details.complianceCheck || {
                kycStatus: 'unknown',
                complianceLogId: transactionId,
                idempotencyCheck: true
            },
            fundStatusSnapshot: details.fundStatusSnapshot || {
                uboBalanceBefore: 0,
                uboBalanceAfter: 0,
                transferExecuted: 0
            },
            blockchainDetails: details.blockchainDetails,
            auditCheckpoints: details.auditCheckpoints || {},
            errorDetails: details.error
        };

        this.auditLog(entry);
    }

    static error(message: string, context?: any) {
        // Log error to file or monitoring system
        console.error(`[ERROR] ${message}`, context);
    }

    static warn(message: string, context?: any) {
        console.warn(`[WARN] ${message}`, context);
    }

    static info(message: string, context?: any) {
        console.info(`[INFO] ${message}`, context);
    }
}