import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../services/api';

export default function CoursesScreen({ navigation }: any) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await api.lms.getCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Load courses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCourse = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetail', { course: item })}
    >
      <Text style={styles.courseTitle}>{item.title}</Text>
      <Text style={styles.courseDescription}>{item.description}</Text>
      <View style={styles.courseFooter}>
        <Text style={styles.courseLevel}>{item.level}</Text>
        <Text style={styles.courseEnrolled}>{item.enrolled} students</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Courses</Text>
      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadCourses}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', padding: 16, backgroundColor: '#fff' },
  list: { padding: 16 },
  courseCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  courseTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  courseDescription: { fontSize: 14, color: '#666', marginTop: 8 },
  courseFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  courseLevel: { fontSize: 12, color: '#3B4F6F', fontWeight: '600' },
  courseEnrolled: { fontSize: 12, color: '#999' }
});
