# Constitutional AI Service Structure

## Overview

This document describes the complete structure of the Constitutional AI service, which implements ethical validation for all AI outputs in Azora OS.

## Directory Structure

```
services/constitutional-ai/
├── __tests__/              # Test files
│   ├── .gitkeep
│   └── setup.test.ts       # Service setup tests
├── types/                  # TypeScript type definitions
│   ├── index.ts           # Core types and interfaces
│   └── validators.ts      # Validator-specific types
├── utils/                  # Utility functions
│   ├── constants.ts       # Shared constants and patterns
│   └── helpers.ts         # Helper functions
├── validators/            # Validation modules
│   ├── .gitkeep
│   ├── index.ts          # Validator exports
│   ├── ubuntu-validator.ts           # Ubuntu principles validator (✓ Complete)
│   └── validation-rules-engine.ts    # Rules engine (✓ Complete)
├── .env.example           # Environment configuration template
├── .gitignore            # Git ignore rules
├── constitutional-filter.ts  # Legacy filter (to be deprecated)
├── index.ts              # Service entry point
├── jest.config.js        # Jest test configuration
├── package.json          # Dependencies and scripts
├── README.md             # Service documentation
├── STRUCTURE.md          # This file
└── tsconfig.json         # TypeScript configuration
```

## Completed Components

### ✓ Base Infrastructure (Task 1)

1. **Service Directory Structure**
   - All directories created and organized
   - Proper separation of concerns (types, utils, validators)

2. **TypeScript Configuration**
   - Strict mode enabled
   - Path aliases configured (@/, @/validators/, @/types/, @/utils/)
   - Extends base tsconfig from workspace root
   - Source maps and declarations enabled

3. **Dependencies**
   - Express for HTTP server
   - Zod for runtime validation
   - Jest and ts-jest for testing
   - TypeScript and ESLint for code quality

4. **Base Interfaces and Types**
   - Core validation types (ValidationResult, ConstitutionalResult)
   - Ubuntu validation types (UbuntuValidationResult)
   - Bias detection types (BiasReport, BiasScore, BiasType)
   - Privacy filter types (FilterResult, PIIMatch, PIIType)
   - Harm prevention types (HarmAssessment, HarmType)
   - Orchestrator interfaces (IConstitutionalOrchestrator)
   - Configuration types (ConstitutionalAIConfig)

5. **Utility Functions**
   - Constants for Ubuntu principles, bias patterns, PII patterns, harm keywords
   - Helper functions for scoring, sanitization, validation
   - Audit log utilities
   - Performance measurement utilities

6. **Ubuntu Validator** (Complete)
   - Validates collective benefit principle
   - Validates knowledge sharing principle
   - Validates inclusive design principle
   - Configurable weights and thresholds
   - Generates suggestions for improvement

7. **Validation Rules Engine** (Complete)
   - Rule-based pattern matching
   - Support for keyword and regex patterns
   - Rule management (add, remove, enable/disable)
   - Export/import functionality
   - Comprehensive default rules for Ubuntu principles

8. **Testing Infrastructure**
   - Jest configuration with ts-jest
   - Coverage thresholds set to 80%
   - Path aliases configured for tests
   - Setup test file created

9. **Documentation**
   - Comprehensive README with usage examples
   - Environment configuration template
   - API reference documentation
   - This structure document

## Pending Components (Future Tasks)

### Task 2: Ubuntu Principles Validator
- ✓ Already implemented in task 1

### Task 3: Bias Detection System
- [ ] Bias detector module
- [ ] Demographic bias detection
- [ ] Bias mitigation strategies
- [ ] Integration with external bias detection libraries

### Task 4: Privacy Filter
- [ ] PII detection module
- [ ] PII redaction logic
- [ ] Privacy filter service
- [ ] Configurable redaction patterns

### Task 5: Harm Prevention System
- [ ] Harm assessment module
- [ ] Harm type detection
- [ ] Safe response generator
- [ ] Severity scoring

### Task 6: Constitutional Orchestrator
- [ ] Main orchestrator service
- [ ] Integration of all validators
- [ ] Validation pipeline
- [ ] Audit logging
- [ ] API Gateway middleware
- [ ] Compliance metrics

## Configuration

The service is configured via environment variables (see `.env.example`):

- **Ubuntu Validation**: Enable/disable, thresholds, weights
- **Bias Detection**: Enable/disable, severity thresholds, auto-mitigation
- **Privacy Filter**: Enable/disable, PII types, redaction patterns
- **Harm Prevention**: Enable/disable, severity thresholds, blocking
- **Audit Logging**: Enable/disable, retention period, encryption
- **Performance**: Timeouts, parallel validation, concurrency limits
- **Compliance**: Minimum scores, strict mode, regeneration

## Type System

The service uses a comprehensive type system:

1. **Enums**: BiasType, BiasSeverity, PIIType, HarmType, RuleType, RuleSeverity
2. **Interfaces**: All validator interfaces, result types, configuration types
3. **Type Guards**: Runtime type validation with Zod
4. **Generics**: Reusable validator patterns

## Testing Strategy

- **Unit Tests**: Individual validator logic (70% of tests)
- **Integration Tests**: Validator pipeline integration (20% of tests)
- **E2E Tests**: Full validation flow (10% of tests)
- **Coverage Target**: 80% minimum across all modules

## Performance Targets

- **Validation Latency**: <200ms (p95)
- **Compliance Rate**: >95%
- **Throughput**: 1000+ validations/second
- **Memory Usage**: <100MB per instance

## Ubuntu Philosophy Integration

Every component embodies Ubuntu principles:

- **Collective Benefit**: Validates outputs benefit the community
- **Knowledge Sharing**: Promotes educational and transparent content
- **Inclusive Design**: Ensures accessibility and equity
- **Sovereignty Respecting**: Protects user privacy and autonomy
- **Pro-Social**: Prevents harm and promotes positive outcomes

## Next Steps

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Type check: `npm run type-check`
4. Proceed to Task 2: Implement remaining validators
5. Proceed to Task 6: Implement orchestrator

## Requirements Mapping

This structure satisfies the following requirements from the spec:

- **Requirement 1.1**: Ubuntu principles validation framework
- **Requirement 1.2**: Bias detection system (structure ready)
- **Requirement 1.3**: Privacy filter (structure ready)
- **Requirement 1.4**: Harm prevention (structure ready)
- **Requirement 1.5**: Constitutional orchestrator (structure ready)
- **Requirement 1.6**: Audit logging (types defined)
- **Requirement 1.7**: 95% compliance rate (testing infrastructure ready)

## Status

✅ **Task 1 Complete**: Constitutional AI service structure fully set up with:
- Complete directory structure
- TypeScript configuration with strict mode
- All base interfaces and types defined
- Comprehensive utility functions
- Ubuntu validator fully implemented
- Validation rules engine fully implemented
- Testing infrastructure configured
- Documentation complete

The service is ready for implementation of remaining validators (Tasks 3-6).
