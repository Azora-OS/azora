import React, { useState } from 'react';
import {
    Search, ShoppingBag, Star, Download, TrendingUp,
    LayoutGrid, Code, Database, Shield, Zap, Globe
} from 'lucide-react';
import { useMarketplaceListingsQuery } from '@azora/api-client/react-query-hooks';

export const Marketplace: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const { data: listingsData, isLoading } = useMarketplaceListingsQuery({
        category: activeCategory === 'all' ? undefined : activeCategory
    });

    const categories = [
        { id: 'all', label: 'All Apps', icon: LayoutGrid },
        { id: 'productivity', label: 'Productivity', icon: Zap },
        { id: 'developer', label: 'Developer Tools', icon: Code },
        { id: 'data', label: 'Data & Analytics', icon: Database },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'web', label: 'Web Services', icon: Globe },
    ];

    const featuredApps = [
        {
            id: 1,
            name: 'Nebula IDE',
            description: 'Next-gen cloud development environment with AI assistance.',
            rating: 4.9,
            downloads: '2.5M',
            icon: Code,
            color: 'bg-purple-500'
        },
        {
            id: 2,
            name: 'Quantum Analytics',
            description: 'Real-time data processing and visualization platform.',
            rating: 4.8,
            downloads: '1.2M',
            icon: TrendingUp,
            color: 'bg-blue-500'
        },
        {
            id: 3,
            name: 'Aether Shield',
            description: 'Enterprise-grade security and threat detection.',
            rating: 4.9,
            downloads: '850k',
            icon: Shield,
            color: 'bg-emerald-500'
        }
    ];

    const apps = listingsData?.data || [
        { name: 'Flow Chart Pro', category: 'productivity', rating: 4.7, downloads: '500k', icon: LayoutGrid, color: 'bg-amber-500' },
        { name: 'Data Miner', category: 'data', rating: 4.6, downloads: '300k', icon: Database, color: 'bg-cyan-500' },
        { name: 'Web Weaver', category: 'web', rating: 4.5, downloads: '200k', icon: Globe, color: 'bg-indigo-500' },
        { name: 'Code Snippets', category: 'developer', rating: 4.8, downloads: '150k', icon: Code, color: 'bg-pink-500' },
        { name: 'Secure Vault', category: 'security', rating: 4.9, downloads: '100k', icon: Shield, color: 'bg-red-500' },
        { name: 'Task Master', category: 'productivity', rating: 4.4, downloads: '400k', icon: Zap, color: 'bg-orange-500' },
    ];

    return (
        <div className="flex h-full bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950/50 border-r border-white/10 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <ShoppingBag className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg tracking-tight">Marketplace</h2>
                        <p className="text-xs text-white/40">App Store</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeCategory === category.id
                                ? 'bg-purple-600/20 text-purple-400 shadow-lg shadow-purple-900/20'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <category.icon size={18} />
                            <span className="font-medium text-sm">{category.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Search for apps, plugins, and tools..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-sm font-medium text-white/60 hover:text-white transition-colors">My Library</button>
                        <button className="text-sm font-medium text-white/60 hover:text-white transition-colors">Updates</button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-auto p-8">
                    {/* Featured Section */}
                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-white mb-6">Featured Apps</h2>
                        <div className="grid grid-cols-3 gap-6">
                            {featuredApps.map((app) => (
                                <div key={app.id} className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${app.color}`} />
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-xl ${app.color} bg-opacity-20 text-white`}>
                                                <app.icon size={24} />
                                            </div>
                                            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors">
                                                Install
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">{app.name}</h3>
                                        <p className="text-sm text-white/60 mb-4 line-clamp-2">{app.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-white/40">
                                            <div className="flex items-center gap-1">
                                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                                <span className="text-white/80">{app.rating}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Download size={12} />
                                                <span>{app.downloads}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Popular Apps Grid */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-6">Popular in {categories.find(c => c.id === activeCategory)?.label}</h2>
                        <div className="grid grid-cols-4 gap-6">
                            {isLoading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 h-32 animate-pulse" />
                                ))
                            ) : (
                                apps.map((app: any, i: number) => {
                                    const Icon = app.icon || LayoutGrid;
                                    return (
                                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className={`p-2.5 rounded-lg ${app.color || 'bg-blue-500'} bg-opacity-20 text-white`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-sm">{app.name}</h4>
                                                    <p className="text-xs text-white/40 capitalize">{app.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1 text-xs text-white/40">
                                                    <Star size={10} className="text-amber-400 fill-amber-400" />
                                                    <span>{app.rating}</span>
                                                </div>
                                                <span className="text-xs text-white/40">{app.downloads}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};
