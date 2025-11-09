"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { learningPaths } from "@/lib/learning-paths-data"
import { ArrowLeft, Clock, Users, Award, BookOpen, CheckCircle, Zap, Target, Briefcase } from "lucide-react"

export default function LearningPathDetailPage() {
  const params = useParams()
  const id = params.id as string
  const path = learningPaths.find((p) => p.id === id)

  if (!path) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Path not found</h1>
            <Button asChild>
              <Link href="/learning-paths">Back to Paths</Link>
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
      <section className="border-b border-border bg-gradient-to-b from-green-500/5 to-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/learning-paths" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Paths
            </Link>
          </Button>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{path.title}</h1>
                  <Badge
                    className={
                      path.difficulty === "Beginner"
                        ? "bg-green-500"
                        : path.difficulty === "Intermediate"
                          ? ""
                          : "bg-red-500"
                    }
                  >
                    {path.difficulty}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">{path.description}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4 mt-6">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <p className="font-semibold text-foreground">{path.duration}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Enrollments</span>
                </div>
                <p className="font-semibold text-foreground">{(path.enrollments / 1000).toFixed(1)}K+</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Completion</span>
                </div>
                <p className="font-semibold text-foreground">{path.completionRate}%</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">AZR Reward</span>
                </div>
                <p className="font-semibold text-foreground">{path.azrReward}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Path Overview */}
              <Card className="border-border p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Path Overview</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      Goal
                    </h3>
                    <p className="text-muted-foreground">{path.goal}</p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      Core Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {path.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Career Outcomes */}
              <Card className="border-border p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-purple-500" />
                  Career Opportunities
                </h2>
                <div className="space-y-3">
                  {path.careerOutcomes.map((outcome) => (
                    <div
                      key={outcome}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">{outcome}</p>
                        <p className="text-xs text-muted-foreground">High-demand position</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Qualifications */}
              <Card className="border-border p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  Required Qualifications
                </h2>
                <div className="space-y-3">
                  {path.qualifications.map((qual, idx) => (
                    <div key={qual} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-600 font-semibold text-sm flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Qualification {idx + 1}</p>
                        <p className="text-sm text-muted-foreground">Complete this certification to progress</p>
                      </div>
                      <Badge>Required</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* CTA Card */}
              <Card className="border-border p-6 bg-gradient-to-br from-green-500/5 to-blue-500/5">
                <h3 className="font-semibold text-foreground mb-4">Ready to Start?</h3>
                <div className="space-y-3">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Total Duration</p>
                    <p className="font-semibold text-foreground">{path.duration}</p>
                  </div>
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Learners Ahead</p>
                    <p className="font-semibold text-foreground">{(path.enrollments / 1000).toFixed(1)}K+ students</p>
                  </div>
                  <Button size="lg" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Enroll Now
                  </Button>
                </div>
              </Card>

              {/* Success Stats */}
              <Card className="border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Success Rate</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="text-sm font-semibold text-foreground">{path.completionRate}%</span>
                    </div>
                    <Progress value={path.completionRate} className="h-2" />
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Job Placement Rate</p>
                    <p className="text-lg font-bold text-green-600">89%</p>
                  </div>
                </div>
              </Card>

              {/* Info */}
              <Card className="border-border p-4">
                <h4 className="font-semibold text-foreground mb-2 text-sm">What's Included</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Structured curriculum
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Expert instruction
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Real-world projects
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Blockchain certificate
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
