/**
 * Azora OS Education Service Examples
 * Ubuntu Principle: "My knowledge becomes our knowledge"
 */

import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

// ============================================
// 1. LIST COURSES
// ============================================

async function listCourses(filters?: {
  category?: string;
  level?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axios.get(`${API_BASE}/courses`, {
      params: filters
    });

    console.log(`✅ Found ${response.data.total} courses`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to list courses:', error.response?.data);
    throw error;
  }
}

// ============================================
// 2. CREATE COURSE
// ============================================

async function createCourse(courseData: {
  title: string;
  description: string;
  price?: number;
  duration: number;
  level: string;
  category: string;
}) {
  try {
    const response = await axios.post(`${API_BASE}/courses`, courseData);

    console.log('✅ Course created:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create course:', error.response?.data);
    throw error;
  }
}

// ============================================
// 3. ENROLL IN COURSE
// ============================================

async function enrollInCourse(courseId: string) {
  try {
    const response = await axios.post(
      `${API_BASE}/courses/${courseId}/enroll`
    );

    console.log('✅ Enrolled successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Enrollment failed:', error.response?.data);
    throw error;
  }
}

// ============================================
// 4. GET STUDENT PROGRESS
// ============================================

async function getProgress(studentId: string) {
  try {
    const response = await axios.get(
      `${API_BASE}/progress/${studentId}`
    );

    console.log('✅ Progress retrieved');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get progress:', error.response?.data);
    throw error;
  }
}

// ============================================
// COMPLETE EDUCATION FLOW
// ============================================

async function completeEducationFlow() {
  // List courses
  const { courses } = await listCourses({
    category: 'Programming',
    level: 'beginner'
  });

  // Create a course
  const newCourse = await createCourse({
    title: 'Introduction to Python',
    description: 'Learn Python from scratch',
    price: 100,
    duration: 40,
    level: 'beginner',
    category: 'Programming'
  });

  // Enroll in course
  await enrollInCourse(newCourse.id);

  // Check progress
  const progress = await getProgress('student-123');

  return { courses, newCourse, progress };
}

export {
  listCourses,
  createCourse,
  enrollInCourse,
  getProgress
};
