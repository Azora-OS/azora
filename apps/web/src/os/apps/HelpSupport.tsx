import React, { useState } from 'react';
import {
    HelpCircle, Book, MessageSquare, Search, ExternalLink,
    ChevronRight, FileText, Video, MessageCircle, Mail, Activity
} from 'lucide-react';
import { useServiceStatusQuery } from '@azora/api-client/react-query-hooks';

export const HelpSupport: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: serviceData, isLoading: isServiceLoading } = useServiceStatusQuery();

    const allOperational = serviceData?.data?.every((s: any) => s.status === 'running') ?? true;

    return (
        <div className="flex h-full bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950/50 border-r border-white/10 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <HelpCircle className="text-cyan-400" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg tracking-tight">Help Center</h2>
                            <p className="text-xs text-white/40">Support & Docs</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'home', icon: HelpCircle, label: 'Home' },
                            { id: 'docs', icon: Book, label: 'Documentation' },
                            { id: 'tickets', icon: MessageSquare, label: 'My Tickets' },
                            { id: 'community', icon: MessageCircle, label: 'Community' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                <item.icon size={18} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5 space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity size={14} className={allOperational ? "text-emerald-400" : "text-amber-400"} />
                            <span className="text-xs font-bold text-white">System Status</span>
                        </div>
                        <p className="text-xs text-white/60">
                            {isServiceLoading ? 'Checking status...' : (allOperational ? 'All systems operational' : 'Issues detected')}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-900/50 to-slate-900 p-4 rounded-xl border border-white/10">
                        <p className="text-xs font-medium text-cyan-300 mb-2">Need urgent help?</p>
                        <button className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-cyan-900/20">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                {/* Hero Search */}
                <div className="bg-gradient-to-b from-slate-800 to-slate-900/50 border-b border-white/5 p-12 text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">How can we help you today?</h1>
                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                        <input
                            type="text"
                            placeholder="Search for articles, guides, and troubleshooting..."
                            className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/15 transition-all shadow-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <main className="flex-1 overflow-auto p-8">
                    {/* Quick Links Grid */}
                    <div className="grid grid-cols-3 gap-6 mb-12">
                        {[
                            { title: 'Getting Started', desc: 'New to Azora OS? Start here.', icon: Book, color: 'text-blue-400' },
                            { title: 'Account & Billing', desc: 'Manage your subscription and profile.', icon: FileText, color: 'text-purple-400' },
                            { title: 'Video Tutorials', desc: 'Watch step-by-step guides.', icon: Video, color: 'text-red-400' },
                        ].map((card, i) => (
                            <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group">
                                <div className={`mb-4 ${card.color}`}>
                                    <card.icon size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{card.title}</h3>
                                <p className="text-sm text-white/60">{card.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Popular Articles */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <StarIcon size={16} className="text-amber-400" />
                                Popular Articles
                            </h3>
                            <div className="space-y-2">
                                {[
                                    'How to configure custom domains',
                                    'Understanding role-based access control',
                                    'Integrating with third-party APIs',
                                    'Troubleshooting deployment failures',
                                    'Setting up two-factor authentication',
                                ].map((article, i) => (
                                    <a key={i} href="#" className="block p-3 rounded-lg hover:bg-white/5 text-white/80 hover:text-cyan-400 transition-colors flex items-center justify-between group">
                                        <span>{article}</span>
                                        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-white mb-4">Contact Us</h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Live Chat</h4>
                                        <p className="text-xs text-white/40">Available 24/7 for enterprise plans</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Email Support</h4>
                                        <p className="text-xs text-white/40">Response within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const StarIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);
