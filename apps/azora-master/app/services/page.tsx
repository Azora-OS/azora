'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Server, Settings, Play, Pause, RefreshCw } from 'lucide-react';

export default function ServicesPage() {
    const router = useRouter();

    const services = [
        { id: 1, name: 'azora-mint', port: 4008, status: 'running', uptime: '15d 4h', cpu: '12%', memory: '256MB' },
        { id: 2, name: 'azora-classroom', port: 4009, status: 'running', uptime: '15d 4h', cpu: '8%', memory: '192MB' },
        { id: 3, name: 'ai-family-service', port: 4010, status: 'warning', uptime: '2d 1h', cpu: '45%', memory: '512MB' },
        { id: 4, name: 'azora-library', port: 4011, status: 'running', uptime: '15d 4h', cpu: '6%', memory: '128MB' },
    ];

    return (
        <AppLayout appName="Azora Master" userName="System Admin">
            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Service Configuration</GradientText>
                    </h1>
                    <p className="text-gray-400">Manage and configure system services</p>
                </motion.div>

                <div className="space-y-4">
                    {services.map((service, i) => (
                        <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
                            <AccessibleCard className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`p-3 rounded-xl ${service.status === 'running' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                                            }`}>
                                            <Server className={`h-6 w-6 ${service.status === 'running' ? 'text-green-400' : 'text-yellow-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold">{service.name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${service.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {service.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <div className="text-gray-400">Port</div>
                                                    <div className="font-bold">{service.port}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-400">Uptime</div>
                                                    <div className="font-bold">{service.uptime}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-400">CPU</div>
                                                    <div className="font-bold">{service.cpu}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-400">Memory</div>
                                                    <div className="font-bold">{service.memory}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Button variant={service.status === 'running' ? 'outline' : 'primary'} size="sm">
                                            {service.status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
