# iOS Build Guide

## Prerequisites

- macOS with Xcode 14+
- Apple Developer Account
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

## Setup

### 1. Create Apple Developer Account

1. Go to [Apple Developer Program](https://developer.apple.com/programs/)
2. Enroll in the program ($99/year)
3. Create App ID in Apple Developer Portal
4. Create provisioning profiles

### 2. Configure EAS

```bash
# Login to Expo
eas login

# Initialize EAS for your project
eas build:configure
```

### 3. Update app.json

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "world.azora.student",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSFaceIDUsageDescription": "We use Face ID to securely authenticate you",
        "NSLocalNetworkUsageDescription": "We need local network access for development"
      }
    }
  }
}
```

## Building

### Development Build

```bash
# Build for iOS simulator
eas build --platform ios --profile preview

# Build for physical device
eas build --platform ios --profile preview --device
```

### Production Build

```bash
# Build for App Store
eas build --platform ios --profile production
```

## Testing on Device

### Using Xcode

```bash
# Open iOS project
open ios/AzoraStudent.xcworkspace

# Select device and run
# Cmd + R to build and run
```

### Using Expo Go

```bash
# Start development server
npm start

# Scan QR code with iPhone camera
# Opens in Expo Go app
```

## Submitting to App Store

### 1. Create App Store Connect Record

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Create new app
3. Fill in app information
4. Set pricing and availability

### 2. Submit Build

```bash
# Submit to App Store
eas submit --platform ios --latest
```

### 3. Review Process

- Apple reviews app (typically 24-48 hours)
- May request changes
- Once approved, app is available on App Store

## Signing Certificates

### Automatic Signing (Recommended)

EAS handles signing automatically:

```bash
# EAS manages certificates
eas build --platform ios
```

### Manual Signing

If you need manual control:

```bash
# Create signing certificate
eas credentials

# Select iOS
# Follow prompts to create/manage certificates
```

## Troubleshooting

### Build Failures

```bash
# Check build logs
eas build:view

# Clear cache and rebuild
eas build --platform ios --clear-cache
```

### Signing Issues

```bash
# Reset credentials
eas credentials --platform ios --clear

# Reconfigure
eas credentials --platform ios
```

### App Store Rejection

Common reasons:
- Missing privacy policy
- Incomplete app information
- Guideline violations
- Performance issues

Review [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## Performance Optimization

- Minimize app size (target: <100MB)
- Optimize images and assets
- Use code splitting
- Implement lazy loading

## Monitoring

### Crash Reports

```bash
# View crash reports in Xcode
# Window > Organizer > Crashes
```

### Analytics

- Use Firebase Analytics
- Track user engagement
- Monitor performance metrics

## Versioning

Update version in app.json:

```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    }
  }
}
```

Increment buildNumber for each submission.

## Resources

- [Expo iOS Documentation](https://docs.expo.dev/build/setup/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
