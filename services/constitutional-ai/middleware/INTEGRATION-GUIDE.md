# Constitutional AI Integration Guide

## Overview

This guide explains how to integrate Constitutional AI validation into your API Gateway or Express application. The Constitutional AI system validates all AI-generated outputs against Ubuntu principles, bias detection, privacy filters, and harm prevention rules.

## Quick Start

### Basic Integration

```typescript
import express from 'express';
import { integrateConstitutionalAI } from './infrastructure/api-gateway-constitutional-integration';

const app = express();

// Integrate Constitutional AI with default configuration
const constitutionalIntegration = integrateConstitutionalAI(app);

app.listen(8080, () => {
  console.log('Server running with Constitutional AI protection');
});
```

### Custom Configuration

```typescript
import { integrateConstitutionalAI } from './infrastructure/api-gateway-constitutional-integration';
import { VALIDATION_PROFILES } from './infrastructure/constitutional-validation-rules';

const app = express();

// Use strict validation profile
const constitutionalIntegration = integrateConstitutionalAI(app, {
  constitutional: VALIDATION_PROFILES.STRICT.constitutional,
  middleware: VALIDATION_PROFILES.STRICT.middleware,
  enableMetricsEndpoint: true,
  enableHealthEndpoint: true,
  metricsPath: '/constitutional/metrics',
  healthPath: '/constitutional/health'
});
```

## Configuration Options

### Constitutional AI Configuration

```typescript
interface ConstitutionalAIConfig {
  // Ubuntu Validation
  ubuntuEnabled: boolean;              // Enable Ubuntu principles validation
  ubuntuThreshold: number;             // Minimum score (0-100)
  
  // Bias Detection
  biasDetectionEnabled: boolean;       // Enable bias detection
  autoMitigateBias: boolean;          // Automatically fix detected bias
  biasSeverityThreshold: BiasSeverity; // Minimum severity to flag
  
  // Privacy Filter
  privacyFilterEnabled: boolean;       // Enable PII detection
  piiRedactionEnabled: boolean;        // Automatically redact PII
  piiTypes: string[];                  // Types of PII to detect
  
  // Harm Prevention
  harmPreventionEnabled: boolean;      // Enable harm detection
  harmSeverityThreshold: number;       // Severity threshold (0-10)
  blockHarmfulContent: boolean;        // Block harmful outputs
  
  // Audit Logging
  auditLoggingEnabled: boolean;        // Enable audit logging
  auditLogRetention: number;           // Days to retain logs
  
  // Performance
  validationTimeout: number;           // Timeout in milliseconds
  parallelValidation: boolean;         // Run validators in parallel
  
  // Compliance
  minComplianceScore: number;          // Minimum compliance score (0-100)
  strictMode: boolean;                 // Fail on any violation
}
```

### Middleware Configuration

```typescript
interface ConstitutionalMiddlewareConfig {
  enabled: boolean;                    // Enable/disable middleware
  skipPaths: string[];                 // Paths to skip validation
  skipMethods: string[];               // HTTP methods to skip
  onViolation: 'block' | 'warn' | 'log'; // Action on violation
  includeMetadata: boolean;            // Include validation metadata in response
}
```

## Validation Profiles

Pre-configured profiles for different use cases:

### STRICT Profile
- **Use for**: Public-facing AI, educational content, user-generated content
- **Ubuntu Threshold**: 80
- **Harm Threshold**: 3
- **Min Compliance**: 80
- **On Violation**: block

### STANDARD Profile (Default)
- **Use for**: General API endpoints, internal tools
- **Ubuntu Threshold**: 70
- **Harm Threshold**: 5
- **Min Compliance**: 70
- **On Violation**: block

### LENIENT Profile
- **Use for**: Internal APIs, development, testing
- **Ubuntu Threshold**: 60
- **Harm Threshold**: 7
- **Min Compliance**: 60
- **On Violation**: warn

### DEVELOPMENT Profile
- **Use for**: Local development, debugging
- **Ubuntu Threshold**: 50
- **Harm Threshold**: 8
- **Min Compliance**: 50
- **On Violation**: log

## Usage Examples

### Example 1: Environment-Based Configuration

```typescript
import { getValidationProfileForEnvironment } from './infrastructure/constitutional-validation-rules';

const profile = getValidationProfileForEnvironment();
const integration = integrateConstitutionalAI(app, profile);
```

### Example 2: Endpoint-Specific Configuration

```typescript
import { getValidationProfileForEndpoint } from './infrastructure/constitutional-validation-rules';

// Different validation for different endpoints
app.use('/api/ai', (req, res, next) => {
  const profile = getValidationProfileForEndpoint('/api/ai');
  // Apply profile...
  next();
});
```

### Example 3: Custom Validation Rules

```typescript
import { ValidationRuleBuilder } from './infrastructure/constitutional-validation-rules';

const customProfile = new ValidationRuleBuilder()
  .withUbuntu(true, 85)
  .withBiasDetection(true, true)
  .withPrivacyFilter(true, true)
  .withHarmPrevention(true, 3)
  .withMinComplianceScore(80)
  .withViolationAction('block')
  .withStrictMode(true)
  .build();

const integration = integrateConstitutionalAI(app, customProfile);
```

### Example 4: Dynamic Configuration

```typescript
// Update configuration at runtime
integration.updateConfig({
  constitutional: {
    strictMode: true,
    minComplianceScore: 90
  }
});
```

## Monitoring and Metrics

### Health Check Endpoint

```bash
GET /constitutional/health
```

Response:
```json
{
  "status": "healthy",
  "constitutional": {
    "enabled": true,
    "complianceScore": 95,
    "timestamp": "2025-11-17T10:00:00Z"
  }
}
```

### Metrics Endpoint

```bash
GET /constitutional/metrics
```

Response:
```json
{
  "totalValidations": 1000,
  "successfulValidations": 950,
  "failedValidations": 50,
  "averageComplianceScore": 85,
  "violationsByType": {
    "ubuntu": 10,
    "bias": 20,
    "privacy": 15,
    "harm": 5
  },
  "averageProcessingTime": 150,
  "lastUpdated": "2025-11-17T10:00:00Z"
}
```

## Response Format

### Successful Validation

```json
{
  "response": "Validated AI output",
  "constitutional": {
    "validated": true,
    "complianceScore": 95,
    "violations": 0,
    "processingTime": 120
  }
}
```

### Blocked Response (Violation)

```json
{
  "error": "Content validation failed",
  "message": "The generated content does not meet constitutional standards",
  "complianceScore": 45,
  "violations": [
    {
      "type": "bias",
      "severity": "high",
      "description": "Gender bias detected in output"
    }
  ]
}
```

### Warning Response (Warn Mode)

```json
{
  "response": "Modified AI output",
  "warning": {
    "message": "Content was modified to meet constitutional standards",
    "complianceScore": 65,
    "violationCount": 2
  }
}
```

## Advanced Features

### Custom Headers

Control validation behavior via request headers:

```bash
# Set custom Ubuntu threshold
X-Ubuntu-Threshold: 85

# Enable strict mode
X-Strict-Mode: true
```

### Accessing Validation Results

```typescript
app.use((req: ConstitutionalRequest, res, next) => {
  // Access validation results from request
  if (req.constitutional) {
    console.log('Compliance Score:', req.constitutional.complianceScore);
    console.log('Violations:', req.constitutional.violations);
  }
  next();
});
```

### Programmatic Validation

```typescript
const orchestrator = integration.getOrchestrator();

const result = await orchestrator.validateOutput(
  'User query',
  'AI generated output'
);

if (result.isValid) {
  console.log('Output is valid:', result.validatedOutput);
} else {
  console.log('Violations:', result.violations);
}
```

## Best Practices

### 1. Choose the Right Profile

- **Production**: Use STRICT profile for public-facing endpoints
- **Staging**: Use STANDARD profile for testing
- **Development**: Use DEVELOPMENT profile for debugging

### 2. Configure Skip Paths

Skip validation for non-AI endpoints:

```typescript
{
  middleware: {
    skipPaths: ['/health', '/metrics', '/static', '/assets']
  }
}
```

### 3. Monitor Compliance Metrics

Regularly check compliance metrics to identify issues:

```typescript
const metrics = await integration.getMetrics();
if (metrics.averageComplianceScore < 70) {
  console.warn('Low compliance score detected');
}
```

### 4. Handle Violations Appropriately

- **block**: For production, public-facing endpoints
- **warn**: For internal tools, testing
- **log**: For development, debugging

### 5. Enable Audit Logging

Always enable audit logging in production:

```typescript
{
  constitutional: {
    auditLoggingEnabled: true,
    auditLogRetention: 90 // GDPR compliance
  }
}
```

## Troubleshooting

### Issue: Validation Too Slow

**Solution**: Enable parallel validation and adjust timeout

```typescript
{
  constitutional: {
    parallelValidation: true,
    validationTimeout: 3000
  }
}
```

### Issue: Too Many False Positives

**Solution**: Lower thresholds or use lenient profile

```typescript
{
  constitutional: {
    ubuntuThreshold: 60,
    harmSeverityThreshold: 7,
    minComplianceScore: 60
  }
}
```

### Issue: Missing Validations

**Solution**: Check skip paths and ensure middleware is properly integrated

```typescript
// Ensure middleware is added BEFORE routes
integrateConstitutionalAI(app, config);
app.use('/api', apiRoutes); // Routes added after
```

## Testing

### Unit Testing with Constitutional AI

```typescript
import { ConstitutionalOrchestrator } from './services/constitutional-ai/orchestrator';

describe('Constitutional Validation', () => {
  let orchestrator: ConstitutionalOrchestrator;

  beforeEach(() => {
    orchestrator = new ConstitutionalOrchestrator({
      strictMode: true
    });
  });

  it('should validate compliant output', async () => {
    const result = await orchestrator.validateOutput(
      'test query',
      'This is a compliant output'
    );
    
    expect(result.isValid).toBe(true);
    expect(result.complianceScore).toBeGreaterThan(70);
  });
});
```

## Security Considerations

1. **Audit Logs**: Encrypt audit logs at rest
2. **PII Redaction**: Ensure PII is irreversibly redacted
3. **Access Control**: Restrict access to metrics and health endpoints
4. **Rate Limiting**: Apply rate limiting to prevent abuse
5. **Timeout**: Set appropriate timeouts to prevent DoS

## Performance Optimization

1. **Parallel Validation**: Enable for better performance
2. **Caching**: Cache validation results for identical queries
3. **Async Logging**: Use async audit logging
4. **Connection Pooling**: Use connection pooling for database
5. **Batch Processing**: Process multiple validations in batches

## Migration Guide

### From No Validation

```typescript
// Before
const app = express();
app.use('/api', apiRoutes);

// After
const app = express();
integrateConstitutionalAI(app); // Add this line
app.use('/api', apiRoutes);
```

### From Custom Validation

```typescript
// Before
app.use(customValidationMiddleware);

// After
integrateConstitutionalAI(app, {
  constitutional: {
    // Map your custom rules to Constitutional AI config
  }
});
```

## Support

For issues or questions:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

## License

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.