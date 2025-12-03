import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [metrics, setMetrics] = useState({
    totalUsers: 1250,
    activeUsers: 890,
    revenue: 125000,
    growth: 15.3
  });
  const [refreshing, setRefreshing] = useState(false);

  const chartConfig = {
    backgroundColor: '#3B4F6F',
    backgroundGradientFrom: '#3B4F6F',
    backgroundGradientTo: '#5A6B8C',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' }
  };

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [200, 450, 680, 890, 1100, 1250],
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      strokeWidth: 2
    }]
  };

  const revenueData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      data: [25000, 45000, 75000, 125000]
    }]
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Enterprise Dashboard</Text>
        <Text style={styles.subtitle}>Ubuntu Business Intelligence</Text>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.totalUsers.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Total Users</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.activeUsers.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Active Users</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>${(metrics.revenue / 1000).toFixed(0)}K</Text>
          <Text style={styles.metricLabel}>Revenue</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>+{metrics.growth}%</Text>
          <Text style={styles.metricLabel}>Growth</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>User Growth</Text>
        <LineChart
          data={userGrowthData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Revenue by Quarter</Text>
        <BarChart
          data={revenueData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📊 View Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>👥 Manage Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>💰 Financial Overview</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#3B4F6F' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', opacity: 0.8, marginTop: 4 },
  metricsContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  metricCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  metricValue: { fontSize: 24, fontWeight: 'bold', color: '#3B4F6F' },
  metricLabel: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
  chartContainer: { padding: 16 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  chart: { marginVertical: 8, borderRadius: 16 },
  quickActions: { padding: 16 },
  actionButton: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8 },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#3B4F6F', textAlign: 'center' }
});