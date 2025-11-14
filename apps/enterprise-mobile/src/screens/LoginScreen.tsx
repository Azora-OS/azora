import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🏢</Text>
        <Text style={styles.title}>Azora Enterprise</Text>
        <Text style={styles.subtitle}>Ubuntu Business Platform</Text>
      </View>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enterprise Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Secure Enterprise Access</Text>
        <Text style={styles.footerSubtext}>Constitutional AI • Ubuntu Philosophy</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    padding: 20 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  logo: { 
    fontSize: 64, 
    marginBottom: 16 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#3B4F6F',
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666',
    textAlign: 'center' 
  },
  formContainer: { 
    marginBottom: 40 
  },
  input: { 
    backgroundColor: '#fff',
    borderWidth: 1, 
    borderColor: '#e1e5e9', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    fontSize: 16,
    color: '#333'
  },
  button: { 
    backgroundColor: '#3B4F6F', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: { 
    opacity: 0.6 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16
  },
  forgotPasswordText: {
    color: '#3B4F6F',
    fontSize: 14,
    fontWeight: '500'
  },
  footer: {
    alignItems: 'center'
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  }
});