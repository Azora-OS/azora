import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CourseDetailScreen({ route, navigation }: any) {
  const { course } = route.params;
  const { user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.lms.enroll(course.id, user.id);
      Alert.alert('Success', 'Enrolled successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.instructor}>by {course.instructor || 'Elara AI'}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Level:</Text>
          <Text style={styles.infoValue}>{course.level}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Duration:</Text>
          <Text style={styles.infoValue}>{course.duration || '8 weeks'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Students:</Text>
          <Text style={styles.infoValue}>{course.enrolled}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{course.description}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.enrollButton, enrolling && styles.enrollButtonDisabled]}
        onPress={handleEnroll}
        disabled={enrolling}
      >
        <Text style={styles.enrollButtonText}>
          {enrolling ? 'Enrolling...' : 'Enroll Now'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#3B4F6F', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  instructor: { fontSize: 14, color: '#fff', opacity: 0.8, marginTop: 8 },
  infoCard: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  section: { backgroundColor: '#fff', margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  description: { fontSize: 14, color: '#666', lineHeight: 20 },
  enrollButton: { margin: 16, backgroundColor: '#3B4F6F', padding: 16, borderRadius: 8, alignItems: 'center' },
  enrollButtonDisabled: { opacity: 0.6 },
  enrollButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
