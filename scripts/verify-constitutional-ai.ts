import { ConstitutionalEngine, Action } from '../services/constitutional-ai/src/constitutional-engine';
import { EthicsMonitor } from '../services/ai-ethics-monitor/src/monitor';
import { CourtService } from '../services/constitutional-court-service/src/court-service';

async function verify() {
    console.log('Verifying Constitutional AI Systems...');

    try {
        // 1. Verify Constitutional Engine
        console.log('\n--- Testing Constitutional Engine ---');
        const engine = new ConstitutionalEngine();

        const ethicalAction: Action = {
            type: 'create_course',
            actorId: 'teacher1',
            payload: { title: 'Ubuntu Philosophy' },
            context: 'education'
        };
        const validResult = engine.validateAction(ethicalAction);
        if (!validResult.isAllowed) throw new Error('Ethical action blocked incorrectly');
        console.log('✅ Ethical action allowed.');

        const unethicalAction: Action = {
            type: 'delete_user_data',
            actorId: 'admin',
            payload: { userId: 'user1' },
            context: 'malicious_intent' // Missing 'user_request' context
        };
        const invalidResult = engine.validateAction(unethicalAction);
        if (invalidResult.isAllowed) throw new Error('Unethical action allowed incorrectly');
        console.log('✅ Unethical action blocked correctly.');

        // 2. Verify Ethics Monitor
        console.log('\n--- Testing Ethics Monitor ---');
        const monitor = new EthicsMonitor();
        const isSafe = monitor.monitorTransaction(500); // Safe amount
        if (!isSafe) throw new Error('Safe transaction blocked');

        const isUnsafe = monitor.monitorTransaction(2000000); // Unsafe amount (> 1M)
        if (isUnsafe) throw new Error('Unsafe transaction allowed');
        console.log('✅ Ethics Monitor blocking suspicious transactions.');

        // 3. Verify Constitutional Court
        console.log('\n--- Testing Constitutional Court ---');
        const court = new CourtService();
        const dispute = court.fileDispute('user123', 'Unfair ban');
        console.log(`Case filed: ${dispute.id}`);

        const ruling = court.issueRuling(dispute.id);
        if (ruling.status !== 'RULING_ISSUED') throw new Error('Ruling not issued');
        console.log(`Ruling: ${ruling.ruling}`);
        console.log('✅ Constitutional Court workflow verified.');

        console.log('\n🎉 All Constitutional AI Systems verified!');
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verify();
