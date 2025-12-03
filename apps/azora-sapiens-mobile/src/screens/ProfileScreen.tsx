import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { BiometricAuthService } from '../services/biometricAuth';
import { OfflineSyncService } from '../services/offlineSync';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    checkBiometricStatus();
    checkPendingSync();
  }, []);

  const checkBiometricStatus = async () => {
    const enabled = await BiometricAuthService.isBiometricEnabled();
    setBiometricEnabled(enabled);
  };

  const checkPendingSync = async () => {
    const count = await OfflineSyncService.getPendingCount();
    setPendingSync(count);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      Alert.prompt(
        'Enable Biometric Login',
        'Enter your password to enable biometric authentication',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async (password) => {
              if (password && user?.email) {
                const success = await BiometricAuthService.enableBiometric(user.email, password);
                if (success) {
                  setBiometricEnabled(true);
                  Alert.alert('Success', 'Biometric authentication enabled');
                } else {
                  Alert.alert('Error', 'Failed to enable biometric authentication');
                }
              }
            },
          },
        ],
        'secure-text'
      );
    } else {
      Alert.alert('Disable Biometric', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          onPress: async () => {
            await BiometricAuthService.disableBiometric();
            setBiometricEnabled(false);
            Alert.alert('Success', 'Biometric authentication disabled');
          },
        },
      ]);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will remove all cached data', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        onPress: async () => {
          await OfflineSyncService.clearQueue();
          setPendingSync(0);
          Alert.alert('Success', 'Cache cleared');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.name}>{user?.name || 'Student'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Biometric Login</Text>
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: '#ccc', true: '#81C784' }}
            thumbColor={biometricEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#ccc', true: '#81C784' }}
            thumbColor={notificationsEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <TouchableOpacity style={styles.storageItem}>
          <View>
            <Text style={styles.settingLabel}>Pending Sync</Text>
            <Text style={styles.settingDescription}>{pendingSync} operations pending</Text>
          </View>
          <Text style={styles.badge}>{pendingSync}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearCache}>
          <Text style={styles.dangerButtonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Azora Student Portal v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileCard: { backgroundColor: '#fff', padding: 30, margin: 20, borderRadius: 12, alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  email: { fontSize: 16, color: '#666' },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  settingItem: { backgroundColor: '#fff', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: 16, fontWeight: '500', color: '#333' },
  settingDescription: { fontSize: 12, color: '#999', marginTop: 4 },
  storageItem: { backgroundColor: '#fff', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { backgroundColor: '#3B82F6', color: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, fontSize: 12, fontWeight: '600' },
  dangerButton: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, alignItems: 'center' },
  dangerButtonText: { color: '#DC2626', fontSize: 14, fontWeight: '600' },
  logoutButton: { backgroundColor: '#EF4444', padding: 15, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center', paddingVertical: 30 },
  footerText: { fontSize: 12, color: '#999' },
});
