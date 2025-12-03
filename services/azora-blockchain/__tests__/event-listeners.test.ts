import * as listeners from '../src/event-listeners';
import { blockchainService } from '../src/blockchain-service';

jest.mock('../src/blockchain-repository', () => ({
  recordBlockchainEvent: jest.fn()
}));

describe('Event Listeners', () => {
  it('starts listeners without throwing', async () => {
    // The blockchain service has a constructor that attempts to connect; for tests we can stub provider methods
    // We will just call startEventListeners and ensure no exception is thrown
    await expect(listeners.startEventListeners()).resolves.not.toThrow();
    // stop them after starting
    await listeners.stopEventListeners();
  });
});
