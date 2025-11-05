"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/ui/sidebar"
import { SystemPulse } from "@/components/ui/system-pulse"
import { ConstitutionalGovernor } from "@/components/ui/constitutional-governor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Crown,
  Shield,
  Coins,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Award,
  Target,
  Zap,
  Users,
  Calendar,
  Trophy,
  Activity,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react"

interface UserStats {
  totalCoursesEnrolled: number
  coursesCompleted: number
  totalKnowledgePoints: number
  ascensionLevel: number
  learningStreak: number
}

interface UserRewards {
  totalPoints: number
  currentMultiplier: number
  history: Array<{
    activity: string
    points: number
    date: string
    type: string
  }>
}

interface UserProgress {
  courses: Array<{
    id: string
    title: string
    progress: number
    assessments: number
    passed: number
  }>
}

interface UserEnrollment {
  courseId: string
  enrolledAt: string
  progress: number
  status: string
}

interface Course {
  id: string
  title: string
  description: string
  level: string
  duration: string
  enrolled: number
  rating: number
  instructor: string
  icon: any
  color?: string
  userEnrolled?: boolean
}

interface CoursesData {
  courses: Course[]
}

export default function AzoraSapiensPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Real-time data simulation
  const [systemHealth, setSystemHealth] = useState(96.4)
  const [activeLearners, setActiveLearners] = useState(2847)

  // Dynamic data from backend
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [userEnrollments, setUserEnrollments] = useState<UserEnrollment[]>([])
  const [coursesData, setCoursesData] = useState<CoursesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => Math.max(90, Math.min(100, prev + (Math.random() - 0.5) * 2)))
      setActiveLearners(prev => Math.max(2800, Math.min(3000, prev + Math.floor((Math.random() - 0.5) * 20))))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = 'demo-user'
        const [statsRes, rewardsRes, progressRes, enrollmentsRes, coursesRes] = await Promise.all([
          fetch(`/api/users/${userId}/stats`),
          fetch(`/api/users/${userId}/rewards`),
          fetch(`/api/users/${userId}/progress`),
          fetch(`/api/enrollments?userId=${userId}`),
          fetch('/api/courses')
        ])

        if (statsRes.ok) setUserStats(await statsRes.json())
        if (rewardsRes.ok) setUserRewards(await rewardsRes.json())
        if (progressRes.ok) setUserProgress(await progressRes.json())
        if (enrollmentsRes.ok) setUserEnrollments((await enrollmentsRes.json()).enrollments || [])
        if (coursesRes.ok) setCoursesData(await coursesRes.json())
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const learningStats = [
    {
      label: "Knowledge Points",
      value: loading ? "..." : (userStats?.totalKnowledgePoints || 0).toLocaleString() + " KP",
      change: "+12.5%",
      trend: "up",
      icon: Coins,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      label: "Courses Completed",
      value: loading ? "..." : (userStats?.coursesCompleted || 0).toString(),
      change: "+2",
      trend: "up",
      icon: BookOpen,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      label: "Current Level",
      value: loading ? "..." : `CKQ-${userStats?.ascensionLevel || 1}`,
      change: "68%",
      trend: "up",
      icon: Crown,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      label: "Learning Streak",
      value: loading ? "..." : `${userStats?.learningStreak || 0} days`,
      change: "+3",
      trend: "up",
      icon: Zap,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      gradient: "from-teal-500 to-cyan-500"
    },
  ]

  const currentCourses = [
    {
      id: 1,
      title: "Planetary Economic Intelligence",
      progress: 75,
      nextLesson: "Market Dynamics & Prediction",
      timeLeft: "2h 15m",
      level: "CKQ-3",
      instructor: "Dr. Azora Prime",
      icon: Brain,
      color: "text-purple-500"
    },
    {
      id: 2,
      title: "Aegis Integrity Systems",
      progress: 45,
      nextLesson: "Blockchain Security Fundamentals",
      timeLeft: "4h 30m",
      level: "CKQ-2",
      instructor: "Guardian Protocol",
      icon: Shield,
      color: "text-blue-500"
    },
    {
      id: 3,
      title: "Proof-of-Knowledge Mining",
      progress: 90,
      nextLesson: "Final Assessment",
      timeLeft: "1h 45m",
      level: "CKQ-4",
      instructor: "Oracle Network",
      icon: Target,
      color: "text-emerald-500"
    }
  ]

  const recentAchievements = [
    {
      id: 1,
      title: "Economic Theory Mastery",
      description: "Completed advanced economic modeling course",
      points: 500,
      date: "2 days ago",
      icon: Trophy,
      color: "text-yellow-500"
    },
    {
      id: 2,
      title: "Assessment Perfect Score",
      description: "100% on Blockchain Security assessment",
      points: 250,
      date: "1 week ago",
      icon: Target,
      color: "text-green-500"
    },
    {
      id: 3,
      title: "Weekly Streak",
      description: "7 consecutive days of learning",
      points: 100,
      date: "3 days ago",
      icon: Zap,
      color: "text-orange-500"
    }
  ]

  const rewardHistory = [
    { activity: "Completed 'Economic Theory' assessment", points: 150, date: "2 days ago", type: "assessment" },
    { activity: "7-day learning streak bonus", points: 100, date: "3 days ago", type: "streak" },
    { activity: "Enrolled in 'Blockchain Sovereignty'", points: 50, date: "5 days ago", type: "enrollment" },
    { activity: "Perfect score bonus", points: 250, date: "1 week ago", type: "bonus" },
    { activity: "Weekly progress milestone", points: 75, date: "1 week ago", type: "milestone" }
  ]

  const quickActions = [
    { label: "Continue Learning", icon: BookOpen, color: "from-blue-500 to-indigo-500", description: "Resume your current course" },
    { label: "Take Assessment", icon: Target, color: "from-emerald-500 to-teal-500", description: "Test your knowledge" },
    { label: "View Rewards", icon: Coins, color: "from-purple-500 to-pink-500", description: "Check your KP balance" },
    { label: "Join Community", icon: Users, color: "from-orange-500 to-red-500", description: "Connect with learners" },
  ]

  const ecosystemStats = [
    { label: "Active Learners", value: activeLearners.toLocaleString(), icon: Users, color: "text-blue-500" },
    { label: "System Integrity", value: `${systemHealth.toFixed(1)}%`, icon: Shield, color: "text-green-500" },
    { label: "Knowledge Generated", value: "1.2M KP", icon: Brain, color: "text-purple-500" },
    { label: "Courses Available", value: "47", icon: BookOpen, color: "text-teal-500" },
  ]

  const handleQuickAction = (action: string) => {
    setSelectedAction(action)
    // Implementation would go here
  }

  const handleEnrollCourse = async (courseId: string) => {
    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user', // In a real app, this would come from auth
          courseId: courseId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update UI to show enrolled status
        setCoursesData(prev => prev ? {
          ...prev,
          courses: prev.courses.map(course =>
            course.id === courseId
              ? { ...course, userEnrolled: true }
              : course
          )
        } : null);
        console.log('Enrolled successfully:', result);
      } else {
        console.error('Enrollment failed');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-60 relative">
        {/* System Pulse Header */}
        <div className="border-b border-border/50 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <SystemPulse />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center animate-pulse-glow">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                      Azora Sapiens University
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Planetary Economic Intelligence Platform • Living Constitutional AI
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-card/50 rounded-lg border border-border/50">
                  <div className={`w-2 h-2 rounded-full ${systemHealth > 95 ? 'bg-green-500' : systemHealth > 90 ? 'bg-yellow-500' : 'bg-red-500'} animate-living-pulse`} />
                  <span className="text-sm font-medium">Aegis: {systemHealth.toFixed(1)}%</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                  className="gap-2"
                >
                  {showStats ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {showStats ? 'Hide' : 'Show'} Stats
                </Button>
              </div>
            </div>

            {/* Aegis Mobile Sentry Status */}
            <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Aegis Mobile Sentry</CardTitle>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">98.7%</div>
                    <p className="text-sm text-muted-foreground">Integrity Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">24/7</div>
                    <p className="text-sm text-muted-foreground">Monitoring</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <p className="text-sm text-muted-foreground">Alerts Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ecosystem Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ecosystemStats.map((stat, index) => (
                <Card key={index} className="glass border-border/50 hover:bg-card/70 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                      <div className={`p-2 rounded-lg bg-card/50`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="courses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Courses
                </TabsTrigger>
                <TabsTrigger value="progress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Progress
                </TabsTrigger>
                <TabsTrigger value="rewards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Rewards
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Learning Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {learningStats.map((stat, index) => (
                    <Card key={index} className="glass border-border/50 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold mb-1">
                              {showStats ? stat.value : '••••••'}
                            </p>
                          </div>
                          <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-500">{stat.change}</span>
                          <span className="text-xs text-muted-foreground">vs last period</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Actions */}
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Fast access to learning activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-3 hover:bg-card/70 transition-all duration-300 group"
                          onClick={() => handleQuickAction(action.label)}
                        >
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{action.label}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Courses */}
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Current Courses
                    </CardTitle>
                    <CardDescription>
                      Your active learning journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentCourses.map((course) => (
                        <div key={course.id} className="flex items-center gap-4 p-4 rounded-lg bg-card/30 hover:bg-card/50 transition-all duration-300">
                          <div className={`p-2 rounded-lg flex-shrink-0 bg-purple-500/10`}>
                            <course.icon className={`w-5 h-5 ${course.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold truncate">{course.title}</p>
                              <div className="text-right flex-shrink-0">
                                <Badge variant="secondary">{course.level}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-muted-foreground">Next: {course.nextLesson}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {course.timeLeft}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex-1 mr-4">
                                <Progress value={course.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">{course.progress}% complete</p>
                              </div>
                              <Button size="sm">Continue</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Ascension Protocol Progress */}
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Ascension Protocol
                    </CardTitle>
                    <CardDescription>Your path to CKQ mastery</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current Level: {loading ? "..." : `CKQ-${userStats?.ascensionLevel || 1}`}</span>
                        <span className="text-sm text-muted-foreground">Next: CKQ-{(userStats?.ascensionLevel || 1) + 1}</span>
                      </div>
                      <Progress value={68} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground mb-4">
                        <span>{loading ? "..." : `${userStats?.totalKnowledgePoints || 0} / 4,200 KP required`}</span>
                        <span>1,353 KP to next level</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { level: "CKQ-1", status: (userStats?.ascensionLevel || 0) >= 1 ? "completed" : "upcoming", kp: "500" },
                          { level: "CKQ-2", status: (userStats?.ascensionLevel || 0) >= 2 ? "completed" : (userStats?.ascensionLevel || 0) === 1 ? "current" : "upcoming", kp: "1,200" },
                          { level: "CKQ-3", status: (userStats?.ascensionLevel || 0) >= 3 ? "completed" : (userStats?.ascensionLevel || 0) === 2 ? "current" : "upcoming", kp: "2,847" },
                          { level: "CKQ-4", status: (userStats?.ascensionLevel || 0) >= 4 ? "completed" : (userStats?.ascensionLevel || 0) === 3 ? "current" : "upcoming", kp: "4,200" }
                        ].map((level, index) => (
                          <div key={index} className={`text-center p-3 rounded-lg border ${level.status === 'completed' ? 'bg-green-50 border-green-200' :
                            level.status === 'current' ? 'bg-blue-50 border-blue-200' :
                              'bg-gray-50 border-gray-200'
                            }`}>
                            <div className="font-semibold">{level.level}</div>
                            <div className="text-xs text-muted-foreground">{level.kp} KP</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <div className="col-span-full text-center py-8">Loading courses...</div>
                  ) : coursesData?.courses ? (
                    coursesData.courses.map((course) => (
                      <Card key={course.id} className="glass border-border/50 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                        <div className={`h-32 bg-gradient-to-br ${course.color || 'from-purple-500 to-pink-500'} relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                              {course.level}
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between text-white">
                              <div>
                                <p className="font-semibold text-lg">{course.title}</p>
                                <p className="text-sm opacity-90">{course.instructor}</p>
                              </div>
                              <course.icon className="w-8 h-8 opacity-90" />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">{course.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Duration</span>
                              <span className="font-semibold">{course.duration}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Enrolled</span>
                              <span className="font-semibold">{course.enrolled?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{course.rating || 0}</span>
                              </div>
                              <Button size="sm" onClick={() => handleEnrollCourse(course.id)} disabled={course.userEnrolled}>
                                {course.userEnrolled ? "Enrolled" : "Enroll"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">No courses available</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Learning Progress
                      </CardTitle>
                      <CardDescription>Your journey through knowledge</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {loading ? (
                        <div className="text-center py-4">Loading progress data...</div>
                      ) : userProgress?.courses ? (
                        userProgress.courses.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{item.title}</span>
                              <span>{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{item.passed}/{item.assessments} assessments passed</span>
                              <span>{item.assessments - item.passed} remaining</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">No progress data available</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        Recent Achievements
                      </CardTitle>
                      <CardDescription>Your latest accomplishments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recentAchievements.map((achievement) => (
                        <div key={achievement.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <achievement.icon className={`h-5 w-5 mt-0.5 ${achievement.color}`} />
                          <div className="flex-1">
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">{achievement.date}</span>
                              <Badge variant="secondary">+{achievement.points} KP</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="rewards" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        Knowledge Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{showStats ? (loading ? "..." : (userRewards?.totalPoints || 0).toLocaleString()) : "••••••"}</div>
                      <p className="text-sm text-muted-foreground mt-1">Total earned</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>This week</span>
                          <span className="font-medium">+342</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>This month</span>
                          <span className="font-medium">+1,247</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-500" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">7</div>
                      <p className="text-sm text-muted-foreground mt-1">Earned</p>
                      <div className="mt-4 space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Latest:</span> CKQ-3 Economic Architect
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Next:</span> CKQ-4 Systems Sovereign
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Rewards Multiplier
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{loading ? "..." : `${userRewards?.currentMultiplier || 0}x`}</div>
                      <p className="text-sm text-muted-foreground mt-1">Current multiplier</p>
                      <div className="mt-4 space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Streak bonus:</span> +0.8x
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Assessment bonus:</span> +0.6x
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle>Reward History</CardTitle>
                    <CardDescription>Your recent knowledge point earnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loading ? (
                        <div className="text-center py-4">Loading reward history...</div>
                      ) : userRewards?.history ? (
                        userRewards.history.map((reward, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${reward.type === 'assessment' ? 'bg-blue-100' :
                                reward.type === 'streak' ? 'bg-orange-100' :
                                  reward.type === 'enrollment' ? 'bg-green-100' :
                                    reward.type === 'bonus' ? 'bg-purple-100' : 'bg-gray-100'
                                }`}>
                                {reward.type === 'assessment' && <CheckCircle className="h-4 w-4 text-blue-600" />}
                                {reward.type === 'streak' && <Zap className="h-4 w-4 text-orange-600" />}
                                {reward.type === 'enrollment' && <BookOpen className="h-4 w-4 text-green-600" />}
                                {reward.type === 'bonus' && <Trophy className="h-4 w-4 text-purple-600" />}
                                {reward.type === 'milestone' && <Target className="h-4 w-4 text-gray-600" />}
                              </div>
                              <div>
                                <p className="font-medium">{reward.activity}</p>
                                <p className="text-sm text-muted-foreground">{reward.date}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">+{reward.points} KP</Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">No reward history available</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Constitutional Governor Sidebar */}
      <div className="hidden xl:block w-96 border-l border-border/50 bg-card/50 backdrop-blur">
        <ConstitutionalGovernor />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'