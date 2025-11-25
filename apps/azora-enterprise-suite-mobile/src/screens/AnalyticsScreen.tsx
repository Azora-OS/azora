import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { PieChart, ProgressChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const chartConfig = {
    backgroundColor: '#3B4F6F',
    backgroundGradientFrom: '#3B4F6F',
    backgroundGradientTo: '#5A6B8C',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  const courseCompletionData = [
    { name: 'Completed', population: 68, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'In Progress', population: 25, color: '#FF9800', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Not Started', population: 7, color: '#F44336', legendFontColor: '#333', legendFontSize: 12 }
  ];

  const performanceData = {
    labels: ['Engagement', 'Completion', 'Satisfaction', 'Retention'],
    data: [0.85, 0.68, 0.92, 0.76]
  };

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'year', label: 'Year' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Performance Insights</Text>
      </View>

      <View style={styles.periodSelector}>
        {periods.map(period => (
          <TouchableOpacity
            key={period.key}
            style={[styles.periodButton, selectedPeriod === period.key && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === period.key && styles.periodButtonTextActive]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Course Completion Status</Text>
        <PieChart
          data={courseCompletionData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 50]}
          absolute
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Performance Metrics</Text>
        <ProgressChart
          data={performanceData}
          width={screenWidth - 32}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={chartConfig}
          hideLegend={false}
        />
      </View>

      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Key Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>🎯 High Engagement</Text>
          <Text style={styles.insightText}>85% user engagement rate - 12% above industry average</Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>📈 Growing Completion</Text>
          <Text style={styles.insightText}>Course completion up 15% this month</Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>⭐ Excellent Satisfaction</Text>
          <Text style={styles.insightText}>92% user satisfaction score</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#3B4F6F' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', opacity: 0.8, marginTop: 4 },
  periodSelector: { flexDirection: 'row', padding: 16, gap: 8 },
  periodButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center' },
  periodButtonActive: { backgroundColor: '#3B4F6F' },
  periodButtonText: { fontSize: 14, fontWeight: '600', color: '#3B4F6F' },
  periodButtonTextActive: { color: '#fff' },
  chartContainer: { padding: 16 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  insightsContainer: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  insightCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8 },
  insightTitle: { fontSize: 16, fontWeight: 'bold', color: '#3B4F6F', marginBottom: 4 },
  insightText: { fontSize: 14, color: '#666' }
});