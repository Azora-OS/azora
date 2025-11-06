"use client"

import { motion } from "framer-motion"
import { BookOpen, Trophy, Users, TrendingUp, Clock, Star, Award, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ServiceHeader } from "@/components/branding/ServiceHeader"
import Image from "next/image"
import Link from "next/link"

export default function AcademyDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950 dark:via-violet-950 dark:to-indigo-950">
      <ServiceHeader servicePath="synapse/academy-ui" />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative h-32 w-96">
              <Image
                src="/branding/services/azora-education-logo.svg"
                alt="Azora Academy"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Azora Academy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Knowledge grows like the mighty Baobab
          </p>
        </motion.div>

        <AcademyContent />
      </div>
    </div>
  );
}

function AcademyContent() {
  const stats = [
    {
      title: "Courses Enrolled",
      value: "8",
      change: "+2 this month",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "AZR Earned",
      value: "1,250",
      change: "+180 this week",
      icon: Trophy,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Study Streak",
      value: "12 days",
      change: "Personal best!",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Community Rank",
      value: "#247",
      change: "Top 10% globally",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ]

  const currentCourses = [
    {
      title: "African AI Fundamentals",
      progress: 75,
      nextLesson: "Neural Networks in African Context",
      timeLeft: "2h 30m",
      instructor: "Dr. Nomsa Mthembu"
    },
    {
      title: "Blockchain for African Markets",
      progress: 45,
      nextLesson: "DeFi in Emerging Markets",
      timeLeft: "1h 15m",
      instructor: "Kofi Asante"
    },
    {
      title: "Cloud Architecture Excellence",
      progress: 90,
      nextLesson: "Final Assessment",
      timeLeft: "45m",
      instructor: "Sarah Johnson"
    }
  ]

  const achievements = [
    { name: "First Steps", description: "Completed your first course", icon: "🎓", unlocked: true },
    { name: "Knowledge Seeker", description: "Earned 500 AZR tokens", icon: "💎", unlocked: true },
    { name: "Community Builder", description: "Helped 10 fellow students", icon: "🤝", unlocked: true },
    { name: "African AI Pioneer", description: "Specialized in African AI", icon: "🇿🇦", unlocked: false }
  ]

  return (
    <div className="space-y-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg"
          >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Sizwe! 👋</h1>
              <p className="text-purple-100 mb-4">
                Continue your journey in African intelligence and blockchain education
              </p>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                Level 3 Student • 1,250 AZR Earned
              </Badge>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <Award className="w-10 h-10" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} dark:bg-opacity-20 rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Current Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Current Courses</span>
              </CardTitle>
              <CardDescription>
                Continue learning and earning AZR tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentCourses.map((course, i) => (
                <div key={i} className="border border-border rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{course.title}</h3>
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                      {course.progress}% Complete
                    </Badge>
                  </div>
                  <Progress value={course.progress} className="mb-3 h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Next: {course.nextLesson}</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.timeLeft} left</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">by {course.instructor}</span>
                    <Link href={`/courses/${course.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                        Continue Learning
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements & Community */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Achievements</span>
                </CardTitle>
                <CardDescription>
                  Your learning milestones and accomplishments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        achievement.unlocked
                          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50'
                          : 'border-border bg-muted/50 opacity-60'
                      }`}
                    >
                      <div className="text-2xl mb-2">{achievement.icon}</div>
                      <h4 className="font-medium text-sm mb-1 text-foreground">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && (
                        <Badge className="mt-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Community Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Community Activity</span>
                </CardTitle>
                <CardDescription>
                  Recent discussions and collaborations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Amara Okafor</span> shared insights on AI in African agriculture
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Kofi Asante</span> earned the "Blockchain Expert" badge
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      New course: "AI Ethics in African Context" now available
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
    </div>
  )
}
