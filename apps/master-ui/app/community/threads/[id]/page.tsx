"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { forumThreadsData } from "@/lib/forums-data"
import { Button } from "@/components/ui/button"

export default function ThreadPage({ params }: { params: { id: string } }) {
  const [newReply, setNewReply] = useState("")
  const [likes, setLikes] = useState<Record<string, number>>({})
  const router = useRouter()

  const thread = forumThreadsData.find((t) => t.id === params.id)

  if (!thread) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Thread not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </main>
    )
  }

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (newReply.trim()) {
      alert("Reply posted successfully!")
      setNewReply("")
    }
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          ← Back
        </Button>

        {/* Thread Info */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">{thread.title}</h1>
              <p className="text-muted-foreground">
                Started by <span className="font-semibold text-foreground">{thread.author}</span> on{" "}
                {new Date(thread.createdAt).toLocaleDateString()}
              </p>
            </div>
            {thread.isSolved && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold text-sm">Solved</div>
            )}
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground mb-4">
            <span>{thread.views} views</span>
            <span>{thread.replies} replies</span>
            <span>{thread.likes} likes</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {thread.tags.map((tag) => (
              <span key={tag} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Original Post */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex gap-4">
            <img
              src={thread.authorImage || "/placeholder.svg"}
              alt={thread.author}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground">{thread.author}</h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{thread.authorRole}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{new Date(thread.createdAt).toLocaleString()}</p>
              <p className="text-foreground leading-relaxed mb-4">{thread.content}</p>
              <div className="flex gap-4 text-sm">
                <button className="text-muted-foreground hover:text-primary transition-colors">Like</button>
                <button className="text-muted-foreground hover:text-primary transition-colors">Reply</button>
                <button className="text-muted-foreground hover:text-primary transition-colors">Report</button>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-8">
          {thread.posts.map((post) => (
            <div
              key={post.id}
              className={`bg-card border rounded-lg p-6 ${post.isAnswer ? "border-green-500/50 bg-green-50/5" : "border-border"}`}
            >
              <div className="flex gap-4">
                <img
                  src={post.authorImage || "/placeholder.svg"}
                  alt={post.author}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{post.author}</h4>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{post.authorRole}</span>
                    {post.isAnswer && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Marked as Solution</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{new Date(post.createdAt).toLocaleString()}</p>
                  <p className="text-foreground leading-relaxed mb-4">{post.content}</p>
                  <div className="flex gap-4 text-sm">
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                      Like ({post.likes})
                    </button>
                    <button className="text-muted-foreground hover:text-primary transition-colors">Reply</button>
                    {post.isAnswer && (
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        Mark Unhelpful
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Write a Reply</h3>
          <form onSubmit={handleReply}>
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Share your thoughts or solution..."
              rows={5}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground mb-4 resize-none"
            />
            <div className="flex gap-2">
              <Button type="submit">Post Reply</Button>
              <Button type="button" variant="outline" onClick={() => setNewReply("")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
