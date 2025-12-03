import EventEmitter from 'events';

export interface QueuedTransaction {
  id: string;
  to: string;
  data?: string;
  retries?: number;
  maxRetries?: number;
  backoff?: number;
}

export class TransactionQueue extends EventEmitter {
  private queue: QueuedTransaction[] = [];
  private processing = false;

  enqueue(tx: QueuedTransaction) {
    this.queue.push({ ...tx, retries: 0, maxRetries: tx.maxRetries || 5, backoff: tx.backoff || 500 });
    this.processNext();
  }

  private async processNext() {
    if (this.processing) return;
    if (this.queue.length === 0) return;
    this.processing = true;

    const tx = this.queue.shift()!;

    try {
      // Placeholder for actual transaction submission
      // Consumers of this queue should listen to 'submit' to send the tx
      this.emit('submit', tx);
    } catch (error) {
      tx.retries = (tx.retries || 0) + 1;
      if ((tx.retries || 0) <= (tx.maxRetries || 5)) {
        const backoff = (tx.backoff || 500) * Math.pow(2, tx.retries || 1);
        setTimeout(() => this.enqueue(tx), backoff);
      } else {
        this.emit('failed', tx, error);
      }
    } finally {
      this.processing = false;
      // process next in queue
      setImmediate(() => this.processNext());
    }
  }
}

export const txQueue = new TransactionQueue();
