"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Activity,
    Zap,
    Shield,
    Crown,
    AlertTriangle,
    CheckCircle,
    Clock,
    Wifi,
    Cpu,
    HardDrive,
    Globe,
    Users,
    TrendingUp,
    Eye,
    GraduationCap
} from "lucide-react"

interface SystemPulseProps {
    className?: string
}

export function SystemPulse({ className }: SystemPulseProps) {
    const [systemMetrics, setSystemMetrics] = useState({
        health: 96.4,
        uptime: 99.9,
        activeUsers: 2847,
        networkLatency: 23,
        cpuUsage: 34,
        memoryUsage: 67,
        constitutionalCompliance: 98.7,
        aiAgents: 12,
        transactionsPerSecond: 156,
        internationalNodes: 195,
        knowledgeDomains: 47,
        crossCulturalExchanges: 1247,
        g20SummitPrep: 92,
        bilateralMeetings: 15,
        g20Engagements: 8
    })

    const [alerts, setAlerts] = useState([
        {
            id: 1,
            type: "info",
            message: "G20 Summit preparation: 15 bilateral meetings scheduled",
            timestamp: "5 min ago"
        },
        {
            id: 2,
            type: "success",
            message: "All systems operating within parameters",
            timestamp: "12 min ago"
        },
        {
            id: 3,
            type: "warning",
            message: "G20 Digital Sovereignty Forum confirmed for November 18",
            timestamp: "1 hour ago"
        }
    ])

    useEffect(() => {
        const interval = setInterval(() => {
            setSystemMetrics(prev => ({
                ...prev,
                health: Math.max(90, Math.min(100, prev.health + (Math.random() - 0.5) * 1)),
                uptime: Math.max(99.5, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.1)),
                activeUsers: Math.max(2800, Math.min(3000, prev.activeUsers + Math.floor((Math.random() - 0.5) * 20))),
                networkLatency: Math.max(15, Math.min(50, prev.networkLatency + (Math.random() - 0.5) * 5)),
                cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10)),
                memoryUsage: Math.max(40, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 8)),
                constitutionalCompliance: Math.max(95, Math.min(100, prev.constitutionalCompliance + (Math.random() - 0.5) * 0.5)),
                internationalNodes: Math.max(190, Math.min(200, prev.internationalNodes + Math.floor((Math.random() - 0.5) * 2))),
                knowledgeDomains: Math.max(45, Math.min(50, prev.knowledgeDomains + Math.floor((Math.random() - 0.5) * 1))),
                crossCulturalExchanges: Math.max(1200, Math.min(1300, prev.crossCulturalExchanges + Math.floor((Math.random() - 0.5) * 20)))
            }))
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    const getHealthColor = (value: number) => {
        if (value >= 95) return "text-green-500"
        if (value >= 90) return "text-yellow-500"
        return "text-red-500"
    }

    const getHealthBgColor = (value: number) => {
        if (value >= 95) return "bg-green-500/10"
        if (value >= 90) return "bg-yellow-500/10"
        return "bg-red-500/10"
    }

    const metrics = [
        {
            label: "System Health",
            value: `${systemMetrics.health.toFixed(1)}%`,
            icon: Activity,
            color: getHealthColor(systemMetrics.health),
            bgColor: getHealthBgColor(systemMetrics.health),
            progress: systemMetrics.health
        },
        {
            label: "Constitutional Compliance",
            value: `${systemMetrics.constitutionalCompliance.toFixed(1)}%`,
            icon: Shield,
            color: systemMetrics.constitutionalCompliance >= 95 ? "text-green-500" : "text-yellow-500",
            bgColor: systemMetrics.constitutionalCompliance >= 95 ? "bg-green-500/10" : "bg-yellow-500/10",
            progress: systemMetrics.constitutionalCompliance
        },
        {
            label: "Network Uptime",
            value: `${systemMetrics.uptime.toFixed(1)}%`,
            icon: Wifi,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            progress: systemMetrics.uptime
        },
        {
            label: "Active Citizens",
            value: systemMetrics.activeUsers.toLocaleString(),
            icon: Users,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            progress: null
        },
        {
            label: "TPS",
            value: systemMetrics.transactionsPerSecond.toString(),
            icon: TrendingUp,
            color: "text-teal-500",
            bgColor: "bg-teal-500/10",
            progress: null
        },
        {
            label: "International Nodes",
            value: systemMetrics.internationalNodes.toString(),
            icon: Globe,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            progress: null
        },
        {
            label: "Knowledge Domains",
            value: systemMetrics.knowledgeDomains.toString(),
            icon: GraduationCap,
            color: "text-indigo-500",
            bgColor: "bg-indigo-500/10",
            progress: null
        },
        {
            label: "G20 Summit Prep",
            value: `${systemMetrics.g20SummitPrep}%`,
            icon: Crown,
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
            progress: systemMetrics.g20SummitPrep
        }
    ]

    return (
        <div className={`px-6 py-4 ${className}`}>
            <div className="flex items-center justify-between">
                {/* Primary Metrics */}
                <div className="flex items-center gap-6">
                    {metrics.slice(0, 4).map((metric, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${metric.bgColor} animate-pulse-glow`}>
                                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{metric.label}</span>
                                    <span className={`text-sm font-bold ${metric.color}`}>{metric.value}</span>
                                </div>
                                {metric.progress && (
                                    <Progress value={metric.progress} className="w-16 h-1 mt-1" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Secondary Metrics & Alerts */}
                <div className="flex items-center gap-4">
                    {/* Performance Metrics */}
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                            <Cpu className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">CPU:</span>
                            <span className="font-medium">{systemMetrics.cpuUsage}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">MEM:</span>
                            <span className="font-medium">{systemMetrics.memoryUsage}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">LAT:</span>
                            <span className="font-medium">{systemMetrics.networkLatency}ms</span>
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="flex items-center gap-2">
                        {alerts.slice(0, 2).map((alert) => (
                            <Badge
                                key={alert.id}
                                variant="outline"
                                className={`text-xs px-2 py-1 ${alert.type === "success"
                                    ? "border-green-500/30 text-green-500 bg-green-500/10"
                                    : alert.type === "warning"
                                        ? "border-yellow-500/30 text-yellow-500 bg-yellow-500/10"
                                        : "border-blue-500/30 text-blue-500 bg-blue-500/10"
                                    }`}
                            >
                                {alert.type === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {alert.type === "warning" && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {alert.type === "info" && <Eye className="h-3 w-3 mr-1" />}
                                {alert.message}
                            </Badge>
                        ))}
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            {/* Progress Bars for Key Metrics */}
            <div className="mt-3 flex items-center gap-6">
                <div className="flex-1 max-w-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Ascension Protocol Progress</span>
                        <span className="font-medium">78.5%</span>
                    </div>
                    <Progress value={78.5} className="h-1.5" />
                </div>

                <div className="flex-1 max-w-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Global Knowledge Network</span>
                        <span className="font-medium">94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-1.5" />
                </div>

                <div className="flex-1 max-w-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">International Collaboration</span>
                        <span className="font-medium">87.5%</span>
                    </div>
                    <Progress value={87.5} className="h-1.5" />
                </div>

                <div className="flex-1 max-w-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Cross-Cultural Exchange</span>
                        <span className="font-medium">91.8%</span>
                    </div>
                    <Progress value={91.8} className="h-1.5" />
                </div>

                <div className="flex-1 max-w-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">G20 Summit Preparation</span>
                        <span className="font-medium">{systemMetrics.g20SummitPrep}%</span>
                    </div>
                    <Progress value={systemMetrics.g20SummitPrep} className="h-1.5" />
                </div>

                <div className="flex-1 max-w-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Aegis Security Status</span>
                        <span className="font-medium">98.7%</span>
                    </div>
                    <Progress value={98.7} className="h-1.5" />
                </div>
            </div>
        </div>
    )
}