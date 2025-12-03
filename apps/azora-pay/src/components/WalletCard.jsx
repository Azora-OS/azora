import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WalletCard({ balance = 0, currency = 'AZR' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl border border-white/10 relative overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Wallet size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-purple-200 text-sm font-medium mb-1">Total Balance</p>
                        <h2 className="text-4xl font-bold">{balance.toLocaleString()} <span className="text-xl text-purple-300">{currency}</span></h2>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                        <Wallet className="text-purple-300" />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex-1 bg-white text-purple-900 py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors">
                        <Plus size={18} /> Top Up
                    </button>
                    <button className="flex-1 bg-white/10 text-white py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
                        <ArrowUpRight size={18} /> Send
                    </button>
                    <button className="flex-1 bg-white/10 text-white py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
                        <ArrowDownLeft size={18} /> Request
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
