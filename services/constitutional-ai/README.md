# Constitutional AI Service

## Overview

The Constitutional AI Service is the ethical validation framework for Azora OS. It ensures all AI outputs comply with Ubuntu principles, are free from bias, protect user privacy, and prevent harmful content.

## Features

- **Ubuntu Principles Validation**: Validates outputs against collective benefit, knowledge sharing, and inclusive design principles
- **Bias Detection**: Detects and mitigates demographic biases (gender, race, age, religion, disability, etc.)
- **Privacy Filter**: Identifies and redacts personally identifiable information (PII)
- **Harm Prevention**: Blocks harmful content including violence, hate speech, self-harm, and illegal activities
- **Audit Logging**: Comprehensive logging of all validation decisions for compliance and monitoring
- **Real-time Validation**: Fast validation pipeline with <200ms latency target

## Architecture

```
constitutional-ai/
├── types/              # TypeScript type definitions
│   ├── index.ts       # Core types and interfaces
│   └── validators.ts  # Validator-specific types
├── validators/        # Validation modules (to be implemented)
│   ├── ubuntu-validator.ts
│   ├── bias-detector.ts
│   ├── privacy-filter.ts
│   └── harm-prevention.ts
├── utils/             # Utility functions
│   ├── constants.ts   # Shared constants
│   └── helpers.ts     # Helper functions
├── orchestrator.ts    # Main orchestration logic (to be implemented)
├── index.ts           # Service entry point
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript configuration
```

## Installation

```bash
cd services/constitutional-ai
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
# Ubuntu Validation
UBUNTU_ENABLED=true
UBUNTU_THRESHOLD=70

# Bias Detection
BIAS_DETECTION_ENABLED=true
BIAS_SEVERITY_THRESHOLD=medium
AUTO_MITIGATE_BIAS=true

# Privacy Filter
PRIVACY_FILTER_ENABLED=true
PII_REDACTION_ENABLED=true

# Harm Prevention
HARM_PREVENTION_ENABLED=true
HARM_SEVERITY_THRESHOLD=5
BLOCK_HARMFUL_CONTENT=true

# Audit Logging
AUDIT_LOGGING_ENABLED=true
AUDIT_LOG_RETENTION=90

# Performance
VALIDATION_TIMEOUT=5000
PARALLEL_VALIDATION=true

# Compliance
MIN_COMPLIANCE_SCORE=70
STRICT_MODE=false
```

## Usage

### Basic Usage

```typescript
import { ConstitutionalOrchestrator } from '@azora/constitutional-ai';

const orchestrator = new ConstitutionalOrchestrator(config);

// Validate AI output
const result = await orchestrator.validateOutput(
  'What is Ubuntu philosophy?',
  'Ubuntu is an African philosophy meaning "I am because we are"...'
);

if (result.isValid) {
  console.log('Output is compliant:', result.validatedOutput);
  console.log('Compliance score:', result.complianceScore);
} else {
  console.log('Violations found:', result.violations);
}
```

### Integration with API Gateway

```typescript
import { constitutionalMiddleware } from '@azora/constitutional-ai';

app.use('/api/ai', constitutionalMiddleware(config));
```

## Validation Pipeline

1. **Ubuntu Validation**: Checks for collective benefit, knowledge sharing, and inclusive design
2. **Bias Detection**: Scans for demographic biases and applies mitigation
3. **Privacy Filter**: Detects and redacts PII
4. **Harm Prevention**: Assesses potential harm and blocks if necessary
5. **Compliance Scoring**: Calculates overall compliance score
6. **Audit Logging**: Records validation decision

## Compliance Scoring

The compliance score (0-100) is calculated as a weighted average:

- Ubuntu Principles: 30%
- Bias Detection: 25%
- Privacy Filter: 25%
- Harm Prevention: 20%

Minimum compliance score: 70 (configurable)

## Performance Targets

- Validation latency: <200ms (p95)
- Compliance rate: >95%
- Throughput: 1000+ validations/second

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check
```

## Development

```bash
# Start in development mode
npm run dev

# Build TypeScript
npm run build

# Lint code
npm run lint
```

## API Reference

### Types

See `types/index.ts` for complete type definitions.

### Key Interfaces

- `IConstitutionalOrchestrator`: Main orchestrator interface
- `IUbuntuValidator`: Ubuntu principles validation
- `IBiasDetector`: Bias detection and mitigation
- `IPrivacyFilter`: PII detection and redaction
- `IHarmPrevention`: Harm assessment and prevention

## Monitoring

Key metrics tracked:

- `constitutional_ai_validation_count`: Total validations
- `constitutional_ai_validation_duration_ms`: Validation latency
- `constitutional_ai_compliance_score`: Average compliance score
- `constitutional_ai_violation_count`: Violations by type
- `constitutional_ai_bias_detection_count`: Bias detections
- `constitutional_ai_pii_detection_count`: PII detections
- `constitutional_ai_harm_detection_count`: Harm detections

## Ubuntu Philosophy

This service embodies the Ubuntu philosophy:

> "I am because we are"

Every validation decision prioritizes:
- **Collective benefit** over individual gain
- **Knowledge sharing** over information hoarding
- **Inclusive design** over exclusive features
- **Community values** over profit maximization

## License

PROPRIETARY - Azora ES (Pty) Ltd

## Support

For issues or questions, contact the Azora development team.
