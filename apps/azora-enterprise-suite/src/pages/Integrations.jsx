import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { PremiumNavbar } from '../components/PremiumNavbar';

export function Integrations() {
    return (
        <div className="min-h-screen pb-20 bg-[#020617]">
            <PremiumNavbar title="Integrations" subtitle="Connected Services" />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <GlassCard className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Available Integrations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['Slack', 'GitHub', 'Jira', 'Salesforce', 'HubSpot', 'Zoom'].map(app => (
                            <div key={app} className="bg-white/5 p-6 rounded-lg border border-white/10 flex items-center justify-between">
                                <span className="text-white font-bold">{app}</span>
                                <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition-colors">Connect</button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </main>
        </div>
    );
}
