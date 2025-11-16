# Quick Start Guide

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web
```bash
npm run web
```

## Key Features

### 1. Authentication
- Email/password login
- Biometric login (fingerprint/face)
- Secure token storage

### 2. Courses
- Browse available courses
- Enroll in courses
- Track progress
- Complete lessons offline

### 3. Wallet
- View AZR balance
- Add funds
- Withdraw funds
- View transaction history

### 4. Offline Support
- Automatic operation queueing
- Sync when online
- Retry logic

### 5. Notifications
- Push notifications
- Course reminders
- Reward notifications

## Development

### Project Structure
```
src/
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── screens/       # Screen components
└── services/      # API, auth, sync, notifications
```

### Adding a New Screen

1. Create screen component in `src/screens/`
2. Add to navigation in `App.tsx`
3. Add tests in `__tests__/screens/`

### Adding a New Service

1. Create service in `src/services/`
2. Add tests in `__tests__/services/`
3. Create hook if needed in `src/hooks/`

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# E2E tests
npm run test:e2e
```

## Building

### Development Build
```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

### Production Build
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Submit to App Stores
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## Environment Setup

Create `.env` file:
```
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

## Troubleshooting

### Clear Cache
```bash
npm start -- --clear
```

### Reinstall Dependencies
```bash
rm -rf node_modules
npm install
```

### Reset Expo Cache
```bash
expo start --clear
```

## Documentation

- [README.md](./README.md) - Full documentation
- [docs/iOS-BUILD-GUIDE.md](./docs/iOS-BUILD-GUIDE.md) - iOS build guide
- [docs/ANDROID-BUILD-GUIDE.md](./docs/ANDROID-BUILD-GUIDE.md) - Android build guide
- [docs/TESTING-GUIDE.md](./docs/TESTING-GUIDE.md) - Testing guide

## Common Tasks

### Add a New API Endpoint
```typescript
// In src/services/api.ts
const response = await api.get('/new-endpoint');
```

### Queue an Offline Operation
```typescript
import { OfflineSyncService } from './services/offlineSync';

await OfflineSyncService.queueOperation('POST', '/endpoint', { data });
```

### Enable Biometric Auth
```typescript
import { BiometricAuthService } from './services/biometricAuth';

await BiometricAuthService.enableBiometric(email, password);
```

### Send a Notification
```typescript
import { NotificationService } from './services/notifications';

await NotificationService.scheduleLocalNotification('Title', 'Body');
```

## Performance Tips

1. Use FlatList for long lists
2. Memoize expensive computations
3. Lazy load screens
4. Optimize images
5. Use pagination for data

## Security Tips

1. Never store secrets in code
2. Use SecureStore for credentials
3. Validate all inputs
4. Use HTTPS for API calls
5. Implement rate limiting

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Axios Documentation](https://axios-http.com/)

## Support

For issues or questions:
1. Check the documentation
2. Review existing code examples
3. Check GitHub issues
4. Contact the team
