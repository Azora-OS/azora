import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        { label: 'Profile Information', icon: '👤', onPress: () => {} },
        { label: 'Security Settings', icon: '🔒', onPress: () => {} },
        { label: 'Billing & Subscription', icon: '💳', onPress: () => {} }
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          label: 'Push Notifications', 
          icon: '🔔', 
          toggle: true, 
          value: notifications, 
          onToggle: setNotifications 
        },
        { 
          label: 'Analytics Tracking', 
          icon: '📊', 
          toggle: true, 
          value: analytics, 
          onToggle: setAnalytics 
        },
        { 
          label: 'Auto Backup', 
          icon: '☁️', 
          toggle: true, 
          value: autoBackup, 
          onToggle: setAutoBackup 
        }
      ]
    },
    {
      title: 'Organization',
      items: [
        { label: 'Team Management', icon: '👥', onPress: () => {} },
        { label: 'Usage Analytics', icon: '📈', onPress: () => {} },
        { label: 'API Keys', icon: '🔑', onPress: () => {} }
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', icon: '❓', onPress: () => {} },
        { label: 'Contact Support', icon: '💬', onPress: () => {} },
        { label: 'System Status', icon: '🟢', onPress: () => {} }
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Enterprise Configuration</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Enterprise User'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <Text style={styles.profileRole}>{user?.role || 'Administrator'}</Text>
        </View>
      </View>

      {settingSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={styles.settingItem}
              onPress={item.onPress}
              disabled={item.toggle}
            >
              <View style={styles.settingItemLeft}>
                <Text style={styles.settingIcon}>{item.icon}</Text>
                <Text style={styles.settingLabel}>{item.label}</Text>
              </View>
              {item.toggle ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#e1e5e9', true: '#3B4F6F' }}
                  thumbColor={item.value ? '#fff' : '#f4f3f4'}
                />
              ) : (
                <Text style={styles.settingArrow}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Azora Enterprise v1.0.0</Text>
        <Text style={styles.footerSubtext}>Ubuntu Business Platform</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#3B4F6F' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', opacity: 0.8, marginTop: 4 },
  profileCard: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#3B4F6F', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  profileAvatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  profileEmail: { fontSize: 14, color: '#666', marginBottom: 2 },
  profileRole: { fontSize: 12, color: '#3B4F6F', fontWeight: '600', textTransform: 'uppercase' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 16, marginBottom: 8 },
  settingItem: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 1, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { fontSize: 20, marginRight: 12, width: 24, textAlign: 'center' },
  settingLabel: { fontSize: 16, color: '#333', flex: 1 },
  settingArrow: { fontSize: 20, color: '#999' },
  logoutButton: { backgroundColor: '#F44336', marginHorizontal: 16, padding: 16, borderRadius: 8, alignItems: 'center' },
  logoutButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  footer: { alignItems: 'center', padding: 20 },
  footerText: { fontSize: 14, color: '#666', fontWeight: '500' },
  footerSubtext: { fontSize: 12, color: '#999', marginTop: 4 }
});