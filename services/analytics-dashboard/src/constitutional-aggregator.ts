import axios from 'axios';
import { logger } from './utils/logger';

export interface ConstitutionalMetrics {
    timestamp: string;
    ubuntuScore: number;
    services: {
        kyc: ServiceHealth;
        tamperProof: ServiceHealth;
        governance: ServiceHealth;
        subscription: ServiceHealth;
        lending: ServiceHealth;
        enterprise: ServiceHealth;
    };
    compliance: {
        verifications: number;
        integrityChecks: number;
        activeProposals: number;
        activeSubscriptions: number;
        activeLoans: number;
        activeLicenses: number;
    };
}

interface ServiceHealth {
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    lastCheck: string;
}

export class ConstitutionalAggregator {
    private services = {
        kyc: process.env.KYC_SERVICE_URL || 'http://localhost:3027',
        tamperProof: process.env.TAMPER_PROOF_SERVICE_URL || 'http://localhost:3028',
        governance: process.env.GOVERNANCE_SERVICE_URL || 'http://localhost:3026',
        subscription: process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:3029',
        lending: process.env.LENDING_SERVICE_URL || 'http://localhost:3030',
        enterprise: process.env.ENTERPRISE_SERVICE_URL || 'http://localhost:3031',
    };

    async getMetrics(): Promise<ConstitutionalMetrics> {
        const [kyc, tamperProof, governance, subscription, lending, enterprise] = await Promise.allSettled([
            this.fetchServiceStats(this.services.kyc, 'kyc-aml-service'),
            this.fetchServiceStats(this.services.tamperProof, 'tamper-proof-data-service'),
            this.fetchServiceStats(this.services.governance, 'governance-service'),
            this.fetchServiceStats(this.services.subscription, 'subscription-service'),
            this.fetchServiceStats(this.services.lending, 'lending-service'),
            this.fetchServiceStats(this.services.enterprise, 'enterprise-service'),
        ]);

        // Calculate Ubuntu Score based on service health and activity
        // Base score 100, deduct for downtime
        let ubuntuScore = 100;
        const results = [kyc, tamperProof, governance, subscription, lending, enterprise];
        const downCount = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.health.status !== 'healthy')).length;
        ubuntuScore -= (downCount * 15);

        // Extract stats safely
        const kycStats = this.extractStats(kyc);
        const tpStats = this.extractStats(tamperProof);
        const govStats = this.extractStats(governance);
        const subStats = this.extractStats(subscription);
        const lendStats = this.extractStats(lending);
        const entStats = this.extractStats(enterprise);

        return {
            timestamp: new Date().toISOString(),
            ubuntuScore: Math.max(0, ubuntuScore),
            services: {
                kyc: this.extractHealth(kyc),
                tamperProof: this.extractHealth(tamperProof),
                governance: this.extractHealth(governance),
                subscription: this.extractHealth(subscription),
                lending: this.extractHealth(lending),
                enterprise: this.extractHealth(enterprise),
            },
            compliance: {
                verifications: kycStats.totalVerifications || 0,
                integrityChecks: tpStats.totalChecks || 0,
                activeProposals: govStats.active || 0,
                activeSubscriptions: subStats.activeSubscriptions || 0,
                activeLoans: lendStats.activeLoans || 0,
                activeLicenses: entStats.activeLicenses || 0,
            }
        };
    }

    private async fetchServiceStats(url: string, serviceName: string) {
        const start = Date.now();
        try {
            const response = await axios.get(`${url}/api/health`, { timeout: 2000 });
            const latency = Date.now() - start;
            return {
                health: { status: 'healthy', latency, lastCheck: new Date().toISOString() },
                stats: response.data.stats || {}
            };
        } catch (error) {
            return {
                health: { status: 'down', latency: 0, lastCheck: new Date().toISOString() },
                stats: {}
            };
        }
    }

    private extractStats(result: PromiseSettledResult<any>) {
        return result.status === 'fulfilled' ? result.value.stats : {};
    }

    private extractHealth(result: PromiseSettledResult<any>): ServiceHealth {
        if (result.status === 'fulfilled') {
            return result.value.health;
        }
        return { status: 'down', latency: 0, lastCheck: new Date().toISOString() };
    }
}

export const constitutionalAggregator = new ConstitutionalAggregator();
