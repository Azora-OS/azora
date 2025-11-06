#!/usr/bin/env node

/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Stress Test Runner
 * Executes comprehensive planetary-scale stress testing
 */

import { AzoraStressTest } from './azora-stress-test.js';

async function main() {
    console.log('🌍 AZORA OS PLANETARY STRESS TEST SUITE');
    console.log('Constitutional Compliance: Article VI - Infrastructure Independence');
    console.log('═'.repeat(60));

    // Environment check
    if (!process.env.AZORA_API_URL) {
        console.warn('⚠️  AZORA_API_URL not set, using localhost:3000');
        process.env.AZORA_API_URL = 'http://localhost:3000';
    }

    const stressTest = new AzoraStressTest();

    try {
        await stressTest.runFullStressTest();
        console.log('✅ Stress testing completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Stress testing failed:', error);
        process.exit(1);
    }
}

main().catch(console.error);