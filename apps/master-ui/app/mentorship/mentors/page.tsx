"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { mentorsData } from "@/lib/mentors-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExpertise, setSelectedExpertise] = useState("all")
  const [maxRate, setMaxRate] = useState(150)

  const allExpertise = Array.from(new Set(mentorsData.flatMap((m) => m.expertise))).sort()

  const filteredMentors = useMemo(() => {
    return mentorsData.filter((mentor) => {
      const matchesSearch =
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.expertise.some((exp) => exp.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesExpertise = selectedExpertise === "all" || mentor.expertise.includes(selectedExpertise)
      const matchesRate = mentor.hourlyRate <= maxRate
      return matchesSearch && matchesExpertise && matchesRate
    })
  }, [searchQuery, selectedExpertise, maxRate])

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Find Your Perfect Mentor</h1>
          <p className="text-lg text-muted-foreground">Connect with verified experts to accelerate your learning</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="mb-6">
            <Input
              placeholder="Search mentors or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Expertise</label>
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Expertise</option>
                {allExpertise.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Max Hourly Rate: ${maxRate}</label>
              <input
                type="range"
                min="25"
                max="150"
                value={maxRate}
                onChange={(e) => setMaxRate(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Link key={mentor.id} href={`/mentorship/mentors/${mentor.id}`}>
              <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all h-full">
                {/* Header with Image */}
                <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 flex flex-col items-center">
                  <img
                    src={mentor.image || "/placeholder.svg"}
                    alt={mentor.name}
                    className="w-20 h-20 rounded-full border-4 border-background mb-2"
                  />
                  {mentor.verified && (
                    <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">Verified Expert</div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-foreground mb-1">{mentor.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{mentor.title}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <span className="font-bold text-foreground">{mentor.rating}</span>
                    <span className="text-yellow-500">★</span>
                    <span className="text-muted-foreground">({mentor.reviewCount} reviews)</span>
                  </div>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {mentor.expertise.slice(0, 3).map((exp) => (
                      <span key={exp} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {exp}
                      </span>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        +{mentor.expertise.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm mb-4 pb-4 border-b border-border">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">{mentor.yearsExperience}y</span> experience
                    </p>
                    <p className="text-muted-foreground">
                      Response: <span className="font-medium text-foreground">{mentor.responseTime}</span>
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">{mentor.mentees}</span> active mentees
                    </p>
                  </div>

                  {/* Rate and Button */}
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-foreground">${mentor.hourlyRate}/hr</div>
                    <Button size="sm">Book Session</Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No mentors found matching your criteria.</p>
          </div>
        )}
      </div>
    </main>
  )
}
