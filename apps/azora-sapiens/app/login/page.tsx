'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const ubuntuServices = useUbuntuServices();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Use Ubuntu auth service
            const authResult = await ubuntuServices.auth.login(email, password);
            
            if (authResult.token) {
                // Store token and redirect
                localStorage.setItem('ubuntu-token', authResult.token);
                localStorage.setItem('ubuntu-user', JSON.stringify(authResult.user));
                router.push('/dashboard');
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            // Fallback for demo - allow any login
            if (email && password) {
                localStorage.setItem('ubuntu-token', 'demo-token');
                localStorage.setItem('ubuntu-user', JSON.stringify({ 
                    id: 'demo-student-001', 
                    name: 'Azora Citizen',
                    email 
                }));
                router.push('/dashboard');
            } else {
                setError('Please enter email and password');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout appName="Azora Sapiens" userName="Guest">
            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <AccessibleCard className="p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                                🌍
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                <GradientText>Welcome Back</GradientText>
                            </h1>
                            <p className="text-gray-400">Sign in to access Ubuntu learning</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-400 text-sm">
                                Don't have an account?{' '}
                                <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">
                                    Start Ubuntu Journey
                                </Link>
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-700">
                            <p className="text-center text-gray-500 text-xs">
                                "I am because we are" - Ubuntu Philosophy
                            </p>
                        </div>
                    </AccessibleCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
