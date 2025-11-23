'use client'

import { ElaraChat } from '../../components/elara-chat'

export default function LearnPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <a href="/" className="text-3xl font-bold text-white hover:text-blue-300 transition-colors">AZORA</a>
                            <span className="ml-2 text-sm text-blue-300">Learning Hub</span>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <a href="/" className="text-white hover:text-blue-300">Home</a>
                            <a href="/dashboard" className="text-white hover:text-blue-300">Dashboard</a>
                            <a href="/forge" className="text-white hover:text-blue-300">Forge</a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Elara Chat - Main Column */}
                    <div className="lg:col-span-2">
                        <div className="glass-card rounded-xl overflow-hidden h-[calc(100vh-200px)]">
                            <ElaraChat />
                        </div>
                    </div>

                    {/* Sidebar - Quick Actions & Info */}
                    <div className="space-y-6">
                        {/* Quick Commands */}
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Quick Commands</h3>
                            <div className="space-y-2">
                                <button className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                                    📚 Help me learn [topic]
                                </button>
                                <button className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                                    💡 Explain [concept]
                                </button>
                                <button className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                                    📝 Create lesson plan
                                </button>
                                <button className="w-full text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                                    ✅ Quiz me on [topic]
                                </button>
                            </div>
                        </div>

                        {/* Learning Stats */}
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Your Progress</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                                        <span>Lessons Completed</span>
                                        <span>12/20</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                                        <span>Skills Mastered</span>
                                        <span>8</span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-400">Level 3</div>
                                </div>
                            </div>
                        </div>

                        {/* Available Services */}
                        <div className="glass-card rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">AI Services</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="text-gray-300">Elara (Education)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                                    <span className="text-gray-400">Themba (Careers)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                                    <span className="text-gray-400">Naledi (Business)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                                    <span className="text-gray-400">Kofi (Finance)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
