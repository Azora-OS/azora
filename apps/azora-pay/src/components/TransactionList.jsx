import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_TRANSACTIONS = [
    { id: 1, type: 'receive', title: 'Received from University', amount: 500, date: 'Today, 10:23 AM', status: 'completed' },
    { id: 2, type: 'spend', title: 'Course Enrollment', amount: -150, date: 'Yesterday, 2:15 PM', status: 'completed' },
    { id: 3, type: 'spend', title: 'Marketplace Purchase', amount: -45, date: 'Nov 28, 9:00 AM', status: 'completed' },
    { id: 4, type: 'receive', title: 'Staking Reward', amount: 12.5, date: 'Nov 27, 12:00 PM', status: 'completed' },
];

const getIcon = (type) => {
    switch (type) {
        case 'receive': return <ArrowDownLeft className="text-green-400" size={20} />;
        case 'spend': return <ArrowUpRight className="text-red-400" size={20} />;
        case 'swap': return <RefreshCw className="text-blue-400" size={20} />;
        default: return <ShoppingBag className="text-purple-400" size={20} />;
    }
};

export default function TransactionList() {
    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>

            <div className="space-y-4">
                {MOCK_TRANSACTIONS.map((tx, index) => (
                    <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5`}>
                                {getIcon(tx.type)}
                            </div>
                            <div>
                                <h4 className="text-white font-medium">{tx.title}</h4>
                                <p className="text-gray-400 text-sm">{tx.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount} AZR
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{tx.status}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
