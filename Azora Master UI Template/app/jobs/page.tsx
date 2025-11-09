"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { jobPostings, employers } from "@/lib/jobs-data"
import { Search, MapPin, Briefcase, DollarSign, Clock, Zap, Building2, Star } from "lucide-react"

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [selectedLevel, setSelectedLevel] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")

  const filteredJobs = useMemo(() => {
    return jobPostings.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = selectedType === "All" || job.type === selectedType
      const matchesLevel = selectedLevel === "All" || job.level === selectedLevel
      const matchesLocation = selectedLocation === "All" || job.location.includes(selectedLocation)

      return matchesSearch && matchesType && matchesLevel && matchesLocation
    })
  }, [searchQuery, selectedType, selectedLevel, selectedLocation])

  const uniqueLocations = Array.from(
    new Set(jobPostings.map((j) => j.location.split(",")[1]?.trim() || j.location)),
  ).sort()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-purple-500/5 to-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
              Global Job Marketplace
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Connect with verified employers and find opportunities perfectly matched to your qualifications and
              skills. Earn bonus AZR tokens with every placement.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, company, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filters */}
          <div className="grid gap-3 md:grid-cols-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="Entry">Entry Level</SelectItem>
                <SelectItem value="Mid">Mid Level</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Locations</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                {uniqueLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full bg-transparent">
              Advanced Filters
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4 mt-8">
            {[
              { label: "Active Jobs", value: `${jobPostings.length}+`, icon: Briefcase },
              { label: "Employers", value: `${employers.length}+`, icon: Building2 },
              { label: "Placements", value: "5K+", icon: Star },
              { label: "Avg Salary", value: "$85K", icon: DollarSign },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                  <Icon className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-semibold text-foreground">{stat.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found <span className="font-semibold text-foreground">{filteredJobs.length}</span> opportunities
            </p>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedType("All")
                  setSelectedLevel("All")
                  setSelectedLocation("All")
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="border-border p-6 hover:shadow-lg hover:border-purple-500 transition-all cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                            <Briefcase className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-1">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </Badge>
                          <Badge variant="outline">{job.type}</Badge>
                          <Badge variant="outline">{job.level}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between h-full text-right">
                        <div>
                          <div className="flex items-center justify-end gap-1 text-lg font-bold text-foreground mb-1">
                            {job.salary}
                          </div>
                          {job.azrBonus && (
                            <div className="flex items-center justify-end gap-1 text-sm text-blue-500">
                              <Zap className="h-4 w-4" />+{job.azrBonus} AZR
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-3">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {job.applications} applications
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Employers Section */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-foreground mb-12">Featured Employers</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {employers.map((employer) => (
              <Link key={employer.id} href={`/employers/${employer.id}`}>
                <Card className="border-border p-6 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{employer.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{employer.industry}</p>
                  </div>

                  <p className="text-muted-foreground text-sm flex-1">{employer.description}</p>

                  <div className="space-y-2 py-3 border-y border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Founded</span>
                      <span className="font-medium text-foreground">{employer.founded}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Employees</span>
                      <span className="font-medium text-foreground">{employer.employees}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Placements</span>
                      <span className="font-medium text-foreground">{employer.jobsFilled}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-foreground">{employer.rating}</span>
                      <span className="text-xs text-muted-foreground">({employer.reviews})</span>
                    </div>
                    <Button size="sm" variant="outline">
                      View Jobs
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Launch Your Career?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Apply to jobs, earn AZR bonuses, and connect with top employers across Africa and globally
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/explore">Build Your Profile</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/learning-paths">Explore Learning Paths</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
