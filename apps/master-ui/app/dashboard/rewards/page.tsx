"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockRewardsStats, mockTransactions, mockCredentials } from "@/lib/blockchain-data"
import {
  Zap,
  TrendingUp,
  Award,
  Copy,
  ExternalLink,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"

export default function RewardsPage() {
  const { user } = useAuth()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="border-b border-border bg-gradient-to-b from-blue-500/5 to-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">AZR Token Rewards</h1>
          <p className="text-lg text-muted-foreground">
            Track your earnings, manage your balance, and view transaction history
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Stats Cards */}
          <div className="grid gap-6 mb-8 md:grid-cols-4">
            <Card className="border-border p-6 bg-gradient-to-br from-blue-500/10 to-transparent">
              <div className="flex items-start justify-between mb-4">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-foreground mb-2">{mockRewardsStats.currentBalance}</p>
              <p className="text-xs text-blue-600">Available to use</p>
            </Card>

            <Card className="border-border p-6 bg-gradient-to-br from-green-500/10 to-transparent">
              <div className="flex items-start justify-between mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-foreground mb-2">{mockRewardsStats.totalEarned}</p>
              <p className="text-xs text-green-600">Lifetime earnings</p>
            </Card>

            <Card className="border-border p-6 bg-gradient-to-br from-purple-500/10 to-transparent">
              <div className="flex items-start justify-between mb-4">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">This Month</p>
              <p className="text-3xl font-bold text-foreground mb-2">{mockRewardsStats.thisMonth}</p>
              <p className="text-xs text-purple-600">January earnings</p>
            </Card>

            <Card className="border-border p-6 bg-gradient-to-br from-yellow-500/10 to-transparent">
              <div className="flex items-start justify-between mb-4">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-bold text-foreground mb-2">{mockRewardsStats.pendingRewards}</p>
              <p className="text-xs text-yellow-600">Under verification</p>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="verified">Verified Credentials</TabsTrigger>
              <TabsTrigger value="how-to-earn">How to Earn</TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-4">
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  tx.type === "earning" ? "bg-green-500/10" : "bg-blue-500/10"
                                }`}
                              >
                                {tx.type === "earning" || tx.type === "referral" ? (
                                  <ArrowDownLeft
                                    className={`h-4 w-4 ${tx.type === "earning" ? "text-green-600" : "text-blue-500"}`}
                                  />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4 text-orange-500" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-foreground capitalize">{tx.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground max-w-xs truncate">{tx.description}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`font-semibold ${tx.type === "earning" || tx.type === "referral" ? "text-green-600" : "text-red-600"}`}
                            >
                              {tx.type === "earning" || tx.type === "referral" ? "+" : "-"}
                              {tx.amount}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={tx.status === "completed" ? "secondary" : "outline"}>
                              {tx.status === "completed" ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Verified Credentials Tab */}
            <TabsContent value="verified" className="space-y-4">
              {mockCredentials.length === 0 ? (
                <Card className="border-border p-12 text-center">
                  <Award className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No verified credentials yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Upload your certificates to get them verified on the blockchain
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/verify-credential">Verify Your First Credential</Link>
                  </Button>
                </Card>
              ) : (
                mockCredentials.map((cred) => (
                  <Card key={cred.id} className="border-border p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{cred.issuer}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Verified on {new Date(cred.verificationDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-2xl font-bold text-blue-500 mb-1">
                          <Zap className="h-6 w-6" />
                          {cred.azrReward}
                        </div>
                        <p className="text-xs text-muted-foreground">AZR Earned</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 pb-4 border-b border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Certificate Number</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-3 py-1 rounded font-mono text-foreground">
                            {cred.certificateNumber}
                          </code>
                          <button
                            onClick={() => copyToClipboard(cred.certificateNumber)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Blockchain Transaction</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-3 py-1 rounded font-mono text-foreground truncate">
                            {cred.blockchainTxHash}
                          </code>
                          <button className="text-blue-500 hover:text-blue-600 flex-shrink-0">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        Download Certificate
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        Share Credential
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* How to Earn Tab */}
            <TabsContent value="how-to-earn">
              <Card className="border-border p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6">How to Earn AZR Tokens</h3>
                <div className="space-y-4">
                  {[
                    {
                      action: "Complete a Qualification",
                      reward: "100 - 25,000 AZR",
                      description: "Earn tokens based on the difficulty and impact of the qualification you complete",
                    },
                    {
                      action: "Verify Credential on Blockchain",
                      reward: "500 - 5,000 AZR",
                      description: "Get additional rewards when you verify your credentials on the blockchain",
                    },
                    {
                      action: "Complete a Learning Path",
                      reward: "5,000 - 20,000 AZR",
                      description: "Finish entire learning paths aligned with career goals for significant rewards",
                    },
                    {
                      action: "Refer a Friend",
                      reward: "1,000 AZR",
                      description: "Earn 1,000 AZR for each friend who joins Azora Sapiens using your referral link",
                    },
                    {
                      action: "Contribute to Community",
                      reward: "100 - 2,000 AZR",
                      description: "Help other learners, share resources, and contribute to the community",
                    },
                    {
                      action: "Participate in Challenges",
                      reward: "500 - 10,000 AZR",
                      description: "Join monthly learning challenges and compete for bonus rewards",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 flex-shrink-0">
                        <Zap className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{item.action}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge>{item.reward}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
