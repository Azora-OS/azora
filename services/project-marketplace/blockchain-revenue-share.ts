import { createHash } from 'crypto';

interface Transaction {
  id: string;
  projectId: string;
  studentId: string;
  amount: number;
  platformFee: number;
  timestamp: Date;
  hash: string;
}

interface Block {
  index: number;
  timestamp: Date;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
}

export class BlockchainRevenueShare {
  private chain: Block[] = [];
  private pendingTransactions: Transaction[] = [];

  constructor() {
    this.chain.push(this.createGenesisBlock());
  }

  recordRevenue(projectId: string, studentId: string, amount: number, platformFee: number): Transaction {
    const transaction: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      studentId,
      amount,
      platformFee,
      timestamp: new Date(),
      hash: ''
    };
    
    transaction.hash = this.hashTransaction(transaction);
    this.pendingTransactions.push(transaction);
    
    if (this.pendingTransactions.length >= 10) {
      this.mineBlock();
    }
    
    return transaction;
  }

  mineBlock(): Block {
    const block: Block = {
      index: this.chain.length,
      timestamp: new Date(),
      transactions: [...this.pendingTransactions],
      previousHash: this.chain[this.chain.length - 1].hash,
      hash: ''
    };
    
    block.hash = this.hashBlock(block);
    this.chain.push(block);
    this.pendingTransactions = [];
    
    return block;
  }

  getStudentEarnings(studentId: string): number {
    return this.chain
      .flatMap(block => block.transactions)
      .filter(tx => tx.studentId === studentId)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  verifyChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      
      if (current.hash !== this.hashBlock(current)) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }

  private createGenesisBlock(): Block {
    const block: Block = {
      index: 0,
      timestamp: new Date(),
      transactions: [],
      previousHash: '0',
      hash: ''
    };
    block.hash = this.hashBlock(block);
    return block;
  }

  private hashTransaction(tx: Transaction): string {
    return createHash('sha256')
      .update(`${tx.projectId}${tx.studentId}${tx.amount}${tx.platformFee}${tx.timestamp}`)
      .digest('hex');
  }

  private hashBlock(block: Block): string {
    return createHash('sha256')
      .update(`${block.index}${block.timestamp}${JSON.stringify(block.transactions)}${block.previousHash}`)
      .digest('hex');
  }
}
