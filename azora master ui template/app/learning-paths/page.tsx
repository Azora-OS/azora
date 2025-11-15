"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { learningPaths } from "@/lib/learning-paths-data"
import { Search, Clock, Users, TrendingUp, Award, BookOpen, Zap } from "lucide-react"

export default function LearningPathsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")

  const filteredPaths = learningPaths.filter((path) => {
    const matchesSearch =
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = selectedDifficulty === "All" || path.difficulty === selectedDifficulty
    return matchesSearch && matchesDifficulty
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-green-500/5 to-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
              Personalized Learning Paths
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Follow curated learning journeys designed to take you from novice to expert in your field of choice. Each
              path includes qualifications, skills, and clear career outcomes.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="grid gap-3 md:grid-cols-3 mb-8">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Active Paths", value: "50+", icon: BookOpen },
              { label: "Total Learners", value: "500K+", icon: Users },
              { label: "Avg Completion", value: "68%", icon: TrendingUp },
              { label: "Career Placements", value: "89%", icon: Award },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                  <Icon className="h-5 w-5 text-green-500" />
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

      {/* Learning Paths Grid */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {filteredPaths.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No paths found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredPaths.map((path) => (
                <Link key={path.id} href={`/learning-paths/${path.id}`}>
                  <Card className="border-border p-6 hover:shadow-lg hover:border-green-500 transition-all cursor-pointer h-full flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">{path.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{path.description}</p>
                      </div>
                      <Badge
                        className="flex-shrink-0"
                        variant={
                          path.difficulty === "Beginner"
                            ? "secondary"
                            : path.difficulty === "Intermediate"
                              ? "default"
                              : "destructive"
                        }
                      >
                        {path.difficulty}
                      </Badge>
                    </div>

                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-medium text-foreground">Target Outcome:</p>
                      <p className="text-sm text-muted-foreground">{path.goal}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 py-4 border-y border-border">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <Clock className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-foreground text-sm">{path.duration}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <Users className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-foreground text-sm">
                          {(path.enrollments / 1000).toFixed(1)}K+
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-foreground text-sm">{path.completionRate}%</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Key Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {path.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-blue-500 font-semibold">
                        <Zap className="h-4 w-4" />
                        {path.azrReward} AZR
                      </div>
                      <Button size="sm">Explore Path</Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
