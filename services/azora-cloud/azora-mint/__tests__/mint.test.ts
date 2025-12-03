import { TokenMinter } from '../src/token-minter';
import { EconomicPolicyEngine } from '../src/economic-policy';

describe('TokenMinter', () => {
  let minter: TokenMinter;
  let economicPolicy: EconomicPolicyEngine;

  beforeEach(() => {
    economicPolicy = new EconomicPolicyEngine();
    minter = new TokenMinter(economicPolicy);
  });

  it('should create a wallet', () => {
    const wallet = minter.createWallet('user1');
    expect(wallet).toHaveProperty('address');
    expect(wallet.balance).toBe(0);
    expect(wallet.staked).toBe(0);
  });

  it('should mint rewards', () => {
    const wallet = minter.createWallet('user1');
    const result = minter.mintReward(wallet.address, 100, 'test');
    expect(result.success).toBe(true);
    expect(result.balance).toBe(100);
  });

  it('should transfer tokens', () => {
    const wallet1 = minter.createWallet('user1');
    const wallet2 = minter.createWallet('user2');
    minter.mintReward(wallet1.address, 100, 'test');
    const result = minter.transfer(wallet1.address, wallet2.address, 50);
    expect(result.success).toBe(true);
    expect(result.from).toBe(50);
    expect(result.to).toBe(50);
  });

  it('should stake tokens', () => {
    const wallet = minter.createWallet('user1');
    minter.mintReward(wallet.address, 100, 'test');
    const result = minter.stake(wallet.address, 50);
    expect(result.success).toBe(true);
    expect(result.staked).toBe(50);
    expect(result.balance).toBe(50);
  });

  it('should unstake tokens', () => {
    const wallet = minter.createWallet('user1');
    minter.mintReward(wallet.address, 100, 'test');
    minter.stake(wallet.address, 50);
    const result = minter.unstake(wallet.address, 50);
    expect(result.success).toBe(true);
    expect(result.staked).toBe(0);
    expect(result.balance).toBe(100);
  });
});
