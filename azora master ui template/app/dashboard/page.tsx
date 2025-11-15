"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Award, Zap, BookOpen, Target, LogOut, Settings, Bell, Search } from "lucide-react"
import { RecommendationsWidget } from "./recommendations"
import { RewardsTab } from "./rewards-tab"

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Dashboard Header */}
      <section className="border-b border-border bg-gradient-to-r from-blue-500/5 to-purple-500/5 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.name}!</h1>
              <p className="text-muted-foreground">
                Member since {new Date(user.joinedDate).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Stats cards */}
          <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border p-6 bg-gradient-to-br from-blue-500/10 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">AZR Balance</p>
                  <p className="text-3xl font-bold text-foreground">{user.azrBalance}</p>
                  <p className="text-xs text-blue-600 mt-1">+100 this month</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Verified Credentials</p>
                  <p className="text-3xl font-bold text-foreground">{user.verifiedCredentials}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Role</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{user.role}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Saved Paths</p>
                  <p className="text-3xl font-bold text-foreground">{user.savePath?.length || 0}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                  <Target className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="learning">My Learning</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-border p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button asChild>
                        <Link href="/explore">
                          <Search className="h-4 w-4 mr-2" />
                          Explore Qualifications
                        </Link>
                      </Button>
                      <Button variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/dashboard/verify-credential">
                          <Award className="h-4 w-4 mr-2" />
                          Verify Credential
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/dashboard/rewards">
                          <Zap className="h-4 w-4 mr-2" />
                          View Rewards
                        </Link>
                      </Button>
                    </div>
                  </Card>

                  <Card className="border-border p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                            <Award className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Account Created</p>
                            <p className="text-sm text-muted-foreground">Today</p>
                          </div>
                        </div>
                        <Badge>New</Badge>
                      </div>
                      <p className="text-center text-muted-foreground py-8">
                        Your activity will appear here as you explore and learn
                      </p>
                    </div>
                  </Card>
                </div>

                <RecommendationsWidget userRole={user.role} interests={["technology", "business"]} />
              </div>
            </TabsContent>

            {/* Learning Tab */}
            <TabsContent value="learning">
              <Card className="border-border p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No active learning paths</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring qualifications to begin your learning journey
                </p>
                <Button asChild>
                  <Link href="/explore">Explore Qualifications</Link>
                </Button>
              </Card>
            </TabsContent>

            {/* Credentials Tab */}
            <TabsContent value="credentials">
              <Card className="border-border p-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No verified credentials yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your certificates or complete learning paths to earn credentials
                </p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/verify-credential">Verify Credential</Link>
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="rewards">
              <RewardsTab />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
