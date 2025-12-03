import dotenv from 'dotenv';

dotenv.config();

export interface Violation {
    id: string;
    serviceId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: string;
    status: 'open' | 'investigating' | 'resolved';
}

export interface ComplianceReport {
    serviceId: string;
    complianceScore: number; // 0-100
    violations: Violation[];
    lastCheck: string;
}

export class EthicsMonitor {
    private violations: Violation[] = [];
    private serviceScores: Record<string, number> = {};

    async reportViolation(serviceId: string, description: string, severity: Violation['severity']): Promise<Violation> {
        const violation: Violation = {
            id: `viol_${Date.now()}`,
            serviceId,
            severity,
            description,
            timestamp: new Date().toISOString(),
            status: 'open'
        };

        this.violations.push(violation);
        this.updateServiceScore(serviceId, severity);

        if (severity === 'critical') {
            await this.triggerIncidentResponse(violation);
        }

        return violation;
    }

    async getComplianceReport(serviceId: string): Promise<ComplianceReport> {
        const serviceViolations = this.violations.filter(v => v.serviceId === serviceId);
        const score = this.serviceScores[serviceId] || 100;

        return {
            serviceId,
            complianceScore: score,
            violations: serviceViolations,
            lastCheck: new Date().toISOString()
        };
    }

    private updateServiceScore(serviceId: string, severity: Violation['severity']) {
        let penalty = 0;
        switch (severity) {
            case 'low': penalty = 2; break;
            case 'medium': penalty = 5; break;
            case 'high': penalty = 15; break;
            case 'critical': penalty = 30; break;
        }

        const currentScore = this.serviceScores[serviceId] || 100;
        this.serviceScores[serviceId] = Math.max(0, currentScore - penalty);
    }

    private async triggerIncidentResponse(violation: Violation) {
        console.error(`🚨 CRITICAL ETHICS VIOLATION: ${violation.serviceId} - ${violation.description}`);
        // In production, this would send alerts via PagerDuty/Slack/Email
    }

    async resolveViolation(violationId: string) {
        const violation = this.violations.find(v => v.id === violationId);
        if (violation) {
            violation.status = 'resolved';
            // Restore some score?
        }
        return violation;
    }
}

export const ethicsMonitor = new EthicsMonitor();
