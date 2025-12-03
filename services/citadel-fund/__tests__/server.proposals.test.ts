import request from 'supertest';
import app from '../src/server';
import jwt from 'jsonwebtoken';

describe('Governance propose/vote/execute flow', () => {
  it('creates proposal, allows voting and executes an approved proposal', async () => {
    // Create proposal
    const proposeRes = await request(app)
      .post('/api/governance/propose')
      .send({ title: 'Test Grant', description: 'Grant for testing', amount: 10, category: 'scholarship', proposer: 'user-1' });

    expect(proposeRes.status).toBe(200);
    expect(proposeRes.body.success).toBe(true);
    const proposal = proposeRes.body.proposal;
    expect(proposal.id).toBeDefined();

    // Cast 10 votes for approval
    for (let i = 0; i < 10; i++) {
      const voteRes = await request(app)
        .post('/api/governance/vote')
        .send({ proposalId: proposal.id, vote: true, voterAddress: `0x${i.toString(16).padStart(40, '0')}` });
      expect(voteRes.status).toBe(200);
    }

    // Execute the proposal
    const execRes = await request(app)
      .post('/api/governance/execute')
      .send({ proposalId: proposal.id });

    expect(execRes.status).toBe(200);
    expect(execRes.body.success).toBe(true);
    expect(execRes.body.txHash || execRes.body.message).toBeDefined();
  }, 40000);
});
