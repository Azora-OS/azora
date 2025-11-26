# Testing Section Template for Service READMEs

This template should be added to each service README.md file to document test status, coverage, and guidelines.

## Testing

### Test Status
- **Status**: [✅ Passing | ⚠️ Partial | ❌ Failing | 🚧 In Progress | ⭕ No Tests]
- **Test Suites**: [X passing / Y total]
- **Last Updated**: [YYYY-MM-DD]

### Test Coverage
- **Overall**: [X]%
- **Lines**: [X]%
- **Functions**: [X]%
- **Branches**: [X]%
- **Statements**: [X]%

### Test Categories

#### Unit Tests
- **Location**: `tests/unit/`
- **Coverage**: [X]%
- **Status**: [✅ Passing | ⚠️ Partial | ❌ Failing | ⭕ No Tests]
- **Key Test Files**:
  - `[filename].test.ts` - [Description]
  - `[filename].test.ts` - [Description]

#### Integration Tests
- **Location**: `tests/integration/`
- **Coverage**: [X]%
- **Status**: [✅ Passing | ⚠️ Partial | ❌ Failing | ⭕ No Tests]
- **Key Test Files**:
  - `[filename].test.ts` - [Description]
  - `[filename].test.ts` - [Description]

### Test Scenarios Covered
- ✅ [Scenario 1]
- ✅ [Scenario 2]
- ⚠️ [Scenario 3 - Partial]
- ❌ [Scenario 4 - Not Covered]

### Running Tests

#### Run All Tests
```bash
npm test -- services/[service-name]
```

#### Run Specific Test Suite
```bash
npm test -- services/[service-name]/tests/[test-file].test.ts
```

#### Run Tests in Watch Mode
```bash
npm test -- services/[service-name] --watch
```

#### Run Tests with Coverage
```bash
npm test -- services/[service-name] --coverage
```

#### Run Integration Tests Only
```bash
npm test -- services/[service-name]/tests/integration
```

### Testing Guidelines

#### Using Test Factories
```typescript
import { createTestUser, createTest[Entity] } from '@/tests/factories';

// Create test data
const user = await createTestUser({ role: 'student' });
const entity = await createTest[Entity]({ userId: user.id });
```

#### Testing [Service] Operations
```typescript
import { setupTestDatabase, cleanupTestDatabase } from '@/tests/utils/database';

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});

it('should [perform operation]', async () => {
  // Test implementation
});
```

### Known Issues
- [Issue 1 description]
- [Issue 2 description]
- None currently

### Test Dependencies
- Jest 29.x
- [Other dependencies specific to service]
- Test utilities from `@/tests/utils`
- Test factories from `@/tests/factories`

### Troubleshooting

#### Tests Failing Locally
1. [Service-specific troubleshooting step 1]
2. Clear test cache: `npm test -- --clearCache`
3. [Service-specific troubleshooting step 3]

#### [Specific Issue Category]
1. [Solution step 1]
2. [Solution step 2]

### Contributing Tests
See [Testing Standards](../../docs/testing/TESTING-STANDARDS.md) for detailed guidelines on writing tests.
