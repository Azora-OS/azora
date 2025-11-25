# Azora Student Mobile App

React Native mobile application for Azora OS student portal, built with Expo for iOS and Android.

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (for iOS development)
- Android: Android Studio (for Android development)

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Running on Devices

### iOS
```bash
npm run ios
# Or with Expo Go app:
# Scan QR code from terminal
```

### Android
```bash
npm run android
# Or with Expo Go app:
# Scan QR code from terminal
```

### Web (Development)
```bash
npm run web
```

## Core Features

### Authentication
- ✅ Email/password login
- ✅ Biometric authentication (fingerprint/face recognition)
- ✅ Secure credential storage
- ✅ Session persistence
- ✅ Auto-logout on token expiry

### Dashboard
- ✅ User statistics (courses, balance, streak)
- ✅ Recent activity feed
- ✅ Quick action buttons
- ✅ Pull-to-refresh

### Courses
- ✅ Browse available courses
- ✅ Enroll in courses
- ✅ Track course progress
- ✅ Complete lessons
- ✅ Offline lesson completion (queued for sync)

### Wallet
- ✅ View AZR balance
- ✅ Transaction history
- ✅ Add funds (payment integration)
- ✅ Withdraw funds
- ✅ Offline payment queueing

### Profile
- ✅ User information
- ✅ Security settings
- ✅ Biometric management
- ✅ Notification preferences
- ✅ Cache management
- ✅ Pending sync status

## Offline Support

The app supports offline functionality with automatic sync when connection is restored:

### Offline Sync Service
- Queues mutations (POST, PUT, DELETE) when offline
- Automatically syncs when connection is restored
- Retry logic with exponential backoff
- Persistent queue storage

### Usage
```typescript
import { OfflineSyncService } from './services/offlineSync';

// Queue an operation
await OfflineSyncService.queueOperation('POST', '/endpoint', { data });

// Manual sync
const result = await OfflineSyncService.syncAll();

// Check pending operations
const count = await OfflineSyncService.getPendingCount();
```

## Biometric Authentication

Supports fingerprint and face recognition on iOS and Android:

```typescript
import { BiometricAuthService } from './services/biometricAuth';

// Check availability
const available = await BiometricAuthService.isBiometricAvailable();

// Enable biometric
await BiometricAuthService.enableBiometric(email, password);

// Authenticate
const credentials = await BiometricAuthService.authenticateWithBiometric();
```

## Push Notifications

Firebase Cloud Messaging integration for push notifications:

```typescript
import { NotificationService } from './services/notifications';

// Get push token
const token = await NotificationService.getExpoPushToken();

// Schedule local notification
await NotificationService.scheduleLocalNotification('Title', 'Body');

// Schedule course reminder
await NotificationService.scheduleCourseReminder('Course Name', scheduledTime);
```

## API Integration

The app uses Axios with automatic token injection and offline queueing:

```typescript
import api from './services/api';

// Automatic token injection
const response = await api.get('/endpoint');

// Offline queueing for mutations
const response = await api.post('/endpoint', data);
// If offline, operation is queued and synced later
```

## Environment Configuration

Create `.env` file:
```
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

## Project Structure

```
apps/student-portal-mobile/
├── src/
│   ├── contexts/          # React contexts (Auth)
│   ├── hooks/             # Custom hooks (useNotifications, useOfflineSync)
│   ├── screens/           # Screen components
│   ├── services/          # API, notifications, offline sync, biometric
│   └── types/             # TypeScript types
├── components/            # Reusable UI components
├── assets/                # Images, icons, fonts
├── app.json               # Expo configuration
├── App.tsx                # Root component
└── package.json           # Dependencies
```

## Dependencies

### Core
- `expo`: Expo framework
- `react-native`: React Native framework
- `@react-navigation/*`: Navigation library

### Services
- `axios`: HTTP client
- `@react-native-async-storage/async-storage`: Local storage
- `expo-notifications`: Push notifications
- `expo-secure-store`: Secure credential storage
- `expo-local-authentication`: Biometric authentication
- `@react-native-community/netinfo`: Network status

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

### Submit to App Stores
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## Troubleshooting

### Build Issues
- Clear cache: `npm start -- --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Clear Expo cache: `expo start --clear`

### Connection Issues
- Verify API URL in `.env`
- Check network connectivity
- Review offline sync queue in Profile screen

### Biometric Issues
- Ensure device has biometric capability
- Check permissions in app settings
- Verify biometric is enrolled on device

## Performance Optimization

- Lazy load screens with React Navigation
- Memoize expensive computations
- Use FlatList for large lists
- Implement pagination for data
- Cache API responses locally

## Security Best Practices

- Never store sensitive data in AsyncStorage
- Use SecureStore for credentials
- Validate all user inputs
- Implement rate limiting
- Use HTTPS for all API calls
- Rotate tokens regularly

## Contributing

Follow the Azora OS development standards:
- TypeScript strict mode
- 80%+ test coverage
- ESLint configuration
- Prettier formatting
- Conventional commits

## License

See LICENSE file in root directory
