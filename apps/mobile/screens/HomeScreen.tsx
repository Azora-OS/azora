import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ courses: 0, balance: 0, progress: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [wallet, enrollments] = await Promise.all([
        api.mint.getWallet(user.id),
        api.lms.getEnrollments(user.id)
      ]);
      setStats({
        courses: enrollments.data?.length || 0,
        balance: wallet.data?.balances?.AZR || 0,
        progress: 75
      });
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName || 'Student'}!</Text>
        <Text style={styles.subtitle}>Ready to learn today?</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.courses}</Text>
          <Text style={styles.statLabel}>Active Courses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.balance}</Text>
          <Text style={styles.statLabel}>AZR Balance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.progress}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Courses')}
      >
        <Text style={styles.actionButtonText}>Browse Courses</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#3B4F6F' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', marginTop: 4 },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#3B4F6F' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  actionButton: { margin: 16, backgroundColor: '#3B4F6F', padding: 16, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
