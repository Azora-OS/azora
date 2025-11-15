"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { jobPostings, employers } from "@/lib/jobs-data"
import { ArrowLeft, MapPin, DollarSign, Briefcase, Clock, Star, Zap, CheckCircle, Share2, Bookmark } from "lucide-react"

export default function JobDetailPage() {
  const params = useParams()
  const id = params.id as string
  const job = jobPostings.find((j) => j.id === id)
  const employer = job ? employers.find((e) => e.name === job.company) : null

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Job not found</h1>
            <Button asChild>
              <Link href="/jobs">Back to Jobs</Link>
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
      <section className="border-b border-border bg-gradient-to-b from-purple-500/5 to-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/jobs" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground mb-2">{job.title}</h1>
                <p className="text-lg text-muted-foreground mb-3">{job.company}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>{job.level}</Badge>
                  <Badge variant="outline">{job.type}</Badge>
                  {job.azrBonus && (
                    <Badge className="bg-blue-500 flex items-center gap-1">
                      <Zap className="h-3 w-3" />+{job.azrBonus} AZR
                    </Badge>
                  )}
                </div>
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
              {/* Key Details */}
              <Card className="border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">Job Details</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-sm">Salary Range</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{job.salary}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MapPin className="h-5 w-5" />
                      <span className="text-sm">Location</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{job.location}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Briefcase className="h-5 w-5" />
                      <span className="text-sm">Job Type</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{job.type}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="h-5 w-5" />
                      <span className="text-sm">Applications</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{job.applications}</p>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card className="border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">About the Role</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{job.description}</p>
              </Card>

              {/* Requirements */}
              <Card className="border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Skills */}
              <Card className="border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* About Employer */}
              {employer && (
                <Card className="border-border p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">About {employer.name}</h2>
                  <p className="text-muted-foreground mb-4">{employer.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Founded</p>
                      <p className="font-semibold text-foreground">{employer.founded}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Employees</p>
                      <p className="font-semibold text-foreground">{employer.employees}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-foreground">{employer.rating}</span>
                    <span className="text-muted-foreground text-sm">({employer.reviews} reviews)</span>
                  </div>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href={`/employers/${employer.id}`}>View Employer Profile</Link>
                  </Button>
                </Card>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Application Card */}
              <Card className="border-border p-6 bg-gradient-to-br from-purple-500/5 to-transparent">
                <h3 className="font-semibold text-foreground mb-4">Ready to Apply?</h3>
                <div className="space-y-3">
                  {job.deadline && (
                    <div className="rounded-lg bg-background border border-border p-3">
                      <p className="text-xs text-muted-foreground mb-1">Application Deadline</p>
                      <p className="font-semibold text-foreground">{new Date(job.deadline).toLocaleDateString()}</p>
                    </div>
                  )}

                  {job.azrBonus && (
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <p className="text-xs text-muted-foreground">AZR Bonus</p>
                      </div>
                      <p className="text-lg font-bold text-blue-500">+{job.azrBonus}</p>
                      <p className="text-xs text-muted-foreground mt-1">Upon placement</p>
                    </div>
                  )}

                  <Button size="lg" className="w-full">
                    Apply Now
                  </Button>

                  <Button variant="outline" size="lg" className="w-full flex items-center gap-2 bg-transparent">
                    <Bookmark className="h-4 w-4" />
                    Save Job
                  </Button>

                  <Button variant="outline" size="lg" className="w-full flex items-center gap-2 bg-transparent">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </Card>

              {/* Qualifications Match */}
              {job.qualifications.length > 0 && (
                <Card className="border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Required Qualifications</h3>
                  <div className="space-y-2">
                    {job.qualifications.map((qual) => (
                      <div key={qual} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-foreground">{qual}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" asChild>
                    <Link href="/learning-paths">View Learning Paths</Link>
                  </Button>
                </Card>
              )}

              {/* Quick Tips */}
              <Card className="border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Application Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Highlight relevant experience</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Verify your blockchain credentials</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Customize cover letter</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Jobs */}
      <section className="border-t border-border px-4 py-12 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-foreground mb-8">Similar Opportunities</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {jobPostings
              .filter((j) => j.level === job.level && j.id !== job.id)
              .slice(0, 3)
              .map((similar) => (
                <Link key={similar.id} href={`/jobs/${similar.id}`}>
                  <Card className="border-border p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{similar.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{similar.company}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      {similar.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{similar.salary}</span>
                      {similar.azrBonus && (
                        <Badge className="bg-blue-500 text-xs flex items-center gap-1">
                          <Zap className="h-3 w-3" />+{similar.azrBonus}
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
