"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AzoraLogo } from "@/components/azora-logo"
import { BookOpen, TrendingUp, Award, Zap, Users, Target } from "lucide-react"

const stats = [
  { label: "Courses", value: "12", icon: BookOpen, color: "from-teal-500 to-emerald-500" },
  { label: "AZR Earned", value: "2,450", icon: Zap, color: "from-blue-500 via-purple-500 to-pink-500" },
  { label: "Certificates", value: "8", icon: Award, color: "from-cyan-500 to-blue-500" },
  { label: "Progress", value: "78%", icon: TrendingUp, color: "from-orange-500 to-red-500" },
]

const courses = [
  { title: "Constitutional AI Fundamentals", progress: 85, instructor: "Dr. Elara", color: "teal" },
  { title: "Ubuntu Philosophy & Practice", progress: 60, instructor: "Prof. Sankofa", color: "purple" },
  { title: "Blockchain & Sovereignty", progress: 45, instructor: "Dr. Nakamoto", color: "orange" },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <AzoraLogo size={32} showText />
            <div className="flex gap-3">
              <Button variant="ghost" size="sm">Profile</Button>
              <Button variant="azora" size="sm">Upgrade</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Student</span>
          </h1>
          <p className="text-slate-400">Continue your journey to sovereignty through Ubuntu learning</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <GlassCard key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active Courses */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Active Courses</h2>
                  <p className="text-sm text-slate-400">Your learning journey continues</p>
                </div>
                <Button variant="ubuntu" size="sm">View All</Button>
              </div>
              
              <div className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.title} className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">{course.title}</CardTitle>
                      <CardDescription>Instructor: {course.instructor}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white font-semibold">{course.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${
                              course.color === 'teal' ? 'from-teal-500 to-emerald-500' :
                              course.color === 'purple' ? 'from-blue-500 via-purple-500 to-pink-500' :
                              'from-orange-500 to-red-500'
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                      <Button variant="azora" size="sm" className="w-full mt-4">Continue Learning</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ubuntu Community */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Ubuntu Community</h3>
                  <p className="text-xs text-slate-400">I am because we are</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Connect with 50K+ learners worldwide sharing knowledge and prosperity
              </p>
              <Button variant="emerald" size="sm" className="w-full">Join Discussion</Button>
            </GlassCard>

            {/* Daily Goal */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Daily Goal</h3>
                  <p className="text-xs text-slate-400">Keep the momentum</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Today's Progress</span>
                  <span className="text-white font-semibold">3/5 hours</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-rose-500" style={{ width: '60%' }} />
                </div>
              </div>
            </GlassCard>

            {/* Elara AI Assistant */}
            <GlassCard className="p-6 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Elara AI</h3>
                  <p className="text-xs text-slate-400">Your learning companion</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4">
                "Great progress today! Ready to tackle Constitutional AI next?"
              </p>
              <Button variant="azora" size="sm" className="w-full">Chat with Elara</Button>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
