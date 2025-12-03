import { blockchainService } from '../src/blockchain-service';

describe('Gas fallback', () => {
  it('returns a safe gas price string', async () => {
    const result = await blockchainService.safeGasPriceFallback();
    expect(typeof result).toBe('string');
  });
});
