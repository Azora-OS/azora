"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AzoraLogo } from "@/components/azora-logo"
import { Users, Clock, Star, Award } from "lucide-react"

const courses = [
  { id: 1, title: "Constitutional AI Fundamentals", instructor: "Dr. Elara", students: 12500, rating: 4.9, duration: "8 weeks", azr: 500, image: "🎓" },
  { id: 2, title: "Ubuntu Philosophy & Practice", instructor: "Prof. Sankofa", students: 8900, rating: 4.8, duration: "6 weeks", azr: 400, image: "🌍" },
  { id: 3, title: "Blockchain & Sovereignty", instructor: "Dr. Nakamoto", students: 15200, rating: 4.9, duration: "10 weeks", azr: 750, image: "⛓️" },
  { id: 4, title: "African Innovation & Tech", instructor: "Prof. Mandela", students: 6700, rating: 4.7, duration: "5 weeks", azr: 350, image: "🚀" },
  { id: 5, title: "Proof-of-Knowledge Mining", instructor: "Dr. Satoshi", students: 9800, rating: 4.8, duration: "7 weeks", azr: 600, image: "⛏️" },
  { id: 6, title: "Elara AI Development", instructor: "Dr. Turing", students: 11200, rating: 4.9, duration: "12 weeks", azr: 900, image: "🤖" },
]

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <AzoraLogo size={32} showText />
            <Button variant="azora" size="sm">Enroll Now</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Discover <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">World-Class</span> Courses
          </h1>
          <p className="text-xl text-slate-400">Learn, earn AZR, and build your future with Ubuntu</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all group">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-6xl">{course.image}</div>
                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-white font-semibold">{course.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-white group-hover:text-teal-400 transition-colors">{course.title}</CardTitle>
                <CardDescription>by {course.instructor}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-teal-400" />
                    <span className="text-teal-400 font-semibold">{course.azr} AZR</span>
                  </div>
                </div>

                <Button variant="emerald" className="w-full">Enroll Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
