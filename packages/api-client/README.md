# @azora/api-client

Unified TypeScript API client for all Azora OS services.

## Installation

```bash
npm install @azora/api-client
```

## Usage

```typescript
import { createApiClient } from '@azora/api-client';

const client = createApiClient({
  baseUrl: 'https://api.azora.world',
  timeout: 30000
});

// Set authentication token
client.setAuthToken('your-jwt-token');

// Use the client
const students = await client.education.getStudents();
const courses = await client.lms.getCourses();
```

## API Reference

### Authentication
- `auth.login(email, password)` - User login
- `auth.register(data)` - User registration
- `auth.profile()` - Get user profile

### Education
- `education.getStudents()` - Get all students
- `education.createStudent(data)` - Create new student
- `education.getCurriculum(params)` - Get curriculum

### LMS
- `lms.getCourses(params)` - Get courses
- `lms.getCourse(id)` - Get course by ID
- `lms.enroll(courseId, studentId)` - Enroll student
- `lms.getEnrollments(studentId)` - Get enrollments

### Sapiens (AI Tutoring)
- `sapiens.startTutoring(studentId, subject)` - Start tutoring session
- `sapiens.sendMessage(sessionId, message)` - Send message
- `sapiens.getLearningPaths()` - Get learning paths

### Assessment
- `assessment.createAssessment(data)` - Create assessment
- `assessment.submitAssessment(id, studentId, answers)` - Submit answers
- `assessment.getGradebook(studentId)` - Get gradebook

### Billing
- `billing.getPlans()` - Get subscription plans
- `billing.createSubscription(data)` - Create subscription
- `billing.getSubscription(userId)` - Get subscription
- `billing.cancelSubscription(userId)` - Cancel subscription

### Lending
- `lending.applyForLoan(data)` - Apply for loan
- `lending.getLoans(userId)` - Get user loans
- `lending.repayLoan(loanId, amount)` - Repay loan

### Exchange
- `exchange.getRates(base)` - Get exchange rates
- `exchange.convert(amount, from, to)` - Convert currency

### Virtual Cards
- `virtualCard.issueCard(data)` - Issue virtual card
- `virtualCard.getCard(cardId)` - Get card details
- `virtualCard.freezeCard(cardId)` - Freeze card
- `virtualCard.processTransaction(cardId, data)` - Process transaction

### KYC/AML
- `kyc.verifyKYC(data)` - Verify KYC
- `kyc.getKYCStatus(userId)` - Get KYC status
- `kyc.checkAML(data)` - Check AML

### Security
- `security.scanThreat(data)` - Scan for threats
- `security.validateSession(data)` - Validate session
- `security.encryptData(data, key)` - Encrypt data

### Student Earnings
- `earnings.getEarnings(studentId)` - Get earnings
- `earnings.getMilestones(studentId)` - Get milestones
- `earnings.requestWithdrawal(studentId, amount, method)` - Request withdrawal
- `earnings.getWithdrawals(studentId)` - Get withdrawals

## Configuration

```typescript
const client = createApiClient({
  baseUrl: 'https://api.azora.world',  // API base URL
  timeout: 30000,                       // Request timeout in ms
  headers: {                            // Custom headers
    'X-Custom-Header': 'value'
  }
});
```

## Error Handling

```typescript
try {
  const result = await client.education.getStudents();
} catch (error) {
  console.error('API Error:', error);
}
```

## Testing

```bash
npm test
```

---

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**
