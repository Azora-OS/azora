import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { login, verifyMFA } from '../redux/slices/authSlice';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading, error, mfaRequired } = useAppSelector(state => state.auth);

  const handleLogin = () => {
    dispatch(login({ email, password }));
  };

  const handleMFAVerify = () => {
    dispatch(verifyMFA({ challengeId: '', code: mfaCode }));
  };

  if (mfaRequired) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enter MFA Code</Text>
        <TextInput
          style={styles.input}
          placeholder="MFA Code"
          value={mfaCode}
          onChangeText={setMfaCode}
          editable={!isLoading}
        />
        <TouchableOpacity style={styles.button} onPress={handleMFAVerify} disabled={isLoading}>
          {isLoading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Verify</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Azora OS</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: 'red', marginBottom: 10 }
});
