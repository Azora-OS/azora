import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import api from '../services/api';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const { scheduleAZRReward } = useNotifications();
  const [stats, setStats] = useState({ courses: 0, balance: 0, progress: 0, streak: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/activity')
      ]);
      setStats(statsData.data);
      setRecentActivity(activityData.data || []);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'continue_learning':
        navigation.navigate('Courses');
        break;
      case 'view_wallet':
        navigation.navigate('Wallet');
        break;
      case 'take_assessment':
        scheduleAZRReward(5);
        break;
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
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'Student'}! 👋</Text>
        <Text style={styles.subtitle}>Ready to learn with Ubuntu?</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.courses}</Text>
          <Text style={styles.statLabel}>Active Courses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.balance}</Text>
          <Text style={styles.statLabel}>AZR Earned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleQuickAction('continue_learning')}>
          <Text style={styles.actionButtonText}>📚 Continue Learning</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleQuickAction('view_wallet')}>
          <Text style={styles.actionButtonText}>💰 View Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleQuickAction('take_assessment')}>
          <Text style={styles.actionButtonText}>🎯 Take Assessment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivity.slice(0, 5).map((activity: any, index) => (
          <View key={index} style={styles.activityItem}>
            <Text style={styles.activityText}>{activity.description || 'Learning activity'}</Text>
            <Text style={styles.activityTime}>{new Date().toLocaleDateString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#3B4F6F' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', opacity: 0.8, marginTop: 4 },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#3B4F6F' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
  quickActions: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  actionButton: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8 },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#3B4F6F' },
  recentActivity: { padding: 16 },
  activityItem: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityText: { fontSize: 14, color: '#333', flex: 1 },
  activityTime: { fontSize: 12, color: '#999' }
});
