"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { coursesData } from "@/lib/courses-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLevel, setSelectedLevel] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const categories = ["All", ...new Set(coursesData.map((c) => c.category))]
  const levels = ["All", ...new Set(coursesData.map((c) => c.level))]

  const filteredCourses = useMemo(() => {
    return coursesData.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory
      const matchesLevel = selectedLevel === "All" || course.level === selectedLevel
      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [searchQuery, selectedCategory, selectedLevel])

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Explore World-Class Courses</h1>
          <p className="text-lg text-muted-foreground">
            {filteredCourses.length} courses available • Learn from industry experts
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="mb-6">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "default" : "outline"}
                className="flex-1"
              >
                Grid
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "default" : "outline"}
                className="flex-1"
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Courses Grid/List */}
        {filteredCourses.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div
                  className={`group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full ${viewMode === "list" ? "flex gap-4 p-4" : ""}`}
                >
                  {/* Course Image */}
                  <div
                    className={`${viewMode === "list" ? "w-40 flex-shrink-0" : "w-full"} h-40 bg-muted overflow-hidden`}
                  >
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Course Info */}
                  <div className={`${viewMode === "list" ? "flex-1" : "p-4"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                        {course.category}
                      </span>
                      <span className="text-xs font-medium text-yellow-500">★ {course.rating}</span>
                    </div>

                    <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{course.title}</h3>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.instructor}</p>

                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-muted-foreground">{course.duration}</span>
                      <span className="text-muted-foreground">{course.students.toLocaleString()} students</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <div className="text-lg font-bold text-foreground">${course.price}</div>
                        <div className="text-xs text-accent-foreground">+{course.azrReward} AZR</div>
                      </div>
                      <Button size="sm" variant="default">
                        View Course
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No courses found matching your filters.</p>
          </div>
        )}
      </div>
    </main>
  )
}
