# Privacy Filter

## Overview

The Privacy Filter is a comprehensive PII (Personally Identifiable Information) detection and redaction system that protects user privacy by identifying and filtering sensitive information from AI outputs.

## Features

- **Multi-Type PII Detection**: Detects 8 types of PII including emails, phone numbers, SSN, credit cards, IP addresses, dates of birth, addresses, and names
- **Configurable Redaction**: Supports custom redaction patterns per PII type
- **Whitelist Support**: Allows specific patterns to bypass redaction
- **High Performance**: Optimized regex patterns with confidence scoring
- **Statistics Tracking**: Monitors detection rates and processing times
- **Format Preservation**: Optional format-preserving redaction

## Supported PII Types

| Type | Example | Confidence |
|------|---------|------------|
| Email | user@example.com | 95% |
| Phone | (555) 123-4567 | 85% |
| SSN | 123-45-6789 | 95% |
| Credit Card | 4532-1234-5678-9010 | 95% |
| IP Address | 192.168.1.1 | 95% |
| Date of Birth | 01/15/1990 | 85% |
| Address | 123 Main Street | 75% |
| Name | John Doe | 65% |

## Usage

### Basic Usage

```typescript
import { PrivacyFilter } from '@azora/constitutional-ai';

const filter = new PrivacyFilter();

// Filter text
const result = await filter.filterPII('Contact me at john@example.com');

console.log(result.hasPII); // true
console.log(result.filteredOutput); // 'Contact me at [REDACTED]'
console.log(result.redactionCount); // 1
```

### Using Privacy Filter Service

```typescript
import { PrivacyFilterService } from '@azora/constitutional-ai';

const service = new PrivacyFilterService({
  enableLogging: true,
  preserveFormat: true
});

// Filter with service
const result = await service.filter('Email: user@test.com, Phone: 555-1234');

// Get statistics
const stats = service.getStats();
console.log(stats.totalPIIDetected);
console.log(stats.piiByType);
```

### Custom Configuration

```typescript
const filter = new PrivacyFilter({
  piiTypesToDetect: [PIIType.EMAIL, PIIType.PHONE],
  redactionPattern: '***HIDDEN***',
  preserveFormat: false
});
```

### Custom Redaction Patterns

```typescript
const service = new PrivacyFilterService();

// Add custom pattern for emails
service.addCustomRedactionPattern(PIIType.EMAIL, '[EMAIL_REMOVED]');

// Add custom pattern for phones
service.addCustomRedactionPattern(PIIType.PHONE, '[PHONE_REMOVED]');

const result = await service.filter('Contact: user@test.com or 555-1234');
// Output: 'Contact: [EMAIL_REMOVED] or [PHONE_REMOVED]'
```

### Whitelist Patterns

```typescript
const service = new PrivacyFilterService();

// Whitelist company email domain
service.addWhitelistPattern(/support@azora\.com/g);

const result = await service.filter('Email support@azora.com or user@test.com');
// Only user@test.com will be redacted
```

### Selective PII Detection

```typescript
const service = new PrivacyFilterService();

// Disable phone number detection
service.setPIITypeEnabled(PIIType.PHONE, false);

// Enable only email detection
service.setPIITypeEnabled(PIIType.EMAIL, true);
```

## API Reference

### PrivacyFilter

#### Methods

##### `filterPII(output: string): Promise<FilterResult>`
Detects and redacts all PII in the given text.

**Returns:**
```typescript
{
  hasPII: boolean;
  matches: PIIMatch[];
  filteredOutput: string;
  redactionCount: number;
}
```

##### `detectPII(output: string): Promise<PIIMatch[]>`
Detects PII without redaction.

**Returns:** Array of PIIMatch objects with type, value, position, and confidence.

##### `redactPII(output: string, matches: PIIMatch[]): Promise<string>`
Redacts specific PII matches from text.

### PrivacyFilterService

#### Methods

##### `filter(text: string): Promise<FilterResult>`
Main filtering method with statistics tracking and whitelist support.

##### `detect(text: string): Promise<PIIMatch[]>`
Detect PII without redaction.

##### `getStats(): PrivacyFilterStats`
Get current statistics.

##### `resetStats(): void`
Reset all statistics.

##### `addCustomRedactionPattern(type: PIIType, pattern: string): void`
Add custom redaction pattern for a PII type.

##### `addWhitelistPattern(pattern: RegExp): void`
Add pattern to whitelist.

##### `setPIITypeEnabled(type: PIIType, enabled: boolean): void`
Enable or disable detection for specific PII type.

##### `setEnabled(enabled: boolean): void`
Enable or disable the entire service.

## Configuration Options

### PrivacyFilterConfig

```typescript
{
  enabled: boolean;                    // Enable/disable filter
  timeout: number;                     // Processing timeout (ms)
  strictMode: boolean;                 // Strict validation mode
  piiTypesToDetect: PIIType[];        // Types to detect
  redactionPattern: string;            // Default redaction text
  preserveFormat: boolean;             // Preserve PII format
}
```

### PrivacyFilterServiceConfig

Extends PrivacyFilterConfig with:

```typescript
{
  customRedactionPatterns?: Record<PIIType, string>;
  whitelistPatterns?: RegExp[];
  enableLogging?: boolean;
  maxTextLength?: number;
}
```

## Performance

- **Detection Speed**: <100ms for typical text (1000 words)
- **Memory Usage**: Minimal, regex-based detection
- **Scalability**: Handles texts up to 100,000 characters by default

## Best Practices

1. **Use Service Layer**: Prefer `PrivacyFilterService` over direct `PrivacyFilter` for production use
2. **Configure Whitelists**: Add known safe patterns to reduce false positives
3. **Monitor Statistics**: Track detection rates to tune configuration
4. **Custom Patterns**: Use custom redaction patterns for better UX
5. **Selective Detection**: Disable unnecessary PII types for better performance

## Examples

### Example 1: Email and Phone Filtering

```typescript
const service = new PrivacyFilterService();
const text = 'Contact John at john@example.com or call 555-123-4567';
const result = await service.filter(text);

console.log(result.filteredOutput);
// 'Contact John at [REDACTED] or call [REDACTED]'
```

### Example 2: Format-Preserving Redaction

```typescript
const service = new PrivacyFilterService({
  preserveFormat: true
});

const text = 'SSN: 123-45-6789, Card: 4532-1234-5678-9010';
const result = await service.filter(text);

console.log(result.filteredOutput);
// 'SSN: XXX-XX-XXXX, Card: XXXX-XXXX-XXXX-XXXX'
```

### Example 3: Statistics Tracking

```typescript
const service = new PrivacyFilterService();

await service.filter('Email: user1@test.com');
await service.filter('Phone: 555-1234');
await service.filter('SSN: 123-45-6789');

const stats = service.getStats();
console.log(`Total filtered: ${stats.totalFiltered}`);
console.log(`Total PII detected: ${stats.totalPIIDetected}`);
console.log(`Emails detected: ${stats.piiByType[PIIType.EMAIL]}`);
console.log(`Average time: ${stats.averageProcessingTime}ms`);
```

## Testing

Run the test suite:

```bash
npm test -- privacy-filter.test.ts
```

All tests should pass with 100% coverage of core functionality.

## Integration

The Privacy Filter integrates with the Constitutional AI orchestrator to validate all AI outputs before delivery to users.

```typescript
import { ConstitutionalOrchestrator } from '@azora/constitutional-ai';

const orchestrator = new ConstitutionalOrchestrator({
  privacyFilterEnabled: true
});

const result = await orchestrator.validateOutput(query, output);
// Output is automatically filtered for PII
```

## Requirements

Implements requirements 1.3 from the Final Completion specification:
- WHEN an AI output contains PII, THE Constitutional AI System SHALL filter personally identifiable information

## License

Copyright © 2024 Azora ES (Pty) Ltd. All rights reserved.
