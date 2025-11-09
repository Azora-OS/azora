"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function UsersManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Sample user data for display
  const users = [
    {
      id: "1",
      name: "Amina Ibrahim",
      email: "amina@example.com",
      role: "student",
      status: "active",
      joined: "2024-01-15",
      courses: 5,
    },
    {
      id: "2",
      name: "Dr. Amara Okafor",
      email: "amara@example.com",
      role: "educator",
      status: "active",
      joined: "2023-11-20",
      courses: 3,
    },
    {
      id: "3",
      name: "Kwame Mensah",
      email: "kwame@example.com",
      role: "educator",
      status: "active",
      joined: "2024-02-01",
      courses: 2,
    },
    {
      id: "4",
      name: "Zainab Hassan",
      email: "zainab@example.com",
      role: "mentor",
      status: "active",
      joined: "2024-03-10",
      courses: 1,
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <h1 className="text-3xl font-bold text-foreground mb-6">User Management</h1>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 font-semibold text-foreground">Name</th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">Email</th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">Role</th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">Joined</th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-foreground">{user.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{user.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        Suspend
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
