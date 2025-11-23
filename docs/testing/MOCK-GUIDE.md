# Mock Service Guide

## Overview

Mock services simulate external dependencies for testing without making real API calls or incurring costs.

## Available Mocks

### Stripe Mock

```typescript
import { stripeMock } from '../../../tests/mocks';

describe('Payment Tests', () => {
  beforeEach(() => {
    stripeMock.reset();
  });

  it('should process payment', async () => {
    stripeMock.mockPaymentSuccess();
    
    const result = await processPayment({ amount: 1000 });
    
    expect(result.status).toBe('success');
    expect(stripeMock.getCallCount('createPaymentIntent')).toBe(1);
  });

  it('should handle payment failure', async () => {
    stripeMock.mockPaymentFailure('insufficient_funds');
    
    await expect(processPayment({ amount: 1000 }))
      .rejects
      .toThrow('insufficient_funds');
  });
});
```

### OpenAI Mock

```typescript
import { openaiMock } from '../../../tests/mocks';

describe('AI Tests', () => {
  beforeEach(() => {
    openaiMock.reset();
  });

  it('should generate completion', async () => {
    openaiMock.mockCompletion('This is a test response');
    
    const result = await generateCompletion('Test prompt');
    
    expect(result.content).toBe('This is a test response');
    expect(openaiMock.getCallCount('createCompletion')).toBe(1);
  });

  it('should track token usage', async () => {
    openaiMock.mockCompletion('Response', { tokens: 150 });
    
    await generateCompletion('Prompt');
    
    const usage = openaiMock.getTokenUsage();
    expect(usage.totalTokens).toBe(150);
  });
});
```

### Email Mock

```typescript
import { emailMock } from '../../../tests/mocks';

describe('Email Tests', () => {
  beforeEach(() => {
    emailMock.reset();
  });

  it('should send verification email', async () => {
    await sendVerificationEmail('user@example.com', 'token123');
    
    const sentEmails = emailMock.getSentEmails();
    expect(sentEmails.length).toBe(1);
    expect(sentEmails[0].to).toBe('user@example.com');
    expect(sentEmails[0].subject).toContain('Verify');
  });

  it('should handle email failure', async () => {
    emailMock.mockFailure('SMTP error');
    
    await expect(sendEmail('user@example.com', 'Subject', 'Body'))
      .rejects
      .toThrow('SMTP error');
  });
});
```

### S3 Mock

```typescript
import { s3Mock } from '../../../tests/mocks';

describe('File Upload Tests', () => {
  beforeEach(() => {
    s3Mock.reset();
  });

  it('should upload file', async () => {
    const file = Buffer.from('test content');
    
    const result = await uploadFile('test.txt', file);
    
    expect(result.url).toBeDefined();
    expect(s3Mock.getUploadedFiles().length).toBe(1);
  });

  it('should download file', async () => {
    s3Mock.mockFile('test.txt', Buffer.from('content'));
    
    const content = await downloadFile('test.txt');
    
    expect(content.toString()).toBe('content');
  });
});
```

## Mock Patterns

### Reset Mocks Between Tests

```typescript
describe('Tests', () => {
  beforeEach(() => {
    stripeMock.reset();
    openaiMock.reset();
    emailMock.reset();
  });

  // Tests here
});
```

### Mock Success Scenarios

```typescript
it('should handle successful payment', async () => {
  stripeMock.mockPaymentSuccess({
    paymentIntentId: 'pi_123',
    amount: 1000,
    currency: 'usd'
  });
  
  const result = await processPayment({ amount: 1000 });
  
  expect(result.paymentIntentId).toBe('pi_123');
});
```

### Mock Failure Scenarios

```typescript
it('should handle payment decline', async () => {
  stripeMock.mockPaymentFailure('card_declined');
  
  await expect(processPayment({ amount: 1000 }))
    .rejects
    .toThrow('card_declined');
});

it('should handle network error', async () => {
  openaiMock.mockNetworkError();
  
  await expect(generateCompletion('prompt'))
    .rejects
    .toThrow('Network error');
});
```

### Verify Mock Calls

```typescript
it('should call Stripe API once', async () => {
  stripeMock.mockPaymentSuccess();
  
  await processPayment({ amount: 1000 });
  
  expect(stripeMock.getCallCount('createPaymentIntent')).toBe(1);
  expect(stripeMock.wasCalledWith('createPaymentIntent', {
    amount: 1000
  })).toBe(true);
});
```

## Advanced Usage

### Mock Webhooks

```typescript
it('should handle Stripe webhook', async () => {
  const webhookPayload = stripeMock.createWebhookPayload({
    type: 'payment_intent.succeeded',
    data: {
      id: 'pi_123',
      amount: 1000
    }
  });
  
  const result = await handleWebhook(webhookPayload);
  
  expect(result.processed).toBe(true);
});
```

### Mock Rate Limiting

```typescript
it('should handle rate limit', async () => {
  openaiMock.mockRateLimit();
  
  await expect(generateCompletion('prompt'))
    .rejects
    .toThrow('Rate limit exceeded');
});
```

### Mock Delays

```typescript
it('should handle slow response', async () => {
  openaiMock.mockCompletion('Response', { delay: 5000 });
  
  const start = Date.now();
  await generateCompletion('prompt');
  const duration = Date.now() - start;
  
  expect(duration).toBeGreaterThan(4900);
});
```

### Mock Sequences

```typescript
it('should retry on failure', async () => {
  openaiMock.mockSequence([
    { type: 'error', error: 'Temporary error' },
    { type: 'error', error: 'Temporary error' },
    { type: 'success', content: 'Success!' }
  ]);
  
  const result = await generateCompletionWithRetry('prompt');
  
  expect(result.content).toBe('Success!');
  expect(openaiMock.getCallCount('createCompletion')).toBe(3);
});
```

## Best Practices

### Always Reset Mocks

```typescript
// ✅ Good - Reset in beforeEach
describe('Tests', () => {
  beforeEach(() => {
    stripeMock.reset();
  });
  
  it('test 1', async () => {
    stripeMock.mockPaymentSuccess();
    // Test
  });
  
  it('test 2', async () => {
    stripeMock.mockPaymentSuccess();
    // Clean mock state
  });
});

// ❌ Bad - No reset
describe('Tests', () => {
  it('test 1', async () => {
    stripeMock.mockPaymentSuccess();
    // Test
  });
  
  it('test 2', async () => {
    // Previous mock state still active!
  });
});
```

### Use Realistic Mock Data

```typescript
// ✅ Good - Realistic data
stripeMock.mockPaymentSuccess({
  paymentIntentId: 'pi_1234567890',
  amount: 1000,
  currency: 'usd',
  status: 'succeeded'
});

// ❌ Bad - Unrealistic data
stripeMock.mockPaymentSuccess({
  paymentIntentId: '123',
  amount: 999999999,
  currency: 'xxx'
});
```

### Test Both Success and Failure

```typescript
describe('Payment Processing', () => {
  it('should handle successful payment', async () => {
    stripeMock.mockPaymentSuccess();
    const result = await processPayment({ amount: 1000 });
    expect(result.status).toBe('success');
  });

  it('should handle failed payment', async () => {
    stripeMock.mockPaymentFailure('card_declined');
    await expect(processPayment({ amount: 1000 }))
      .rejects
      .toThrow();
  });

  it('should handle network error', async () => {
    stripeMock.mockNetworkError();
    await expect(processPayment({ amount: 1000 }))
      .rejects
      .toThrow();
  });
});
```

### Verify Mock Interactions

```typescript
it('should call API with correct parameters', async () => {
  stripeMock.mockPaymentSuccess();
  
  await processPayment({
    amount: 1000,
    currency: 'usd',
    customerId: 'cus_123'
  });
  
  expect(stripeMock.wasCalledWith('createPaymentIntent', {
    amount: 1000,
    currency: 'usd',
    customer: 'cus_123'
  })).toBe(true);
});
```

## Common Patterns

### Testing Retry Logic

```typescript
it('should retry on transient failure', async () => {
  openaiMock.mockSequence([
    { type: 'error', error: 'Temporary error' },
    { type: 'success', content: 'Success' }
  ]);
  
  const result = await generateCompletionWithRetry('prompt', { maxRetries: 3 });
  
  expect(result.content).toBe('Success');
  expect(openaiMock.getCallCount('createCompletion')).toBe(2);
});
```

### Testing Cost Tracking

```typescript
it('should track API costs', async () => {
  openaiMock.mockCompletion('Response', {
    tokens: 1000,
    cost: 0.02
  });
  
  await generateCompletion('prompt');
  
  const costs = openaiMock.getTotalCost();
  expect(costs).toBe(0.02);
});
```

### Testing Email Content

```typescript
it('should send correct email content', async () => {
  await sendWelcomeEmail('user@example.com', 'John');
  
  const emails = emailMock.getSentEmails();
  expect(emails[0].subject).toBe('Welcome to Azora');
  expect(emails[0].body).toContain('John');
  expect(emails[0].body).toContain('getting started');
});
```

## Troubleshooting

### Mock Not Working

```typescript
// ❌ Wrong - Mock not set up
it('should process payment', async () => {
  const result = await processPayment({ amount: 1000 });
  // Will make real API call!
});

// ✅ Correct - Mock configured
it('should process payment', async () => {
  stripeMock.mockPaymentSuccess();
  const result = await processPayment({ amount: 1000 });
  // Uses mock
});
```

### Mock State Leaking

```typescript
// ❌ Wrong - No reset
describe('Tests', () => {
  it('test 1', () => {
    stripeMock.mockPaymentSuccess();
  });
  
  it('test 2', () => {
    // Mock from test 1 still active!
  });
});

// ✅ Correct - Reset between tests
describe('Tests', () => {
  beforeEach(() => {
    stripeMock.reset();
  });
  
  it('test 1', () => {
    stripeMock.mockPaymentSuccess();
  });
  
  it('test 2', () => {
    // Clean state
  });
});
```

### Verification Failures

```typescript
// ❌ Wrong - Checking wrong method
it('should call API', async () => {
  await processPayment({ amount: 1000 });
  expect(stripeMock.getCallCount('createCharge')).toBe(1);
  // Actual method is 'createPaymentIntent'
});

// ✅ Correct - Check actual method
it('should call API', async () => {
  await processPayment({ amount: 1000 });
  expect(stripeMock.getCallCount('createPaymentIntent')).toBe(1);
});
```

## Resources

- [Testing Standards](./TESTING-STANDARDS.md)
- [Test Writing Guide](./TEST-WRITING-GUIDE.md)
- [Factory Guide](./FACTORY-GUIDE.md)
