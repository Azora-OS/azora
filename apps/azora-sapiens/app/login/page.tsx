'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { PremiumButton } from '../components/PremiumButton';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate login delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For MVP, just redirect to dashboard
        router.push('/dashboard');
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                            S
                        </div>
                        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                        <p className="text-blue-200">Sign in to access your courses</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-blue-200 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="student@azora.edu"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-200 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <PremiumButton
                            type="submit"
                            className="w-full justify-center py-3"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </PremiumButton>

                        <div className="text-center text-sm text-blue-200">
                            Don't have an account?{' '}
                            <a href="#" className="text-purple-400 hover:text-purple-300 font-medium">
                                Apply Now
                            </a>
                        </div>
                    </form>
                </GlassCard>
            </motion.div>
        </main>
    );
}
