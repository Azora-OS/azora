"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/button"
import { ServiceLogo } from "@/components/service-logo"
import { ElaraAvatar } from "@/components/elara-avatar"
import { BookOpen, Award, Users, TrendingUp } from "lucide-react"

const courses = [
  { title: 'AI Fundamentals', progress: 75, students: '12K', rating: 4.9, level: 'Beginner' },
  { title: 'Blockchain Development', progress: 45, students: '8K', rating: 4.8, level: 'Advanced' },
  { title: 'Data Science', progress: 60, students: '15K', rating: 4.9, level: 'Intermediate' },
]

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <ServiceLogo service="sapiens" size={40} />
              <span className="text-xl font-bold text-white">Azora Learn</span>
            </div>
            <Button variant="sapiens" size="sm">Browse Courses</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            Learn. <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Earn.</span> Grow.
          </h1>
          <p className="text-2xl text-slate-300 mb-8">Ubuntu Education for Everyone</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Courses', value: '500+', icon: BookOpen },
            { label: 'Students', value: '50K+', icon: Users },
            { label: 'Certificates', value: '25K+', icon: Award },
            { label: 'Success Rate', value: '94%', icon: TrendingUp },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6 text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-teal-400" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {courses.map((course) => (
              <Card key={course.title} className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{course.title}</CardTitle>
                      <CardDescription>{course.students} students • {course.rating}★ • {course.level}</CardDescription>
                    </div>
                    <span className="text-teal-400 font-semibold">{course.progress}%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <Button variant="sapiens" className="w-full">Continue Learning</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-teal-900/20 to-emerald-900/20 border-teal-500/30">
              <CardContent className="p-6 text-center">
                <ElaraAvatar variant="core" size={100} showName mood="helpful" className="mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">Your AI Tutor</h3>
                <p className="text-sm text-slate-300 mb-4">Personalized learning guidance</p>
                <Button variant="sapiens" size="sm" className="w-full">Chat with Elara</Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Daily Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Study Time</span>
                    <span className="text-white">3/5 hours</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 w-3/5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
