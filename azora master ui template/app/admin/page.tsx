"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { platformMetricsData, moderationItemsData } from "@/lib/admin-data"

export default function AdminDashboard() {
  const pendingModerations = moderationItemsData.filter((item) => item.status === "pending").length

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform management and moderation</p>
          </div>
          <Button>Admin Settings</Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Users</p>
            <p className="text-3xl font-bold text-foreground">{platformMetricsData.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2">+{platformMetricsData.userGrowthRate}% this month</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Active Users</p>
            <p className="text-3xl font-bold text-foreground">{platformMetricsData.activeUsers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">{platformMetricsData.engagementRate}% engagement</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Enrollments</p>
            <p className="text-3xl font-bold text-foreground">
              {platformMetricsData.totalEnrollments.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{platformMetricsData.totalCourses} courses</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Platform Revenue</p>
            <p className="text-3xl font-bold text-foreground">
              ${(platformMetricsData.platformRevenue / 1000000).toFixed(2)}M
            </p>
            <p className="text-xs text-muted-foreground mt-2">This year</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Moderations */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Pending Moderation</h2>
              <Link href="/admin/moderation">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {pendingModerations > 0 ? (
              <div className="space-y-3">
                {moderationItemsData
                  .filter((item) => item.status === "pending")
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">Type: {item.type}</p>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            item.severity === "high"
                              ? "bg-red-100 text-red-700"
                              : item.severity === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Reason: {item.reason}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No pending items</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Moderation</p>
                <p className="text-3xl font-bold text-red-600">{pendingModerations}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Mentor Sessions</p>
                <p className="text-3xl font-bold text-foreground">
                  {platformMetricsData.totalMentorSessions.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">AZR Tokens Minted</p>
                <p className="text-2xl font-bold text-primary">
                  {(platformMetricsData.azrTokensMinted / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full bg-transparent">
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/moderation">
              <Button variant="outline" className="w-full bg-transparent">
                Moderation Queue
              </Button>
            </Link>
            <Link href="/admin/content">
              <Button variant="outline" className="w-full bg-transparent">
                Content Management
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full bg-transparent">
                Platform Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
