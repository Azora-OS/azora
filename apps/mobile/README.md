# Azora OS Mobile App

Constitutional AI Operating System - iOS & Android

## Setup

```bash
# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Start development
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Build for Production

### iOS
```bash
# Build for TestFlight
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android
```bash
# Build APK
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## Environment Variables

Copy `.env.example` to `.env`:
```bash
EXPO_PUBLIC_API_URL=https://api.azora.world
EXPO_PUBLIC_WS_URL=wss://api.azora.world
EXPO_PUBLIC_ENV=production
```

## Features

- ✅ Authentication with biometrics
- ✅ Course browsing and enrollment
- ✅ Wallet and AZR balance
- ✅ Push notifications
- ✅ Offline support
- ✅ Backend API integration

## Status

🟢 **FUNCTIONAL** - Buildable and deployable
