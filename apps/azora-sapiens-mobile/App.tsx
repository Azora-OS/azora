import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/contexts/AuthContext';
import { useNotifications } from './src/hooks/useNotifications';
import { setupNetworkListener } from './src/services/offlineSync';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import WalletScreen from './src/screens/WalletScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  useNotifications(); // Initialize notifications
  
  useEffect(() => {
    // Set up network listener for offline sync
    const unsubscribe = setupNetworkListener();
    return () => {
      unsubscribe?.();
    };
  }, []);
  
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: '#3B4F6F',
      tabBarInactiveTintColor: '#999',
      headerShown: false
    }}>
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ tabBarIcon: () => '🏠' }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesScreen} 
        options={{ tabBarIcon: () => '📚' }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen} 
        options={{ tabBarIcon: () => '💰' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarIcon: () => '👤' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
