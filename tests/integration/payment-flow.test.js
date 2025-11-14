const { apiClient } = require('../../packages/api-client');

describe('Payment Flow Integration', () => {
  let userId, token;

  beforeAll(async () => {
    const auth = await apiClient.auth.login('test@azora.world', 'password');
    userId = auth.user.id;
    token = auth.accessToken;
    apiClient.setToken(token);
  });

  test('should create payment intent', async () => {
    const payment = await apiClient.payments.createPayment(50.00, 'usd', userId);
    expect(payment.clientSecret).toBeDefined();
    expect(payment.id).toBeDefined();
  });

  test('should fetch wallet balance', async () => {
    const wallet = await apiClient.wallet.getBalance();
    expect(wallet.balance).toBeGreaterThanOrEqual(0);
  });

  test('should fetch transaction history', async () => {
    const transactions = await apiClient.wallet.getTransactions();
    expect(Array.isArray(transactions)).toBe(true);
  });
});
