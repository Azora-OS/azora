"use client"

import { useState } from "react"
import {
  Database,
  Table,
  Plus,
  Search,
  Download,
  Upload,
  Play,
  ArrowLeft,
  Trash2,
  Edit3,
  Copy,
  Eye,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface TableSchema {
  name: string
  rows: number
  columns: number
  lastUpdated: string
  status: "synced" | "pending" | "error"
}

interface QueryResult {
  id: string
  query: string
  status: "success" | "error"
  duration: string
  rows: number
  timestamp: string
}

const tables: TableSchema[] = [
  { name: "users", rows: 1247, columns: 8, lastUpdated: "2 min ago", status: "synced" },
  { name: "projects", rows: 342, columns: 12, lastUpdated: "5 min ago", status: "synced" },
  { name: "tasks", rows: 5621, columns: 10, lastUpdated: "1 min ago", status: "synced" },
  { name: "sessions", rows: 8934, columns: 6, lastUpdated: "30s ago", status: "pending" },
  { name: "logs", rows: 45231, columns: 5, lastUpdated: "10s ago", status: "synced" },
]

const queryHistory: QueryResult[] = [
  {
    id: "1",
    query: "SELECT * FROM users WHERE role = 'admin'",
    status: "success",
    duration: "45ms",
    rows: 12,
    timestamp: "2 min ago",
  },
  {
    id: "2",
    query: "INSERT INTO tasks (title, user_id) VALUES (...)",
    status: "success",
    duration: "23ms",
    rows: 1,
    timestamp: "5 min ago",
  },
  {
    id: "3",
    query: "UPDATE projects SET status = 'active'",
    status: "success",
    duration: "67ms",
    rows: 34,
    timestamp: "12 min ago",
  },
  {
    id: "4",
    query: "DELETE FROM sessions WHERE expired = true",
    status: "error",
    duration: "12ms",
    rows: 0,
    timestamp: "15 min ago",
  },
]

const sampleData = [
  { id: 1, email: "alex@example.com", name: "Alex Chen", role: "admin", created_at: "2024-01-15" },
  { id: 2, email: "sam@example.com", name: "Sam Wilson", role: "user", created_at: "2024-01-16" },
  { id: 3, email: "jordan@example.com", name: "Jordan Lee", role: "user", created_at: "2024-01-17" },
  { id: 4, email: "taylor@example.com", name: "Taylor Swift", role: "moderator", created_at: "2024-01-18" },
  { id: 5, email: "casey@example.com", name: "Casey Jones", role: "user", created_at: "2024-01-19" },
]

export default function DataForgePage() {
  const [selectedTable, setSelectedTable] = useState<string>("users")
  const [query, setQuery] = useState("SELECT * FROM users LIMIT 10")
  const [activeTab, setActiveTab] = useState("tables")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/workspace"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
                <Database className="w-5 h-5 text-background" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Data Forge</h1>
                <p className="text-xs text-muted-foreground">Database Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1.5" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1.5" />
              Export
            </Button>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-500/90 text-white">
              <Plus className="w-4 h-4 mr-1.5" />
              New Table
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tables */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-24">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tables..."
                    className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2 max-h-[60vh] overflow-auto">
                {tables.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => setSelectedTable(table.name)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedTable === table.name ? "bg-amber-500/10 text-amber-500" : "hover:bg-muted"
                    }`}
                  >
                    <Table className="w-4 h-4" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{table.name}</div>
                      <div className="text-xs text-muted-foreground">{table.rows.toLocaleString()} rows</div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        table.status === "synced"
                          ? "bg-primary"
                          : table.status === "pending"
                            ? "bg-amber-500 animate-pulse"
                            : "bg-destructive"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Query Editor */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Query Editor
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Clock className="w-4 h-4 mr-1.5" />
                    History
                  </Button>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-500/90 text-white">
                    <Play className="w-4 h-4 mr-1.5" />
                    Run Query
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-lg bg-muted border border-border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  placeholder="Enter your SQL query..."
                />
              </div>
            </div>

            {/* Results Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">Results</h2>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                    {sampleData.length} rows
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4 mr-1.5" />
                    Filter
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-1.5" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Created</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sampleData.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono">{row.id}</td>
                        <td className="px-4 py-3 text-sm">{row.email}</td>
                        <td className="px-4 py-3 text-sm font-medium">{row.name}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              row.role === "admin"
                                ? "bg-primary/20 text-primary"
                                : row.role === "moderator"
                                  ? "bg-accent/20 text-accent"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {row.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{row.created_at}</td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Query History */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">Query History</h2>
              </div>
              <div className="divide-y divide-border">
                {queryHistory.map((item) => (
                  <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.status === "success" ? "bg-primary/10" : "bg-destructive/10"
                      }`}
                    >
                      {item.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <code className="text-sm font-mono truncate block">{item.query}</code>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{item.duration}</span>
                        <span>{item.rows} rows</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="w-4 h-4 mr-1.5" />
                      Run Again
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
