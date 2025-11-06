# 🏗️ BUILD INSTRUCTIONS - Production Apps

**Complete guide to building production-ready applications for all platforms**

---

## 📋 PREREQUISITES

### **All Platforms:**
```bash
✅ Node.js 20+ (https://nodejs.org/)
✅ Git (https://git-scm.com/)
✅ Code signing certificates (for distribution)
```

### **Windows Builds:**
```bash
✅ Windows 10/11 or Windows Server
✅ Visual Studio Build Tools 2019+
✅ Windows SDK
✅ Code signing certificate (.pfx)
```

### **macOS Builds:**
```bash
✅ macOS 11+ (Big Sur or later)
✅ Xcode 13+ (from App Store)
✅ Apple Developer account ($99/year)
✅ Apple Developer certificates
```

### **Linux Builds:**
```bash
✅ Ubuntu 20.04+ (or any modern Linux)
✅ build-essential package
✅ No code signing required
```

### **Android Builds:**
```bash
✅ Android Studio (https://developer.android.com/studio)
✅ Java JDK 17+
✅ Android SDK 34+
✅ Google Play Console account ($25 one-time)
✅ Android keystore for signing
```

### **iOS Builds:**
```bash
✅ macOS only (iOS builds require Mac)
✅ Xcode 14+ with Command Line Tools
✅ Apple Developer account ($99/year)
✅ iOS certificates and provisioning profiles
✅ CocoaPods (gem install cocoapods)
```

---

## 🖥️ DESKTOP BUILDS (ELECTRON)

### **Step 1: Setup**
```bash
cd apps/student-portal

# Install dependencies
npm install

# Copy Electron package.json
cp package.electron.json package.json

# Install Electron dependencies
npm install
```

### **Step 2: Build for Windows**
```bash
# Build executable
npm run build:win

# Output will be in:
# dist/Azora-Student-Portal-1.0.0-Setup.exe (installer)
# dist/Azora-Student-Portal-1.0.0-Portable.exe (portable)

# File sizes:
# Installer: ~150MB
# Portable: ~200MB
```

### **Step 3: Build for macOS**
```bash
# Build DMG and ZIP
npm run build:mac

# Output will be in:
# dist/Azora-Student-Portal-1.0.0-arm64.dmg (Apple Silicon)
# dist/Azora-Student-Portal-1.0.0-x64.dmg (Intel)
# dist/Azora-Student-Portal-1.0.0-mac.zip

# File sizes:
# DMG: ~150MB
# ZIP: ~200MB
```

### **Step 4: Build for Linux**
```bash
# Build AppImage and DEB
npm run build:linux

# Output will be in:
# dist/azora-student-portal-1.0.0-x64.AppImage
# dist/azora-student-portal_1.0.0_amd64.deb
# dist/azora-student-portal-1.0.0-x86_64.rpm

# File sizes:
# AppImage: ~180MB
# DEB: ~150MB
```

---

## 📱 MOBILE BUILDS (REACT NATIVE)

### **Step 1: Setup React Native Project**
```bash
# Create new React Native project
npx react-native init AzoraStudentPortal --template react-native-template-typescript

# Or use existing web code with React Native Web
cd apps/student-portal-mobile
npm install
```

### **Step 2: Build Android APK**
```bash
cd android

# Generate release keystore (first time only)
keytool -genkey -v -keystore azora-release-key.keystore \
  -alias azora -keyalg RSA -keysize 2048 -validity 10000

# Add to android/gradle.properties:
MYAPP_RELEASE_STORE_FILE=azora-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=azora
MYAPP_RELEASE_STORE_PASSWORD=your_password
MYAPP_RELEASE_KEY_PASSWORD=your_password

# Build APK
./gradlew assembleRelease

# Output will be in:
# android/app/build/outputs/apk/release/app-release.apk

# File size: ~50-100MB
```

### **Step 3: Build Android App Bundle (for Play Store)**
```bash
cd android

# Build AAB
./gradlew bundleRelease

# Output will be in:
# android/app/build/outputs/bundle/release/app-release.aab

# File size: ~40-80MB (smaller than APK)
```

### **Step 4: Build iOS IPA**
```bash
cd ios

# Install CocoaPods dependencies
pod install

# Build for device
xcodebuild -workspace AzoraStudentPortal.xcworkspace \
  -scheme AzoraStudentPortal \
  -configuration Release \
  -archivePath build/AzoraStudentPortal.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/AzoraStudentPortal.xcarchive \
  -exportPath build \
  -exportOptionsPlist exportOptions.plist

# Output will be in:
# ios/build/AzoraStudentPortal.ipa

# File size: ~60-120MB
```

---

## 🔐 CODE SIGNING

### **Windows:**
```bash
# Sign .exe with certificate
signtool sign /f certificate.pfx /p password \
  /t http://timestamp.digicert.com \
  dist/Azora-Student-Portal-Setup.exe

# Verify signature
signtool verify /pa dist/Azora-Student-Portal-Setup.exe
```

### **macOS:**
```bash
# Sign app
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name" \
  "dist/mac/Azora Student Portal.app"

# Notarize for Gatekeeper
xcrun notarytool submit dist/Azora-Student-Portal.dmg \
  --apple-id your@email.com \
  --password app-specific-password \
  --team-id TEAM_ID

# Staple notarization
xcrun stapler staple "dist/Azora Student Portal.app"
```

### **Android:**
```bash
# APK is automatically signed during build if keystore configured
# Verify signature
jarsigner -verify -verbose -certs app-release.apk

# Or use apksigner
apksigner verify app-release.apk
```

### **iOS:**
```bash
# Signing happens automatically through Xcode
# Ensure certificates and provisioning profiles are installed
# Use Xcode -> Preferences -> Accounts to manage
```

---

## 🧪 TESTING BUILDS

### **Desktop:**
```bash
# Test on your development machine
npm run dev:electron

# Test built app
# Windows: Double-click .exe
# macOS: Open .dmg and drag to Applications
# Linux: chmod +x *.AppImage && ./azora-student-portal.AppImage
```

### **Mobile:**
```bash
# Test Android on emulator
npx react-native run-android

# Test Android on device
adb install app-release.apk

# Test iOS on simulator
npx react-native run-ios

# Test iOS on device (requires developer account)
# Use Xcode to install IPA
```

---

## 📦 DISTRIBUTION

### **Desktop Apps:**

**Option 1: Direct Download**
- Upload to your website
- Provide download links
- Users install manually

**Option 2: App Stores**
- Microsoft Store (Windows)
- Mac App Store (macOS)
- Snap Store (Linux)

### **Mobile Apps:**

**Option 1: App Stores (Recommended)**
```bash
# Google Play Store
# 1. Create app at play.google.com/console
# 2. Upload AAB file
# 3. Fill out store listing
# 4. Submit for review (1-3 days)

# Apple App Store
# 1. Create app at appstoreconnect.apple.com
# 2. Upload IPA via Xcode or Transporter
# 3. Fill out store listing
# 4. Submit for review (1-3 days)
```

**Option 2: Direct APK (Android only)**
- Upload APK to website
- Users download and install
- Requires "Install from Unknown Sources" enabled

---

## 🔄 AUTO-UPDATES

### **Electron (Desktop):**
Already configured with `electron-updater`

```javascript
// Updates happen automatically
// When new version is released on GitHub:
// 1. App checks for updates on startup
// 2. Downloads update in background
// 3. Notifies user
// 4. User clicks "Restart and Update"
```

### **Mobile:**
```
✅ Google Play: Updates automatically
✅ App Store: Updates automatically
✅ Direct APK: Manual update (or implement custom updater)
```

---

## 📊 BUILD SIZES

### **Desktop Apps:**
```
Windows (.exe):      ~150MB (installer), ~200MB (installed)
macOS (.dmg):        ~150MB
Linux (.AppImage):   ~180MB
```

### **Mobile Apps:**
```
Android (.apk):      ~50-100MB
Android (.aab):      ~40-80MB (compressed)
iOS (.ipa):          ~60-120MB
```

### **Why so large?**
- Includes entire Chromium browser (Electron)
- Includes Node.js runtime
- Includes app assets (images, fonts, etc.)
- Includes native modules

**Note:** Mobile apps are smaller because they use native WebView instead of Chromium.

---

## ⚡ OPTIMIZATION TIPS

### **Reduce Build Size:**
```bash
# Enable compression
"asar": true

# Exclude dev dependencies
"files": ["out/**/*"],

# Minimize code
npm run build -- --minify

# Compress images
npm install imagemin-cli
imagemin public/images/* --out-dir=public/images
```

### **Faster Builds:**
```bash
# Build for single platform
npm run build:win  # Only Windows

# Skip code signing in dev
export CSC_IDENTITY_AUTO_DISCOVERY=false

# Use build cache
electron-builder --cache
```

---

## 🐛 TROUBLESHOOTING

### **"Code signing certificate not found"**
- Windows: Install .pfx certificate
- macOS: Install from Keychain Access
- Or disable: `CSC_IDENTITY_AUTO_DISCOVERY=false`

### **"Build failed: ENOSPC"**
- Increase Node.js memory:
```bash
export NODE_OPTIONS=--max-old-space-size=4096
```

### **"Android build failed: SDK not found"**
- Set ANDROID_HOME environment variable
- Install Android SDK via Android Studio

### **"iOS build failed: No provisioning profile"**
- Open Xcode
- Go to Preferences → Accounts
- Download provisioning profiles

---

## ✅ FINAL CHECKLIST

Before releasing builds:

- [ ] Version number updated in package.json
- [ ] CHANGELOG.md updated
- [ ] All tests passing
- [ ] Security audit passed (npm audit)
- [ ] Icons in all required sizes
- [ ] Code signing certificates installed
- [ ] Build tested on clean machine
- [ ] Auto-update tested
- [ ] Installer tested (if applicable)
- [ ] Uninstaller tested (if applicable)
- [ ] App Store listings ready
- [ ] Privacy policy updated
- [ ] Terms of service updated

---

**STATUS:** ✅ BUILD INSTRUCTIONS COMPLETE  
**Platforms:** Windows, macOS, Linux, Android, iOS  
**Distribution:** App Stores + Direct Download  
**Auto-Updates:** Configured  

**Ready to build and ship! 🚀📦**
