"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UbuntuEngine } from "@/lib/ubuntu-engine"

export default function UbuntuPage() {
  const [showCalculator, setShowCalculator] = useState(false)

  // Example collaborators
  const collaborators = [
    { userId: "user1", name: "Amara", contribution: 85, role: "learner" as const },
    { userId: "user2", name: "Kwame", contribution: 90, role: "educator" as const },
    { userId: "user3", name: "Zainab", contribution: 75, role: "mentor" as const },
    { userId: "user4", name: "Omar", contribution: 80, role: "developer" as const },
  ]

  const calculateExampleEarning = () => {
    return UbuntuEngine.calculateIndividualEarning(100, 50, 4, 1.3).toFixed(0)
  }

  const calculateExampleMultiplier = () => {
    const contributions = collaborators.map((c) => c.contribution)
    return UbuntuEngine.calculateCollectiveMultiplier(contributions, 85, 88).toFixed(2)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Ubuntu Economics Engine</h1>
          <p className="text-slate-400 text-lg">Individual Success = f(Collective Success)</p>
        </div>

        {/* Core Principle */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">The Ubuntu Formula</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-700 p-6 rounded-lg mb-6">
              <code className="text-blue-300 text-lg font-mono">
                Individual Value = Base × (1 + Collective Impact) × Network Multiplier
              </code>
            </div>
            <p className="text-slate-300 mb-4">
              Unlike traditional economics that optimize for individual gain, Ubuntu Economics recognizes that
              individual prosperity is impossible without collective prosperity. Everyone succeeds together or struggles
              alone.
            </p>
          </CardContent>
        </Card>

        {/* Collaborator Network */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Active Network Cluster</CardTitle>
            <CardDescription className="text-slate-400">Real-time collaborative earning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {collaborators.map((collab) => (
                <div key={collab.userId} className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">{collab.name}</h3>
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">{collab.role}</span>
                  </div>
                  <div className="space-y-1 text-slate-400 text-sm">
                    <p>
                      Contribution: <span className="text-green-400 font-semibold">{collab.contribution}/100</span>
                    </p>
                    <p>
                      Individual Earning:{" "}
                      <span className="text-orange-400 font-semibold">{calculateExampleEarning()} AZR</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ubuntu Multiplier */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Collective Multiplier</CardTitle>
            <CardDescription className="text-slate-400">What everyone gains from working together</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-8 rounded-lg text-center">
              <p className="text-slate-300 mb-2">Network Multiplier (with 4 collaborators)</p>
              <p className="text-6xl font-bold text-purple-300">{calculateExampleMultiplier()}x</p>
              <p className="text-slate-300 mt-4">
                Each person earns {calculateExampleMultiplier()}x more than working alone
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
