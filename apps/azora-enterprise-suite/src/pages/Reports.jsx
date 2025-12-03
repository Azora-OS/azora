import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { PremiumNavbar } from '../components/PremiumNavbar';

export function Reports() {
    return (
        <div className="min-h-screen pb-20 bg-[#020617]">
            <PremiumNavbar title="Reports" subtitle="Data Exports" />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <GlassCard className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Generated Reports</h2>
                    <div className="space-y-4">
                        {['Q4 Financial Summary', 'User Activity Log', 'Security Audit 2024', 'System Performance Review'].map(report => (
                            <div key={report} className="flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/10">
                                <span className="text-slate-300">{report}</span>
                                <button className="text-blue-400 hover:text-blue-300 text-sm">Download PDF</button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </main>
        </div>
    );
}
