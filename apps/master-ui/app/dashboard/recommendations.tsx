"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { generateRecommendations, learningPaths } from "@/lib/learning-paths-data"
import { Lightbulb, TrendingUp, Award } from "lucide-react"

interface RecommendationsProps {
  userRole: string
  interests: string[]
}

export function RecommendationsWidget({ userRole, interests }: RecommendationsProps) {
  const recommendations = generateRecommendations(userRole, interests)
  const recommendedPaths = learningPaths.slice(0, 3)

  return (
    <div className="space-y-6">
      <Card className="border-border p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Personalized Recommendations
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Based on your role and interests, we recommend these qualifications:
        </p>
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{rec.qualification}</p>
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{rec.match}%</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Popular Learning Paths
        </h3>
        <div className="space-y-3">
          {recommendedPaths.map((path) => (
            <Link key={path.id} href={`/learning-paths/${path.id}`} className="block">
              <div className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-foreground text-sm line-clamp-1">{path.title}</p>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {path.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{path.duration}</span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {path.azrReward} AZR
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" asChild>
          <Link href="/learning-paths">View All Paths</Link>
        </Button>
      </Card>
    </div>
  )
}
