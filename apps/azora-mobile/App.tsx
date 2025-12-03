import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import WalletScreen from './src/screens/WalletScreen';
import LearningScreen from './src/screens/LearningScreen';
import { Text, View } from 'react-native';

// Placeholder for other screens
function JobScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Jobspaces Coming Soon!</Text>
        </View>
    );
}

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#667eea',
                    tabBarInactiveTintColor: 'gray',
                }}
            >
                <Tab.Screen name="Wallet" component={WalletScreen} />
                <Tab.Screen name="Learning" component={LearningScreen} />
                <Tab.Screen name="Jobs" component={JobScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
