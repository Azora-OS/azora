'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, Star, Award } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { useEnroll } from "@/hooks/use-enroll";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { useWallet } from "@/hooks/use-wallet";

const CourseSkeleton = () => (
  <Card className="bg-slate-900/50 border-slate-800">
    <CardHeader>
      <Skeleton className="h-16 w-16 mb-4" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2 mt-2" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
      </div>
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

export default function CoursesPage() {
  const { data: courses, error, isLoading } = useCourses();
  const { data: wallet } = useWallet();
  const enrollMutation = useEnroll();

  const handleEnroll = (courseId: string) => {
    enrollMutation.mutate(courseId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <Header />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Discover <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">World-Class</span> Courses
          </h1>
          <p className="text-xl text-slate-400">Learn, earn AZR, and build your future with Ubuntu</p>
        </div>

        {enrollMutation.isError && (
            <Alert variant="destructive" className="mb-4">
                <AlertTitle>Enrollment Failed</AlertTitle>
                <AlertDescription>{(enrollMutation.error as any)?.message || 'An unknown error occurred'}</AlertDescription>
            </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <CourseSkeleton key={i} />)}
          {error && (
             <Alert variant="destructive" className="md:col-span-2 lg:col-span-3">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load courses. Please try again later.</AlertDescription>
            </Alert>
          )}
          {courses?.map((course: any) => {
            const isEnrolled = course.isEnrolled;
            const canAfford = wallet && wallet.balance >= (course.azrCost || 0);
            return (
              <Card key={course.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-6xl">🎓</div>
                    <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-white font-semibold">{course.rating || 'N/A'}</span>
                    </div>
                  </div>
                  <CardTitle className="text-white group-hover:text-teal-400 transition-colors">{course.title}</CardTitle>
                  <CardDescription>by {course.instructorName || 'Azora Faculty'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="h-4 w-4" />
                      <span>{course.enrollmentCount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration || 'TBD'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-teal-400" />
                      <span className="text-teal-400 font-semibold">{course.azrReward || 0} AZR Reward</span>
                    </div>
                    <div className="font-semibold text-white">{course.azrCost || 0} AZR</div>
                  </div>

                  <Button 
                    variant={isEnrolled ? "outline" : "emerald"} 
                    className="w-full" 
                    disabled={isEnrolled || !canAfford || enrollMutation.isPending}
                    onClick={() => !isEnrolled && handleEnroll(course.id)}
                  >
                    {isEnrolled ? "Enrolled" : (enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now')}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
