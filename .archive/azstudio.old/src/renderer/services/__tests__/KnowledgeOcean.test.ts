import { KnowledgeOcean } from '../KnowledgeOcean';

describe('KnowledgeOcean', () => {
  let ocean: KnowledgeOcean;

  beforeEach(() => {
    // Reset singleton for testing if possible, or just get instance
    ocean = KnowledgeOcean.getInstance();
  });

  test('should initialize with correct model name', () => {
    expect(ocean.modelName).toContain('Azora Mind');
    expect(ocean.modelName).toContain('Ubuntu AI Core');
  });

  test('should support offline mode toggle', () => {
    ocean.setOfflineMode(true);
    // We can't easily check private state, but we can verify behavior
    // In a real test we might spy on console or check public side effects
    // For now, just ensuring it doesn't crash
    ocean.setOfflineMode(false);
  });

  test('should return null for unknown hash in offline mode', async () => {
    ocean.setOfflineMode(true);
    const result = await ocean.getKnowledgeByHash('unknown-hash');
    expect(result).toBeNull();
  });

  test('should simulate search results', async () => {
    const results = await ocean.search('authentication');
    expect(Array.isArray(results)).toBe(true);
    // Since we pre-loaded seed data in initialize (if called), or rely on mock
    // The current implementation doesn't auto-initialize in constructor, let's call it
    await ocean.initialize();
    
    const resultsAfterInit = await ocean.search('security');
    expect(resultsAfterInit.length).toBeGreaterThan(0);
    expect(resultsAfterInit[0].node.tags).toContain('security');
  });
});
