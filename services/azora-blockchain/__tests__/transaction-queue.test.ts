import { txQueue, TransactionQueue } from '../src/transaction-queue';

describe('Transaction Queue', () => {
  it('emits submit event when a transaction is enqueued', (done) => {
    const tx = { id: 'tx1', to: '0xabc', data: '0x' };
    txQueue.once('submit', (queuedTx) => {
      try {
        expect(queuedTx.id).toBe('tx1');
        done();
      } catch (err) {
        done(err);
      }
    });
    txQueue.enqueue(tx as any);
  });
});
