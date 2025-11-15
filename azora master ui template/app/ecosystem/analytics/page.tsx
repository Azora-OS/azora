"use client"

import { useState } from "react"

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    realTimeMetrics: {
      activeUsers: 2547,
      activeMiners: 1893,
      coursesEnrolled: 5234,
      azrFlowing: 125000,
    },
    topCourses: [
      { name: "Blockchain Development", enrollments: 1245, avgScore: 87 },
      { name: "AI Fundamentals", enrollments: 1089, avgScore: 84 },
      { name: "Full-Stack Web Dev", enrollments: 987, avgScore: 85 },
    ],
    miningMetrics: {
      totalMinted: 12450000,
      dailyMinting: 125000,
      averageMiningPower: 1.45,
      topMiners: 125,
    },
  })

  const [selectedMetric, setSelectedMetric] = useState<string>("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Azora Spark Analytics</h1>
          <p className="text-slate-300">Real-Time Distributed Data Processing & Insights</p>
        </div>

        {/* Real-Time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            {
              label: "Active Users",
              value: analyticsData.realTimeMetrics.activeUsers,
              color: "from-blue-600 to-blue-400",
              icon: "👥",
            },
            {
              label: "Active Miners",
              value: analyticsData.realTimeMetrics.activeMiners,
              color: "from-yellow-600 to-yellow-400",
              icon: "⛏️",
            },
            {
              label: "Course Enrollments",
              value: analyticsData.realTimeMetrics.coursesEnrolled,
              color: "from-green-600 to-green-400",
              icon: "📚",
            },
            {
              label: "AZR Flowing",
              value: `${(analyticsData.realTimeMetrics.azrFlowing / 1000).toFixed(0)}K`,
              color: "from-purple-600 to-purple-400",
              icon: "💰",
            },
          ].map((metric) => (
            <div key={metric.label} className={`bg-gradient-to-br ${metric.color} p-0.5 rounded-lg`}>
              <div className="bg-slate-800 p-6 rounded">
                <p className="text-slate-400 text-sm mb-2">{metric.label}</p>
                <p className="text-3xl font-bold text-white">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Top Courses */}
          <div className="lg:col-span-2 bg-slate-700/50 border border-slate-600 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Top Performing Courses</h2>
            <div className="space-y-4">
              {analyticsData.topCourses.map((course, idx) => (
                <div key={idx} className="p-4 bg-slate-600/30 rounded-lg border border-slate-500">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white">{course.name}</p>
                      <p className="text-sm text-slate-400">Enrollments: {course.enrollments}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">{course.avgScore}%</p>
                      <p className="text-xs text-slate-400">Avg Score</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-500 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${course.avgScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mining Metrics */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Mining Network</h2>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-2">Total AZR Minted</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {(analyticsData.miningMetrics.totalMinted / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Daily Minting</p>
                <p className="text-xl font-bold text-green-400">
                  {(analyticsData.miningMetrics.dailyMinting / 1000).toFixed(0)}K AZR/day
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Avg Mining Power</p>
                <p className="text-xl font-bold text-purple-400">
                  {analyticsData.miningMetrics.averageMiningPower.toFixed(2)}x
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/50 rounded">
                <p className="text-blue-400 font-semibold text-sm">
                  Active Miners: {analyticsData.miningMetrics.topMiners}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Tabs */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Distributed Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-600/30 rounded-lg border border-slate-500">
              <h3 className="font-semibold text-white mb-3">User Engagement Trends</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Peak Activity: 2:00 PM - 4:00 PM UTC</p>
                <p>Top Device: Mobile (62%)</p>
                <p>Avg Session: 32 minutes</p>
                <p>Retention Rate: 78%</p>
              </div>
            </div>

            <div className="p-4 bg-slate-600/30 rounded-lg border border-slate-500">
              <h3 className="font-semibold text-white mb-3">Learning Analytics</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Avg Course Completion: 84%</p>
                <p>Quiz Pass Rate: 89%</p>
                <p>Project Submission: 92%</p>
                <p>Knowledge Retention: 76%</p>
              </div>
            </div>

            <div className="p-4 bg-slate-600/30 rounded-lg border border-slate-500">
              <h3 className="font-semibold text-white mb-3">Economic Metrics</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Total AZR Value: $12.4M USD</p>
                <p>Avg AZR per User: 1,386 AZR</p>
                <p>Transaction Volume: $245K/day</p>
                <p>Network Health: 99.8%</p>
              </div>
            </div>

            <div className="p-4 bg-slate-600/30 rounded-lg border border-slate-500">
              <h3 className="font-semibold text-white mb-3">Geographic Distribution</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>South Africa: 2,145 users (42%)</p>
                <p>Nigeria: 1,234 users (24%)</p>
                <p>Kenya: 856 users (17%)</p>
                <p>Other Africa: 712 users (14%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spark Features */}
        <div className="mt-12 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Azora Spark Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="text-orange-400 font-semibold mb-2">Real-Time Processing</h3>
              <p className="text-slate-300">Stream analytics from Kafka, Redis, and APIs with low-latency processing</p>
            </div>
            <div>
              <h3 className="text-orange-400 font-semibold mb-2">RDD Operations</h3>
              <p className="text-slate-300">Resilient Distributed Datasets with map, filter, and reduce operations</p>
            </div>
            <div>
              <h3 className="text-orange-400 font-semibold mb-2">DataFrame API</h3>
              <p className="text-slate-300">High-level API for structured data operations and transformations</p>
            </div>
            <div>
              <h3 className="text-orange-400 font-semibold mb-2">Ingestion Engines</h3>
              <p className="text-slate-300">Connect to Kafka, Redis, Databases, S3, APIs, and file systems</p>
            </div>
            <div>
              <h3 className="text-orange-400 font-semibold mb-2">Cluster Management</h3>
              <p className="text-slate-300">Automatic resource allocation and distributed job scheduling</p>
            </div>
            <div>
              <h3 className="text-orange-400 font-semibold mb-2">Azora Integration</h3>
              <p className="text-slate-300">Seamless integration with all Azora services and data sources</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
