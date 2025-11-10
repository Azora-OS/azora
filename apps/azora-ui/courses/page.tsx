import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, ArrowLeft, Play } from "lucide-react"
import { useQuery } from "@azora/shared-api/hooks"
import { getAPIClient } from "@azora/shared-api/client"
import { Loader2 } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function CoursesPage() {
  const { data: coursesData, loading: coursesLoading, error: coursesError } = useQuery(
    (client) => client.getCourses(),
    { enabled: true }
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/courses" />
      <div className="container mx-auto px-6 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-6">Courses</h1>

        {coursesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : coursesError ? (
          <div className="text-destructive">Error loading courses: {coursesError.message}</div>
        ) : coursesData?.data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesData.data.map((course: any) => (
              <Card key={course.id} className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <BookOpen className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => {
                    // Navigate to course detail or start learning
                    if (typeof window !== 'undefined') {
                      window.location.href = `/courses/${course.id}`;
                    }
                  }}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Learning
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground">No courses available</div>
        )}
      </div>
    </div>
  )
}
