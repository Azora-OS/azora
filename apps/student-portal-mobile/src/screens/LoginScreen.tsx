import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { BiometricAuthService } from '../services/biometricAuth';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await BiometricAuthService.isBiometricAvailable();
    setBiometricAvailable(available);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      
      // Enable biometric if user checked "Remember me"
      if (rememberMe && biometricAvailable) {
        await BiometricAuthService.enableBiometric(email, password);
      }
      
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const credentials = await BiometricAuthService.authenticateWithBiometric();
      if (credentials) {
        await login(credentials.email, credentials.password);
        navigation.replace('Main');
      } else {
        Alert.alert('Biometric Authentication Failed', 'Please try again or use password login');
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Azora Student Portal</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity 
        style={styles.rememberContainer}
        onPress={() => setRememberMe(!rememberMe)}
      >
        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
        <Text style={styles.rememberText}>Remember me</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      {biometricAvailable && (
        <TouchableOpacity 
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
          disabled={loading}
        >
          <Text style={styles.biometricButtonText}>🔐 Biometric Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, marginBottom: 15, borderRadius: 8 },
  rememberContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#3B82F6', borderRadius: 4, marginRight: 10 },
  checkboxChecked: { backgroundColor: '#3B82F6' },
  rememberText: { fontSize: 14, color: '#333' },
  button: { backgroundColor: '#3B82F6', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  biometricButton: { backgroundColor: '#10B981', padding: 15, borderRadius: 8, alignItems: 'center' },
  biometricButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
