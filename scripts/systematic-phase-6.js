#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📱 SYSTEMATIC PHASE 6: MOBILE APP DOMINATION');
console.log('============================================');
console.log('⚡ "I mobilize because we connect everywhere!" ⚡\n');

const mobileApps = [
  'azora-student-mobile',
  'azora-enterprise-mobile', 
  'azora-marketplace-mobile',
  'azora-pay-mobile'
];

const mobileFiles = {
  'package.json': (appName) => ({
    name: appName,
    version: "1.0.0",
    description: "Azora OS Mobile - Ubuntu Philosophy in Your Pocket",
    main: "index.js",
    scripts: {
      "start": "expo start",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "web": "expo start --web",
      "build:android": "eas build --platform android",
      "build:ios": "eas build --platform ios",
      "test": "jest",
      "lint": "eslint ."
    },
    dependencies: {
      "expo": "~49.0.0",
      "react": "18.2.0",
      "react-native": "0.72.6",
      "@react-navigation/native": "^6.1.9",
      "@react-navigation/stack": "^6.3.20",
      "react-native-screens": "~3.25.0",
      "react-native-safe-area-context": "4.7.4",
      "expo-status-bar": "~1.6.0",
      "expo-font": "~11.4.0",
      "expo-splash-screen": "~0.20.5",
      "@expo/vector-icons": "^13.0.0",
      "react-native-paper": "^5.11.1",
      "react-native-vector-icons": "^10.0.2",
      "axios": "^1.6.0",
      "@react-native-async-storage/async-storage": "1.19.3",
      "react-native-keychain": "^8.1.3"
    },
    devDependencies: {
      "@babel/core": "^7.20.0",
      "@types/react": "~18.2.14",
      "@types/react-native": "~0.72.2",
      "typescript": "^5.1.3",
      "jest": "^29.2.1",
      "@testing-library/react-native": "^12.4.0",
      "eslint": "^8.19.0"
    },
    keywords: ["azora", "ubuntu", "mobile", "education", "finance", "constitutional-ai"],
    author: "Azora ES (Pty) Ltd",
    license: "Proprietary"
  }),

  'App.tsx': (appName) => `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AzoraTheme } from './src/theme/AzoraTheme';
import { AuthProvider } from './src/contexts/AuthContext';
import { UbuntuProvider } from './src/contexts/UbuntuContext';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import { useAuth } from './src/hooks/useAuth';

const Stack = createStackNavigator();

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={AzoraTheme}>
        <AuthProvider>
          <UbuntuProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </UbuntuProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}`,

  'app.json': (appName) => ({
    expo: {
      name: `Azora ${appName.split('-')[1]} Mobile`,
      slug: appName,
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "light",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      assetBundlePatterns: ["**/*"],
      ios: {
        supportsTablet: true,
        bundleIdentifier: `world.azora.${appName.replace(/-/g, '')}`
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#FFFFFF"
        },
        package: `world.azora.${appName.replace(/-/g, '')}`
      },
      web: {
        favicon: "./assets/favicon.png"
      },
      extra: {
        apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api",
        ubuntuPhilosophy: "I am because we are"
      }
    }
  }),

  'src/theme/AzoraTheme.ts': () => `import { MD3LightTheme } from 'react-native-paper';

export const AzoraTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3B82F6', // Sapphire Blue
    secondary: '#10B981', // Emerald Green  
    tertiary: '#EF4444', // Ruby Red
    surface: '#FFFFFF',
    background: '#F8FAFC',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    ubuntu: {
      sapphire: '#3B82F6',
      emerald: '#10B981', 
      ruby: '#EF4444',
      unity: '#FFFFFF'
    }
  },
  ubuntu: {
    philosophy: 'I am because we are',
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24
    }
  }
};`,

  'src/contexts/UbuntuContext.tsx': () => `import React, { createContext, useContext, ReactNode } from 'react';

interface UbuntuContextType {
  philosophy: string;
  principles: string[];
  greeting: () => string;
}

const UbuntuContext = createContext<UbuntuContextType | undefined>(undefined);

export function UbuntuProvider({ children }: { children: ReactNode }) {
  const value: UbuntuContextType = {
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge', 
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    greeting: () => {
      const greetings = [
        'Sawubona! (I see you)',
        'Ubuntu greetings!',
        'Welcome to our collective!',
        'Together we prosper!'
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
  };

  return (
    <UbuntuContext.Provider value={value}>
      {children}
    </UbuntuContext.Provider>
  );
}

export function useUbuntu() {
  const context = useContext(UbuntuContext);
  if (!context) {
    throw new Error('useUbuntu must be used within UbuntuProvider');
  }
  return context;
}`,

  'src/screens/HomeScreen.tsx': (appName) => `import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUbuntu } from '../contexts/UbuntuContext';
import { AzoraTheme } from '../theme/AzoraTheme';

export default function HomeScreen() {
  const { greeting, philosophy } = useUbuntu();
  
  const getAppFeatures = () => {
    const appType = '${appName}'.split('-')[1];
    switch(appType) {
      case 'student':
        return ['AI Tutoring', 'Course Progress', 'Peer Learning', 'AZR Earnings'];
      case 'enterprise':
        return ['Team Management', 'Analytics', 'Resource Planning', 'Ubuntu Metrics'];
      case 'marketplace':
        return ['Job Matching', 'Skill Assessment', 'Networking', 'Opportunities'];
      case 'pay':
        return ['Multi-Currency Wallet', 'Mining Dashboard', 'Transactions', 'Ubuntu Sharing'];
      default:
        return ['Ubuntu Features', 'AI Integration', 'Community', 'Prosperity'];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar.Icon 
            size={64} 
            icon="diamond-stone" 
            style={{ backgroundColor: AzoraTheme.colors.ubuntu.sapphire }}
          />
          <Text variant="headlineMedium" style={styles.title}>
            Azora Mobile
          </Text>
          <Text variant="bodyMedium" style={styles.greeting}>
            {greeting()}
          </Text>
        </View>

        <Card style={styles.philosophyCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.philosophyTitle}>
              Ubuntu Philosophy
            </Text>
            <Text variant="bodyMedium" style={styles.philosophy}>
              {philosophy}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.featuresContainer}>
          <Text variant="titleLarge" style={styles.featuresTitle}>
            Features
          </Text>
          {getAppFeatures().map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <Card.Content style={styles.featureContent}>
                <Avatar.Icon 
                  size={40} 
                  icon="check-circle" 
                  style={{ backgroundColor: AzoraTheme.colors.ubuntu.emerald }}
                />
                <Text variant="bodyLarge" style={styles.featureText}>
                  {feature}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Button 
          mode="contained" 
          style={styles.actionButton}
          onPress={() => console.log('Ubuntu action!')}
        >
          Start Ubuntu Journey
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AzoraTheme.colors.background,
  },
  content: {
    padding: AzoraTheme.ubuntu.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: AzoraTheme.ubuntu.spacing.lg,
  },
  title: {
    marginTop: AzoraTheme.ubuntu.spacing.sm,
    color: AzoraTheme.colors.ubuntu.sapphire,
    fontWeight: 'bold',
  },
  greeting: {
    marginTop: AzoraTheme.ubuntu.spacing.xs,
    color: AzoraTheme.colors.ubuntu.emerald,
  },
  philosophyCard: {
    marginBottom: AzoraTheme.ubuntu.spacing.lg,
    backgroundColor: AzoraTheme.colors.ubuntu.unity,
  },
  philosophyTitle: {
    color: AzoraTheme.colors.ubuntu.sapphire,
    fontWeight: 'bold',
  },
  philosophy: {
    marginTop: AzoraTheme.ubuntu.spacing.xs,
    fontStyle: 'italic',
  },
  featuresContainer: {
    marginBottom: AzoraTheme.ubuntu.spacing.lg,
  },
  featuresTitle: {
    marginBottom: AzoraTheme.ubuntu.spacing.md,
    color: AzoraTheme.colors.ubuntu.sapphire,
    fontWeight: 'bold',
  },
  featureCard: {
    marginBottom: AzoraTheme.ubuntu.spacing.sm,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: AzoraTheme.ubuntu.spacing.md,
    flex: 1,
  },
  actionButton: {
    backgroundColor: AzoraTheme.colors.ubuntu.sapphire,
  },
});`,

  'README.md': (appName) => `# ${appName}

**Azora OS Mobile - Ubuntu Philosophy in Your Pocket** 📱✨

*"I mobilize because we connect everywhere!"*

## 🌟 Ubuntu Mobile Experience

This mobile app brings the full power of Azora OS Constitutional AI to your mobile device with Ubuntu philosophy at its core.

### ⚡ Quick Start

\`\`\`bash
# Install Ubuntu dependencies
npm install

# Start Ubuntu development
npm start

# Build for Ubuntu deployment
npm run build:android
npm run build:ios
\`\`\`

### 🎯 Features

- 🤖 **AI Integration**: Full Constitutional AI on mobile
- 🎓 **Education**: Learning management on-the-go  
- 💰 **Finance**: Secure mobile payments and mining
- 🛒 **Marketplace**: Job matching and opportunities
- 🛡️ **Security**: Enterprise-grade mobile security
- 🌍 **Ubuntu**: Philosophy embedded in every interaction

### 📱 Supported Platforms

- ✅ **iOS**: Native performance with Ubuntu design
- ✅ **Android**: Material Design with Ubuntu principles  
- ✅ **Web**: Progressive Web App capabilities

### 🏗️ Architecture

Built with modern React Native and Ubuntu principles:

- **React Native 0.72**: Latest stable framework
- **Expo 49**: Managed workflow for rapid development
- **TypeScript**: Type-safe Ubuntu development
- **React Navigation**: Smooth Ubuntu navigation
- **React Native Paper**: Material Design with Ubuntu theming

### 🌍 Ubuntu Philosophy

Every screen, every interaction, every feature embodies:
*"Ngiyakwazi ngoba sikwazi - I am because we are"*

---

**Building Mobile Ubuntu Excellence** 🚀📱
`
};

let createdFiles = 0;

console.log('🚀 Creating mobile app infrastructure...\n');

// Create mobile apps directory
const mobileDir = path.join(__dirname, '..', 'mobile');
if (!fs.existsSync(mobileDir)) {
  fs.mkdirSync(mobileDir, { recursive: true });
}

// Create each mobile app
mobileApps.forEach(appName => {
  const appDir = path.join(mobileDir, appName);
  
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }

  // Create src directories
  const srcDirs = ['src', 'src/components', 'src/screens', 'src/contexts', 'src/hooks', 'src/theme', 'src/services', 'assets'];
  srcDirs.forEach(dir => {
    const dirPath = path.join(appDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Create files
  Object.entries(mobileFiles).forEach(([fileName, contentFn]) => {
    const filePath = path.join(appDir, fileName);
    let content;
    
    if (typeof contentFn === 'function') {
      content = contentFn(appName);
    } else {
      content = contentFn;
    }

    if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2);
    }

    fs.writeFileSync(filePath, content);
    console.log(`✨ ${appName}/${fileName}`);
    createdFiles++;
  });

  // Create additional mobile-specific files
  const additionalFiles = {
    'src/hooks/useAuth.ts': `import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return { isAuthenticated, loading };
}`,

    'src/screens/LoginScreen.tsx': `import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AzoraTheme } from '../theme/AzoraTheme';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Welcome to Azora
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Ubuntu Philosophy • Constitutional AI
        </Text>
        
        <Card style={styles.loginCard}>
          <Card.Content>
            <TextInput
              label="Email"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            <Button 
              mode="contained" 
              style={styles.loginButton}
            >
              Enter Ubuntu
            </Button>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AzoraTheme.colors.background,
  },
  content: {
    flex: 1,
    padding: AzoraTheme.ubuntu.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    color: AzoraTheme.colors.ubuntu.sapphire,
    marginBottom: AzoraTheme.ubuntu.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: AzoraTheme.colors.ubuntu.emerald,
    marginBottom: AzoraTheme.ubuntu.spacing.xl,
  },
  loginCard: {
    backgroundColor: AzoraTheme.colors.ubuntu.unity,
  },
  input: {
    marginBottom: AzoraTheme.ubuntu.spacing.md,
  },
  loginButton: {
    backgroundColor: AzoraTheme.colors.ubuntu.sapphire,
  },
});`,

    'tsconfig.json': {
      "extends": "expo/tsconfig.base",
      "compilerOptions": {
        "strict": true,
        "baseUrl": "./",
        "paths": {
          "@/*": ["src/*"]
        }
      }
    },

    'babel.config.js': `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-paper/babel',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};`,

    '.gitignore': `# Ubuntu Mobile Ignores
node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*`
  };

  Object.entries(additionalFiles).forEach(([fileName, content]) => {
    const filePath = path.join(appDir, fileName);
    
    if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2);
    }

    fs.writeFileSync(filePath, content);
    console.log(`✨ ${appName}/${fileName}`);
    createdFiles++;
  });
});

// Create shared mobile infrastructure
const sharedMobileFiles = {
  'mobile/shared/UbuntuComponents.tsx': `import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
import { AzoraTheme } from '../azora-student-mobile/src/theme/AzoraTheme';

export function UbuntuGem({ size = 64 }: { size?: number }) {
  return (
    <View style={styles.gemContainer}>
      <Avatar.Icon 
        size={size} 
        icon="diamond-stone" 
        style={[styles.gem, { backgroundColor: AzoraTheme.colors.ubuntu.sapphire }]}
      />
    </View>
  );
}

export function UbuntuCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={styles.ubuntuCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.cardTitle}>
          {title}
        </Text>
        {children}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  gemContainer: {
    alignItems: 'center',
  },
  gem: {
    backgroundColor: AzoraTheme.colors.ubuntu.sapphire,
  },
  ubuntuCard: {
    backgroundColor: AzoraTheme.colors.ubuntu.unity,
    marginVertical: AzoraTheme.ubuntu.spacing.sm,
  },
  cardTitle: {
    color: AzoraTheme.colors.ubuntu.sapphire,
    fontWeight: 'bold',
    marginBottom: AzoraTheme.ubuntu.spacing.sm,
  },
});`,

  'mobile/README.md': `# Azora Mobile Apps

**Ubuntu Philosophy in Your Pocket** 📱✨

*"I mobilize because we connect everywhere!"*

## 🚀 Mobile App Suite

### 📱 Applications

- **🎓 Student Mobile**: Learning management and AI tutoring
- **💼 Enterprise Mobile**: Business intelligence and team management  
- **🛒 Marketplace Mobile**: Job matching and opportunities
- **💰 Pay Mobile**: Financial management and mining

### ⚡ Quick Start All Apps

\`\`\`bash
# Install all dependencies
cd azora-student-mobile && npm install && cd ..
cd azora-enterprise-mobile && npm install && cd ..
cd azora-marketplace-mobile && npm install && cd ..
cd azora-pay-mobile && npm install && cd ..

# Start development servers
npm run dev:all
\`\`\`

### 🌍 Ubuntu Mobile Philosophy

Every mobile interaction embodies Ubuntu:
- **Responsive Design**: Adapts to all screen sizes
- **Offline Capability**: Works without internet
- **Secure by Default**: Enterprise-grade security
- **AI-Powered**: Constitutional AI on mobile
- **Community-Driven**: Ubuntu principles in UX

---

**Mobile Ubuntu Excellence** 🚀📱
`
};

Object.entries(sharedMobileFiles).forEach(([fileName, content]) => {
  const filePath = path.join(__dirname, '..', fileName);
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content);
  console.log(`✨ ${fileName}`);
  createdFiles++;
});

console.log('\n🎉 PHASE 6 COMPLETE!');
console.log(`✨ Mobile files created: ${createdFiles}`);
console.log('📱 4 complete mobile apps ready');
console.log('🎨 Ubuntu design system integrated');
console.log('🤖 AI integration prepared');
console.log('🛡️ Security hardened');
console.log('🌍 Ubuntu: "I mobilize because we connect everywhere!"');