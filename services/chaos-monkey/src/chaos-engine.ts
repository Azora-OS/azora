import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { FailureType, ChaosEvent, ChaosConfig, ChaosResult } from './failure-types';

export class ChaosEngine extends EventEmitter {
    private config: ChaosConfig;
    private activeEvents: Map<string, ChaosEvent>;
    private chaosHistory: ChaosResult[];

    constructor(config: ChaosConfig) {
        super();
        this.config = config;
        this.activeEvents = new Map();
        this.chaosHistory = [];
    }

    /**
     * Inject a random failure into the system
     */
    async injectChaos(): Promise<ChaosResult> {
        if (!this.config.enabled) {
            throw new Error('Chaos Monkey is disabled');
        }

        // Select random target service
        const targetService = this.selectRandomTarget();

        // Select random failure type
        const failureType = this.selectRandomFailure();

        // Create chaos event
        const event: ChaosEvent = {
            id: uuidv4(),
            type: failureType,
            targetService,
            timestamp: new Date().toISOString(),
            duration: this.calculateDuration(),
            intensity: this.config.intensity,
            metadata: {}
        };

        console.log(`🐵 ChaosMonkey: Injecting ${failureType} into ${targetService}`);

        // Execute the chaos
        const result = await this.executeChaos(event);

        // Record to history
        this.chaosHistory.push(result);
        this.emit('chaos-injected', result);

        return result;
    }

    /**
     * Execute specific chaos event
     */
    private async executeChaos(event: ChaosEvent): Promise<ChaosResult> {
        this.activeEvents.set(event.id, event);
        const startTime = Date.now();

        try {
            switch (event.type) {
                case FailureType.SERVICE_CRASH:
                    await this.crashService(event);
                    break;
                case FailureType.NETWORK_LATENCY:
                    await this.injectLatency(event);
                    break;
                case FailureType.DATABASE_DISCONNECT:
                    await this.disconnectDatabase(event);
                    break;
                case FailureType.MEMORY_LEAK:
                    await this.simulateMemoryLeak(event);
                    break;
                case FailureType.CPU_SPIKE:
                    await this.simulateCPUSpike(event);
                    break;
                default:
                    throw new Error(`Unknown failure type: ${event.type}`);
            }

            const recoveryTime = Date.now() - startTime;

            return {
                eventId: event.id,
                success: true,
                impact: {
                    servicesAffected: [event.targetService],
                    errorRate: this.calculateErrorRate(),
                    recoveryTime
                },
                learnings: this.extractLearnings(event, recoveryTime)
            };
        } catch (error) {
            return {
                eventId: event.id,
                success: false,
                impact: {
                    servicesAffected: [event.targetService],
                    errorRate: 0,
                    recoveryTime: Date.now() - startTime
                },
                learnings: [`Chaos injection failed: ${error.message}`]
            };
        } finally {
            this.activeEvents.delete(event.id);
        }
    }

    /**
     * Crash a service (simulated)
     */
    private async crashService(event: ChaosEvent): Promise<void> {
        console.log(`💥 Crashing service: ${event.targetService}`);
        // In production, this would send a kill signal to the service
        // For now, we simulate by logging
        await this.sleep(event.duration);
    }

    /**
     * Inject network latency
     */
    private async injectLatency(event: ChaosEvent): Promise<void> {
        const latencyMs = this.config.intensity === 'high' ? 5000 :
            this.config.intensity === 'medium' ? 2000 : 500;
        console.log(`🐌 Injecting ${latencyMs}ms latency to ${event.targetService}`);
        await this.sleep(latencyMs);
    }

    /**
     * Disconnect database
     */
    private async disconnectDatabase(event: ChaosEvent): Promise<void> {
        console.log(`🔌 Disconnecting database for ${event.targetService}`);
        // In production, this would close DB connections
        await this.sleep(event.duration);
    }

    /**
     * Simulate memory leak
     */
    private async simulateMemoryLeak(event: ChaosEvent): Promise<void> {
        console.log(`💾 Simulating memory leak in ${event.targetService}`);
        // In production, this would gradually allocate memory
        await this.sleep(event.duration);
    }

    /**
     * Simulate CPU spike
     */
    private async simulateCPUSpike(event: ChaosEvent): Promise<void> {
        console.log(`⚡ Simulating CPU spike in ${event.targetService}`);
        // In production, this would run CPU-intensive operations
        await this.sleep(event.duration);
    }

    /**
     * Select random target service
     */
    private selectRandomTarget(): string {
        const availableTargets = this.config.targetServices.filter(
            service => !this.config.excludeServices.includes(service)
        );
        return availableTargets[Math.floor(Math.random() * availableTargets.length)];
    }

    /**
     * Select random failure type
     */
    private selectRandomFailure(): FailureType {
        const failures = Object.values(FailureType);
        return failures[Math.floor(Math.random() * failures.length)];
    }

    /**
     * Calculate chaos duration based on intensity
     */
    private calculateDuration(): number {
        const base = this.config.intensity === 'high' ? 60000 :
            this.config.intensity === 'medium' ? 30000 : 10000;
        return base + Math.random() * 10000;
    }

    /**
     * Calculate current error rate
     */
    private calculateErrorRate(): number {
        // In production, this would query actual metrics
        return Math.random() * 0.1; // 0-10% error rate
    }

    /**
     * Extract learnings from chaos event
     */
    private extractLearnings(event: ChaosEvent, recoveryTime: number): string[] {
        const learnings: string[] = [];

        if (recoveryTime < 5000) {
            learnings.push(`Fast recovery: ${event.targetService} recovered in ${recoveryTime}ms`);
        } else if (recoveryTime > 30000) {
            learnings.push(`Slow recovery: ${event.targetService} took ${recoveryTime}ms to recover`);
        }

        learnings.push(`${event.type} handled successfully by ${event.targetService}`);

        return learnings;
    }

    /**
     * Get chaos history
     */
    public getHistory(): ChaosResult[] {
        return this.chaosHistory;
    }

    /**
     * Get active chaos events
     */
    public getActiveEvents(): ChaosEvent[] {
        return Array.from(this.activeEvents.values());
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default ChaosEngine;
