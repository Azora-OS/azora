# Azora SDK

The official TypeScript/JavaScript SDK for the Azora OS platform. Build applications that integrate with Azora's comprehensive suite of services including education, payments, retail AI, cold chain monitoring, community safety, and decentralized justice.

## Installation

```bash
npm install @azora/sdk
# or
yarn add @azora/sdk
# or
pnpm add @azora/sdk
```

## Quick Start

```typescript
import { AzoraClient } from '@azora/sdk';

const client = new AzoraClient({
  apiKey: 'your-api-key',
  environment: 'production'
});

// List courses
const courses = await client.education.listCourses();

// Create a payment
const payment = await client.payments.createPayment({
  amount: 1000,
  currency: 'ZAR',
  userId: 'user-123'
});

// Report a safety incident
const incident = await client.safety.reportIncident({
  type: 'crime',
  severity: 'high',
  location: { latitude: -26.2041, longitude: 28.0473 },
  description: 'Suspicious activity reported'
});
```

## Features

### 🎓 Education APIs
- Course management
- Enrollment tracking
- Progress monitoring
- Certificate generation

### 💰 Payment APIs
- Payment processing
- Subscription management
- Reward distribution
- Transaction tracking

### 🏪 Retail AI APIs
- Customer analytics
- Footfall tracking
- Loss prevention
- Inventory optimization

### ❄️ Cold Chain APIs
- Temperature monitoring
- Shipment tracking
- Compliance reporting
- Alert management

### 🛡️ Safety APIs
- Incident reporting
- Community alerts
- Emergency response
- Safety analytics

### ⚖️ Arbiter APIs
- Dispute resolution
- Reputation management
- Staking protocol
- Case management

## Authentication

```typescript
const client = new AzoraClient({
  apiKey: 'your-api-key'
});

// Login
const { data } = await client.auth.login('email@example.com', 'password');

// Use the access token
client.updateConfig({
  apiKey: data.accessToken
});
```

## Error Handling

```typescript
try {
  const result = await client.education.getCourse('course-id');
  if (!result.success) {
    console.error('Error:', result.error);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

## Configuration

```typescript
const client = new AzoraClient({
  apiKey: 'your-api-key',
  environment: 'production', // 'development' | 'staging' | 'production'
  timeout: 30000, // Request timeout in ms
  retries: 3, // Number of retry attempts
  debug: false // Enable debug logging
});
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import type { Course, Payment, SafetyIncident } from '@azora/sdk';

const course: Course = await client.education.getCourse('id');
```

## API Documentation

For detailed API documentation, visit [https://docs.azora.co.za/sdk](https://docs.azora.co.za/sdk)

## Examples

Check out the [examples](./examples) directory for complete working examples.

## Support

- 📧 Email: support@azora.co.za
- 💬 Discord: [https://discord.gg/azora](https://discord.gg/azora)
- 📚 Docs: [https://docs.azora.co.za](https://docs.azora.co.za)

## License

AZORA PROPRIETARY LICENSE  
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
