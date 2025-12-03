import { isPremiumEntitled } from '../src/vs/workbench/contrib/azstudio/browser/premiumGate';

describe('premiumGate', () => {
  test('respects AZSTUDIO_PREMIUM env', async () => {
    process.env.AZSTUDIO_PREMIUM = 'true';
    const result = await isPremiumEntitled();
    expect(result).toBe(true);
    delete process.env.AZSTUDIO_PREMIUM;
  });

  test('reads product.json at repo root if present', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const tmpDir = path.join(process.cwd(), 'tmp_premium_test');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const productPath = path.join(tmpDir, 'product.json');
    const productContent = JSON.stringify({ featureFlags: { premiumEnabledByDefault: true } });
    fs.writeFileSync(productPath, productContent, 'utf-8');

    const origCwd = process.cwd();
    process.chdir(tmpDir);
    const result = await isPremiumEntitled();
    expect(result).toBe(true);
    process.chdir(origCwd);
    fs.rmSync(productPath);
    fs.rmdirSync(tmpDir);
  });
});
