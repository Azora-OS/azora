import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { PremiumNavbar } from '../components/PremiumNavbar';

export function Settings() {
    return (
        <div className="min-h-screen pb-20 bg-[#020617]">
            <PremiumNavbar title="Settings" subtitle="Configuration" />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <GlassCard className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Organization Name</label>
                            <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white" defaultValue="Acme Corp" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Support Email</label>
                            <input type="email" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white" defaultValue="support@acme.com" />
                        </div>
                    </div>
                </GlassCard>
            </main>
        </div>
    );
}
