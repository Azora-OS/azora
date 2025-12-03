import assert from 'assert';
import { isPremiumEntitled } from '../../src/vs/workbench/contrib/azstudio/browser/premiumGate.ts';

export async function runPremiumGateTests() {
    console.log('Running premiumGate node tests...');

    // Ensure default environment (clear AZSTUDIO_PREMIUM)
    const prev = process.env.AZSTUDIO_PREMIUM;
    delete process.env.AZSTUDIO_PREMIUM;
    const defaultVal = await isPremiumEntitled();
    assert.strictEqual(defaultVal, false, 'Default should not be premium (no env var)');

    // Force premium via env var
    process.env.AZSTUDIO_PREMIUM = 'true';
    const forcedVal = await isPremiumEntitled();
    assert.strictEqual(forcedVal, true, 'When AZSTUDIO_PREMIUM=true, entitlement should be true');

    // Revert
    if (prev === undefined) { delete process.env.AZSTUDIO_PREMIUM; } else { process.env.AZSTUDIO_PREMIUM = prev; }

    console.log('premiumGate node tests passed');
}

function isMainModule() {
    try { if (typeof require === 'function' && require.main === module) return true; } catch {
        // ignore
    }
    // ESM entry detection (ts-node/esm)
    try {
        const m = new URL(import.meta.url);
        const entry = process.argv[1] || '';
        const fileName = entry.replace(/^.*[\/\\]/, '');
        return decodeURI(m.pathname || m.href).endsWith(fileName);
    } catch {
        return false;
    }
}
if (isMainModule()) {
    runPremiumGateTests().catch(e => { console.error(e); process.exit(1); });
}
