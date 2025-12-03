#!/usr/bin/env node
import { runPremiumGateTests } from './test-premium-gate.ts';

async function main() {
    try {
        await runPremiumGateTests();
        console.log('\nAll local unit tests passed');
    } catch (e) {
        console.error('Local unit tests failed:', e);
        process.exitCode = 1;
    }
}

main();
