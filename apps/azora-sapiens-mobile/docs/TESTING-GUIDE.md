# Mobile App Testing Guide

## Test Structure

```
apps/student-portal-mobile/
├── __tests__/
│   ├── services/
│   │   ├── api.test.ts
│   │   ├── offlineSync.test.ts
│   │   ├── biometricAuth.test.ts
│   │   └── notifications.test.ts
│   ├── screens/
│   │   ├── LoginScreen.test.tsx
│   │   ├── DashboardScreen.test.tsx
│   │   ├── CoursesScreen.test.tsx
│   │   ├── WalletScreen.test.tsx
│   │   └── ProfileScreen.test.tsx
│   ├── hooks/
│   │   ├── useNotifications.test.ts
│   │   └── useOfflineSync.test.ts
│   └── contexts/
│       └── AuthContext.test.tsx
└── e2e/
    ├── auth.e2e.ts
    ├── courses.e2e.ts
    ├── wallet.e2e.ts
    └── offline.e2e.ts
```

## Unit Tests

### Service Tests

#### API Service
```typescript
// __tests__/services/api.test.ts
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should inject authorization token', async () => {
    await AsyncStorage.setItem('token', 'test-token');
    
    const config = await api.interceptors.request.handlers[0].fulfilled({
      headers: {}
    });
    
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  test('should queue operation when offline', async () => {
    // Mock offline state
    // Verify operation is queued
  });
});
```

#### Offline Sync Service
```typescript
// __tests__/services/offlineSync.test.ts
import { OfflineSyncService } from '../../src/services/offlineSync';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Offline Sync Service', () => {
  beforeEach(async () => {
    await OfflineSyncService.clearQueue();
  });

  test('should queue operation', async () => {
    await OfflineSyncService.queueOperation('POST', '/endpoint', { data: 'test' });
    const queue = await OfflineSyncService.getQueue();
    expect(queue).toHaveLength(1);
  });

  test('should sync all operations', async () => {
    await OfflineSyncService.queueOperation('POST', '/endpoint', { data: 'test' });
    const result = await OfflineSyncService.syncAll();
    expect(result.success).toBeGreaterThan(0);
  });

  test('should retry failed operations', async () => {
    // Mock failed operation
    // Verify retry logic
  });
});
```

#### Biometric Auth Service
```typescript
// __tests__/services/biometricAuth.test.ts
import { BiometricAuthService } from '../../src/services/biometricAuth';
import * as LocalAuthentication from 'expo-local-authentication';

describe('Biometric Auth Service', () => {
  test('should check biometric availability', async () => {
    jest.spyOn(LocalAuthentication, 'hasHardwareAsync').mockResolvedValue(true);
    jest.spyOn(LocalAuthentication, 'isEnrolledAsync').mockResolvedValue(true);
    
    const available = await BiometricAuthService.isBiometricAvailable();
    expect(available).toBe(true);
  });

  test('should enable biometric authentication', async () => {
    const success = await BiometricAuthService.enableBiometric('test@example.com', 'password');
    expect(success).toBe(true);
  });

  test('should authenticate with biometric', async () => {
    // Mock biometric authentication
    // Verify credentials are returned
  });
});
```

### Screen Tests

#### Login Screen
```typescript
// __tests__/screens/LoginScreen.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import { useAuth } from '../../src/contexts/AuthContext';

jest.mock('../../src/contexts/AuthContext');

describe('LoginScreen', () => {
  test('should render login form', () => {
    const { getByPlaceholderText } = render(<LoginScreen navigation={{}} />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  test('should handle login', async () => {
    const mockLogin = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
    
    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={{ replace: jest.fn() }} />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Login'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
    });
  });

  test('should show biometric button when available', () => {
    // Mock biometric availability
    // Verify button is shown
  });
});
```

#### Courses Screen
```typescript
// __tests__/screens/CoursesScreen.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CoursesScreen from '../../src/screens/CoursesScreen';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

describe('CoursesScreen', () => {
  test('should load enrolled courses', async () => {
    const mockCourses = [
      { id: '1', title: 'Course 1', progress: 50 }
    ];
    (api.get as jest.Mock).mockResolvedValue({ data: mockCourses });
    
    const { getByText } = render(<CoursesScreen />);
    
    await waitFor(() => {
      expect(getByText('Course 1')).toBeTruthy();
    });
  });

  test('should enroll in course', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
    
    const { getByText } = render(<CoursesScreen />);
    
    // Switch to browse tab
    fireEvent.press(getByText('Browse'));
    
    // Enroll in course
    fireEvent.press(getByText('Enroll Now'));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(expect.stringContaining('/enroll'), {});
    });
  });
});
```

#### Wallet Screen
```typescript
// __tests__/screens/WalletScreen.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WalletScreen from '../../src/screens/WalletScreen';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

describe('WalletScreen', () => {
  test('should display balance', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: { balance: 100, transactions: [] }
    });
    
    const { getByText } = render(<WalletScreen />);
    
    await waitFor(() => {
      expect(getByText('100 AZR')).toBeTruthy();
    });
  });

  test('should handle withdrawal', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
    
    const { getByText } = render(<WalletScreen />);
    
    fireEvent.press(getByText('Withdraw'));
    
    // Enter amount and confirm
    // Verify API call
  });
});
```

## Integration Tests

### Authentication Flow
```typescript
// __tests__/integration/auth.test.ts
describe('Authentication Flow', () => {
  test('should complete login flow', async () => {
    // 1. User enters credentials
    // 2. API validates credentials
    // 3. Token is stored
    // 4. User is redirected to dashboard
  });

  test('should handle biometric login', async () => {
    // 1. User enables biometric
    // 2. Credentials are stored securely
    // 3. User can login with biometric
  });

  test('should handle logout', async () => {
    // 1. User logs out
    // 2. Token is cleared
    // 3. User is redirected to login
  });
});
```

### Offline Sync Flow
```typescript
// __tests__/integration/offline.test.ts
describe('Offline Sync Flow', () => {
  test('should queue operations when offline', async () => {
    // 1. Go offline
    // 2. Perform mutations
    // 3. Verify operations are queued
  });

  test('should sync when online', async () => {
    // 1. Queue operations while offline
    // 2. Go online
    // 3. Verify operations are synced
  });

  test('should retry failed operations', async () => {
    // 1. Queue operation
    // 2. Sync fails
    // 3. Verify retry logic
  });
});
```

## E2E Tests

### User Journey Tests
```typescript
// e2e/auth.e2e.ts
describe('Authentication E2E', () => {
  test('complete login journey', async () => {
    // 1. Launch app
    // 2. Enter credentials
    // 3. Tap login
    // 4. Verify dashboard is shown
  });

  test('complete biometric login journey', async () => {
    // 1. Enable biometric
    // 2. Logout
    // 3. Tap biometric login
    // 4. Authenticate
    // 5. Verify dashboard is shown
  });
});
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- __tests__/services/api.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Integration Tests
```bash
# Run integration tests
npm test -- __tests__/integration

# Run specific integration test
npm test -- __tests__/integration/auth.test.ts
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- e2e/auth.e2e.ts

# Run on specific device
npm run test:e2e -- --device ios
```

## Test Coverage

### Coverage Targets
- Services: 90%+
- Screens: 80%+
- Hooks: 85%+
- Contexts: 90%+
- Overall: 80%+

### Generate Coverage Report
```bash
npm test -- --coverage --coverageReporters=html

# Open coverage report
open coverage/index.html
```

## Mocking

### Mock API Responses
```typescript
jest.mock('../../src/services/api');

const mockApi = api as jest.Mocked<typeof api>;
mockApi.get.mockResolvedValue({ data: { /* response */ } });
```

### Mock AsyncStorage
```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
```

### Mock Navigation
```typescript
const mockNavigation = {
  navigate: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
};
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the component does
   - Don't test internal state

2. **Use Descriptive Test Names**
   - Clearly describe what is being tested
   - Use "should" pattern

3. **Keep Tests Isolated**
   - Each test should be independent
   - Clean up after each test

4. **Mock External Dependencies**
   - Mock API calls
   - Mock device features
   - Mock navigation

5. **Test User Interactions**
   - Test button presses
   - Test form submissions
   - Test navigation flows

6. **Test Error Scenarios**
   - Test network errors
   - Test validation errors
   - Test permission denials

## Continuous Integration

### GitHub Actions
```yaml
name: Mobile Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run test:e2e
```

## Resources

- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/)
- [Detox E2E Testing](https://wix.github.io/Detox/)
