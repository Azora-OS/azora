"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Globe,
    Users,
    MessageSquare,
    BookOpen,
    ArrowRight,
    TrendingUp,
    Award,
    Clock,
    MapPin,
    Languages,
    Handshake,
    Scale
} from "lucide-react"
import { DiplomaticRelations } from "./diplomatic-relations"

interface InternationalCollaborationProps {
    className?: string
}

export function InternationalCollaboration({ className }: InternationalCollaborationProps) {
    const [collaborationMetrics, setCollaborationMetrics] = useState({
        activePartnerships: 47,
        knowledgeExchanges: 1247,
        crossCulturalProjects: 89,
        internationalCitizens: 8942,
        languageSupport: 25,
        diplomaticRelations: 23
    })

    const [activeTab, setActiveTab] = useState("partnerships")

    const partnerships = [
        {
            id: 1,
            name: "African Union Digital Transformation Initiative",
            region: "Africa",
            status: "active",
            participants: 28,
            focus: "Digital sovereignty and economic integration",
            progress: 78,
            nextMilestone: "Q2 2024"
        },
        {
            id: 2,
            name: "Asia-Pacific Knowledge Alliance",
            region: "Asia-Pacific",
            status: "active",
            participants: 15,
            focus: "Cross-cultural education and technology transfer",
            progress: 65,
            nextMilestone: "Q1 2024"
        },
        {
            id: 3,
            name: "European Constitutional Standards Council",
            region: "Europe",
            status: "forming",
            participants: 12,
            focus: "Harmonizing constitutional AI governance",
            progress: 34,
            nextMilestone: "Q3 2024"
        },
        {
            id: 4,
            name: "Americas Indigenous Wisdom Network",
            region: "Americas",
            status: "active",
            participants: 9,
            focus: "Preserving and integrating indigenous knowledge systems",
            progress: 91,
            nextMilestone: "Complete"
        }
    ]

    const knowledgeExchanges = [
        {
            id: 1,
            title: "Ubuntu Philosophy in AI Ethics",
            from: "South Africa",
            to: "Global Network",
            participants: 234,
            status: "ongoing",
            impact: "High",
            duration: "6 months"
        },
        {
            id: 2,
            title: "Confucian Harmony in Constitutional Design",
            from: "China",
            to: "Global Network",
            participants: 189,
            status: "completed",
            impact: "Critical",
            duration: "4 months"
        },
        {
            id: 3,
            title: "Indigenous Data Sovereignty Models",
            from: "Australia",
            to: "Global Network",
            participants: 156,
            status: "ongoing",
            impact: "High",
            duration: "8 months"
        },
        {
            id: 4,
            title: "Islamic Finance Integration",
            from: "UAE",
            to: "Global Network",
            participants: 298,
            status: "ongoing",
            impact: "Critical",
            duration: "5 months"
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
            case "ongoing":
                return "text-green-500"
            case "forming":
                return "text-yellow-500"
            case "completed":
                return "text-blue-500"
            default:
                return "text-muted-foreground"
        }
    }

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case "active":
            case "ongoing":
                return "bg-green-500/10"
            case "forming":
                return "bg-yellow-500/10"
            case "completed":
                return "bg-blue-500/10"
            default:
                return "bg-muted/10"
        }
    }

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case "Critical":
                return "text-red-500 bg-red-500/10"
            case "High":
                return "text-orange-500 bg-orange-500/10"
            case "Medium":
                return "text-yellow-500 bg-yellow-500/10"
            default:
                return "text-muted-foreground bg-muted/10"
        }
    }

    return (
        <div className={`h-full flex flex-col ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center animate-pulse-glow">
                        <Handshake className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
                            International Collaboration
                        </h2>
                        <p className="text-sm text-muted-foreground">Global partnerships and cross-cultural knowledge exchange</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Globe className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Active Partnerships</p>
                            <p className="text-lg font-bold text-blue-500">{collaborationMetrics.activePartnerships}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <MessageSquare className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Knowledge Exchanges</p>
                            <p className="text-lg font-bold text-green-500">{collaborationMetrics.knowledgeExchanges.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
                        <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
                        <TabsTrigger value="exchanges">Knowledge Exchange</TabsTrigger>
                        <TabsTrigger value="governance">Global Governance</TabsTrigger>
                        <TabsTrigger value="diplomacy">Diplomatic Relations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="partnerships" className="p-4 space-y-4">
                        {partnerships.map((partnership) => (
                            <Card key={partnership.id} className="glass border-border/50 hover:bg-card/70 transition-all duration-300">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-base mb-2">{partnership.name}</CardTitle>
                                            <CardDescription className="text-sm mb-3">{partnership.focus}</CardDescription>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {partnership.region}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {partnership.participants} participants
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    Next: {partnership.nextMilestone}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            className={`${getStatusBgColor(partnership.status)} ${getStatusColor(partnership.status)} border-current/30`}
                                        >
                                            {partnership.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{partnership.progress}%</span>
                                            </div>
                                            <Progress value={partnership.progress} className="h-2" />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Join Discussion
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="exchanges" className="p-4 space-y-4">
                        {knowledgeExchanges.map((exchange) => (
                            <Card key={exchange.id} className="glass border-border/50">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold mb-1">{exchange.title}</h4>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {exchange.from} → {exchange.to}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>{exchange.participants} participants</span>
                                                <span>{exchange.duration}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge
                                                className={`${getStatusBgColor(exchange.status)} ${getStatusColor(exchange.status)} border-current/30`}
                                            >
                                                {exchange.status}
                                            </Badge>
                                            <Badge className={getImpactColor(exchange.impact)}>
                                                {exchange.impact} Impact
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Languages className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Cross-cultural integration</span>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Participate
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="governance" className="p-4 space-y-4">
                        <Card className="glass border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Scale className="h-5 w-5 text-primary" />
                                    International Arbitration Framework
                                </CardTitle>
                                <CardDescription>
                                    Global constitutional arbitration for cross-border disputes and governance conflicts
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                                        <div className="text-2xl font-bold text-primary mb-1">{collaborationMetrics.diplomaticRelations}</div>
                                        <div className="text-sm text-muted-foreground">Diplomatic Relations</div>
                                    </div>
                                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                                        <div className="text-2xl font-bold text-accent mb-1">{collaborationMetrics.languageSupport}</div>
                                        <div className="text-sm text-muted-foreground">Languages Supported</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Universal Rights Integration</span>
                                        <span className="text-sm font-medium text-green-500">94.7%</span>
                                    </div>
                                    <Progress value={94.7} className="h-2" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Cross-Border Dispute Resolution</span>
                                        <span className="text-sm font-medium text-blue-500">87.3%</span>
                                    </div>
                                    <Progress value={87.3} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    Global Standards Leadership
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Constitutional AI Standards</span>
                                        <Badge className="bg-green-500/10 text-green-500">Leading Global</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Digital Sovereignty Framework</span>
                                        <Badge className="bg-blue-500/10 text-blue-500">International Standard</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Knowledge Economics Model</span>
                                        <Badge className="bg-purple-500/10 text-purple-500">Pioneering</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="diplomacy" className="p-4">
                        <DiplomaticRelations className="h-full" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}