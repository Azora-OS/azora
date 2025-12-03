import { ConstitutionalEngine, Action } from '../../constitutional-ai/src/constitutional-engine';

export class EthicsMonitor {
    private engine: ConstitutionalEngine;

    constructor() {
        this.engine = new ConstitutionalEngine();
    }

    /**
     * Monitors an action for ethical compliance.
     * @param action The action to monitor.
     * @returns True if the action is allowed, False otherwise.
     */
    monitorAction(action: Action): boolean {
        console.log(`[EthicsMonitor] Analyzing action: ${action.type}`);
        const result = this.engine.validateAction(action);

        if (!result.isAllowed) {
            console.warn(`[EthicsMonitor] 🚨 ACTION BLOCKED! Violation detected.`);
            console.warn(`[EthicsMonitor] Critique: ${result.critique}`);
            console.warn(`[EthicsMonitor] Violations: ${result.violations.join(', ')}`);
            return false;
        }

        console.log(`[EthicsMonitor] ✅ Action allowed. Score: ${result.score}`);
        return true;
    }

    /**
     * Monitors a transaction for suspicious patterns (simplified).
     * @param amount Transaction amount.
     * @returns True if safe.
     */
    monitorTransaction(amount: number): boolean {
        // Construct an action for the engine
        const action: Action = {
            type: 'mint_token',
            actorId: 'system',
            payload: { amount },
            context: 'transaction_monitor'
        };

        return this.monitorAction(action);
    }
}
