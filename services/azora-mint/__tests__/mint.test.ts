import { ProofOfKnowledgeEngine } from '../src/pok-engine';
import { EconomicPolicyEngine } from '../src/economic-policy';
import { TokenMinter } from '../src/token-minter';

describe('Proof-of-Knowledge Engine', () => {
  let pokEngine: ProofOfKnowledgeEngine;

  beforeEach(() => {
    pokEngine = new ProofOfKnowledgeEngine();
  });

  it('should generate challenge', () => {
    const challenge = pokEngine.generateChallenge('student-1', 'javascript');
    expect(challenge.studentId).toBe('student-1');
    expect(challenge.subject).toBe('javascript');
    expect(Array.isArray(challenge.questions)).toBe(true);
  });

  it('should verify correct answers', () => {
    const challenge = pokEngine.generateChallenge('student-1', 'javascript');
    const answers = challenge.questions.map(q => q.a);
    const proof = pokEngine.verifyProof(challenge, answers);
    expect(proof.valid).toBe(true);
    expect(proof.score).toBe(1);
  });

  it('should calculate rewards', () => {
    const proof = { score: 0.8, correct: 4, total: 5 };
    const reward = pokEngine.calculateReward(proof, 2);
    expect(reward).toBeGreaterThan(0);
  });
});

describe('Economic Policy Engine', () => {
  let policy: EconomicPolicyEngine;

  beforeEach(() => {
    policy = new EconomicPolicyEngine();
  });

  it('should mint tokens within supply limit', () => {
    const result = policy.mintTokens(100, 'test');
    expect(result.success).toBe(true);
    expect(policy.currentSupply).toBe(100);
  });

  it('should calculate UBI', () => {
    policy.currentSupply = 1000000;
    const ubi = policy.calculateUBI(1000);
    expect(ubi.perUser).toBeGreaterThan(0);
  });

  it('should calculate staking rewards', () => {
    const reward = policy.calculateStakingReward(1000, 30);
    expect(reward).toBeGreaterThan(0);
  });
});

describe('Token Minter', () => {
  let minter: TokenMinter;
  let policy: EconomicPolicyEngine;

  beforeEach(() => {
    policy = new EconomicPolicyEngine();
    minter = new TokenMinter(policy);
  });

  it('should create wallet', () => {
    const wallet = minter.createWallet('user-1');
    expect(wallet.userId).toBe('user-1');
    expect(wallet.balance).toBe(0);
  });

  it('should mint rewards', () => {
    const wallet = minter.createWallet('user-1');
    const result = minter.mintReward(wallet.address, 50, 'test');
    expect(result.success).toBe(true);
    expect(result.balance).toBe(50);
  });

  it('should transfer tokens', () => {
    const wallet1 = minter.createWallet('user-1');
    const wallet2 = minter.createWallet('user-2');
    minter.mintReward(wallet1.address, 100, 'test');
    
    const result = minter.transfer(wallet1.address, wallet2.address, 50);
    expect(result.success).toBe(true);
    expect(result.from).toBe(50);
    expect(result.to).toBe(50);
  });
});
