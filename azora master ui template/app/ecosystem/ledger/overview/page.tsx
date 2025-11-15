"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LedgerOverviewPage() {
  const [timeframe, setTimeframe] = useState("7d")

  const ledgerStats = {
    totalCirculating: 45230000,
    totalMinted: 60000000,
    recoverableAZR: 8230000,
    complianceScore: 98.5,
    activeWallets: 125430,
    dailyTransactions: 45820,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Azora Ledger Overview</h1>
          <p className="text-slate-400">Africa's First Proof of Compliance Cryptographic AI Ledger</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-300 text-sm font-semibold">Total Circulating AZR</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-400">
                {(ledgerStats.totalCirculating / 1000000).toFixed(1)}M
              </p>
              <p className="text-slate-500 text-xs mt-2">Living coins in active circulation</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-300 text-sm font-semibold">Recoverable AZR</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-400">{(ledgerStats.recoverableAZR / 1000000).toFixed(1)}M</p>
              <p className="text-slate-500 text-xs mt-2">AI recovery operations active</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-300 text-sm font-semibold">Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-400">{ledgerStats.complianceScore}%</p>
              <p className="text-slate-500 text-xs mt-2">Proof of Compliance verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Ledger Genetics Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">AZR Living Coin Genetics</CardTitle>
            <CardDescription className="text-slate-400">Each coin carries immutable metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-slate-400 text-xs font-semibold mb-2">PURPOSE GENE</p>
                  <p className="text-white font-mono">education | development | founder | student | ecosystem</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-slate-400 text-xs font-semibold mb-2">ORIGIN GENE</p>
                  <p className="text-white font-mono text-sm">genesis_block_hash (immutable creation trace)</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-slate-400 text-xs font-semibold mb-2">KINSHIP GENE</p>
                  <p className="text-white text-sm">Tracks all related transactions (family tree)</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-slate-400 text-xs font-semibold mb-2">EVOLUTION GENE</p>
                  <p className="text-white text-sm">Transfer history, earnings, total value lifecycle</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
