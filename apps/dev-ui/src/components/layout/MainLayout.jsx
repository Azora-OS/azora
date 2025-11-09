import React from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* 💎 PREMIUM UI SYSTEM - Glassmorphic Background Pattern */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-premium-sapphire-500/5 via-premium-emerald-500/5 to-premium-ruby-500/5" />
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(12,124,232,0.1),transparent_50%)]" />
            <Sidebar />
            <div className="ml-64">
                <Header />
                <main className="p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="animate-premium-fade-in"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}

export default MainLayout