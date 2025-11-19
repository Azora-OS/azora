import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export function HomeScreen() {
  const [dashboard, setDashboard] = useState({
    coursesEnrolled: 5,
    coursesCompleted: 2,
    walletBalance: 1250,
    recentActivity: [
      { id: '1', description: 'Completed Python Basics', timestamp: '2 hours ago' },
      { id: '2', description: 'Earned 50 AZR tokens', timestamp: '1 day ago' }
    ]
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Welcome to Azora!</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboard.coursesEnrolled}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboard.coursesCompleted}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>R{dashboard.walletBalance}</Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
      </View>

      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {dashboard.recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <Text>{activity.description}</Text>
            <Text style={styles.activityTime}>{activity.timestamp}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  welcome: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, alignItems: 'center', flex: 1, marginHorizontal: 4 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#2563eb' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  activityContainer: { backgroundColor: 'white', padding: 16, borderRadius: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  activityItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  activityTime: { fontSize: 12, color: '#666', marginTop: 2 }
});