import { PrismaClient } from '@prisma/client';
import { citadelRepository } from '../src/citadel-repository';
import { citadelService } from '../src/citadel-service';

describe('CitadelFund Governance Proposals', () => {
  const prisma = new PrismaClient();

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./test.db';
    // This test suite expects a local sqlite DB; use prisma migrate/push manually as needed
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a proposal and persists to DB', async () => {
    const proposal = await citadelRepository.createProposal({
      title: 'Test Scholarship',
      description: 'Testing persistence',
      amount: 100,
      category: 'scholarship',
      proposer: 'user-1',
    });

    expect(proposal).toBeDefined();
    expect(proposal.title).toBe('Test Scholarship');
  });

  it('allows voting and updates status', async () => {
    const p = await citadelRepository.createProposal({
      title: 'Vote Test',
      description: 'Vote counting test',
      amount: 50,
      category: 'public_goods',
      proposer: 'user-2',
      votingDeadline: new Date(Date.now() + 1000 * 60 * 60)
    });

    // cast a sequence of votes to approve
    for (let i = 0; i < 10; i++) {
      await citadelRepository.voteOnProposal(p.id, true);
    }

    const updated = await citadelRepository.getProposal(p.id);

    expect(updated).toBeDefined();
    expect(updated!.votesFor).toBeGreaterThanOrEqual(10);
    expect(updated!.status).toBe('APPROVED');
  });

  it('execution triggers appropriate allocation', async () => {
    const p = await citadelRepository.createProposal({
      title: 'Execution Test',
      description: 'Grant via proposal',
      amount: 10,
      category: 'scholarship',
      proposer: 'user-3',
    });

    // Force approve
    await citadelRepository.updateProposalStatus(p.id, 'APPROVED');

    const tx = await citadelService.executeProposal(p.id);
    expect(tx).toBeDefined();
  });
});
