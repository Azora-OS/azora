import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';

export default function CoursesScreen() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data } = await api.get('/courses/enrolled');
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.courseCard}>
            <Text style={styles.courseTitle}>{item.title}</Text>
            <Text style={styles.courseProgress}>Progress: {item.progress}%</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  courseCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 15 },
  courseTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  courseProgress: { fontSize: 14, color: '#666' },
});
