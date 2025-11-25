'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { motion } from 'framer-motion';
import { Activity, Users, Server, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function MasterDashboard() {
    const services = [
        { name: 'azora-mint', status: 'healthy', uptime: '99.9%', requests: '1.2M' },
        { name: 'azora-classroom', status: 'healthy', uptime: '99.8%', requests: '890K' },
        { name: 'ai-family-service', status: 'warning', uptime: '98.5%', requests: '2.1M' },
        { name: 'azora-library', status: 'healthy', uptime: '99.9%', requests: '650K' },
    ];

    return (
        <AppLayout appName="Azora Master" userName="System Admin">
            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                    <h1 className="text-5xl font-bold tracking-tighter">
                        <GradientText>Azora Master</GradientText>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">System Administration & Monitoring</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <AccessibleCard className="p-6 border-green-500/50">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="h-6 w-6 text-green-400" />
                                <div className="text-gray-400 text-sm">Services Online</div>
                            </div>
                            <div className="text-3xl font-bold text-green-400">64/66</div>
                        </AccessibleCard>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <AccessibleCard className="p-6 border-blue-500/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="h-6 w-6 text-blue-400" />
                                <div className="text-gray-400 text-sm">Active Users</div>
                            </div>
                            <div className="text-3xl font-bold text-blue-400">12,456</div>
                        </AccessibleCard>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <AccessibleCard className="p-6 border-purple-500/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Activity className="h-6 w-6 text-purple-400" />
                                <div className="text-gray-400 text-sm">Avg Response Time</div>
                            </div>
                            <div className="text-3xl font-bold text-purple-400">45ms</div>
                        </AccessibleCard>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <AccessibleCard className="p-6 border-yellow-500/50">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertCircle className="h-6 w-6 text-yellow-400" />
                                <div className="text-gray-400 text-sm">Warnings</div>
                            </div>
                            <div className="text-3xl font-bold text-yellow-400">2</div>
                        </AccessibleCard>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <AccessibleCard className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Service Status</h2>
                        <div className="space-y-3">
                            {services.map((service, i) => (
                                <motion.div key={service.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + (i * 0.05) }}
                                    className="p-4 rounded-xl bg-card/30 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${service.status === 'healthy' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                                            <Server className={`h-5 w-5 ${service.status === 'healthy' ? 'text-green-400' : 'text-yellow-400'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{service.name}</h3>
                                            <p className="text-gray-400 text-sm">Uptime: {service.uptime}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-primary">{service.requests}</div>
                                            <div className="text-gray-400 text-xs">requests/day</div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${service.status === 'healthy' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {service.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AccessibleCard>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <AccessibleCard className="p-6">
                            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <Users className="h-5 w-5 mr-3" />
                                    Manage Users
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Server className="h-5 w-5 mr-3" />
                                    Service Configuration
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <FileText className="h-5 w-5 mr-3" />
                                    View Audit Logs
                                </Button>
                            </div>
                        </AccessibleCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                        <AccessibleCard className="p-6">
                            <h2 className="text-xl font-bold mb-4">Recent Alerts</h2>
                            <div className="space-y-3">
                                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                                        <span className="font-bold text-sm">High Memory Usage</span>
                                    </div>
                                    <p className="text-gray-400 text-xs">ai-family-service - 85% memory usage</p>
                                    <p className="text-gray-500 text-xs mt-1">5 minutes ago</p>
                                </div>
                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                        <span className="font-bold text-sm">Deployment Successful</span>
                                    </div>
                                    <p className="text-gray-400 text-xs">azora-oracle v2.1.0 deployed</p>
                                    <p className="text-gray-500 text-xs mt-1">1 hour ago</p>
                                </div>
                            </div>
                        </AccessibleCard>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
