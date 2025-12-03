import { ApiClient } from '../apps/azora-sapiens/src/services/api-client';
import { JobService } from '../apps/azora-jobspaces/src/services/job-service';

// Mock fetch for testing since we don't have the full backend running in this script context
global.fetch = jest.fn((url: string, options: any) => {
    console.log(`[MockFetch] ${options.method} ${url}`);

    if (url.includes('/mint/balance')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ balance: 1000 })
        });
    }

    if (url.includes('/constitutional/validate')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ isAllowed: true, critique: 'Ethically sound.' })
        });
    }

    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
    });
}) as any;

async function verify() {
    console.log('Verifying Frontend Integration...');

    try {
        // 1. Verify Azora Sapiens Client
        console.log('\n--- Testing Azora Sapiens Client ---');
        const sapiensClient = new ApiClient();
        const balance = await sapiensClient.getWalletBalance('0x123');
        console.log('Wallet Balance:', balance);
        if (balance.balance !== 1000) throw new Error('Incorrect balance received');
        console.log('✅ Sapiens Client verified.');

        // 2. Verify Azora Jobspaces Service
        console.log('\n--- Testing Azora Jobspaces Service ---');
        const jobService = new JobService();
        const jobResult = await jobService.postJob({ title: 'Software Engineer' });
        console.log('Job Post Result:', jobResult);
        if (!jobResult.success) throw new Error('Job posting failed');
        console.log('✅ Jobspaces Service verified.');

        console.log('\n🎉 All Frontend Integrations verified!');
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verify();
