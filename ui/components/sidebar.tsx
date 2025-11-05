"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Home,
  Wallet,
  Coins,
  Send,
  Download,
  History,
  Settings,
  User,
  Shield,
  Crown,
  Activity,
  TrendingUp,
  Users,
  Globe,
  Brain,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")

  const navigationItems = [
    {
      id: "dashboard",
      label: "Learning Hub",
      icon: Home,
      badge: null,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      id: "courses",
      label: "My Courses",
      icon: Brain,
      badge: "3",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      id: "programs",
      label: "CKQ Programs",
      icon: Crown,
      badge: null,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      id: "assessments",
      label: "Assessments",
      icon: Shield,
      badge: "2",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      id: "rewards",
      label: "Rewards",
      icon: Coins,
      badge: null,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10"
    },
    {
      id: "progress",
      label: "Progress",
      icon: TrendingUp,
      badge: null,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    }
  ]

  const systemStats = [
    { label: "Active Users", value: "2,847", icon: Users, color: "text-blue-500" },
    { label: "System Health", value: "96.4%", icon: Activity, color: "text-green-500" },
    { label: "Network Load", value: "68%", icon: TrendingUp, color: "text-purple-500" }
  ]

  return (
    <div className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95 border-r border-border/50 ${isCollapsed ? 'w-16' : 'w-60'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Azora OS</h2>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 hover:bg-card/70"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">Sovereign User</p>
              <p className="text-xs text-muted-foreground truncate">user@azora.world</p>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">Verified</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "secondary" : "ghost"}
            className={`w-full justify-start gap-3 h-10 px-3 ${activeSection === item.id ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-card/70'}`}
            onClick={() => setActiveSection(item.id)}
          >
            <div className={`p-1.5 rounded-md ${item.bgColor}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="text-sm font-medium truncate">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs h-5 px-1.5">
                    {item.badge}
                  </Badge>
                )}
              </div>
            )}
          </Button>
        ))}
      </nav>

      {/* System Stats */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border/50 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            System Status
          </h3>
          <div className="space-y-3">
            {systemStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md bg-card/50`}>
                  <stat.icon className={`h-3 w-3 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate">{stat.label}</span>
                    <span className="text-xs font-semibold">{stat.value}</span>
                  </div>
                  {stat.label === "Network Load" && (
                    <Progress value={68} className="h-1 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 px-3 hover:bg-card/70"
          onClick={() => setActiveSection("settings")}
        >
          <div className="p-1.5 rounded-md bg-card/50">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-sm font-medium">Settings</span>
          )}
        </Button>
      </div>
    </div>
  )
}