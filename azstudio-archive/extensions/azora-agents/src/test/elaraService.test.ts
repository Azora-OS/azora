import { ElaraService } from '../../../src/vs/workbench/services/azora/elaraService';

describe('ElaraService', () => {
  let service: ElaraService;

  beforeEach(() => {
    service = new ElaraService();
  });

  it('should return metadata', () => {
    const meta = service.getMetadata();
    expect(meta.id).toBe('azora.elara');
    expect(meta.name).toBe('elara');
    expect(meta.fullName).toBe('ELARA — Master Orchestrator');
  });

  it('should invoke and return stub response', async () => {
    const result = await service.invoke('test prompt');
    expect(result.content).toContain('Hello from Elara');
    expect(result.agentId).toBe('azora.elara');
  });
});