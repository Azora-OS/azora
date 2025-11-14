import React, { useState } from 'react';
import { useCoursesAdmin, useCreateCourse } from '../hooks/use-courses-admin';

const Courses: React.FC = () => {
  const { data: courses, isLoading } = useCoursesAdmin();
  const createCourse = useCreateCourse();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Course Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Create and manage educational content</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
        >
          + Create Course
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 animate-pulse">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))
        ) : courses?.length > 0 ? (
          courses.map((course: any) => (
            <div
              key={course.id}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">🎓</div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.published
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                }`}>
                  {course.published ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {course.description || 'No description'}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="text-slate-600 dark:text-slate-400">
                  👥 {course.enrollmentCount || 0} enrolled
                </div>
                <div className="text-teal-600 dark:text-teal-400 font-semibold">
                  {course.azrReward || 0} AZR
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium">
                  Edit
                </button>
                <button className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium">
                  Stats
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
            No courses found. Create your first course!
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
