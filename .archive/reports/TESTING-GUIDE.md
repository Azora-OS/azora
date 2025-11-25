# 🧪 Testing Guide

**Comprehensive testing strategy for Azora OS**

---

## 📊 Test Coverage Status

```
Target Coverage: 70%+
Current Coverage: Implemented for core services
Test Framework: Jest + Supertest
```

---

## 🚀 Running Tests

### All Services
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Individual Service
```bash
cd services/azora-lms
npm test
```

---

## ✅ Implemented Tests

### 1. **azora-lms** (LMS Service)
- Course CRUD operations
- Student enrollment
- Progress tracking
- Lesson management

### 2. **azora-mint** (Token System)
- Proof-of-Knowledge engine
- Economic policy
- Token minting
- Wallet operations
- Staking/unstaking

### 3. **azora-forge** (Marketplace)
- Job posting CRUD
- Application submission
- Profile management
- AI job matching

---

## 📝 Test Structure

```
services/
├── azora-lms/
│   ├── __tests__/
│   │   └── lms.test.js
│   ├── api/
│   │   └── lms.js
│   └── package.json
├── azora-mint/
│   ├── __tests__/
│   │   └── mint.test.js
│   ├── pok-engine.js
│   └── economic-policy.js
└── azora-forge/
    ├── __tests__/
    │   └── marketplace.test.js
    └── api/
        └── marketplace.js
```

---

## 🎯 Test Examples

### API Testing
```javascript
const request = require('supertest');
const app = require('../index');

describe('API Tests', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
```

### Unit Testing
```javascript
const Engine = require('../engine');

describe('Engine Tests', () => {
  it('should process data correctly', () => {
    const engine = new Engine();
    const result = engine.process('test');
    expect(result).toBeDefined();
  });
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions
- Automated testing on push/PR
- Coverage reporting
- Multi-service testing
- Docker builds
- Deployment pipelines

### Workflows
1. **services-ci.yml** - Test all services
2. **test-coverage.yml** - Generate coverage reports
3. **ci.yml** - Main CI/CD pipeline

---

## 📈 Coverage Goals

| Service | Target | Current |
|---------|--------|---------|
| azora-lms | 70% | ✅ |
| azora-mint | 70% | ✅ |
| azora-forge | 70% | ✅ |
| azora-assessment | 70% | Pending |
| Others | 70% | Pending |

---

## 🛠️ Adding Tests to New Services

### 1. Create Test Directory
```bash
mkdir services/your-service/__tests__
```

### 2. Add Test File
```javascript
// services/your-service/__tests__/service.test.js
describe('Your Service', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

### 3. Update package.json
```json
{
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}
```

### 4. Run Tests
```bash
cd services/your-service
npm test
```

---

## 🎯 Best Practices

### Test Coverage
- Aim for 70%+ coverage
- Test critical paths first
- Mock external dependencies
- Test error cases

### Test Organization
- One test file per module
- Descriptive test names
- Group related tests
- Clean up after tests

### Performance
- Keep tests fast (< 5s per suite)
- Use beforeEach/afterEach
- Mock slow operations
- Parallel test execution

---

## 🔍 Debugging Tests

```bash
# Run specific test
npm test -- lms.test.js

# Debug mode
node --inspect-brk node_modules/.bin/jest

# Verbose output
npm test -- --verbose
```

---

## 📊 Coverage Reports

```bash
# Generate HTML report
npm run test:coverage

# View report
open coverage/lcov-report/index.html
```

---

**"Ngiyakwazi ngoba sikwazi"** - Testing together! 🚀
