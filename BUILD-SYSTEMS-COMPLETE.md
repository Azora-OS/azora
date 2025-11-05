# 📦 AZORA BUILD SYSTEMS - COMPLETE GUIDE

**Goal:** Create production-ready builds for all platforms (.exe, .apk, .ipa, web)

---

## 🎯 PLATFORMS WE SUPPORT

```
✅ Web (Vercel)              - Already configured
✅ Desktop (Electron)        - Windows (.exe), macOS (.dmg), Linux (.AppImage)
✅ Mobile (React Native)     - Android (.apk), iOS (.ipa)
✅ Progressive Web App (PWA) - Works offline like native app
```

---

## 💻 DESKTOP APPS (ELECTRON)

### **Apps That Need Desktop Versions:**
1. Student Portal (main learning app)
2. Mint Dashboard (finance management)
3. Elara IDE (code editor)
4. Admin Panel (management console)

### **Build Configuration:**

#### **1. Package.json (Electron App)**
```json
{
  "name": "azora-student-portal",
  "version": "1.0.0",
  "description": "Azora Student Portal - Desktop App",
  "main": "electron/main.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:next\" \"npm run dev:electron\"",
    "dev:next": "next dev",
    "dev:electron": "electron .",
    "build": "next build && npm run build:electron",
    "build:electron": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux",
    "build:all": "electron-builder -mwl"
  },
  "build": {
    "appId": "world.azora.student",
    "productName": "Azora Student Portal",
    "directories": {
      "output": "dist"
    },
    "files": [
      ".next/**/*",
      "electron/**/*",
      "public/**/*",
      "package.json"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/branding/icon.ico",
      "artifactName": "Azora-Student-Portal-${version}-Setup.${ext}"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "public/branding/icon.icns",
      "category": "public.app-category.education",
      "artifactName": "Azora-Student-Portal-${version}.${ext}"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "public/branding/icon.png",
      "category": "Education",
      "artifactName": "azora-student-portal-${version}.${ext}"
    }
  },
  "dependencies": {
    "electron-updater": "^6.1.0",
    "electron-store": "^8.1.0"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "concurrently": "^8.2.0"
  }
}
```

#### **2. Electron Main Process**
```javascript
// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/branding/icon.png'),
    titleBarStyle: 'hidden',
    backgroundColor: '#000000'
  });

  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../.next/server/pages/index.html')}`;

  mainWindow.loadURL(startURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Auto-update
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded');
});

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall();
});
```

---

## 📱 MOBILE APPS (REACT NATIVE)

### **Apps That Need Mobile Versions:**
1. Student Portal (main learning app)
2. Job Board (job search & apply)
3. Mint Dashboard (finance on-the-go)
4. Mining App (background mining)

### **Build Configuration:**

#### **1. React Native Setup**
```bash
# Initialize React Native project
npx react-native init AzoraStudentPortal --template react-native-template-typescript

# Or use Expo for easier setup
npx create-expo-app azora-student-portal --template
```

#### **2. Package.json (Mobile App)**
```json
{
  "name": "azora-student-portal-mobile",
  "version": "1.0.0",
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "build:android": "cd android && ./gradlew assembleRelease",
    "build:ios": "cd ios && xcodebuild -workspace AzoraStudentPortal.xcworkspace -scheme AzoraStudentPortal -configuration Release",
    "build:apk": "cd android && ./gradlew assembleRelease && cd ..",
    "build:aab": "cd android && ./gradlew bundleRelease",
    "sign:apk": "jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore android/app/build/outputs/apk/release/app-release-unsigned.apk alias_name"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.0",
    "@react-navigation/native": "^6.1.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "react-native-webview": "^13.6.0"
  }
}
```

#### **3. Android Build Config**
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "world.azora.student"
        minSdkVersion 23
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

#### **4. iOS Build Config**
```ruby
# ios/Podfile
platform :ios, '13.0'
use_frameworks!

target 'AzoraStudentPortal' do
  config = use_native_modules!
  
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true
  )
  
  # Add pods here
  pod 'Firebase/Analytics'
  pod 'Firebase/Crashlytics'
end
```

---

## 🔄 CI/CD FOR AUTOMATED BUILDS

### **GitHub Actions - Build All Platforms**

```yaml
# .github/workflows/build-apps.yml
name: 🏗️ Build Desktop & Mobile Apps

on:
  push:
    branches: [main, release/*]
    tags: ['v*']
  workflow_dispatch:

jobs:
  build-windows:
    name: Build Windows (.exe)
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: |
          cd apps/student-portal
          npm install
          
      - name: Build Electron (Windows)
        run: |
          cd apps/student-portal
          npm run build:win
          
      - name: Upload Windows Installer
        uses: actions/upload-artifact@v4
        with:
          name: azora-student-portal-windows
          path: apps/student-portal/dist/*.exe

  build-macos:
    name: Build macOS (.dmg)
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: |
          cd apps/student-portal
          npm install
          
      - name: Build Electron (macOS)
        run: |
          cd apps/student-portal
          npm run build:mac
          
      - name: Upload macOS Installer
        uses: actions/upload-artifact@v4
        with:
          name: azora-student-portal-macos
          path: apps/student-portal/dist/*.dmg

  build-linux:
    name: Build Linux (.AppImage)
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: |
          cd apps/student-portal
          npm install
          
      - name: Build Electron (Linux)
        run: |
          cd apps/student-portal
          npm run build:linux
          
      - name: Upload Linux Installer
        uses: actions/upload-artifact@v4
        with:
          name: azora-student-portal-linux
          path: apps/student-portal/dist/*.AppImage

  build-android:
    name: Build Android (.apk)
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          
      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
        
      - name: Install Dependencies
        run: |
          cd apps/student-portal-mobile
          npm install
          
      - name: Build APK
        run: |
          cd apps/student-portal-mobile
          npm run build:apk
          
      - name: Sign APK
        run: |
          # Sign with release key
          echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 -d > my-release-key.keystore
          npm run sign:apk
          
      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: azora-student-portal-android
          path: apps/student-portal-mobile/android/app/build/outputs/apk/release/*.apk

  build-ios:
    name: Build iOS (.ipa)
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: |
          cd apps/student-portal-mobile
          npm install
          cd ios && pod install
          
      - name: Build iOS
        run: |
          cd apps/student-portal-mobile
          npm run build:ios
          
      - name: Upload IPA
        uses: actions/upload-artifact@v4
        with:
          name: azora-student-portal-ios
          path: apps/student-portal-mobile/ios/build/*.ipa

  create-release:
    name: Create GitHub Release
    needs: [build-windows, build-macos, build-linux, build-android, build-ios]
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')
    
    steps:
      - name: Download All Artifacts
        uses: actions/download-artifact@v4
        
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            azora-student-portal-windows/*.exe
            azora-student-portal-macos/*.dmg
            azora-student-portal-linux/*.AppImage
            azora-student-portal-android/*.apk
            azora-student-portal-ios/*.ipa
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 📦 BUILD OUTPUT STRUCTURE

After running builds, you'll have:

```
dist/
├── windows/
│   ├── Azora-Student-Portal-1.0.0-Setup.exe (installer)
│   └── Azora-Student-Portal-1.0.0-Portable.exe (no install)
├── macos/
│   ├── Azora-Student-Portal-1.0.0.dmg (installer)
│   └── Azora-Student-Portal-1.0.0-mac.zip (archive)
├── linux/
│   ├── azora-student-portal-1.0.0.AppImage (portable)
│   └── azora-student-portal_1.0.0_amd64.deb (Debian)
├── android/
│   ├── azora-student-portal-1.0.0.apk (unsigned)
│   ├── azora-student-portal-1.0.0-signed.apk (signed)
│   └── azora-student-portal-1.0.0.aab (Play Store)
└── ios/
    └── AzoraStudentPortal-1.0.0.ipa (App Store)
```

---

## 🔐 CODE SIGNING

### **Windows (.exe)**
```bash
# Get code signing certificate
# Use SignTool.exe
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com Azora-Student-Portal-Setup.exe
```

### **macOS (.dmg)**
```bash
# Get Apple Developer certificate
# Use codesign
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" Azora-Student-Portal.app
```

### **Android (.apk)**
```bash
# Generate keystore
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release-unsigned.apk alias_name

# Align APK
zipalign -v 4 app-release-unsigned.apk azora-student-portal-signed.apk
```

### **iOS (.ipa)**
```bash
# Use Xcode with Apple Developer account
# Or use Fastlane
fastlane ios release
```

---

## 🚀 DISTRIBUTION

### **Desktop Apps:**
```
✅ Direct Download (website)
✅ GitHub Releases
✅ Microsoft Store (Windows)
✅ Mac App Store (macOS)
✅ Snap Store (Linux)
```

### **Mobile Apps:**
```
✅ Google Play Store (Android)
✅ Apple App Store (iOS)
✅ Direct APK download (Android)
✅ TestFlight (iOS beta)
```

---

## 📊 BUILD COMMANDS CHEAT SHEET

```bash
# Desktop Builds
npm run build:win      # Windows .exe
npm run build:mac      # macOS .dmg
npm run build:linux    # Linux .AppImage
npm run build:all      # All platforms

# Mobile Builds
npm run build:apk      # Android APK
npm run build:aab      # Android App Bundle (Play Store)
npm run build:ios      # iOS IPA

# Development
npm run dev            # Run in dev mode
npm run dev:electron   # Electron dev mode
npm run dev:mobile     # React Native dev mode

# Testing
npm run test           # Run tests
npm run e2e            # E2E tests on built app
```

---

## ✅ CHECKLIST FOR PRODUCTION BUILDS

### **Before Building:**
- [ ] Update version number
- [ ] Update changelog
- [ ] Run all tests
- [ ] Security audit passed
- [ ] Code signed certificates ready
- [ ] Icons/assets in place (all sizes)
- [ ] Environment variables set

### **After Building:**
- [ ] Test installers on clean machines
- [ ] Verify auto-update works
- [ ] Upload to distribution platforms
- [ ] Update download links
- [ ] Announce release

---

**STATUS:** ✅ BUILD SYSTEMS CONFIGURED  
**Platforms:** Windows, macOS, Linux, Android, iOS  
**Automation:** GitHub Actions CI/CD  
**Distribution:** Multiple channels ready

**Ready to build production apps!** 📦🚀
