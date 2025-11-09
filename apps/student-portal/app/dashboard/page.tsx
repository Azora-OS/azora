import React, { useState, useEffect } from 'react';

export default function StudentDashboard() {
  const [student, setStudent] = useState({
    name: 'Alex Johnson',
    grade: 'Grade 10',
    avatar: '👨‍🎓',
    level: 'Advanced Learner'
  });

  const [stats, setStats] = useState({
    coursesCompleted: 0,
    totalEarnings: 0,
    studyHours: 0,
    certificates: 0,
    currentStreak: 0
  });

  const [courses, setCourses] = useState([]);
  const [aiTutor, setAiTutor] = useState({
    isActive: true,
    currentTopic: 'Quantum Physics',
    confidence: 94,
    nextSuggestion: 'Complete Chapter 5 exercises'
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        coursesCompleted: 12,
        totalEarnings: 847.50,
        studyHours: 156,
        certificates: 8,
        currentStreak: 15
      });

      setCourses([
        {
          id: 1,
          title: 'Advanced Mathematics',
          progress: 78,
          nextLesson: 'Calculus Integration',
          instructor: 'Dr. Sarah Chen',
          aiMatch: 96,
          earnings: 125.50
        },
        {
          id: 2,
          title: 'Quantum Physics',
          progress: 45,
          nextLesson: 'Wave-Particle Duality',
          instructor: 'Prof. Michael Torres',
          aiMatch: 89,
          earnings: 89.25
        },
        {
          id: 3,
          title: 'Constitutional AI Ethics',
          progress: 92,
          nextLesson: 'Final Assessment',
          instructor: 'Dr. Azora AI',
          aiMatch: 98,
          earnings: 200.00
        }
      ]);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{icon}</span>
          <div className="text-right">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-white/80 text-sm">{subtitle}</p>
          </div>
        </div>
        <p className="text-white/90 font-medium">{title}</p>
      </div>
    </div>
  );

  const CourseCard = ({ course }: any) => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {course.title}
            </h3>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
              🤖 {course.aiMatch}% Match
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">by {course.instructor}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Next: {course.nextLesson}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">+{course.earnings} AZR</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Earned</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Progress</span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">{course.progress}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-medium">
          📚 Continue Learning
        </button>
        <button className="px-4 py-2 bg-white/70 dark:bg-slate-700/70 backdrop-blur-xl border border-white/20 dark:border-slate-600/50 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-slate-900 dark:text-white">
          📊 View Details
        </button>
      </div>
    </div>
  );

  const AITutorCard = () => (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">🤖 AI Tutor Elara</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">Active</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Currently helping with:</p>
          <p className="font-semibold text-slate-900 dark:text-white">{aiTutor.currentTopic}</p>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">AI Confidence Level:</p>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${aiTutor.confidence}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{aiTutor.confidence}%</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">💡 Suggestion:</p>
          <p className="font-medium text-blue-900 dark:text-blue-200">{aiTutor.nextSuggestion}</p>
        </div>

        <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 font-medium">
          💬 Chat with Elara
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
              {student.avatar}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Welcome back, {student.name}! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-400">{student.grade} • {student.level}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-xl">
              <span className="text-lg">🔥</span>
              <span className="font-medium">{stats.currentStreak} day streak!</span>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-medium">
              🎯 Set Goals
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Courses Completed"
            value={stats.coursesCompleted}
            icon="🎓"
            color="from-blue-500 to-blue-600"
            subtitle="This semester"
          />
          <StatCard
            title="AZR Earned"
            value={`${stats.totalEarnings}`}
            icon="💰"
            color="from-green-500 to-emerald-600"
            subtitle="Total earnings"
          />
          <StatCard
            title="Study Hours"
            value={stats.studyHours}
            icon="⏰"
            color="from-purple-500 to-pink-600"
            subtitle="This month"
          />
          <StatCard
            title="Certificates"
            value={stats.certificates}
            icon="🏆"
            color="from-orange-500 to-red-600"
            subtitle="Blockchain verified"
          />
          <StatCard
            title="AI Efficiency"
            value="98.7%"
            icon="🤖"
            color="from-indigo-500 to-purple-600"
            subtitle="Learning rate"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">📚 Active Courses</h2>
              <button className="px-4 py-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-slate-900 dark:text-white">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AITutorCard />
            
            {/* Quick Actions */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">⚡ Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📖</span>
                    <span className="font-medium text-slate-900 dark:text-white">Browse Courses</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">💰</span>
                    <span className="font-medium text-slate-900 dark:text-white">View Wallet</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🏆</span>
                    <span className="font-medium text-slate-900 dark:text-white">Achievements</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📊</span>
                    <span className="font-medium text-slate-900 dark:text-white">Progress Report</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 dark:from-yellow-500/20 dark:to-orange-500/20 rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-700/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">🏅 Class Leaderboard</h3>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Sarah Chen', points: 2847, avatar: '👩‍🎓' },
                  { rank: 2, name: 'You', points: 2156, avatar: student.avatar },
                  { rank: 3, name: 'Mike Torres', points: 1923, avatar: '👨‍🎓' }
                ].map((student, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-xl ${
                    student.name === 'You' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-white/70 dark:bg-slate-700/70'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-slate-600 dark:text-slate-400">#{student.rank}</span>
                      <span className="text-lg">{student.avatar}</span>
                      <span className="font-medium text-slate-900 dark:text-white">{student.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{student.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}