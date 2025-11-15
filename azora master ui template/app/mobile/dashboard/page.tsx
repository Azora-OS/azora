"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MobileDashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </main>
    )
  }

  const quickActions = [
    { icon: "📚", label: "My Courses", href: "/dashboard" },
    { icon: "🏆", label: "Certificates", href: "/dashboard/rewards" },
    { icon: "💰", label: "Rewards", href: "/dashboard/rewards" },
    { icon: "🎯", label: "Learning Path", href: "/learning-paths" },
    { icon: "👥", label: "Find Mentors", href: "/mentorship/mentors" },
    { icon: "💬", label: "Community", href: "/community/forums" },
  ]

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Welcome back!</h1>
        <p className="text-muted-foreground">{user.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 py-4">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary">5</p>
          <p className="text-xs text-muted-foreground">Courses</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-accent">2,450</p>
          <p className="text-xs text-muted-foreground">AZR Points</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">68%</p>
          <p className="text-xs text-muted-foreground">Progress</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md transition-all active:bg-muted">
                <p className="text-2xl mb-1">{action.icon}</p>
                <p className="text-xs font-semibold text-foreground">{action.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Recommended for You</h2>
        <div className="space-y-2">
          {["Advanced Python Techniques", "Web Design Basics", "Data Analysis Pro"].map((course) => (
            <div key={course} className="bg-card border border-border rounded-lg p-3">
              <p className="text-sm font-medium text-foreground mb-1">{course}</p>
              <Button size="sm" variant="outline" className="w-full bg-transparent">
                Learn More
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
