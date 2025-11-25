'use client';

import React from 'react';
import { AdminSidebar } from '../components/AdminSidebar';

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />

            <main className="ml-64 p-8">
                <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Users', value: '1,234', change: '+12%', color: 'bg-blue-500' },
                        { label: 'Total Courses', value: '42', change: '+3', color: 'bg-purple-500' },
                        { label: 'Active Enrollments', value: '856', change: '+8%', color: 'bg-green-500' },
                        { label: 'Total Revenue', value: '$45,678', change: '+15%', color: 'bg-orange-500' },
                    ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-lg ${stat.color}/20 flex items-center justify-center text-xl`}>
                                    {i === 0 ? '👥' : i === 1 ? '📚' : i === 2 ? '📝' : '💰'}
                                </div>
                                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-blue-200 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <h2 className="text-xl font-bold mb-4">Recent Enrollments</h2>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                            👤
                                        </div>
                                        <div>
                                            <div className="font-medium">Student {i}</div>
                                            <div className="text-xs text-blue-300">Enrolled in Python Course</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-blue-400">2 mins ago</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <h2 className="text-xl font-bold mb-4">System Health</h2>
                        <div className="space-y-4">
                            {[
                                { name: 'API Gateway', status: 'Operational', color: 'text-green-400' },
                                { name: 'Education Service', status: 'Operational', color: 'text-green-400' },
                                { name: 'Payment Service', status: 'Operational', color: 'text-green-400' },
                                { name: 'Marketplace Service', status: 'Degraded', color: 'text-yellow-400' },
                            ].map((service, i) => (
                                <div key={i} className="flex items-center justify-between py-2">
                                    <div className="font-medium">{service.name}</div>
                                    <div className={`flex items-center gap-2 ${service.color}`}>
                                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                        {service.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
