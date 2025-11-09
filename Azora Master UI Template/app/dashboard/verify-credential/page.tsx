"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { generateVerificationHash, generateBlockchainTx } from "@/lib/blockchain-data"
import { Upload, CheckCircle, ArrowRight, Zap, Shield } from "lucide-react"

export default function VerifyCredentialPage() {
  const [step, setStep] = useState<"upload" | "verify" | "success">("upload")
  const [formData, setFormData] = useState({
    qualificationName: "",
    certificateNumber: "",
    issuingBody: "",
    issueDate: "",
  })
  const [verificationData, setVerificationData] = useState<any>(null)

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.qualificationName || !formData.certificateNumber || !formData.issuingBody) {
      alert("Please fill in all fields")
      return
    }

    const hash = generateVerificationHash(JSON.stringify(formData))
    const txHash = generateBlockchainTx(JSON.stringify(formData))

    setVerificationData({
      hash,
      txHash,
      credentialNumber: `AZORA-${formData.qualificationName.substring(0, 3).toUpperCase()}-2025-${Math.random().toString().substring(2, 6)}`,
      azrReward: 5000,
    })

    setStep("verify")
  }

  const handleVerify = () => {
    setStep("success")
  }

  if (step === "upload") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <section className="border-b border-border bg-gradient-to-b from-blue-500/5 to-background px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-bold text-foreground mb-2">Verify Your Credential</h1>
            <p className="text-lg text-muted-foreground">Upload and verify your certificate on the blockchain</p>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {[
                { step: 1, title: "Upload Certificate", current: true },
                { step: 2, title: "Verify & Confirm" },
                { step: 3, title: "Blockchain Confirmation" },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${s.current ? "border-blue-500 bg-blue-500/5" : "border-border"}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold text-sm ${s.current ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"}`}
                  >
                    {s.step}
                  </div>
                  <span className={s.current ? "text-foreground font-medium" : "text-muted-foreground"}>{s.title}</span>
                </div>
              ))}
            </div>

            <Card className="border-border p-8">
              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Qualification Name</label>
                  <Input
                    placeholder="e.g., AWS Certified Cloud Architect"
                    value={formData.qualificationName}
                    onChange={(e) => setFormData({ ...formData, qualificationName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Certificate Number</label>
                  <Input
                    placeholder="e.g., AWS-2025-ABC123XYZ"
                    value={formData.certificateNumber}
                    onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Issuing Body</label>
                  <Input
                    placeholder="e.g., Amazon Web Services"
                    value={formData.issuingBody}
                    onChange={(e) => setFormData({ ...formData, issuingBody: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Issue Date</label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  />
                </div>

                <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">Drag certificate file here or click to upload</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, or PNG (Max 10MB)</p>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Continue to Verification
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </div>
    )
  }

  if (step === "verify" && verificationData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <section className="border-b border-border bg-gradient-to-b from-blue-500/5 to-background px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-bold text-foreground mb-2">Verify & Confirm</h1>
            <p className="text-lg text-muted-foreground">Review your credential and confirm blockchain verification</p>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {[
                { step: 1, title: "Upload Certificate", done: true },
                { step: 2, title: "Verify & Confirm", current: true },
                { step: 3, title: "Blockchain Confirmation" },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${s.current ? "border-blue-500 bg-blue-500/5" : s.done ? "border-green-500 bg-green-500/5" : "border-border"}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold text-sm ${s.done ? "bg-green-500 text-white" : s.current ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"}`}
                  >
                    {s.done ? <CheckCircle className="h-5 w-5" /> : s.step}
                  </div>
                  <span className={s.current || s.done ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <Card className="border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Verification Details</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Credential Hash</p>
                    <code className="text-sm bg-muted px-3 py-2 rounded block font-mono text-foreground break-all">
                      {verificationData.hash}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Generated Certificate Number</p>
                    <code className="text-sm bg-muted px-3 py-2 rounded block font-mono text-foreground">
                      {verificationData.credentialNumber}
                    </code>
                  </div>
                </div>
              </Card>

              <Card className="border-border p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                    <Zap className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">AZR Reward</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      You'll earn <span className="font-semibold text-blue-500">{verificationData.azrReward} AZR</span>{" "}
                      upon successful verification
                    </p>
                    <Badge className="bg-blue-500">Estimated Reward</Badge>
                  </div>
                </div>
              </Card>

              <Card className="border-border p-6 border-green-500/30 bg-green-500/5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Blockchain Verification</h3>
                    <p className="text-muted-foreground text-sm">
                      Your credential will be permanently stored on the blockchain with a unique hash
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/verify-credential">Back</Link>
                </Button>
                <Button size="lg" onClick={handleVerify}>
                  Confirm Verification
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b border-border bg-gradient-to-b from-green-500/5 to-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">Verification Complete!</h1>
          <p className="text-lg text-muted-foreground">
            Your credential has been successfully verified on the blockchain
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {[
              { step: 1, title: "Upload Certificate", done: true },
              { step: 2, title: "Verify & Confirm", done: true },
              { step: 3, title: "Blockchain Confirmation", done: true },
            ].map((s) => (
              <div
                key={s.step}
                className="flex items-center gap-3 p-4 rounded-lg border border-green-500/30 bg-green-500/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-semibold text-sm">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-foreground font-medium">{s.title}</span>
              </div>
            ))}
          </div>

          <Card className="border-border p-8 text-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Credential Verified!</h2>
            <p className="text-muted-foreground mb-6">
              Your credential is now permanently stored on the blockchain and verified globally
            </p>

            <div className="space-y-4 mb-6">
              <div className="rounded-lg border border-border p-4 text-left">
                <p className="text-sm text-muted-foreground mb-1">Certificate Number</p>
                <p className="font-semibold text-foreground">{verificationData?.credentialNumber}</p>
              </div>

              <div className="rounded-lg border border-border p-4 text-left">
                <p className="text-sm text-muted-foreground mb-1">Blockchain Transaction</p>
                <p className="font-mono text-sm text-foreground break-all">{verificationData?.txHash}</p>
              </div>

              <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-foreground">AZR Reward</span>
                </div>
                <p className="text-2xl font-bold text-blue-500 mb-1">+{verificationData?.azrReward}</p>
                <p className="text-sm text-muted-foreground">Added to your balance (pending confirmation)</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/rewards">View All Rewards</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
