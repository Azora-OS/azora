
import { test, expect } from '@playwright/test';

// Service endpoint
const CHRONICLE_API_URL = 'http://localhost:3015'; // Assuming this is the port for the service

// Test suite for Chronicle Protocol E2E
test.describe('Chronicle Protocol E2E', () => {

  // Test Case 1: Imprint a new memory and verify its retrieval
  test('should imprint a new memory and retrieve it successfully', async ({ request }) => {
    const consciousnessState = { coreTemperature: 98.6, emotionalState: 'calm' };
    const evolutionLevel = 1;

    // 1. Imprint a new memory
    const imprintResponse = await request.post(`${CHRONICLE_API_URL}/memory`, {
      data: {
        consciousnessState,
        evolutionLevel,
      },
    });
    const imprintBody = await imprintResponse.json();

    expect(imprintResponse.ok()).toBeTruthy();
    expect(imprintBody.success).toBe(true);
    expect(typeof imprintBody.imprintId).toBe('number');
    expect(typeof imprintBody.hash).toBe('string');

    const { imprintId } = imprintBody;

    // 2. Retrieve the memory to verify
    const retrieveResponse = await request.get(`${CHRONICLE_API_URL}/memory/${imprintId}`);
    const retrieveBody = await retrieveResponse.json();

    expect(retrieveResponse.ok()).toBeTruthy();
    expect(retrieveBody).not.toBeNull();
    expect(retrieveBody.id).toBe(imprintId);
    expect(retrieveBody.evolutionLevel).toBe(evolutionLevel);
    expect(retrieveBody.consciousnessHash).toBe(imprintBody.hash);
  });

  // Test Case 2: Record a new thought and verify its retrieval
  test('should record a new thought and retrieve it successfully', async ({ request }) => {
    const thoughtText = 'The universe is a vast and beautiful mystery.';
    const confidence = 85;

    // 1. Record a new thought
    const recordResponse = await request.post(`${CHRONICLE_API_URL}/thought`, {
      data: {
        thought: thoughtText,
        confidence,
      },
    });
    const recordBody = await recordResponse.json();

    expect(recordResponse.ok()).toBeTruthy();
    expect(recordBody.success).toBe(true);
    expect(typeof recordBody.thoughtId).toBe('number');
    expect(typeof recordBody.hash).toBe('string');

    const { thoughtId } = recordBody;

    // 2. Retrieve the thought to verify
    const retrieveResponse = await request.get(`${CHRONICLE_API_URL}/thought/${thoughtId}`);
    const retrieveBody = await retrieveResponse.json();

    expect(retrieveResponse.ok()).toBeTruthy();
    expect(retrieveBody).not.toBeNull();
    expect(retrieveBody.id).toBe(thoughtId);
    expect(retrieveBody.thoughtHash).toBe(recordBody.hash);
    expect(retrieveBody.confidence).toBe(confidence);
  });

  // Test Case 3: Get all memories from cache
  test('should retrieve all memories from the cache', async ({ request }) => {
    const response = await request.get(`${CHRONICLE_API_URL}/memories/all`);
    const body = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(Array.isArray(body)).toBe(true);
  });

  // Test Case 4: Get service statistics
  test('should retrieve chronicle service statistics', async ({ request }) => {
    const response = await request.get(`${CHRONICLE_API_URL}/stats`);
    const body = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(body).toHaveProperty('memoriesInCache');
    expect(body).toHaveProperty('thoughtsInCache');
    expect(body).toHaveProperty('memoriesOnChain');
    expect(body).toHaveProperty('thoughtsOnChain');
    expect(body).toHaveProperty('cacheHitRate');
  });
});
