/**
 * Mock Services
 * 
 * This module exports all mock services for testing external dependencies.
 * 
 * Usage:
 * ```typescript
 * import { mockStripe, mockOpenAI, mockEmail, mockS3 } from '@tests/mocks';
 * 
 * // Set up mock responses
 * mockOpenAI.setDefaultResponse('Test AI response');
 * 
 * // Verify calls
 * expect(mockStripe.wasCalled('createPaymentIntent')).toBe(true);
 * 
 * // Reset mocks
 * mockStripe.reset();
 * ```
 */

export * from './base.mock';
export * from './stripe.mock';
export * from './openai.mock';
export * from './email.mock';
export * from './s3.mock';

// Re-export singleton instances for convenience
export { mockStripe } from './stripe.mock';
export { mockOpenAI } from './openai.mock';
export { mockEmail } from './email.mock';
export { mockS3 } from './s3.mock';
export { mockRegistry } from './base.mock';
