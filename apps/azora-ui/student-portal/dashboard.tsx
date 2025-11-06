/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Student Portal Dashboard
 * Main dashboard for students - courses, grades, schedule, announcements
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Award, 
  TrendingUp, 
  Bell,
  Video,
  FileText,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// ===== INTERFACES =====

interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  schedule: string;
  progress: number;
  grade: number;
  nextClass?: Date;
  status: 'active' | 'completed' | 'upcoming';
}

interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  dueDate: Date;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  maxPoints: number;
}

interface Announcement {
  id: string;
  courseId?: string;
  courseName?: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  date: Date;
  read: boolean;
}

interface UpcomingClass {
  id: string;
  courseId: string;
  courseName: string;
  type: 'lecture' | 'lab' | 'tutorial';
  startTime: Date;
  endTime: Date;
  location: string;
  isVirtual: boolean;
  meetingUrl?: string;
}

interface StudentStats {
  gpa: number;
  creditsCompleted: number;
  creditsInProgress: number;
  coursesCompleted: number;
  coursesActive: number;
  attendanceRate: number;
}

// ===== COMPONENT =====

export default function StudentDashboard() {
  const [studentName, setStudentName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // In production, this would fetch from API
    setStudentName('Student Name');
    setStudentNumber('ST2024001');
    
    // Mock data
    setCourses([
      {
        id: '1',
        code: 'CS101',
        name: 'Introduction to Programming',
        instructor: 'Dr. Smith',
        schedule: 'Mon, Wed, Fri 10:00 AM',
        progress: 65,
        grade: 85,
        nextClass: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: '2',
        code: 'MATH201',
        name: 'Calculus II',
        instructor: 'Prof. Johnson',
        schedule: 'Tue, Thu 2:00 PM',
        progress: 72,
        grade: 78,
        nextClass: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: '3',
        code: 'ENG102',
        name: 'Academic Writing',
        instructor: 'Dr. Williams',
        schedule: 'Mon, Wed 3:00 PM',
        progress: 80,
        grade: 92,
        status: 'active',
      },
    ]);

    setAssignments([
      {
        id: '1',
        courseId: '1',
        courseName: 'CS101',
        title: 'Programming Assignment 3',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'pending',
        maxPoints: 100,
      },
      {
        id: '2',
        courseId: '2',
        courseName: 'MATH201',
        title: 'Problem Set 5',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'pending',
        maxPoints: 50,
      },
      {
        id: '3',
        courseId: '3',
        courseName: 'ENG102',
        title: 'Essay Draft',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'submitted',
        maxPoints: 100,
      },
    ]);

    setAnnouncements([
      {
        id: '1',
        courseId: '1',
        courseName: 'CS101',
        title: 'Midterm Exam Next Week',
        message: 'The midterm exam will be held next Wednesday. Please review chapters 1-5.',
        priority: 'high',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
      },
      {
        id: '2',
        title: 'Library Hours Extended',
        message: 'The library will now be open until 10 PM on weekdays.',
        priority: 'normal',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: false,
      },
    ]);

    setUpcomingClasses([
      {
        id: '1',
        courseId: '1',
        courseName: 'CS101',
        type: 'lecture',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        location: 'Room 301',
        isVirtual: false,
      },
      {
        id: '2',
        courseId: '2',
        courseName: 'MATH201',
        type: 'tutorial',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        location: 'Virtual',
        isVirtual: true,
        meetingUrl: 'https://meet.azora.world/math201',
      },
    ]);

    setStats({
      gpa: 3.65,
      creditsCompleted: 45,
      creditsInProgress: 15,
      coursesCompleted: 12,
      coursesActive: 3,
      attendanceRate: 94,
    });

    setLoading(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 0) return 'Overdue';
    if (hours < 1) return 'Due in less than 1 hour';
    if (hours < 24) return `Due in ${hours} hours`;
    if (days < 7) return `Due in ${days} days`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'submitted': return 'text-blue-600 bg-blue-50';
      case 'graded': return 'text-green-600 bg-green-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500 bg-red-50';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'normal': return 'border-l-4 border-blue-500 bg-blue-50';
      default: return 'border-l-4 border-gray-300 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {studentName}
              </h1>
              <p className="text-sm text-gray-500">Student ID: {studentNumber}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {announcements.filter(a => !a.read).length}
                </span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {studentName.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">GPA</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.gpa.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 0.15 from last semester</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Credits</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.creditsCompleted}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{stats?.creditsInProgress} in progress</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.coursesActive}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{stats?.coursesCompleted} completed</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Attendance</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.attendanceRate}%</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">Excellent attendance!</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Courses & Assignments */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Courses */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{course.code}</h3>
                        <p className="text-sm text-gray-600">{course.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">{course.grade}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {course.instructor}
                      </p>
                      <p className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {course.schedule}
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {course.nextClass && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">Next class in {Math.floor((course.nextClass.getTime() - Date.now()) / (1000 * 60 * 60))} hours</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming Assignments */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Assignments</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View All
                </button>
              </div>
              <div className="bg-white rounded-lg shadow">
                {assignments.map((assignment, index) => (
                  <div 
                    key={assignment.id}
                    className={`p-4 ${index !== assignments.length - 1 ? 'border-b' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-gray-500">{assignment.courseName}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(assignment.dueDate)} • {assignment.maxPoints} points
                        </p>
                      </div>
                      {assignment.status === 'pending' && (
                        <button className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                          Start
                        </button>
                      )}
                      {assignment.status === 'graded' && assignment.grade && (
                        <div className="ml-4 text-right">
                          <p className="text-2xl font-bold text-green-600">{assignment.grade}</p>
                          <p className="text-xs text-gray-500">/{assignment.maxPoints}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Quick Actions & Updates */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-center">
                  <Video className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Join Class</p>
                </button>
                <button className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-center">
                  <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Submit Work</p>
                </button>
                <button className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-center">
                  <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Library</p>
                </button>
                <button className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-center">
                  <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Pay Fees</p>
                </button>
                <button className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-center">
                  <MessageSquare className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Support</p>
                </button>
                <button className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-center">
                  <Calendar className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Schedule</p>
                </button>
              </div>
            </section>

            {/* Upcoming Classes */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Classes</h2>
              <div className="bg-white rounded-lg shadow divide-y">
                {upcomingClasses.map((cls) => (
                  <div key={cls.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{cls.courseName}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {cls.type.charAt(0).toUpperCase() + cls.type.slice(1)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {cls.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {cls.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cls.isVirtual ? '📹 Virtual' : `📍 ${cls.location}`}
                        </p>
                      </div>
                      {cls.isVirtual && (
                        <button className="ml-2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700">
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Announcements */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Announcements</h2>
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div 
                    key={announcement.id}
                    className={`bg-white rounded-lg shadow p-4 ${getPriorityColor(announcement.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {announcement.courseName && (
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            {announcement.courseName}
                          </p>
                        )}
                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {announcement.date.toLocaleDateString()}
                        </p>
                      </div>
                      {!announcement.read && (
                        <div className="ml-2">
                          <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
