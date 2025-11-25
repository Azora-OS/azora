'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { href: '/admin', label: 'Overview', icon: '📊' },
        { href: '/admin/users', label: 'Users', icon: '👥' },
        { href: '/admin/courses', label: 'Courses', icon: '📚' },
        { href: '/admin/enrollments', label: 'Enrollments', icon: '📝' },
        { href: '/admin/revenue', label: 'Revenue', icon: '💰' },
        { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <aside className="w-64 bg-[#0f172a] border-r border-white/10 min-h-screen fixed left-0 top-0 p-4">
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    A
                </div>
                <span className="text-xl font-bold text-white">Azora Admin</span>
            </div>

            <nav className="space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-blue-200 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span>{link.icon}</span>
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-blue-200 mb-1">Logged in as</div>
                    <div className="font-bold text-white">Admin User</div>
                </div>
            </div>
        </aside>
    );
}
