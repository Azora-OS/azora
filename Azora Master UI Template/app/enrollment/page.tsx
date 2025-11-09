"use client"

import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { enrollmentService } from "@/lib/azora-services"

export default function EnrollmentPage() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([
    {
      id: "enr-001",
      courseId: "blockchain-101",
      courseName: "Blockchain Development",
      status: "Active",
      enrolledDate: "2025-01-01",
      progress: 45,
    },
    {
      id: "enr-002",
      courseId: "ai-101",
      courseName: "AI Fundamentals",
      status: "Active",
      enrolledDate: "2024-12-15",
      progress: 62,
    },
    {
      id: "enr-003",
      courseId: "webdev-101",
      courseName: "Full-Stack Web Development",
      status: "Completed",
      enrolledDate: "2024-11-01",
      progress: 100,
    },
  ])

  const [availableCourses, setAvailableCourses] = useState([
    { id: "ds-101", name: "Data Science Essentials", instructor: "Dr. Amahle", level: "Intermediate", azrReward: 5000 },
    {
      id: "cyber-101",
      name: "Cybersecurity Fundamentals",
      instructor: "Prof. Kwame",
      level: "Beginner",
      azrReward: 3000,
    },
    { id: "ml-201", name: "Machine Learning Advanced", instructor: "Dr. Fatima", level: "Advanced", azrReward: 8000 },
  ])

  const [enrolling, setEnrolling] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"my-courses" | "available">("my-courses")

  const handleEnroll = async (courseId: string) => {
    setEnrolling(true)
    try {
      const result = await enrollmentService.enrollStudent(user?.id || "", courseId)
      console.log("[v0] Enrollment successful:", result)

      const course = availableCourses.find((c) => c.id === courseId)
      if (course) {
        setEnrollments([
          ...enrollments,
          {
            id: `enr-${Date.now()}`,
            courseId,
            courseName: course.name,
            status: "Active",
            enrolledDate: new Date().toISOString().split("T")[0],
            progress: 0,
          },
        ])
        setAvailableCourses(availableCourses.filter((c) => c.id !== courseId))
      }
      alert("Successfully enrolled in course!")
    } catch (error) {
      console.error("[v0] Enrollment error:", error)
      alert("Failed to enroll")
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Course Enrollment</h1>
          <p className="text-slate-300">Manage Your Enrollments & Discover New Courses</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-600">
          {(["my-courses", "available"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-semibold border-b-2 transition capitalize ${
                selectedTab === tab
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab === "my-courses" ? "My Courses" : "Available Courses"}
            </button>
          ))}
        </div>

        {/* My Enrollments */}
        {selectedTab === "my-courses" && (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className={`p-6 rounded-lg border transition ${
                  enrollment.status === "Completed"
                    ? "bg-green-500/10 border-green-500/50"
                    : "bg-slate-700/50 border-slate-600 hover:border-slate-500"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{enrollment.courseName}</h3>
                    <p className="text-slate-400 text-sm">Enrolled: {enrollment.enrolledDate}</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full font-semibold text-sm ${
                      enrollment.status === "Completed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {enrollment.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Progress</span>
                    <span className="text-white font-semibold">{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className={`${
                        enrollment.status === "Completed" ? "bg-green-500" : "bg-blue-500"
                      } h-2 rounded-full transition-all`}
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-600">
                  <button className="text-blue-400 hover:text-blue-300 font-semibold text-sm">Continue Learning</button>
                  {enrollment.status === "Completed" && (
                    <button className="text-green-400 hover:text-green-300 font-semibold text-sm">
                      View Certificate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available Courses */}
        {selectedTab === "available" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <div
                key={course.id}
                className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 hover:border-slate-500 transition flex flex-col"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{course.name}</h3>
                  <p className="text-slate-400 text-sm mb-3">Instructor: {course.instructor}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Level</span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          course.level === "Beginner"
                            ? "bg-green-500/20 text-green-400"
                            : course.level === "Intermediate"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {course.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">AZR Reward</span>
                      <span className="text-yellow-400 font-semibold">{course.azrReward.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrolling}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mt-4"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Enrollment Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Enrollments", value: enrollments.length, color: "from-blue-600 to-blue-400" },
            {
              label: "In Progress",
              value: enrollments.filter((e) => e.status === "Active").length,
              color: "from-yellow-600 to-yellow-400",
            },
            {
              label: "Completed",
              value: enrollments.filter((e) => e.status === "Completed").length,
              color: "from-green-600 to-green-400",
            },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} p-0.5 rounded-lg`}>
              <div className="bg-slate-800 p-6 rounded text-center">
                <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Info */}
        <div className="mt-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Enrollment Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Learning Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">✓</span>
                  <span>Access all course materials and resources</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">✓</span>
                  <span>Complete assignments and quizzes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3">✓</span>
                  <span>Interact with instructors and peers</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Rewards & Recognition</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-3">✓</span>
                  <span>Earn AZR tokens on completion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-3">✓</span>
                  <span>Get verified blockchain certificates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-3">✓</span>
                  <span>Build your verified portfolio</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
