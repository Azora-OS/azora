"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AzoraCompletePage() {
  const [activeSystem, setActiveSystem] = useState("overview")

  const ecosystemSystems = [
    {
      id: "constitutional",
      name: "Constitutional Truth",
      icon: "⚖️",
      description: "Truth Singularity & Ubuntu Economics",
      link: "/philosophy",
    },
    {
      id: "ledger",
      name: "AZR Ledger",
      icon: "💾",
      description: "Living Coins with Genetic Metadata",
      link: "/ecosystem/ledger/overview",
    },
    {
      id: "ubuntu",
      name: "Ubuntu Engine",
      icon: "🤝",
      description: "Collective Success Multiplier",
      link: "/ecosystem/ubuntu",
    },
    {
      id: "mining",
      name: "Knowledge Mining",
      icon: "⛏️",
      description: "Proof-of-Knowledge Learning-to-Earn",
      link: "/dashboard/rewards",
    },
    {
      id: "careers",
      name: "Career Pipeline",
      icon: "💼",
      description: "Education-to-Employment",
      link: "/jobs",
    },
    {
      id: "security",
      name: "AI Security",
      icon: "🛡️",
      description: "Constitutional Protection",
      link: "/ecosystem/analytics",
    },
  ]

  const stats = {
    totalStudents: 125430,
    totalLearning: 450230,
    totalAZRMinted: 45230000,
    activeCollaborations: 8940,
    trustScore: 98.5,
    truthVerificationRate: 99.2,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Azora World - Complete Ecosystem</h1>
          <p className="text-xl text-slate-400">
            Constitutional AI OS | Truth Economics | Ubuntu Principles | Africa-First Innovation
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm font-semibold mb-2">Active Students</p>
              <p className="text-4xl font-bold text-green-400">{(stats.totalStudents / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm font-semibold mb-2">AZR Minted</p>
              <p className="text-4xl font-bold text-blue-400">{(stats.totalAZRMinted / 1000000).toFixed(0)}M</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm font-semibold mb-2">Truth Verification</p>
              <p className="text-4xl font-bold text-purple-400">{stats.truthVerificationRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Ecosystem Systems Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Integrated Systems</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {ecosystemSystems.map((system) => (
              <Link key={system.id} href={system.link}>
                <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 cursor-pointer transition h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-2xl">{system.icon}</CardTitle>
                        <p className="text-white font-semibold mt-2">{system.name}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-400">{system.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Azora Vision Statement */}
        <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-0">
          <CardHeader>
            <CardTitle className="text-white text-2xl">The Azora Vision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-100">
            <p>
              Azora World is Africa's first Constitutional AI Operating System built on truth-based economics and Ubuntu
              principles. We are demonstrating that another way is possible.
            </p>
            <p>
              A way where truth stands alone not because it is isolated, but because it is singular and immutable. A way
              where individual success multiplies through collective prosperity. A way where education creates wealth,
              collaboration creates abundance, and constitutional AI ensures that power serves humanity.
            </p>
            <p className="text-orange-300 font-semibold">From Africa, For Humanity, Towards Infinity</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
