"use client"

import { useState } from "react"
import { UbuntuEconomics } from "@/lib/constitutional-truth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PhilosophyPage() {
  const [selectedPhilosophy, setSelectedPhilosophy] = useState<"truth" | "ubuntu" | "codex">("truth")

  const philosophies = {
    truth: {
      title: "Truth Singularity Principle",
      description: "In a ring of lies, truth stands alone - not because it is rare, but because it is singular",
      principles: [
        "Truth has singular correspondence to reality",
        "Lies have multiple possible correspondences",
        "More lies make truth MORE obvious",
        "Constitutional validation ensures singularity",
        "Cryptographic proof immutable",
      ],
      formula: "Truth = Verifiable + Immutable + Transparent + Constitutional",
    },
    ubuntu: {
      title: "Ubuntu Economics",
      description: "Individual prosperity is impossible without collective prosperity",
      principles: [
        "Individual Success = f(Collective Success)",
        "Collaboration multiplies value 5x",
        "Network effects compound benefits",
        "Truth economically rewarded",
        "Lies economically penalized",
      ],
      formula: "Collective Success = Σ(Individual Contributions × Network Effects)",
    },
    codex: {
      title: "Azora Codex - Constitutional AI OS",
      description: "First operating system built on truth-based economics",
      principles: [
        "Constitutional enforcement without human bias",
        "AI-powered truth verification",
        "Ubuntu principles embedded in code",
        "Transparent governance model",
        "Education creates economic value",
      ],
      formula: "System_Health = Truth_Adherence × Ubuntu_Collaboration × AI_Governance",
    },
  }

  const current = philosophies[selectedPhilosophy]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">The Azora Codex</h1>
          <p className="text-xl text-slate-400">Truth Economics in a World of Information Asymmetry</p>
        </div>

        {/* Philosophy Selector */}
        <div className="flex gap-4 mb-12 justify-center flex-wrap">
          {Object.entries(philosophies).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedPhilosophy(key as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                selectedPhilosophy === key ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {value.title.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Current Philosophy */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-3xl">{current.title}</CardTitle>
            <CardDescription className="text-slate-400 text-lg">{current.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-4">Core Principles</h3>
                <ul className="space-y-2">
                  {current.principles.map((principle, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-300">
                      <span className="text-blue-500 font-bold mt-1">→</span>
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm font-semibold mb-2">FUNDAMENTAL FORMULA</p>
                <code className="text-blue-300 text-lg font-mono">{current.formula}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ubuntu Economics Visualization */}
        {selectedPhilosophy === "ubuntu" && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Ubuntu Multiplier Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm font-semibold mb-2">INDIVIDUAL VALUE</p>
                  <p className="text-3xl font-bold text-green-400">
                    {UbuntuEconomics.calculateIndividualValue(100, 50, 10).toFixed(0)} AZR
                  </p>
                  <p className="text-slate-500 text-xs mt-2">Base: 100 AZR + 50% collective impact + network bonus</p>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm font-semibold mb-2">COLLECTIVE MULTIPLIER</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {UbuntuEconomics.calculateCollectiveMultiplier(1000, 100, 0.8).toFixed(0)}x
                  </p>
                  <p className="text-slate-500 text-xs mt-2">100 users collaborating = powerful network effect</p>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm font-semibold mb-2">UBUNTU SCORE</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {(UbuntuEconomics.calculateIndividualValue(100, 50, 10) * 1.2).toFixed(0)}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">Individual × Collective collaboration bonus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
