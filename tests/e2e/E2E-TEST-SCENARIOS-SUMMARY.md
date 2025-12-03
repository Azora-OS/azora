# E2E Test Scenarios Summary

## Overview

This document summarizes the E2E test scenarios created for the Final Completion spec (Requirement 4.1).

**File**: `tests/e2e/e2e-scenarios.spec.ts`

**Total Tests**: 110 (22 scenarios × 5 browser configurations)

**Browser Coverage**:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

---

## Test Scenarios

### 1. Subscription Flow (4 tests)

**Purpose**: Verify users can subscribe to different tiers and manage subscriptions.

#### 1.1 Complete Full Subscription Purchase Flow
- Navigate to pricing page
- Verify subscription tiers (Free, Pro, Enterprise)
- Select Pro tier
- Register new user
- Verify Pro subscription is active on dashboard
- **Requirements**: 4.1

#### 1.2 Handle Subscription Tier Upgrade
- Login as existing user
- Navigate to subscription settings
- Upgrade from Pro to Enterprise
- Verify proration message
- Complete payment
- Verify Enterprise subscription is active
- **Requirements**: 4.1

#### 1.3 Handle Payment Failure and Retry
- Navigate to pricing
- Select Pro tier
- Register new user
- Handle payment failure scenario
- Verify retry option is available
- **Requirements**: 4.1

#### 1.4 Allow Subscription Cancellation
- Login to account
- Navigate to subscription settings
- Cancel subscription
- Verify cancellation confirmation
- Confirm cancellation
- Verify downgrade to Free tier
- **Requirements**: 4.1

---

### 2. Course Purchase Flow (5 tests)

**Purpose**: Verify users can browse, purchase, and access courses.

#### 2.1 Browse and Purchase Course
- Register new user
- Navigate to courses page
- Verify courses are displayed
- Click on course
- Verify course details
- Purchase/enroll in course
- Verify purchase confirmation
- **Requirements**: 4.1

#### 2.2 Display Course Content After Purchase
- Login to account
- Navigate to "My Courses"
- Verify purchased course is listed
- Click on course
- Verify course content is accessible
- **Requirements**: 4.1

#### 2.3 Track Course Progress
- Login to account
- Navigate to "My Courses"
- Click on course
- Verify progress bar is displayed
- Complete lessons
- Verify progress is updated
- **Requirements**: 4.1

#### 2.4 Handle Course Refund Request
- Login to account
- Navigate to "My Courses"
- Find course and access options menu
- Request refund
- Verify refund request is submitted
- **Requirements**: 4.1

---

### 3. Token Earning Flow (5 tests)

**Purpose**: Verify users can earn tokens through course completion and manage their wallet.

#### 3.1 Earn Tokens Through Course Completion
- Register new user
- Purchase course
- Complete multiple lessons
- Verify tokens earned notification
- Verify token balance increases
- **Requirements**: 4.1

#### 3.2 Display Token Balance in Wallet
- Login to account
- Navigate to wallet
- Verify wallet is displayed
- Verify token balance (AZR) is shown
- Verify balance is numeric
- **Requirements**: 4.1

#### 3.3 Allow Token Withdrawal
- Login to account
- Navigate to wallet
- Click withdraw button
- Fill withdrawal form (amount, method, account)
- Submit withdrawal request
- Verify withdrawal request is submitted
- **Requirements**: 4.1

#### 3.4 Track Token Transaction History
- Login to account
- Navigate to wallet history
- Verify transaction history is displayed
- Verify transactions are listed
- **Requirements**: 4.1

#### 3.5 Display Token Earning Statistics
- Login to account
- Navigate to dashboard
- Verify earning statistics are displayed
- Verify statistics show numeric values
- **Requirements**: 4.1

---

### 4. Enterprise Flow (7 tests)

**Purpose**: Verify enterprise users can sign up, manage teams, and access enterprise features.

#### 4.1 Complete Enterprise Signup Flow
- Navigate to enterprise page
- Verify enterprise page is displayed
- Click "Request Demo" or "Get Started"
- Fill enterprise form (company name, email, phone, employees)
- Submit form
- Verify submission success
- **Requirements**: 4.1

#### 4.2 Display Enterprise Pricing and Features
- Navigate to enterprise page
- Verify enterprise features are displayed
- Verify key features are listed (API Access, Custom Integration, Dedicated Support)
- Verify pricing information is shown
- **Requirements**: 4.1

#### 4.3 Allow Enterprise Team Member Management
- Navigate to team management page
- Verify team page is displayed
- Click "Add Member"
- Fill team member form (email, role)
- Submit form
- Verify team member invitation is sent
- **Requirements**: 4.1

#### 4.4 Display Enterprise Analytics Dashboard
- Navigate to enterprise analytics
- Verify analytics dashboard is displayed
- Verify key metrics are shown (Users, Courses, Revenue)
- Verify charts/graphs are rendered
- **Requirements**: 4.1

#### 4.5 Allow Enterprise API Key Management
- Navigate to API settings
- Verify API page is displayed
- Click "Generate Key"
- Verify API key is generated
- Verify copy button is available
- **Requirements**: 4.1

#### 4.6 Display Enterprise Billing and Invoices
- Navigate to billing page
- Verify billing page is displayed
- Verify invoice list is shown
- Click on invoice to view details
- Verify invoice details are displayed
- **Requirements**: 4.1

#### 4.7 Allow Enterprise Custom Branding
- Navigate to branding settings
- Verify branding page is displayed
- Fill branding details (colors)
- Save changes
- Verify changes are saved
- **Requirements**: 4.1

---

### 5. Cross-Flow Integration (2 tests)

**Purpose**: Verify data consistency and session management across different flows.

#### 5.1 Maintain User Session Across Flows
- Register new user
- Navigate to courses page
- Navigate to wallet page
- Navigate to dashboard
- Verify user is still logged in across all pages
- **Requirements**: 4.1

#### 5.2 Sync Data Across Flows
- Register new user
- Purchase course
- Navigate to dashboard and verify course appears
- Navigate to wallet and verify tokens are tracked
- Verify data consistency across flows
- **Requirements**: 4.1

---

## Test Utilities Used

The tests leverage existing test utilities from `tests/e2e/fixtures/test-utils.ts`:

- `loginUser()` - Login with email and password
- `registerUser()` - Register new user
- `enrollInCourse()` - Enroll in a course
- `completePayment()` - Complete payment with card details
- `requestWithdrawal()` - Request token withdrawal
- `verifySuccessMessage()` - Verify success notification
- `verifyErrorMessage()` - Verify error notification
- `fillFormField()` - Fill form fields
- `clickButton()` - Click button by text
- `waitForElement()` - Wait for element visibility

---

## Running the Tests

### List all tests
```bash
npx playwright test tests/e2e/e2e-scenarios.spec.ts --list
```

### Run all tests
```bash
npm run test:e2e
```

### Run specific test suite
```bash
npx playwright test tests/e2e/e2e-scenarios.spec.ts
```

### Run specific test
```bash
npx playwright test tests/e2e/e2e-scenarios.spec.ts -g "should complete full subscription purchase flow"
```

### Run with specific browser
```bash
npx playwright test tests/e2e/e2e-scenarios.spec.ts --project=chromium
```

### Run with debug mode
```bash
npx playwright test tests/e2e/e2e-scenarios.spec.ts --debug
```

### Generate HTML report
```bash
npx playwright test tests/e2e/e2e-scenarios.spec.ts
npx playwright show-report
```

---

## Test Coverage

The test scenarios cover all four required flows:

1. ✅ **Subscription Flow** - 4 tests covering signup, upgrade, payment failure, and cancellation
2. ✅ **Course Purchase Flow** - 5 tests covering browsing, purchasing, progress tracking, and refunds
3. ✅ **Token Earning Flow** - 5 tests covering earning, wallet display, withdrawal, history, and statistics
4. ✅ **Enterprise Flow** - 7 tests covering signup, features, team management, analytics, API, billing, and branding

**Total**: 22 core test scenarios × 5 browser configurations = 110 tests

---

## Success Criteria

All tests verify:
- ✅ User can complete each flow successfully
- ✅ Success messages are displayed
- ✅ Data is persisted correctly
- ✅ UI elements are visible and interactive
- ✅ Forms are validated properly
- ✅ Navigation works correctly
- ✅ Cross-browser compatibility (5 browsers)
- ✅ Mobile responsiveness (2 mobile browsers)

---

## Notes

- Tests use realistic user interactions and selectors
- Tests include error handling scenarios
- Tests verify both success and failure paths
- Tests are designed to work with the existing Azora OS UI
- Tests use the Playwright test framework with TypeScript
- Tests follow the existing test patterns in the codebase
- All tests reference Requirement 4.1 from the Final Completion spec
