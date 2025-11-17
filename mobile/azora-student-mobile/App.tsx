import React from 'react';
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
}