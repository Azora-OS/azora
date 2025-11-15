"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { workspaceService } from "@/lib/azora-services"

export default function WorkspacePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"inbox" | "compose" | "files">("inbox")
  const [emails, setEmails] = useState([
    {
      id: 1,
      from: "nolundi.ngwenya@azora.world",
      subject: "Welcome to Azora Workspace",
      date: "2025-01-08",
      read: false,
      body: "Welcome to Azora Workspace...",
    },
    {
      id: 2,
      from: "hello@azora.world",
      subject: "Zero-Rated Email Setup Complete",
      date: "2025-01-07",
      read: true,
      body: "Your zero-rated email...",
    },
  ])
  const [composeData, setComposeData] = useState({ to: "", subject: "", body: "" })
  const [sending, setSending] = useState(false)

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const result = await workspaceService.sendEmail(composeData.to, composeData.subject, composeData.body)
      console.log("[v0] Email sent:", result)
      setEmails([
        {
          id: emails.length + 1,
          from: user?.email || "unknown@azora.world",
          subject: `Re: ${composeData.subject}`,
          date: new Date().toISOString().split("T")[0],
          read: true,
          body: composeData.body,
        },
        ...emails,
      ])
      setComposeData({ to: "", subject: "", body: "" })
      alert("Email sent successfully!")
    } catch (error) {
      console.error("[v0] Email send error:", error)
      alert("Failed to send email")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Azora Workspace</h1>
          <p className="text-slate-300">Zero-Rated Email & Collaboration Platform</p>
          <p className="text-sm text-slate-400 mt-2">Your email: {user?.email || "user@azora.world"}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-600">
          {(["inbox", "compose", "files"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold border-b-2 transition ${
                activeTab === tab
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab === "inbox" ? "Inbox" : tab === "compose" ? "Compose" : "Files"}
            </button>
          ))}
        </div>

        {/* Inbox */}
        {activeTab === "inbox" && (
          <div className="space-y-3">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`p-4 rounded-lg border cursor-pointer transition ${
                  email.read
                    ? "bg-slate-700/30 border-slate-600 hover:border-slate-500"
                    : "bg-blue-500/10 border-blue-500/50 hover:border-blue-400"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{email.from}</p>
                    <p className="text-slate-300 mt-1">{email.subject}</p>
                    <p className="text-slate-500 text-sm mt-2">{email.body.substring(0, 100)}...</p>
                  </div>
                  <span className="text-slate-400 text-sm ml-4 flex-shrink-0">{email.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compose */}
        {activeTab === "compose" && (
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 max-w-2xl">
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">To</label>
                <input
                  type="email"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  placeholder="recipient@azora.world"
                  className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Subject</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  placeholder="Email subject"
                  className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Message</label>
                <textarea
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  placeholder="Your message here..."
                  className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400 h-32 resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Email (Zero-Rated)"}
              </button>
            </form>
          </div>
        )}

        {/* Files */}
        {activeTab === "files" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Azora Constitution.pdf", size: "2.4 MB", date: "2025-01-08", type: "Document" },
              { name: "Mining Guide.pdf", size: "1.8 MB", date: "2025-01-07", type: "Guide" },
              { name: "Blockchain Basics.zip", size: "45.2 MB", date: "2025-01-06", type: "Archive" },
            ].map((file) => (
              <div
                key={file.name}
                className="p-4 rounded-lg border border-slate-600 bg-slate-700/30 hover:bg-slate-700/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-600 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{file.name}</p>
                    <p className="text-slate-400 text-xs">{file.size}</p>
                  </div>
                </div>
                <p className="text-slate-500 text-xs">
                  {file.date} • {file.type}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-12 bg-blue-500/10 border border-blue-500/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">Zero-Rated Email Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-white mb-1">Offline-First</p>
              <p>Send and receive emails offline with automatic sync when back online</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Zero Data Costs</p>
              <p>Compressed responses and smart caching eliminate data charges for African users</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Secure & Private</p>
              <p>End-to-end encryption with complete data sovereignty in Africa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
