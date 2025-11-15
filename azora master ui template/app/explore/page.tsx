"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { qualificationsData, categories, levels, countries } from "@/lib/qualifications-data"
import { Search, Award, Globe, Zap, CheckCircle } from "lucide-react"

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLevel, setSelectedLevel] = useState("All")
  const [selectedCountry, setSelectedCountry] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredQualifications = useMemo(() => {
    return qualificationsData.filter((qual) => {
      const matchesSearch =
        qual.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qual.shortName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qual.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === "All" || qual.category === selectedCategory

      const matchesLevel = selectedLevel === "All" || qual.level === selectedLevel

      const matchesCountry =
        selectedCountry === "All" || qual.country === selectedCountry || qual.recognizedIn?.includes(selectedCountry)

      return matchesSearch && matchesCategory && matchesLevel && matchesCountry
    })
  }, [searchQuery, selectedCategory, selectedLevel, selectedCountry])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-blue-500/5 to-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
              Explore Global Qualifications
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover thousands of qualifications from 180+ countries across 25+ categories
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search qualifications by name, type, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filters */}
          <div className="grid gap-3 md:grid-cols-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                {levels.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1"
              >
                List
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Found <span className="font-semibold text-foreground">{filteredQualifications.length}</span>{" "}
                qualifications
              </p>
            </div>
          </div>

          {filteredQualifications.length === 0 ? (
            <div className="py-12 text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No qualifications found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                  setSelectedLevel("All")
                  setSelectedCountry("All")
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {filteredQualifications.map((qual) => (
                <Link key={qual.id} href={`/explore/${qual.id}`}>
                  <Card
                    className={`h-full border-border p-6 hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer flex flex-col gap-4 ${viewMode === "list" ? "flex-row items-center justify-between" : ""}`}
                  >
                    <div className={`flex-1 ${viewMode === "list" ? "flex items-center gap-4 flex-1" : ""}`}>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 flex-shrink-0 ${viewMode === "list" ? "h-8 w-8" : ""}`}
                      >
                        <Award className="h-5 w-5 text-blue-500" />
                      </div>

                      <div className={`flex-1 ${viewMode === "list" ? "min-w-0" : ""}`}>
                        <div className="flex items-start gap-2 mb-2">
                          <h3
                            className={`font-semibold text-foreground ${viewMode === "list" ? "text-base" : "text-lg"} leading-tight`}
                          >
                            {qual.name}
                          </h3>
                          {qual.shortName && (
                            <Badge variant="secondary" className="flex-shrink-0">
                              {qual.shortName}
                            </Badge>
                          )}
                        </div>

                        <p
                          className={`text-sm text-muted-foreground mb-3 ${viewMode === "list" ? "line-clamp-1" : ""}`}
                        >
                          {qual.issuingBody}
                        </p>

                        {viewMode === "grid" && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{qual.description}</p>
                        )}

                        <div className={`flex flex-wrap gap-2 ${viewMode === "list" ? "hidden sm:flex" : ""}`}>
                          <Badge variant="outline" className="text-xs">
                            {qual.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {qual.level}
                          </Badge>
                          {qual.country && qual.country !== "International" && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {qual.country}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-end gap-2 ${viewMode === "list" ? "flex-col text-right" : "flex-col"}`}>
                      {qual.azrReward && (
                        <div className="flex items-center gap-1 text-sm font-semibold text-blue-500">
                          <Zap className="h-4 w-4" />
                          {qual.azrReward} AZR
                        </div>
                      )}
                      {qual.verifiable && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Verifiable
                        </div>
                      )}
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
