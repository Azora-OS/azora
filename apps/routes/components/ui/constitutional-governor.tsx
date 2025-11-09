"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Shield,
    Crown,
    Scale,
    Users,
    Globe,
    Brain,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    Activity,
    Zap,
    Eye,
    FileText,
    Gavel,
    Vote,
    Target,
    Star,
    Award,
    Lock,
    Unlock
} from "lucide-react"

interface ConstitutionalGovernorProps {
    className?: string
}

export function ConstitutionalGovernor({ className }: ConstitutionalGovernorProps) {
    const [governanceMetrics, setGovernanceMetrics] = useState({
        constitutionalCompliance: 98.7,
        citizenParticipation: 84.3,
        proposalSuccessRate: 76.2,
        activeProposals: 12,
        totalCitizens: 12470,
        activeCitizens: 2847,
        governanceEfficiency: 91.5,
        transparencyIndex: 95.8,
        sovereigntyScore: 97.2,
        internationalParticipation: 67.8,
        globalCitizenCount: 8942,
        crossBorderProposals: 8
    })

    const [activeTab, setActiveTab] = useState("overview")
    const [selectedProposal, setSelectedProposal] = useState<number | null>(null)

    const proposals = [
        {
            id: 1,
            title: "Enhanced AI Constitutional Oversight",
            description: "Implement advanced monitoring for AI agents' constitutional compliance",
            status: "active",
            votes: { yes: 1247, no: 234, abstain: 89 },
            deadline: "2024-02-15",
            category: "Technology",
            priority: "high"
        },
        {
            id: 2,
            title: "African Knowledge Exchange Expansion",
            description: "Expand the Global Knowledge Network to include more African institutions",
            status: "active",
            votes: { yes: 2156, no: 123, abstain: 45 },
            deadline: "2024-02-20",
            category: "Education",
            priority: "high"
        },
        {
            id: 3,
            title: "Constitutional Monetary Policy Update",
            description: "Update AZR tokenomics to better align with constitutional principles",
            status: "review",
            votes: { yes: 892, no: 456, abstain: 123 },
            deadline: "2024-02-10",
            category: "Economy",
            priority: "medium"
        },
        {
            id: 4,
            title: "Enhanced Privacy Protections",
            description: "Strengthen data sovereignty and privacy measures for citizens",
            status: "passed",
            votes: { yes: 3241, no: 234, abstain: 67 },
            deadline: "2024-01-30",
            category: "Privacy",
            priority: "high"
        },
        {
            id: 5,
            title: "International Arbitration Framework",
            description: "Establish global constitutional arbitration for cross-border disputes",
            status: "active",
            votes: { yes: 1876, no: 345, abstain: 92 },
            deadline: "2024-02-25",
            category: "Governance",
            priority: "high"
        },
        {
            id: 6,
            title: "Universal Human Rights Integration",
            description: "Incorporate universal human rights standards into constitutional framework",
            status: "active",
            votes: { yes: 2934, no: 156, abstain: 78 },
            deadline: "2024-03-01",
            category: "Rights",
            priority: "critical"
        },
        {
            id: 7,
            title: "Global Citizen Participation Protocol",
            description: "Enable worldwide citizen voting and constitutional proposal system",
            status: "active",
            votes: { yes: 3456, no: 234, abstain: 123 },
            deadline: "2024-03-15",
            category: "Participation",
            priority: "critical"
        },
        {
            id: 8,
            title: "Planetary Constitutional Court",
            description: "Establish international judicial body for constitutional matters",
            status: "forming",
            votes: { yes: 2234, no: 456, abstain: 89 },
            deadline: "2024-04-01",
            category: "Justice",
            priority: "high"
        }
    ]

    const constitutionalPrinciples = [
        {
            principle: "Proprietary Innovation",
            status: "compliant",
            score: 98.5,
            description: "All innovations remain proprietary to Azora"
        },
        {
            principle: "African Ownership",
            status: "compliant",
            score: 99.2,
            description: "100% African ownership and governance maintained"
        },
        {
            principle: "Constitutional Governance",
            status: "compliant",
            score: 97.8,
            description: "All decisions follow constitutional framework"
        },
        {
            principle: "Value-Centric Engagement",
            status: "compliant",
            score: 95.6,
            description: "All interactions provide measurable value"
        },
        {
            principle: "Digital Sovereignty",
            status: "compliant",
            score: 96.9,
            description: "Complete control over digital infrastructure"
        },
        {
            principle: "No Mock Protocol",
            status: "compliant",
            score: 100.0,
            description: "All systems are production-ready and functional"
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "compliant":
            case "passed":
                return "text-green-500"
            case "active":
                return "text-blue-500"
            case "review":
                return "text-yellow-500"
            default:
                return "text-muted-foreground"
        }
    }

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case "compliant":
            case "passed":
                return "bg-green-500/10"
            case "active":
                return "bg-blue-500/10"
            case "review":
                return "bg-yellow-500/10"
            default:
                return "bg-muted/10"
        }
    }

    return (
        <div className={`h-full flex flex-col ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center animate-pulse-glow">
                        <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Constitutional Governor
                        </h2>
                        <p className="text-sm text-muted-foreground">Living constitutional AI • Sovereign governance</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Shield className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Compliance</p>
                            <p className="text-lg font-bold text-green-500">{governanceMetrics.constitutionalCompliance.toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Participation</p>
                            <p className="text-lg font-bold text-blue-500">{governanceMetrics.citizenParticipation.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="proposals">Proposals</TabsTrigger>
                        <TabsTrigger value="principles">Principles</TabsTrigger>
                        <TabsTrigger value="international">International</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="p-4 space-y-4">
                        {/* Governance Metrics */}
                        <Card className="glass border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Governance Health
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Citizen Participation</span>
                                            <span className="text-sm font-medium">{governanceMetrics.citizenParticipation.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={governanceMetrics.citizenParticipation} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Proposal Success Rate</span>
                                            <span className="text-sm font-medium">{governanceMetrics.proposalSuccessRate.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={governanceMetrics.proposalSuccessRate} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Governance Efficiency</span>
                                            <span className="text-sm font-medium">{governanceMetrics.governanceEfficiency.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={governanceMetrics.governanceEfficiency} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">International Participation</span>
                                            <span className="text-sm font-medium">{governanceMetrics.internationalParticipation.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={governanceMetrics.internationalParticipation} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Proposals Summary */}
                        <Card className="glass border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Vote className="h-5 w-5 text-primary" />
                                    Active Governance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Active Proposals</span>
                                        <Badge variant="secondary">{governanceMetrics.activeProposals}</Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Total Citizens</span>
                                        <span className="text-sm font-medium">{governanceMetrics.totalCitizens.toLocaleString()}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Active Citizens</span>
                                        <span className="text-sm font-medium">{governanceMetrics.activeCitizens.toLocaleString()}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Global Citizens</span>
                                        <span className="text-sm font-medium">{governanceMetrics.globalCitizenCount.toLocaleString()}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Cross-Border Proposals</span>
                                        <Badge variant="secondary">{governanceMetrics.crossBorderProposals}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="proposals" className="p-4 space-y-4">
                        {proposals.map((proposal) => (
                            <Card key={proposal.id} className="glass border-border/50 hover:bg-card/70 transition-all duration-300">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-base mb-2">{proposal.title}</CardTitle>
                                            <CardDescription className="text-sm">{proposal.description}</CardDescription>
                                        </div>
                                        <Badge
                                            className={`${getStatusBgColor(proposal.status)} ${getStatusColor(proposal.status)} border-current/30`}
                                        >
                                            {proposal.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Category</span>
                                            <Badge variant="outline">{proposal.category}</Badge>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Priority</span>
                                            <Badge
                                                variant={proposal.priority === "high" ? "destructive" : "secondary"}
                                            >
                                                {proposal.priority}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Deadline</span>
                                            <span className="font-medium">{new Date(proposal.deadline).toLocaleDateString()}</span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-green-500">Yes: {proposal.votes.yes.toLocaleString()}</span>
                                                <span className="text-red-500">No: {proposal.votes.no.toLocaleString()}</span>
                                                <span className="text-muted-foreground">Abstain: {proposal.votes.abstain.toLocaleString()}</span>
                                            </div>

                                            <div className="flex gap-1 h-2">
                                                <div
                                                    className="bg-green-500 rounded-l"
                                                    style={{ width: `${(proposal.votes.yes / (proposal.votes.yes + proposal.votes.no + proposal.votes.abstain)) * 100}%` }}
                                                />
                                                <div
                                                    className="bg-red-500"
                                                    style={{ width: `${(proposal.votes.no / (proposal.votes.yes + proposal.votes.no + proposal.votes.abstain)) * 100}%` }}
                                                />
                                                <div
                                                    className="bg-muted rounded-r"
                                                    style={{ width: `${(proposal.votes.abstain / (proposal.votes.yes + proposal.votes.no + proposal.votes.abstain)) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1">
                                                <Vote className="h-4 w-4 mr-2" />
                                                Vote
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Details
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="principles" className="p-4 space-y-4">
                        {constitutionalPrinciples.map((principle, index) => (
                            <Card key={index} className="glass border-border/50">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold mb-1">{principle.principle}</h4>
                                            <p className="text-sm text-muted-foreground">{principle.description}</p>
                                        </div>
                                        <div className={`p-2 rounded-lg ${getStatusBgColor(principle.status)}`}>
                                            {principle.status === "compliant" ? (
                                                <CheckCircle className={`h-5 w-5 ${getStatusColor(principle.status)}`} />
                                            ) : (
                                                <AlertTriangle className={`h-5 w-5 ${getStatusColor(principle.status)}`} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Compliance Score</span>
                                            <span className={`font-medium ${getStatusColor(principle.status)}`}>
                                                {principle.score.toFixed(1)}%
                                            </span>
                                        </div>
                                        <Progress value={principle.score} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Constitution Access */}
                        <Card className="glass border-border/50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Azora Constitution</h4>
                                            <p className="text-sm text-muted-foreground">Living governing document</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="international" className="p-4 space-y-4">
                        {/* International Governance Metrics */}
                        <Card className="glass border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-primary" />
                                    International Governance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Global Citizen Participation</span>
                                            <span className="text-sm font-medium">{governanceMetrics.internationalParticipation.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={governanceMetrics.internationalParticipation} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Universal Rights Integration</span>
                                            <span className="text-sm font-medium">94.7%</span>
                                        </div>
                                        <Progress value={94.7} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Cross-Border Arbitration</span>
                                            <span className="text-sm font-medium">87.3%</span>
                                        </div>
                                        <Progress value={87.3} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Planetary Court Readiness</span>
                                            <span className="text-sm font-medium">76.8%</span>
                                        </div>
                                        <Progress value={76.8} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* International Proposals */}
                        <Card className="glass border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Scale className="h-5 w-5 text-primary" />
                                    International Proposals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {proposals.slice(4).map((proposal) => (
                                        <div key={proposal.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm mb-1">{proposal.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{proposal.description}</p>
                                                </div>
                                                <Badge
                                                    className={`${getStatusBgColor(proposal.status)} ${getStatusColor(proposal.status)} border-current/30 text-xs`}
                                                >
                                                    {proposal.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Votes: {proposal.votes.yes + proposal.votes.no + proposal.votes.abstain}</span>
                                                <span className="font-medium">Deadline: {new Date(proposal.deadline).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Universal Human Rights */}
                        <Card className="glass border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Universal Human Rights Integration
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Digital Rights</span>
                                            <span className="font-medium text-green-500">✓ Integrated</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Privacy Rights</span>
                                            <span className="font-medium text-green-500">✓ Integrated</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Education Access</span>
                                            <span className="font-medium text-green-500">✓ Integrated</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Economic Rights</span>
                                            <span className="font-medium text-green-500">✓ Integrated</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">AI Ethical Rights</span>
                                            <span className="font-medium text-yellow-500">⟳ In Progress</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Cultural Rights</span>
                                            <span className="font-medium text-green-500">✓ Integrated</span>
                                        </div>
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