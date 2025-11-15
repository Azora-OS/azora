"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { sapiensService } from "@/lib/azora-services"
import { calculateAzrReward, getMiningStats } from "@/lib/mining-engine"

export default function MiningPage() {
  const { user } = useAuth()
  const [miningProfile, setMiningProfile] = useState<any>(null)
  const [proofType, setProofType] = useState<"course-completion" | "quiz" | "project" | "contribution">(
    "course-completion",
  )
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ courseId: "", score: 90 })
  const [recentProofs, setRecentProofs] = useState<any[]>([
    { type: "course-completion", courseId: "blockchain-101", azrEarned: 1500, date: "2025-01-08" },
    { type: "project", courseId: "smart-contracts-project", azrEarned: 5000, date: "2025-01-06" },
    { type: "quiz", courseId: "blockchain-101", azrEarned: 150, date: "2025-01-04" },
  ])

  useEffect(() => {
    const loadMiningProfile = async () => {
      if (user?.email) {
        try {
          const profile = await sapiensService.getSapiensProfile(user.email)
          setMiningProfile(
            profile.data || {
              sapiensId: user.id,
              level: "intermediate",
              program: "blockchain",
              miningPower: 1.8,
              totalAzrEarned: 6650,
              proofsSubmitted: 3,
            },
          )
        } catch (error) {
          console.log("[v0] Using demo mining profile")
        }
      }
    }
    loadMiningProfile()
  }, [user])

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const proof = {
        type: proofType,
        data: formData,
        verificationData: { verified: true, timestamp: new Date().toISOString() },
      }

      const result = await sapiensService.submitKnowledgeProof(user?.email || "", proof)
      console.log("[v0] Knowledge proof submitted:", result)

      // Update local state
      const azrEarned = calculateAzrReward(10, miningProfile?.miningPower || 1.5, proofType)
      const newProof = {
        type: proofType,
        courseId: formData.courseId,
        azrEarned,
        date: new Date().toISOString().split("T")[0],
      }
      setRecentProofs([newProof, ...recentProofs])
      if (miningProfile) {
        setMiningProfile({
          ...miningProfile,
          totalAzrEarned: (miningProfile.totalAzrEarned || 0) + azrEarned,
          proofsSubmitted: (miningProfile.proofsSubmitted || 0) + 1,
        })
      }

      setFormData({ courseId: "", score: 90 })
      alert("Knowledge proof submitted successfully!")
    } catch (error) {
      console.error("[v0] Proof submission error:", error)
      alert("Failed to submit proof")
    } finally {
      setSubmitting(false)
    }
  }

  if (!miningProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white">
        Loading mining profile...
      </div>
    )
  }

  const stats = getMiningStats(miningProfile)
  const MULTIPLIERS = { quiz: 1, contribution: 3, project: 5, "course-completion": 10 }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">Mining Engine</h1>
          <p className="text-slate-300">Proof-of-Knowledge Mining System</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Mining Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total AZR",
                  value: `${miningProfile.totalAzrEarned.toLocaleString()}`,
                  color: "from-yellow-600 to-yellow-400",
                },
                { label: "Mining Power", value: `${stats.miningPower}x`, color: "from-purple-600 to-purple-400" },
                { label: "Proofs", value: miningProfile.proofsSubmitted, color: "from-blue-600 to-blue-400" },
                { label: "Avg/Proof", value: `${stats.averagePerProof}`, color: "from-green-600 to-green-400" },
              ].map((stat) => (
                <div key={stat.label} className={`bg-gradient-to-br ${stat.color} p-0.5 rounded-lg`}>
                  <div className="bg-slate-800 p-4 rounded">
                    <p className="text-slate-400 text-xs font-medium mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mining Profile */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Mining Profile</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">Level</p>
                  <p className="text-lg font-semibold text-white capitalize">{miningProfile.level}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Program</p>
                  <p className="text-lg font-semibold text-white capitalize">{miningProfile.program}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Status</p>
                  <p className="text-lg font-semibold text-green-400">Active Mining</p>
                </div>
              </div>
            </div>

            {/* Proof Submission Form */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Submit Knowledge Proof</h2>
              <form onSubmit={handleProofSubmit} className="space-y-4">
                <select
                  value={proofType}
                  onChange={(e) => setProofType(e.target.value as any)}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white"
                >
                  <option value="quiz">Quiz (1x multiplier)</option>
                  <option value="contribution">Contribution (3x multiplier)</option>
                  <option value="project">Project (5x multiplier)</option>
                  <option value="course-completion">Course Completion (10x multiplier)</option>
                </select>

                <input
                  type="text"
                  placeholder="Course/Project ID"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                  required
                />

                <div>
                  <label className="text-slate-300 text-sm mb-2 block">Score/Rating: {formData.score}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: Number.parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="bg-slate-600/50 p-4 rounded border border-slate-500">
                  <p className="text-sm text-slate-400 mb-2">AZR Reward Calculation:</p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-slate-400">Base Reward:</span>{" "}
                      <span className="text-yellow-400 font-semibold">10 AZR</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Mining Power:</span>{" "}
                      <span className="text-purple-400 font-semibold">{stats.miningPower}x</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Multiplier:</span>{" "}
                      <span className="text-blue-400 font-semibold">{MULTIPLIERS[proofType] as number}x</span>
                    </p>
                    <p className="text-white font-bold pt-2 border-t border-slate-500">
                      Total: {calculateAzrReward(10, Number.parseFloat(stats.miningPower), proofType)} AZR
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !formData.courseId}
                  className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50"
                >
                  {submitting ? "Verifying..." : "Submit Knowledge Proof"}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Recent Proofs */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Recent Proofs</h2>
            <div className="space-y-3">
              {recentProofs.map((proof, idx) => (
                <div key={idx} className="p-3 bg-slate-600/50 rounded border border-slate-500">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-white capitalize">{proof.type.replace("-", " ")}</span>
                    <span className="text-yellow-400 font-bold">{proof.azrEarned} AZR</span>
                  </div>
                  <p className="text-xs text-slate-400">{proof.courseId}</p>
                  <p className="text-xs text-slate-500 mt-1">{proof.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mining Formula Explanation */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">How Mining Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Formula</h3>
              <div className="bg-slate-800 p-4 rounded font-mono text-sm text-slate-300">
                <p className="mb-2">AZR = Base × Mining Power × Multiplier</p>
                <p className="text-xs text-slate-500">Where:</p>
                <p className="text-xs text-slate-400">Base = 10 AZR</p>
                <p className="text-xs text-slate-400">Mining Power = Level × Program</p>
                <p className="text-xs text-slate-400">Multiplier depends on proof type</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Multipliers</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-slate-800 rounded">
                  <span className="text-slate-300">Quiz</span>
                  <span className="text-yellow-400 font-semibold">1x</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800 rounded">
                  <span className="text-slate-300">Contribution</span>
                  <span className="text-yellow-400 font-semibold">3x</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800 rounded">
                  <span className="text-slate-300">Project</span>
                  <span className="text-yellow-400 font-semibold">5x</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-800 rounded">
                  <span className="text-slate-300">Course Completion</span>
                  <span className="text-yellow-400 font-semibold">10x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
