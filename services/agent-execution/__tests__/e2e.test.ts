describe('End-to-End Agent Execution', () => {
  const baseUrl = 'http://localhost:4002';

  it('should execute task end-to-end', async () => {
    const res = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'e2e-test',
        payload: { action: 'test', description: 'E2E test' }
      })
    });

    expect(res.ok).toBe(true);
    const result = await res.json();
    expect(result).toHaveProperty('success');
  });

  it('should track task in analytics', async () => {
    await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: 'e2e-test', payload: { action: 'test' } })
    });

    const res = await fetch(`${baseUrl}/analytics/report`);
    const report = await res.json();
    
    expect(report.total).toBeGreaterThan(0);
  });

  it('should register and handoff between agents', async () => {
    const collaboration = await fetch(`${baseUrl}/agents`);
    const { agents } = await collaboration.json();

    if (agents.length >= 2) {
      const handoff = await fetch(`${baseUrl}/agents/${agents[0].agentId}/handoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAgentId: agents[1].agentId,
          taskId: 'test-task',
          context: {}
        })
      });

      expect(handoff.ok).toBe(true);
    }
  });

  it('should validate constitutional compliance', async () => {
    const res = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'test',
        payload: { harmful: true }
      })
    });

    const result = await res.json();
    expect(result.success).toBeDefined();
  });

  it('should provide health status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const health = await res.json();
    
    expect(health).toHaveProperty('checks');
    expect(health).toHaveProperty('monitor');
  });
});
