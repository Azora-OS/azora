# Android Build Guide

## Prerequisites

- Android Studio 2022+
- Java Development Kit (JDK) 11+
- Google Play Developer Account ($25 one-time)
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

## Setup

### 1. Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Create developer account ($25 one-time fee)
3. Create new app
4. Fill in app information

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
    "android": {
      "package": "world.azora.student",
      "versionCode": 1,
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B4F6F"
      }
    }
  }
}
```

## Building

### Development Build

```bash
# Build for Android emulator
eas build --platform android --profile preview

# Build for physical device
eas build --platform android --profile preview --device
```

### Production Build

```bash
# Build for Google Play Store
eas build --platform android --profile production
```

## Testing on Device

### Using Android Studio Emulator

```bash
# Start emulator
emulator -avd Pixel_4_API_30

# Install APK
adb install app-release.apk

# Run app
adb shell am start -n world.azora.student/.MainActivity
```

### Using Physical Device

```bash
# Enable USB debugging on device
# Settings > Developer Options > USB Debugging

# Connect device
adb devices

# Install APK
adb install app-release.apk
```

### Using Expo Go

```bash
# Start development server
npm start

# Scan QR code with Android phone
# Opens in Expo Go app
```

## Submitting to Google Play Store

### 1. Create App Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in app details:
   - App name
   - Description
   - Screenshots (5 minimum)
   - Feature graphic
   - Category
   - Content rating

### 2. Generate Signing Key

```bash
# EAS handles signing automatically
# Or manually:

# Create keystore
keytool -genkey -v -keystore azora-student.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias azora-student

# Store keystore securely
```

### 3. Submit Build

```bash
# Submit to Google Play
eas submit --platform android --latest
```

### 4. Review Process

- Google Play reviews app (typically 2-4 hours)
- May request changes
- Once approved, app is available on Play Store

## Signing Configuration

### Automatic Signing (Recommended)

EAS handles signing automatically:

```bash
# EAS manages keystore
eas build --platform android
```

### Manual Signing

If you need manual control:

```bash
# Create signing credentials
eas credentials --platform android

# Select Android
# Follow prompts to create/manage keystore
```

## Troubleshooting

### Build Failures

```bash
# Check build logs
eas build:view

# Clear cache and rebuild
eas build --platform android --clear-cache
```

### Signing Issues

```bash
# Reset credentials
eas credentials --platform android --clear

# Reconfigure
eas credentials --platform android
```

### Play Store Rejection

Common reasons:
- Missing privacy policy
- Incomplete app information
- Policy violations
- Malware detection

Review [Google Play Policies](https://play.google.com/about/developer-content-policy/)

## Performance Optimization

- Minimize app size (target: <50MB)
- Use ProGuard/R8 for code shrinking
- Optimize images and assets
- Implement lazy loading

## Monitoring

### Crash Reports

```bash
# View crash reports in Google Play Console
# Analytics > Crashes & ANRs
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
    "android": {
      "versionCode": 1
    }
  }
}
```

Increment versionCode for each submission.

## Testing Tracks

### Internal Testing

```bash
# Submit to internal testing track
eas submit --platform android --track internal
```

### Closed Testing

```bash
# Submit to closed testing track
eas submit --platform android --track closed
```

### Open Testing

```bash
# Submit to open testing track
eas submit --platform android --track open
```

### Production

```bash
# Submit to production
eas submit --platform android --track production
```

## Resources

- [Expo Android Documentation](https://docs.expo.dev/build/setup/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Android Developer Documentation](https://developer.android.com/docs)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
