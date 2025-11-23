'use client'

import { useState, useEffect } from 'react'
import { discoverServices, getServicesByCategory, ServiceConfig } from '../../lib/service-registry'

export default function DashboardPage() {
    const [services, setServices] = useState<Record<string, ServiceConfig>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadServices() {
            setIsLoading(true);
            const discoveredServices = await discoverServices();
            setServices(discoveredServices);
            setIsLoading(false);
        }
        loadServices();
    }, []);

    const educationServices = Object.values(services).filter(s => s.category === 'education');
    const aiServices = Object.values(services).filter(s => s.category === 'ai');
    const businessServices = Object.values(services).filter(s => s.category === 'business');
    const careerServices = Object.values(services).filter(s => s.category === 'careers');
    const financeServices = Object.values(services).filter(s => s.category === 'finance');

    const onlineCount = Object.values(services).filter(s => s.status === 'online').length;
    const totalCount = Object.values(services).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <a href="/" className="text-3xl font-bold text-white hover:text-blue-300 transition-colors">AZORA</a>
                            <span className="ml-2 text-sm text-blue-300">Dashboard</span>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <a href="/" className="text-white hover:text-blue-300">Home</a>
                            <a href="/learn" className="text-white hover:text-blue-300">Learn</a>
                            <a href="/forge" className="text-white hover:text-blue-300">Forge</a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="glass-card rounded-xl p-6">
                        <div className="text-sm text-gray-300 mb-1">Services Online</div>
                        <div className="text-3xl font-bold text-green-400">{onlineCount}/{totalCount}</div>
                    </div>
                    <div className="glass-card rounded-xl p-6">
                        <div className="text-sm text-gray-300 mb-1">Learning Progress</div>
                        <div className="text-3xl font-bold text-blue-400">68%</div>
                    </div>
                    <div className="glass-card rounded-xl p-6">
                        <div className="text-sm text-gray-300 mb-1">Active Projects</div>
                        <div className="text-3xl font-bold text-purple-400">3</div>
                    </div>
                    <div className="glass-card rounded-xl p-6">
                        <div className="text-sm text-gray-300 mb-1">Revenue This Month</div>
                        <div className="text-3xl font-bold text-yellow-400">R12.5K</div>
                    </div>
                </div>

                {/* AI Services */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">🤖 AI Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aiServices.map((service) => (
                            <ServiceCard key={service.name} service={service} />
                        ))}
                    </div>
                </div>

                {/* Education Services */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">📚 Education Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {educationServices.map((service) => (
                            <ServiceCard key={service.name} service={service} />
                        ))}
                    </div>
                </div>

                {/* Business Services */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">💼 Business Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {businessServices.map((service) => (
                            <ServiceCard key={service.name} service={service} />
                        ))}
                    </div>
                </div>

                {/* Career & Finance Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">🎯 Career Services</h2>
                        <div className="space-y-4">
                            {careerServices.map((service) => (
                                <ServiceCard key={service.name} service={service} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">💰 Finance Services</h2>
                        <div className="space-y-4">
                            {financeServices.map((service) => (
                                <ServiceCard key={service.name} service={service} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ServiceCard({ service }: { service: ServiceConfig }) {
    const statusColor = service.status === 'online' ? 'bg-green-500' : service.status === 'offline' ? 'bg-red-500' : 'bg-gray-500';
    const statusText = service.status === 'online' ? 'Online' : service.status === 'offline' ? 'Offline' : 'Unknown';

    return (
        <div className="glass-card rounded-xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{service.displayName}</h3>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${statusColor} rounded-full`}></span>
                    <span className="text-xs text-gray-400">{statusText}</span>
                </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">{service.description}</p>
            {service.status === 'online' && (
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    Open Service
                </button>
            )}
            {service.status === 'offline' && (
                <button className="w-full bg-gray-600 cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm" disabled>
                    Service Offline
                </button>
            )}
        </div>
    );
}
