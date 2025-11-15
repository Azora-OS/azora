"use client"

import { useState } from "react"
import Link from "next/link"
import { forumThreadsData } from "@/lib/forums-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  const threads = forumThreadsData
    .filter(
      (thread) =>
        thread.category === params.id &&
        (thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thread.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))),
    )
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "popular") return b.views - a.views
      if (sortBy === "active") return b.replies - a.replies
      return 0
    })

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/community/forums" className="text-primary hover:underline text-sm mb-4 inline-block">
            ← Back to Forums
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Discussions</h1>
          <p className="text-muted-foreground">{threads.length} active threads</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Viewed</option>
            <option value="active">Most Active</option>
          </select>
          <Button>New Thread</Button>
        </div>

        {/* Threads List */}
        <div className="space-y-3">
          {threads.length > 0 ? (
            threads.map((thread) => (
              <Link key={thread.id} href={`/community/threads/${thread.id}`}>
                <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:border-primary/50 transition-all">
                  <div className="flex gap-4">
                    {/* Status Indicators */}
                    <div className="flex flex-col gap-2 justify-center">
                      {thread.isPinned && <div className="w-2 h-2 bg-primary rounded-full" title="Pinned" />}
                      {thread.isSolved && (
                        <div
                          className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold"
                          title="Solved"
                        >
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Thread Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                          {thread.title}
                        </h3>
                        {thread.courseId && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap">
                            {thread.courseName}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{thread.content}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {thread.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-6 text-xs text-muted-foreground">
                        <span>{thread.author}</span>
                        <span>{thread.replies} replies</span>
                        <span>{thread.views} views</span>
                        <span>{thread.likes} likes</span>
                        <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No threads found. Be the first to start a discussion!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
