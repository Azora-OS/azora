# Phase 1: Core Monetization - Implementation Plan

- [x] 1. Set up payment processing infrastructure







  - Create Stripe service wrapper with payment processing methods
  - Implement webhook handler for Stripe events (payment.success, payment.failed, charge.refunded)
  - Set up environment variables for Stripe API keys (test and production)


  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Implement payment API endpoints
  - Create POST /api/payments/process endpoint for initiating payments
  - Create POST /api/webhooks/stripe endpoint for webhook handling
  - Create GET /api/payments/history endpoint for payment history retrieval

  - Create POST /api/payments/refund endpoint for refund processing
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2.1 Write unit tests for payment service


  - Test payment processing with valid/invalid data
  - Test webhook event handling
  - Test refund logic
  - _Requirements: 1.1, 1.2_


- [ ] 3. Implement subscription tier system
  - Create Subscription data model in Prisma schema with tier, status, renewal date fields
  - Implement SubscriptionService with createSubscription, updateSubscription, cancelSubscription methods
  - Create subscription tier configuration (Free, Pro, Enterprise) with feature mappings
  - Implement feature access control middleware
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Create subscription management API endpoints

  - Create POST /api/subscriptions/create endpoint for tier selection
  - Create PUT /api/subscriptions/update endpoint for tier upgrades/downgrades
  - Create POST /api/subscriptions/cancel endpoint for cancellation
  - Create GET /api/subscriptions/current endpoint for current subscription retrieval
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4.1 Write unit tests for subscription service

  - Test subscription creation for each tier
  - Test tier upgrades and downgrades with proration
  - Test feature access control
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. Implement course marketplace data models

  - Create Course model in Prisma with title, description, price, instructor, modules, rating fields
  - Create CourseEnrollment model for tracking student purchases
  - Create CourseReview model for ratings and reviews
  - Create InstructorEarnings model for tracking revenue splits
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


- [ ] 6. Implement course marketplace service
  - Create MarketplaceService with uploadCourse, purchaseCourse, listCourses methods
  - Implement course validation logic (content, metadata, pricing)
  - Implement 70/30 revenue split calculation (70% instructor, 30% platform)
  - Implement course listing with filtering and pagination
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


- [x] 7. Create course marketplace API endpoints

  - Create POST /api/courses/upload endpoint for instructor course uploads
  - Create POST /api/courses/purchase endpoint for course purchases
  - Create GET /api/courses/list endpoint for browsing marketplace
  - Create GET /api/courses/[courseId]/reviews endpoint for course reviews
  - Create POST /api/courses/[courseId]/reviews endpoint for submitting reviews
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7.1 Write unit tests for marketplace service

  - Test course upload validation
  - Test revenue split calculations
  - Test course listing and filtering
  - _Requirements: 3.1, 3.2, 3.3_


- [ ] 8. Implement token rewards system
  - Create TokenTransaction model in Prisma with userId, amount, type, reason, balance fields
  - Create TokenRewardsService with awardTokens, redeemTokens, getBalance methods
  - Implement token award logic for course completion (configurable amounts)
  - Implement bonus streak logic (track consecutive days/completions)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Create token rewards API endpoints


  - Create GET /api/tokens/balance endpoint for token balance retrieval
  - Create POST /api/tokens/award endpoint for awarding tokens (admin)
  - Create POST /api/tokens/redeem endpoint for token redemption
  - Create GET /api/tokens/history endpoint for transaction history
  - Create GET /api/leaderboard/global endpoint for global leaderboard
  - Create GET /api/leaderboard/friends endpoint for friend leaderboard
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [x] 9.1 Write unit tests for token rewards service

  - Test token awarding with various amounts
  - Test streak bonus calculations
  - Test token redemption and balance updates
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 10. Implement enterprise licensing system

  - Create License model in Prisma with organizationId, tier, status, expiryDate, features fields
  - Create EnterpriseLicenseService with createLicense, activateLicense, checkValidity methods
  - Implement white-label feature activation based on license tier
  - Implement license key generation and validation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 11. Create enterprise licensing API endpoints
  - Create POST /api/enterprise/licenses/create endpoint for license creation
  - Create POST /api/enterprise/licenses/activate endpoint for license activation
  - Create GET /api/enterprise/licenses/validate endpoint for license validation
  - Create GET /api/enterprise/usage endpoint for usage tracking
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_



- [ ] 11.1 Write unit tests for enterprise licensing service
  - Test license creation and key generation
  - Test license activation and validation
  - Test feature access based on license tier
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 12. Integrate payment processing with subscriptions

  - Wire subscription creation to trigger Stripe subscription creation
  - Wire subscription renewal to trigger payment processing
  - Implement webhook handling for subscription events (renewal, cancellation)
  - Implement automatic retry logic for failed subscription payments
  - _Requirements: 1.1, 2.1, 2.2, 2.5_


- [ ] 13. Integrate payment processing with course purchases
  - Wire course purchase to trigger Stripe payment processing
  - Implement webhook handling for course purchase completion
  - Implement revenue split calculation and instructor payout
  - Implement course access grant upon successful payment
  - _Requirements: 1.1, 3.1, 3.4, 3.5_


- [ ] 14. Integrate token rewards with course completion
  - Wire course completion to trigger token award
  - Implement streak tracking for bonus token calculation
  - Implement leaderboard updates on token award
  - Implement token balance updates in user profile

  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 15. Implement authentication and authorization
  - Add role-based access control (RBAC) for instructor, student, enterprise, admin roles
  - Implement permission checks on all monetization endpoints
  - Implement user context middleware for payment operations

  - Implement audit logging for sensitive operations
  - _Requirements: 1.1, 3.1, 5.1_

- [ ] 16. Set up database migrations
  - Create Prisma migration for subscription tables
  - Create Prisma migration for course marketplace tables
  - Create Prisma migration for token transaction tables
  - Create Prisma migration for enterprise licensing tables
  - Create Prisma migration for payment records tables
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 17. Implement email notifications



  - Create email template for payment confirmation with receipt
  - Create email template for subscription renewal confirmation
  - Create email template for course purchase confirmation

  - Create email template for token award notification
  - Create email template for enterprise license renewal notice
  - _Requirements: 1.5, 2.5, 3.5, 4.5, 5.5_


- [x] 17.1 Write integration tests for email notifications

  - Test payment confirmation email sending
  - Test subscription renewal email sending
  - Test course purchase email sending
  - _Requirements: 1.5, 2.5, 3.5_

- [ ] 18. Implement error handling and validation
  - Add input validation for all payment endpoints
  - Add error handling for Stripe API failures
  - Add error handling for database transaction failures
  - Add error handling for webhook processing failures
  - Implement user-friendly error messages
  - _Requirements: 1.1, 1.4, 2.1, 3.1, 4.1, 5.1_

- [ ] 19. Implement logging and monitoring
  - Add structured logging for all payment operations

  - Add structured logging for subscription lifecycle events
  - Add structured logging for course marketplace transactions
  - Add structured logging for token reward operations
  - Add metrics collection for revenue, subscriptions, courses, tokens

  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 19.1 Write integration tests for logging and monitoring
  - Test log output for payment operations
  - Test metrics collection accuracy
  - _Requirements: 1.1, 2.1_

- [x] 20. Create API documentation

  - Document all payment endpoints with request/response examples
  - Document all subscription endpoints with request/response examples
  - Document all course marketplace endpoints with request/response examples
  - Document all token rewards endpoints with request/response examples

  - Document all enterprise licensing endpoints with request/response examples
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 20.1 Write E2E tests for critical user journeys
  - Test complete subscription purchase flow
  - Test complete course purchase and enrollment flow
  - Test token earning and redemption flow
  - Test enterprise license activation flow
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
