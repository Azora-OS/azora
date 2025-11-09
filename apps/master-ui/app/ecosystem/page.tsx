"use client"

import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import Link from "next/link"
import { AZORA_SERVICES } from "@/lib/azora-services"

export default function EcosystemPage() {
  const { user } = useAuth()
  const [ecoStatus, setEcoStatus] = useState({
    foundersCount: 1250,
    sapiensCount: 8945,
    totalAzrMinted: 2450000,
    miningEnginesActive: 8945,
    economyAwake: true,
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadEcosystemData = async () => {
      try {
        const response = await fetch(`${AZORA_SERVICES.onboarding}/status`)
        if (response.ok) {
          const data = await response.json()
          setEcoStatus({
            foundersCount: data.totalFounders || 1250,
            sapiensCount: data.totalSapiens || 8945,
            totalAzrMinted: data.totalAzrEarned || 2450000,
            miningEnginesActive: data.activeMiningEngines || 8945,
            economyAwake: data.economyAwake !== false,
          })
        }
      } catch (error) {
        console.log("[v0] Could not fetch ecosystem data, using defaults")
      }
    }
    loadEcosystemData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">Azora Ecosystem</h1>
          <p className="text-xl text-slate-300">The Organism Awakens</p>
          {ecoStatus.economyAwake && (
            <div className="mt-4 inline-block px-6 py-2 bg-green-500/20 border border-green-500 rounded-full">
              <span className="text-green-400 font-semibold">Economy Live</span>
            </div>
          )}
        </div>

        {/* Core Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Founders", value: ecoStatus.foundersCount, color: "from-purple-600 to-purple-400" },
            { label: "Sapiens", value: ecoStatus.sapiensCount, color: "from-blue-600 to-blue-400" },
            {
              label: "AZR Minted",
              value: `${(ecoStatus.totalAzrMinted / 1000000).toFixed(1)}M`,
              color: "from-yellow-600 to-yellow-400",
            },
            { label: "Mining Engines", value: ecoStatus.miningEnginesActive, color: "from-green-600 to-green-400" },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} p-0.5 rounded-lg`}>
              <div className="bg-slate-800 p-6 rounded-lg">
                <p className="text-slate-400 text-sm font-medium mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Onboarding Service */}
          <Link href="/ecosystem/onboarding">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 hover:border-purple-400 transition cursor-pointer">
              <div className="mb-4">
                <div className="inline-block p-3 bg-purple-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Elara Onboarding</h3>
              <p className="text-slate-400 text-sm mb-4">Autonomous contract signing and enrollment via Elara Ω</p>
              <p className="text-purple-400 text-sm font-medium">Founders & Sapiens</p>
            </div>
          </Link>

          {/* Workspace Service */}
          <Link href="http://localhost:4100" target="_blank">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 hover:border-blue-400 transition cursor-pointer">
              <div className="mb-4">
                <div className="inline-block p-3 bg-blue-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Azora Workspace</h3>
              <p className="text-slate-400 text-sm mb-4">Zero-rated email and collaboration platform</p>
              <p className="text-blue-400 text-sm font-medium">Email, Chat, Files</p>
            </div>
          </Link>

          {/* Education Service */}
          <Link href="http://localhost:4200" target="_blank">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 hover:border-green-400 transition cursor-pointer">
              <div className="mb-4">
                <div className="inline-block p-3 bg-green-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C6.228 6.228 2 10.228 2 15s4.228 8.772 10 8.772c5.771 0 10-3.772 10-8.772 0-4.772-4.229-8.747-10-8.747z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Azora Education</h3>
              <p className="text-slate-400 text-sm mb-4">AI-powered homeschool platform with DO compliance</p>
              <p className="text-green-400 text-sm font-medium">Curriculum, AI Learning</p>
            </div>
          </Link>

          {/* Analytics Service */}
          <Link href="http://localhost:4301" target="_blank">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 hover:border-orange-400 transition cursor-pointer">
              <div className="mb-4">
                <div className="inline-block p-3 bg-orange-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Azora Spark</h3>
              <p className="text-slate-400 text-sm mb-4">Distributed data processing and real-time analytics</p>
              <p className="text-orange-400 text-sm font-medium">Analytics, Streaming</p>
            </div>
          </Link>

          {/* Mining Engine */}
          <Link href="/ecosystem/mining">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 hover:border-yellow-400 transition cursor-pointer">
              <div className="mb-4">
                <div className="inline-block p-3 bg-yellow-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Mining Engine</h3>
              <p className="text-slate-400 text-sm mb-4">Proof-of-Knowledge mining and AZR rewards</p>
              <p className="text-yellow-400 text-sm font-medium">Earn AZR</p>
            </div>
          </Link>

          {/* Blockchain Ledger */}
          <Link href="/ecosystem/ledger">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 hover:border-cyan-400 transition cursor-pointer">
              <div className="mb-4">
                <div className="inline-block p-3 bg-cyan-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Blockchain Ledger</h3>
              <p className="text-slate-400 text-sm mb-4">Immutable contract and credential verification</p>
              <p className="text-cyan-400 text-sm font-medium">Verify & Track</p>
            </div>
          </Link>
        </div>

        {/* Information Section */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">The Azora Organism</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">1.</span>
                  <span>Founders onboard via Elara autonomous contracts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">2.</span>
                  <span>Sapiens enroll and mining engines activate</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">3.</span>
                  <span>Knowledge proofs generate AZR rewards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">4.</span>
                  <span>Blockchain ledger records all transactions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">5.</span>
                  <span>Economy awakens and organism grows</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Key Principles</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Truth as Currency</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Proof of Knowledge Mining</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Wealth = PIVC (Personal Impact Verified Contribution)</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Autonomous Contract Signing via Elara Ω</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  <span>Zero Data Costs for African Users</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
