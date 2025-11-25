import { EventEmitter } from 'events';
import { ServiceHealth } from './health-monitor';

export enum RecoveryAction {
    RESTART_SERVICE = 'RESTART_SERVICE',
    REROUTE_TRAFFIC = 'REROUTE_TRAFFIC',
    SCALE_UP = 'SCALE_UP',
    ROLLBACK = 'ROLLBACK',
    CIRCUIT_BREAK = 'CIRCUIT_BREAK',
    ALERT_TEAM = 'ALERT_TEAM'
}

export interface RecoveryStrategy {
    action: RecoveryAction;
    condition: (health: ServiceHealth) => boolean;
    execute: (service: ServiceHealth) => Promise<boolean>;
    priority: number; // Lower = higher priority
}

export interface RecoveryIncident {
    id: string;
    service: string;
    detectedAt: string;
    action: RecoveryAction;
    success: boolean;
    recoveryTime: number;
    details: string;
}

export class RecoveryStrategies extends EventEmitter {
    private strategies: RecoveryStrategy[];
    private incidents: RecoveryIncident[];

    constructor() {
        super();
        this.strategies = this.initializeStrategies();
        this.incidents = [];
    }

    /**
     * Initialize recovery strategies
     */
    private initializeStrategies(): RecoveryStrategy[] {
        return [
            // Strategy 1: Restart crashed services
            {
                action: RecoveryAction.RESTART_SERVICE,
                priority: 1,
                condition: (health) => health.status === 'down' && health.uptime < 50,
                execute: async (service) => {
                    console.log(`🔥 Phoenix: Restarting ${service.name}`);
                    // In production, this would restart the service via Docker/K8s
                    await this.sleep(2000);
                    return true;
                }
            },

            // Strategy 2: Circuit breaker for degraded services
            {
                action: RecoveryAction.CIRCUIT_BREAK,
                priority: 2,
                condition: (health) => health.errorRate > 50,
                execute: async (service) => {
                    console.log(`⚡ Phoenix: Circuit breaking ${service.name}`);
                    // Temporarily stop routing traffic to this service
                    await this.sleep(1000);
                    return true;
                }
            },

            // Strategy 3: Scale up under load
            {
                action: RecoveryAction.SCALE_UP,
                priority: 3,
                condition: (health) => health.responseTime > 5000 && health.status === 'degraded',
                execute: async (service) => {
                    console.log(`📈 Phoenix: Scaling up ${service.name}`);
                    // In production, add more instances
                    await this.sleep(3000);
                    return true;
                }
            },

            // Strategy 4: Reroute traffic
            {
                action: RecoveryAction.REROUTE_TRAFFIC,
                priority: 4,
                condition: (health) => health.status === 'degraded' && health.uptime < 80,
                execute: async (service) => {
                    console.log(`🔀 Phoenix: Rerouting traffic from ${service.name}`);
                    // Route to backup instance
                    await this.sleep(1000);
                    return true;
                }
            },

            // Strategy 5: Alert team for persistent issues
            {
                action: RecoveryAction.ALERT_TEAM,
                priority: 5,
                condition: (health) => health.status === 'down' && health.uptime < 20,
                execute: async (service) => {
                    console.log(`🚨 Phoenix: Alerting team about ${service.name}`);
                    // Send alert to team
                    await this.sleep(500);
                    return true;
                }
            }
        ];
    }

    /**
     * Attempt recovery for unhealthy service
     */
    async attemptRecovery(service: ServiceHealth): Promise<RecoveryIncident> {
        const startTime = Date.now();
        const incidentId = `incident-${Date.now()}`;

        // Find applicable strategy
        const strategy = this.strategies
            .filter(s => s.condition(service))
            .sort((a, b) => a.priority - b.priority)[0];

        if (!strategy) {
            console.log(`🔥 Phoenix: No recovery strategy for ${service.name}`);
            return {
                id: incidentId,
                service: service.name,
                detectedAt: new Date().toISOString(),
                action: RecoveryAction.ALERT_TEAM,
                success: false,
                recoveryTime: 0,
                details: 'No applicable recovery strategy'
            };
        }

        console.log(`🔥 Phoenix: Attempting ${strategy.action} for ${service.name}`);

        try {
            const success = await strategy.execute(service);
            const recoveryTime = Date.now() - startTime;

            const incident: RecoveryIncident = {
                id: incidentId,
                service: service.name,
                detectedAt: new Date().toISOString(),
                action: strategy.action,
                success,
                recoveryTime,
                details: `${strategy.action} ${success ? 'succeeded' : 'failed'}`
            };

            this.incidents.push(incident);
            this.emit('recovery-attempted', incident);

            // Log to AML
            await this.logToAuditLedger(incident);

            return incident;
        } catch (error) {
            const incident: RecoveryIncident = {
                id: incidentId,
                service: service.name,
                detectedAt: new Date().toISOString(),
                action: strategy.action,
                success: false,
                recoveryTime: Date.now() - startTime,
                details: `Recovery failed: ${error.message}`
            };

            this.incidents.push(incident);
            return incident;
        }
    }

    /**
     * Log recovery incident to Auditable Mutation Ledger
     */
    private async logToAuditLedger(incident: RecoveryIncident): Promise<void> {
        try {
            await fetch('http://localhost:3011/api/blockchain/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: 'phoenix-server',
                    to: 'system',
                    amount: 0,
                    currency: 'AZR',
                    type: 'Education', // Recovery teaches the system
                    data: { recoveryIncident: incident }
                })
            }).catch(() => console.warn('Failed to log recovery to AML'));
        } catch (error) {
            console.warn('AML logging failed:', error);
        }
    }

    /**
     * Get recovery history
     */
    getIncidents(): RecoveryIncident[] {
        return this.incidents;
    }

    /**
     * Get recovery statistics
     */
    getStats() {
        const total = this.incidents.length;
        const successful = this.incidents.filter(i => i.success).length;
        const avgRecoveryTime = this.incidents.reduce((sum, i) => sum + i.recoveryTime, 0) / total || 0;

        return {
            totalIncidents: total,
            successfulRecoveries: successful,
            successRate: total > 0 ? (successful / total) * 100 : 0,
            avgRecoveryTime: Math.round(avgRecoveryTime)
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default RecoveryStrategies;
