interface LoanRequest {
  studentId: string;
  amount: number;
  collateral: number;
  interestRate: number;
  term: number;
}

interface Loan extends LoanRequest {
  id: string;
  startDate: Date;
  status: 'active' | 'repaid' | 'defaulted';
}

export class DeFiLendingPlatform {
  private loans = new Map<string, Loan>();
  private deposits = new Map<string, number>();

  deposit(userId: string, amount: number): void {
    this.deposits.set(userId, (this.deposits.get(userId) || 0) + amount);
  }

  requestLoan(req: LoanRequest): string | null {
    if (req.collateral < req.amount * 1.5) return null;
    
    const id = `LOAN-${Date.now()}`;
    const loan: Loan = {
      ...req,
      id,
      startDate: new Date(),
      status: 'active'
    };
    
    this.loans.set(id, loan);
    this.deposits.set(req.studentId, (this.deposits.get(req.studentId) || 0) + req.amount);
    return id;
  }

  repay(loanId: string, amount: number): boolean {
    const loan = this.loans.get(loanId);
    if (!loan || loan.status !== 'active') return false;
    
    loan.status = 'repaid';
    return true;
  }

  getBalance(userId: string): number {
    return this.deposits.get(userId) || 0;
  }
}
