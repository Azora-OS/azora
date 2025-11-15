"use client"

import { useAuth } from "@/lib/auth-context"
import { useState } from "react"

export default function EducationPage() {
  const { user } = useAuth()
  const [curriculum, setCurriculum] = useState([
    { id: "math-101", name: "Mathematics Fundamentals", grade: "10", standards: "NGSS K-12" },
    { id: "sci-201", name: "Biology & Life Sciences", grade: "10", standards: "NGSS K-12" },
    { id: "eng-150", name: "English Language Arts", grade: "10", standards: "Common Core" },
  ])
  const [assessments, setAssessments] = useState([
    { id: "quiz-001", subject: "Math", topic: "Algebra", score: 92, date: "2025-01-08", status: "Passed" },
    { id: "test-001", subject: "Science", topic: "Cell Biology", score: 88, date: "2025-01-06", status: "Passed" },
  ])
  const [selectedTab, setSelectedTab] = useState<"curriculum" | "assessments" | "progress">("curriculum")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Azora Education</h1>
          <p className="text-slate-300">AI-Powered Homeschool Platform with DO Compliance</p>
          <p className="text-sm text-slate-400 mt-2">Department of Education Standards Compliant Curriculum</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-600 flex-wrap">
          {(["curriculum", "assessments", "progress"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-semibold border-b-2 transition capitalize ${
                selectedTab === tab
                  ? "border-green-500 text-green-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Curriculum View */}
        {selectedTab === "curriculum" && (
          <div className="space-y-4">
            {curriculum.map((course) => (
              <div
                key={course.id}
                className="p-6 bg-slate-700/50 border border-slate-600 rounded-lg hover:border-slate-500 transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{course.name}</h3>
                    <p className="text-slate-400 text-sm">Course ID: {course.id}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                      Grade {course.grade}
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                      {course.standards}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>Department of Education Aligned Curriculum</p>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-slate-600">
                    <button className="text-blue-400 hover:text-blue-300 font-semibold">View Lessons</button>
                    <button className="text-green-400 hover:text-green-300 font-semibold">Take Assessment</button>
                    <button className="text-purple-400 hover:text-purple-300 font-semibold">View Progress</button>
                  </div>
                </div>
              </div>
            ))}

            {/* AI Lesson Planning */}
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/50 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">AI Lesson Planning</h3>
              <p className="text-slate-300 text-sm mb-4">
                Let our AI create personalized lesson plans based on your learning style and pace.
              </p>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700">
                Generate Personalized Lesson Plan
              </button>
            </div>
          </div>
        )}

        {/* Assessments View */}
        {selectedTab === "assessments" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="p-6 bg-slate-700/50 border border-slate-600 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{assessment.subject}</h3>
                    <p className="text-slate-400 text-sm">{assessment.topic}</p>
                  </div>
                  <span
                    className={`text-2xl font-bold ${
                      assessment.score >= 90
                        ? "text-green-400"
                        : assessment.score >= 80
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {assessment.score}%
                  </span>
                </div>
                <div className="space-y-2 text-sm text-slate-400">
                  <p>Date: {assessment.date}</p>
                  <p>
                    Status: <span className="text-green-400">{assessment.status}</span>
                  </p>
                </div>
              </div>
            ))}

            {/* Create Assessment */}
            <div className="p-6 bg-blue-500/10 border border-blue-500/50 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Create Assessment</h3>
                <p className="text-slate-300 text-sm">
                  Generate AI-powered assessments aligned with curriculum standards
                </p>
              </div>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 mt-4">
                Create New Assessment
              </button>
            </div>
          </div>
        )}

        {/* Progress View */}
        {selectedTab === "progress" && (
          <div className="space-y-6">
            {/* Progress Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Courses In Progress", value: 3, color: "from-blue-600 to-blue-400" },
                { label: "Assessments Completed", value: 12, color: "from-green-600 to-green-400" },
                { label: "Average Score", value: "89%", color: "from-yellow-600 to-yellow-400" },
              ].map((stat) => (
                <div key={stat.label} className={`bg-gradient-to-br ${stat.color} p-0.5 rounded-lg`}>
                  <div className="bg-slate-800 p-6 rounded">
                    <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Learning Path */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">Personalized Learning Path</h3>
              <div className="space-y-4">
                {[
                  { milestone: "Complete Algebra Module", progress: 85, status: "In Progress" },
                  { milestone: "Pass Biology Assessment", progress: 100, status: "Completed" },
                  { milestone: "English Essay Assignment", progress: 40, status: "In Progress" },
                  { milestone: "Chemistry Lab Project", progress: 0, status: "Not Started" },
                ].map((milestone) => (
                  <div key={milestone.milestone}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 font-medium">{milestone.milestone}</span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          milestone.status === "Completed"
                            ? "bg-green-500/20 text-green-400"
                            : milestone.status === "In Progress"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {milestone.status}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{milestone.progress}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Standards Compliance */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Department of Education Compliance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-white mb-2">Standards Covered</p>
                  <ul className="space-y-1">
                    <li>✓ Common Core Mathematics</li>
                    <li>✓ NGSS Science Standards</li>
                    <li>✓ English Language Arts</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-white mb-2">Progress Reports</p>
                  <p>Generate standards-based progress reports for educational authorities</p>
                  <button className="text-green-400 hover:text-green-300 font-semibold text-sm mt-2">
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
