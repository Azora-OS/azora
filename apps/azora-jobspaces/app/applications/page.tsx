'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';
import { Navbar } from '../components/Navbar';

const APPLICATIONS = [
    {
        id: '1',
        jobTitle: 'Senior Frontend Engineer',
        company: 'TechCorp',
        status: 'In Review',
        appliedDate: '2 days ago',
        location: 'Remote'
    },
    {
        id: '2',
        jobTitle: 'Product Designer',
        company: 'DesignStudio',
        status: 'Interview Scheduled',
        appliedDate: '1 week ago',
        location: 'New York, NY'
    },
    {
        id: '3',
        jobTitle: 'Backend Developer',
        company: 'DataSystems',
        status: 'Rejected',
        appliedDate: '2 weeks ago',
        location: 'London, UK'
    }
];

export default function ApplicationsPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4">My Applications</h1>
                    <p className="text-blue-200">Track the status of your job applications.</p>
                </motion.div>

                <div className="space-y-4">
                    {APPLICATIONS.map((app, index) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold text-blue-400">
                                        {app.company[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{app.jobTitle}</h3>
                                        <div className="text-blue-200">{app.company} • {app.location}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <div className={`font-bold px-3 py-1 rounded-full text-sm inline-block ${app.status === 'In Review' ? 'bg-yellow-500/20 text-yellow-300' :
                                                app.status === 'Interview Scheduled' ? 'bg-green-500/20 text-green-300' :
                                                    'bg-red-500/20 text-red-300'
                                            }`}>
                                            {app.status}
                                        </div>
                                        <div className="text-xs text-blue-300 mt-1">Applied {app.appliedDate}</div>
                                    </div>

                                    <Link href={`/jobs/${app.id}`}>
                                        <PremiumButton variant="ghost" size="sm">
                                            View Job
                                        </PremiumButton>
                                    </Link>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}

                    {APPLICATIONS.length === 0 && (
                        <GlassCard className="p-12 text-center">
                            <div className="text-6xl mb-4">📂</div>
                            <h3 className="text-xl font-bold mb-2">No applications yet</h3>
                            <p className="text-blue-200 mb-6">Start applying to jobs to see them here.</p>
                            <Link href="/">
                                <PremiumButton>Find Jobs</PremiumButton>
                            </Link>
                        </GlassCard>
                    )}
                </div>
            </div>
        </main>
    );
}
