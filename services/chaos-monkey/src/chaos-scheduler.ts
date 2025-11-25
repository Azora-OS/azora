import cron from 'node-cron';
import { ChaosEngine } from './chaos-engine';
import { ChaosConfig } from './failure-types';

export class ChaosScheduler {
    private engine: ChaosEngine;
    private config: ChaosConfig;
    private scheduledTask: cron.ScheduledTask | null;

    constructor(config: ChaosConfig) {
        this.config = config;
        this.engine = new ChaosEngine(config);
        this.scheduledTask = null;
    }

    /**
     * Start scheduled chaos injection
     */
    start(): void {
        if (!this.config.enabled) {
            console.log('🐵 ChaosMonkey is disabled');
            return;
        }

        console.log(`🐵 ChaosMonkey started with ${this.config.intensity} intensity`);
        console.log(`   Schedule: ${this.config.schedule.frequency}`);
        console.log(`   Duration: ${this.config.schedule.duration} minutes`);
        console.log(`   Targets: ${this.config.targetServices.join(', ')}`);
        console.log(`   Excluded: ${this.config.excludeServices.join(', ')}`);

        // Schedule chaos injection
        this.scheduledTask = cron.schedule(this.config.schedule.frequency, async () => {
            console.log('🐵 ChaosMonkey: Scheduled chaos window starting...');
            await this.runChaosWindow();
        });

        // Listen to chaos events
        this.engine.on('chaos-injected', (result) => {
            console.log(`🐵 Chaos event completed:`, result);
            this.logToAuditLedger(result);
        });
    }

    /**
     * Stop scheduled chaos injection
     */
    stop(): void {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            console.log('🐵 ChaosMonkey stopped');
        }
    }

    /**
     * Run a chaos window (inject multiple failures over duration)
     */
    private async runChaosWindow(): Promise<void> {
        const endTime = Date.now() + (this.config.schedule.duration * 60 * 1000);
        let eventCount = 0;

        while (Date.now() < endTime) {
            try {
                // Check if we need Constitutional AI approval
                if (this.config.requireApproval && this.config.intensity === 'high') {
                    const approved = await this.requestConstitutionalApproval();
                    if (!approved) {
                        console.log('🐵 High-intensity chaos rejected by Constitutional AI');
                        break;
                    }
                }

                // Inject chaos
                await this.engine.injectChaos();
                eventCount++;

                // Wait before next injection
                const waitTime = this.calculateWaitTime();
                await this.sleep(waitTime);
            } catch (error) {
                console.error('🐵 Chaos injection error:', error);
            }
        }

        console.log(`🐵 Chaos window complete. Injected ${eventCount} events.`);
    }

    /**
     * Request approval from Constitutional AI
     */
    private async requestConstitutionalApproval(): Promise<boolean> {
        try {
            const response = await fetch('http://localhost:3014/api/critique', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `High-intensity chaos injection requested. This will intentionally stress the system.`,
                    actionType: 'TRANSACTION',
                    agentId: 'chaos-monkey'
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.success && data.data.verdict !== 'REJECT';
            }
        } catch (error) {
            console.warn('Constitutional AI unavailable, proceeding with chaos');
        }
        return true; // Fail open
    }

    /**
     * Log chaos event to Auditable Mutation Ledger
     */
    private async logToAuditLedger(result: any): Promise<void> {
        try {
            // In production, log to azora-mint blockchain
            await fetch('http://localhost:3011/api/blockchain/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: 'chaos-monkey',
                    to: 'system',
                    amount: 0,
                    currency: 'AZR',
                    type: 'Education', // Chaos teaches the system
                    data: { chaosEvent: result }
                })
            }).catch(() => console.warn('Failed to log to AML'));
        } catch (error) {
            console.warn('AML logging failed:', error);
        }
    }

    /**
     * Calculate wait time between chaos events
     */
    private calculateWaitTime(): number {
        const base = this.config.intensity === 'high' ? 30000 :
            this.config.intensity === 'medium' ? 60000 : 120000;
        return base + Math.random() * 30000;
    }

    /**
     * Get chaos history
     */
    public getHistory() {
        return this.engine.getHistory();
    }

    /**
     * Get active events
     */
    public getActiveEvents() {
        return this.engine.getActiveEvents();
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default ChaosScheduler;
