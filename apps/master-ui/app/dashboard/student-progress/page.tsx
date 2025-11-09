"use client"

import { useState } from "react"
import { studentAnalyticsData } from "@/lib/analytics-data"
import { Button } from "@/components/ui/button"

export default function StudentProgressPage() {
  const [selectedStudent, setSelectedStudent] = useState(studentAnalyticsData[0])

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <h1 className="text-3xl font-bold text-foreground mb-8">Student Progress Tracking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/50">
                <h2 className="font-semibold text-foreground">Students</h2>
              </div>
              <div className="divide-y divide-border">
                {studentAnalyticsData.map((student) => (
                  <button
                    key={student.studentId}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full text-left p-4 transition-colors ${
                      selectedStudent.studentId === student.studentId
                        ? "bg-primary/10 border-l-4 border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <p className="font-medium text-foreground text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.enrolledCourses} courses</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedStudent.name}</h2>
                  <p className="text-muted-foreground">{selectedStudent.email}</p>
                </div>
                <Button>Send Message</Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-foreground">{selectedStudent.enrolledCourses}</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-foreground">{selectedStudent.completionRate}%</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Avg Score</p>
                  <p className="text-2xl font-bold text-foreground">{selectedStudent.averageScore}</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Learning Hours</p>
                  <p className="text-2xl font-bold text-foreground">{selectedStudent.totalLearningHours}h</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Last active: {new Date(selectedStudent.lastActive).toLocaleDateString()}
              </div>
            </div>

            {/* Course Progress */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Course Progress</h3>
              <div className="space-y-4">
                {selectedStudent.progress.map((course) => (
                  <div key={course.courseId} className="p-4 bg-background rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{course.courseName}</h4>
                        <p className="text-xs text-muted-foreground">
                          Enrolled {new Date(course.enrolled).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{course.score}/100</p>
                        <p className="text-xs text-muted-foreground">{course.learningHours}h spent</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-muted-foreground">Completion</span>
                        <span className="text-sm font-bold text-foreground">{course.completion}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${course.completion}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
