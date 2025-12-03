import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { PremiumNavbar } from '../components/PremiumNavbar';

export function Billing() {
    return (
        <div className="min-h-screen pb-20 bg-[#020617]">
            <PremiumNavbar title="Billing" subtitle="Invoices & Plans" />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <GlassCard className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Current Plan</h2>
                    <div className="flex justify-between items-center bg-white/5 p-6 rounded-lg border border-white/10">
                        <div>
                            <h3 className="text-xl font-bold text-white">Enterprise Pro</h3>
                            <p className="text-slate-400">$499/month</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Manage Subscription
                        </button>
                    </div>
                </GlassCard>
            </main>
        </div>
    );
}
