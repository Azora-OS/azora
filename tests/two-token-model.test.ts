import { convertAZRToAToken, convertATokenToAZR } from '../path/to/token-converter';

describe('Two-Token Economic Model Validation', () => {
  it('should correctly convert AZR to an a-Token', () => {
    const amountAZR = 100;
    const conversionRate = 0.5;
    const amountAToken = convertAZRToAToken(amountAZR, conversionRate);
    expect(amountAToken).toBe(50);
  });

  it('should correctly convert an a-Token to AZR', () => {
    const amountAToken = 50;
    const conversionRate = 0.5;
    const amountAZR = convertATokenToAZR(amountAToken, conversionRate);
    expect(amountAZR).toBe(100);
  });
});