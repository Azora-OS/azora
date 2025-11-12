export class AzoraToken {
  private totalSupply = 1000000;
  private balances = new Map<string, number>();
  private basePrice = 1.0;

  constructor() {
    this.balances.set('treasury', this.totalSupply);
  }

  calculatePrice(): number {
    const circulatingSupply = this.totalSupply - (this.balances.get('treasury') || 0);
    const demandMultiplier = 1 + (circulatingSupply / this.totalSupply);
    return this.basePrice * demandMultiplier;
  }

  transfer(from: string, to: string, amount: number): boolean {
    const fromBalance = this.balances.get(from) || 0;
    if (fromBalance < amount) return false;
    
    this.balances.set(from, fromBalance - amount);
    this.balances.set(to, (this.balances.get(to) || 0) + amount);
    return true;
  }

  mint(to: string, amount: number): void {
    this.totalSupply += amount;
    this.balances.set(to, (this.balances.get(to) || 0) + amount);
  }

  getBalance(address: string): number {
    return this.balances.get(address) || 0;
  }
}
