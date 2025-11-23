'use client';

import React, { useState } from 'react';
import { GlassCard } from './components/GlassCard';
import { PremiumButton } from './components/PremiumButton';
import { ChatWidget } from './components/ChatWidget';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const handleSendMessage = async (message: string) => {
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: "I can help you with that assignment! Let's break it down step by step.",
        sender: 'ai',
        timestamp: new Date(),
        aiMember: 'Elara',
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const courses = [
    {
      id: 1,
      title: 'Advanced Mathematics',
      grade: '92%',
      nextAssignment: 'Calculus Quiz',
      dueDate: 'Tomorrow',
      color: 'from-blue-500 to-cyan-500',
      icon: '📐'
    },
    {
      id: 2,
      title: 'Computer Science 101',
      grade: '98%',
      nextAssignment: 'Python Project',
      dueDate: 'In 2 days',
      color: 'from-purple-500 to-pink-500',
      icon: '💻'
    },
    {
      id: 3,
      title: 'Business Ethics',
      grade: '88%',
      nextAssignment: 'Case Study',
      dueDate: 'Next Week',
      color: 'from-emerald-500 to-teal-500',
      icon: '⚖️'
    }
  ];

  const assignments = [
    { id: 1, title: 'Calculus Quiz', course: 'Math', due: 'Tomorrow', status: 'Pending' },
    { id: 2, title: 'Python Project', course: 'CS 101', due: 'In 2 days', status: 'In Progress' },
    { id: 3, title: 'History Essay', course: 'History', due: 'Completed', status: 'Done' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] text-white pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#1e1b4b]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-bold">Student Portal</span>
            </div>
            <div className="flex gap-4">
              <PremiumButton variant="ghost" size="sm">Dashboard</PremiumButton>
              <PremiumButton variant="ghost" size="sm">Grades</PremiumButton>
              <PremiumButton variant="ghost" size="sm">Schedule</PremiumButton>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                👤
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">
            Hello, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Alex</span>
          </h1>
          <p className="text-blue-200">You have 2 assignments due this week.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard className="p-6">
                <div className="text-sm text-blue-200 mb-1">GPA</div>
                <div className="text-3xl font-bold text-white">3.8</div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-blue-200 mb-1">Credits</div>
                <div className="text-3xl font-bold text-white">24</div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-blue-200 mb-1">Attendance</div>
                <div className="text-3xl font-bold text-white">95%</div>
              </GlassCard>
            </div>

            {/* Current Courses */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Current Courses</h2>
              <div className="grid gap-4">
                {courses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard className="p-6 flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl`}>
                          {course.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-purple-300 transition-colors">{course.title}</h3>
                          <p className="text-sm text-blue-200">Next: {course.nextAssignment}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{course.grade}</div>
                        <div className="text-xs text-blue-200">Current Grade</div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Assignments */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold mb-4">Upcoming Due Dates</h3>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <div className="font-semibold">{assignment.title}</div>
                      <div className="text-xs text-blue-200">{assignment.course}</div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${assignment.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-200' :
                        assignment.status === 'In Progress' ? 'bg-blue-500/20 text-blue-200' :
                          'bg-green-500/20 text-green-200'
                      }`}>
                      {assignment.due}
                    </div>
                  </div>
                ))}
              </div>
              <PremiumButton variant="outline" size="sm" className="w-full mt-4">
                View All Assignments
              </PremiumButton>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <PremiumButton variant="secondary" className="w-full justify-start">
                  📅 View Calendar
                </PremiumButton>
                <PremiumButton variant="secondary" className="w-full justify-start">
                  📝 Request Transcript
                </PremiumButton>
                <PremiumButton variant="secondary" className="w-full justify-start">
                  💳 Pay Tuition
                </PremiumButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <ChatWidget
        onSendMessage={handleSendMessage}
        messages={chatMessages}
        aiMember="Elara"
      />
    </main>
  );
}
