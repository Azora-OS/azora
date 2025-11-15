export class StripeMock {
  customers = {
    create: jest.fn().mockResolvedValue({
      id: 'cus_test123',
      email: 'test@azora.world',
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'cus_test123',
      email: 'test@azora.world',
    }),
  };

  paymentIntents = {
    create: jest.fn().mockResolvedValue({
      id: 'pi_test123',
      status: 'succeeded',
      amount: 1000,
      currency: 'usd',
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_test123',
      status: 'succeeded',
    }),
  };

  charges = {
    create: jest.fn().mockResolvedValue({
      id: 'ch_test123',
      status: 'succeeded',
      amount: 1000,
    }),
  };

  refunds = {
    create: jest.fn().mockResolvedValue({
      id: 're_test123',
      status: 'succeeded',
      amount: 1000,
    }),
  };
}

export const createStripeMock = (): StripeMock => new StripeMock();
