"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getCourseById } from "@/lib/courses-data"
import { Button } from "@/components/ui/button"

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [enrolling, setEnrolling] = useState(false)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const router = useRouter()

  const course = getCourseById(params.id)

  if (!course) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Course not found</h1>
          <Button onClick={() => router.push("/courses")}>Back to Courses</Button>
        </div>
      </main>
    )
  }

  const handleEnroll = async () => {
    setEnrolling(true)
    // Simulate enrollment
    await new Promise((resolve) => setTimeout(resolve, 1500))
    alert("Successfully enrolled in " + course.title)
    setEnrolling(false)
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          ← Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            <div className="w-full h-96 bg-muted rounded-lg overflow-hidden mb-6">
              <img src={course.image || "/placeholder.svg"} alt={course.title} className="w-full h-full object-cover" />
            </div>

            {/* Course Title and Meta */}
            <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">{course.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <span className="text-yellow-500 font-medium">
                ★ {course.rating} ({course.students.toLocaleString()} students)
              </span>
              <span className="text-muted-foreground">By {course.instructor}</span>
              <span className="text-muted-foreground">{course.duration}</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded">{course.level}</span>
            </div>

            {/* Description */}
            <p className="text-foreground text-lg mb-8 leading-relaxed">{course.description}</p>

            {/* Course Curriculum */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Course Curriculum</h2>
              <div className="space-y-3">
                {course.modules.map((module) => (
                  <div key={module.id} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                      className="w-full px-4 py-3 bg-card hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <div className="text-left">
                        <h3 className="font-semibold text-foreground">{module.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {module.lessons.length} lessons • {module.duration}
                        </p>
                      </div>
                      <span className="text-muted-foreground">{expandedModule === module.id ? "−" : "+"}</span>
                    </button>

                    {expandedModule === module.id && (
                      <div className="bg-background px-4 py-3 space-y-2 border-t border-border">
                        {module.lessons.map((lesson, idx) => (
                          <div key={lesson.id} className="flex items-start gap-3 text-sm">
                            <span className="text-muted-foreground">{idx + 1}.</span>
                            <div className="flex-1">
                              <p className="text-foreground">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {lesson.type === "video" && "🎬"}
                                {lesson.type === "text" && "📄"}
                                {lesson.type === "quiz" && "❓"}
                                {lesson.type === "assignment" && "📝"} {lesson.duration}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Section */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">About the Instructor</h3>
              <div className="flex gap-4">
                <img
                  src={course.instructorImage || "/placeholder.svg"}
                  alt={course.instructor}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{course.instructor}</h4>
                  <p className="text-muted-foreground text-sm">Expert educator with 10+ years of industry experience</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
              {/* Price */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-foreground">${course.price}</div>
                <div className="text-sm text-accent-foreground mt-1">+ {course.azrReward} AZR Rewards</div>
              </div>

              {/* Enroll Button */}
              <Button onClick={handleEnroll} disabled={enrolling} className="w-full mb-3" size="lg">
                {enrolling ? "Enrolling..." : "Enroll Now"}
              </Button>

              <Button variant="outline" className="w-full bg-transparent">
                Add to Wishlist
              </Button>

              {/* Course Info */}
              <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-medium text-foreground">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium text-foreground">{course.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certification</span>
                  <span className="font-medium text-foreground">{course.certification ? "✓ Yes" : "No"}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">What You'll Get</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-foreground">
                    <span>✓</span> Full lifetime access
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <span>✓</span> Completion certificate
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <span>✓</span> AZR token rewards
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <span>✓</span> Job board access
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
