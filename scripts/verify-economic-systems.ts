import { CitadelService } from '../services/citadel-fund/src/citadel-service';
import { MiningEngine } from '../services/proof-of-value/src/mining-engine';

async function verify() {
    console.log('Verifying Economic Systems...');

    try {
        // 1. Verify Citadel Fund
        console.log('\n--- Testing Citadel Fund ---');
        const citadelService = new CitadelService();
        const revenue = 1000;
        console.log(`Simulating revenue collection: ${revenue} AZR`);
        await citadelService.collectRevenue(revenue, 'Test Transaction');

        const split = citadelService.calculateRevenueSplit(revenue);
        if (split.citadelAmount !== 100) throw new Error('Citadel split incorrect');
        if (split.providerAmount !== 900) throw new Error('Provider split incorrect');
        console.log('✅ Citadel Fund logic verified.');

        // 2. Verify Proof of Value & Deflation
        console.log('\n--- Testing Proof of Value & Deflation ---');
        const miningEngine = new MiningEngine();

        // Test Sovereign Allocation
        console.log('Testing Sovereign Allocation for ZA (South Africa)...');
        const allocated = miningEngine.allocateToSovereign('ZA', 1_000_000);
        if (!allocated) throw new Error('Sovereign allocation failed');

        const overAllocation = miningEngine.allocateToSovereign('ZA', 1);
        if (overAllocation) throw new Error('Sovereign allocation limit check failed');
        console.log('✅ Sovereign Allocation logic verified.');

        // Test Minting & Deflation
        const mintAmount = 500;
        console.log(`Minting ${mintAmount} AZR...`);
        await miningEngine.mint(mintAmount);

        const burnAmount = miningEngine.calculateBurnAmount(100);
        if (burnAmount !== 1) throw new Error('Burn calculation incorrect (should be 1%)');
        console.log(`Burn amount for 100 AZR: ${burnAmount} AZR`);

        console.log('✅ Mining & Deflation logic verified.');

        console.log('\n🎉 All Economic Systems verified!');
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verify();
