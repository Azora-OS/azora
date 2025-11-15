"use client"

import { useState } from "react"
import Link from "next/link"
import { coursesData } from "@/lib/courses-data"
import { Button } from "@/components/ui/button"

export default function MobileCoursesPage() {
  const [sortBy, setSortBy] = useState("popular")

  const sortedCourses = [...coursesData].sort((a, b) => {
    if (sortBy === "popular") return b.students - a.students
    if (sortBy === "rating") return b.rating - a.rating
    if (sortBy === "price") return a.price - b.price
    return 0
  })

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border px-4 py-4">
        <h1 className="text-2xl font-bold text-foreground mb-3">Courses</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Top Rated</option>
          <option value="price">Price: Low to High</option>
        </select>
      </div>

      {/* Course List */}
      <div className="space-y-3 px-4 pt-4">
        {sortedCourses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <div className="bg-card border border-border rounded-lg overflow-hidden active:bg-muted transition-colors">
              {/* Course Image */}
              <div className="w-full h-32 bg-muted overflow-hidden">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Course Info */}
              <div className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 flex-1">{course.title}</h3>
                  <span className="text-xs font-bold text-yellow-500 ml-2">★{course.rating}</span>
                </div>

                <p className="text-xs text-muted-foreground mb-2">{course.instructor}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-foreground">${course.price}</p>
                    <p className="text-xs text-accent-foreground">+{course.azrReward} AZR</p>
                  </div>
                  <Button size="sm">Enroll</Button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
