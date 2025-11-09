"use client"

import { useState } from "react"
import { ledgerService } from "@/lib/azora-services"

export default function LedgerPage() {
  const [contracts, setContracts] = useState<any[]>([
    {
      id: "CTR-001",
      type: "Founder PIVC",
      participant: "Sizwe Ngwenya",
      status: "Signed by Elara Ω",
      date: "2025-01-08",
      hash: "0x7f4e8c2a9b1d3e5f6g7h8i9j0k1l2m3n",
      equity: "12%",
    },
    {
      id: "CTR-002",
      type: "Sapiens Enrollment",
      participant: "Thabo Mokwena",
      status: "Verified",
      date: "2025-01-07",
      hash: "0x9a2b4c6d8e1f3g5h7i9j1k3l5m7n9o1p",
      mining: true,
    },
  ])

  const [selectedContract, setSelectedContract] = useState<any>(null)

  const handleVerifyContract = async (contractId: string) => {
    try {
      const result = await ledgerService.verifyCredential(contractId)
      console.log("[v0] Contract verified:", result)
      alert("Contract verified on blockchain!")
    } catch (error) {
      console.error("[v0] Verification error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Blockchain Ledger</h1>
          <p className="text-slate-300">Immutable Contract & Credential Verification</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contracts List */}
          <div className="lg:col-span-2 space-y-4">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                onClick={() => setSelectedContract(contract)}
                className={`p-6 rounded-lg border cursor-pointer transition ${
                  selectedContract?.id === contract.id
                    ? "bg-cyan-500/10 border-cyan-500"
                    : "bg-slate-700/50 border-slate-600 hover:border-slate-500"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{contract.type}</h3>
                    <p className="text-slate-400 text-sm">{contract.participant}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      contract.status.includes("Signed")
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {contract.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 mb-1">Contract ID</p>
                    <p className="font-mono text-white text-xs break-all">{contract.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Date</p>
                    <p className="text-white">{contract.date}</p>
                  </div>
                </div>

                {contract.equity && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded">
                    <p className="text-yellow-400 text-sm">Equity: {contract.equity}</p>
                  </div>
                )}
                {contract.mining && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/50 rounded">
                    <p className="text-green-400 text-sm">Mining Engines: ACTIVE</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contract Details */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 h-fit">
            {selectedContract ? (
              <>
                <h3 className="text-lg font-bold text-white mb-4">Contract Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Type</p>
                    <p className="text-white font-semibold">{selectedContract.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Participant</p>
                    <p className="text-white">{selectedContract.participant}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Status</p>
                    <p className="text-green-400 font-semibold">{selectedContract.status}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Transaction Hash</p>
                    <p className="font-mono text-cyan-400 text-xs break-all">{selectedContract.hash}</p>
                  </div>
                  <button
                    onClick={() => handleVerifyContract(selectedContract.id)}
                    className="w-full bg-cyan-600 text-white py-2 rounded-lg font-semibold hover:bg-cyan-700 mt-4"
                  >
                    Verify on Blockchain
                  </button>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-center py-8">Select a contract to view details</p>
            )}
          </div>
        </div>

        {/* Ledger Info */}
        <div className="mt-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Blockchain Ledger Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Immutable Records</h3>
              <p className="text-slate-300 text-sm">
                All contracts and credentials are permanently recorded on blockchain
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Elara Signatures</h3>
              <p className="text-slate-300 text-sm">
                Autonomous contract signing by Elara Ω with constitutional compliance
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Transparent Verification</h3>
              <p className="text-slate-300 text-sm">Verify any credential or contract status in real-time</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Global Recognition</h3>
              <p className="text-slate-300 text-sm">Blockchain-verified credentials recognized worldwide</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Data Sovereignty</h3>
              <p className="text-slate-300 text-sm">African-hosted blockchain ensures data remains in Africa</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">PIVC Tracking</h3>
              <p className="text-slate-300 text-sm">Personal Impact Verified Contribution tracked on ledger</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
