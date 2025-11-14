import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ courses: 0, balance: 0, progress: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const { data } = await api.get('/student/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.welcome}>Welcome, {user?.name || 'Student'}!</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.courses}</Text>
          <Text style={styles.statLabel}>Active Courses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.balance} AZR</Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.progress}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  welcome: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#3B82F6' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
});
