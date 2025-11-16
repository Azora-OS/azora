import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { OfflineSyncService } from '../services/offlineSync';
import { useOfflineSync } from '../hooks/useOfflineSync';

export default function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);
  const { pendingCount } = useOfflineSync();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const [enrolledData, availableData] = await Promise.all([
        api.get('/courses/enrolled'),
        api.get('/courses/available')
      ]);
      setCourses(enrolledData.data || []);
      setAvailableCourses(availableData.data || []);
    } catch (error) {
      console.error('Failed to load courses', error);
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    setLoading(true);
    try {
      await api.post(`/courses/${courseId}/enroll`, {});
      Alert.alert('Success', 'Enrolled in course successfully');
      await loadCourses();
      setShowAvailable(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to enroll in course');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLessonOffline = async (courseId: string, lessonId: string) => {
    try {
      await OfflineSyncService.queueOperation(
        'POST',
        `/courses/${courseId}/lessons/${lessonId}/complete`,
        { completedAt: new Date().toISOString() }
      );
      Alert.alert('Success', 'Lesson marked as complete (will sync when online)');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark lesson as complete');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const renderCourseCard = ({ item }: any) => (
    <TouchableOpacity style={styles.courseCard}>
      <Text style={styles.courseTitle}>{item.title}</Text>
      <Text style={styles.courseDescription}>{item.description}</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
      </View>
      <Text style={styles.courseProgress}>Progress: {item.progress}%</Text>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => handleCompleteLessonOffline(item.id, 'current')}
      >
        <Text style={styles.actionButtonText}>Continue Learning</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAvailableCourseCard = ({ item }: any) => (
    <TouchableOpacity style={styles.availableCourseCard}>
      <Text style={styles.courseTitle}>{item.title}</Text>
      <Text style={styles.courseDescription}>{item.description}</Text>
      <Text style={styles.courseInstructor}>Instructor: {item.instructor}</Text>
      <TouchableOpacity 
        style={[styles.enrollButton, loading && styles.buttonDisabled]}
        onPress={() => handleEnrollCourse(item.id)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.enrollButtonText}>Enroll Now</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {pendingCount > 0 && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncBannerText}>⏳ {pendingCount} pending sync</Text>
        </View>
      )}
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, !showAvailable && styles.tabActive]}
          onPress={() => setShowAvailable(false)}
        >
          <Text style={[styles.tabText, !showAvailable && styles.tabTextActive]}>My Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, showAvailable && styles.tabActive]}
          onPress={() => setShowAvailable(true)}
        >
          <Text style={[styles.tabText, showAvailable && styles.tabTextActive]}>Browse</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={showAvailable ? availableCourses : courses}
        keyExtractor={(item: any) => item.id}
        renderItem={showAvailable ? renderAvailableCourseCard : renderCourseCard}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {showAvailable ? 'No courses available' : 'No enrolled courses yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  syncBanner: { backgroundColor: '#FCD34D', padding: 12, alignItems: 'center' },
  syncBannerText: { fontSize: 14, fontWeight: '600', color: '#333' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#3B82F6' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  tabTextActive: { color: '#3B82F6' },
  courseCard: { backgroundColor: '#fff', padding: 16, margin: 12, borderRadius: 12 },
  availableCourseCard: { backgroundColor: '#fff', padding: 16, margin: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  courseTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  courseDescription: { fontSize: 14, color: '#666', marginBottom: 8 },
  courseInstructor: { fontSize: 12, color: '#999', marginBottom: 12 },
  progressContainer: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 4 },
  courseProgress: { fontSize: 12, color: '#666', marginBottom: 12 },
  actionButton: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  enrollButton: { backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center' },
  enrollButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#999' },
});
