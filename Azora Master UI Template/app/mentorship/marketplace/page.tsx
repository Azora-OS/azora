"use client"

import { useState } from "react"
import { skillsMarketplaceData } from "@/lib/mentors-data"
import { Button } from "@/components/ui/button"

export default function SkillsMarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("demand")

  const categories = ["all", ...new Set(skillsMarketplaceData.map((s) => s.category))]

  const filteredSkills = skillsMarketplaceData
    .filter((skill) => selectedCategory === "all" || skill.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "demand") {
        const demandOrder = { high: 3, medium: 2, low: 1 }
        return demandOrder[b.demandLevel] - demandOrder[a.demandLevel]
      }
      if (sortBy === "value") return b.azrValue - a.azrValue
      if (sortBy === "trend") return b.marketTrend - a.marketTrend
      return 0
    })

  const getDemandColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Skills Marketplace</h1>
          <p className="text-lg text-muted-foreground">
            Discover high-demand skills and earn AZR tokens by mastering them
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Skills</p>
            <p className="text-2xl font-bold text-foreground">{skillsMarketplaceData.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">High Demand</p>
            <p className="text-2xl font-bold text-foreground">
              {skillsMarketplaceData.filter((s) => s.demandLevel === "high").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Max AZR Value</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.max(...skillsMarketplaceData.map((s) => s.azrValue))}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Avg Trend</p>
            <p className="text-2xl font-bold text-green-600">
              +
              {(skillsMarketplaceData.reduce((a, b) => a + b.marketTrend, 0) / skillsMarketplaceData.length).toFixed(1)}
              %
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)} Category
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="demand">Sort by Demand</option>
            <option value="value">Sort by AZR Value</option>
            <option value="trend">Sort by Market Trend</option>
          </select>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground flex-1">{skill.name}</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getDemandColor(skill.demandLevel)}`}>
                  {skill.demandLevel.toUpperCase()}
                </span>
              </div>

              <p className="text-muted-foreground text-sm mb-4">{skill.description}</p>

              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-1">AZR Reward Value</p>
                <p className="text-3xl font-bold text-primary">{skill.azrValue} AZR</p>
              </div>

              {/* Market Trend */}
              <div className="mb-4 pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground mb-2">Market Trend</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${Math.min(skill.marketTrend, 100)}%` }} />
                  </div>
                  <span className="text-sm font-bold text-green-600">+{skill.marketTrend}%</span>
                </div>
              </div>

              {/* Prerequisites */}
              {skill.prerequisites.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Prerequisites</p>
                  <div className="flex flex-wrap gap-1">
                    {skill.prerequisites.map((prereq) => (
                      <span key={prereq} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full">Start Learning</Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
