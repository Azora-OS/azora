'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, AlertCircle } from 'lucide-react';

export default function SendTokensPage() {
    const router = useRouter();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [token, setToken] = useState('LEARN');
    const [memo, setMemo] = useState('');

    const handleSend = () => {
        // TODO: Implement send logic
        alert(`Sending ${amount} ${token} to ${recipient}`);
    };

    return (
        <AppLayout appName="Azora Mint" userName="User">
            <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" onClick={() => router.push('/wallet')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Wallet
                    </Button>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Send Tokens</GradientText>
                    </h1>
                    <p className="text-gray-400">Transfer tokens to another wallet</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <AccessibleCard className="p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Recipient Address</label>
                                <input
                                    type="text"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Token</label>
                                <select
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                                >
                                    <option value="LEARN">LEARN</option>
                                    <option value="AZR">AZR</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                                />
                                <div className="text-sm text-gray-400 mt-2">Available: 1,234.56 {token}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Memo (Optional)</label>
                                <textarea
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    placeholder="Add a note..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                                />
                            </div>

                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-gray-300">
                                        <div className="font-bold mb-1">Transaction Fee</div>
                                        <div>Network fee: 0.001 {token}</div>
                                        <div>You will receive: {amount ? (parseFloat(amount) - 0.001).toFixed(3) : '0.000'} {token}</div>
                                    </div>
                                </div>
                            </div>

                            <Button variant="primary" className="w-full" onClick={handleSend} disabled={!recipient || !amount}>
                                <Send className="h-5 w-5 mr-2" />
                                Send {amount || '0'} {token}
                            </Button>
                        </div>
                    </AccessibleCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
