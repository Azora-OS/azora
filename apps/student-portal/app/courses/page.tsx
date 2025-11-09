'use client';
import { useEffect, useState } from 'react';
import { lmsApi } from '../../../packages/lib/api-client';

const DEMO_COURSES = [
  { id: '1', title: 'Introduction to Programming', instructor: 'Dr. Smith', duration: '8 weeks', price: 'Free', image: '🖥️' },
  { id: '2', title: 'Web Development Bootcamp', instructor: 'Prof. Johnson', duration: '12 weeks', price: 'Free', image: '🌐' },
  { id: '3', title: 'Data Science Fundamentals', instructor: 'Dr. Lee', duration: '10 weeks', price: 'Free', image: '📊' },
  { id: '4', title: 'Digital Marketing', instructor: 'Ms. Brown', duration: '6 weeks', price: 'Free', image: '📱' },
  { id: '5', title: 'Financial Literacy', instructor: 'Mr. Davis', duration: '4 weeks', price: 'Free', image: '💵' },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState(DEMO_COURSES);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Browse Courses</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              <div className="text-6xl text-center py-8 bg-gradient-to-br from-blue-50 to-purple-50">
                {course.image}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-2">By {course.instructor}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ {course.duration}</span>
                  <span className="font-bold text-green-600">{course.price}</span>
                </div>
                <a href={`/courses/${course.id}`} className="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700">
                  Enroll Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
