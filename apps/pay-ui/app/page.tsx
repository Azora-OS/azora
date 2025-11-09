"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/button"
import { ServiceLogo } from "@/components/service-logo"
import { Wallet, Send, TrendingUp, Shield } from "lucide-react"

export default function PayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950 to-yellow-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <ServiceLogo service="pay" size={40} />
              <span className="text-xl font-bold text-white">Azora Pay</span>
            </div>
            <Button variant="pay" size="sm">Send AZR</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Sovereign <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">Payments</span>
          </h1>
          <p className="text-2xl text-slate-300 mb-8">
            Your financial freedom. Your constitutional right.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-white text-2xl">AZR Balance</CardTitle>
              <CardDescription>Your sovereign currency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-amber-400 mb-6">2,450 AZR</div>
              <div className="flex gap-3">
                <Button variant="pay" className="flex-1"><Send className="h-4 w-4 mr-2" />Send</Button>
                <Button variant="ubuntu" className="flex-1"><Wallet className="h-4 w-4 mr-2" />Receive</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Total Earned', value: '12,450 AZR', icon: TrendingUp, color: 'text-green-400' },
                { label: 'Total Spent', value: '10,000 AZR', icon: Send, color: 'text-blue-400' },
                { label: 'Transactions', value: '156', icon: Wallet, color: 'text-purple-400' },
                { label: 'Security Score', value: '99.9%', icon: Shield, color: 'text-amber-400' },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-slate-400">{stat.label}</span>
                  </div>
                  <span className="text-white font-semibold">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: 'Received', amount: '+500 AZR', from: 'Course Completion', time: '2 hours ago' },
                { type: 'Sent', amount: '-50 AZR', from: 'Course Enrollment', time: '1 day ago' },
                { type: 'Received', amount: '+300 AZR', from: 'Mining Rewards', time: '2 days ago' },
              ].map((tx, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <div className="text-white font-semibold">{tx.type}</div>
                    <div className="text-sm text-slate-400">{tx.from}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${tx.type === 'Received' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount}
                    </div>
                    <div className="text-xs text-slate-400">{tx.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
