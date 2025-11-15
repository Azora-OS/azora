"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { educatorProfiles } from "@/lib/educator-data"
import { Star, Users, BookOpen, Award, CheckCircle, MessageCircle, ArrowLeft, Globe } from "lucide-react"

export default function EducatorProfilePage() {
  const params = useParams()
  const id = params.id as string
  const educator = educatorProfiles.find((e) => e.id === id)

  if (!educator) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Educator not found</h1>
            <Button asChild>
              <Link href="/educators">Back to Educators</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="border-b border-border bg-gradient-to-b from-blue-500/5 to-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/educators" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Educators
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{educator.name}</h1>
                {educator.verifiedBadge && <CheckCircle className="h-6 w-6 text-blue-500" />}
              </div>

              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{educator.country}</span>
                </div>
                <div className="flex items-center gap-1 bg-yellow-500/10 rounded-lg px-3 py-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">
                    {educator.averageRating} ({educator.coursesCreated} reviews)
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4 max-w-2xl">{educator.bio}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {educator.expertise.map((exp) => (
                  <Badge key={exp}>{exp}</Badge>
                ))}
              </div>

              <Button size="lg">Enroll with This Educator</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 border-b border-border">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-4">
            <Card className="border-border p-6 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground mb-1">{educator.totalStudents.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </Card>
            <Card className="border-border p-6 text-center">
              <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground mb-1">{educator.totalCourses}</p>
              <p className="text-sm text-muted-foreground">Courses</p>
            </Card>
            <Card className="border-border p-6 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground mb-1">{educator.averageRating}</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </Card>
            <Card className="border-border p-6 text-center">
              <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground mb-1">Verified</p>
              <p className="text-sm text-muted-foreground">Educator</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses */}
      {educator.courses && educator.courses.length > 0 && (
        <section className="px-4 py-12 sm:px-6 lg:px-8 border-b border-border">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-8">Featured Courses</h2>
            <div className="grid gap-6">
              {educator.courses.map((course) => (
                <Card key={course.id} className="border-border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2 gap-4">
                        <h3 className="text-xl font-semibold text-foreground">{course.title}</h3>
                        <Badge>{course.level}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{course.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-medium text-foreground">{course.duration}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Students</p>
                          <p className="font-medium text-foreground">{course.studentsEnrolled.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className="font-medium text-foreground flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            {course.rating}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">AZR Reward</p>
                          <p className="font-medium text-foreground text-blue-500">{course.azrReward}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {course.certifiable && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Certifiable
                          </Badge>
                        )}
                        <Badge variant="secondary">{course.category}</Badge>
                      </div>
                    </div>
                    <Button className="h-fit">Enroll Now</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-border p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <MessageCircle className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Get in Touch</h3>
                <p className="text-muted-foreground mb-4">
                  Have questions about {educator.name}'s courses or would like to collaborate?
                </p>
                <Button variant="outline">Send Message</Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
