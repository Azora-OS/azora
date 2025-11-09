"use client"

import { GlassCard } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AzoraLogo } from "@/components/azora-logo"
import { CheckCircle, Circle, Lock, TrendingUp, Award, Zap } from "lucide-react"

const paths = [
  {
    id: 1,
    title: "Constitutional AI Engineer",
    description: "Master AI development with Ubuntu principles",
    duration: "6 months",
    courses: 8,
    azr: 5000,
    students: 3200,
    color: "from-blue-500 via-purple-500 to-pink-500",
    steps: [
      { title: "AI Fundamentals", status: "completed", azr: 500 },
      { title: "Constitutional Design", status: "current", azr: 600 },
      { title: "Ubuntu Integration", status: "locked", azr: 700 },
      { title: "Elara Development", status: "locked", azr: 800 },
    ]
  },
  {
    id: 2,
    title: "Blockchain Sovereignty Specialist",
    description: "Build decentralized systems for African prosperity",
    duration: "5 months",
    courses: 6,
    azr: 4200,
    students: 2800,
    color: "from-blue-500 to-cyan-500",
    steps: [
      { title: "Blockchain Basics", status: "completed", azr: 400 },
      { title: "Smart Contracts", status: "completed", azr: 500 },
      { title: "DeFi Systems", status: "current", azr: 600 },
      { title: "Sovereignty Protocol", status: "locked", azr: 700 },
    ]
  },
]

export default function LearningPathsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <AzoraLogo size={32} showText />
            <Button variant="azora" size="sm">Start Learning</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Your <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Learning Journey</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Structured paths to mastery. Each step multiplies your sovereignty.
          </p>
        </div>

        <div className="space-y-8">
          {paths.map((path) => (
            <GlassCard key={path.id} className="p-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${path.color} flex items-center justify-center mb-4`}>
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{path.title}</h2>
                  <p className="text-slate-400 mb-4">{path.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Duration</span>
                      <span className="text-white">{path.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Rewards</span>
                      <span className="text-emerald-400 font-semibold">{path.azr} AZR</span>
                    </div>
                  </div>

                  <Button variant="azora" className="w-full">Start Path</Button>
                </div>

                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-6">Learning Steps</h3>
                  <div className="space-y-4">
                    {path.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {step.status === 'completed' && <CheckCircle className="h-6 w-6 text-teal-400" />}
                          {step.status === 'current' && <Circle className="h-6 w-6 text-purple-400 animate-pulse" />}
                          {step.status === 'locked' && <Lock className="h-6 w-6 text-slate-600" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-semibold ${
                              step.status === 'completed' ? 'text-teal-400' :
                              step.status === 'current' ? 'text-white' : 'text-slate-600'
                            }`}>
                              {step.title}
                            </h4>
                            <span className="text-sm font-semibold text-teal-400">{step.azr} AZR</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}
