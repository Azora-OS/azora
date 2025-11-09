"use client"

import { ServiceLogo, MiningIcon, colors } from '@azora/branding'
import { TrendingUp, Zap, Shield, Coins } from 'lucide-react'

export default function MintDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <ServiceLogo service="mint" size={40} animated />
            <div>
              <h1 className="text-xl font-bold">Azora Mint</h1>
              <p className="text-sm text-muted-foreground">Financial Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <MiningIcon type="status" name="active" size={32} animated />
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className="font-bold">1,247.89 AZR</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-4">
              <MiningIcon type="algorithm" name="azr" size={48} />
              <div>
                <div className="text-2xl font-bold">1,247.89</div>
                <div className="text-sm text-muted-foreground">AZR Balance</div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-4">
              <MiningIcon type="status" name="earning" size={48} />
              <div>
                <div className="text-2xl font-bold">+12.47</div>
                <div className="text-sm text-muted-foreground">Daily Earnings</div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-4">
              <MiningIcon type="multiplier" name="3x" size={48} />
              <div>
                <div className="text-2xl font-bold">3.2x</div>
                <div className="text-sm text-muted-foreground">Multiplier</div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-4">
              <MiningIcon type="power-mode" name="turbo" size={48} />
              <div>
                <div className="text-2xl font-bold">Turbo</div>
                <div className="text-sm text-muted-foreground">Power Mode</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Mining Algorithms</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <MiningIcon type="algorithm" name="azr" size={40} animated />
                <div>
                  <div className="font-medium">AZR Mining</div>
                  <div className="text-sm text-muted-foreground">Active • 24.7 AZR/day</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <MiningIcon type="algorithm" name="erg" size={40} />
                <div>
                  <div className="font-medium">ERG Mining</div>
                  <div className="text-sm text-muted-foreground">Paused • 0 ERG/day</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <Zap className="h-5 w-5" />
                Start Mining
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted">
                <TrendingUp className="h-5 w-5" />
                View Analytics
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted">
                <Shield className="h-5 w-5" />
                Security Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}