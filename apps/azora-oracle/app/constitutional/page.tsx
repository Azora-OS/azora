'use client';

import { AppLayout, AccessibleCard, GradientText, UbuntuPhilosophyCard } from '@azora/shared-design';
import { motion } from 'framer-motion';
import { Shield, Activity, Lock, Scale, CreditCard, Building2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ConstitutionalMetrics {
    timestamp: string;
    ubuntuScore: number;
    services: {
        kyc: ServiceHealth;
        tamperProof: ServiceHealth;
        governance: ServiceHealth;
        subscription: ServiceHealth;
        lending: ServiceHealth;
        enterprise: ServiceHealth;
    };
    compliance: {
        verifications: number;
        integrityChecks: number;
        activeProposals: number;
        activeSubscriptions: number;
        activeLoans: number;
        activeLicenses: number;
    };
}

interface ServiceHealth {
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    lastCheck: string;
}

export default function ConstitutionalDashboard() {
    const [metrics, setMetrics] = useState<ConstitutionalMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, fetch from API
        // fetch('http://localhost:3033/api/constitutional/metrics')
        //   .then(res => res.json())
        //   .then(data => setMetrics(data.data));

        // Mock data for initial display until backend is fully wired
        setTimeout(() => {
            setMetrics({
                timestamp: new Date().toISOString(),
                ubuntuScore: 98,
                services: {
                    kyc: { status: 'healthy', latency: 45, lastCheck: new Date().toISOString() },
                    tamperProof: { status: 'healthy', latency: 32, lastCheck: new Date().toISOString() },
                    governance: { status: 'healthy', latency: 28, lastCheck: new Date().toISOString() },
                    subscription: { status: 'healthy', latency: 55, lastCheck: new Date().toISOString() },
                    lending: { status: 'healthy', latency: 41, lastCheck: new Date().toISOString() },
                    enterprise: { status: 'healthy', latency: 38, lastCheck: new Date().toISOString() },
                },
                compliance: {
                    verifications: 1250,
                    integrityChecks: 45000,
                    activeProposals: 12,
                    activeSubscriptions: 850,
                    activeLoans: 320,
                    activeLicenses: 45,
                }
            });
            setLoading(false);
        }, 1000);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-400';
            case 'degraded': return 'text-yellow-400';
            case 'down': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="h-5 w-5 text-green-400" />;
            case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
            case 'down': return <XCircle className="h-5 w-5 text-red-400" />;
            default: return <Activity className="h-5 w-5 text-gray-400" />;
        }
    };

    return (
        <AppLayout appName="Azora Oracle" userName="Constitutional Guardian">
            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                            <Shield className="h-12 w-12 text-blue-400" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter">
                        <GradientText>Constitutional Metrics</GradientText>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Real-time monitoring of ecosystem health and compliance
                    </p>
                </motion.div>

                {loading ? (
                    <div className="text-center py-20">Loading metrics...</div>
                ) : metrics ? (
                    <>
                        {/* Ubuntu Score */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex justify-center"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />
                                <AccessibleCard className="p-8 text-center border-primary/50 relative bg-background/80 backdrop-blur-xl">
                                    <h2 className="text-2xl font-bold mb-2">System Ubuntu Score</h2>
                                    <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                        {metrics.ubuntuScore}/100
                                    </div>
                                    <p className="text-gray-400 mt-2">
                                        "I am because we are" - System Cohesion Index
                                    </p>
                                </AccessibleCard>
                            </div>
                        </motion.div>

                        {/* Service Health Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ServiceCard
                                name="KYC/AML Service"
                                icon={Shield}
                                health={metrics.services.kyc}
                                metric={`${metrics.compliance.verifications} Verifications`}
                                delay={0.3}
                            />
                            <ServiceCard
                                name="Tamper-Proof Data"
                                icon={Lock}
                                health={metrics.services.tamperProof}
                                metric={`${metrics.compliance.integrityChecks.toLocaleString()} Checks`}
                                delay={0.35}
                            />
                            <ServiceCard
                                name="Governance"
                                icon={Scale}
                                health={metrics.services.governance}
                                metric={`${metrics.compliance.activeProposals} Proposals`}
                                delay={0.4}
                            />
                            <ServiceCard
                                name="Subscription"
                                icon={Activity}
                                health={metrics.services.subscription}
                                metric={`${metrics.compliance.activeSubscriptions} Active`}
                                delay={0.45}
                            />
                            <ServiceCard
                                name="Lending"
                                icon={CreditCard}
                                health={metrics.services.lending}
                                metric={`${metrics.compliance.activeLoans} Loans`}
                                delay={0.5}
                            />
                            <ServiceCard
                                name="Enterprise"
                                icon={Building2}
                                health={metrics.services.enterprise}
                                metric={`${metrics.compliance.activeLicenses} Licenses`}
                                delay={0.55}
                            />
                        </div>

                        {/* Philosophy Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                            <UbuntuPhilosophyCard
                                collaborationScore={98}
                                communityImpact={95}
                                knowledgeSharing={99}
                            />
                        </motion.div>
                    </>
                ) : (
                    <div className="text-center text-red-400">Failed to load metrics</div>
                )}
            </div>
        </AppLayout>
    );
}

function ServiceCard({ name, icon: Icon, health, metric, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <AccessibleCard className="p-6 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold">{name}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className={`w-2 h-2 rounded-full ${health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                                {health.latency}ms
                            </div>
                        </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${health.status === 'healthy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        {health.status}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-sm text-gray-400">Key Metric</span>
                    <span className="font-mono font-bold">{metric}</span>
                </div>
            </AccessibleCard>
        </motion.div>
    );
}
