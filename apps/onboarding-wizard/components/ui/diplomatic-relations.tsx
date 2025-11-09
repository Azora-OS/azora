"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Handshake,
    Globe,
    Award,
    TrendingUp,
    Users,
    Building,
    Scale,
    Target,
    CheckCircle,
    Clock,
    Star,
    Crown,
    Shield,
    ArrowRight
} from "lucide-react"

interface DiplomaticRelationsProps {
    className?: string
}

export function DiplomaticRelations({ className }: DiplomaticRelationsProps) {
    const [relationsMetrics, setRelationsMetrics] = useState({
        activeAlliances: 23,
        strategicPartnerships: 47,
        diplomaticMissions: 12,
        treatyAgreements: 89,
        globalStandards: 34,
        economicCooperation: 156,
        g20Engagements: 8,
        summitPreparations: 92,
        bilateralMeetings: 15
    })

    const [activeTab, setActiveTab] = useState("alliances")

    const alliances = [
        {
            id: 1,
            name: "African Continental Free Trade Area",
            type: "Economic Alliance",
            status: "active",
            members: 54,
            focus: "Economic integration and digital sovereignty",
            strength: 92,
            lastActivity: "2 days ago"
        },
        {
            id: 2,
            name: "BRICS+ Technology Consortium",
            type: "Technology Alliance",
            status: "forming",
            members: 8,
            focus: "Emerging technology collaboration",
            strength: 67,
            lastActivity: "1 week ago"
        },
        {
            id: 3,
            name: "Commonwealth Digital Nations",
            type: "Digital Sovereignty",
            status: "active",
            members: 15,
            focus: "Digital rights and constitutional governance",
            strength: 85,
            lastActivity: "5 days ago"
        },
        {
            id: 4,
            name: "Pacific Rim Knowledge Network",
            type: "Education Alliance",
            status: "active",
            members: 22,
            focus: "Cross-cultural education and research",
            strength: 78,
            lastActivity: "1 day ago"
        }
    ]

    const treaties = [
        {
            id: 1,
            title: "Universal Digital Rights Charter",
            status: "ratified",
            signatories: 67,
            effectiveDate: "2024-01-15",
            keyProvisions: ["Data sovereignty", "AI constitutional rights", "Digital citizenship"],
            compliance: 94
        },
        {
            id: 2,
            title: "Global Knowledge Exchange Protocol",
            status: "active",
            signatories: 89,
            effectiveDate: "2024-02-01",
            keyProvisions: ["Open knowledge sharing", "Cultural preservation", "Technology transfer"],
            compliance: 87
        },
        {
            id: 3,
            title: "Constitutional AI Governance Treaty",
            status: "negotiating",
            signatories: 45,
            effectiveDate: "TBD",
            keyProvisions: ["AI ethical standards", "Human oversight", "International arbitration"],
            compliance: 0
        },
        {
            id: 4,
            title: "Economic Sovereignty Accord",
            status: "ratified",
            signatories: 52,
            effectiveDate: "2023-12-01",
            keyProvisions: ["Monetary independence", "Trade protocols", "Financial inclusion"],
            compliance: 91
        }
    ]

    const standards = [
        {
            name: "Azora Constitutional AI Standards",
            status: "Leading Global",
            adoption: 67,
            impact: "Critical",
            description: "International framework for ethical AI governance"
        },
        {
            name: "Digital Sovereignty Framework",
            status: "International Standard",
            adoption: 89,
            impact: "High",
            description: "Global standards for digital rights and data protection"
        },
        {
            name: "Knowledge Economics Model",
            status: "Pioneering",
            adoption: 34,
            impact: "Transformative",
            description: "New economic paradigm based on knowledge value"
        },
        {
            name: "Universal Human Rights Integration",
            status: "Leading Global",
            adoption: 78,
            impact: "Critical",
            description: "Constitutional integration of universal human rights"
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
            case "ratified":
                return "text-green-500"
            case "forming":
            case "negotiating":
                return "text-yellow-500"
            case "Leading Global":
            case "International Standard":
            case "Pioneering":
                return "text-blue-500"
            default:
                return "text-muted-foreground"
        }
    }

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case "active":
            case "ratified":
                return "bg-green-500/10"
            case "forming":
            case "negotiating":
                return "bg-yellow-500/10"
            case "Leading Global":
            case "International Standard":
            case "Pioneering":
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
            case "Transformative":
                return "text-purple-500 bg-purple-500/10"
            default:
                return "text-muted-foreground bg-muted/10"
        }
    }

    return (
        <div className={`h-full flex flex-col ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center animate-pulse-glow">
                        <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                            Diplomatic Relations
                        </h2>
                        <p className="text-sm text-muted-foreground">International partnerships and global standards leadership</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Handshake className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Active Alliances</p>
                            <p className="text-lg font-bold text-purple-500">{relationsMetrics.activeAlliances}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Award className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Global Standards</p>
                            <p className="text-lg font-bold text-blue-500">{relationsMetrics.globalStandards}</p>
                        </div>
                    </div>
                </div>

                {/* G20 Summit Alert */}
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Crown className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-yellow-700">G20 Summit South Africa 2025</h4>
                            <p className="text-sm text-yellow-600">Historic opportunity for global expansion</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                            <div className="font-bold text-yellow-700">{relationsMetrics.g20Engagements}</div>
                            <div className="text-yellow-600">G20 Engagements</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-yellow-700">{relationsMetrics.summitPreparations}%</div>
                            <div className="text-yellow-600">Preparation</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-yellow-700">{relationsMetrics.bilateralMeetings}</div>
                            <div className="text-yellow-600">Meetings Scheduled</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
                        <TabsTrigger value="alliances">Strategic Alliances</TabsTrigger>
                        <TabsTrigger value="treaties">Treaty Framework</TabsTrigger>
                        <TabsTrigger value="standards">Global Standards</TabsTrigger>
                        <TabsTrigger value="g20">G20 Summit</TabsTrigger>
                    </TabsList>

                    <TabsContent value="alliances" className="p-4 space-y-4">
                        {alliances.map((alliance) => (
                            <Card key={alliance.id} className="glass border-border/50 hover:bg-card/70 transition-all duration-300">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-base mb-2">{alliance.name}</CardTitle>
                                            <CardDescription className="text-sm mb-3">{alliance.focus}</CardDescription>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <Badge variant="outline">{alliance.type}</Badge>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {alliance.members} members
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {alliance.lastActivity}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            className={`${getStatusBgColor(alliance.status)} ${getStatusColor(alliance.status)} border-current/30`}
                                        >
                                            {alliance.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">Alliance Strength</span>
                                                <span className="font-medium">{alliance.strength}%</span>
                                            </div>
                                            <Progress value={alliance.strength} className="h-2" />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Contact
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="treaties" className="p-4 space-y-4">
                        {treaties.map((treaty) => (
                            <Card key={treaty.id} className="glass border-border/50">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-base mb-2">{treaty.title}</CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                <span>{treaty.signatories} signatories</span>
                                                <span>Effective: {treaty.effectiveDate}</span>
                                            </div>
                                        </div>
                                        <Badge
                                            className={`${getStatusBgColor(treaty.status)} ${getStatusColor(treaty.status)} border-current/30`}
                                        >
                                            {treaty.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Key Provisions:</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {treaty.keyProvisions.map((provision, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {provision}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {treaty.compliance > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between text-sm mb-2">
                                                    <span className="text-muted-foreground">Compliance Rate</span>
                                                    <span className="font-medium">{treaty.compliance}%</span>
                                                </div>
                                                <Progress value={treaty.compliance} className="h-2" />
                                            </div>
                                        )}

                                        <Button size="sm" className="w-full" variant="outline">
                                            <FileText className="h-4 w-4 mr-2" />
                                            View Full Treaty
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="standards" className="p-4 space-y-4">
                        {standards.map((standard, index) => (
                            <Card key={index} className="glass border-border/50">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold mb-1">{standard.name}</h4>
                                            <p className="text-sm text-muted-foreground mb-2">{standard.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>{standard.adoption} nations adopted</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge
                                                className={`${getStatusBgColor(standard.status)} ${getStatusColor(standard.status)} border-current/30`}
                                            >
                                                {standard.status}
                                            </Badge>
                                            <Badge className={getImpactColor(standard.impact)}>
                                                {standard.impact}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Global adoption progress</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{standard.adoption}%</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Leadership Summary */}
                        <Card className="glass border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-primary" />
                                    Global Standards Leadership
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Standards Adopted Worldwide</span>
                                        <span className="text-sm font-medium text-green-500">67</span>
                                    </div>
                                    <Progress value={67} className="h-2" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">International Influence</span>
                                        <span className="text-sm font-medium text-blue-500">89%</span>
                                    </div>
                                    <Progress value={89} className="h-2" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Innovation Leadership</span>
                                        <span className="text-sm font-medium text-purple-500">94%</span>
                                    </div>
                                    <Progress value={94} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="g20" className="p-4 space-y-4">
                        {/* G20 Summit Overview */}
                        <Card className="glass border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                    G20 South Africa Summit 2025
                                </CardTitle>
                                <CardDescription>
                                    Historic opportunity to position Azora OS as the global standard for sovereign digital infrastructure
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                                        <div className="text-2xl font-bold text-primary mb-1">19+1</div>
                                        <div className="text-sm text-muted-foreground">G20 Nations + EU</div>
                                    </div>
                                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                                        <div className="text-2xl font-bold text-accent mb-1">$95.2T</div>
                                        <div className="text-sm text-muted-foreground">Combined GDP (85% global)</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Summit Preparation</span>
                                        <span className="text-sm font-medium text-green-500">{relationsMetrics.summitPreparations}% Complete</span>
                                    </div>
                                    <Progress value={relationsMetrics.summitPreparations} className="h-2" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Bilateral Meetings Scheduled</span>
                                        <span className="text-sm font-medium text-blue-500">{relationsMetrics.bilateralMeetings}/20</span>
                                    </div>
                                    <Progress value={(relationsMetrics.bilateralMeetings / 20) * 100} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Priority Nations */}
                        <Card className="glass border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    Priority G20 Nations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { country: "🇧🇷 Brazil", status: "High Priority", progress: 85, focus: "Scale existing instantiation" },
                                        { country: "🇮🇳 India", status: "High Priority", progress: 70, focus: "Education economics transformation" },
                                        { country: "🇿🇦 South Africa", status: "Strategic Host", progress: 95, focus: "Lead African delegation" },
                                        { country: "🇦🇺 Australia", status: "High Priority", progress: 60, focus: "Indigenous knowledge integration" },
                                        { country: "🇨🇳 China", status: "Medium Priority", progress: 45, focus: "Constitutional AI governance" },
                                        { country: "🇩🇪 Germany", status: "Medium Priority", progress: 40, focus: "Industry 4.0 integration" }
                                    ].map((nation, index) => (
                                        <div key={index} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{nation.country}</span>
                                                    <Badge className={nation.status.includes("High") ? "bg-green-500/10 text-green-500" : nation.status.includes("Strategic") ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-500/10 text-blue-500"}>
                                                        {nation.status}
                                                    </Badge>
                                                </div>
                                                <span className="text-sm font-medium">{nation.progress}%</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mb-2">{nation.focus}</div>
                                            <Progress value={nation.progress} className="h-1.5" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summit Activities */}
                        <Card className="glass border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Summit Activities
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                        <div>
                                            <div className="font-medium">G20 Digital Sovereignty Forum</div>
                                            <div className="text-sm text-muted-foreground">Official side event with leader briefings</div>
                                        </div>
                                        <Badge className="bg-green-500/10 text-green-500">Confirmed</Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                        <div>
                                            <div className="font-medium">Bilateral Leader Meetings</div>
                                            <div className="text-sm text-muted-foreground">45-minute sessions with finance ministers</div>
                                        </div>
                                        <Badge className="bg-blue-500/10 text-blue-500">{relationsMetrics.bilateralMeetings} Scheduled</Badge>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                        <div>
                                            <div className="font-medium">Technical Demonstrations</div>
                                            <div className="text-sm text-muted-foreground">Live Azora OS sovereignty demonstrations</div>
                                        </div>
                                        <Badge className="bg-purple-500/10 text-purple-500">Ready</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}