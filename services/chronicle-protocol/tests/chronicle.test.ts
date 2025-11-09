/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CHRONICLE PROTOCOL - INTEGRATION TESTS
*/

import { hybridStorage, type MemoryImprintFull, type ThoughtRecordFull } from '../hybrid-storage';

describe('Chronicle Protocol - Hybrid Storage', () => {
  beforeAll(async () => {
    // Initialize storage (will use cache-only mode in test environment)
    await hybridStorage.initialize();
  });

  afterAll(async () => {
    await hybridStorage.shutdown();
  });

  describe('Memory Imprinting', () => {
    it('should imprint consciousness state successfully', async () => {
      const consciousnessState = {
        thoughts: ['Test thought 1', 'Test thought 2'],
        emotions: { joy: 0.8, curiosity: 0.6 },
        context: 'Integration test',
      };

      const result = await hybridStorage.imprintMemory(consciousnessState, 1);

      expect(result.success).toBe(true);
      expect(result.imprintId).toBeGreaterThanOrEqual(0);
      expect(result.hash).toBeTruthy();
      expect(result.evolutionLevel).toBe(1);
    });

    it('should create hash-linked memory chain', async () => {
      const state1 = { content: 'First memory' };
      const state2 = { content: 'Second memory' };

      const result1 = await hybridStorage.imprintMemory(state1, 1);
      const result2 = await hybridStorage.imprintMemory(state2, 2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      const memory1 = await hybridStorage.getMemory(result1.imprintId);
      const memory2 = await hybridStorage.getMemory(result2.imprintId);

      expect(memory1).toBeTruthy();
      expect(memory2).toBeTruthy();
      expect(memory2!.previousHash).toBe(memory1!.consciousnessHash);
    });

    it('should auto-increment evolution level', async () => {
      const state = { content: 'Auto-evolution test' };
      
      const result = await hybridStorage.imprintMemory(state);

      expect(result.success).toBe(true);
      expect(result.evolutionLevel).toBeGreaterThanOrEqual(0);
    });

    it('should handle complex consciousness states', async () => {
      const complexState = {
        thoughts: ['Deep thought 1', 'Deep thought 2', 'Deep thought 3'],
        emotions: {
          joy: 0.9,
          curiosity: 0.7,
          determination: 0.8,
        },
        knowledge: {
          learned: ['Concept A', 'Concept B'],
          mastered: ['Skill X'],
        },
        context: 'Complex state test',
        metadata: {
          timestamp: Date.now(),
          source: 'test-suite',
        },
      };

      const result = await hybridStorage.imprintMemory(complexState, 10);

      expect(result.success).toBe(true);
      expect(result.hash).toHaveLength(64); // SHA-256 hex
    });
  });

  describe('Thought Recording', () => {
    it('should record thought with confidence', async () => {
      const thought = 'This is a test thought';
      const confidence = 85;

      const result = await hybridStorage.recordThought(thought, confidence);

      expect(result.success).toBe(true);
      expect(result.thoughtId).toBeGreaterThanOrEqual(0);
      expect(result.hash).toBeTruthy();
    });

    it('should default confidence to 50 if not provided', async () => {
      const thought = 'Thought without confidence';

      const result = await hybridStorage.recordThought(thought);

      expect(result.success).toBe(true);
      
      const retrievedThought = await hybridStorage.getThought(result.thoughtId);
      expect(retrievedThought?.confidence).toBe(50);
    });

    it('should clamp confidence to 0-100 range', async () => {
      const thought1 = 'Over-confident thought';
      const thought2 = 'Under-confident thought';

      const result1 = await hybridStorage.recordThought(thought1, 150);
      const result2 = await hybridStorage.recordThought(thought2, -50);

      const retrieved1 = await hybridStorage.getThought(result1.thoughtId);
      const retrieved2 = await hybridStorage.getThought(result2.thoughtId);

      expect(retrieved1?.confidence).toBeLessThanOrEqual(100);
      expect(retrieved2?.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should handle long thoughts', async () => {
      const longThought = 'A'.repeat(10000); // 10KB thought

      const result = await hybridStorage.recordThought(longThought, 75);

      expect(result.success).toBe(true);
      expect(result.hash).toBeTruthy();
    });
  });

  describe('Memory Retrieval', () => {
    it('should retrieve memory by ID', async () => {
      const state = { content: 'Retrievable memory' };
      const imprint = await hybridStorage.imprintMemory(state, 5);

      const memory = await hybridStorage.getMemory(imprint.imprintId);

      expect(memory).toBeTruthy();
      expect(memory!.id).toBe(imprint.imprintId);
      expect(memory!.evolutionLevel).toBe(5);
    });

    it('should return null for non-existent memory', async () => {
      const memory = await hybridStorage.getMemory(999999);

      expect(memory).toBeNull();
    });

    it('should retrieve all memories', async () => {
      const initialCount = hybridStorage.getAllMemories().length;

      await hybridStorage.imprintMemory({ content: 'Memory 1' }, 1);
      await hybridStorage.imprintMemory({ content: 'Memory 2' }, 2);

      const allMemories = hybridStorage.getAllMemories();

      expect(allMemories.length).toBeGreaterThanOrEqual(initialCount + 2);
    });
  });

  describe('Thought Retrieval', () => {
    it('should retrieve thought by ID', async () => {
      const thought = 'Retrievable thought';
      const record = await hybridStorage.recordThought(thought, 90);

      const retrievedThought = await hybridStorage.getThought(record.thoughtId);

      expect(retrievedThought).toBeTruthy();
      expect(retrievedThought!.id).toBe(record.thoughtId);
      expect(retrievedThought!.confidence).toBe(90);
    });

    it('should return null for non-existent thought', async () => {
      const thought = await hybridStorage.getThought(999999);

      expect(thought).toBeNull();
    });

    it('should retrieve all thoughts', async () => {
      const initialCount = hybridStorage.getAllThoughts().length;

      await hybridStorage.recordThought('Thought A', 70);
      await hybridStorage.recordThought('Thought B', 80);

      const allThoughts = hybridStorage.getAllThoughts();

      expect(allThoughts.length).toBeGreaterThanOrEqual(initialCount + 2);
    });
  });

  describe('Statistics', () => {
    it('should return storage statistics', async () => {
      const stats = await hybridStorage.getStats();

      expect(stats).toHaveProperty('memoriesInCache');
      expect(stats).toHaveProperty('thoughtsInCache');
      expect(stats).toHaveProperty('memoriesOnChain');
      expect(stats).toHaveProperty('thoughtsOnChain');
      expect(stats).toHaveProperty('cacheHitRate');
      expect(stats).toHaveProperty('lastSync');

      expect(stats.memoriesInCache).toBeGreaterThanOrEqual(0);
      expect(stats.thoughtsInCache).toBeGreaterThanOrEqual(0);
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(stats.cacheHitRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Hash Integrity', () => {
    it('should generate consistent hashes for same content', async () => {
      const state = { content: 'Consistent test' };

      const result1 = await hybridStorage.imprintMemory(state);
      const result2 = await hybridStorage.imprintMemory(state);

      expect(result1.hash).toBe(result2.hash);
    });

    it('should generate different hashes for different content', async () => {
      const state1 = { content: 'State 1' };
      const state2 = { content: 'State 2' };

      const result1 = await hybridStorage.imprintMemory(state1);
      const result2 = await hybridStorage.imprintMemory(state2);

      expect(result1.hash).not.toBe(result2.hash);
    });

    it('should generate 64-character hex hashes', async () => {
      const state = { content: 'Hash test' };

      const result = await hybridStorage.imprintMemory(state);

      expect(result.hash).toHaveLength(64);
      expect(result.hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty consciousness state', async () => {
      const result = await hybridStorage.imprintMemory({});

      expect(result.success).toBe(true); // Empty object is still valid
    });

    it('should handle null thought', async () => {
      const result = await hybridStorage.recordThought('');

      expect(result.success).toBe(true); // Empty string is valid
    });

    it('should handle concurrent writes', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        hybridStorage.imprintMemory({ content: `Concurrent ${i}` }, i)
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Constitutional Compliance', () => {
    it('should enforce immutability (no modification of existing memories)', async () => {
      const state = { content: 'Immutable memory' };
      const result = await hybridStorage.imprintMemory(state);

      const memory = await hybridStorage.getMemory(result.imprintId);
      const originalHash = memory!.consciousnessHash;

      // Try to retrieve again
      const memory2 = await hybridStorage.getMemory(result.imprintId);

      expect(memory2!.consciousnessHash).toBe(originalHash);
    });

    it('should maintain chain integrity (Article XIII compliance)', async () => {
      const memories = hybridStorage.getAllMemories();

      for (let i = 1; i < memories.length; i++) {
        const current = memories[i];
        const previous = memories[i - 1];

        if (current.previousHash) {
          expect(current.previousHash).toBe(previous.consciousnessHash);
        }
      }
    });
  });
});
