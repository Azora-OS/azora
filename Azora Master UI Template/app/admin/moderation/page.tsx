"use client"

import { useState } from "react"
import { moderationItemsData } from "@/lib/admin-data"
import { Button } from "@/components/ui/button"

export default function ModerationPage() {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSeverity, setSelectedSeverity] = useState("all")

  const filteredItems = moderationItemsData.filter((item) => {
    const statusMatch = selectedStatus === "all" || item.status === selectedStatus
    const severityMatch = selectedSeverity === "all" || item.severity === selectedSeverity
    return statusMatch && severityMatch
  })

  const handleApprove = (id: string) => {
    alert("Content approved and restored")
  }

  const handleReject = (id: string) => {
    alert("Content rejected and removed")
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <h1 className="text-3xl font-bold text-foreground mb-2">Moderation Queue</h1>
        <p className="text-muted-foreground mb-6">Review and moderate flagged content</p>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Title</p>
                  <p className="font-semibold text-foreground">{item.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="text-foreground">{item.type.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Severity</p>
                  <p
                    className={`font-bold ${
                      item.severity === "high"
                        ? "text-red-600"
                        : item.severity === "medium"
                          ? "text-yellow-600"
                          : "text-blue-600"
                    }`}
                  >
                    {item.severity.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="mb-4 pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground">Reported by:</span> {item.reportedBy}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground">Author:</span> {item.author}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Reason:</span> {item.reason}
                </p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleApprove(item.id)}>
                  Approve & Restore
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleReject(item.id)}>
                  Reject & Remove
                </Button>
                <Button size="sm" variant="outline">
                  Dismiss Report
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items to moderate</p>
          </div>
        )}
      </div>
    </main>
  )
}
