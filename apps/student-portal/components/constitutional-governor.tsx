"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  Shield,
  Scale,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Zap,
  Heart,
  Lock,
  Globe,
  Crown,
  Activity
} from "lucide-react"

interface ConstitutionalGovernorProps {
  className?: string
}

interface EthicalMetric {
  id: string
  name: string
  value: number
  threshold: number
  status: "optimal" | "warning" | "critical"
  description: string
}

interface GovernanceAction {
  id: string
  type: "approval" | "override" | "audit" | "intervention"
  description: string
  timestamp: Date
  status: "pending" | "approved" | "rejected" | "completed"
  priority: "low" | "medium" | "high" | "critical"
}

export function ConstitutionalGovernor({ className }: ConstitutionalGovernorProps) {
  const [ethicalMetrics, setEthicalMetrics] = useState<EthicalMetric[]>([
    {
      id: "privacy",
      name: "Privacy Protection",
      value: 97.2,
      threshold: 95,
      status: "optimal",
      description: "User data protection and consent compliance"
    },
    {
      id: "fairness",
      name: "Algorithmic Fairness",
      value: 92.8,
      threshold: 90,
      status: "optimal",
      description: "Bias detection and fairness in AI decisions"
    },
    {
      id: "transparency",
      name: "Decision Transparency",
      value: 88.5,
      threshold: 85,
      status: "warning",
      description: "Explainability of AI recommendations"
    },
    {
      id: "accountability",
      name: "Accountability",
      value: 94.1,
      threshold: 90,
      status: "optimal",
      description: "Audit trails and responsibility tracking"
    },
    {
      id: "safety",
      name: "System Safety",
      value: 96.7,
      threshold: 95,
      status: "optimal",
      description: "Risk mitigation and safety protocols"
    }
  ])

  const [recentActions, setRecentActions] = useState<GovernanceAction[]>([
    {
      id: "1",
      type: "approval",
      description: "Approved high-value transaction with enhanced verification",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: "completed",
      priority: "high"
    },
    {
      id: "2",
      type: "audit",
      description: "Scheduled quarterly compliance audit",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: "pending",
      priority: "medium"
    },
    {
      id: "3",
      type: "intervention",
      description: "Detected potential market manipulation pattern",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: "completed",
      priority: "critical"
    }
  ])

  const [governanceMode, setGovernanceMode] = useState<"active" | "passive" | "intervention">("active")
  const [lastAudit, setLastAudit] = useState(new Date(Date.now() - 2 * 60 * 60 * 1000))

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate metric updates
      setEthicalMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(80, Math.min(100, metric.value + (Math.random() - 0.5) * 2)),
        status: metric.value >= metric.threshold ? "optimal" :
          metric.value >= metric.threshold - 5 ? "warning" : "critical"
      })))

      // Simulate occasional governance actions
      if (Math.random() < 0.1) {
        const newAction: GovernanceAction = {
          id: Date.now().toString(),
          type: ["approval", "audit", "intervention"][Math.floor(Math.random() * 3)] as any,
          description: [
            "Reviewed AI model decision for fairness",
            "Completed automated compliance check",
            "Approved user consent for data processing",
            "Detected and mitigated potential security threat"
          ][Math.floor(Math.random() * 4)],
          timestamp: new Date(),
          status: "completed",
          priority: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as any
        }
        setRecentActions(prev => [newAction, ...prev.slice(0, 4)])
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal": return "text-green-500"
      case "warning": return "text-yellow-500"
      case "critical": return "text-red-500"
      default: return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "optimal": return CheckCircle
      case "warning": return AlertTriangle
      case "critical": return AlertTriangle
      default: return Activity
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-500 bg-red-500/10"
      case "high": return "text-orange-500 bg-orange-500/10"
      case "medium": return "text-yellow-500 bg-yellow-500/10"
      case "low": return "text-blue-500 bg-blue-500/10"
      default: return "text-muted-foreground bg-muted"
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case "approval": return CheckCircle
      case "override": return Shield
      case "audit": return FileText
      case "intervention": return AlertTriangle
      default: return Activity
    }
  }

  return (
    <Card className={`w-full max-w-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-primary" />
          Constitutional Governor
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`capitalize ${governanceMode === "active" ? "text-green-500 border-green-500/30" :
                governanceMode === "passive" ? "text-blue-500 border-blue-500/30" :
                  "text-red-500 border-red-500/30"
              }`}
          >
            {governanceMode} mode
          </Badge>
          <span className="text-xs text-muted-foreground">
            Last audit: {lastAudit.toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ethical Metrics */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Ethical Metrics
          </h4>
          <div className="space-y-3">
            {ethicalMetrics.map((metric) => {
              const StatusIcon = getStatusIcon(metric.status)
              return (
                <div key={metric.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{metric.name}</span>
                    <div className="flex items-center gap-1">
                      <StatusIcon className={`h-3 w-3 ${getStatusColor(metric.status)}`} />
                      <span className={getStatusColor(metric.status)}>
                        {metric.value.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={metric.value}
                    className="h-1"
                  />
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Recent Governance Actions */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Actions
          </h4>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {recentActions.map((action) => {
                const ActionIcon = getActionIcon(action.type)
                return (
                  <div key={action.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <ActionIcon className="h-3 w-3 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight">
                        {action.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs px-1 py-0 ${getPriorityColor(action.priority)}`}
                        >
                          {action.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {action.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Governance Controls */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Governance Controls
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setGovernanceMode("active")}
            >
              <Eye className="h-3 w-3 mr-1" />
              Active
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setGovernanceMode("passive")}
            >
              <Heart className="h-3 w-3 mr-1" />
              Passive
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setGovernanceMode("intervention")}
            >
              <Zap className="h-3 w-3 mr-1" />
              Intervene
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setLastAudit(new Date())}
            >
              <FileText className="h-3 w-3 mr-1" />
              Audit
            </Button>
          </div>
        </div>

        {/* System Status Summary */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Overall Status</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">Protected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}