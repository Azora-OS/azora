import React from 'react';
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
});