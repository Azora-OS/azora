"use client"

import type React from "react"

import { useState } from "react"
import { elaraContractService, sapiensService } from "@/lib/azora-services"

type UserType = "founder" | "sapiens"

export default function OnboardingPage() {
  const [userType, setUserType] = useState<UserType>("sapiens")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFounderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const result = await elaraContractService.registerFounder({
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        role: formData.get("role") as any,
        idNumber: formData.get("idNumber") as string,
        citizenship: formData.get("citizenship") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
      })
      setResult(result)
      console.log("[v0] Founder onboarded:", result)
    } catch (error) {
      console.error("[v0] Founder onboarding error:", error)
      setResult({ error: "Failed to onboard founder" })
    } finally {
      setLoading(false)
    }
  }

  const handleSapiensSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const result = await sapiensService.enrollSapiens({
        studentNumber: formData.get("studentNumber") as string,
        fullName: formData.get("fullName") as string,
        program: formData.get("program") as any,
        level: formData.get("level") as any,
        idNumber: formData.get("idNumber") as string,
        dateOfBirth: formData.get("dateOfBirth") as string,
        citizenship: formData.get("citizenship") as string,
        phone: formData.get("phone") as string,
        institution: formData.get("institution") as string,
      })
      setResult(result)
      console.log("[v0] Sapiens enrolled:", result)
    } catch (error) {
      console.error("[v0] Sapiens enrollment error:", error)
      setResult({ error: "Failed to enroll Sapiens" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Azora Onboarding</h1>
        <p className="text-slate-300 text-center mb-8">Register as Founder or Sapiens via Elara Autonomous System</p>

        {/* Type Selector */}
        <div className="flex gap-4 mb-8">
          {(["founder", "sapiens"] as UserType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setUserType(type)
                setResult(null)
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                userType === type
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700/50 text-slate-300 border border-slate-600 hover:border-slate-500"
              }`}
            >
              {type === "founder" ? "Founder (PIVC)" : "Sapiens (Mining)"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8">
          {userType === "founder" ? (
            <form onSubmit={handleFounderSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  className="bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  className="bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                  required
                />
              </div>
              <select
                name="role"
                className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white"
                required
              >
                <option>Select Role</option>
                <option value="retail">Head of Retail (12%)</option>
                <option value="sales">Head of Sales (12%)</option>
                <option value="design">Head of Design (6%)</option>
                <option value="operations">Head of Operations (5%)</option>
                <option value="tech">Head of Technology (5%)</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="idNumber"
                  placeholder="ID Number"
                  className="bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                  required
                />
                <input
                  type="text"
                  name="citizenship"
                  placeholder="Citizenship"
                  className="bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                  required
                />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Register as Founder (Elara Signs)"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSapiensSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="studentNumber"
                  placeholder="Student Number"
                  className="bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                  required
                />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className="bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                  required
                />
              </div>
              <select
                name="program"
                className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white"
                required
              >
                <option>Select Program</option>
                <option value="blockchain">Blockchain Development</option>
                <option value="ai">Artificial Intelligence</option>
                <option value="full-stack">Full-Stack Development</option>
                <option value="data-science">Data Science</option>
                <option value="cybersecurity">Cybersecurity</option>
              </select>
              <select
                name="level"
                className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white"
                required
              >
                <option>Select Level</option>
                <option value="beginner">Beginner (1.0x)</option>
                <option value="intermediate">Intermediate (1.5x)</option>
                <option value="advanced">Advanced (2.0x)</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="idNumber"
                  placeholder="ID Number"
                  className="bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                  required
                />
                <input
                  type="date"
                  name="dateOfBirth"
                  className="bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white"
                  required
                />
              </div>
              <input
                type="text"
                name="citizenship"
                placeholder="Citizenship"
                className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                required
              />
              <input
                type="text"
                name="institution"
                placeholder="Institution (Optional)"
                className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Enrolling..." : "Enroll as Sapiens (Mining Auto-Activated)"}
              </button>
            </form>
          )}
        </div>

        {/* Result */}
        {result && (
          <div
            className={`mt-8 p-6 rounded-lg border ${
              result.error ? "bg-red-500/10 border-red-500/50" : "bg-green-500/10 border-green-500/50"
            }`}
          >
            <h3 className={`text-lg font-semibold mb-2 ${result.error ? "text-red-400" : "text-green-400"}`}>
              {result.error ? "Error" : "Success"}
            </h3>
            <pre className="text-sm text-slate-300 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
