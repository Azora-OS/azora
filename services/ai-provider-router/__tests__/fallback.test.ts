import { ProviderFallback } from '../src/providerFallback';

describe('Provider Fallback', () => {
  let fallback: ProviderFallback;

  beforeEach(() => {
    fallback = new ProviderFallback();
  });

  it('should use primary provider when available', async () => {
    let usedProvider = '';
    const result = await fallback.executeWithFallback(async (provider) => {
      usedProvider = provider;
      return 'success';
    });

    expect(result).toBe('success');
    expect(usedProvider).toBe('openai');
  });

  it('should fallback to secondary provider on failure', async () => {
    let attempts = 0;
    const result = await fallback.executeWithFallback(async (provider) => {
      attempts++;
      if (provider === 'openai') throw new Error('Primary failed');
      return `success-${provider}`;
    });

    expect(attempts).toBeGreaterThan(1);
    expect(result).toContain('success');
  });

  it('should throw when all providers fail', async () => {
    await expect(
      fallback.executeWithFallback(async () => {
        throw new Error('All fail');
      })
    ).rejects.toThrow('All providers failed');
  });
});
