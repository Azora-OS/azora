"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { courseAnalyticsData } from "@/lib/analytics-data"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month")

  const stats = [
    {
      label: "Total Enrollments",
      value: courseAnalyticsData.totalEnrollments.toLocaleString(),
      change: "+12%",
      positive: true,
    },
    {
      label: "Active Students",
      value: courseAnalyticsData.activeStudents.toLocaleString(),
      change: "+8%",
      positive: true,
    },
    {
      label: "Avg Completion Rate",
      value: `${courseAnalyticsData.averageCompletion}%`,
      change: "+5%",
      positive: true,
    },
    {
      label: "Dropout Rate",
      value: `${courseAnalyticsData.dropoutRate}%`,
      change: "-2%",
      positive: true,
    },
    {
      label: "Avg Score",
      value: courseAnalyticsData.averageScore,
      change: "+3 pts",
      positive: true,
    },
    {
      label: "Engagement",
      value: `${courseAnalyticsData.engagementRate}%`,
      change: "+4%",
      positive: true,
    },
  ]

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Course Analytics</h1>
            <p className="text-muted-foreground">{courseAnalyticsData.courseName}</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {["week", "month", "quarter", "year"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <span className={`text-sm font-medium ${stat.positive ? "text-green-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Enrollment Trend */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Enrollment Trend</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {courseAnalyticsData.monthlyGrowth.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-muted rounded-t relative group">
                    <div
                      className="bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all hover:from-primary/80"
                      style={{ height: `${(data.enrollments / 4000) * 100}%` }}
                    />
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.enrollments}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="text-sm font-semibold text-foreground">
                    {courseAnalyticsData.averageCompletion}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${courseAnalyticsData.averageCompletion}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Engagement</span>
                  <span className="text-sm font-semibold text-foreground">{courseAnalyticsData.engagementRate}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${courseAnalyticsData.engagementRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Avg Score</span>
                  <span className="text-sm font-semibold text-foreground">{courseAnalyticsData.averageScore}/100</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: `${courseAnalyticsData.averageScore}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Lesson Completion */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Lesson Completion Rate</h2>
            <div className="space-y-3">
              {courseAnalyticsData.lessonCompletion.map((lesson, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-foreground">{lesson.lessonName}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{lesson.completionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${lesson.completionRate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Top Performers</h2>
            <div className="space-y-3">
              {courseAnalyticsData.topPerformers.map((student, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-background font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.learningHours}h learning</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{student.score}/100</p>
                    <p className="text-xs text-muted-foreground">{student.completion}% complete</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz Analysis */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quiz Performance Analysis</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Lesson</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Pass Rate</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Avg Time</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Completion</th>
                </tr>
              </thead>
              <tbody>
                {courseAnalyticsData.lessonCompletion.map((lesson, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-foreground">{lesson.lessonName}</td>
                    <td className="text-center py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          lesson.quizPassRate >= 85
                            ? "bg-green-100 text-green-700"
                            : lesson.quizPassRate >= 70
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {lesson.quizPassRate}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-muted-foreground">{lesson.avgTimeSpent} min</td>
                    <td className="text-right py-3 px-4">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden inline-block">
                        <div className="h-full bg-primary" style={{ width: `${lesson.completionRate}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
