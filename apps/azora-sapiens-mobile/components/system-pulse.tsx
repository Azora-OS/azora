"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Zap,
  Shield,
  Crown,
  Brain,
  Globe,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff
} from "lucide-react"

interface SystemPulseProps {
  className?: string
}

export function SystemPulse({ className }: SystemPulseProps) {
  const [systemHealth, setSystemHealth] = useState(96.4)
  const [networkStatus, setNetworkStatus] = useState("online")
  const [activeUsers, setActiveUsers] = useState(2847)
  const [aiConfidence, setAiConfidence] = useState(94.2)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setSystemHealth(prev => Math.max(90, Math.min(100, prev + (Math.random() - 0.5) * 1)))
      setActiveUsers(prev => Math.max(2800, Math.min(3000, prev + Math.floor((Math.random() - 0.5) * 10))))
      setAiConfidence(prev => Math.max(85, Math.min(100, prev + (Math.random() - 0.5) * 2)))
      setLastUpdate(new Date())

      // Simulate occasional network issues (rare)
      if (Math.random() < 0.02) {
        setNetworkStatus("degraded")
        setTimeout(() => setNetworkStatus("online"), 3000)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (health: number) => {
    if (health >= 95) return "text-green-500"
    if (health >= 90) return "text-yellow-500"
    return "text-red-500"
  }

  const getHealthBg = (health: number) => {
    if (health >= 95) return "bg-green-500/10"
    if (health >= 90) return "bg-yellow-500/10"
    return "bg-red-500/10"
  }

  const getNetworkIcon = (status: string) => {
    switch (status) {
      case "online": return Wifi
      case "degraded": return AlertTriangle
      case "offline": return WifiOff
      default: return Wifi
    }
  }

  const getNetworkColor = (status: string) => {
    switch (status) {
      case "online": return "text-green-500"
      case "degraded": return "text-yellow-500"
      case "offline": return "text-red-500"
      default: return "text-green-500"
    }
  }

  const NetworkIcon = getNetworkIcon(networkStatus)

  return (
    <div className={`w-full bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 border-b border-border/50 ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - System Status */}
          <div className="flex items-center gap-6">
            {/* System Health */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getHealthBg(systemHealth)} animate-pulse`}>
                <Activity className={`h-4 w-4 ${getHealthColor(systemHealth)}`} />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">System Health</span>
                  <Badge
                    variant="outline"
                    className={`${getHealthColor(systemHealth)} border-current/30`}
                  >
                    {systemHealth.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Network Status */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${networkStatus === "online" ? "bg-green-500/10" : networkStatus === "degraded" ? "bg-yellow-500/10" : "bg-red-500/10"}`}>
                <NetworkIcon className={`h-4 w-4 ${getNetworkColor(networkStatus)}`} />
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Network</span>
                  <Badge
                    variant="outline"
                    className={`${getNetworkColor(networkStatus)} border-current/30`}
                  >
                    {networkStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* AI Confidence */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Brain className="h-4 w-4 text-purple-500" />
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">AI Confidence</span>
                  <Badge variant="outline" className="text-purple-500 border-purple-500/30">
                    {aiConfidence.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Center Section - Live Stats */}
          <div className="hidden xl:flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{activeUsers.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">active</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-teal-500" />
                <span className="text-sm font-medium">3</span>
                <span className="text-xs text-muted-foreground">economies</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">$12.4M</span>
                <span className="text-xs text-muted-foreground">volume</span>
              </div>
            </div>
          </div>

          {/* Right Section - Sovereign Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium hidden sm:inline">Sovereign Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium hidden md:inline">Protected</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.location.reload()}
            >
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Animated Pulse Line */}
        <div className="mt-3 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse opacity-30" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>
    </div>
  )
}