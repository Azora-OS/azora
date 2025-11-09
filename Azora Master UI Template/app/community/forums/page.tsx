"use client"

import { useState } from "react"
import Link from "next/link"
import { forumCategories } from "@/lib/forums-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForumsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCategories = forumCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Community Forums</h1>
          <p className="text-lg text-muted-foreground">Connect with learners, ask questions, and share knowledge</p>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            placeholder="Search forums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button className="md:w-auto">Create New Thread</Button>
        </div>

        {/* Forum Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((category) => (
            <Link key={category.id} href={`/community/forums/${category.id}`}>
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{category.icon}</div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">{category.threads.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">threads</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">{category.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{category.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">{category.members.toLocaleString()} members</div>
                  <div className="text-xs text-muted-foreground">
                    Active: {new Date(category.lastActivity).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
