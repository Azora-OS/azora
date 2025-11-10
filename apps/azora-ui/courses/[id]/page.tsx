import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, Play, CheckCircle, Clock, Users, Star } from "lucide-react"
import { useQuery, useMutation } from "@azora/shared-api/hooks"
import { getAPIClient } from "@azora/shared-api/client"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Navigation } from "@/components/navigation"

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const courseId = params?.id || "1"
  const [enrolled, setEnrolled] = useState(false)
  const [enrollmentLoading, setEnrollmentLoading] = useState(false)

  const { data: courseData, loading: courseLoading, error: courseError } = useQuery(
    async (client) => {
      const courses = await client.getCourses()
      return courses.data?.find((c: any) => c.id === courseId) || {
        id: courseId,
        title: "First Principles of AI & Ethics",
        description: "Learn the foundational principles of AI ethics and constitutional AI design",
        instructor: "Dr. Sarah Chen",
        duration: "8 weeks",
        level: "Intermediate",
        rating: 4.8,
        students: 1247,
        modules: [
          { id: 1, title: "Introduction to AI Ethics", completed: true },
          { id: 2, title: "Constitutional AI Framework", completed: true },
          { id: 3, title: "Ethical Decision Making", completed: false },
          { id: 4, title: "Case Studies", completed: false },
        ],
        progress: 50,
      }
    },
    { enabled: true }
  )

  const handleEnroll = async () => {
    setEnrollmentLoading(true)
    try {
      const client = getAPIClient()
      await client.post(`/api/lms/enrollments`, { courseId })
      setEnrolled(true)
    } catch (error) {
      console.error("Enrollment failed:", error)
    } finally {
      setEnrollmentLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath={`/courses/${courseId}`} />
      <div className="container mx-auto px-6 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/courses';
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        {courseLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : courseError ? (
          <div className="text-destructive">Error loading course: {courseError.message}</div>
        ) : courseData ? (
          <>
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">{courseData.title}</h1>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">{courseData.description}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge variant="outline">{courseData.level}</Badge>
                    <Badge variant="outline">{courseData.duration}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{courseData.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{courseData.students} students</span>
                    </div>
                  </div>
                </div>
                <div>
                  {enrolled ? (
                    <Button className="w-full" onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = `/courses/${courseId}/learn`;
                      }
                    }}>
                      <Play className="mr-2 h-4 w-4" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={handleEnroll}
                      disabled={enrollmentLoading}
                    >
                      {enrollmentLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {enrolled && courseData.progress !== undefined && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm font-bold text-primary">{courseData.progress}%</span>
                  </div>
                  <Progress value={courseData.progress} className="h-2" />
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Course Modules</h2>
              <div className="space-y-3">
                {courseData.modules?.map((module: any) => (
                  <div 
                    key={module.id} 
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors cursor-pointer"
                    onClick={() => {
                      if (enrolled && typeof window !== 'undefined') {
                        window.location.href = `/courses/${courseId}/modules/${module.id}`;
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {module.completed ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="font-medium">{module.title}</span>
                    </div>
                    {module.completed && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Completed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <div className="text-muted-foreground">Course not found</div>
        )}
      </div>
    </div>
  )
}
