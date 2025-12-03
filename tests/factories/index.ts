/**
 * Test Data Factories
 * 
 * This module exports all test data factories for creating consistent test data.
 * 
 * Usage:
 * ```typescript
 * import { userFactory, courseFactory } from '@tests/factories';
 * 
 * const user = await userFactory.createStudent();
 * const course = await courseFactory.create({ instructorId: user.id });
 * ```
 */

export * from './base.factory';
export * from './user.factory';
export * from './course.factory';
export * from './financial.factory';
export * from './marketplace.factory';

// Re-export singleton instances for convenience
export { userFactory } from './user.factory';
export { courseFactory, enrollmentFactory, assessmentFactory } from './course.factory';
export { walletFactory, transactionFactory, paymentFactory } from './financial.factory';
export { jobFactory, jobApplicationFactory, skillProfileFactory } from './marketplace.factory';
