'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PremiumButton } from './PremiumButton';

export function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="sticky top-0 z-40 bg-[#1e1b4b]/80 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <span className="text-xl font-bold text-white">Student Portal</span>
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/dashboard">
                            <PremiumButton
                                variant={isActive('/dashboard') ? 'primary' : 'ghost'}
                                size="sm"
                            >
                                Dashboard
                            </PremiumButton>
                        </Link>
                        <Link href="/courses">
                            <PremiumButton
                                variant={isActive('/courses') ? 'primary' : 'ghost'}
                                size="sm"
                            >
                                Browse Courses
                            </PremiumButton>
                        </Link>
                        <Link href="/my-courses">
                            <PremiumButton
                                variant={isActive('/my-courses') ? 'primary' : 'ghost'}
                                size="sm"
                            >
                                My Courses
                            </PremiumButton>
                        </Link>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                            👤
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
